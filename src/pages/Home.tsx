import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, RotateCcw, Sparkles, IndianRupee, Play, ArrowRight, Check, Heart, ShoppingBag } from "lucide-react";
import { heroSlides, products, categories, testimonials } from "../data/mockData";
import { useShop } from "../context/ShopContext";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((s) => (s + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.8;
    carouselRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative mx-auto max-w-[1240px] px-4 pt-5 md:pt-7">
        <div className="relative">
          <div className="relative h-[68vh] min-h-[520px] w-full overflow-hidden rounded-[28px] bg-[#1A0F1C] md:h-[76vh] md:min-h-[580px] md:rounded-[32px]">
            <AnimatePresence mode="wait">
              <motion.div key={activeSlide} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                <img src={heroSlides[activeSlide].image} alt={heroSlides[activeSlide].title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B1D8F]/30 via-transparent to-[#E91E7A]/20 mix-blend-multiply" />
              </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="w-full px-5 pb-10 pt-20 md:px-12 md:pb-0">
                <div className="max-w-[620px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeSlide} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FFB3E0]" />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/90">{heroSlides[activeSlide].eyebrow}</span>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">{heroSlides[activeSlide].badge}</span>
                      </div>
                      <h1 className="text-[32px] font-semibold leading-[1.1] tracking-tight text-white md:text-[48px]">{heroSlides[activeSlide].title}</h1>
                      <p className="mt-3 max-w-[520px] text-[14.5px] leading-relaxed text-white/85 md:text-[16px]">{heroSlides[activeSlide].subtitle}</p>
                      <div className="mt-6 flex items-center gap-3">
                        <a href="#" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-[12px] text-[14px] font-medium text-[#6B146E] transition hover:shadow-lg hover:shadow-white/20">
                          <span className="relative z-10">{heroSlides[activeSlide].cta}</span>
                          <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          <span className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-[#F3E7F5] to-[#FFE4F2] transition-transform duration-300 group-hover:translate-y-0" />
                        </a>
                        <a href="#" className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-5 py-[11px] text-[14px] font-medium text-white backdrop-blur-md transition hover:bg-white/20">
                          <Play className="h-3.5 w-3.5" /> Watch reel
                        </a>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-5 right-5 flex items-center gap-2 md:bottom-7 md:right-7">
              <button onClick={() => setActiveSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length)} className="grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setActiveSlide((s) => (s + 1) % heroSlides.length)} className="grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 md:bottom-7">
              {heroSlides.map((_, i) => (
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
      <section className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
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
      </section>

      {/* Featured Products */}
      <section className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
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
          {products.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -4 }} className="group relative w-[210px] shrink-0 snap-start md:w-[242px]">
              <div className="overflow-hidden rounded-[20px] border border-[#F0E6F2] bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#8B1D8F]/10">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#FCF7FD]">
                  <Link to={`/product/${p.id}`}>
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  </Link>
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                    <span className="rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-medium leading-none text-[#6B146E] shadow-sm backdrop-blur">{p.category}</span>
                    {p.tag && <span className="rounded-full bg-[#1A0F1C] px-2 py-1 text-[10.5px] font-medium leading-none text-white">{p.tag}</span>}
                  </div>
                  <button onClick={() => toggleWishlist(p.id)} className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#6B5A6F] opacity-0 shadow-sm backdrop-blur transition-all hover:text-[#E91E7A] group-hover:opacity-100">
                    <Heart className={cn("h-4 w-4 transition", wishlist.includes(p.id) && "fill-[#E91E7A] text-[#E91E7A]")} />
                  </button>
                  <div className="absolute inset-x-2.5 bottom-2.5 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <button onClick={() => addToCart(p)} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1A0F1C] py-2.5 text-[13px] font-medium text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-black">
                      <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
                    </button>
                  </div>
                </div>
                <div className="p-3.5">
                  <Link to={`/product/${p.id}`} className="line-clamp-1 text-[14px] font-medium text-[#2E1F31] hover:text-[#8B1D8F]">{p.title}</Link>
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
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="relative overflow-hidden rounded-[28px] border border-[#F0E6F2] bg-gradient-to-r from-[#FCF7FD] via-[#FFF8FB] to-[#F8F4FA] p-[1px]">
          <div className="relative grid grid-cols-1 items-center gap-6 rounded-[27px] bg-white/70 px-6 py-8 backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-10">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1A0F1C] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
                <Sparkles className="h-3 w-3" /> School Event Collection
              </div>
              <h3 className="mt-3 text-[24px] font-semibold leading-tight tracking-tight text-[#1A0F1C] md:text-[30px]">Flat 25% OFF on 3+ Costumes</h3>
              <p className="mt-2 max-w-[520px] text-[14px] leading-relaxed text-[#5E4F63]">Perfect for annual day, fancy dress, and theme parties. Mix & match across categories. Premium accessories included.</p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <a href="#" className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1D8F] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-md shadow-[#8B1D8F]/20 transition hover:bg-[#7A187C]">
                  Shop Combo <ArrowRight className="h-4 w-4" />
                </a>
                <div className="flex items-center gap-2 text-[12.5px] text-[#6B5A6F]">
                  <Check className="h-4 w-4 text-[#0F8A4B]" /> Free size exchange
                  <span className="h-1 w-1 rounded-full bg-[#D8C9DB]" />
                  <Check className="h-4 w-4 text-[#0F8A4B]" /> Express delivery
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                {products.slice(0, 3).map((p) => (
                  <div key={p.id} className="aspect-[3/4] overflow-hidden rounded-2xl border border-[#F0E6F2] bg-white shadow-sm">
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute -inset-6 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(139,29,143,0.15),_transparent_60%)] blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-[22px] font-semibold tracking-tight md:text-[26px]">Shop by Category</h2>
          <a href="#" className="text-[13.5px] font-medium text-[#8B1D8F] hover:underline">View all</a>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {categories.map((c) => (
            <a key={c.name} href="#" className="group relative overflow-hidden rounded-[20px] border border-[#F0E6F2] bg-white">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <div className="text-[15px] font-medium text-white">{c.name}</div>
                <div className="text-[11.5px] text-white/80">{c.count}</div>
              </div>
              <div className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 opacity-0 backdrop-blur transition group-hover:opacity-100">
                <ArrowRight className="h-3.5 w-3.5 text-[#1A0F1C]" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Parent Favorites */}
      <section className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
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
              { title: "Independence & Republic Day", desc: "Tricolor sets, freedom fighters", color: "from-[#FF9933]/20 to-[#138808]/20" },
              { title: "Halloween Specials", desc: "Cute, not scary. Parent-approved", color: "from-[#8B1D8F]/20 to-[#E91E7A]/20" },
            ].map((b) => (
              <div key={b.title} className="relative overflow-hidden rounded-[24px] border border-[#F0E6F2] bg-white p-6">
                <div className={cn("pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl", b.color)} />
                <div className="relative">
                  <div className="text-[17px] font-semibold text-[#1A0F1C]">{b.title}</div>
                  <div className="mt-1 text-[13.5px] text-[#6B5A6F]">{b.desc}</div>
                  <a href="#" className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[#8B1D8F] hover:gap-1.5">Explore <ArrowRight className="h-3.5 w-3.5 transition-all" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-[22px] font-semibold tracking-tight md:text-[26px]">Loved by Parents</h2>
          <div className="flex items-center gap-1 text-[13px] text-[#6B5A6F]">
            <Star className="h-4 w-4 fill-[#F5A524] text-[#F5A524]" /> 4.8 average from 3,241 reviews
          </div>
        </div>
        <div className="grid gap-3.5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-[20px] border border-[#F0E6F2] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#F5A524] text-[#F5A524]" />
                ))}
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-[#3A2A3D]">“{t.text}”</p>
              <div className="mt-4 flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#F3E7F5] to-[#FFE4F2] text-[12px] font-medium text-[#7A187C]">{t.name.split(" ").map(n=>n[0]).join("")}</div>
                <div>
                  <div className="text-[13px] font-medium text-[#1A0F1C]">{t.name}</div>
                  <div className="text-[11.5px] text-[#8B7A8F]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram */}
      <section className="mx-auto mt-10 max-w-[1240px] px-4 md:mt-14">
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
      </section>

      {/* Newsletter */}
      <section className="mx-auto mt-12 max-w-[1240px] px-4 md:mt-16 mb-12">
        <div className="relative overflow-hidden rounded-[28px] border border-[#F0E6F2]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B1D8F] via-[#A32B9D] to-[#C2187B]" />
          <div className="absolute inset-0 opacity-[0.15] [background:radial-gradient(circle_at_20%_50%,white,transparent_40%),radial-gradient(circle_at_80%_30%,white,transparent_40%)]" />
          <div className="relative grid items-center gap-6 px-6 py-9 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-12">
            <div>
              <h3 className="text-[24px] font-semibold leading-tight text-white md:text-[28px]">Get school event reminders & early access</h3>
              <p className="mt-2 max-w-[520px] text-[14px] text-white/85">We’ll ping you before Janmashtami, Annual Day, Republic Day, and Halloween with curated picks for your child’s age.</p>
            </div>
            <form onSubmit={(e)=>e.preventDefault()} className="flex gap-2">
              <input required type="email" placeholder="Enter your email" className="h-12 w-full rounded-full bg-white px-5 text-[14px] outline-none placeholder:text-[#A38AA6] focus:ring-4 focus:ring-white/30" />
              <button className="h-12 shrink-0 rounded-full bg-[#1A0F1C] px-6 text-[14px] font-medium text-white transition hover:bg-black">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
