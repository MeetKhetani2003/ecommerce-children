import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";

export async function PUT(req: Request) {
  try {
    const { email, phone } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { phone } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
