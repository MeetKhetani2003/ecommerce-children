"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, User, ChevronDown } from "lucide-react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: "Your message has been sent successfully. We will get back to you soon!" });
        setFormData({ name: "", email: "", phone: "", reason: "General Inquiry", message: "" });
      } else {
        setStatus({ type: "error", message: data.error || "Failed to send message." });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCFE] py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-[32px] md:text-[42px] font-bold text-[#1A0F1C] tracking-tight mb-4">
            Get in Touch <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B1D8F] to-[#E91E7A]">With Us</span>
          </h1>
          <p className="text-[15px] text-[#6B5A6F] max-w-2xl mx-auto leading-relaxed">
            Have a question about our costumes, sizes, or wholesale orders? Our team is here to help you make your child's next event special.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-[#F0E6F2] shadow-[0_8px_30px_rgb(139,29,143,0.04)] hover:shadow-[0_8px_30px_rgb(139,29,143,0.08)] transition-all duration-300">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FCF7FD] text-[#8B1D8F] mb-6">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-[18px] font-bold text-[#1A0F1C] mb-2">Our Location</h3>
              <p className="text-[14px] text-[#6B5A6F] leading-relaxed">
                Saheli Shrungar Costumes<br />
                Mumbai, Maharashtra, India
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#F0E6F2] shadow-[0_8px_30px_rgb(139,29,143,0.04)] hover:shadow-[0_8px_30px_rgb(139,29,143,0.08)] transition-all duration-300">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FCF7FD] text-[#8B1D8F] mb-6">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-[18px] font-bold text-[#1A0F1C] mb-2">Email Us</h3>
              <p className="text-[14px] text-[#6B5A6F] leading-relaxed">
                sahelishrungarecom@gmail.com
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#F0E6F2] shadow-[0_8px_30px_rgb(139,29,143,0.04)] hover:shadow-[0_8px_30px_rgb(139,29,143,0.08)] transition-all duration-300">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FCF7FD] text-[#8B1D8F] mb-6">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="text-[18px] font-bold text-[#1A0F1C] mb-2">Call Us</h3>
              <p className="text-[14px] text-[#6B5A6F] leading-relaxed">
                +91 98765 43210<br />
                Mon-Sat from 10am to 7pm
              </p>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] p-6 md:p-10 border border-[#F0E6F2] shadow-[0_8px_30px_rgb(139,29,143,0.04)]">
              <h2 className="text-[24px] font-bold text-[#1A0F1C] mb-8">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-[#4A354D]">Full Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full h-[52px] rounded-2xl border border-[#EEDDF0] bg-[#FCF7FD] pl-11 pr-4 text-[14px] text-[#1A0F1C] outline-none transition-all focus:border-[#E1BFE6] focus:bg-white focus:ring-4 focus:ring-[#F3E7F5] placeholder:text-[#A38AA6]"
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#A38AA6]" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-[#4A354D]">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                        className="w-full h-[52px] rounded-2xl border border-[#EEDDF0] bg-[#FCF7FD] pl-11 pr-4 text-[14px] text-[#1A0F1C] outline-none transition-all focus:border-[#E1BFE6] focus:bg-white focus:ring-4 focus:ring-[#F3E7F5] placeholder:text-[#A38AA6]"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#A38AA6]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-[#4A354D]">Phone Number</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full h-[52px] rounded-2xl border border-[#EEDDF0] bg-[#FCF7FD] pl-11 pr-4 text-[14px] text-[#1A0F1C] outline-none transition-all focus:border-[#E1BFE6] focus:bg-white focus:ring-4 focus:ring-[#F3E7F5] placeholder:text-[#A38AA6]"
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#A38AA6]" />
                    </div>
                  </div>

                  {/* Reason Select */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-[#4A354D]">Inquiry Reason</label>
                    <div className="relative">
                      <select
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full h-[52px] appearance-none rounded-2xl border border-[#EEDDF0] bg-[#FCF7FD] pl-4 pr-11 text-[14px] text-[#1A0F1C] outline-none transition-all focus:border-[#E1BFE6] focus:bg-white focus:ring-4 focus:ring-[#F3E7F5]"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Size & Fit Help">Size & Fit Help</option>
                        <option value="Wholesale / Bulk Order">Wholesale / Bulk Order</option>
                        <option value="Order Tracking">Order Tracking</option>
                        <option value="Returns & Exchanges">Returns & Exchanges</option>
                        <option value="Other Feedback">Other Feedback</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#A38AA6] pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[#4A354D]">Your Message</label>
                  <div className="relative">
                    <textarea 
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className="w-full rounded-2xl border border-[#EEDDF0] bg-[#FCF7FD] p-4 pl-11 text-[14px] text-[#1A0F1C] outline-none transition-all focus:border-[#E1BFE6] focus:bg-white focus:ring-4 focus:ring-[#F3E7F5] placeholder:text-[#A38AA6] resize-none"
                    />
                    <MessageSquare className="absolute left-4 top-5 h-[18px] w-[18px] text-[#A38AA6]" />
                  </div>
                </div>

                {/* Status Message */}
                {status.type && (
                  <div className={`p-4 rounded-2xl text-[14px] font-medium ${status.type === "success" ? "bg-[#0F8A4B]/10 text-[#0F8A4B]" : "bg-red-50 text-red-600"}`}>
                    {status.message}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[56px] rounded-full bg-gradient-to-r from-[#8B1D8F] to-[#C2187B] text-[15px] font-semibold text-white shadow-lg shadow-[#8B1D8F]/20 hover:shadow-xl hover:shadow-[#8B1D8F]/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
