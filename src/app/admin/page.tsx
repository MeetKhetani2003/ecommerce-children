"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Package, ShoppingBag, Users, HelpCircle, Plus, Edit, Trash2, 
  X, RefreshCw, LayoutDashboard, DollarSign, Heart, ShoppingCart
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "users" | "inquiries">("overview");

  // State lists
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const isAdmin = (session?.user as any)?.role === "admin";

  const searchParams = useSearchParams();

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "products", "orders", "users", "inquiries"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [session, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const [prodRes, orderRes, userRes, inqRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/admin/orders"),
          fetch("/api/admin/users"),
          fetch("/api/inquiries")
        ]);
        const [prodData, orderData, userData, inqData] = await Promise.all([
          prodRes.json(),
          orderRes.json(),
          userRes.json(),
          inqRes.json()
        ]);
        if (prodData.success) setProducts(prodData.products);
        if (orderData.success) setOrders(orderData.orders);
        if (userData.success) setUsers(userData.users);
        if (inqData.success) setInquiries(inqData.inquiries);
      } else if (activeTab === "products") {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } else if (activeTab === "orders") {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } else if (activeTab === "users") {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } else if (activeTab === "inquiries") {
        const res = await fetch("/api/inquiries");
        const data = await res.json();
        if (data.success) setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
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
        alert(`Your role has been set to ${targetRole}. Please refresh to reload dashboard.`);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Product CRUD

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully!");
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Order Status Updates
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, shippingStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Order status updated to ${status}`);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOrderPaymentStatusUpdate = async (orderId: string, paymentStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Payment status updated to ${paymentStatus}`);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Toggle user admin role
  const handleToggleUserRole = async (email: string, currentRole: string) => {
    const targetRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: targetRole }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`User role updated to ${targetRole}`);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-[500px] px-4 py-20 text-center">
        <h2 className="text-[22px] font-semibold text-[#1A0F1C]">Access Denied</h2>
        <p className="mt-2 text-[14px] text-[#6B5A6F]">Please sign in from the Profile page first to access the administrator console.</p>
        <Link href="/profile" className="mt-6 inline-block rounded-full bg-[#8B1D8F] px-6 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#7A187C]">
          Go to Profile
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[500px] px-4 py-20 text-center">
        <h2 className="text-[22px] font-semibold text-red-600">Admin Privileges Required</h2>
        <p className="mt-2 text-[14px] text-[#6B5A6F]">Your account ({session.user?.email}) does not have admin permissions.</p>
        <div className="mt-8 rounded-2xl border border-dashed border-[#EEDDF0] bg-[#FCF7FD] p-5">
          <p className="text-[12.5px] text-[#8B7A8F]">Testing local changes? Click the developer shortcut below to grant admin privileges to your account.</p>
          <button onClick={handleDevBypass} className="mt-4 rounded-full bg-[#1A0F1C] px-5 py-2 text-[13px] font-medium text-white transition hover:bg-black">
            Grant Admin Role
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1A0F1C]">Admin Console</h1>
          <p className="text-[14px] text-[#6B5A6F]">Manage products stock, review order histories, users and customer inquiries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDevBypass} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[12.5px] font-medium text-red-700 transition hover:bg-red-100">
            Revoke Admin Role (Dev)
          </button>
          <button onClick={fetchData} className="grid h-10 w-10 place-items-center rounded-full border border-[#EEDDF0] bg-white text-[#6B5A6F] transition hover:bg-[#FCF7FD]">
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        
        {/* Navigation Sidebar */}
        <aside className="flex flex-col gap-1">
          {[
            { id: "overview", label: "Overview Dashboard", icon: LayoutDashboard },
            { id: "products", label: "Products CRUD", icon: Package },
            { id: "orders", label: "Orders Tracking", icon: ShoppingBag },
            { id: "users", label: "User Accounts", icon: Users },
            { id: "inquiries", label: "Support Inquiries", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium transition ${isTabActive ? "bg-[#8B1D8F] text-white" : "text-[#4A354D] hover:bg-[#FCF7FD]"}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Section */}
        <div className="rounded-3xl border border-[#F0E6F2] bg-white p-6 shadow-sm min-h-[500px]">
          
          {loading ? (
            <div className="flex h-[400px] items-center justify-center text-[14px] text-[#8B7A8F]">Loading admin information...</div>
          ) : (
            <>
              {/* 0. OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div>
                  <h2 className="mb-6 text-[18px] font-semibold text-[#1A0F1C]">Business Overview Dashboard</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {/* Profit Card */}
                    <div className="rounded-2xl border border-green-100 bg-green-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-green-500 p-3 text-white">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-green-800">Total Profit (Paid)</div>
                        <div className="text-[22px] font-bold text-[#1A0F1C] mt-0.5">₹{orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0)}</div>
                      </div>
                    </div>

                    {/* Orders Card */}
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-[#8B1D8F] p-3 text-white">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-purple-800">Total Orders</div>
                        <div className="text-[22px] font-bold text-[#1A0F1C] mt-0.5">{orders.length}</div>
                      </div>
                    </div>

                    {/* Products Card */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-blue-500 p-3 text-white">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-blue-800">Costumes Count</div>
                        <div className="text-[22px] font-bold text-[#1A0F1C] mt-0.5">{products.length}</div>
                      </div>
                    </div>

                    {/* Support Inquiries Card */}
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-orange-500 p-3 text-white">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-orange-800">Inquiries</div>
                        <div className="text-[22px] font-bold text-[#1A0F1C] mt-0.5">{inquiries.length}</div>
                      </div>
                    </div>

                    {/* Wishlist Card */}
                    <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-red-500 p-3 text-white">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-red-800">Wishlist Items</div>
                        <div className="text-[22px] font-bold text-[#1A0F1C] mt-0.5">{users.reduce((sum, u) => sum + (u.wishlist?.length || 0), 0)}</div>
                      </div>
                    </div>

                    {/* Cart/Bag Card */}
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-indigo-500 p-3 text-white">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-indigo-800">Items in Bags</div>
                        <div className="text-[22px] font-bold text-[#1A0F1C] mt-0.5">{users.reduce((sum, u) => sum + (u.cart?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0), 0)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Orders */}
                    <div className="rounded-2xl border border-[#F0E6F2] p-5">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F8F0F9]">
                        <h3 className="text-[15px] font-bold text-[#1A0F1C]">Recent Orders</h3>
                        <button onClick={() => setActiveTab("orders")} className="text-[12px] font-semibold text-[#8B1D8F] hover:underline">View All</button>
                      </div>
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order._id} className="flex items-center justify-between text-[13px] border-b border-[#FDFBFE] pb-2 last:border-0 last:pb-0">
                            <div>
                              <div className="font-semibold text-[#1A0F1C]">{order.shippingDetails.name}</div>
                              <div className="text-[11px] text-[#8B7A8F]">{new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod === "cod" ? "COD" : "Online"}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#1A0F1C]">₹{order.total}</div>
                              <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                        {orders.length === 0 && <p className="text-[13px] text-gray-400 italic text-center py-4">No recent orders.</p>}
                      </div>
                    </div>

                    {/* Recent Support Inquiries */}
                    <div className="rounded-2xl border border-[#F0E6F2] p-5">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F8F0F9]">
                        <h3 className="text-[15px] font-bold text-[#1A0F1C]">Recent Inquiries</h3>
                        <button onClick={() => setActiveTab("inquiries")} className="text-[12px] font-semibold text-[#8B1D8F] hover:underline">View All</button>
                      </div>
                      <div className="space-y-3">
                        {inquiries.slice(0, 5).map((inq) => (
                          <div key={inq._id} className="text-[13px] border-b border-[#FDFBFE] pb-2 last:border-0 last:pb-0">
                            <div className="flex justify-between font-semibold">
                              <span className="text-[#1A0F1C]">{inq.name}</span>
                              <span className="text-[11px] font-normal text-[#8B7A8F]">{new Date(inq.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[12px] text-[#6B5A6F] mt-1 truncate">"{inq.message}"</p>
                          </div>
                        ))}
                        {inquiries.length === 0 && <p className="text-[13px] text-gray-400 italic text-center py-4">No recent support messages.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. PRODUCTS TAB */}
              {activeTab === "products" && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-[#1A0F1C]">Saheli Costumes Inventory</h2>
                    <Link href="/admin/products/create" className="flex items-center gap-1.5 rounded-full bg-[#8B1D8F] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7A187C]">
                      <Plus className="h-4 w-4" /> Add Costume
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[14px]">
                      <thead>
                        <tr className="border-b border-[#F0E6F2] text-left text-[#8B7A8F] font-medium">
                          <th className="pb-3 pr-4">Image</th>
                          <th className="pb-3 pr-4">Title</th>
                          <th className="pb-3 pr-4">Category</th>
                          <th className="pb-3 pr-4 text-right">Price</th>
                          <th className="pb-3 pr-4 text-right">Stock</th>
                          <th className="pb-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-b border-[#F8F0F9] last:border-0 hover:bg-[#FCF7FD]/30">
                            <td className="py-3.5 pr-4">
                              <img src={p.image} className="h-12 w-10 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                            </td>
                            <td className="py-3.5 pr-4 font-medium text-[#1A0F1C]">{p.title}</td>
                            <td className="py-3.5 pr-4 text-[#6B5A6F]">{p.category}</td>
                            <td className="py-3.5 pr-4 text-right font-semibold text-[#1A0F1C]">₹{p.price}</td>
                            <td className={`py-3.5 pr-4 text-right font-medium ${p.stock < 10 ? "text-red-500 font-bold" : "text-[#0F8A4B]"}`}>
                              {p.stock}
                            </td>
                            <td className="py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <Link href={`/admin/products/${p.id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-[#8B1D8F]">
                                  <Edit className="h-3.5 w-3.5" />
                                </Link>
                                <button onClick={() => handleDeleteProduct(p.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. ORDERS TAB */}
              {activeTab === "orders" && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-[#1A0F1C]">Customer Order Tracking</h2>
                    <Link href="/admin/orders/create" className="flex items-center gap-1.5 rounded-full bg-[#8B1D8F] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7A187C]">
                      <Plus className="h-4 w-4" /> Create Offline Order
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <p className="text-[14px] text-center text-[#8B7A8F] py-8">No orders placed yet.</p>
                    ) : (
                      orders.map((order) => (
                        <div key={order._id} className="rounded-2xl border border-[#F0E6F2] p-5 hover:border-[#E1BFE6] transition">
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F8F0F9] pb-4">
                            <div>
                              <div className="text-[13px] text-[#8B7A8F]">Order ID: <span className="font-mono text-[#8B1D8F] font-semibold">{order._id}</span></div>
                              <div className="text-[12px] text-[#8B7A8F] mt-0.5">Date: {new Date(order.createdAt).toLocaleString("en-IN")}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* Payment Method Badge */}
                              <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-[11px] font-semibold uppercase">
                                {order.paymentMethod === "cod" ? "COD" : "Online"}
                              </span>

                              {/* Payment Status Dropdown */}
                              <select
                                value={order.paymentStatus}
                                onChange={(e) => handleOrderPaymentStatusUpdate(order._id, e.target.value)}
                                className="rounded-full border border-[#EEDDF0] bg-white px-3 py-1 text-[12.5px] font-medium text-[#4A354D] outline-none cursor-pointer"
                              >
                                <option value="pending">Pending Payment</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                              </select>
                              
                              {/* Shipping Status Dropdown */}
                              <select
                                value={order.shippingStatus}
                                onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                                className="rounded-full border border-[#EEDDF0] bg-white px-3 py-1 text-[12.5px] font-medium text-[#4A354D] outline-none cursor-pointer"
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          <div className="py-4 grid gap-4 md:grid-cols-[2fr_1fr]">
                            <div>
                              <div className="text-[13.5px] font-semibold text-[#1A0F1C] mb-2">Costumes</div>
                              <ul className="space-y-2">
                                {order.items.map((item: any, i: number) => (
                                  <li key={i} className="flex items-center gap-3 text-[13.5px] text-[#4A354D]">
                                    <div className="h-8 w-7 rounded bg-gray-50 border border-gray-100 overflow-hidden shrink-0"><img src={item.image} className="h-full w-full object-cover" /></div>
                                    <span className="font-medium text-[#1A0F1C]">{item.title}</span>
                                    <span className="text-[#8B7A8F]">({item.quantity}x)</span>
                                    <span className="ml-auto font-semibold">₹{item.price * item.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-xl bg-[#FCF7FD] p-3 text-[13px] border border-[#F0E6F2]">
                              <div className="font-semibold text-[#1A0F1C] mb-1.5">Delivery & Totals</div>
                              <div><strong>Customer:</strong> {order.shippingDetails.name}</div>
                              <div><strong>Address:</strong> {order.shippingDetails.address}</div>
                              <div><strong>Phone:</strong> {order.shippingDetails.phone}</div>
                              <div className="mt-2 border-t border-[#EEDDF0] pt-2 flex justify-between font-bold text-[#1A0F1C]">
                                <span>Grand Total:</span>
                                <span>₹{order.total}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 3. USERS TAB */}
              {activeTab === "users" && (
                <div>
                  <h2 className="mb-6 text-[18px] font-semibold text-[#1A0F1C]">User Management</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[14px]">
                      <thead>
                        <tr className="border-b border-[#F0E6F2] text-left text-[#8B7A8F] font-medium">
                          <th className="pb-3 pr-4">User</th>
                          <th className="pb-3 pr-4">Email</th>
                          <th className="pb-3 pr-4">Registered</th>
                          <th className="pb-3 pr-4">Role</th>
                          <th className="pb-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <React.Fragment key={u._id}>
                            <tr className="border-b border-[#F8F0F9] last:border-0 hover:bg-[#FCF7FD]/30">
                              <td className="py-3.5 pr-4">
                                <Link href={`/admin/users/${u._id}`} className="flex items-center gap-3 hover:underline">
                                  {u.image ? (
                                    <img src={u.image} alt="" className="h-8 w-8 rounded-full border border-[#EEDDF0] object-cover" />
                                  ) : (
                                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#8B1D8F] to-[#E91E7A] text-[12px] font-semibold text-white">
                                      {u.name.split(" ").map((n: string)=>n[0]).join("")}
                                    </div>
                                  )}
                                  <span className="font-semibold text-[#1A0F1C]">{u.name}</span>
                                </Link>
                              </td>
                              <td className="py-3.5 pr-4 text-[#6B5A6F]">{u.email}</td>
                              <td className="py-3.5 pr-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="py-3.5 pr-4">
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3.5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Link
                                    href={`/admin/users/${u._id}`}
                                    className="rounded-full bg-[#8B1D8F] px-3.5 py-1 text-[12.5px] font-semibold text-white hover:bg-[#7A187C] transition"
                                  >
                                    View Profile
                                  </Link>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleUserRole(u.email, u.role);
                                    }}
                                    className="rounded-full border border-[#EEDDF0] px-3.5 py-1 text-[12px] font-semibold text-[#8B1D8F] hover:bg-[#FCF7FD]"
                                  >
                                    Toggle {u.role === "admin" ? "User" : "Admin"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. INQUIRIES TAB */}
              {activeTab === "inquiries" && (
                <div>
                  <h2 className="mb-6 text-[18px] font-semibold text-[#1A0F1C]">Customer Support Inquiries</h2>
                  <div className="space-y-4">
                    {inquiries.length === 0 ? (
                      <p className="text-[14px] text-center text-[#8B7A8F] py-8">No customer inquiries submitted.</p>
                    ) : (
                      inquiries.map((inq) => (
                        <div key={inq._id} className="rounded-2xl border border-[#F0E6F2] p-5 bg-[#FCF7FD]/50">
                          <div className="flex items-center justify-between border-b border-[#F8F0F9] pb-3 mb-3">
                            <div>
                              <div className="font-semibold text-[#1A0F1C]">{inq.name}</div>
                              <div className="text-[12px] text-[#8B7A8F]">{inq.email} • {new Date(inq.createdAt).toLocaleDateString("en-IN")}</div>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${inq.status === "resolved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {inq.status === "resolved" ? "Resolved" : "Pending Action"}
                            </span>
                          </div>
                          <p className="text-[13.5px] text-[#4A354D] leading-relaxed">"{inq.message}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </div>



    </div>
  );
}
