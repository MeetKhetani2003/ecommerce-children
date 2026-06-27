import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import { GridFSBucket } from "mongodb";

let bucket;

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
      // Strip outer quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

import { execSync } from "child_process";

const originalUri = process.env.MONGODB_URI;
if (!originalUri) {
  console.error("❌ MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

function resolveSrvUriSync(uri) {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }
  console.log("🔄 Translating mongodb+srv connection URI to standard connection string...");
  const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)([^?]*)(.*)$/);
  if (!match) return uri;
  const [_, username, password, host, pathName, queryStr] = match;
  try {
    const srvCmd = `nslookup -type=SRV _mongodb._tcp.${host}`;
    const srvOutput = execSync(srvCmd, { encoding: "utf8" });
    const hostnames = [];
    const srvLines = srvOutput.split("\n");
    for (const line of srvLines) {
      if (line.includes("svr hostname")) {
        const parts = line.split("=");
        if (parts.length > 1) {
          hostnames.push(parts[1].trim() + ":27017");
        }
      }
    }
    if (hostnames.length === 0) {
      throw new Error("Could not parse SRV hostnames from nslookup output");
    }
    const hostsList = hostnames.join(",");
    let txtOptions = "";
    try {
      const txtCmd = `nslookup -type=TXT ${host}`;
      const txtOutput = execSync(txtCmd, { encoding: "utf8" });
      const txtLines = txtOutput.split("\n");
      for (const line of txtLines) {
        if (line.includes("text =") || (line.trim().startsWith('"') && line.trim().endsWith('"'))) {
          const textMatch = line.match(/"([^"]+)"/);
          if (textMatch) txtOptions = textMatch[1];
        }
      }
    } catch (e) {
      console.warn("⚠️ Warning: Could not resolve TXT record options via nslookup:", e.message);
    }
    let finalQuery = `ssl=true`;
    if (txtOptions) finalQuery += `&${txtOptions}`;
    const originalQuery = queryStr.startsWith("?") ? queryStr.substring(1) : queryStr;
    if (originalQuery) finalQuery += `&${originalQuery}`;
    const dbName = pathName || "/";
    const directUri = `mongodb://${username}:${password}@${hostsList}${dbName}?${finalQuery}`;
    console.log(`✅ Successfully translated using nslookup!`);
    return directUri;
  } catch (error) {
    console.error("❌ Failed resolving SRV via nslookup:", error.message);
    if (host === "cluster0.tt5mrdx.mongodb.net") {
      console.log("ℹ️ Using hardcoded shard fallback for cluster0.tt5mrdx.mongodb.net");
      const hostsList = "ac-jl2mrtd-shard-00-00.tt5mrdx.mongodb.net:27017,ac-jl2mrtd-shard-00-01.tt5mrdx.mongodb.net:27017,ac-jl2mrtd-shard-00-02.tt5mrdx.mongodb.net:27017";
      const txtOptions = "authSource=admin&replicaSet=atlas-62q3hn-shard-0";
      let finalQuery = `ssl=true&${txtOptions}`;
      const originalQuery = queryStr.startsWith("?") ? queryStr.substring(1) : queryStr;
      if (originalQuery) finalQuery += `&${originalQuery}`;
      const dbName = pathName || "/";
      return `mongodb://${username}:${password}@${hostsList}${dbName}?${finalQuery}`;
    }
    return uri;
  }
}

const MONGODB_URI = resolveSrvUriSync(originalUri);

const xlsxFilename = process.argv[2] || "AnimalCategoryproduct.xlsx";
const imageFolderName = process.argv[3] || "Animal category";

console.log(`Spreadsheet: public/${xlsxFilename}`);
console.log(`Image Folder: public/${imageFolderName}`);

// 2. Define Mongoose Schema & Model (matching src/models/Product.ts exactly)
const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  slug: { type: String, unique: true, sparse: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  netPrice: { type: Number },
  image: { type: String, required: true },
  tag: { type: String },
  description: { type: String },
  stock: { type: Number, default: 50 },
  featured: { type: Boolean, default: false },
  features: { type: String },
  material: { type: String },
  sizes: [{
    size: { type: String, required: true },
    stock: { type: Number, default: 0 }
  }],
  whatsIncluded: [{ type: String }],
  careInstructions: { type: String },
  images: [{ type: String }],
  sku: { type: String, unique: true },
  brand: { type: String, default: "Saheli Shrungar" },
  cities: { type: [String], default: ["All"] },
  reviews: {
    type: [{
      userName: { type: String, required: true },
      userEmail: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  }
});

// Avoid Mongoose model compile errors if already compiled
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

// Helper: flexible property finder (case-insensitive, ignoring non-alphanumeric chars)
function findValue(row, possibleKeys) {
  for (const key of Object.keys(row)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const pk of possibleKeys) {
      const cleanPk = pk.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanKey === cleanPk) {
        return row[key];
      }
    }
  }
  return undefined;
}

// Helper: Upload image file to GridFS and return its URL path
async function uploadImageToGridFS(imgStr) {
  if (!imgStr) return "";
  const cleaned = String(imgStr).trim();
  if (!cleaned) return "";
  
  // Get just the filename
  let filename = path.basename(cleaned);
  
  // If the filename does not have an extension, try to find the correct file physically
  if (!path.extname(filename)) {
    const extensions = [".webp", ".png", ".jpg", ".jpeg"];
    let found = false;
    for (const ext of extensions) {
      const testPath = path.join(process.cwd(), "public", imageFolderName, `${filename}${ext}`);
      if (fs.existsSync(testPath)) {
        filename = `${filename}${ext}`;
        found = true;
        break;
      }
    }
    if (!found) {
      filename = `${filename}.webp`;
    }
  }
  
  const physicalPath = path.join(process.cwd(), "public", imageFolderName, filename);
  if (!fs.existsSync(physicalPath)) {
    console.warn(`⚠️ Warning: Image file not found physically: public/${imageFolderName}/${filename}`);
    return "";
  }

  try {
    // Check if the file is already uploaded to GridFS
    const files = await bucket.find({ filename }).toArray();
    if (files.length > 0) {
      const fileId = files[0]._id.toString();
      return `/api/image/${fileId}`;
    }

    // Upload new file to GridFS bucket
    const buffer = fs.readFileSync(physicalPath);
    let contentType = "image/webp";
    if (filename.endsWith(".png")) contentType = "image/png";
    else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType,
      });
      
      uploadStream.on("error", (error) => reject(error));
      uploadStream.on("finish", () => {
        const fileId = uploadStream.id.toString();
        console.log(`  📤 Uploaded ${filename} to GridFS. URL: /api/image/${fileId}`);
        resolve(`/api/image/${fileId}`);
      });
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error(`❌ Failed to upload image ${filename} to GridFS:`, error);
    return "";
  }
}

// SKU encoder matching Next.js API route
function encodeSingleSize(sizeStr) {
  const clean = sizeStr.trim();
  const numberedMatch = clean.match(/^[Ss]ize\s*(\d+)/);
  if (numberedMatch) return `S${numberedMatch[1]}`;
  
  const yearRangeMatch = clean.match(/^(\d+)-(\d+)\s*[Yy]/);
  if (yearRangeMatch) return `${yearRangeMatch[1]}${yearRangeMatch[2]}Y`;
  
  const singleYearMatch = clean.match(/^(\d+)\s*[Yy]/);
  if (singleYearMatch) return `${singleYearMatch[1]}Y`;
  
  return clean.replace(/\s+/g, "").substring(0, 4).toUpperCase();
}

function buildSizeCode(sizeList) {
  const valid = sizeList.filter(s => s.size.trim());
  if (valid.length === 0) return "NS";
  if (valid.length === 1) return encodeSingleSize(valid[0].size);
  const first = encodeSingleSize(valid[0].size);
  const last = encodeSingleSize(valid[valid.length - 1].size);
  return first === last ? first : `${first}-${last}`;
}

async function run() {
  try {
    // 3. Read the Excel file
    const xlsxPath = path.resolve(process.cwd(), "public", xlsxFilename);
    if (!fs.existsSync(xlsxPath)) {
      console.error(`❌ Excel file not found at: ${xlsxPath}`);
      process.exit(1);
    }
    
    console.log(`Reading Excel file from: ${xlsxPath}...`);
    const workbook = xlsx.readFile(xlsxPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);
    
    console.log(`Found ${rows.length} rows in sheet: "${sheetName}".`);
    if (rows.length === 0) {
      console.error("❌ No data found in the Excel sheet.");
      process.exit(1);
    }

    // 4. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully to MongoDB.");
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "images",
    });

    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    // Retrieve last product ID for auto-generation fallbacks
    const lastProduct = await Product.findOne().sort({ id: -1 });
    let runningNextId = lastProduct ? lastProduct.id + 1 : 101;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Row number in Excel sheet (1-indexed + header)

      try {
        // Extract fields using flexible headers
        let idVal = findValue(row, ["Product ID", "id", "productId"]);
        let title = findValue(row, ["Title", "name", "title"]);
        let category = findValue(row, ["Category", "category"]);
        let skuVal = findValue(row, ["SKU", "sku"]);
        let tag = findValue(row, ["Tag / Badge", "tag", "badge", "TagBadge"]);
        let netPriceVal = findValue(row, ["Net Cost Price", "netPrice", "costPrice", "NetPrice"]);
        let priceVal = findValue(row, ["Selling Price", "price", "SellingPrice"]);
        let mrpVal = findValue(row, ["MRP", "mrp"]);
        let sizesStockStr = findValue(row, ["Sizes & Stock", "sizes", "SizesStock"]);
        let whatsIncludedStr = findValue(row, ["What's Included", "whatsIncluded", "whats_included", "WhatsIncluded"]);
        let costumeFeatures = findValue(row, ["Costume Features", "features", "features_costume", "CostumeFeatures"]);
        let careInstructions = findValue(row, ["Care Instructions", "careInstructions", "CareInstructions"]);
        let description = findValue(row, ["Costume Description", "description", "CostumeDescription"]);
        let featuredVal = findValue(row, ["Featured", "featured"]);
        let mainImageStr = findValue(row, ["Main Image File", "image", "mainImage", "MainImageFile"]);
        let galleryImagesStr = findValue(row, ["Gallery Image Files", "images", "galleryImages", "GalleryImageFiles"]);

        // Validate required fields
        if (!title || !category || !priceVal || !mrpVal) {
          console.error(`❌ Row ${rowNum}: Skipping due to missing required fields (Title, Category, Selling Price, or MRP).`);
          errorCount++;
          continue;
        }

        // Parse Prices
        const price = parseFloat(String(priceVal).replace(/[^\d.]/g, ""));
        const mrp = parseFloat(String(mrpVal).replace(/[^\d.]/g, ""));
        const netPrice = netPriceVal ? parseFloat(String(netPriceVal).replace(/[^\d.]/g, "")) : undefined;

        if (isNaN(price) || isNaN(mrp)) {
          console.error(`❌ Row ${rowNum}: Invalid price or MRP values (Price: ${priceVal}, MRP: ${mrpVal}). Skipping.`);
          errorCount++;
          continue;
        }

        // Slug generation from title (used for lookup)
        let baseSlug = String(title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
        
        let slug = baseSlug;

        // Check if the product already exists by looking up the slug
        let existingProduct = await Product.findOne({ slug });
        let id;
        if (existingProduct) {
          id = existingProduct.id;
        } else {
          // It's a new product: get max ID from DB and increment
          const lastProduct = await Product.findOne().sort({ id: -1 });
          id = lastProduct ? lastProduct.id + 1 : 101;
          
          // Double check slug uniqueness
          let counter = 1;
          while (true) {
            const collision = await Product.findOne({ slug, id: { $ne: id } });
            if (!collision) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
        }

        // Normalize and upload images to GridFS
        const mainImageNormalized = await uploadImageToGridFS(mainImageStr);
        if (!mainImageNormalized) {
          console.error(`❌ Row ${rowNum}: Main Image File is missing or not found physically. Skipping.`);
          errorCount++;
          continue;
        }

        let galleryImages = [];
        if (galleryImagesStr) {
          const galleryTokens = String(galleryImagesStr).split(",");
          for (const token of galleryTokens) {
            const uploadedUrl = await uploadImageToGridFS(token.trim());
            if (uploadedUrl) {
              galleryImages.push(uploadedUrl);
            }
          }
        }

        // Merge main image into gallery images list if not already there, matching project pattern
        const finalImagesList = Array.from(new Set([mainImageNormalized, ...galleryImages]));

        // Parse Sizes & Stock
        let sizes = [];
        let totalStock = 0;
        if (sizesStockStr) {
          // Format: 3-4 Yrs:15, 5-6 Yrs:20
          const tokens = String(sizesStockStr).split(",");
          tokens.forEach(token => {
            const parts = token.split(":");
            if (parts.length >= 1) {
              const sizeName = parts[0].trim();
              const sizeStock = parts[1] ? parseInt(parts[1].trim()) : 10; // Default to 10 stock if not specified
              if (sizeName) {
                sizes.push({ size: sizeName, stock: isNaN(sizeStock) ? 0 : sizeStock });
              }
            }
          });
        }

        // Fallback default sizes if none provided
        if (sizes.length === 0) {
          sizes = [
            { size: "Size 24", stock: 10 },
            { size: "Size 26", stock: 10 },
            { size: "Size 28", stock: 10 },
            { size: "Size 30", stock: 10 },
            { size: "Size 32", stock: 10 }
          ];
        }
        totalStock = sizes.reduce((sum, item) => sum + item.stock, 0);

        // Parse What's Included
        const whatsIncluded = whatsIncludedStr
          ? String(whatsIncludedStr).split(",").map(s => s.trim()).filter(Boolean)
          : [];

        // Parse Featured
        const featured = featuredVal === true || String(featuredVal).trim().toLowerCase() === "true";

        // Generate SKU if missing
        let sku = skuVal ? String(skuVal).trim() : "";
        if (!sku) {
          const catAbbrev = String(category).substring(0, 3).toUpperCase();
          const sizeCode = buildSizeCode(sizes);
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          sku = `SAH-${catAbbrev}-${id}-${sizeCode}-${randomNum}`;
        }

        // Slug and ID already generated at the beginning of loop

        // Prepare product record
        const productData = {
          id,
          sku,
          slug,
          title: String(title).trim(),
          category: String(category).trim(),
          price,
          mrp,
          ...(netPrice !== undefined && !isNaN(netPrice) ? { netPrice } : {}),
          image: mainImageNormalized,
          images: finalImagesList,
          tag: tag ? String(tag).trim() : "",
          description: description ? String(description).trim() : "",
          stock: totalStock,
          featured,
          features: costumeFeatures ? String(costumeFeatures).trim() : "",
          material: costumeFeatures ? String(costumeFeatures).trim() : "",
          careInstructions: careInstructions ? String(careInstructions).trim() : "",
          whatsIncluded,
          sizes,
          brand: "Saheli Shrungar",
          cities: ["All"]
        };

        // Perform Upsert (Update if exists, Insert if new)
        if (existingProduct) {
          await Product.updateOne({ slug }, { $set: productData });
          console.log(`🔄 Row ${rowNum}: Updated product ID ${id} (${title})`);
          updatedCount++;
        } else {
          await Product.create(productData);
          console.log(`✅ Row ${rowNum}: Created product ID ${id} (${title})`);
          insertedCount++;
        }

      } catch (rowError) {
        console.error(`❌ Row ${rowNum}: Error processing row. Detail:`, rowError.message);
        errorCount++;
      }
    }

    console.log("\n==================================================");
    console.log("📊 Bulk Upload Summary:");
    console.log(`   - New Products Created: ${insertedCount}`);
    console.log(`   - Existing Products Updated: ${updatedCount}`);
    console.log(`   - Row Process Failures: ${errorCount}`);
    console.log("==================================================");

  } catch (error) {
    console.error("❌ Fatal script error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected. Exit.");
  }
}

run();
