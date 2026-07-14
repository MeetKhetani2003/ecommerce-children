"use client";

import { useEffect, useState, useRef } from "react";
import Link from 'next/link';

import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Check, Sparkles } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { FaWhatsapp } from "react-icons/fa";

const LoginModal = dynamic(() => import("@/components/LoginModal"), {
  ssr: false,
});

const SizeGuideModal = dynamic(() => import("@/components/SizeGuideModal"), {
  ssr: false,
});

const DiscountPopupClient = dynamic(() => import("@/components/DiscountPopupClient"), {
  ssr: false,
});

const RecentPurchaseToastClient = dynamic(() => import("@/components/RecentPurchaseToastClient"), {
  ssr: false,
});

const megaMenuGroups = [
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
      "Independence Day Costume",
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
const logoUrl = "/assets/logo.png";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { wishlist, cartCount, showCart, setShowCart } = useShop();

  useEffect(() => {
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener("openLoginModal", handleOpenLogin as EventListener);
    return () => window.removeEventListener("openLoginModal", handleOpenLogin as EventListener);
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const fetchSearchProducts = async () => {
    if (hasFetchedProducts) return;
    setLoadingSearch(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.products || []);
        setHasFetchedProducts(true);
      }
    } catch (err) {
      console.error("Error fetching products for search:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!hasFetchedProducts) {
      fetchSearchProducts();
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const lower = searchQuery.toLowerCase().trim();
    const filtered = allProducts.filter((p) => {
      return (
        (p.title && p.title.toLowerCase().includes(lower)) ||
        (p.category && p.category.toLowerCase().includes(lower)) ||
        (p.description && p.description.toLowerCase().includes(lower)) ||
        (p.tag && p.tag.toLowerCase().includes(lower)) ||
        (p.sku && p.sku.toLowerCase().includes(lower))
      );
    });
    setSearchResults(filtered);
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFCFE] text-[#1A0F1C] antialiased selection:bg-[#8B1D8F]/20 selection:text-[#6B146E]" style={{ fontFamily: "var(--font-plus-jakarta-sans), var(--font-outfit), var(--font-inter), system-ui, -apple-system, sans-serif" }}>
      {/* Top Announcement */}
      <div className="relative z-[60] w-full bg-gradient-to-r from-[#8B1D8F] via-[#A32B9D] to-[#C2187B] text-white print:hidden">
        <div className="mx-auto flex max-w-[1240px] items-center justify-center gap-3 px-4 py-[9px] text-[12.5px] font-medium tracking-wide">
          <Sparkles className="h-3.5 w-3.5 opacity-90" />
          <span>School Event Season • Free Next-Day Delivery in Mumbai, Delhi, Pune • COD Available</span>
        </div>
      </div>

      {/* Navbar */}
      <header className={cn("sticky top-0 z-50 w-full border-b transition-all duration-300 print:hidden", scrolled ? "border-[#F0E6F2] bg-white/80 backdrop-blur-xl" : "border-transparent bg-white/60 backdrop-blur-lg")}>
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-4 px-4 md:h-[76px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src={logoUrl} alt="Saheli Shrungar" width={200} height={128} priority className="h-32 w-auto object-contain" />
          </Link>

          {/* Nav */}
          <nav className="ml-6 hidden items-center gap-7 lg:flex">
            <Link href="/" className="group relative py-2 text-[14px] font-medium text-[#3A2A3D] transition-colors hover:text-[#8B1D8F]">
              Home
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#8B1D8F] to-[#E91E7A] transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* Categories Mega Menu Trigger */}
            <div className="group relative py-2">
              <button className="flex items-center gap-1 text-[14px] font-medium text-[#3A2A3D] transition-colors hover:text-[#8B1D8F] outline-none">
                <span>Categories</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#A38AA6] transition-transform duration-200 group-hover:rotate-180" />
              </button>

              {/* Mega Menu Dropdown */}
              <div className="invisible absolute left-1/2 top-full z-[100] w-[860px] -translate-x-[200px] pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
                <div className="rounded-[24px] border border-[#F0E6F2] bg-white p-6 shadow-2xl shadow-black/10 backdrop-blur-xl">
                  <div className="grid grid-cols-4 gap-6">
                    {megaMenuGroups.map((group) => (
                      <div key={group.title} className="space-y-3">
                        <div className="text-[12.5px] font-semibold uppercase tracking-wider text-[#8B1D8F]">
                          {group.title}
                        </div>
                        <ul className="space-y-2 border-l border-[#F8F0F9] pl-3">
                          {group.categories.map((cat) => (
                            <li key={cat}>
                              <Link 
                                href={`/products?category=${encodeURIComponent(cat)}`}
                                className="block text-[13.5px] text-[#6B5A6F] transition-all duration-200 hover:translate-x-1 hover:text-[#8B1D8F]"
                              >
                                {cat}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link href="/products?category=All" className="group relative py-2 text-[14px] font-medium text-[#3A2A3D] transition-colors hover:text-[#8B1D8F]">
              New Arrivals
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#8B1D8F] to-[#E91E7A] transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link href="/products?category=Offer Products" className="group relative py-2 text-[14px] font-medium text-[#3A2A3D] transition-colors hover:text-[#8B1D8F]">
              Offers
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#8B1D8F] to-[#E91E7A] transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Search */}
            <div className="relative hidden md:block" ref={searchRef}>
              <input
                placeholder="Search costumes..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  setIsSearchFocused(true);
                  fetchSearchProducts();
                }}
                className="h-10 w-[220px] rounded-full border border-[#EEDDF0] bg-[#FCF7FD] pl-9 pr-4 text-[13.5px] outline-none transition-all placeholder:text-[#A38AA6] focus:w-[280px] focus:border-[#E1BFE6] focus:bg-white focus:ring-4 focus:ring-[#F3E7F5]"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A38AA6]" />

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-[340px] rounded-2xl border border-[#F0E6F2] bg-white p-3 shadow-2xl z-[100]"
                  >
                    {loadingSearch ? (
                      <div className="flex items-center justify-center p-6 text-[13px] text-[#8B7A8F] gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#8B1D8F] border-t-transparent" />
                        <span>Searching...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-[13px] text-[#8B7A8F]">
                        No costumes found for <span className="font-semibold text-[#8B1D8F]">"{searchQuery}"</span>
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[#8B1D8F]">
                          Products Found ({searchResults.length})
                        </div>
                        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
                          {searchResults.map((p) => (
                            <Link
                              key={p.id}
                              href={`/product/${p.slug || p.id}`}
                              onClick={() => {
                                setSearchQuery("");
                                setIsSearchFocused(false);
                              }}
                              className="flex items-center gap-3 rounded-xl p-2 transition duration-200 hover:bg-[#FCF7FD]"
                            >
                              <div className="relative h-12 w-10 shrink-0">
                                <Image
                                  src={p.image}
                                  alt={p.title}
                                  fill
                                  sizes="40px"
                                  className="rounded-lg object-cover border border-[#F0E6F2]"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[13.5px] font-semibold text-[#1A0F1C] truncate hover:text-[#8B1D8F] transition-colors">
                                  {p.title}
                                </h4>
                                <div className="flex items-center justify-between mt-0.5">
                                  <span className="text-[11.5px] text-[#8B7A8F] truncate">
                                    {p.category}
                                  </span>
                                  <span className="text-[13.5px] font-bold text-[#8B1D8F]">
                                    ₹{p.price}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
            {session ? (
              <Link href="/profile" className="hidden h-10 w-10 place-items-center rounded-full text-[#4A354D] transition hover:bg-[#F8F0F9] hover:text-[#8B1D8F] md:grid">
                {session.user?.image ? (
                  <div className="relative h-6 w-6 overflow-hidden rounded-full border border-[#EEDDF0]">
                    <Image src={session.user.image} alt="Profile" fill sizes="24px" className="object-cover" />
                  </div>
                ) : (
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#8B1D8F] to-[#E91E7A] text-[10px] font-bold text-white uppercase">
                    {session.user?.name ? session.user.name.substring(0, 1) : "U"}
                  </div>
                )}
              </Link>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="hidden md:flex items-center gap-1.5 rounded-full border border-[#8B1D8F]/30 px-4 py-1.5 text-[13.5px] font-semibold text-[#8B1D8F] hover:bg-[#8B1D8F] hover:text-white transition-all duration-300 cursor-pointer outline-none"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
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
                  <input
                    placeholder="Search costumes..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      fetchSearchProducts();
                    }}
                    className="h-11 w-full rounded-xl border border-[#EEDDF0] bg-[#FCF7FD] pl-10 pr-4 text-[14px] outline-none focus:border-[#E1BFE6] focus:ring-4 focus:ring-[#F3E7F5]"
                  />
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A38AA6]" />
                </div>

                {/* Mobile Search Results */}
                {searchQuery && (
                  <div className="mb-4 max-h-[280px] overflow-y-auto rounded-xl border border-[#F0E6F2] bg-white p-2 shadow-inner">
                    {loadingSearch ? (
                      <div className="flex items-center justify-center p-3 text-[13px] text-[#8B7A8F] gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border border-[#8B1D8F] border-t-transparent" />
                        <span>Searching...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-center text-[13px] text-[#8B7A8F]">
                        No costumes found
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.map((p) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug || p.id}`}
                            onClick={() => {
                              setSearchQuery("");
                              setMobileMenu(false);
                            }}
                            className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-[#FCF7FD]"
                          >
                            <div className="relative h-10 w-8 shrink-0">
                              <Image
                                src={p.image}
                                alt={p.title}
                                fill
                                sizes="32px"
                                className="rounded object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[13px] font-semibold text-[#1A0F1C] truncate">
                                {p.title}
                              </h4>
                              <p className="text-[11px] text-[#8B7A8F] truncate">
                                {p.category} • ₹{p.price}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  <Link href="/" onClick={() => setMobileMenu(false)} className="block rounded-xl px-3 py-3 text-[14px] font-medium text-[#2E1F31] hover:bg-[#FCF7FD]">
                    Home
                  </Link>

                  {/* Categories Accordion using details & summary */}
                  <details className="group [&_summary::-webkit-details-marker]:hidden border-b border-[#F8F0F9] pb-1">
                    <summary className="flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-medium text-[#2E1F31] hover:bg-[#FCF7FD] cursor-pointer outline-none">
                      <span>Categories</span>
                      <ChevronDown className="h-4 w-4 text-[#B99BBC] transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="mt-1 pl-4 pr-2 pb-2 space-y-4 border-l border-[#F0E6F2]">
                      {megaMenuGroups.map((group) => (
                        <div key={group.title} className="space-y-1">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8B1D8F]/70 px-2 py-0.5">
                            {group.title}
                          </div>
                          <div className="space-y-0.5 pl-2">
                            {group.categories.map((cat) => (
                              <Link 
                                key={cat} 
                                href={`/products?category=${encodeURIComponent(cat)}`}
                                onClick={() => setMobileMenu(false)}
                                className="block rounded-lg px-2 py-2 text-[13px] font-medium text-[#4A354D] hover:bg-[#FCF7FD] hover:text-[#8B1D8F]"
                              >
                                {cat}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>

                  <Link href="/products?category=All" onClick={() => setMobileMenu(false)} className="block rounded-xl px-3 py-3 text-[14px] font-medium text-[#2E1F31] hover:bg-[#FCF7FD]">
                    New Arrivals
                  </Link>

                  <Link href="/products?category=Offer Products" onClick={() => setMobileMenu(false)} className="block rounded-xl px-3 py-3 text-[14px] font-medium text-[#2E1F31] hover:bg-[#FCF7FD]">
                    Offers
                  </Link>

                  <Link href="/wishlist" onClick={() => setMobileMenu(false)} className="block rounded-xl px-3 py-3 text-[14px] font-medium text-[#2E1F31] hover:bg-[#FCF7FD]">
                    My Wishlist
                  </Link>

                  {session ? (
                    <>
                      <Link href="/profile" onClick={() => setMobileMenu(false)} className="block rounded-xl px-3 py-3 text-[14px] font-medium text-[#2E1F31] hover:bg-[#FCF7FD]">
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenu(false);
                          signOut();
                        }}
                        className="w-full text-left block rounded-xl px-3 py-3 text-[14px] font-medium text-red-500 hover:bg-red-50 cursor-pointer outline-none"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenu(false);
                        setIsLoginOpen(true);
                      }}
                      className="w-full text-left block rounded-xl px-3 py-3 text-[14px] font-semibold text-[#8B1D8F] hover:bg-[#FCF7FD] cursor-pointer outline-none"
                    >
                      Login / Sign Up
                    </button>
                  )}
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
      <footer className="mt-12 border-t border-[#F0E6F2] bg-[#FFFCFE] print:hidden">
        <div className="mx-auto max-w-[1240px] px-4 py-10">
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <Image src={logoUrl} alt="Saheli Shrungar" width={200} height={128} className="h-32 w-auto object-contain" />
              <p className="mt-4 max-w-[320px] text-[13.5px] leading-relaxed text-[#6B5A6F]">India’s most loved fancy dress destination for school events. Premium fabrics, complete sets, delivered fast.</p>
            </div>
            {[
              { 
                title: "Shop", 
                links: [
                  { label: "Superhero", href: "/products?category=Super%20Heroes" },
                  { label: "Mythology", href: "/products?category=Indian%20Mythology%20Costume" },
                  { label: "Animals", href: "/products?category=Animal%20Costume" },
                  { label: "Dance Wear", href: "/products?category=Indian%20Dance%20Costume" },
                  { label: "National Days", href: "/products?category=Independence%20Day%20Costume" },
                  { label: "Halloween", href: "/products?category=Halloween%20Costumes" }
                ] 
              },
              { 
                title: "Help", 
                links: [
                  { label: "Size Guide", action: () => setIsSizeGuideOpen(true) },
                  { label: "Contact Us", href: "/contact-us" }
                ] 
              },
              { 
                title: "Company", 
                links: [
                  { label: "About", href: "/about" },
                  { label: "Parent Reviews", href: "/reviews" },
                  { label: "Wholesale", href: "/wholesale" },
                  { label: "Careers", href: "/careers" },
                  { label: "Privacy", href: "/privacy" }
                ] 
              },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-[13px] font-semibold uppercase tracking-wide text-[#3A2A3D]">{col.title}</div>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((l: any) => (
                    <li key={l.label}>
                      {l.action ? (
                        <button onClick={l.action} className="text-[13.5px] text-[#6B5A6F] transition hover:text-[#8B1D8F]">{l.label}</button>
                      ) : (
                        <Link href={l.href} className="text-[13.5px] text-[#6B5A6F] transition hover:text-[#8B1D8F]">{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#F0E6F2] pt-6 md:flex-row">
            <div className="flex flex-col gap-1 text-[12.5px] text-[#8B7A8F] text-center md:text-left">
              <span>© {new Date().getFullYear()} Saheli Shrungar. All rights reserved. Made with love for school stars.</span>
              <span className="text-[12px] opacity-80">
                Powered by <a href="https://festiviya.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#8B1D8F] hover:underline">Festiviya</a>
              </span>
            </div>
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
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-5 left-1/2 z-[90] flex w-[92%] max-w-[420px] -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#EEDDF0] bg-white p-3.5 shadow-2xl shadow-black/10 md:bottom-7 print:hidden">
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

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      {/* Discount Popup */}
      <DiscountPopupClient />

      {/* Recent Purchase Social Proof Toast */}
      <RecentPurchaseToastClient />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919664992997"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform duration-300 hover:scale-110 md:bottom-8 md:right-8 print:hidden"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="h-8 w-8" />
      </a>
    </div>
  );
}
