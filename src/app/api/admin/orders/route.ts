import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    await dbConnect();
    
    let query = {};
    if (email) {
      query = { email };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orderId, shippingStatus, trackingNumber } = await req.json();

    if (!orderId || !shippingStatus) {
      return NextResponse.json({ success: false, message: "Order ID and status are required" }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Restore stock if transitioning to "Cancelled"
    if (shippingStatus === "Cancelled" && order.shippingStatus !== "Cancelled") {
      for (const item of order.items) {
        const product = await Product.findOne({ id: item.productId });
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.shippingStatus = shippingStatus;
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();
    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
