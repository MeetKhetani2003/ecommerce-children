"use client";

import { useState } from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { products } from "@/data/mockData";
import { Star, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, ChevronRight, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

const ImageMagnifier = ({ src, alt }: { src: string, alt: string }) => {
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
      <img src={src} alt={alt} className="h-full w-full object-cover transition-opacity duration-300" />
      {showMagnifier && (
        <div 
          className="pointer-events-none absolute inset-0 z-20 bg-white"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: '250%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};

export default function ProductSlug() {
  const { id } = useParams();
  const router = useRouter();
  const product = products.find(p => p.id === Number(id));
  const { addToCart, wishlist, toggleWishlist } = useShop();
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Size guide modal state
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

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

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-[#1A0F1C]">Product not found</h2>
        <Link href="/" className="mt-4 text-[#8B1D8F] hover:underline">Return to Home</Link>
      </div>
    );
  }

  const handleBulkInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        })
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

  const isWishlisted = wishlist.includes(product.id);
  const images = product.images || [product.image];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center text-[13px] text-[#8B7A8F]">
        <Link href="/" className="hover:text-[#8B1D8F]">Home</Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="cursor-pointer hover:text-[#8B1D8F]">{product.category}</span>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="font-medium text-[#2E1F31]">{product.title}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12 lg:grid-cols-[1.2fr_1fr]">
        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-[#FCF7FD]">
            <ImageMagnifier src={images[activeImage]} alt={product.title} />
            <button 
              onClick={() => toggleWishlist(product.id)} 
              className="absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#6B5A6F] shadow-sm backdrop-blur transition-all hover:text-[#E91E7A]"
            >
              <Heart className={`h-5 w-5 transition ${isWishlisted ? "fill-[#E91E7A] text-[#E91E7A]" : ""}`} />
            </button>
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-[4/5] overflow-hidden rounded-xl border-2 transition-all ${
                    activeImage === idx ? "border-[#8B1D8F]" : "border-transparent hover:border-[#E8DDE9]"
                  }`}
                >
                  <img src={img} alt={`${product.title} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                  {activeImage !== idx && <div className="absolute inset-0 bg-white/20"></div>}
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
          
          <h1 className="text-[28px] font-semibold leading-tight text-[#1A0F1C] md:text-[36px]">{product.title}</h1>
          
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-[#F5A524] text-[#F5A524]" : "text-[#E8DDE9]"}`} />
              ))}
            </div>
            <span className="text-[14px] text-[#8B7A8F]">{product.rating} (128 reviews)</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3 border-b border-[#F0E6F2] pb-6">
            <span className="text-[32px] font-bold text-[#1A0F1C]">₹{product.price}</span>
            <span className="text-[18px] text-[#9A8A9D] line-through">₹{product.mrp}</span>
            <span className="rounded bg-[#E8F5E9] px-2 py-1 text-[13px] font-bold text-[#0F8A4B]">
              {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[15px] leading-relaxed text-[#5E4F63]">{product.description}</p>
          </div>

          {/* Sizes */}
          {(product as any).sizes && (
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-medium text-[#1A0F1C]">Select Size</h3>
                <button onClick={() => setSizeGuideOpen(true)} className="text-[13px] font-medium text-[#8B1D8F] hover:underline focus:outline-none">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {(product as any).sizes.map((size: string) => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-5 py-2.5 text-[14px] transition-all focus:outline-none ${
                      selectedSize === size 
                        ? "border-[#8B1D8F] bg-[#F3E7F5] text-[#7A187C] font-medium" 
                        : "border-[#E8DDE9] text-[#5E4F63] hover:border-[#8B1D8F] hover:text-[#8B1D8F]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button 
              onClick={() => addToCart(product)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#1A0F1C] py-4 text-[15px] font-medium text-white transition hover:bg-black"
            >
              <ShoppingBag className="h-5 w-5" /> Add to Cart
            </button>
            <button 
              onClick={() => {
                addToCart(product);
                router.push("/cart");
              }}
              className="flex items-center justify-center gap-2 rounded-full bg-[#8B1D8F] py-4 text-[15px] font-medium text-white transition hover:bg-[#7A187C]"
            >
              Buy Now
            </button>
          </div>

          {/* Bulk Order Inquiry Section */}
          <div className="mt-8 rounded-2xl border border-dashed border-[#E1BFE6] bg-[#FCF7FD]/50 p-5">
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
                <div className="grid grid-cols-2 gap-3">
                  <input required type="text" placeholder="Your Name" value={bulkName} onChange={(e)=>setBulkName(e.target.value)} className="h-9 rounded-lg border border-[#EEDDF0] bg-white px-3 text-[12.5px] outline-none" />
                  <input required type="email" placeholder="Your Email" value={bulkEmail} onChange={(e)=>setBulkEmail(e.target.value)} className="h-9 rounded-lg border border-[#EEDDF0] bg-white px-3 text-[12.5px] outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input required type="tel" placeholder="Phone Number" value={bulkPhone} onChange={(e)=>setBulkPhone(e.target.value)} className="h-9 rounded-lg border border-[#EEDDF0] bg-white px-3 text-[12.5px] outline-none" />
                  <div className="flex gap-2 items-center">
                    <input required type="number" min={10} placeholder="Qty" value={bulkQty} onChange={(e)=>setBulkQty(e.target.value)} className="h-9 w-14 rounded-lg border border-[#EEDDF0] bg-white px-2 text-[12.5px] outline-none text-center" />
                    <input required type="text" placeholder="Event Date" value={bulkDate} onChange={(e)=>setBulkDate(e.target.value)} className="h-9 flex-1 rounded-lg border border-[#EEDDF0] bg-white px-2 text-[12.5px] outline-none" />
                  </div>
                </div>
                <textarea required rows={2} placeholder="Custom sizes, custom requirements, event details..." value={bulkMsg} onChange={(e)=>setBulkMsg(e.target.value)} className="w-full rounded-lg border border-[#EEDDF0] bg-white p-2.5 text-[12.5px] outline-none" />
                
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
          <div className="mt-10 grid grid-cols-1 gap-4 rounded-2xl border border-[#F0E6F2] bg-[#FCF7FD] p-5 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <Truck className="h-6 w-6 text-[#8B1D8F]" />
              <span className="text-[13px] font-medium text-[#2E1F31]">Fast Delivery</span>
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

          {/* Product Details Section */}
          <div className="mt-10 border-t border-[#F0E6F2] pt-8">
            <h3 className="mb-5 text-[18px] font-semibold text-[#1A0F1C]">Product Details</h3>
            
            <dl className="grid gap-y-6 gap-x-4 text-[14px] sm:grid-cols-2">
              {(product as any).material && (
                <div>
                  <dt className="mb-1 font-medium text-[#8B7A8F]">Material</dt>
                  <dd className="font-medium text-[#2E1F31]">{(product as any).material}</dd>
                </div>
              )}
              {(product as any).whatsIncluded && (
                <div>
                  <dt className="mb-1 font-medium text-[#8B7A8F]">What's Included</dt>
                  <dd className="font-medium text-[#2E1F31]">{(product as any).whatsIncluded.join(", ")}</dd>
                </div>
              )}
              {(product as any).careInstructions && (
                <div className="sm:col-span-2">
                  <dt className="mb-1 font-medium text-[#8B7A8F]">Care Instructions</dt>
                  <dd className="leading-relaxed text-[#2E1F31]">{(product as any).careInstructions}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-16 border-t border-[#F0E6F2] pt-12 md:mt-24 md:pt-16">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#1A0F1C] md:text-[26px]">You Might Also Like</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
          {products
            .filter((p) => p.id !== product.id && p.category === product.category)
            .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
            .slice(0, 4)
            .map((p) => (
              <div key={p.id} className="group relative w-full">
                <div className="overflow-hidden rounded-[20px] border border-[#F0E6F2] bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#8B1D8F]/10">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#FCF7FD]">
                    <Link href={`/product/${p.id}`}>
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    </Link>
                    <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                      <span className="rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-medium leading-none text-[#6B146E] shadow-sm backdrop-blur">{p.category}</span>
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
                    <Link href={`/product/${p.id}`} className="line-clamp-1 text-[14px] font-medium text-[#2E1F31] hover:text-[#8B1D8F]">{p.title}</Link>
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

