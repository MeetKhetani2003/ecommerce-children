import { NextResponse } from "next/server";
import { syncShiprocketTracking } from "@/utils/shiprocket";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }
    
    console.log(`[Manual Tracking Sync] Syncing tracking for order ${orderId}...`);
    const result = await syncShiprocketTracking(orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Manual tracking sync failed:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to sync tracking" }, { status: 500 });
  }
}
