"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function CreateCoupon() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: 10,
    expiresAt: "",
    active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Coupon created successfully");
        router.push("/admin?tab=coupons");
      } else {
        toast.error(data.message || "Failed to create coupon");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin?tab=coupons" className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#EEDDF0] text-[#6B5A6F] hover:bg-[#FCF7FD] transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1A0F1C]">Create New Coupon</h1>
            <p className="text-sm text-[#8B7A8F]">Add a new discount coupon code for customers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-[#F0E6F2] shadow-sm space-y-6">
          <div className="grid gap-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Coupon Code *</label>
              <input required type="text" name="code" value={formData.code} onChange={handleChange} className="h-11 w-full uppercase font-mono rounded-xl border border-[#EEDDF0] px-4 text-sm outline-none focus:border-[#8B1D8F]" placeholder="e.g., SUMMER20" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Discount Percentage (%) *</label>
              <input required type="number" min="1" max="100" name="discountPercent" value={formData.discountPercent} onChange={handleChange} className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-sm outline-none focus:border-[#8B1D8F]" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Expiry Date (Optional)</label>
              <input type="date" name="expiresAt" value={formData.expiresAt} onChange={handleChange} className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-sm outline-none focus:border-[#8B1D8F]" />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-[#8B1D8F] focus:ring-[#8B1D8F]" />
              <label htmlFor="active" className="text-sm font-medium text-[#4A354D]">Set as Active</label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0E6F2]">
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B1D8F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7A187C] disabled:opacity-50">
              <Save className="h-4 w-4" /> {loading ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
