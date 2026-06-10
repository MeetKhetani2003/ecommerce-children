"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Mail, MapPin, Phone, Calendar, ArrowRight, ShoppingBag, Loader, Download } from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order ID was found in the checkout success URL.");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/admin/orders?orderId=${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          triggerInvoiceEmail(data.order._id);
        } else {
          setError(data.message || "Failed to load order details.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("An error occurred while loading your order summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const triggerInvoiceEmail = async (id: string) => {
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/checkout/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus("sent");
      } else {
        setEmailStatus("error");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      setEmailStatus("error");
    }
  };

  const handleDownloadPDF = () => {
    if (orderId) {
      window.location.href = `/api/checkout/download-invoice?orderId=${orderId}`;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-24 text-center md:py-36">
        <Loader className="h-10 w-10 animate-spin text-[#8B1D8F]" />
        <p className="mt-4 text-[15px] font-medium text-[#6B5A6F]">Loading invoice and preparing invoice bill...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-20 text-center md:py-32">
        <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-red-50 text-red-500 border border-red-100">
          <Loader className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-[22px] font-bold text-[#1A0F1C]">Order Inquiry Status</h2>
        <p className="mt-2 text-[14.5px] text-[#6B5A6F] max-w-[400px] leading-relaxed">
          {error || "We could not find the order details for this checkout."}
        </p>
        <Link href="/" className="mt-8 rounded-full bg-[#8B1D8F] px-7 py-3 text-[14px] font-semibold text-white hover:bg-[#7A187C] transition">
          Return to Shop Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 md:py-16" style={{ fontFamily: "Plus Jakarta Sans, Outfit, Inter, sans-serif" }}>
      {/* Success Banner Hero */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-green-50 text-green-500 border-2 border-green-200 shadow-lg shadow-green-100"
        >
          <CheckCircle className="h-10 w-10 text-green-500" />
        </motion.div>
        
        <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#1A0F1C] tracking-tight">Order Placed Successfully!</h1>
        <p className="mt-2 text-[15px] text-[#6B5A6F] max-w-[500px] mx-auto leading-relaxed">
          Thank you for your order. Your kids' fancy dress costume reservation is complete. Let's make school event stars shine!
        </p>

        {/* Email Invoice Dispatch Status Badge */}
        <div className="mt-4 flex justify-center">
          {emailStatus === "sending" && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 border border-yellow-200 px-3.5 py-1 text-[12.5px] font-medium text-yellow-700">
              <Loader className="h-3.5 w-3.5 animate-spin" />
              <span>Sending invoice email to <strong>{order.email}</strong>...</span>
            </div>
          )}
          {emailStatus === "sent" && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3.5 py-1 text-[12.5px] font-medium text-green-700">
              <Mail className="h-3.5 w-3.5" />
              <span>Invoice email successfully sent to <strong>{order.email}</strong>!</span>
            </div>
          )}
          {emailStatus === "error" && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3.5 py-1 text-[12.5px] font-medium text-red-700">
              <Mail className="h-3.5 w-3.5" />
              <span>Could not deliver email. You can copy the invoice below.</span>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Card Container */}
      <div className="rounded-3xl border border-[#F0E6F2] bg-white p-6 md:p-10 shadow-xl shadow-[#8B1D8F]/5 print:border-none print:shadow-none">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#F8F0F9] pb-6 mb-6">
          <div>
            <div className="text-[20px] font-bold text-[#8B1D8F]">Saheli Shrungar</div>
            <div className="text-[12px] text-[#8B7A8F] mt-1">Premium Kids Costumes Delivery</div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[13px] text-[#8B7A8F]">Invoice Order ID</div>
            <div className="font-mono text-[14px] font-bold text-[#1A0F1C] mt-0.5">{order._id}</div>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FCF7FD]/60 border border-[#F0E6F2] rounded-2xl p-5 mb-8 text-[13.5px]">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[#4A354D]">
              <Calendar className="h-4 w-4 text-[#A38AA6]" />
              <span><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
            </div>
            <div className="flex items-center gap-2 text-[#4A354D]">
              <CheckCircle className="h-4 w-4 text-[#A38AA6]" />
              <span><strong>Payment Status:</strong> <span className="text-green-700 font-semibold">Paid (Razorpay Secured)</span></span>
            </div>
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-start gap-2 text-[#4A354D]">
              <MapPin className="h-4 w-4 text-[#A38AA6] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <strong>Shipping Address:</strong>
                <p className="mt-0.5 text-[#6B5A6F] leading-relaxed break-words">{order.shippingDetails.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#4A354D]">
              <Phone className="h-4 w-4 text-[#A38AA6]" />
              <span><strong>Phone Number:</strong> {order.shippingDetails.phone}</span>
            </div>
          </div>
        </div>

        {/* Invoice Items List */}
        <div className="mb-8">
          <h3 className="text-[15px] font-semibold text-[#1A0F1C] border-b border-[#F0E6F2] pb-2.5 mb-4">Reserved Costumes</h3>
          <div className="space-y-4">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4 py-1.5 border-b border-[#F8F0F9] last:border-b-0">
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-[#1A0F1C] truncate">{item.title}</div>
                  <div className="text-[12px] text-[#8B7A8F] mt-0.5">Quantity: {item.quantity} x Price: ₹{item.price}</div>
                </div>
                <div className="text-[14.5px] font-bold text-[#1A0F1C] shrink-0">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Table */}
        <div className="w-full sm:w-[280px] ml-auto space-y-3.5 text-[14px] text-[#4A354D] border-t border-[#F0E6F2] pt-5">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-[#1A0F1C]">₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Promo Discount:</span>
              <span className="font-semibold">-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-[#0F8A4B]">
            <span>Shipping:</span>
            <span className="font-semibold">Free Express</span>
          </div>
          <div className="flex justify-between border-t border-[#F0E6F2] pt-3 text-[17px] font-extrabold text-[#1A0F1C]">
            <span>Total Bill Paid:</span>
            <span className="text-[#8B1D8F]">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
        <button
          onClick={handleDownloadPDF}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#EEDDF0] bg-white px-6 py-3 text-[14px] font-semibold text-[#3A2A3D] hover:bg-[#FCF7FD] transition cursor-pointer"
        >
          <Download className="h-4.5 w-4.5" />
          <span>Download PDF Invoice</span>
        </button>

        <Link
          href="/profile"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#FCF7FD] border border-[#F3E7F5] px-6 py-3 text-[14px] font-semibold text-[#8B1D8F] hover:bg-[#F3E7F5]/40 transition"
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          <span>View Order Status</span>
        </Link>

        <Link
          href="/"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#8B1D8F] px-7 py-3.5 text-[14px] font-bold text-white hover:bg-[#7A187C] transition shadow-md shadow-[#8B1D8F]/10"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-24 text-center md:py-36">
        <Loader className="h-10 w-10 animate-spin text-[#8B1D8F]" />
        <p className="mt-4 text-[15px] font-medium text-[#6B5A6F]">Loading invoice...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
