import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { generateShippingLabelPDF } from "@/utils/shiprocket";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const print = searchParams.get("print") === "true";

    if (!orderId) {
      return new Response("Order ID is required", { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    console.log(`[Shipping Label API] Generating PDF for Order ID: ${orderId} (print: ${print})...`);
    const pdfBuffer = await generateShippingLabelPDF(orderId, print);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": print 
          ? `inline; filename="ShippingLabel_${orderId}.pdf"`
          : `attachment; filename="ShippingLabel_${orderId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating shipping label PDF:", error);
    return new Response(error.message || "Failed to generate shipping label PDF", { status: 500 });
  }
}
