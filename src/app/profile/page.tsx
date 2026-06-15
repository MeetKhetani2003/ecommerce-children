"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { User, MapPin, Package, Heart, LogOut, Shield, Compass, CheckCircle, Truck, ShoppingBag, Trash2, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function Profile() {
  const { data: session, update } = useSession();
  const { wishlist } = useShop();

  const [activeSection, setActiveSection] = useState<"info" | "orders" | "wishlist" | "addresses">("info");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address fields
  const [addresses, setAddresses] = useState<string[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<string>("");
  const [newAddress, setNewAddress] = useState("");

  // Return & Exchange states
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [selectedOrderForExchange, setSelectedOrderForExchange] = useState<any>(null);
  const [newExchangeAddress, setNewExchangeAddress] = useState("");
  const [exchangeItems, setExchangeItems] = useState<any[]>([]);
  const [submittingExchange, setSubmittingExchange] = useState(false);
  const [allProductsForExchange, setAllProductsForExchange] = useState<any[]>([]);
  const [exchangePaymentMethod, setExchangePaymentMethod] = useState<"online" | "cod">("online");

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchProductsForExchange = async () => {
    if (allProductsForExchange.length > 0) return;
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setAllProductsForExchange(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products for exchange:", err);
    }
  };

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForExchange) return;
    setSubmittingExchange(true);
    try {
      const res = await fetch("/api/orders/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderForExchange._id,
          newAddress: newExchangeAddress,
          newSizes: exchangeItems.map(item => ({
            productId: item.productId,
            oldSize: item.oldSize,
            newSize: item.newSize
          })),
          paymentMethod: exchangePaymentMethod
        })
      });
      const data = await res.json();
      if (!data.success) {
        alert("Failed to request exchange: " + data.message);
        setSubmittingExchange(false);
        return;
      }

      // If COD, process immediately
      if (data.isCod) {
        alert("Exchange request submitted successfully! A flat fee of ₹120 will be charged on delivery.");
        setIsExchangeModalOpen(false);
        fetchOrders();
        return;
      }

      // Online Payment Flow (Razorpay)
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        setSubmittingExchange(false);
        return;
      }

      // Check if key is placeholder
      if (data.key === "rzp_test_placeholder") {
        const choice = window.confirm(
          "Razorpay Test Mode Bypass:\n\nClick OK to simulate a SUCCESSFUL payment for the ₹120 exchange fee.\nClick Cancel to abort."
        );
        if (choice) {
          // Simulate Payment Verification
          try {
            const verifyRes = await fetch("/api/orders/exchange/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: "mock_pay_" + Math.random().toString(36).substring(2, 11),
                razorpay_order_id: data.razorpayOrderId,
                razorpay_signature: "mock_signature",
                orderId: selectedOrderForExchange._id,
                newAddress: newExchangeAddress,
                newSizes: exchangeItems.map(item => ({
                  productId: item.productId,
                  oldSize: item.oldSize,
                  newSize: item.newSize
                }))
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("Payment Success! [SIMULATED] Costume exchange request registered successfully.");
              setIsExchangeModalOpen(false);
              fetchOrders();
            } else {
              alert("Verification failed: " + verifyData.message);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Error verifying simulated payment.");
          }
        }
        setSubmittingExchange(false);
        return;
      }

      // Real Razorpay popup
      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Saheli Shrungar Costumes",
        description: "Exchange Processing Fee Payment",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/orders/exchange/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: selectedOrderForExchange._id,
                newAddress: newExchangeAddress,
                newSizes: exchangeItems.map(item => ({
                  productId: item.productId,
                  oldSize: item.oldSize,
                  newSize: item.newSize
                }))
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("Payment Success! Costume exchange request registered successfully.");
              setIsExchangeModalOpen(false);
              fetchOrders();
            } else {
              alert("Verification failed: " + verifyData.message);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Error verifying payment.");
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#8B1D8F",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("An error occurred during submission.");
    } finally {
      setSubmittingExchange(false);
    }
  };

  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (session?.user?.email) {
      fetchOrders();
      setAddresses((session.user as any).addresses || []);
      setDefaultAddress((session.user as any).defaultAddress || "");
    }
  }, [session, activeSection]);

  const saveAddressesToDb = async (newAddressesList: string[], newDefault: string) => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          addresses: newAddressesList,
          defaultAddress: newDefault,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await update();
      }
    } catch (err) {
      console.error("Failed to save addresses:", err);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) return;
    const trimmed = newAddress.trim();
    const updatedAddresses = [...addresses, trimmed];
    const updatedDefault = defaultAddress ? defaultAddress : trimmed;

    setAddresses(updatedAddresses);
    if (!defaultAddress) {
      setDefaultAddress(updatedDefault);
    }
    setNewAddress("");

    await saveAddressesToDb(updatedAddresses, updatedDefault);
  };

  const handleDeleteAddress = async (addrToDelete: string) => {
    const updatedAddresses = addresses.filter((a) => a !== addrToDelete);
    let updatedDefault = defaultAddress;
    if (defaultAddress === addrToDelete) {
      updatedDefault = updatedAddresses.length > 0 ? updatedAddresses[0] : "";
    }

    setAddresses(updatedAddresses);
    setDefaultAddress(updatedDefault);

    await saveAddressesToDb(updatedAddresses, updatedDefault);
  };

  const handleSetDefaultAddress = async (addr: string) => {
    setDefaultAddress(addr);
    await saveAddressesToDb(addresses, addr);
  };

  const fetchOrders = async () => {
    if (!session?.user?.email) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/admin/orders?email=${encodeURIComponent(session.user.email)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDevBypass = async () => {
    if (!session?.user?.email) return;
    try {
      const targetRole = isAdmin ? "user" : "admin";
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, role: targetRole }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Your role has been set to ${targetRole}. Please refresh.`);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sign in state check
  if (!session) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-16 md:py-24 flex items-center justify-center">
        <div className="w-full max-w-[450px] rounded-3xl border border-[#F0E6F2] bg-white p-8 text-center shadow-xl shadow-[#8B1D8F]/5">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-[#FCF7FD] text-[#8B1D8F]">
            <User className="h-7 w-7" />
          </div>
          <h2 className="text-[24px] font-semibold text-[#1A0F1C] tracking-tight">Welcome to Saheli</h2>
          <p className="mt-2 text-[14.5px] text-[#6B5A6F] leading-relaxed">Sign in to sync your cart, view order history, track deliveries, and manage addresses.</p>

          <button
            onClick={() => signIn("google")}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-[#EEDDF0] bg-white py-3.5 text-[15px] font-semibold text-[#3A2A3D] transition hover:bg-[#FCF7FD] hover:border-[#E1BFE6]"
          >
            {/* Google Colorful Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.64 15.01 1 12 1 7.24 1 3.2 3.74 1.25 7.74l3.83 2.97C6.01 7.27 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.86c2.16-1.99 3.4-4.92 3.4-8.54z"
              />
              <path
                fill="#FBBC05"
                d="M5.08 14.73c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1L1.25 7.56C.45 9.17 0 10.97 0 12.87c0 1.9.45 3.7 1.25 5.31l3.83-3.45z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.02.68-2.33 1.09-4.27 1.09-3.22 0-5.99-2.23-6.96-5.26l-3.83 2.97C3.2 20.26 7.24 23 12 23z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 flex flex-col gap-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-[#8B7A8F] uppercase">Local Dev Bypass</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              onClick={() => signIn("bypass-login", { email: "tester@example.com", name: "Tester User", role: "user" })}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 hover:bg-slate-200 py-3 text-[14px] font-semibold text-slate-800 transition"
            >
              Sign In as Tester
            </button>

            <button
              onClick={() => signIn("bypass-login", { email: "admin@example.com", name: "Admin User", role: "admin" })}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-purple-100 hover:bg-purple-200 py-3 text-[14px] font-semibold text-purple-800 transition"
            >
              Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">

        {/* Sidebar */}
        <div className="flex flex-col gap-2">
          <div className="mb-4 flex items-center gap-4 rounded-2xl border border-[#F0E6F2] p-5 bg-white shadow-sm">
            {session.user?.image ? (
              <img src={session.user.image} alt="" className="h-12 w-12 rounded-full border border-[#EEDDF0] object-cover" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#8B1D8F] to-[#E91E7A] text-[18px] font-bold text-white">
                {session.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "US"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15.5px] font-semibold text-[#1A0F1C]">{session.user?.name}</div>
              <div className="truncate text-[12.5px] text-[#6B5A6F]">{session.user?.email}</div>
            </div>
          </div>

          {[
            { id: "info", icon: User, label: "Personal Information" },
            { id: "orders", icon: Package, label: "My Orders", badge: orders.length > 0 ? orders.length : undefined },
            { id: "wishlist", icon: Heart, label: "Wishlist", badge: wishlist.length > 0 ? wishlist.length : undefined },
            { id: "addresses", icon: MapPin, label: "Saved Addresses" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium transition ${isActive ? "bg-[#8B1D8F] text-white" : "text-[#4A354D] hover:bg-[#FCF7FD]"}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10.5px] ${isActive ? "bg-white text-[#8B1D8F]" : "bg-[#F3E7F5] text-[#8B1D8F]"}`}>{item.badge}</span>
                )}
              </button>
            );
          })}

          {/* Admin Panel button if role is admin */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
            >
              <Shield className="h-4.5 w-4.5" />
              <span>Admin Console</span>
            </Link>
          )}

          {/* Dev Bypass Toggler */}
          <button
            onClick={handleDevBypass}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition border border-dashed border-red-200 mt-4"
          >
            <Compass className="h-4 w-4" />
            <span>Dev: Toggle Admin Role</span>
          </button>

          <button onClick={() => signOut()} className="mt-8 flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium text-red-500 transition hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>

        {/* Content Area */}
        <div className="rounded-3xl border border-[#F0E6F2] bg-white p-6 md:p-8 shadow-sm min-h-[450px]">

          {/* A. PERSONAL INFORMATION */}
          {activeSection === "info" && (
            <div>
              <h2 className="text-[20px] font-semibold text-[#1A0F1C]">Personal Information</h2>
              <p className="mt-1 text-[14px] text-[#6B5A6F]">Manage your personal details and account settings.</p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Full Name</label>
                  <input type="text" readOnly value={session.user?.name || ""} className="h-11 w-full rounded-xl border border-[#EEDDF0] bg-[#FCF7FD] px-4 text-[14px] text-[#8B7A8F] outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Account Role</label>
                  <input type="text" readOnly value={(session.user as any)?.role || "user"} className="h-11 w-full rounded-xl border border-[#EEDDF0] bg-[#FCF7FD] px-4 text-[14px] text-[#8B7A8F] outline-none capitalize" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Email Address</label>
                  <input type="email" readOnly value={session.user?.email || ""} className="h-11 w-full rounded-xl border border-[#EEDDF0] bg-[#FCF7FD] px-4 text-[14px] text-[#8B7A8F] outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* B. MY ORDERS (WITH TRACKING) */}
          {activeSection === "orders" && (
            <div>
              <h2 className="text-[20px] font-semibold text-[#1A0F1C]">My Orders</h2>
              <p className="mt-1 text-[14px] text-[#6B5A6F]">Track shipping and review order history.</p>

              {loadingOrders ? (
                <div className="mt-12 text-center text-[14px] text-[#8B7A8F]">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="mt-16 text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#FCF7FD] text-[#A38AA6]"><ShoppingBag className="h-6 w-6" /></div>
                  <div className="text-[16px] font-semibold text-[#1A0F1C]">No orders yet</div>
                  <p className="text-[13.5px] text-[#6B5A6F] mt-1">Costumes you purchase will appear here.</p>
                </div>
              ) : (
                <div className="mt-8 space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="rounded-2xl border border-[#F0E6F2] p-5 hover:border-[#E1BFE6] transition bg-[#FFFCFE]/40">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F8F0F9] pb-4">
                        <div>
                          <div className="text-[13px] text-[#8B7A8F]">Order ID: <span className="font-mono text-[#8B1D8F] font-semibold">{order._id}</span></div>
                          <div className="text-[12px] text-[#8B7A8F] mt-0.5">Placed: {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                            {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${order.shippingStatus === "Delivered" ? "bg-blue-50 text-blue-700 border-blue-200" : order.shippingStatus === "Cancelled" ? "bg-red-50 text-red-700 border-red-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                            {order.shippingStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <ul className="py-4 space-y-3">
                        {order.items.map((item: any, idx: number) => (
                          <li key={idx} className="flex items-center gap-4 text-[13.5px]">
                            <div className="h-10 w-8 rounded bg-gray-50 border border-gray-100 overflow-hidden shrink-0"><img src={item.image} className="h-full w-full object-cover" /></div>
                            <span className="font-medium text-[#1A0F1C] flex-1 truncate">{item.title}</span>
                            <span className="text-[#8B7A8F]">{item.quantity}x</span>
                            <span className="font-semibold text-[#1A0F1C]">₹{item.price * item.quantity}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Stepper Tracking UI */}
                      {order.shippingStatus !== "Cancelled" && (
                        <div className="border-t border-[#F8F0F9] pt-4 mt-2">
                          <div className="text-[12.5px] font-semibold text-[#4A354D] mb-4 flex items-center gap-1.5"><Truck className="h-4 w-4" /> Live Tracking Status</div>
                          <div className="relative flex items-center justify-between">

                            {/* Tracking line */}
                            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-[#F0E6F2]" />
                            <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-[#8B1D8F] transition-all" style={{
                              width: (order.shippingStatus === "Processing" || order.shippingStatus === "Exchange Processing") ? "15%" : order.shippingStatus === "Shipped" ? "50%" : "100%"
                            }} />

                            {[
                              { label: "Processing", icon: CheckCircle, reached: true },
                              { label: "Shipped", icon: Truck, reached: order.shippingStatus === "Shipped" || order.shippingStatus === "Delivered" },
                              { label: "Delivered", icon: CheckCircle, reached: order.shippingStatus === "Delivered" },
                            ].map((step, sIdx) => {
                              const StepIcon = step.icon;
                              return (
                                <div key={sIdx} className="relative z-10 flex flex-col items-center">
                                  <div className={`grid h-8 w-8 place-items-center rounded-full border-2 ${step.reached ? "bg-[#8B1D8F] border-[#8B1D8F] text-white" : "bg-white border-[#EEDDF0] text-[#A38AA6]"}`}>
                                    <StepIcon className="h-4 w-4" />
                                  </div>
                                  <span className={`text-[11px] font-semibold mt-1 bg-white px-1 ${step.reached ? "text-[#8B1D8F]" : "text-[#8B7A8F]"}`}>{step.label}</span>
                                </div>
                              );
                            })}
                          </div>

                          {order.trackingNumber && (
                            <div className="mt-5 text-[12px] text-gray-500 bg-[#FCF7FD] p-2.5 rounded-xl border border-[#F0E6F2]">
                              <strong>Awb tracking number:</strong> <span className="font-mono text-[#8B1D8F]">{order.trackingNumber}</span> (Mumbai/Delhi Express Speed Post)
                            </div>
                          )}
                        </div>
                      )}

                      <div className="border-t border-[#F8F0F9] pt-4 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13.5px] font-bold text-[#1A0F1C]">
                        <div>
                          <span>Grand Total:</span>
                          <span className="ml-1.5 text-[15px] font-extrabold text-[#8B1D8F]">₹{order.total}</span>
                          {order.exchangeRequested && (
                            <span className="ml-2 text-[11px] font-normal text-gray-500">
                              (Includes ₹{order.exchangeFee} Exchange Delivery Fee)
                            </span>
                          )}
                        </div>

                        {/* Exchange button */}
                        {((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 7) && order.shippingStatus !== "Cancelled" && !order.exchangeRequested && (
                          <button
                            onClick={() => {
                              setSelectedOrderForExchange(order);
                              setNewExchangeAddress(order.shippingDetails.address);
                              const initialExchangeSizes = order.items.map((item: any) => ({
                                productId: item.productId, title: item.title,
                                oldSize: item.size, newSize: item.size,
                                quantity: item.quantity, image: item.image,
                              }));
                              setExchangeItems(initialExchangeSizes);
                              fetchProductsForExchange();
                              setIsExchangeModalOpen(true);
                            }}
                            className="rounded-full border border-[#8B1D8F] bg-white px-4 py-1.5 text-[12.5px] font-semibold text-[#8B1D8F] hover:bg-[#8B1D8F] hover:text-white transition-all active:scale-[0.97] cursor-pointer"
                          >
                            Exchange Size / Address (7 Days Return)
                          </button>
                        )}
                        {order.exchangeRequested && (
                          <span className="rounded-full bg-orange-50 border border-orange-200 px-3.5 py-1 text-[11.5px] font-bold text-orange-700">
                            Exchange Processing
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* C. WISHLIST */}
          {activeSection === "wishlist" && (
            <div>
              <h2 className="text-[20px] font-semibold text-[#1A0F1C]">My Wishlist</h2>
              <p className="mt-1 text-[14px] text-[#6B5A6F]">Items you've bookmarked for later.</p>

              <div className="mt-8">
                {wishlist.length === 0 ? (
                  <p className="text-[14px] text-center text-[#8B7A8F] py-8">Your wishlist is empty.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {wishlist.map((id) => (
                      <Link href={`/products`} key={id} className="block rounded-2xl border border-[#F0E6F2] p-3 text-center hover:shadow-md transition">
                        <div className="h-32 rounded-lg bg-gray-50 overflow-hidden mb-2">
                          <div className="grid h-full place-items-center text-[12px] text-[#8B7A8F]">Costume ID: {id}</div>
                        </div>
                        <span className="text-[13px] font-medium text-[#1A0F1C] hover:text-[#8B1D8F]">View Costumes Catalog</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* D. SAVED ADDRESSES */}
          {activeSection === "addresses" && (
            <div>
              <h2 className="text-[20px] font-semibold text-[#1A0F1C]">Saved Addresses</h2>
              <p className="mt-1 text-[14px] text-[#6B5A6F]">Manage delivery locations for speed checkout.</p>

              <div className="mt-6 space-y-3">
                {addresses.length === 0 ? (
                  <p className="text-[13.5px] text-[#8B7A8F]">No saved addresses. Add one below.</p>
                ) : (
                  addresses.map((addr, idx) => (
                    <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4.5 text-[13.5px] transition-all bg-[#FFFCFE]/45 ${addr === defaultAddress ? "border-[#8B1D8F] shadow-sm shadow-[#8B1D8F]/5" : "border-[#F0E6F2] hover:border-[#E1BFE6]"}`}>
                      <div className="flex items-start gap-3 min-w-0">
                        <MapPin className={`h-5 w-5 shrink-0 mt-0.5 ${addr === defaultAddress ? "text-[#8B1D8F]" : "text-[#A38AA6]"}`} />
                        <div className="min-w-0">
                          <p className="text-[#1A0F1C] font-medium leading-relaxed break-words">{addr}</p>
                          {addr === defaultAddress && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#F3E7F5] px-2.5 py-0.5 text-[10px] font-bold text-[#8B1D8F] border border-[#E9D5ED]">
                              ★ Default Address
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:self-center self-end shrink-0">
                        {addr !== defaultAddress && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr)}
                            className="rounded-full border border-[#EEDDF0] px-3.5 py-1.5 text-[12px] font-semibold text-[#6B5A6F] hover:bg-[#FCF7FD] hover:text-[#8B1D8F] hover:border-[#E1BFE6] transition active:scale-[0.97] cursor-pointer outline-none"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr)}
                          className="grid h-8 w-8 place-items-center rounded-full text-[#A38AA6] hover:bg-red-50 hover:text-red-500 border border-[#F0E6F2] hover:border-red-200 transition active:scale-[0.95] cursor-pointer outline-none"
                          title="Delete Address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <div className="mt-8 border-t border-[#F0E6F2] pt-6">
                  <h3 className="text-[14.5px] font-semibold text-[#1A0F1C] mb-3">Add New Address</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Enter complete shipping address"
                      className="h-11 flex-1 rounded-xl border border-[#EEDDF0] px-4 text-[13.5px] outline-none focus:border-[#E1BFE6]"
                    />
                    <button
                      onClick={handleAddAddress}
                      className="rounded-xl bg-[#1A0F1C] px-5 text-[13.5px] font-medium text-white hover:bg-black transition active:scale-[0.98] cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Exchange / Return Modal */}
      {isExchangeModalOpen && selectedOrderForExchange && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[500px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6F2] p-5">
              <h3 className="text-[16px] font-semibold text-[#1A0F1C] flex items-center gap-2">
                <Package className="h-4.5 w-4.5 text-[#8B1D8F]" /> Exchange Costume / Address
              </h3>
              <button
                onClick={() => setIsExchangeModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExchangeSubmit} className="p-5 space-y-4">
              <div className="text-[12.5px] text-[#6B5A6F]">
                You can change the sizes of your items or edit the delivery address.
                A flat redelivery and processing fee of <span className="font-bold text-[#8B1D8F]">₹120</span> applies to all exchanges.
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <label className="block text-[13px] font-semibold text-[#4A354D]">Exchange Sizes</label>
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {exchangeItems.map((item, idx) => {
                    const product = allProductsForExchange.find(p => p.id === item.productId);
                    const sizeOptions = product?.sizes || [];
                    return (
                      <div key={idx} className="flex gap-3 items-center border border-[#F0E6F2] p-2.5 rounded-xl bg-[#FCF7FD]/30">
                        {item.image && <img src={item.image} className="h-12 w-10 rounded object-cover border border-gray-100 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-medium text-[#1A0F1C] truncate">{item.title}</h4>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[11px] text-[#8B7A8F]">Size:</span>
                            <select
                              value={item.newSize}
                              onChange={(e) => {
                                const updated = exchangeItems.map((x, i) => i === idx ? { ...x, newSize: e.target.value } : x);
                                setExchangeItems(updated);
                              }}
                              className="h-7 rounded-lg border border-[#EEDDF0] bg-white px-2 text-[12px] outline-none font-semibold text-[#8B1D8F]"
                            >
                              <option value={item.oldSize}>{item.oldSize} (Current)</option>
                              {sizeOptions.filter((s: any) => s.size !== item.oldSize).map((s: any) => (
                                <option key={s.size} value={s.size} disabled={s.stock === 0}>
                                  {s.size} {s.stock === 0 ? "(Out of stock)" : `(${s.stock} available)`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Address Section */}
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-[#4A354D]">New Delivery Address</label>
                <textarea
                  required
                  rows={3}
                  value={newExchangeAddress}
                  onChange={(e) => setNewExchangeAddress(e.target.value)}
                  className="w-full rounded-xl border border-[#EEDDF0] p-3 text-[13px] focus:outline-[#8B1D8F] bg-white text-[#1A0F1C]"
                  placeholder="Enter the new shipping address for this exchange..."
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-[#4A354D]">Payment Method for Exchange Fee</label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setExchangePaymentMethod("online")}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl w-full border text-center transition-all ${exchangePaymentMethod === "online"
                      ? "border-[#8B1D8F] bg-[#FCF7FD] text-[#8B1D8F] shadow-sm shadow-[#8B1D8F]/5"
                      : "border-[#F0E6F2] hover:border-[#E1BFE6] bg-white text-[#4A354D]"
                      }`}
                  >
                    <span className="text-[13px] font-bold">Pay Online</span>
                    <span className="text-[10.5px] text-gray-500 mt-0.5">Razorpay / UPI / Cards</span>
                  </button>

                  {/* <button
                        type="button"
                        onClick={() => setExchangePaymentMethod("cod")}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                          exchangePaymentMethod === "cod"
                            ? "border-[#8B1D8F] bg-[#FCF7FD] text-[#8B1D8F] shadow-sm shadow-[#8B1D8F]/5"
                            : "border-[#F0E6F2] hover:border-[#E1BFE6] bg-white text-[#4A354D]"
                        }`}
                      >
                        <span className="text-[13px] font-bold">Cash on Delivery</span>
                        <span className="text-[10.5px] text-gray-500 mt-0.5">Pay ₹120 on delivery</span>
                      </button> */}
                </div>
              </div>

              {/* Fees Summary */}
              <div className="rounded-xl bg-[#FCF7FD] p-3 border border-[#F0E6F2] text-[13px] space-y-1">
                <div className="flex justify-between text-[#6B5A6F]">
                  <span>Original Order Total:</span>
                  <span>₹{selectedOrderForExchange.total}</span>
                </div>
                <div className="flex justify-between text-[#6B5A6F]">
                  <span>Exchange Delivery Charge:</span>
                  <span>₹120</span>
                </div>
                <div className="flex justify-between font-bold text-[#1A0F1C] border-t border-[#EEDDF0] pt-1.5">
                  <span>New Grand Total:</span>
                  <span>₹{selectedOrderForExchange.total + 120}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingExchange}
                  className="flex-1 rounded-full bg-[#8B1D8F] py-3 text-[14px] font-bold text-white transition hover:bg-[#7A187C] disabled:opacity-50"
                >
                  {submittingExchange ? "Submitting Request..." : "Confirm Exchange"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="rounded-full border border-gray-200 px-5 text-[14px] text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
