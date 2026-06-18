import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Banner } from "@/models/Banner";

export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { uploadToGridFS } from "@/utils/gridfs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const ctaText = formData.get("ctaText") as string;
    const ctaLink = formData.get("ctaLink") as string;
    const eyebrow = formData.get("eyebrow") as string;
    const badge = formData.get("badge") as string;
    const active = formData.get("active") === "true";
    
    const imageFile = formData.get("image") as File | null;

    if (!title) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    await dbConnect();

    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      const fileId = await uploadToGridFS(imageFile);
      imageUrl = `/api/image/${fileId}`;
    } else {
      return NextResponse.json({ success: false, message: "Image is required" }, { status: 400 });
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || "",
      image: imageUrl,
      ctaText: ctaText || "Shop Now",
      ctaLink: ctaLink || "/products",
      eyebrow: eyebrow || "",
      badge: badge || "",
      active,
    });
    
    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;
    if (!_id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await dbConnect();
    const banner = await Banner.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await dbConnect();
    await Banner.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
