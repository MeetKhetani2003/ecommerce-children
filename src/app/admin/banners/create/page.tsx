"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Save, ImageIcon, X } from "lucide-react";
import Link from "next/link";

export default function CreateBanner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    ctaText: "Shop Now",
    ctaLink: "/products",
    eyebrow: "",
    badge: "",
    active: true,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select a banner image");
      return;
    }
    
    setLoading(true);

    try {
      const formDataPayload = new FormData();
      formDataPayload.append("title", formData.title);
      formDataPayload.append("subtitle", formData.subtitle);
      formDataPayload.append("ctaText", formData.ctaText);
      formDataPayload.append("ctaLink", formData.ctaLink);
      formDataPayload.append("eyebrow", formData.eyebrow);
      formDataPayload.append("badge", formData.badge);
      formDataPayload.append("active", String(formData.active));
      formDataPayload.append("image", imageFile);

      const res = await fetch("/api/admin/banners", {
        method: "POST",
        body: formDataPayload,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Banner created successfully");
        router.push("/admin?tab=banners");
      } else {
        toast.error(data.message || "Failed to create banner");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin?tab=banners" className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#EEDDF0] text-[#6B5A6F] hover:bg-[#FCF7FD] transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1A0F1C]">Create New Banner</h1>
            <p className="text-sm text-[#8B7A8F]">Add a new dynamic hero banner to the homepage</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-[#F0E6F2] shadow-sm space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Title *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-sm outline-none focus:border-[#8B1D8F]" placeholder="e.g., Summer Collection 2026" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Subtitle</label>
              <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-sm outline-none focus:border-[#8B1D8F]" placeholder="e.g., Get the best outfits for your kids" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Banner Image *</label>
              
              {imagePreview ? (
                <div className="relative inline-block mt-2">
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="h-32 w-auto max-w-full rounded-xl object-cover border border-[#E1BFE6] shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(imagePreview);
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E1BFE6] bg-[#FCF7FD]/50 text-[#8B7A8F] transition hover:border-[#8B1D8F] hover:text-[#8B1D8F]">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-[12px] font-medium">Click to upload banner image</span>
                  <input
                    required
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setImagePreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Call to Action Text</label>
              <input type="text" name="ctaText" value={formData.ctaText} onChange={handleChange} className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-sm outline-none focus:border-[#8B1D8F]" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Call to Action Link</label>
              <input type="text" name="ctaLink" value={formData.ctaLink} onChange={handleChange} className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-sm outline-none focus:border-[#8B1D8F]" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Eyebrow Text (Optional)</label>
              <input type="text" name="eyebrow" value={formData.eyebrow} onChange={handleChange} className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-sm outline-none focus:border-[#8B1D8F]" placeholder="e.g., NEW ARRIVAL" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#4A354D]">Badge Text (Optional)</label>
              <input type="text" name="badge" value={formData.badge} onChange={handleChange} className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-sm outline-none focus:border-[#8B1D8F]" placeholder="e.g., 20% OFF" />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-[#8B1D8F] focus:ring-[#8B1D8F]" />
              <label htmlFor="active" className="text-sm font-medium text-[#4A354D]">Set as Active (Visible on Homepage)</label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0E6F2]">
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B1D8F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7A187C] disabled:opacity-50">
              <Save className="h-4 w-4" /> {loading ? "Creating..." : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
