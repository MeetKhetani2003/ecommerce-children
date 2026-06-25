import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// 1. Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined");
  process.exit(1);
}

const ProductSchema = new mongoose.Schema({
  id: Number,
  title: String,
  category: String,
  price: Number,
  mrp: Number,
  image: String,
  images: [String],
  stock: Number,
  sku: String,
  sizes: [{ size: String, stock: Number }]
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const totalCount = await Product.countDocuments();
    console.log(`Total products in database: ${totalCount}`);
    
    const animalProducts = await Product.find({ category: "Animal Costume" }).limit(5);
    console.log(`\nSample of 5 Animal Costume products:`);
    animalProducts.forEach(p => {
      console.log(`----------------------------------------`);
      console.log(`ID: ${p.id}`);
      console.log(`SKU: ${p.sku}`);
      console.log(`Title: ${p.title}`);
      console.log(`Category: ${p.category}`);
      console.log(`Price: ₹${p.price} (MRP: ₹${p.mrp})`);
      console.log(`Main Image: ${p.image}`);
      console.log(`Images Gallery:`, p.images);
      console.log(`Sizes:`, p.sizes.map(s => `${s.size}:${s.stock}`).join(", "));
      console.log(`Total Stock: ${p.stock}`);
    });
    console.log(`----------------------------------------`);
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
