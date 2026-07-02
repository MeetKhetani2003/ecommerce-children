import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { orderId, newSizes } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Eligibility check: 7 days limit from delivery
    const referenceDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.createdAt);
    const orderAgeInDays = (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
    if (orderAgeInDays > 7) {
      return NextResponse.json({ success: false, message: "Exchanges are only allowed within 7 days of delivery" }, { status: 400 });
    }

    if (order.shippingStatus === "Cancelled") {
      return NextResponse.json({ success: false, message: "Cancelled orders cannot be exchanged" }, { status: 400 });
    }

    // Verify stock availability for new sizes before initiating payment
    if (newSizes && newSizes.length > 0) {
      for (const reqItem of newSizes) {
        const orderItem = order.items.find((item: any) =>
          item.productId === reqItem.productId &&
          (item.size === reqItem.oldSize || (!item.size && reqItem.oldSize === "Std"))
        );
        if (!orderItem) {
          return NextResponse.json({
            success: false,
            message: `Item with product ID ${reqItem.productId} and size ${reqItem.oldSize} not found in this order`
          }, { status: 400 });
        }

        // If size is actually changing, check stock
        if (reqItem.newSize && reqItem.newSize !== orderItem.size) {
          const product = await Product.findOne({ id: reqItem.productId });
          if (!product) {
            return NextResponse.json({ success: false, message: `Product not found: ${orderItem.title}` }, { status: 400 });
          }

          if (product.sizes && product.sizes.length > 0) {
            const newSizeObj = product.sizes.find((s: any) => s.size === reqItem.newSize);
            if (!newSizeObj) {
              return NextResponse.json({ success: false, message: `Size ${reqItem.newSize} is not available for ${product.title}` }, { status: 400 });
            }
            if (newSizeObj.stock < orderItem.quantity) {
              return NextResponse.json({
                success: false,
                message: `Insufficient stock for size ${reqItem.newSize} of ${product.title} (Available: ${newSizeObj.stock})`
              }, { status: 400 });
            }
          }
        }
      }
    }

    // Calculate exchange shipping fee from Shiprocket or use flat fee
    const flatExchangeFee = 120;

    // Online Payment Only — Create Razorpay Order
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    const isPlaceholder = key_id === "rzp_test_placeholder" || key_secret === "placeholder_secret";

    let rzpOrderId = "";
    let rzpAmount = flatExchangeFee * 100; // In paise

    if (isPlaceholder) {
      rzpOrderId = "mock_rzp_exchange_" + Math.random().toString(36).substring(2, 11);
    } else {
      const razorpay = new Razorpay({ key_id, key_secret });
      const rzpOrder = await razorpay.orders.create({
        amount: rzpAmount,
        currency: "INR",
        receipt: `exchange_${order._id.toString().substring(0, 10)}`
      });
      rzpOrderId = rzpOrder.id;
      rzpAmount = typeof rzpOrder.amount === "string" ? parseInt(rzpOrder.amount, 10) : rzpOrder.amount;
    }

    return NextResponse.json({
      success: true,
      isCod: false,
      razorpayOrderId: rzpOrderId,
      amount: rzpAmount,
      key: key_id
    });

  } catch (error: any) {
    console.error("Error processing order exchange:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
