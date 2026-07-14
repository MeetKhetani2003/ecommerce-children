"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const NAMES = [
  "Meet", "Rahul", "Priya", "Amit", "Sneha", "Karan", "Riya", "Aarav", "Neha", 
  "Vikram", "Pooja", "Rohan", "Anjali", "Suresh", "Kavita", "Deepak", "Swati",
  "Nitin", "Meera", "Harsh", "Dinesh", "Sanjay", "Ramesh", "Gita", "Aditi"
];

const CITIES = [
  "Mumbai", "Pune", "Delhi", "Ahmedabad", "Surat", "Bangalore", 
  "Jaipur", "Indore", "Rajkot", "Vadodara", "Bhavnagar", "Jamnagar"
];

const TIMES = [
  "just now", "2 min ago", "5 min ago", "10 min ago", "15 min ago", "30 min ago", "1 hour ago", "2 hours ago"
];

export default function RecentPurchaseToastClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [toastData, setToastData] = useState<{ name: string; city: string; product: any; time: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fetch products once to use for random selection
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Failed to fetch products for toast", err));
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    let timeoutId: NodeJS.Timeout;

    const showRandomToast = () => {
      const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];

      setToastData({ name: randomName, city: randomCity, product: randomProduct, time: randomTime });
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      // Schedule next toast between 15 to 45 seconds
      const nextDelay = Math.floor(Math.random() * 30000) + 15000;
      timeoutId = setTimeout(showRandomToast, nextDelay);
    };

    // Initial delay before showing the first one (10 seconds)
    timeoutId = setTimeout(showRandomToast, 10000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [products]);

  return (
    <AnimatePresence>
      {isVisible && toastData && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-24 left-4 z-[85] md:bottom-6 md:left-6 w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-[#EEDDF0] bg-white p-3 shadow-2xl shadow-[#8B1D8F]/15 overflow-hidden print:hidden cursor-pointer hover:border-[#E1BFE6] transition-colors"
          onClick={() => setIsVisible(false)}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B1D8F] to-[#E91E7A]"></div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute top-2 right-2 text-[#A38AA6] hover:text-[#8B1D8F] transition-colors z-10 p-1"
          >
            <X className="h-4 w-4" />
          </button>

          <Link 
            href={`/product/${toastData.product.slug || toastData.product._id}`} 
            className="flex items-center gap-3 mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-[#F8F0F9]">
              <Image 
                src={toastData.product.image} 
                alt={toastData.product.title} 
                fill 
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#0F8A4B] uppercase tracking-wide">
                <CheckCircle2 className="h-3 w-3" />
                Verified Purchase
              </div>
              <p className="mt-0.5 text-[12.5px] leading-snug text-[#1A0F1C]">
                <span className="font-bold text-[#8B1D8F]">{toastData.name}</span> in {toastData.city} purchased
              </p>
              <p className="truncate text-[13px] font-semibold text-[#4A354D] mt-0.5">
                {toastData.product.title}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#A38AA6]">
                {toastData.time}
              </p>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
