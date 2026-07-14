"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { X, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function DiscountPopupClient() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, check if profile is complete
    if (session?.user) {
      const u = session.user as any;
      const hasPhone = !!u.phone;
      const hasAddress = !!u.defaultAddress || (u.addresses && u.addresses.length > 0);
      
      // If profile is fully completed, don't show the popup at all
      if (hasPhone && hasAddress) {
        return;
      }
    }

    // Check if dismissed
    const isDismissed = localStorage.getItem("discountPopupDismissed");
    if (isDismissed === "true") {
      return;
    }

    // Show after 5 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [session]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("discountPopupDismissed", "true");
  };

  const handleAction = () => {
    handleClose();
    if (session?.user) {
      router.push("/profile");
    } else {
      // Dispatch openLoginModal event to layout
      window.dispatchEvent(new Event("openLoginModal"));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={handleClose} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative z-[210] w-full max-w-[400px] overflow-hidden rounded-[24px] bg-white shadow-2xl"
          >
            <div className="relative h-32 bg-gradient-to-br from-[#8B1D8F] to-[#E91E7A] p-6 text-white text-center flex flex-col items-center justify-center">
              <Gift className="h-10 w-10 mb-1 drop-shadow-md" />
              <div className="text-[18px] font-bold tracking-wide">SPECIAL OFFER</div>
              <button 
                onClick={handleClose}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-black/20 text-white transition hover:bg-black/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-7 text-center">
              <h3 className="mb-2 text-[20px] font-bold text-[#1A0F1C]">
                Get 10% OFF Your First Order!
              </h3>
              <p className="mb-6 text-[14px] text-[#6B5A6F] leading-relaxed">
                Complete your profile by adding your <strong className="text-[#8B1D8F]">phone number</strong> and <strong className="text-[#8B1D8F]">address</strong> to receive a 10% discount coupon in your email instantly!
              </p>
              
              <button 
                onClick={handleAction}
                className="w-full rounded-full bg-[#8B1D8F] py-3.5 text-[14.5px] font-bold text-white transition-all hover:bg-[#7A187C] active:scale-[0.98] shadow-lg shadow-[#8B1D8F]/30"
              >
                {session?.user ? "Complete Profile Now" : "Login to Unlock"}
              </button>
              
              <button 
                onClick={handleClose}
                className="mt-4 text-[13px] font-medium text-[#A38AA6] hover:text-[#8B7A8F]"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
