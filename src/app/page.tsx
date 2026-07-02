"use client";

import { useEffect, useState, useRef } from "react";
import Link from 'next/link';

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, RotateCcw, Sparkles, IndianRupee, ArrowRight, Check, Heart, ShoppingBag } from "lucide-react";
import { heroSlides, categories, testimonials } from "@/data/mockData";
import { useShop } from "@/context/ShopContext";
import toast from "react-hot-toast";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" } as any
};

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const carouselRef = useRef<HTMLDivElement>(null);
  const testimonialCarouselRef = useRef<HTMLDivElement>(null);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});

  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [banners, setBanners] = useState<any[]>(heroSlides); // Fallback to mock data initially

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [prodRes, bannerRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/admin/banners")
        ]);

        const [prodData, bannerData] = await Promise.all([
          prodRes.json(),
          bannerRes.json()
        ]);

        if (prodData.success) setProductsList(prodData.products);
        if (bannerData.success && bannerData.banners.length > 0) {
          const activeBanners = bannerData.banners.filter((b: any) => b.active);
          if (activeBanners.length > 0) {
            setBanners(activeBanners);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchInitialData();
  }, []);

  const scrollTestimonialCarousel = (dir: "left" | "right") => {
    if (!testimonialCarouselRef.current) return;
    const amount = testimonialCarouselRef.current.clientWidth * 0.8;
    testimonialCarouselRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((s) => (s + 1) % banners.length);
    }, 5500);
    return () => clearInterval(id);
  }, [banners.length]);

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.8;
    carouselRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const getRealAgeProductImage = (ageGroup: string, fallbackImg: string) => {
    const matchedProduct = productsList.find((p: any) => {
      if (!p.sizes || p.sizes.length === 0) return false;
      return p.sizes.some((sz: any) => {
        const sizeStr = typeof sz === "string" ? sz : sz?.size || "";
        const numMatch = sizeStr.match(/\d+/);
        if (!numMatch) return false;
        const firstAge = parseInt(numMatch[0]);
        if (ageGroup === "0-2 Years") {
          return firstAge <= 2;
        } else if (ageGroup === "3-5 Years") {
          return firstAge >= 3 && firstAge <= 5;
        } else if (ageGroup === "6-8 Years") {
          return firstAge >= 6 && firstAge <= 8;
        } else if (ageGroup === "9-12 Years") {
          return firstAge >= 9 && firstAge <= 13;
        }
        return false;
      });
    });
    return matchedProduct ? matchedProduct.image : fallbackImg;
  };

  return (
    <>
      {/* Hero */}
      <section className="relative mx-auto max-w-[1240px] px-4 pt-5 md:pt-7">
        <div className="relative">
          <div className="relative h-[68vh] min-h-[520px] w-full overflow-hidden rounded-[28px] bg-[#1A0F1C] md:h-[76vh] md:min-h-[580px] md:rounded-[32px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-[#1A0F1C]/20 mix-blend-multiply" />
                <img src={banners[activeSlide].image} alt="" className="h-full w-full object-cover" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="w-full px-5 pb-10 pt-20 md:px-12 md:pb-0">
                <div className="max-w-[620px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeSlide} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                      {(banners[activeSlide].eyebrow || banners[activeSlide].badge) && (
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-md">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FFB3E0]" />
                          {banners[activeSlide].eyebrow && <span className="text-[11px] font-medium uppercase tracking-wider text-white/90">{banners[activeSlide].eyebrow}</span>}
                          {banners[activeSlide].badge && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">{banners[activeSlide].badge}</span>}
                        </div>
                      )}
                      <h1 className="text-[32px] font-semibold leading-[1.1] tracking-tight text-white md:text-[48px]">{banners[activeSlide].title}</h1>
                      <p className="mt-3 max-w-[520px] text-[14.5px] leading-relaxed text-white/85 md:text-[16px]">{banners[activeSlide].subtitle}</p>
                      <div className="mt-6 flex items-center gap-3">
                        <Link href={banners[activeSlide].ctaLink || "/products"} className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-[12px] text-[14px] font-medium text-[#6B146E] transition hover:shadow-lg hover:shadow-white/20">
                          <span className="relative z-10">{banners[activeSlide].ctaText || banners[activeSlide].cta || "Shop Now"}</span>
                          <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          <span className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-[#F3E7F5] to-[#FFE4F2] transition-transform duration-300 group-hover:translate-y-0" />
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-5 right-5 flex items-center gap-2 md:bottom-7 md:right-7">
              <button onClick={() => setActiveSlide((s) => (s - 1 + banners.length) % banners.length)} className="grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setActiveSlide((s) => (s + 1) % banners.length)} className="grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 md:bottom-7">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setActiveSlide(i)} className={cn("h-[3px] rounded-full transition-all", i === activeSlide ? "w-8 bg-white" : "w-5 bg-white/40 hover:bg-white/70")} />
              ))}
            </div>
          </div>

          {/* Floating stats */}
          <div className="pointer-events-none absolute -bottom-6 left-5 right-5 z-10 hidden md:block">
            <div className="mx-auto grid max-w-[1000px] grid-cols-3 gap-3">
              {[
                { label: "Costumes Delivered", value: "47,200+" },
                { label: "School Events Covered", value: "1,200+" },
                { label: "Parent Rating", value: "4.8/5" },
              ].map((s) => (
                <div key={s.label} className="pointer-events-auto rounded-2xl border border-white/20 bg-white/85 px-5 py-3 shadow-xl shadow-black/10 backdrop-blur-xl">
                  <div className="text-[11px] uppercase tracking-wide text-[#8B5A91]">{s.label}</div>
                  <div className="text-[18px] font-semibold text-[#4A1D4E]">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <motion.section {...fadeInUp} className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {[
            { icon: Truck, title: "Next-Day Delivery", desc: "Metro cities" },
            { icon: ShieldCheck, title: "Premium Fabrics", desc: "Kid-safe & soft" },
            { icon: RotateCcw, title: "Easy Returns", desc: "7-day policy" },
            { icon: IndianRupee, title: "COD Available", desc: "Pan India" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-[#F3E7F5] bg-[#FFFCFE] p-3.5 transition hover:border-[#EEDDF0] hover:bg-white md:p-4">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#F8F0F9] to-[#F3E7F5] text-[#8B1D8F]">
                <item.icon className="h-[18px] w-[18px]" />
              </div>
              <div>
                <div className="text-[13.5px] font-medium leading-tight text-[#2E1F31]">{item.title}</div>
                <div className="text-[12px] text-[#7D6A80]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Featured Products */}
      <motion.section {...fadeInUp} className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[22px] font-semibold tracking-tight text-[#1A0F1C] md:text-[26px]">Featured This Week</h2>
              <span className="rounded-full bg-[#F3E7F5] px-2.5 py-1 text-[11px] font-medium text-[#7A187C]">Curated for school events</span>
            </div>
            <p className="mt-1 text-[13.5px] text-[#6B5A6F]">Most loved costumes by parents across India</p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={() => scrollCarousel("left")} className="grid h-9 w-9 place-items-center rounded-full border border-[#EEDDF0] text-[#6B5A6F] transition hover:bg-[#FCF7FD]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scrollCarousel("right")} className="grid h-9 w-9 place-items-center rounded-full border border-[#EEDDF0] text-[#6B5A6F] transition hover:bg-[#FCF7FD]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={carouselRef} className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-4 [&::-webkit-scrollbar]:hidden">
          {loadingProducts ? (
            <div className="flex w-full items-center justify-center py-20 text-[14px] text-[#8B7A8F]">
              <div className="mr-2 animate-spin rounded-full h-5 w-5 border-2 border-t-[#8B1D8F] border-r-transparent border-b-[#8B1D8F] border-l-transparent" />
              Loading featured costumes...
            </div>
          ) : productsList.filter((p: any) => p.featured).length === 0 ? (
            <div className="flex w-full items-center justify-center py-20 text-[14px] text-[#8B7A8F]">
              No featured costumes available right now. Check back later!
            </div>
          ) : (
            productsList.filter((p: any) => p.featured).map((p) => (
              <motion.div key={p.id} whileHover={{ y: -4 }} className="group relative w-[210px] shrink-0 snap-start md:w-[242px]">
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
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }} className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#6B5A6F] shadow-sm backdrop-blur transition-all hover:text-[#E91E7A]">
                      <Heart className={cn("h-4 w-4 transition", wishlist.includes(p.id) && "fill-[#E91E7A] text-[#E91E7A]")} />
                    </button>
                  </div>
                  <div className="p-3.5">
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
                    {p.sizes && p.sizes.length > 0 && (
                      <div className="mt-3">
                        <select
                          value={selectedSizes[p.id] || ""}
                          onChange={(e) => setSelectedSizes({ ...selectedSizes, [p.id]: e.target.value })}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className="w-full h-8 rounded-lg border border-[#B59CB9] bg-white px-2 text-[12px] text-[#4A354D] outline-none"
                        >
                          <option value="" disabled>Select Size</option>
                          {p.sizes.map((s: any) => (
                            <option key={s.size} value={s.size} disabled={s.stock <= 0}>
                              {s.size} {s.stock <= 0 ? '(Out of stock)' : ''}
                            </option>
                          ))}
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
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#F3E7F5] bg-[#FCF7FD] py-2 text-[13px] font-medium text-[#8B1D8F] transition hover:bg-[#8B1D8F] hover:text-white"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* Promo Banner */}
      <motion.section {...fadeInUp} className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="relative overflow-hidden rounded-[28px] border border-[#F0E6F2] bg-gradient-to-r from-[#FCF7FD] via-[#FFF8FB] to-[#F8F4FA] p-[1px]">
          <div className="relative grid grid-cols-1 items-center gap-6 rounded-[27px] bg-white/70 px-6 py-8 backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-10">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1A0F1C] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
                <Sparkles className="h-3 w-3 text-yellow-400 fill-yellow-400" /> Stage-Ready Costumes
              </div>
              <h3 className="mt-3 text-[24px] font-semibold leading-tight tracking-tight text-[#1A0F1C] md:text-[30px]">Premium Stage & Event Costumes</h3>
              <p className="mt-2 max-w-[520px] text-[14px] leading-relaxed text-[#5E4F63]">Discover our top-rated, highly detailed costumes crafted with soft, breathable fabrics and complete accessory sets to ensure your child looks and feels their best on stage.</p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <Link href="/products" className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1D8F] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-md shadow-[#8B1D8F]/20 transition hover:bg-[#7A187C]">
                  Explore Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2 text-[12.5px] text-[#6B5A6F]">
                  <Check className="h-4 w-4 text-[#0F8A4B]" /> Premium Quality
                  <span className="h-1 w-1 rounded-full bg-[#D8C9DB]" />
                  <Check className="h-4 w-4 text-[#0F8A4B]" /> stage-ready accessories
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                {loadingProducts ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="aspect-[3/4] overflow-hidden rounded-2xl border border-[#F0E6F2] bg-gray-100 animate-pulse shadow-sm" />
                  ))
                ) : (
                  productsList.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug || p.id}`}
                      className="group/item relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#F0E6F2] bg-white shadow-sm hover:border-[#8B1D8F] transition-all duration-300 hover:shadow-md block"
                    >
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-left">
                        <div className="line-clamp-1 text-[11px] font-semibold text-white group-hover/item:text-[#F3E7F5] transition-colors">{p.title}</div>
                        <div className="text-[10px] font-bold text-[#E91E7A]">₹{p.price}</div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="pointer-events-none absolute -inset-6 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(139,29,143,0.15),_transparent_60%)] blur-2xl" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Categories */}
      <motion.section {...fadeInUp} className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-[22px] font-semibold tracking-tight md:text-[26px]">Shop by Category</h2>
          <Link href="/products" className="text-[13.5px] font-medium text-[#8B1D8F] hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {categories.slice(0, 6).map((c, idx) => {
            const realProduct = productsList.find((p: any) => {
              const productCat = p.category || "";
              return productCat.toLowerCase() === c.name.toLowerCase() ||
                     productCat.toLowerCase().includes(c.name.toLowerCase());
            });
            const displayImage = realProduct ? realProduct.image : (productsList[idx % productsList.length]?.image || c.image);
            return (
              <Link key={c.name} href={`/products?category=${c.name}`} className="group relative overflow-hidden rounded-[20px] border border-[#B59CB9] bg-white">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={displayImage} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3.5">
                  <div className="text-[15px] font-medium text-white">{c.name}</div>
                  <div className="text-[11.5px] text-white/80">{c.count}</div>
                </div>
                <div className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 opacity-0 backdrop-blur transition group-hover:opacity-100">
                  <ArrowRight className="h-3.5 w-3.5 text-[#1A0F1C]" />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.section>

      {/* Shop by Age */}
      <motion.section {...fadeInUp} className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <h2 className="mb-5 text-[22px] font-semibold tracking-tight text-[#1A0F1C] md:text-[26px]">Shop by Age</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[
            { age: "0-2 Years", label: "Toddlers", img: "https://images.pexels.com/photos/8506372/pexels-photo-8506372.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400" },
            { age: "3-5 Years", label: "Preschoolers", img: "https://images.pexels.com/photos/31625368/pexels-photo-31625368.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400" },
            { age: "6-8 Years", label: "Kids", img: "https://images.pexels.com/photos/34322336/pexels-photo-34322336.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400" },
            { age: "9-12 Years", label: "Pre-teens", img: "https://images.pexels.com/photos/14211426/pexels-photo-14211426.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400" },
          ].map((item, idx) => {
            const fallbackProductImg = productsList[(idx + 2) % productsList.length]?.image || item.img;
            const displayImage = getRealAgeProductImage(item.age, fallbackProductImg);
            return (
              <Link key={item.age} href={`/products`} className="group relative overflow-hidden rounded-[20px] bg-[#FCF7FD]">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <img src={displayImage} alt={item.age} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="text-[18px] font-bold text-white">{item.age}</div>
                  <div className="text-[13px] font-medium text-white/80">{item.label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.section>

      {/* Parent Favorites */}
      <motion.section {...fadeInUp} className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-[#F0E6F2] bg-[#1A0F1C]">
            <img src="https://images.pexels.com/photos/8501698/pexels-photo-8501698.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=800" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.35]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A0F1C] via-[#1A0F1C]/80 to-transparent" />
            <div className="relative p-7 md:p-10">
              <h3 className="max-w-[420px] text-[24px] font-semibold leading-tight text-white md:text-[28px]">Why 12,000+ parents choose Saheli Shrungar</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { title: "Soft & Safe", desc: "Hypoallergenic fabrics" },
                  { title: "Perfect Fit", desc: "Age-wise sizing guide" },
                  { title: "Complete Sets", desc: "No last-minute runs" },
                ].map((f) => (
                  <div key={f.title} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                    <div className="text-[14px] font-medium text-white">{f.title}</div>
                    <div className="mt-0.5 text-[12.5px] text-white/75">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              { title: "Independence Day Costume", desc: "Tricolor sets, freedom fighters", color: "from-[#FF9933]/20 to-[#138808]/20", href: "/products?category=Independence%20Day%20Costume" },
              { title: "Halloween Specials", desc: "Cute, not scary. Parent-approved", color: "from-[#8B1D8F]/20 to-[#E91E7A]/20", href: "/products?category=Halloween%20Costumes" },
            ].map((b) => (
              <div key={b.title} className="relative overflow-hidden rounded-[24px] border border-[#F0E6F2] bg-white p-6">
                <div className={cn("pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl", b.color)} />
                <div className="relative">
                  <div className="text-[17px] font-semibold text-[#1A0F1C]">{b.title}</div>
                  <div className="mt-1 text-[13.5px] text-[#6B5A6F]">{b.desc}</div>
                  <Link href={b.href} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[#8B1D8F] hover:gap-1.5">Explore <ArrowRight className="h-3.5 w-3.5 transition-all" /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* The Saheli Difference */}
      <motion.section {...fadeInUp} className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="overflow-hidden rounded-[32px] bg-[#FCF7FD] md:grid md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-14 lg:p-20">
            <h2 className="text-[28px] font-bold leading-tight text-[#1A0F1C] md:text-[36px]">
              Crafted for Comfort,<br /> Designed to Shine.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5E4F63]">
              We know that an itchy costume ruins the fun. That's why every Saheli Shrungar outfit is lined with breathable cotton, ensuring your child can perform, play, and celebrate in complete comfort.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "100% kid-safe, hypoallergenic materials",
                "Authentic detailing and traditional craftsmanship",
                "Durable stitching for multiple wears",
                "Hassle-free, easy-to-wear designs"
              ].map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-[14px] font-medium text-[#2E1F31]">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#0F8A4B]">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <a href="#" className="inline-flex rounded-full bg-[#1A0F1C] px-6 py-3.5 text-[14px] font-medium text-white transition hover:bg-[#8B1D8F]">
                Learn About Our Process
              </a>
            </div>
          </div>
          <div className="relative h-64 w-full md:h-auto">
            <img src="https://images.pexels.com/photos/18139756/pexels-photo-18139756.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1000&h=1200" alt="Craftsmanship" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </motion.section>      {/* Testimonials */}
      <motion.section {...fadeInUp} className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[22px] font-semibold tracking-tight text-[#1A0F1C] md:text-[26px]">Loved by Parents</h2>
              <span className="flex items-center gap-1 rounded-full bg-[#EBF3FE] px-2.5 py-1 text-[11px] font-medium text-[#2A75E9]">
                <svg className="h-3 w-3" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.64 15.01 1 12 1 7.24 1 3.2 3.74 1.25 7.74l3.83 2.97C6.01 7.27 8.78 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.86c2.16-1.99 3.4-4.92 3.4-8.54z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.08 14.73c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1L1.25 7.56C.45 9.17 0 10.97 0 12.87c0 1.9.45 3.7 1.25 5.31l3.83-3.45z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.02.68-2.33 1.09-4.27 1.09-3.22 0-5.99-2.23-6.96-5.26l-3.83 2.97C3.2 20.26 7.24 23 12 23z"
                  />
                </svg>
                Google Verified
              </span>
            </div>
            <p className="mt-1 text-[13.5px] text-[#6B5A6F]">4.8/5 average rating based on 3,241 customer reviews</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollTestimonialCarousel("left")} className="grid h-9 w-9 place-items-center rounded-full border border-[#EEDDF0] text-[#6B5A6F] transition hover:bg-[#FCF7FD]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scrollTestimonialCarousel("right")} className="grid h-9 w-9 place-items-center rounded-full border border-[#EEDDF0] text-[#6B5A6F] transition hover:bg-[#FCF7FD]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={testimonialCarouselRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((t) => (
            <div key={t.name} className="group relative w-[285px] shrink-0 snap-start md:w-[360px] rounded-[24px] border border-[#F0E6F2] bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#F5A524] text-[#F5A524]" />
                  ))}
                </div>
                {/* Google Verified Review Icon Badge */}
                <div className="flex items-center gap-1 rounded-full bg-[#F0F6FF] px-2.5 py-0.5 text-[10.5px] font-medium text-[#2A75E9]">
                  <svg className="h-3 w-3" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.64 15.01 1 12 1 7.24 1 3.2 3.74 1.25 7.74l3.83 2.97C6.01 7.27 8.78 5.04 12 5.04z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.86c2.16-1.99 3.4-4.92 3.4-8.54z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.08 14.73c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1L1.25 7.56C.45 9.17 0 10.97 0 12.87c0 1.9.45 3.7 1.25 5.31l3.83-3.45z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.02.68-2.33 1.09-4.27 1.09-3.22 0-5.99-2.23-6.96-5.26l-3.83 2.97C3.2 20.26 7.24 23 12 23z"
                    />
                  </svg>
                  <span>Google Verified</span>
                </div>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-[#3A2A3D] min-h-[72px]">“{t.text}”</p>
              <div className="mt-5 flex items-center gap-3 border-t border-[#F8F0F9] pt-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#F3E7F5] to-[#FFE4F2] text-[13px] font-semibold text-[#7A187C]">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-[#1A0F1C]">{t.name}</div>
                  <div className="text-[11.5px] text-[#8B7A8F]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Instagram */}
      <motion.section {...fadeInUp} className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-semibold tracking-tight md:text-[26px]">@sahelishrungar</h2>
          <a href="#" className="text-[13.5px] font-medium text-[#8B1D8F] hover:underline">Follow us</a>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2.5 md:grid-cols-6">
          {[
            "https://images.pexels.com/photos/6203485/pexels-photo-6203485.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
            "https://images.pexels.com/photos/33622012/pexels-photo-33622012.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
            "https://images.pexels.com/photos/31625368/pexels-photo-31625368.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
            "https://images.pexels.com/photos/14211426/pexels-photo-14211426.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
            "https://images.pexels.com/photos/34322336/pexels-photo-34322336.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
            "https://images.pexels.com/photos/8506372/pexels-photo-8506372.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=600",
          ].map((src, i) => (
            <a key={i} href="#" className="group relative aspect-square overflow-hidden rounded-2xl">
              <img src={src} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
            </a>
          ))}
        </div>
      </motion.section>


    </>
  );
}
