import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";
import { uploadToGridFS } from "@/utils/gridfs";


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
    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const mrp = formData.get("mrp") as string;
    const stock = formData.get("stock") as string;
    const description = formData.get("description") as string;
    const tag = formData.get("tag") as string;
    const material = formData.get("material") as string;
    const sizesStr = formData.get("sizes") as string;
    const whatsIncludedStr = formData.get("whatsIncluded") as string;
    const careInstructions = formData.get("careInstructions") as string;
    
    const imageFile = formData.get("image") as File | null;
    const imagesFiles = formData.getAll("images") as File[];

    if (!title || !category || !price || !mrp) {
      return NextResponse.json({ success: false, message: "Missing required product fields" }, { status: 400 });
    }

    await dbConnect();

    // Size limit check (500KB = 500 * 1024 bytes)
    const MAX_SIZE = 500 * 1024;
    
    let mainImageUrl = "https://images.pexels.com/photos/8501698/pexels-photo-8501698.jpeg"; // Default
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > MAX_SIZE) {
        return NextResponse.json({ success: false, message: "Main image exceeds 500KB limit" }, { status: 400 });
      }
      const fileId = await uploadToGridFS(imageFile);
      mainImageUrl = `/api/image/${fileId}`;
    }

    let detailedImageUrls: string[] = [];
    for (const file of imagesFiles) {
      if (file && file.size > 0) {
        if (file.size > MAX_SIZE) {
          return NextResponse.json({ success: false, message: `Image ${file.name} exceeds 500KB limit` }, { status: 400 });
        }
        const fileId = await uploadToGridFS(file);
        detailedImageUrls.push(`/api/image/${fileId}`);
      }
    }

    // Auto-generate a unique numerical id
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const nextId = lastProduct ? lastProduct.id + 1 : 101;

    // Generate SKU
    const catAbbrev = category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const sku = `SAH-${catAbbrev}-${nextId}-${randomNum}`;

    const sizes = sizesStr ? sizesStr.split(",").map(s => s.trim()) : [];
    const whatsIncluded = whatsIncludedStr ? whatsIncludedStr.split(",").map(s => s.trim()) : [];

    const product = await Product.create({
      id: nextId,
      sku,
      title,
      category,
      price: parseFloat(price),
      mrp: parseFloat(mrp),
      image: mainImageUrl,
      images: detailedImageUrls,
      stock: stock ? parseInt(stock) : 50,
      description: description || "",
      rating: 4.5,
      tag: tag || "",
      material: material || "",
      sizes,
      whatsIncluded,
      careInstructions: careInstructions || ""
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
