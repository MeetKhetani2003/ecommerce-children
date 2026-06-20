import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";
import { Coupon } from "@/models/Coupon";
import { sendWelcomeCouponEmail } from "@/utils/emailService";

export async function PUT(req: Request) {
  try {
    const { email, phone } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    // Find user first to check if they already have a phone number
    let user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isFirstTimePhone = !user.phone && phone;
    let generatedCouponCode = null;

    user.phone = phone;
    await user.save();

    if (isFirstTimePhone) {
      // Generate a unique 10% coupon code
      const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      generatedCouponCode = `WELCOME10-${uniqueSuffix}`;
      
      await Coupon.create({
        code: generatedCouponCode,
        discountPercent: 10,
        active: true
      });

      // Send the coupon to the user's email asynchronously
      sendWelcomeCouponEmail(user.email, user.name || "Customer", generatedCouponCode).catch((err) => {
        console.error("Failed to send welcome coupon email:", err);
      });
    }

    return NextResponse.json({ 
      success: true, 
      user, 
      couponCode: generatedCouponCode 
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
