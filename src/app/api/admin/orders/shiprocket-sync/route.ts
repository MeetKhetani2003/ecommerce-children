import { NextResponse } from "next/server";
import { createShiprocketShipmentAndAwb } from "@/utils/shiprocket";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }
    
    console.log(`[Manual Shiprocket Sync] Syncing order ${orderId}...`);
    const result = await createShiprocketShipmentAndAwb(orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Manual Shiprocket sync failed:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to sync with Shiprocket" }, { status: 500 });
  }
}
