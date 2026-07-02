import { NextResponse } from "next/server";
import { getShiprocketShippingCharge } from "@/utils/shiprocket";

export async function POST(req: Request) {
  try {
    const { pincode, weight, isCod, declaredValue } = await req.json();

    if (!pincode) {
      return NextResponse.json({ success: false, message: "Pincode is required" }, { status: 400 });
    }

    const pkgWeight = parseFloat(weight) || 0.5;
    const val = parseFloat(declaredValue) || 100;

    const shippingFee = await getShiprocketShippingCharge(
      pincode.toString(),
      pkgWeight,
      !!isCod,
      val
    );

    return NextResponse.json({ success: true, shippingFee });
  } catch (err: any) {
    console.error("Error in shipping calculation route:", err);
    return NextResponse.json({ success: false, message: err.message || "Failed to calculate shipping charge" }, { status: 500 });
  }
}
