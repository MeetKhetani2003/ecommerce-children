import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const { orderId, trackingNumber, trackingLink } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { trackingNumber, trackingLink } },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Error updating tracking:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
