import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Reservation } from "@/models/Reservation";
import { Coupon } from "@/models/Coupon";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { cartItems, shippingDetails, email, couponCode, userId } = await req.json();

    if (!cartItems || cartItems.length === 0 || !shippingDetails || !email) {
      return NextResponse.json({ success: false, message: "Missing required details" }, { status: 400 });
    }

    await dbConnect();

    // 1. Validate Stock and fetch products
    const itemsToOrder = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = await Product.findOne({ id: item.id });
      if (!product) {
        return NextResponse.json({ success: false, message: `Product ${item.title} not found` }, { status: 404 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `Insufficient stock for ${product.title}. Only ${product.stock} left.`
        }, { status: 400 });
      }

      subtotal += product.price * item.quantity;
      itemsToOrder.push({
        productDocument: product,
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // 2. Calculate Coupon Discount
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon) {
        if (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) {
          discount = Math.round((subtotal * coupon.discountPercent) / 100);
        }
      }
    }

    const total = subtotal - discount;

    // 3. Deduct Stock Temporarily (Reservation)
    for (const item of itemsToOrder) {
      item.productDocument.stock -= item.quantity;
      await item.productDocument.save();
    }

    // 4. Create local pending Order
    const localOrder = await Order.create({
      userId: userId || email,
      email,
      items: itemsToOrder.map(item => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingDetails,
      subtotal,
      discount,
      total,
      couponUsed: couponCode || null,
      paymentStatus: "pending",
      shippingStatus: "Processing"
    });

    // 5. Create Stock Reservation entry (expires in 10 minutes)
    await Reservation.create({
      orderId: localOrder._id,
      items: itemsToOrder.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      active: true
    });

    // 6. Initiate Razorpay Order
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    const isPlaceholder = key_id === "rzp_test_placeholder" || key_secret === "placeholder_secret";

    let rzpOrderId = "";
    let rzpAmount = total * 100;

    if (isPlaceholder) {
      rzpOrderId = "mock_rzp_" + Math.random().toString(36).substring(2, 11);
    } else {
      const razorpay = new Razorpay({
        key_id,
        key_secret
      });

      const rzpOrder = await razorpay.orders.create({
        amount: total * 100, // Razorpay works in paise
        currency: "INR",
        receipt: localOrder._id.toString()
      });
      rzpOrderId = rzpOrder.id;
      rzpAmount = typeof rzpOrder.amount === "string" ? parseInt(rzpOrder.amount, 10) : rzpOrder.amount;
    }

    // Update local order with Razorpay Order ID
    localOrder.razorpayOrderId = rzpOrderId;
    await localOrder.save();

    return NextResponse.json({
      success: true,
      orderId: localOrder._id.toString(),
      razorpayOrderId: rzpOrderId,
      amount: rzpAmount,
      key: key_id
    });

  } catch (error: any) {
    console.error("Error creating checkout order:", error);
    return NextResponse.json({ success: false, message: error.message || "Server checkout error" }, { status: 500 });
  }
}
