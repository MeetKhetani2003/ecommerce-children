import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Reservation } from "@/models/Reservation";
import { Coupon } from "@/models/Coupon";
import Razorpay from "razorpay";
import { createShiprocketShipmentAndAwb } from "@/utils/shiprocket";

export async function POST(req: Request) {
  try {
    const { cartItems, shippingDetails, email, couponCode, userId, paymentMethod } = await req.json();

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

      // Check size-specific stock if sizes exist
      if (product.sizes && product.sizes.length > 0 && item.selectedSize) {
        const sizeObj = product.sizes.find((s: any) => s.size === item.selectedSize);
        if (!sizeObj) {
          return NextResponse.json({
            success: false,
            message: `Size ${item.selectedSize} is not available for ${product.title}.`
          }, { status: 400 });
        }
        if (sizeObj.stock < item.quantity) {
          return NextResponse.json({
            success: false,
            message: `Insufficient stock for ${product.title} (${sizeObj.size}). Only ${sizeObj.stock} left.`
          }, { status: 400 });
        }
      } else {
        if (product.stock < item.quantity) {
          return NextResponse.json({
            success: false,
            message: `Insufficient stock for ${product.title}. Only ${product.stock} left.`
          }, { status: 400 });
        }
      }

      subtotal += product.price * item.quantity;
      itemsToOrder.push({
        productDocument: product,
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        selectedSize: item.selectedSize || ""
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
    let calculatedShippingFee = 0;

    if (paymentMethod === "cod") {
      try {
        const { parseAddressAndGetLocation, getShiprocketShippingCharge } = await import("@/utils/shiprocket");
        const addressInfo = await parseAddressAndGetLocation(shippingDetails.address);
        const totalQty = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
        const weight = Math.max(0.5, totalQty * 0.5);
        calculatedShippingFee = await getShiprocketShippingCharge(
          addressInfo.pincode,
          weight,
          true,
          total
        );
      } catch (shippingErr) {
        console.error("Failed to calculate shipping charge on order creation:", shippingErr);
        calculatedShippingFee = 80; // Fallback
      }
    }

    const grandTotal = total + calculatedShippingFee;

    // 3. Deduct Stock Temporarily (Reservation)
    for (const item of itemsToOrder) {
      if (item.productDocument.sizes && item.productDocument.sizes.length > 0 && item.selectedSize) {
        const sizeObj = item.productDocument.sizes.find((s: any) => s.size === item.selectedSize);
        if (sizeObj) {
          sizeObj.stock -= item.quantity;
          if (sizeObj.stock <= 0) {
            try {
              const { sendOutOfStockEmail } = await import("@/utils/emailService");
              await sendOutOfStockEmail(item.title, item.productId, item.selectedSize);
            } catch (err) {
              console.error("Failed to send out of stock alert:", err);
            }
          }
        }
      }
      item.productDocument.stock -= item.quantity;
      if (item.productDocument.stock <= 0) {
        try {
          const { sendOutOfStockEmail } = await import("@/utils/emailService");
          await sendOutOfStockEmail(item.title, item.productId, null);
        } catch (err) {
          console.error("Failed to send out of stock alert:", err);
        }
      }
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
        image: item.image,
        size: item.selectedSize || null
      })),
      shippingDetails,
      subtotal,
      discount,
      shippingFee: calculatedShippingFee,
      total: grandTotal,
      couponUsed: couponCode || null,
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "online",
      shippingStatus: "Processing"
    });

    // If Cash on Delivery and shipping fee is 0, we can bypass Razorpay flow entirely
    if (paymentMethod === "cod" && calculatedShippingFee === 0) {
      await Reservation.create({
        orderId: localOrder._id,
        items: itemsToOrder.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.selectedSize || null
        })),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        active: false // Inactive since it's COD
      });

      // Integrate with Shiprocket automatically for COD
      try {
        await createShiprocketShipmentAndAwb(localOrder._id.toString());
      } catch (shiprocketError) {
        console.error("[Shiprocket Auto-Integration COD] Failed to create order/shipment:", shiprocketError);
      }

      return NextResponse.json({
        success: true,
        orderId: localOrder._id.toString(),
        isCod: true,
        amount: 0
      });
    }

    // 5. Create Stock Reservation entry (expires in 10 minutes)
    await Reservation.create({
      orderId: localOrder._id,
      items: itemsToOrder.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.selectedSize || null
      })),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      active: true
    });

    // 6. Initiate Razorpay Order
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    const isPlaceholder = key_id === "rzp_test_placeholder" || key_secret === "placeholder_secret";

    let rzpOrderId = "";
    // If COD, they pay shippingFee online. If Prepaid, they pay total online.
    const amountToPayOnline = paymentMethod === "cod" ? calculatedShippingFee : total;
    let rzpAmount = amountToPayOnline * 100;

    if (isPlaceholder) {
      rzpOrderId = "mock_rzp_" + Math.random().toString(36).substring(2, 11);
    } else {
      const razorpay = new Razorpay({
        key_id,
        key_secret
      });

      const rzpOrder = await razorpay.orders.create({
        amount: rzpAmount, // Razorpay works in paise
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
      key: key_id,
      isCod: paymentMethod === "cod"
    });

  } catch (error: any) {
    console.error("Error creating checkout order:", error);
    return NextResponse.json({ success: false, message: error.message || "Server checkout error" }, { status: 500 });
  }
}
