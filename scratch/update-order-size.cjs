const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load .env.local variables manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

const OrderSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  items: Array,
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  const orderId = "6a464902f2b51b6f8d6dab70";
  const order = await Order.findOne({ _id: new mongoose.Types.ObjectId(orderId) });
  if (order && order.items && order.items.length > 0) {
    order.items[0].size = "5-6 Yrs";
    // Mark modified for subdocument array
    order.markModified("items");
    await order.save();
    console.log("Updated order items:", JSON.stringify(order.items, null, 2));
  } else {
    console.log("Order not found");
  }

  await mongoose.disconnect();
}

main().catch(console.error);
