import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  image: { type: String, required: true },
  tag: { type: String },
  description: { type: String },
  stock: { type: Number, default: 50 },
  material: { type: String },
  sizes: [{ type: String }],
  whatsIncluded: [{ type: String }],
  careInstructions: { type: String },
});

export const Product = models.Product || model("Product", ProductSchema);
