import { ShieldCheck, X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[480px] overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F0E6F2] p-5">
          <h3 className="text-[16px] font-semibold text-[#1A0F1C] flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-[#8B1D8F]" /> Size Chart & Guide
          </h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-[12.5px] text-[#6B5A6F] mb-4">Please measure your child's height and chest to select the perfect event costume size.</p>

          <table className="w-full border-collapse text-[13px] text-[#4A354D]">
            <thead>
              <tr className="bg-[#FCF7FD] text-[#8B7A8F] font-semibold border-b border-[#EEDDF0]">
                <th className="p-2.5 text-left">Age Group</th>
                <th className="p-2.5 text-center">Standard Size</th>
                <th className="p-2.5 text-right">Height</th>
                <th className="p-2.5 text-right">Chest</th>
              </tr>
            </thead>
            <tbody>
              {[
                { age: "2-3 Years", size: "Size 24", height: "32 - 36 in", chest: "22 in" },
                { age: "4-5 Years", size: "Size 26", height: "36 - 40 in", chest: "24 in" },
                { age: "6-7 Years", size: "Size 28", height: "40 - 44 in", chest: "26 in" },
                { age: "8-9 Years", size: "Size 30", height: "44 - 48 in", chest: "28 in" },
                { age: "10-12 Years", size: "Size 32", height: "48 - 52 in", chest: "30 in" },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-[#F8F0F9] last:border-0 hover:bg-[#FCF7FD]/30">
                  <td className="p-2.5 font-medium text-[#1A0F1C]">{row.age}</td>
                  <td className="p-2.5 text-center font-semibold text-[#8B1D8F]">{row.size}</td>
                  <td className="p-2.5 text-right">{row.height}</td>
                  <td className="p-2.5 text-right">{row.chest}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 rounded-xl bg-[#FCF7FD] p-3 text-[11.5px] text-gray-500 border border-[#F0E6F2]">
            <strong>Fitting Tip:</strong> If your child is between sizes, we recommend ordering one size larger for a comfortable, loose stage fit.
          </div>

          <button onClick={onClose} className="mt-6 w-full rounded-full bg-[#1A0F1C] py-3 text-[14px] font-semibold text-white hover:bg-black">
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
