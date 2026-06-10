"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useShop } from "@/context/ShopContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, AlertCircle } from "lucide-react";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useShop();
  const { data: session, update } = useSession();
  const router = useRouter();

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");

  // Shipping form states
  const [shippingName, setShippingName] = useState(session?.user?.name || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Saved address dropdown/saving states
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<string>("");
  const [newAddressText, setNewAddressText] = useState("");
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [newAddressAsDefault, setNewAddressAsDefault] = useState(false);

  useEffect(() => {
    const savedAddresses = (session?.user as any)?.addresses || [];
    const defaultAddress = (session?.user as any)?.defaultAddress || "";

    if (session) {
      if (session.user?.name && !shippingName) {
        setShippingName(session.user.name);
      }
      if (savedAddresses.length > 0) {
        let initialIndex = 0;
        if (defaultAddress) {
          const idx = savedAddresses.indexOf(defaultAddress);
          if (idx !== -1) {
            initialIndex = idx;
          }
        }
        setSelectedAddressIndex(initialIndex.toString());
        setShippingAddress(savedAddresses[initialIndex]);
      } else {
        setSelectedAddressIndex("new");
        setShippingAddress("");
      }
    } else {
      setSelectedAddressIndex("new");
      setShippingAddress("");
    }
  }, [session]);

  const handleAddressSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAddressIndex(val);
    const savedAddresses = (session?.user as any)?.addresses || [];

    if (val === "new") {
      setShippingAddress(newAddressText);
    } else {
      const idx = parseInt(val, 10);
      if (!isNaN(idx) && savedAddresses[idx]) {
        setShippingAddress(savedAddresses[idx]);
      }
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  // Load Razorpay Script Helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(couponCode.toUpperCase());
        setDiscountPercent(data.discountPercent);
        setCouponCode("");
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch (err) {
      setCouponError("Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
  };

  const handlePlaceOrder = async () => {
    setCheckoutError("");

    if (!session) {
      setCheckoutError("Please sign in with Google in the Profile page to continue.");
      return;
    }

    if (!shippingName.trim() || !shippingAddress.trim() || !shippingPhone.trim()) {
      setCheckoutError("All shipping details are required to deliver your costumes.");
      return;
    }

    setProcessing(true);

    try {
      if (session?.user?.email && selectedAddressIndex === "new" && saveNewAddress && newAddressText.trim()) {
        try {
          const trimmedNewAddr = newAddressText.trim();
          const currentAddresses = (session.user as any).addresses || [];
          const currentDefault = (session.user as any).defaultAddress || "";

          const updatedAddresses = [...currentAddresses, trimmedNewAddr];
          const updatedDefault = newAddressAsDefault || !currentDefault ? trimmedNewAddr : currentDefault;

          const saveRes = await fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              addresses: updatedAddresses,
              defaultAddress: updatedDefault,
            }),
          });
          const saveData = await saveRes.json();
          if (saveData.success) {
            await update();
            // Select newly added address index
            setSelectedAddressIndex((updatedAddresses.length - 1).toString());
          }
        } catch (saveErr) {
          console.error("Failed to save address during checkout:", saveErr);
        }
      }
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your internet connection.");
      }

      // 2. Call backend to create Order & reserve stock
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
          })),
          shippingDetails: {
            name: shippingName,
            address: shippingAddress,
            phone: shippingPhone,
          },
          email: session.user?.email,
          userId: (session.user as any)?.id,
          couponCode: appliedCoupon,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Order creation failed.");
      }

      // If Razorpay key is mock/placeholder, simulate checkout in front-end
      if (orderData.key === "rzp_test_placeholder") {
        const choice = window.confirm(
          "Razorpay Test Mode Bypass:\n\nClick OK to simulate a SUCCESSFUL payment.\nClick Cancel to simulate CANCELLED checkout (restores inventory stock)."
        );
        if (choice) {
          // Simulate Payment Verification
          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: "mock_pay_" + Math.random().toString(36).substring(2, 11),
                razorpay_order_id: orderData.razorpayOrderId,
                razorpay_signature: "mock_signature",
                orderId: orderData.orderId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              alert("Payment Success! [SIMULATED] Costume order placed successfully. Check your email for invoice bill.");
              router.push(`/success?orderId=${orderData.orderId}`);
            } else {
              alert("Verification failed: " + verifyData.message);
              setProcessing(false);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Error verifying simulated payment.");
            setProcessing(false);
          }
        } else {
          // Simulate Payment Dismissal / Cancel
          try {
            await fetch("/api/checkout/cancel-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: orderData.orderId }),
            });
            alert("Checkout cancelled [SIMULATED]. Costume stocks returned back to shop inventory.");
          } catch (cancelErr) {
            console.error(cancelErr);
          }
          setProcessing(false);
        }
        return;
      }

      // 3. Open Razorpay Checkout overlay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "Saheli Shrungar Costumes",
        description: "Fancy Dress Kids Costumes Checkout",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          // Verification
          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.orderId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              alert("Payment Success! Costume order placed successfully. Check your email for invoice bill.");
              router.push(`/success?orderId=${orderData.orderId}`);
            } else {
              alert("Verification failed: " + verifyData.message);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Error verifying payment.");
          }
        },
        modal: {
          ondismiss: async function () {
            // Restore inventory stock on checkout cancel
            try {
              await fetch("/api/checkout/cancel-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: orderData.orderId }),
              });
              alert("Checkout cancelled. Costume stocks returned back to shop inventory.");
            } catch (cancelErr) {
              console.error(cancelErr);
            }
            setProcessing(false);
          },
        },
        prefill: {
          name: shippingName,
          email: session.user?.email,
          contact: shippingPhone,
        },
        theme: {
          color: "#8B1D8F",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || "An error occurred during checkout processing.");
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-20 text-center md:py-32">
        <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-[#FCF7FD] text-[#8B1D8F]">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-[24px] font-semibold text-[#1A0F1C]">Your cart is empty</h2>
        <p className="mt-2 text-[15px] text-[#6B5A6F]">Looks like you haven't added any costumes yet.</p>
        <Link href="/" className="mt-8 rounded-full bg-[#8B1D8F] px-8 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#7A187C]">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <h1 className="mb-8 text-[28px] font-semibold tracking-tight text-[#1A0F1C]">Shopping Cart</h1>
      
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        
        {/* Left Side: Items & Checkout Form */}
        <div className="space-y-8">
          
          {/* Items List */}
          <div className="space-y-4">
            <h2 className="text-[18px] font-semibold text-[#1A0F1C]">Costume List</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-[#F0E6F2] bg-white p-4 transition-all hover:shadow-sm">
                <Link href={`/products`} className="block h-[100px] w-[80px] shrink-0 overflow-hidden rounded-xl bg-[#FCF7FD]">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div className="flex justify-between gap-2">
                    <div>
                      <div className="text-[14.5px] font-semibold text-[#1A0F1C]">{item.title}</div>
                      <div className="mt-0.5 text-[12.5px] text-[#6B5A6F]">Category: {item.category}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="grid h-8 w-8 place-items-center rounded-full text-[#A38AA6] transition hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-full border border-[#F0E6F2] bg-[#FCF7FD] px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#4A354D] shadow-sm transition hover:text-[#8B1D8F]"><Minus className="h-3 w-3" /></button>
                      <span className="w-4 text-center text-[13px] font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#4A354D] shadow-sm transition hover:text-[#8B1D8F]"><Plus className="h-3 w-3" /></button>
                    </div>
                    <div className="text-[15.5px] font-semibold text-[#1A0F1C]">₹{item.price * item.quantity}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Details Form */}
          <div className="rounded-2xl border border-[#F0E6F2] bg-white p-6">
            <h2 className="text-[18px] font-semibold text-[#1A0F1C] mb-4">Delivery & Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-[#4A354D]">Recipient Full Name</label>
                <input
                  type="text"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-[13.5px] outline-none focus:border-[#E1BFE6]"
                />
              </div>
              {session && ((session.user as any).addresses || []).length > 0 && (
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Select Saved Shipping Address</label>
                  <select
                    value={selectedAddressIndex}
                    onChange={handleAddressSelectChange}
                    className="h-11 w-full rounded-xl border border-[#EEDDF0] bg-white px-4 text-[13.5px] text-[#2E1F31] outline-none focus:border-[#E1BFE6] cursor-pointer"
                  >
                    {((session.user as any).addresses || []).map((addr: string, idx: number) => {
                      const isDefault = addr === (session.user as any).defaultAddress;
                      return (
                        <option key={idx} value={idx.toString()}>
                          {isDefault ? `★ [Default] ${addr}` : addr}
                        </option>
                      );
                    })}
                    <option value="new">+ Deliver to a new address</option>
                  </select>
                </div>
              )}

              {(!session || selectedAddressIndex === "new" || ((session.user as any).addresses || []).length === 0) && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[13px] font-medium text-[#4A354D]">Shipping Address</label>
                    <input
                      type="text"
                      value={newAddressText}
                      onChange={(e) => {
                        setNewAddressText(e.target.value);
                        setShippingAddress(e.target.value);
                      }}
                      placeholder="Street Address, City, Pincode"
                      className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-[13.5px] outline-none focus:border-[#E1BFE6]"
                    />
                  </div>
                  {session && (
                    <div className="space-y-2 pt-1 pl-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="saveAddressCheckbox"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                          className="h-4 w-4 rounded border-[#EEDDF0] text-[#8B1D8F] focus:ring-[#8B1D8F]"
                        />
                        <label htmlFor="saveAddressCheckbox" className="text-[12.5px] text-[#6B5A6F] cursor-pointer select-none">
                          Save this address to my profile
                        </label>
                      </div>
                      {saveNewAddress && (
                        <div className="flex items-center gap-2 pl-6">
                          <input
                            type="checkbox"
                            id="setDefaultCheckbox"
                            checked={newAddressAsDefault}
                            onChange={(e) => setNewAddressAsDefault(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-[#EEDDF0] text-[#8B1D8F] focus:ring-[#8B1D8F]"
                          />
                          <label htmlFor="setDefaultCheckbox" className="text-[12px] text-[#8B7A8F] cursor-pointer select-none">
                            Make this my default shipping address
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="mb-1 block text-[13px] font-medium text-[#4A354D]">Contact Phone Number</label>
                <input
                  type="tel"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-[13.5px] outline-none focus:border-[#E1BFE6]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Order Summary & Checkout */}
        <div className="space-y-6">
          
          {/* Coupon Discount */}
          <div className="rounded-3xl border border-[#F0E6F2] bg-[#FCF7FD]/60 p-6">
            <h3 className="text-[15px] font-semibold text-[#1A0F1C] mb-3 flex items-center gap-1.5"><Tag className="h-4.5 w-4.5 text-[#8B1D8F]" /> Promo Coupon</h3>
            
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 p-3 text-[13px] text-green-700">
                <div className="flex items-center gap-2">
                  <Check className="h-4.5 w-4.5" />
                  <span>Coupon <strong>{appliedCoupon}</strong> Applied ({discountPercent}% Off)</span>
                </div>
                <button onClick={handleRemoveCoupon} className="font-semibold text-red-500 hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="WELCOM10, SAHELI25"
                  className="h-10 flex-1 rounded-xl border border-[#EEDDF0] bg-white px-3 text-[13px] outline-none focus:border-[#E1BFE6]"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="rounded-xl bg-[#1A0F1C] px-4 text-[13px] font-semibold text-white hover:bg-black"
                >
                  Apply
                </button>
              </div>
            )}
            
            {couponError && (
              <div className="mt-2 text-[12px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {couponError}</div>
            )}
            <div className="mt-2 text-[11px] text-[#8B7A8F]">Try default test coupon: <span className="font-mono bg-white px-1 py-0.5 rounded border border-[#EEDDF0] font-semibold text-[#8B1D8F]">SAHELI25</span> for 25% discount.</div>
          </div>

          {/* Order Summary */}
          <div className="rounded-3xl border border-[#F0E6F2] bg-[#FCF7FD] p-6">
            <h2 className="text-[18px] font-semibold text-[#1A0F1C]">Order Summary</h2>
            <div className="mt-6 space-y-4 text-[14px] text-[#4A354D]">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-semibold text-[#1A0F1C]">₹{subtotal}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-[#0F8A4B]">Free</span>
              </div>
              <div className="flex justify-between border-t border-[#F0E6F2] pt-4 text-[18px] font-semibold text-[#1A0F1C]">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            {checkoutError && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-[12.5px] text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#8B1D8F] py-4 text-[15px] font-semibold text-white transition hover:bg-[#7A187C] disabled:opacity-50"
            >
              {processing ? "Initiating Secure Payment..." : "Place Order & Pay"}
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <div className="mt-3 text-center text-[11px] text-[#8B7A8F]">Secure checkout powered by Razorpay.</div>
          </div>

        </div>

      </div>
    </div>
  );
}
