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

import { execSync } from "child_process";

const originalUri = process.env.MONGODB_URI;
if (!originalUri) {
  console.error("❌ MONGODB_URI is not defined");
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
