/**
 * India States Product Importer Script
 * 
 * Reads Indian State Category.xlsx and uploads all products + images
 * from the "India States" folder to MongoDB (GridFS for images).
 * 
 * Run with: node scripts/import-india-states.cjs
 */

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const XLSX = require("xlsx");

// ─── Config ──────────────────────────────────────────────────────────────────
const MONGODB_URI = "mongodb://sahelishrungarecom_db_user:saheli2026@ac-jl2mrtd-shard-00-00.tt5mrdx.mongodb.net:27017,ac-jl2mrtd-shard-00-01.tt5mrdx.mongodb.net:27017,ac-jl2mrtd-shard-00-02.tt5mrdx.mongodb.net:27017/?ssl=true&replicaSet=atlas-62q3hn-shard-0&authSource=admin&appName=Cluster0";
const XLSX_PATH = path.join(__dirname, "../public/Indian State Category.xlsx");
const IMAGES_DIR = path.join(__dirname, "../public/India States");
const MAX_SIZE_BYTES = 500 * 1024; // 500KB

// ─── Product Schema (mirrors src/models/Product.ts) ──────────────────────────
const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  slug: { type: String, unique: true, sparse: true },
  sku: { type: String, unique: true, sparse: true },
  title: String,
  category: String,
  price: Number,
  mrp: Number,
  netPrice: Number,
  rating: { type: Number, default: 4.5 },
  stock: Number,
  image: String,
  images: [String],
  tag: String,
  description: String,
  features: String,
  whatsIncluded: [String],
  careInstructions: String,
  sizes: [{ size: String, stock: Number }],
  brand: { type: String, default: "Saheli Shrungar" },
  featured: { type: Boolean, default: false },
  cities: { type: [String], default: ["All"] },
  createdAt: { type: Date, default: Date.now },
});

// Generate a SKU slug from title
function generateSku(title, id) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return `${slug}-${id}`;
}

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// ─── GridFS Upload ────────────────────────────────────────────────────────────
async function uploadImageToGridFS(filePath, filename) {
  const db = mongoose.connection.db;
  const bucket = new GridFSBucket(db, { bucketName: "images" });

  const buffer = fs.readFileSync(filePath);
  const mimeType = filePath.endsWith(".png") ? "image/png" : "image/jpeg";

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimeType,
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
    uploadStream.end(buffer);
  });
}

// ─── Parse sizes string "3-4 Yrs:15, 5-6 Yrs:15, 7-8 Yrs:15" ──────────────
function parseSizes(sizesStr) {
  if (!sizesStr) return [];
  return sizesStr.split(",").map((s) => {
    const parts = s.trim().split(":");
    return {
      size: parts[0].trim(),
      stock: parseInt(parts[1] || "15", 10),
    };
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connected to MongoDB");

  // Read Excel
  console.log("📊 Reading Excel file...");
  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Skip header row (row 0)
  const dataRows = rows.slice(1).filter((row) => row[0]); // filter empty rows

  // Get the last product ID to auto-increment
  const lastProduct = await Product.findOne().sort({ id: -1 });
  let nextId = lastProduct ? lastProduct.id + 1 : 1001;

  // Check which product IDs already exist (by title to avoid duplicates)
  const existingTitles = new Set(
    (await Product.find({}, { title: 1 })).map((p) => p.title.trim().toLowerCase())
  );

  console.log(`📦 Found ${dataRows.length} products in Excel`);
  console.log(`🔢 Starting from ID: ${nextId}`);
  console.log(`🔄 Skipping ${existingTitles.size} already existing products\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of dataRows) {
    // Columns: 0=ID, 1=Title, 2=Category, 3=Tag, 4=NetCost, 5=Selling, 6=MRP,
    //          7=Sizes&Stock, 8=WhatsIncluded, 9=Features, 10=Care, 11=Description,
    //          12=Featured, 13=MainImageFile, 14=GalleryImageFiles
    const [
      _xlsxId, title, category, tag, netCost, sellingPrice, mrp,
      sizesStr, whatsIncluded, features, careInstructions, description,
      featuredRaw, mainImageFile, galleryFilesRaw
    ] = row;

    if (!title || !sellingPrice) {
      console.log(`⚠️  Skipping row — missing title or price`);
      continue;
    }

    const titleLower = String(title).trim().toLowerCase();
    if (existingTitles.has(titleLower)) {
      console.log(`⏭️  Skipping: "${title}" (already exists)`);
      skipped++;
      continue;
    }

    try {
      console.log(`📸 Processing: ${title}`);

      // ── Upload main image ──
      let mainImageUrl = "";
      const mainFile = mainImageFile ? String(mainImageFile).trim() : "";
      if (mainFile) {
        // Try with .jpg extension
        const candidates = [
          path.join(IMAGES_DIR, `${mainFile}.jpg`),
          path.join(IMAGES_DIR, `${mainFile}.jpeg`),
          path.join(IMAGES_DIR, `${mainFile}.png`),
          path.join(IMAGES_DIR, mainFile),
        ];
        const found = candidates.find((p) => fs.existsSync(p));
        if (found) {
          const stats = fs.statSync(found);
          if (stats.size > MAX_SIZE_BYTES) {
            console.log(`   ⚠️  Main image ${path.basename(found)} is ${Math.round(stats.size/1024)}KB (>500KB), uploading anyway...`);
          }
          const fileId = await uploadImageToGridFS(found, path.basename(found));
          mainImageUrl = `/api/image/${fileId}`;
          console.log(`   ✅ Main image uploaded: ${path.basename(found)}`);
        } else {
          console.log(`   ⚠️  Main image not found: ${mainFile} (tried .jpg/.jpeg/.png)`);
        }
      }

      // ── Upload gallery images ──
      const galleryUrls = [];
      if (galleryFilesRaw) {
        const galleryFiles = String(galleryFilesRaw).split(",").map((f) => f.trim());
        for (const gf of galleryFiles) {
          if (!gf) continue;
          const candidates = [
            path.join(IMAGES_DIR, `${gf}.jpg`),
            path.join(IMAGES_DIR, `${gf}.jpeg`),
            path.join(IMAGES_DIR, `${gf}.png`),
            path.join(IMAGES_DIR, gf),
          ];
          const found = candidates.find((p) => fs.existsSync(p));
          if (found) {
            const fileId = await uploadImageToGridFS(found, path.basename(found));
            galleryUrls.push(`/api/image/${fileId}`);
            console.log(`   ✅ Gallery image uploaded: ${path.basename(found)}`);
          } else {
            console.log(`   ⚠️  Gallery image not found: ${gf}`);
          }
        }
      }

      // ── Parse sizes ──
      const parsedSizes = parseSizes(String(sizesStr || ""));
      const totalStock = parsedSizes.reduce((s, sz) => s + sz.stock, 0);

      // ── Parse whatsIncluded ──
      const whatsIncludedArr = whatsIncluded
        ? String(whatsIncluded).split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      // ── Create product ──
      const product = new Product({
        id: nextId,
        sku: generateSku(String(title).trim(), nextId),
        slug: generateSku(String(title).trim(), nextId),
        title: String(title).trim(),
        category: String(category || "Indian State Costume").trim(),
        price: Number(sellingPrice),
        mrp: Number(mrp || sellingPrice),
        netPrice: Number(netCost || 0),
        tag: tag ? String(tag).trim() : undefined,
        description: description ? String(description).trim() : "",
        features: features ? String(features).trim() : "",
        whatsIncluded: whatsIncludedArr,
        careInstructions: careInstructions ? String(careInstructions).trim() : "",
        sizes: parsedSizes,
        stock: totalStock,
        image: mainImageUrl || "https://images.pexels.com/photos/8501698/pexels-photo-8501698.jpeg",
        images: galleryUrls.length > 0 ? galleryUrls : [],
        featured: String(featuredRaw).toLowerCase() === "true",
        brand: "Saheli Shrungar",
        rating: 4.5,
        cities: ["All"],
      });

      await product.save();
      nextId++;
      existingTitles.add(titleLower);
      created++;
      console.log(`   🎉 Created product ID ${product.id}: "${product.title}"\n`);

    } catch (err) {
      console.error(`   ❌ Error creating "${title}":`, err.message);
      errors++;
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log(`✅ Import Complete!`);
  console.log(`   Created:  ${created} products`);
  console.log(`   Skipped:  ${skipped} (already existed)`);
  console.log(`   Errors:   ${errors}`);
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

main().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
