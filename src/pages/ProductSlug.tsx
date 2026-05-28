import { useParams, Link } from "react-router-dom";
import { products } from "../data/mockData";
import { Star, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function ProductSlug() {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const { addToCart, wishlist, toggleWishlist } = useShop();

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-[#1A0F1C]">Product not found</h2>
        <Link to="/" className="mt-4 text-[#8B1D8F] hover:underline">Return to Home</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Images */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#FCF7FD]">
          <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
          <button 
            onClick={() => toggleWishlist(product.id)} 
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#6B5A6F] shadow-sm backdrop-blur transition-all hover:text-[#E91E7A]"
          >
            <Heart className={`h-5 w-5 transition ${isWishlisted ? "fill-[#E91E7A] text-[#E91E7A]" : ""}`} />
          </button>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-[#F3E7F5] px-3 py-1 text-[12px] font-medium text-[#7A187C]">{product.category}</span>
            {product.tag && <span className="rounded-full bg-[#1A0F1C] px-3 py-1 text-[12px] font-medium text-white">{product.tag}</span>}
          </div>
          
          <h1 className="text-[28px] font-semibold leading-tight text-[#1A0F1C] md:text-[36px]">{product.title}</h1>
          
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-[#F5A524] text-[#F5A524]" : "text-[#E8DDE9]"}`} />
              ))}
            </div>
            <span className="text-[14px] text-[#8B7A8F]">{product.rating} (128 reviews)</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3 border-b border-[#F0E6F2] pb-6">
            <span className="text-[32px] font-bold text-[#1A0F1C]">₹{product.price}</span>
            <span className="text-[18px] text-[#9A8A9D] line-through">₹{product.mrp}</span>
            <span className="rounded bg-[#E8F5E9] px-2 py-1 text-[13px] font-bold text-[#0F8A4B]">
              {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[15px] leading-relaxed text-[#5E4F63]">{product.description}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button 
              onClick={() => addToCart(product)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#1A0F1C] py-4 text-[15px] font-medium text-white transition hover:bg-black"
            >
              <ShoppingBag className="h-5 w-5" /> Add to Cart
            </button>
            <button className="flex items-center justify-center gap-2 rounded-full bg-[#8B1D8F] py-4 text-[15px] font-medium text-white transition hover:bg-[#7A187C]">
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 grid grid-cols-1 gap-4 rounded-2xl border border-[#F0E6F2] bg-[#FCF7FD] p-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-[#8B1D8F]" />
              <span className="text-[13px] font-medium text-[#2E1F31]">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-[#8B1D8F]" />
              <span className="text-[13px] font-medium text-[#2E1F31]">7-Day Returns</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#8B1D8F]" />
              <span className="text-[13px] font-medium text-[#2E1F31]">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
