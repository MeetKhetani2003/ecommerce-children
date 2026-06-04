import mongoose from "mongoose";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { products } from "@/data/mockData";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Run auto-seeding
    await seedDatabase();
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

async function seedDatabase() {
  try {
    // Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const formattedProducts = products.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        mrp: p.mrp,
        rating: p.rating,
        image: p.image,
        tag: p.tag,
        description: p.description || "Premium costume set, perfect for school events, festivals, and parties.",
        stock: 50, // default stock count
        material: p.material || "Soft, comfortable kid-safe fabrics",
        sizes: p.sizes || ["3-4 Yrs", "5-6 Yrs", "7-8 Yrs"],
        whatsIncluded: p.whatsIncluded || ["Main Costume Accessories"],
        careInstructions: p.careInstructions || "Dry clean or gentle hand wash."
      }));
      await Product.insertMany(formattedProducts);
    }

    // Seed Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      const defaultCoupons = [
        { code: "WELCOME10", discountPercent: 10, active: true },
        { code: "FESTIVE20", discountPercent: 20, active: true },
        { code: "SAHELI25", discountPercent: 25, active: true }
      ];
      await Coupon.insertMany(defaultCoupons);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export default dbConnect;
