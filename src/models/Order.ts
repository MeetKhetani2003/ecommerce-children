import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  items: [
    {
      productId: { type: Number, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
    },
  ],
  shippingDetails: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponUsed: { type: String },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  shippingStatus: { type: String, enum: ["Processing", "Shipped", "Delivered", "Cancelled"], default: "Processing" },
  trackingNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Order = models.Order || model("Order", OrderSchema);
