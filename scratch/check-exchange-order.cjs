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
  shippingDetails: Object,
  exchangeRequested: Boolean,
  exchangeDetails: Object,
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  const order = await Order.findOne({ _id: new mongoose.Types.ObjectId("6a464bf1f2b51b6f8d6dab81") })
                || await Order.findOne({ _id: { $gt: new mongoose.Types.ObjectId("6a4640000000000000000000") } });
  
  if (order) {
    console.log("Found order ID:", order._id.toString());
    console.log("Shipping Details:", JSON.stringify(order.shippingDetails, null, 2));
    console.log("Items:", JSON.stringify(order.items, null, 2));
    console.log("Exchange Requested:", order.exchangeRequested);
    console.log("Exchange Details:", JSON.stringify(order.exchangeDetails, null, 2));
  } else {
    console.log("Order not found");
  }

  await mongoose.disconnect();
}

main().catch(console.error);
