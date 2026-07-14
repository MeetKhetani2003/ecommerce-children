import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";
import { checkAndSendWelcomeCoupon } from "@/utils/couponHelper";

export async function POST(req: Request) {
  try {
    const { email, addresses, defaultAddress } = await req.json();

    if (!email || !Array.isArray(addresses)) {
      return NextResponse.json(
        { success: false, message: "Invalid request payload. Email and addresses array are required." },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    user.addresses = addresses;
    if (typeof defaultAddress === "string") {
      user.defaultAddress = defaultAddress;
    } else if (addresses.length > 0 && !user.defaultAddress) {
      user.defaultAddress = addresses[0];
    } else if (addresses.length === 0) {
      user.defaultAddress = "";
    }

    await user.save();

    const generatedCouponCode = await checkAndSendWelcomeCoupon(user);

    return NextResponse.json({
      success: true,
      addresses: user.addresses,
      defaultAddress: user.defaultAddress,
      couponCode: generatedCouponCode
    });
  } catch (error: any) {
    console.error("Error updating user addresses:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
