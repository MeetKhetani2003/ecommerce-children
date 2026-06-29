import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

const ProductSchema = new mongoose.Schema({ category: String });
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const categories = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  console.log(categories);
  await mongoose.disconnect();
}

run().catch(console.error);
