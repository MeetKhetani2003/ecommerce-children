import { Schema, model, models } from "mongoose";

const BannerSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String, required: true },
  ctaText: { type: String, default: "Shop Now" },
  ctaLink: { type: String, default: "/products" },
  active: { type: Boolean, default: true },
  eyebrow: { type: String },
  badge: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Banner = models.Banner || model("Banner", BannerSchema);
