"use client";

import { useState, useMemo, useEffect } from "react";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import { Filter, Star, Heart, ShoppingBag, ChevronDown, Search } from "lucide-react";
import { useShop } from "@/context/ShopContext";

const categoryGroups = [
  {
    title: "Nature & Animals",
    categories: [
      "Animal Costume",
      "Birds Costume",
      "Insect Costume",
      "Water Animals Costume",
      "Fruit Costume",
      "Vegetable Costume",
      "Flower Costume",
    ]
  },
  {
    title: "Cultural & Patriotic",
    categories: [
      "Indian State Costume",
      "Indian Mythology Costume",
      "Indian Dance Costume",
      "Republic Day / Independence Day",
      "National Heroes",
      "Halloween Costumes",
    ]
  },
  {
    title: "Characters & Helpers",
    categories: [
      "Super Heroes",
      "Cartoon Characters Costume",
      "Our Helpers",
      "Community Helpers",
    ]
  },
  {
    title: "Accessories & Offers",
    categories: [
      "Caps / Hats / Safa / Pagdi",
      "Face Masks",
      "Hair Wigs",
      "Silver / Golden Jewellery",
      "Umbrella / Fans",
      "Offer Products",
    ]
  }
];

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");
import { Suspense } from "react";

export default function Products() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams ? searchParams.get("category") : null;
  const activeCategory = categoryParam || "All";
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);
  
  const [activeAges, setActiveAges] = useState<string[]>([]);
  const [activePrices, setActivePrices] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  
  const handleMobileFilterAction = () => {
    if (window.innerWidth < 768) {
      setShowFilters(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  const { wishlist, toggleWishlist, addToCart } = useShop();

  const filteredProducts = useMemo(() => {
    let result = productsList;
    if (activeCategory !== "All") {
      result = result.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    
    if (activeAges.length > 0) {
      // Mock filtering for age based on tags or description as mock data doesn't have explicit age fields
      // In a real app this would filter by actual age field
    }
    
    if (activePrices.length > 0) {
      result = result.filter(p => {
        if (activePrices.includes("Under ₹500") && p.price < 500) return true;
        if (activePrices.includes("₹500 - ₹1000") && p.price >= 500 && p.price <= 1000) return true;
        if (activePrices.includes("Over ₹1000") && p.price > 1000) return true;
        return false;
      });
    }
    
    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [productsList, activeCategory, sortBy, activeAges, activePrices]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <div className="mb-8 md:flex md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1A0F1C] md:text-[36px]">
            {activeCategory === "All" ? "All Costumes" : activeCategory}
          </h1>
          <p className="mt-2 text-[15px] text-[#6B5A6F]">
            {filteredProducts.length} items found
          </p>
        </div>
        
        <div className="mt-6 flex items-center gap-3 md:mt-0">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-full border border-[#EEDDF0] bg-white px-4 py-2.5 text-[14px] font-medium text-[#4A354D] transition hover:bg-[#FCF7FD] md:hidden"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
          
          <div className="relative ml-auto md:ml-0">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-full border border-[#EEDDF0] bg-white py-2.5 pl-4 pr-10 text-[14px] font-medium text-[#4A354D] outline-none transition focus:border-[#E1BFE6] focus:ring-4 focus:ring-[#F3E7F5]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B7A8F]" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Filters Sidebar */}
        <aside className={cn(
          "w-full shrink-0 md:w-[240px] md:block",
          showFilters ? "block" : "hidden"
        )}>
          <div className="rounded-[24px] border border-[#F0E6F2] bg-white p-5">
            <h3 className="mb-4 text-[15px] font-semibold text-[#1A0F1C]">Categories</h3>
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
              {/* All Costumes */}
              <button
                onClick={() => {
                  router.push("/products");
                  handleMobileFilterAction();
                }}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-[14px] transition font-medium",
                  activeCategory === "All" 
                    ? "bg-[#F3E7F5] text-[#8B1D8F]" 
                    : "text-[#4A354D] hover:bg-[#FCF7FD]"
                )}
              >
                All Costumes
              </button>

              {/* Grouped Categories */}
              {categoryGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="text-[11.5px] font-bold uppercase tracking-wider text-[#8B1D8F]/80 px-3 py-1 bg-[#FCF7FD]/50 rounded-lg">
                    {group.title}
                  </div>
                  <ul className="space-y-0.5 pl-2 border-l border-[#F3E7F5] ml-1">
                    {group.categories.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => {
                            router.push(`/products?category=${encodeURIComponent(cat)}`);
                            handleMobileFilterAction();
                          }}
                          className={cn(
                            "w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition",
                            activeCategory.toLowerCase() === cat.toLowerCase()
                              ? "bg-[#F3E7F5]/70 font-semibold text-[#8B1D8F]" 
                              : "text-[#6B5A6F] hover:bg-[#FCF7FD] hover:text-[#8B1D8F]"
                          )}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="mt-8 border-t border-[#F0E6F2] pt-6">
              <h3 className="mb-4 text-[15px] font-semibold text-[#1A0F1C]">Age Group</h3>
              <ul className="space-y-2">
                {["0-2 Years", "3-5 Years", "6-8 Years", "9-12 Years"].map(age => (
                  <li key={age}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={activeAges.includes(age)}
                        onChange={() => {
                          setActiveAges(prev => prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]);
                          handleMobileFilterAction();
                        }}
                        className="h-4 w-4 rounded border-[#EEDDF0] text-[#8B1D8F] focus:ring-[#8B1D8F]" 
                      />
                      <span className="text-[14px] text-[#4A354D]">{age}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-8 border-t border-[#F0E6F2] pt-6">
              <h3 className="mb-4 text-[15px] font-semibold text-[#1A0F1C]">Price</h3>
              <ul className="space-y-2">
                {["Under ₹500", "₹500 - ₹1000", "Over ₹1000"].map(price => (
                  <li key={price}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={activePrices.includes(price)}
                        onChange={() => {
                          setActivePrices(prev => prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]);
                          handleMobileFilterAction();
                        }}
                        className="h-4 w-4 rounded border-[#EEDDF0] text-[#8B1D8F] focus:ring-[#8B1D8F]" 
                      />
                      <span className="text-[14px] text-[#4A354D]">{price}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#F0E6F2] bg-white py-20 text-center text-[#8B7A8F]">
              <div className="mb-4 animate-spin rounded-full h-8 w-8 border-2 border-t-[#8B1D8F] border-r-transparent border-b-[#8B1D8F] border-l-transparent" />
              Loading costumes...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#F0E6F2] bg-white py-20 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#FCF7FD] text-[#A38AA6]">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-[18px] font-medium text-[#1A0F1C]">No costumes found</h3>
              <p className="mt-2 text-[14px] text-[#6B5A6F]">Try selecting a different category or filter.</p>
              <button 
                onClick={() => { router.push("/products"); }}
                className="mt-6 rounded-full bg-[#1A0F1C] px-6 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#8B1D8F]"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p) => (
                <div key={p.id} className="group relative w-full shrink-0">
                  <div className="overflow-hidden rounded-[20px] border border-[#F0E6F2] bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#8B1D8F]/10">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#FCF7FD]">
                      <Link href={`/product/${p.id}`}>
                        <img src={p.image} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      </Link>
                      <div className="absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-medium leading-none text-[#6B146E] shadow-sm backdrop-blur">{p.category}</span>
                        {p.tag && <span className="rounded-full bg-[#1A0F1C] px-2 py-1 text-[10.5px] font-medium leading-none text-white">{p.tag}</span>}
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }} 
                        className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#6B5A6F] shadow-sm backdrop-blur transition-all hover:text-[#E91E7A]"
                      >
                        <Heart className={cn("h-4 w-4 transition", wishlist.includes(p.id) && "fill-[#E91E7A] text-[#E91E7A]")} />
                      </button>
                    </div>
                    <div className="p-3.5">
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
          )}
        </div>
      </div>
    </div>
  );
}
