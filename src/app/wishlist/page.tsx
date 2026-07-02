"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import toast from "react-hot-toast";

import { Heart, Star, ShoppingBag } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import Image from "next/image";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProductsList(data.products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);
  
  const wishlistedProducts = productsList.filter(p => wishlist.includes(p.id));

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-20 text-center md:py-32 text-[#8B7A8F]">
        <div className="mb-4 animate-spin rounded-full h-8 w-8 border-2 border-t-[#8B1D8F] border-r-transparent border-b-[#8B1D8F] border-l-transparent" />
        Loading wishlist...
      </div>
    );
  }
  if (wishlistedProducts.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-20 text-center md:py-32">
        <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-[#FCF7FD] text-[#E91E7A]">
          <Heart className="h-10 w-10" />
        </div>
        <h2 className="text-[24px] font-semibold text-[#1A0F1C]">Your wishlist is empty</h2>
        <p className="mt-2 text-[15px] text-[#6B5A6F]">Save your favorite costumes to review them later.</p>
        <Link href="/products" className="mt-8 rounded-full bg-[#8B1D8F] px-8 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#7A187C]">
          Explore Costumes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1A0F1C] md:text-[36px]">My Wishlist</h1>
          <p className="mt-2 text-[15px] text-[#6B5A6F]">{wishlistedProducts.length} items saved</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {wishlistedProducts.map((p) => (
          <div key={p.id} className="group relative w-full shrink-0">
            <div className="overflow-hidden rounded-[20px] border border-[#B59CB9] bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#8B1D8F]/10">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#FCF7FD]">
                <Link href={`/product/${p.slug || p.id}`} className="block h-full w-full">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </Link>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }} 
                  className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#E91E7A] shadow-sm backdrop-blur transition-all hover:scale-110"
                >
                  <Heart className="h-4 w-4 fill-[#E91E7A]" />
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
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-[16px] font-semibold text-[#1A0F1C]">₹{p.price}</span>
                  <span className="text-[12px] text-[#9A8A9D] line-through">₹{p.mrp}</span>
                </div>
                {p.sizes && p.sizes.length > 0 && (
                  <div className="mt-3">
                    <select
                      value={selectedSizes[p.id] || ""}
                      onChange={(e) => setSelectedSizes({ ...selectedSizes, [p.id]: e.target.value })}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="w-full h-8 rounded-lg border border-[#B59CB9] bg-white px-2 text-[12px] text-[#4A354D] outline-none"
                    >
                      <option value="" disabled>Select Size</option>
                      {p.sizes.map((s: any, sIdx: number) => {
                        const sizeVal = typeof s === "object" && s !== null ? s.size : s;
                        const isStockOut = typeof s === "object" && s !== null ? s.stock <= 0 : false;
                        return (
                          <option key={sIdx} value={sizeVal} disabled={isStockOut}>
                            {sizeVal} {isStockOut ? '(Out of stock)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    if (p.sizes && p.sizes.length > 0 && !selectedSizes[p.id]) {
                      toast.error("Please select a size first");
                      return;
                    }
                    addToCart(p, p.sizes && p.sizes.length > 0 ? selectedSizes[p.id] : undefined); 
                    toggleWishlist(p.id); 
                  }} 
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#F3E7F5] bg-[#FCF7FD] py-2 text-[13px] font-medium text-[#8B1D8F] transition hover:bg-[#8B1D8F] hover:text-white"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Move to cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
