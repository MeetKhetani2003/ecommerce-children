"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Package, ShoppingBag, Users, HelpCircle, Plus, Edit, Trash2, 
  X, RefreshCw 
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "users" | "inquiries">("products");

  // State lists
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form states (Add/Edit Product)
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Animal Costume");
  const [formPrice, setFormPrice] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formStock, setFormStock] = useState("50");
  const [formDescription, setFormDescription] = useState("");

  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [session, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "products") {
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
  const openAddModal = () => {
    setEditingProduct(null);
    setFormTitle("");
    setFormCategory("Animal Costume");
    setFormPrice("");
    setFormMrp("");
    setFormImage("");
    setFormStock("50");
    setFormDescription("");
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormMrp(p.mrp.toString());
    setFormImage(p.image);
    setFormStock(p.stock ? p.stock.toString() : "50");
    setFormDescription(p.description || "");
    setModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formTitle,
      category: formCategory,
      price: parseFloat(formPrice),
      mrp: parseFloat(formMrp),
      image: formImage || "https://images.pexels.com/photos/8501698/pexels-photo-8501698.jpeg",
      stock: parseInt(formStock),
      description: formDescription,
    };

    try {
      if (editingProduct) {
        // Edit product
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          alert("Product updated successfully!");
          setModalOpen(false);
          fetchData();
        }
      } else {
        // Add product
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          alert("Product created successfully!");
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

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
              {/* 1. PRODUCTS TAB */}
              {activeTab === "products" && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-[#1A0F1C]">Saheli Costumes Inventory</h2>
                    <button onClick={openAddModal} className="flex items-center gap-1.5 rounded-full bg-[#8B1D8F] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7A187C]">
                      <Plus className="h-4 w-4" /> Add Costume
                    </button>
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
                                <button onClick={() => openEditModal(p)} className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-[#8B1D8F]">
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
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
                  <h2 className="mb-6 text-[18px] font-semibold text-[#1A0F1C]">Customer Order Tracking</h2>
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
                              {/* Payment status badge */}
                              <span className={`rounded-full px-3 py-1 text-[11.5px] font-medium ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>
                                {order.paymentStatus === "paid" ? "Paid" : "Pending Payment"}
                              </span>
                              
                              {/* Shipping Status Dropdown */}
                              <select
                                value={order.shippingStatus}
                                onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                                className="rounded-full border border-[#EEDDF0] bg-white px-3 py-1 text-[12.5px] font-medium text-[#4A354D] outline-none"
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
                          <tr key={u._id} className="border-b border-[#F8F0F9] last:border-0 hover:bg-[#FCF7FD]/30">
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#8B1D8F] to-[#E91E7A] text-[12px] font-semibold text-white">
                                  {u.name.split(" ").map((n: string)=>n[0]).join("")}
                                </div>
                                <span className="font-semibold text-[#1A0F1C]">{u.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 pr-4 text-[#6B5A6F]">{u.email}</td>
                            <td className="py-3.5 pr-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="py-3.5 pr-4">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3.5 text-center">
                              <button
                                onClick={() => handleToggleUserRole(u.email, u.role)}
                                className="rounded-full border border-[#EEDDF0] px-3.5 py-1 text-[12px] font-semibold text-[#8B1D8F] hover:bg-[#FCF7FD]"
                              >
                                Toggle {u.role === "admin" ? "User" : "Admin"}
                              </button>
                            </td>
                          </tr>
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

      {/* ADD/EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[500px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6F2] p-5">
              <h3 className="text-[16px] font-semibold text-[#1A0F1C]">
                {editingProduct ? "Modify Costume Details" : "Add New Costume"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="mb-1 block text-[12.5px] font-medium text-[#4A354D]">Title / Costume Name</label>
                <input required type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="h-10 w-full rounded-xl border border-[#EEDDF0] px-3.5 text-[13.5px] outline-none focus:border-[#E1BFE6]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[12.5px] font-medium text-[#4A354D]">Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="h-10 w-full rounded-xl border border-[#EEDDF0] px-2 text-[13px] outline-none bg-white">
                    <option value="Animal Costume">Animal Costume</option>
                    <option value="Birds Costume">Birds Costume</option>
                    <option value="Indian State Costume">Indian State Costume</option>
                    <option value="Fruit Costume">Fruit Costume</option>
                    <option value="Vegetable Costume">Vegetable Costume</option>
                    <option value="Water Animals Costume">Water Animals Costume</option>
                    <option value="Hair Wigs">Hair Wigs</option>
                    <option value="Super Heroes">Super Heroes</option>
                    <option value="Insect Costume">Insect Costume</option>
                    <option value="Our Helpers">Our Helpers</option>
                    <option value="Flower Costume">Flower Costume</option>
                    <option value="Cartoon Characters Costume">Cartoon Characters Costume</option>
                    <option value="Community Helpers">Community Helpers</option>
                    <option value="Indian Mythology Costume">Indian Mythology Costume</option>
                    <option value="Republic Day / Independence Day">Republic Day / Independence Day</option>
                    <option value="Indian Dance Costume">Indian Dance Costume</option>
                    <option value="Caps / Hats / Safa / Pagdi">Caps / Hats / Safa / Pagdi</option>
                    <option value="Face Masks">Face Masks</option>
                    <option value="Halloween Costumes">Halloween Costumes</option>
                    <option value="National Heroes">National Heroes</option>
                    <option value="Silver / Golden Jewellery">Silver / Golden Jewellery</option>
                    <option value="Offer Products">Offer Products</option>
                    <option value="Umbrella / Fans">Umbrella / Fans</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[12.5px] font-medium text-[#4A354D]">Stock Inventory</label>
                  <input required type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} className="h-10 w-full rounded-xl border border-[#EEDDF0] px-3.5 text-[13.5px] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[12.5px] font-medium text-[#4A354D]">Price (₹)</label>
                  <input required type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="h-10 w-full rounded-xl border border-[#EEDDF0] px-3.5 text-[13.5px] outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-[12.5px] font-medium text-[#4A354D]">MRP (₹)</label>
                  <input required type="number" value={formMrp} onChange={(e) => setFormMrp(e.target.value)} className="h-10 w-full rounded-xl border border-[#EEDDF0] px-3.5 text-[13.5px] outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12.5px] font-medium text-[#4A354D]">Image URL</label>
                <input type="text" value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="Leave blank for placeholder" className="h-10 w-full rounded-xl border border-[#EEDDF0] px-3.5 text-[13.5px] outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-[12.5px] font-medium text-[#4A354D]">Costume Description</label>
                <textarea rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full rounded-xl border border-[#EEDDF0] p-3 text-[13.5px] outline-none focus:border-[#E1BFE6]" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-full border border-gray-200 py-3 text-[14px] font-medium text-gray-500 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 rounded-full bg-[#8B1D8F] py-3 text-[14px] font-medium text-white hover:bg-[#7A187C]">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
