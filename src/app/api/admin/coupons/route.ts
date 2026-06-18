import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Coupon } from "@/models/Coupon";

export async function GET() {
  try {
    await dbConnect();
    const coupons = await Coupon.find().sort({ expiresAt: -1 });
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await dbConnect();

    // ensure code is uppercase
    if (body.code) body.code = body.code.toUpperCase();

    const coupon = await Coupon.create(body);
    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    }

    await dbConnect();
    await Coupon.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
