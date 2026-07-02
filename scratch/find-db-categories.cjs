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

const ProductSchema = new mongoose.Schema({
  category: String,
  image: String,
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  const categories = await Product.distinct("category");
  console.log("Distinct Categories in DB:", categories);

  for (const cat of categories) {
    const oneProd = await Product.findOne({ category: cat });
    console.log(`- Category: "${cat}" has sample image: "${oneProd ? oneProd.image : "none"}"`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
