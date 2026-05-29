"use client";

import Link from 'next/link';

import { useShop } from "@/context/ShopContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useShop();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = 0; // Or calculate from MRP
  const total = subtotal - discount;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-20 text-center md:py-32">
        <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-[#FCF7FD] text-[#8B1D8F]">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-[24px] font-semibold text-[#1A0F1C]">Your cart is empty</h2>
        <p className="mt-2 text-[15px] text-[#6B5A6F]">Looks like you haven't added any costumes yet.</p>
        <Link href="/" className="mt-8 rounded-full bg-[#8B1D8F] px-8 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#7A187C]">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <h1 className="mb-8 text-[28px] font-semibold tracking-tight text-[#1A0F1C]">Shopping Cart</h1>
      
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Items List */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-[#F0E6F2] p-4 transition-all hover:shadow-md">
              <Link href={`/product/${item.id}`} className="block h-[120px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-[#FCF7FD]">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between py-1">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link href={`/product/${item.id}`} className="text-[15px] font-medium text-[#1A0F1C] hover:text-[#8B1D8F]">{item.title}</Link>
                    <div className="mt-1 text-[13px] text-[#6B5A6F]">Category: {item.category}</div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="grid h-8 w-8 place-items-center rounded-full text-[#A38AA6] transition hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-[#F0E6F2] bg-[#FCF7FD] px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#4A354D] shadow-sm transition hover:text-[#8B1D8F]"><Minus className="h-3 w-3" /></button>
                    <span className="w-4 text-center text-[13px] font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#4A354D] shadow-sm transition hover:text-[#8B1D8F]"><Plus className="h-3 w-3" /></button>
                  </div>
                  <div className="text-[16px] font-semibold text-[#1A0F1C]">₹{item.price * item.quantity}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="rounded-3xl border border-[#F0E6F2] bg-[#FCF7FD] p-6 lg:h-fit">
          <h2 className="text-[18px] font-semibold text-[#1A0F1C]">Order Summary</h2>
          <div className="mt-6 space-y-4 text-[14px] text-[#4A354D]">
            <div className="flex justify-between">
              <span>Subtotal ({cartItems.length} items)</span>
              <span className="font-medium text-[#1A0F1C]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-[#0F8A4B]">Free</span>
            </div>
            <div className="flex justify-between border-t border-[#F0E6F2] pt-4 text-[18px] font-semibold text-[#1A0F1C]">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
          <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#8B1D8F] py-4 text-[15px] font-medium text-white transition hover:bg-[#7A187C]">
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
