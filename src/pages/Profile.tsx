import { User, MapPin, Package, Heart, LogOut } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { Link } from "react-router-dom";

export default function Profile() {
  const { wishlist } = useShop();

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        
        {/* Sidebar */}
        <div className="flex flex-col gap-2">
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#F0E6F2] p-5">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#8B1D8F] to-[#E91E7A] text-[18px] font-bold text-white">
              JD
            </div>
            <div>
              <div className="text-[16px] font-semibold text-[#1A0F1C]">John Doe</div>
              <div className="text-[13px] text-[#6B5A6F]">john.doe@example.com</div>
            </div>
          </div>

          {[
            { icon: User, label: "Personal Information", active: true },
            { icon: Package, label: "My Orders" },
            { icon: Heart, label: "Wishlist", badge: wishlist.length > 0 ? wishlist.length : undefined },
            { icon: MapPin, label: "Saved Addresses" },
          ].map((item) => (
            <button key={item.label} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium transition ${item.active ? "bg-[#8B1D8F] text-white" : "text-[#4A354D] hover:bg-[#FCF7FD]"}`}>
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[11px] ${item.active ? "bg-white text-[#8B1D8F]" : "bg-[#F3E7F5] text-[#8B1D8F]"}`}>{item.badge}</span>
              )}
            </button>
          ))}
          <button className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium text-red-500 transition hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>

        {/* Content Area */}
        <div className="rounded-3xl border border-[#F0E6F2] p-6 md:p-8">
          <h2 className="text-[20px] font-semibold text-[#1A0F1C]">Personal Information</h2>
          <p className="mt-1 text-[14px] text-[#6B5A6F]">Manage your personal details and account settings.</p>

          <form className="mt-8 grid gap-6 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">First Name</label>
              <input type="text" defaultValue="John" className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none transition focus:border-[#E1BFE6] focus:ring-4 focus:ring-[#F3E7F5]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Last Name</label>
              <input type="text" defaultValue="Doe" className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none transition focus:border-[#E1BFE6] focus:ring-4 focus:ring-[#F3E7F5]" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Email Address</label>
              <input type="email" defaultValue="john.doe@example.com" disabled className="h-11 w-full rounded-xl border border-[#EEDDF0] bg-[#FCF7FD] px-4 text-[14px] text-[#8B7A8F] outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[13px] font-medium text-[#4A354D]">Phone Number</label>
              <input type="tel" defaultValue="+91 98765 43210" className="h-11 w-full rounded-xl border border-[#EEDDF0] px-4 text-[14px] outline-none transition focus:border-[#E1BFE6] focus:ring-4 focus:ring-[#F3E7F5]" />
            </div>
            <div className="pt-4 md:col-span-2">
              <button className="rounded-full bg-[#1A0F1C] px-8 py-3 text-[14px] font-medium text-white transition hover:bg-black">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
