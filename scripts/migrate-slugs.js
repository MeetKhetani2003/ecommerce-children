import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// 1. Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
console.log(`Loading environment variables from: ${envPath}`);

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
  console.error("❌ MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// 2. Define schema
const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true }
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully to MongoDB.");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check/migrate.`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const p of products) {
      // Generate clean base slug from title
      const baseSlug = String(p.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      // Check if this product already has a slug and it matches the generated slug
      // If it already has a valid slug, we can skip it, or if we want to overwrite, we do so
      // Let's make sure it has a slug, if it doesn't we generate it
      if (p.slug) {
        console.log(`ℹ️ Product ID ${p.id} already has slug: "${p.slug}". Skipping.`);
        skippedCount++;
        continue;
      }

      // Ensure uniqueness
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await Product.findOne({ slug, id: { $ne: p.id } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Save to DB
      p.slug = slug;
      await p.save();
      console.log(`✅ Migrated Product ID ${p.id} (${p.title}) ➡️ "${slug}"`);
      migratedCount++;
    }

    console.log("\n==================================================");
    console.log("📊 Slug Migration Summary:");
    console.log(`   - Slugs Migrated: ${migratedCount}`);
    console.log(`   - Products Skipped (already had slug): ${skippedCount}`);
    console.log("==================================================");

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

run();
