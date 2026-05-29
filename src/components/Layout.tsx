"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';

import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronRight, Check, Sparkles } from "lucide-react";
import { useShop } from "@/context/ShopContext";
const logoUrl = "/assets/logo.png";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { wishlist, cartCount, showCart, setShowCart } = useShop();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFCFE] text-[#1A0F1C] antialiased selection:bg-[#8B1D8F]/20 selection:text-[#6B146E]" style={{ fontFamily: "Plus Jakarta Sans, Outfit, Inter, system-ui, -apple-system, sans-serif" }}>
      {/* Top Announcement */}
      <div className="relative z-[60] w-full bg-gradient-to-r from-[#8B1D8F] via-[#A32B9D] to-[#C2187B] text-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-center gap-3 px-4 py-[9px] text-[12.5px] font-medium tracking-wide">
          <Sparkles className="h-3.5 w-3.5 opacity-90" />
          <span>School Event Season • Free Next-Day Delivery in Mumbai, Delhi, Pune • COD Available</span>
        </div>
      </div>

      {/* Navbar */}
      <header className={cn("sticky top-0 z-50 w-full border-b transition-all duration-300", scrolled ? "border-[#F0E6F2] bg-white/80 backdrop-blur-xl" : "border-transparent bg-white/60 backdrop-blur-lg")}>
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-4 px-4 md:h-[76px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src={logoUrl} alt="Saheli Shrungar" className="h-32  w-auto object-contain" />
          </Link>

          {/* Nav */}
          <nav className="ml-6 hidden items-center gap-7 lg:flex">
            {["New Arrivals", "Superhero", "Mythology", "Animals", "Dance", "School Events"].map((item) => (
              <Link key={item} href={`/products?category=${item === "New Arrivals" ? "All" : item}`} className="group relative py-2 text-[14px] font-medium text-[#3A2A3D] transition-colors hover:text-[#8B1D8F]">
                {item}
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#8B1D8F] to-[#E91E7A] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Search */}
            <div className="relative hidden md:block">
              <input placeholder="Search costumes..." className="h-10 w-[220px] rounded-full border border-[#EEDDF0] bg-[#FCF7FD] pl-9 pr-4 text-[13.5px] outline-none transition-all placeholder:text-[#A38AA6] focus:w-[260px] focus:border-[#E1BFE6] focus:bg-white focus:ring-4 focus:ring-[#F3E7F5]" />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A38AA6]" />
            </div>

            <button className="relative grid h-10 w-10 place-items-center rounded-full text-[#4A354D] transition hover:bg-[#F8F0F9] hover:text-[#8B1D8F] md:hidden">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link href="/wishlist" className="relative grid h-10 w-10 place-items-center rounded-full text-[#4A354D] transition hover:bg-[#F8F0F9] hover:text-[#8B1D8F]">
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#E91E7A] px-1 text-[10px] font-medium leading-none text-white">{wishlist.length}</span>}
            </Link>
            <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-[#4A354D] transition hover:bg-[#F8F0F9] hover:text-[#8B1D8F]">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#8B1D8F] px-1 text-[10px] font-medium leading-none text-white">{cartCount}</span>}
            </Link>
            <Link href="/profile" className="hidden grid h-10 w-10 place-items-center rounded-full text-[#4A354D] transition hover:bg-[#F8F0F9] hover:text-[#8B1D8F] md:grid">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <button onClick={() => setMobileMenu(true)} className="grid h-10 w-10 place-items-center rounded-full text-[#4A354D] transition hover:bg-[#F8F0F9] lg:hidden">
              <Menu className="h-[20px] w-[20px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 z-[80] h-full w-[86%] max-w-[360px] overflow-y-auto bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#F0E6F2] p-4">
                <span className="text-[15px] font-semibold text-[#7A187C]">Menu</span>
                <button onClick={() => setMobileMenu(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#F8F0F9]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <input placeholder="Search costumes..." className="h-11 w-full rounded-xl border border-[#EEDDF0] bg-[#FCF7FD] pl-10 pr-4 text-[14px] outline-none focus:border-[#E1BFE6] focus:ring-4 focus:ring-[#F3E7F5]" />
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A38AA6]" />
                </div>
                <div className="space-y-1">
                  {["New Arrivals", "Superhero", "Mythology", "Animals", "Birds", "Dance Wear", "Republic Day", "Halloween", "Community Helpers", "Fruit & Veg"].map((i) => (
                    <Link key={i} href={`/products?category=${i === "New Arrivals" ? "All" : i}`} onClick={() => setMobileMenu(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-medium text-[#2E1F31] hover:bg-[#FCF7FD]">
                      {i}
                      <ChevronRight className="h-4 w-4 text-[#B99BBC]" />
                    </Link>
                  ))}
                  <Link href="/wishlist" onClick={() => setMobileMenu(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-medium text-[#2E1F31] hover:bg-[#FCF7FD]">
                    My Wishlist
                    <ChevronRight className="h-4 w-4 text-[#B99BBC]" />
                  </Link>
                  <Link href="/profile" onClick={() => setMobileMenu(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-medium text-[#2E1F31] hover:bg-[#FCF7FD]">
                    My Profile
                    <ChevronRight className="h-4 w-4 text-[#B99BBC]" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#F0E6F2] bg-[#FFFCFE]">
        <div className="mx-auto max-w-[1240px] px-4 py-10">
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <img src={logoUrl} alt="Saheli Shrungar" className="h-32 w-auto object-contain" />
              <p className="mt-4 max-w-[320px] text-[13.5px] leading-relaxed text-[#6B5A6F]">India’s most loved fancy dress destination for school events. Premium fabrics, complete sets, delivered fast.</p>
            </div>
            {[
              { title: "Shop", links: ["Superhero", "Mythology", "Animals", "Dance Wear", "National Days", "Halloween"] },
              { title: "Help", links: ["Size Guide", "Delivery", "Returns", "Track Order", "Contact Us"] },
              { title: "Company", links: ["About", "Parent Reviews", "Wholesale", "Careers", "Privacy"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-[13px] font-semibold uppercase tracking-wide text-[#3A2A3D]">{col.title}</div>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}><Link href={col.title === "Shop" ? `/products?category=${l}` : "#"} className="text-[13.5px] text-[#6B5A6F] transition hover:text-[#8B1D8F]">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#F0E6F2] pt-6 md:flex-row">
            <div className="text-[12.5px] text-[#8B7A8F]">© {new Date().getFullYear()} Saheli Shrungar. All rights reserved. Made with love for school stars.</div>
            <div className="flex items-center gap-3 text-[12px] text-[#8B7A8F]">
              <span className="rounded-full border border-[#EEDDF0] px-2.5 py-1">UPI</span>
              <span className="rounded-full border border-[#EEDDF0] px-2.5 py-1">Cards</span>
              <span className="rounded-full border border-[#EEDDF0] px-2.5 py-1">COD</span>
              <span className="rounded-full border border-[#EEDDF0] px-2.5 py-1">Netbanking</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Toast */}
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-5 left-1/2 z-[90] flex w-[92%] max-w-[420px] -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#EEDDF0] bg-white p-3.5 shadow-2xl shadow-black/10 md:bottom-7">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3E7F5] text-[#8B1D8F]">
              <Check className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-medium text-[#1A0F1C]">Added to cart</div>
              <div className="text-[12.5px] text-[#6B5A6F]">Premium costume • Free delivery eligible</div>
            </div>
            <Link href="/cart" onClick={() => setShowCart(false)} className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-[#8B1D8F] hover:bg-[#FCF7FD]">View</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
