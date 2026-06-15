"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Edit, Trash2 } from "lucide-react";

export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [sku, setSku] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Animal Costume");
  const [formPrice, setFormPrice] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formStock, setFormStock] = useState("50");
  const [formDescription, setFormDescription] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formSizes, setFormSizes] = useState("");
  const [formWhatsIncluded, setFormWhatsIncluded] = useState("");
  const [formCareInstructions, setFormCareInstructions] = useState("");
  
  const [existingImage, setExistingImage] = useState("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [detailedImagesFiles, setDetailedImagesFiles] = useState<File[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (isAdmin && id) {
      fetchProduct();
    }
  }, [isAdmin, id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success && data.product) {
        const product = data.product;
        setSku(product.sku || "N/A");
        setFormTitle(product.title || "");
        setFormCategory(product.category || "Animal Costume");
        setFormPrice(product.price ? product.price.toString() : "");
        setFormMrp(product.mrp ? product.mrp.toString() : "");
        setExistingImage(product.image || "");
        setFormStock(product.stock ? product.stock.toString() : "50");
        setFormDescription(product.description || "");
        setFormTag(product.tag || "");
        setFormMaterial(product.material || "");
        setFormSizes(product.sizes ? product.sizes.join(", ") : "");
        setFormWhatsIncluded(product.whatsIncluded ? product.whatsIncluded.join(", ") : "");
        setFormCareInstructions(product.careInstructions || "");
        setReviews(product.reviews || []);
      } else {
        alert("Product not found!");
        router.push("/admin");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/products/${id}/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Review deleted successfully!");
        fetchProduct();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the review.");
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center text-[#8B7A8F]">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[500px] px-4 py-20 text-center">
        <h2 className="text-[22px] font-semibold text-red-600">Admin Privileges Required</h2>
        <Link href="/profile" className="mt-6 inline-block rounded-full bg-[#8B1D8F] px-6 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#7A187C]">
          Go to Profile
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Validate file sizes
    const MAX_SIZE = 500 * 1024; // 500KB
    if (mainImageFile && mainImageFile.size > MAX_SIZE) {
      alert("Main image exceeds 500KB limit.");
      setSubmitting(false);
      return;
    }
    for (const file of detailedImagesFiles) {
      if (file.size > MAX_SIZE) {
        alert(`Image ${file.name} exceeds 500KB limit.`);
        setSubmitting(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", formTitle);
    formData.append("category", formCategory);
    formData.append("price", formPrice);
    formData.append("mrp", formMrp);
    formData.append("stock", formStock);
    formData.append("description", formDescription);
    formData.append("tag", formTag);
    formData.append("material", formMaterial);
    formData.append("sizes", formSizes);
    formData.append("whatsIncluded", formWhatsIncluded);
    formData.append("careInstructions", formCareInstructions);
    
    if (mainImageFile) {
      formData.append("image", mainImageFile);
    }
    detailedImagesFiles.forEach(f => {
      formData.append("images", f);
    });

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Product updated successfully!");
        router.push("/admin");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 md:py-12">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#6B5A6F] hover:text-[#8B1D8F] mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="rounded-3xl border border-[#F0E6F2] bg-white p-6 md:p-10 shadow-sm">
        <div className="mb-8 flex items-center gap-3 border-b border-[#F0E6F2] pb-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FCF7FD] text-[#8B1D8F]">
            <Edit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1A0F1C]">Edit Costume Details</h1>
            <p className="text-[14px] text-[#6B5A6F]">Update existing product information.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">SKU (Auto-Generated & Read Only)</label>
            <input readOnly type="text" value={sku} className="h-12 w-full rounded-xl border border-[#EEDDF0] bg-gray-50 px-4 text-[14px] text-gray-500 outline-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Title / Costume Name</label>
            <input required type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="h-12 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Category</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="h-12 w-full rounded-xl border border-[#EEDDF0] px-3 text-[14px] outline-none bg-white">
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
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Stock Inventory</label>
              <input required type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} className="h-12 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Price (₹)</label>
              <input required type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="h-12 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">MRP (₹)</label>
              <input required type="number" value={formMrp} onChange={(e) => setFormMrp(e.target.value)} className="h-12 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Tag / Badge</label>
              <input type="text" value={formTag} onChange={(e) => setFormTag(e.target.value)} placeholder="e.g. Bestseller, New" className="h-12 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Material</label>
              <input type="text" value={formMaterial} onChange={(e) => setFormMaterial(e.target.value)} placeholder="e.g. 100% Cotton" className="h-12 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Sizes (comma separated)</label>
            <input type="text" value={formSizes} onChange={(e) => setFormSizes(e.target.value)} placeholder="3-4 Yrs, 5-6 Yrs" className="h-12 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">What's Included (comma separated)</label>
            <input type="text" value={formWhatsIncluded} onChange={(e) => setFormWhatsIncluded(e.target.value)} placeholder="Cape, Mask, Belt" className="h-12 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Care Instructions</label>
            <input type="text" value={formCareInstructions} onChange={(e) => setFormCareInstructions(e.target.value)} className="h-12 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Costume Description</label>
            <textarea rows={4} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full rounded-xl border border-[#EEDDF0] p-4 text-[14px] outline-none focus:border-[#E1BFE6]" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 rounded-2xl border border-dashed border-[#E1BFE6] bg-[#FCF7FD]/50 p-6">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#4A354D]">Main Image (Max 500KB)</label>
              {existingImage && <div className="mb-3"><img src={existingImage} alt="Current" className="h-20 w-auto rounded-lg object-cover border border-[#F0E6F2]" /></div>}
              <input type="file" accept="image/*" onChange={(e) => setMainImageFile(e.target.files?.[0] || null)} className="w-full text-[13px] file:mr-4 file:rounded-full file:border-0 file:bg-[#F3E7F5] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#8B1D8F] hover:file:bg-[#E1BFE6]" />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#4A354D]">Detailed Images (Max 500KB each)</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setDetailedImagesFiles(Array.from(e.target.files || []))} className="w-full text-[13px] file:mr-4 file:rounded-full file:border-0 file:bg-[#F3E7F5] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#8B1D8F] hover:file:bg-[#E1BFE6]" />
            </div>
          </div>

          <div className="pt-6 border-t border-[#F0E6F2]">
            <button disabled={submitting} type="submit" className="w-full sm:w-auto rounded-full bg-[#8B1D8F] px-8 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#7A187C] disabled:opacity-50">
              {submitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews Management Block */}
      <div className="mt-8 rounded-3xl border border-[#F0E6F2] bg-white p-6 md:p-10 shadow-sm">
        <h2 className="text-[20px] font-semibold text-[#1A0F1C] mb-2">Customer Reviews & Ratings</h2>
        <p className="text-[14px] text-[#6B5A6F] mb-6">Manage user reviews submitted for this costume.</p>

        {reviews.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#EEDDF0] rounded-2xl bg-[#FCF7FD]/30">
            <p className="text-[14px] text-[#8B7A8F] italic">No reviews submitted for this product yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review._id} className="p-5 border border-[#F0E6F2] rounded-2xl bg-white hover:border-[#E1BFE6] transition flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#1A0F1C]">{review.userName}</span>
                    <span className="text-[12px] text-[#8B7A8F]">({review.userEmail})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                      ))}
                    </div>
                    <span className="text-[12px] font-semibold text-[#4A354D]">{review.rating} / 5</span>
                    <span className="text-[12px] text-gray-400">•</span>
                    <span className="text-[12px] text-[#8B7A8F]">{review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN") : "N/A"}</span>
                  </div>
                  <p className="text-[13.5px] text-[#4A354D] mt-2 italic">"{review.comment}"</p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(review._id)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-white px-3.5 py-2 text-[12.5px] font-medium text-red-600 transition hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
