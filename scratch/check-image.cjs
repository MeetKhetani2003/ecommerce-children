const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

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

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const p = await db.collection('products').findOne({id: 1});
  console.log("Image:", p.image);
  console.log("Images:", p.images);
  mongoose.disconnect();
}).catch(console.error);
