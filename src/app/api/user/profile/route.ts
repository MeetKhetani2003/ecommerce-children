import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";
import { checkAndSendWelcomeCoupon } from "@/utils/couponHelper";

export async function PUT(req: Request) {
  try {
    const { email, phone } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    // Prevent updating synthetic admin user in the database
    if (email === "admin@saheli.internal") {
      return NextResponse.json({ 
        success: true, 
        user: { name: "Admin", email, phone, role: "admin", addresses: [] },
        couponCode: null 
      });
    }

    // Find user first to check if they already have a phone number
    let user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    user.phone = phone;
    await user.save();

    const generatedCouponCode = await checkAndSendWelcomeCoupon(user);

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
