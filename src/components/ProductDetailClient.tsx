"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Star, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, ChevronRight, X, Trash2 } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import Barcode from "react-barcode";
import { BsCash } from "react-icons/bs";
import toast from "react-hot-toast";
import Image from "next/image";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

const ImageMagnifier = ({ src, alt }: { src: string; alt: string }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      className="relative h-full w-full cursor-crosshair overflow-hidden"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 600px"
        className="object-cover transition-opacity duration-300"
      />
      {showMagnifier && (
        <div
          className="pointer-events-none absolute inset-0 z-20 bg-white"
          style={{
            backgroundImage: `url("${encodeURI(src)}")`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: "250%",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  );
};

interface ProductDetailClientProps {
  product: any;
  allProducts: any[];
}

export default function ProductDetailClient({ product: initialProduct, allProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart, wishlist, toggleWishlist } = useShop();

  const [product, setProduct] = useState<any>(initialProduct);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Size guide modal state
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeRequired, setSizeRequired] = useState(false);

  // Bulk inquiry form states
  const [bulkFormOpen, setBulkFormOpen] = useState(false);
  const [bulkName, setBulkName] = useState("");
  const [bulkEmail, setBulkEmail] = useState("");
  const [bulkPhone, setBulkPhone] = useState("");
  const [bulkQty, setBulkQty] = useState("10");
  const [bulkDate, setBulkDate] = useState("");
  const [bulkMsg, setBulkMsg] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkInquiryStatus, setBulkInquiryStatus] = useState("");

  // Review states
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const isAdmin = (session?.user as any)?.role === "admin";

  // Sync state if initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setActiveImage(0);
      setSelectedSize(null);
    }
  }, [initialProduct]);

  const handleBulkInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setBulkSubmitting(true);
    setBulkInquiryStatus("");
    try {
      const res = await fetch("/api/inquiries/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bulkName,
          email: bulkEmail,
          phone: bulkPhone,
          message: bulkMsg,
          productId: product.id,
          productTitle: product.title,
          quantity: Number(bulkQty),
          eventDate: bulkDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkInquiryStatus("Bulk order inquiry submitted successfully!");
        setBulkName("");
        setBulkEmail("");
        setBulkPhone("");
        setBulkQty("10");
        setBulkDate("");
        setBulkMsg("");
        setTimeout(() => {
          setBulkFormOpen(false);
          setBulkInquiryStatus("");
        }, 3000);
      } else {
        setBulkInquiryStatus("Submission failed: " + data.message);
      }
    } catch (err) {
      setBulkInquiryStatus("An error occurred.");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please sign in first to write a review.");
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError("Please type a comment.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: session.user.name || "Anonymous",
          userEmail: session.user.email,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setReviewComment("");
        setReviewRating(5);
        toast.success("Review submitted successfully!");
      } else {
        setReviewError(data.message || "Failed to submit review.");
      }
    } catch (err) {
      setReviewError("An error occurred while submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/products/${product.id}/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        toast.success("Review deleted successfully!");
      } else {
        toast(data.message || "Failed to delete review.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-[#1A0F1C]">Product not found</h2>
        <Link href="/" className="mt-4 text-[#8B1D8F] hover:underline">Return to Home</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const detailedImages: string[] = product.images && product.images.length > 0 ? product.images : [];
  const images = product.image
    ? [product.image, ...detailedImages.filter((img: string) => img !== product.image)]
    : detailedImages.length > 0 ? detailedImages : [];
  const reviewsList = product.reviews || [];

  return (
    <div className="mx-auto max-w-[1240px] overflow-x-hidden px-4 py-6 md:py-12">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center text-[12px] sm:text-[13px] text-[#8B7A8F] gap-y-1">
        <Link href="/" className="hover:text-[#8B1D8F] shrink-0">Home</Link>
        <ChevronRight className="mx-1 sm:mx-2 h-3.5 w-3.5 shrink-0" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#8B1D8F] shrink-0">{product.category}</Link>
        <ChevronRight className="mx-1 sm:mx-2 h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-[#2E1F31] truncate max-w-[160px] sm:max-w-none">{product.title}</span>
      </nav>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:gap-12 lg:grid-cols-[1.2fr_1fr]">
        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] sm:rounded-[24px] bg-[#FCF7FD]">
            <ImageMagnifier src={images[activeImage]} alt={product.title} />
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#6B5A6F] shadow-sm backdrop-blur transition-all hover:text-[#E91E7A]"
            >
              <Heart className={`h-5 w-5 transition ${isWishlisted ? "fill-[#E91E7A] text-[#E91E7A]" : ""}`} />
            </button>
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-[4/5] overflow-hidden rounded-xl border-2 transition-all ${activeImage === idx ? "border-[#8B1D8F]" : "border-transparent hover:border-[#E8DDE9]"
                    }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  {activeImage !== idx && <div className="absolute inset-0 bg-white/20 z-10"></div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-[#F3E7F5] px-3 py-1 text-[12px] font-medium text-[#7A187C]">{product.category}</span>
            {product.tag && <span className="rounded-full bg-[#1A0F1C] px-3 py-1 text-[12px] font-medium text-white">{product.tag}</span>}
          </div>

          <h1 className="text-[22px] sm:text-[28px] font-semibold leading-tight text-[#1A0F1C] md:text-[36px]">{product.title}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 4.5) ? "fill-[#F5A524] text-[#F5A524]" : "text-[#E8DDE9]"}`} />
              ))}
            </div>
            <span className="text-[14px] text-[#8B7A8F]">{product.rating || 4.5} ({reviewsList.length} reviews)</span>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-wrap items-baseline gap-2 sm:gap-3 border-b border-[#F0E6F2] pb-5 sm:pb-6">
            <span className="text-[26px] sm:text-[32px] font-bold text-[#1A0F1C]">₹{product.price}</span>
            <span className="text-[15px] sm:text-[18px] text-[#9A8A9D] line-through">₹{product.mrp}</span>
            <span className="rounded bg-[#E8F5E9] px-2 py-0.5 sm:py-1 text-[11px] sm:text-[13px] font-bold text-[#0F8A4B]">
              {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
            </span>
          </div>

          <div className="mt-4 sm:mt-6">
            <p className="text-[13.5px] sm:text-[15px] leading-relaxed text-[#5E4F63] whitespace-pre-wrap">{product.description}</p>

            {product.brand && product.brand !== "Saheli Shrungar" && (
              <div className="mt-3 text-[14px] text-[#6B5A6F]">
                <span className="font-semibold text-[#1A0F1C]">Brand:</span>{" "}
                <Link href={`/brand/${product.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="text-[#8B1D8F] hover:underline">
                  {product.brand}
                </Link>
              </div>
            )}

            {product.sku && (
              <div className="mt-3 text-[14px] text-[#6B5A6F]">
                <span className="font-semibold text-[#1A0F1C]">SKU:</span> {product.sku}
              </div>
            )}
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div id="size-selector" className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-medium text-[#1A0F1C]">
                  Select Size
                  {sizeRequired && !selectedSize && (
                    <span className="ml-2 text-[12px] font-bold text-red-500 animate-pulse">
                      ← Please select a size!
                    </span>
                  )}
                </h3>
                <button onClick={() => setSizeGuideOpen(true)} className="text-[13px] font-medium text-[#8B1D8F] hover:underline focus:outline-none">Size Guide</button>
              </div>
              <div className={`flex flex-wrap gap-3 ${sizeRequired && !selectedSize ? "ring-2 ring-red-300 ring-offset-2 rounded-xl p-2" : ""}`}>
                {product.sizes.map((sizeObj: any, idx: number) => {
                  const sizeLabel = typeof sizeObj === "object" && sizeObj !== null ? sizeObj.size : sizeObj;
                  const sizeStock = typeof sizeObj === "object" && sizeObj !== null ? Number(sizeObj.stock) : 1;
                  const isOutOfStock = sizeStock === 0;
                  return (
                    <button
                      key={idx}
                      onClick={() => { if (!isOutOfStock) { setSelectedSize(sizeLabel); setSizeRequired(false); } }}
                      disabled={isOutOfStock}
                      title={isOutOfStock ? "Out of Stock" : `${sizeStock} in stock`}
                      className={`relative rounded-full border px-5 py-2.5 text-[14px] transition-all focus:outline-none ${isOutOfStock
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 line-through opacity-60"
                        : selectedSize === sizeLabel
                          ? "border-[#8B1D8F] bg-[#F3E7F5] text-[#7A187C] font-medium"
                          : sizeRequired && !selectedSize
                          ? "border-red-300 text-[#5E4F63] hover:border-[#8B1D8F]"
                          : "border-[#E8DDE9] text-[#5E4F63] hover:border-[#8B1D8F] hover:text-[#8B1D8F]"
                        }`}
                    >
                      {sizeLabel}
                      {isOutOfStock && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-500">
                          Out
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedSize ? (
                <p className="mt-2 text-[12px] text-[#8B7A8F]">
                  Selected: <span className="font-semibold text-[#8B1D8F]">{selectedSize}</span>
                </p>
              ) : sizeRequired ? (
                <p className="mt-2 text-[12px] font-semibold text-red-500">⚠️ You must select a size to continue</p>
              ) : null}
            </div>
          )}

          <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <button
              onClick={() => {
                if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                  setSizeRequired(true);
                  toast.error("Please select a size first");
                  // scroll to size section
                  document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  return;
                }
                addToCart(product, selectedSize || undefined);
              }}
              className="flex items-center justify-center gap-2 rounded-full bg-[#1A0F1C] py-3.5 sm:py-4 text-[14px] sm:text-[15px] font-medium text-white transition hover:bg-black active:scale-[0.98]"
            >
              <ShoppingBag className="h-5 w-5" /> Add to Cart
            </button>
            <button
              onClick={() => {
                if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                  setSizeRequired(true);
                  toast.error("Please select a size first");
                  document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  return;
                }
                addToCart(product, selectedSize || undefined);
                router.push("/cart");
              }}
              className="flex items-center justify-center gap-2 rounded-full bg-[#8B1D8F] py-3.5 sm:py-4 text-[14px] sm:text-[15px] font-medium text-white transition hover:bg-[#7A187C] active:scale-[0.98]"
            >
              Buy Now
            </button>
          </div>

          {/* Bulk Order Inquiry Section */}
          <div className="mt-6 sm:mt-8 rounded-2xl border border-dashed border-[#E1BFE6] bg-[#FCF7FD]/50 p-4 sm:p-5">
            <h3 className="text-[15px] font-semibold text-[#1A0F1C] flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-[#8B1D8F]" /> Wholesale Bulk Inquiry
            </h3>
            <p className="text-[12.5px] text-[#6B5A6F] mt-1">Get custom discounted quotes for school events or dance groups (minimum 10+ units).</p>

            {!bulkFormOpen ? (
              <button onClick={() => setBulkFormOpen(true)} className="mt-4 rounded-xl border border-[#8B1D8F] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#8B1D8F] hover:bg-[#F3E7F5] transition">
                Inquire Bulk Pricing
              </button>
            ) : (
              <form onSubmit={handleBulkInquirySubmit} className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required type="text" placeholder="Your Name" value={bulkName} onChange={(e) => setBulkName(e.target.value)} className="h-10 sm:h-9 rounded-lg border border-[#EEDDF0] bg-white px-3 text-[13px] sm:text-[12.5px] outline-none" />
                  <input required type="email" placeholder="Your Email" value={bulkEmail} onChange={(e) => setBulkEmail(e.target.value)} className="h-10 sm:h-9 rounded-lg border border-[#EEDDF0] bg-white px-3 text-[13px] sm:text-[12.5px] outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required type="tel" placeholder="Phone Number" value={bulkPhone} onChange={(e) => setBulkPhone(e.target.value)} className="h-10 sm:h-9 rounded-lg border border-[#EEDDF0] bg-white px-3 text-[13px] sm:text-[12.5px] outline-none" />
                  <div className="flex gap-2 items-center">
                    <input required type="number" min={10} placeholder="Qty" value={bulkQty} onChange={(e) => setBulkQty(e.target.value)} className="h-10 sm:h-9 w-16 sm:w-14 rounded-lg border border-[#EEDDF0] bg-white px-2 text-[13px] sm:text-[12.5px] outline-none text-center" />
                    <input required type="date" placeholder="Event Date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} className="h-10 sm:h-9 flex-1 rounded-lg border border-[#EEDDF0] bg-white px-2 text-[13px] sm:text-[12.5px] outline-none" />
                  </div>
                </div>
                <textarea required rows={2} placeholder="Custom sizes, custom requirements, event details..." value={bulkMsg} onChange={(e) => setBulkMsg(e.target.value)} className="w-full rounded-lg border border-[#EEDDF0] bg-white p-2.5 text-[12.5px] outline-none" />

                {bulkInquiryStatus && (
                  <div className="text-[12px] font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">{bulkInquiryStatus}</div>
                )}

                <div className="flex gap-2">
                  <button type="submit" disabled={bulkSubmitting} className="rounded-lg bg-[#8B1D8F] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#7A187C] disabled:opacity-50">
                    {bulkSubmitting ? "Sending..." : "Submit Inquiry"}
                  </button>
                  <button type="button" onClick={() => setBulkFormOpen(false)} className="rounded-lg border border-gray-200 px-3 py-2 text-[12.5px] text-gray-500 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-[#F0E6F2] bg-[#FCF7FD] p-4 sm:p-5 sm:grid-cols-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Truck className="h-6 w-6 text-[#8B1D8F]" />
              <span className="text-[13px] font-medium text-[#2E1F31]">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <BsCash className="h-6 w-6 text-[#8B1D8F]" />
              <span className="text-[13px] font-medium text-[#2E1F31]">Cash On Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <RotateCcw className="h-6 w-6 text-[#8B1D8F]" />
              <span className="text-[13px] font-medium text-[#2E1F31]">7-Day Returns</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <ShieldCheck className="h-6 w-6 text-[#8B1D8F]" />
              <span className="text-[13px] font-medium text-[#2E1F31]">Secure Payment</span>
            </div>
          </div>

        </div>
      </div>

      {/* Product Details Section */}
      <div className="mt-8 sm:mt-12 border-t border-[#F0E6F2] pt-8 sm:pt-10">

        <div className="grid gap-8 md:grid-cols-2 text-[13px] sm:text-[14px] items-start">
          {/* Left Column: Features */}
          <div className="space-y-6">
            <h3 className="mb-6 text-[18px] sm:text-[20px] font-semibold text-[#1A0F1C]">Product Details</h3>
            {(product.features || product.material) && (
              <div>
                <h4 className="mt-0 mb-3 font-semibold text-[#1A0F1C] text-[14px] sm:text-[15px]">Features</h4>
                <ul className="space-y-2">
                  {((product.features || product.material).includes("\n")
                    ? (product.features || product.material).split(/\r?\n/)
                    : (product.features || product.material).split(",")
                  ).map((s: string) => s.trim()).filter(Boolean).map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[13.5px] sm:text-[14px] font-medium text-[#2E1F31]">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#8B1D8F]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: SKU, What's Included, Care Instructions */}
          <div className="space-y-6">
            {product.sku && (
              <div>
                <h4 className="mt-0 mb-3 font-semibold text-[#1A0F1C] text-[14px] sm:text-[15px]">SKU / Barcode</h4>
                <div className="inline-block overflow-hidden rounded-xl border border-[#F0E6F2] bg-white p-2.5 sm:p-3 shadow-sm max-w-full">
                  <div className="overflow-x-auto">
                    <Barcode value={product.sku} width={1.2} height={35} fontSize={12} background="transparent" />
                  </div>
                </div>
              </div>
            )}

            {product.whatsIncluded && product.whatsIncluded.length > 0 && (
              <div>
                <h4 className="mt-0 mb-3 font-semibold text-[#1A0F1C] text-[14px] sm:text-[15px]">What&apos;s Included</h4>
                <ul className="space-y-2">
                  {(Array.isArray(product.whatsIncluded)
                    ? product.whatsIncluded.flatMap((item: string) => {
                      if (typeof item === "string" && item.startsWith("[")) {
                        try { return JSON.parse(item); } catch { return [item]; }
                      }
                      if (typeof item === "string" && item.includes(",")) {
                        return item.split(",").map((s: string) => s.trim()).filter(Boolean);
                      }
                      return [item];
                    })
                    : []
                  ).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[13.5px] sm:text-[14px] font-medium text-[#2E1F31]">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#8B1D8F]" />
                      <span>{typeof item === "string" ? item.replace(/^"|"$/g, "").trim() : item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.careInstructions && (
              <div>
                <h4 className="mt-0 mb-3 font-semibold text-[#1A0F1C] text-[14px] sm:text-[15px]">Care Instructions</h4>
                <p className="leading-relaxed text-[#2E1F31] whitespace-pre-wrap text-[13.5px] sm:text-[14px] font-medium mt-0">{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="mt-10 sm:mt-16 border-t border-[#F0E6F2] pt-8 sm:pt-12 md:mt-20">
        <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#1A0F1C] mb-6 sm:mb-8">Customer Reviews</h2>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-[1fr_1.5fr] lg:gap-12">
          {/* Review Stats & Add Review Form */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#F0E6F2] bg-[#FCF7FD]/40 p-6">
              <div className="flex items-center gap-4">
                <div className="text-[48px] font-bold text-[#1A0F1C]">{product.rating || 4.5}</div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4.5 w-4.5 ${i < Math.floor(product.rating || 4.5) ? "fill-[#F5A524] text-[#F5A524]" : "text-[#E8DDE9]"}`} />
                    ))}
                  </div>
                  <div className="text-[12.5px] text-[#8B7A8F] mt-1">Based on {reviewsList.length} reviews</div>
                </div>
              </div>
            </div>

            {/* Write a Review Form */}
            <div className="rounded-3xl border border-[#F0E6F2] bg-white p-6 shadow-sm">
              <h3 className="text-[16px] font-semibold text-[#1A0F1C] mb-4">Write a Costume Review</h3>

              {session?.user ? (
                <form onSubmit={handleAddReview} className="space-y-4">
                  {reviewError && (
                    <div className="text-[12px] font-medium text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">{reviewError}</div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-[#6B5A6F] hover:scale-110 transition"
                        >
                          <Star className={`h-6 w-6 ${star <= reviewRating ? "fill-[#F5A524] text-[#F5A524]" : "text-[#E8DDE9]"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[13px] font-medium text-[#4A354D]">Review Comment</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your feedback about the costume quality, sizing, and design..."
                      className="w-full rounded-xl border border-[#EEDDF0] p-3 text-[13px] focus:outline-[#8B1D8F] bg-white text-[#1A0F1C]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full rounded-full bg-[#8B1D8F] py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[#7A187C] disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 text-[13px] text-[#8B7A8F]">
                  <p>Please sign in to write a customer review.</p>
                  <Link href="/profile" className="mt-3 inline-block rounded-full bg-[#1A0F1C] px-5 py-1.5 text-[12px] font-semibold text-white hover:bg-black transition">
                    Go to Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {reviewsList.length === 0 ? (
              <div className="text-center py-12 rounded-3xl border border-dashed border-[#EEDDF0] bg-[#FCF7FD]/20">
                <p className="text-[14px] text-gray-400 italic">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              reviewsList.map((rev: any) => (
                <div key={rev._id} className="rounded-2xl border border-[#F0E6F2] p-5 hover:border-[#E1BFE6] transition bg-[#FFFCFE]">
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#8B1D8F] to-[#E91E7A] text-[12px] font-semibold text-white">
                        {rev.userName.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-bold text-[#1A0F1C]">{rev.userName}</div>
                        <div className="text-[11px] text-[#8B7A8F]">{new Date(rev.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-[#FCF7FD] px-2 py-0.5 rounded-full border border-[#F0E6F2]">
                      <Star className="h-3.5 w-3.5 fill-[#F5A524] text-[#F5A524]" />
                      <span className="text-[11.5px] font-bold text-[#1A0F1C]">{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#4A354D] leading-relaxed pr-6">"{rev.comment}"</p>

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="flex items-center gap-1 text-[11.5px] font-semibold text-red-500 hover:text-red-700 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Review (Admin)
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-10 sm:mt-16 border-t border-[#F0E6F2] pt-8 sm:pt-12 md:mt-24 md:pt-16">
        <div className="mb-5 sm:mb-6 flex items-baseline justify-between">
          <h2 className="text-[18px] sm:text-[22px] font-semibold tracking-tight text-[#1A0F1C] md:text-[26px]">You Might Also Like</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
          {allProducts
            .filter((p) => p.id !== product.id && p.category === product.category)
            .concat(allProducts.filter((p) => p.id !== product.id && p.category !== product.category))
            .slice(0, 4)
            .map((p) => (
              <div key={p.id} className="group relative w-full">
                <div className="overflow-hidden rounded-[20px] border border-[#B59CB9] bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#8B1D8F]/10">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#FCF7FD]">
                    <Link href={`/product/${p.slug || p.id}`}>
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    </Link>
                    <div className="absolute left-2.5 top-2.5 right-11 flex flex-wrap items-center gap-1.5">
                      <span
                        className="rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-medium leading-none text-[#6B146E] shadow-sm backdrop-blur max-w-[90px] sm:max-w-[130px] truncate inline-block"
                        title={p.category}
                      >
                        {p.category.includes(">") ? p.category.split(">").pop()?.trim() : p.category}
                      </span>
                      {p.tag && <span className="rounded-full bg-[#1A0F1C] px-2 py-1 text-[10.5px] font-medium leading-none text-white">{p.tag}</span>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(p.id);
                      }}
                      className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#6B5A6F] shadow-sm backdrop-blur transition-all hover:text-[#E91E7A]"
                    >
                      <Heart className={cn("h-4 w-4 transition", wishlist.includes(p.id) && "fill-[#E91E7A] text-[#E91E7A]")} />
                    </button>
                  </div>
                  <div className="p-3.5 flex flex-col h-full">
                    <Link href={`/product/${p.slug || p.id}`} className="line-clamp-1 text-[14px] font-medium text-[#2E1F31] hover:text-[#8B1D8F]">{p.title}</Link>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("h-3 w-3", i < Math.floor(p.rating) ? "fill-[#F5A524] text-[#F5A524]" : "text-[#E8DDE9]")} />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#8B7A8F]">{p.rating}</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-[16px] font-semibold text-[#1A0F1C]">₹{p.price}</span>
                      <span className="text-[12px] text-[#9A8A9D] line-through">₹{p.mrp}</span>
                      <span className="ml-auto text-[11px] font-medium text-[#0F8A4B]">{Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off</span>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(p); }}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#F3E7F5] bg-[#FCF7FD] py-2 text-[13px] font-medium text-[#8B1D8F] transition hover:bg-[#8B1D8F] hover:text-white"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6F2] p-5">
              <h3 className="text-[16px] font-semibold text-[#1A0F1C] flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-[#8B1D8F]" /> Size Chart & Guide
              </h3>
              <button onClick={() => setSizeGuideOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-[12.5px] text-[#6B5A6F] mb-4">Please measure your child's height and chest to select the perfect event costume size.</p>

              <table className="w-full border-collapse text-[13px] text-[#4A354D]">
                <thead>
                  <tr className="bg-[#FCF7FD] text-[#8B7A8F] font-semibold border-b border-[#EEDDF0]">
                    <th className="p-2.5 text-left">Age Group</th>
                    <th className="p-2.5 text-center">Standard Size</th>
                    <th className="p-2.5 text-right">Height</th>
                    <th className="p-2.5 text-right">Chest</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { age: "2-3 Years", size: "Size 24", height: "32 - 36 in", chest: "22 in" },
                    { age: "4-5 Years", size: "Size 26", height: "36 - 40 in", chest: "24 in" },
                    { age: "6-7 Years", size: "Size 28", height: "40 - 44 in", chest: "26 in" },
                    { age: "8-9 Years", size: "Size 30", height: "44 - 48 in", chest: "28 in" },
                    { age: "10-12 Years", size: "Size 32", height: "48 - 52 in", chest: "30 in" },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-[#F8F0F9] last:border-0 hover:bg-[#FCF7FD]/30">
                      <td className="p-2.5 font-medium text-[#1A0F1C]">{row.age}</td>
                      <td className="p-2.5 text-center font-semibold text-[#8B1D8F]">{row.size}</td>
                      <td className="p-2.5 text-right">{row.height}</td>
                      <td className="p-2.5 text-right">{row.chest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-5 rounded-xl bg-[#FCF7FD] p-3 text-[11.5px] text-gray-500 border border-[#F0E6F2]">
                <strong>Fitting Tip:</strong> If your child is between sizes, we recommend ordering one size larger for a comfortable, loose stage fit.
              </div>

              <button onClick={() => setSizeGuideOpen(false)} className="mt-6 w-full rounded-full bg-[#1A0F1C] py-3 text-[14px] font-semibold text-white hover:bg-black">
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
