import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  addresses: [{ type: String }],
  defaultAddress: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model("User", UserSchema);
