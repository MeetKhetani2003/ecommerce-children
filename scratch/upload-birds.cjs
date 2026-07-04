const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      process.env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

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
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const uploadToGridFS = (filePath, fileName) => {
  return new Promise((resolve, reject) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "images" });
    const contentType = filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
    const uploadStream = bucket.openUploadStream(fileName, { contentType });
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id.toString()));
  });
};

const findImageFile = (baseName, dir) => {
  const exts = ['.png', '.jpg', '.jpeg'];
  for (const ext of exts) {
    const filePath = path.join(dir, baseName + ext);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  // Try case-insensitive fallback if possible by checking all files
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.toLowerCase() === (baseName + '.png').toLowerCase() || file.toLowerCase() === (baseName + '.jpg').toLowerCase()) {
      return path.join(dir, file);
    }
  }
  return null;
};

const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB.");

  const excelPath = path.join(__dirname, '..', 'public', 'Birds Category (1).xlsx');
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const imagesDir = path.join(__dirname, '..', 'public', 'Bird');

  let maxIdProduct = await Product.findOne().sort('-id').exec();
  let currentId = maxIdProduct ? maxIdProduct.id + 1 : 1;

  for (const row of rows) {
    console.log(`Processing: ${row.Title}`);
    
    // Check if already exists
    const existing = await Product.findOne({ title: row.Title });
    if (existing) {
      console.log(`- Product ${row.Title} already exists, skipping.`);
      continue;
    }

    // Process Sizes
    const sizes = [];
    if (row["Sizes & Stock"]) {
      const parts = row["Sizes & Stock"].split(',');
      for (const p of parts) {
        const [size, stock] = p.split(':');
        if (size && stock) {
          sizes.push({ size: size.trim(), stock: parseInt(stock.trim()) || 0 });
        }
      }
    }

    // Upload Main Image
    let mainImageId = null;
    if (row["Main Image File"]) {
      const imgPath = findImageFile(row["Main Image File"], imagesDir);
      if (imgPath) {
        mainImageId = await uploadToGridFS(imgPath, path.basename(imgPath));
      } else {
        console.warn(`- Warning: Main image ${row["Main Image File"]} not found.`);
      }
    }

    // Upload Gallery Images
    let galleryImageIds = [];
    if (row["Gallery Image Files"]) {
      const gFiles = row["Gallery Image Files"].split(',').map(s => s.trim());
      for (const gF of gFiles) {
        const imgPath = findImageFile(gF, imagesDir);
        if (imgPath) {
          const gId = await uploadToGridFS(imgPath, path.basename(imgPath));
          galleryImageIds.push(`/api/image/${gId}`);
        } else {
           console.warn(`- Warning: Gallery image ${gF} not found.`);
        }
      }
    }

    let mainImageUrl = mainImageId ? `/api/image/${mainImageId}` : '';
    if (!mainImageUrl && galleryImageIds.length > 0) {
      mainImageUrl = galleryImageIds[0];
    }
    
    if (!mainImageUrl) {
        mainImageUrl = "/assets/logo.png"; // Fallback
    }

    const newProduct = new Product({
      id: currentId++,
      slug: generateSlug(row.Title) + '-' + Date.now(),
      title: row.Title,
      category: row.Category || 'Birds Costume',
      price: row["Selling Price"] || 0,
      mrp: row["MRP"] || 0,
      netPrice: row["Net Cost Price"] || 0,
      tag: row["Tag / Badge"] || '',
      description: row["Costume Description"] || '',
      featured: row["Featured"] === true || row["Featured"] === 'true' || row["Featured"] === 'Yes',
      features: row["Features"] || '',
      sizes: sizes.length > 0 ? sizes : [{ size: "Free Size", stock: 10 }],
      whatsIncluded: row["What's Included"] ? [row["What's Included"]] : [],
      careInstructions: row["Care Instructions"] || '',
      image: mainImageUrl,
      images: [mainImageUrl, ...galleryImageIds],
      sku: `BRD-${Date.now()}-${currentId}`,
      stock: sizes.reduce((acc, s) => acc + s.stock, 0) || 50
    });

    await newProduct.save();
    console.log(`- Saved product: ${row.Title}`);
  }

  console.log("Done.");
  await mongoose.disconnect();
}

main().catch(console.error);
