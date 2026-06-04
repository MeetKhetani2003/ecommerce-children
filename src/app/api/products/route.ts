import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ id: 1 });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, price, mrp, image, stock, description } = body;

    if (!title || !category || !price || !mrp || !image) {
      return NextResponse.json({ success: false, message: "Missing required product fields" }, { status: 400 });
    }

    await dbConnect();

    // Auto-generate a unique numerical id
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const nextId = lastProduct ? lastProduct.id + 1 : 101;

    const product = await Product.create({
      id: nextId,
      title,
      category,
      price: parseFloat(price),
      mrp: parseFloat(mrp),
      image,
      stock: stock ? parseInt(stock) : 50,
      description: description || "",
      rating: 4.5,
      material: "Premium fabric",
      sizes: ["3-4 Yrs", "5-6 Yrs", "7-8 Yrs"],
      whatsIncluded: ["Main Costume"],
      careInstructions: "Gentle wash"
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
