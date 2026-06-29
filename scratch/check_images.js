import fs from "fs";
import path from "path";
import xlsx from "xlsx";

function checkCategory(xlsxFilename, imageFolderName) {
  const xlsxPath = path.resolve(process.cwd(), "public", xlsxFilename);
  if (!fs.existsSync(xlsxPath)) {
    console.error(`Excel not found: ${xlsxPath}`);
    return;
  }
  
  const workbook = xlsx.readFile(xlsxPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  
  console.log(`\nChecking ${xlsxFilename} against public/${imageFolderName}...`);
  let missingCount = 0;
  
  rows.forEach((row, i) => {
    const rowNum = i + 2;
    const title = row["Title"] || row["name"];
    const mainImg = row["Main Image File"] || row["image"];
    const galleryImgsStr = row["Gallery Image Files"] || row["images"];
    
    // Check main image
    if (mainImg) {
      const found = checkFile(imageFolderName, mainImg.trim());
      if (!found) {
        console.log(`❌ Row ${rowNum} (${title}): Main image missing: "${mainImg}"`);
        missingCount++;
      }
    } else {
      console.log(`⚠️ Row ${rowNum} (${title}): Main image is undefined`);
    }
    
    // Check gallery images
    if (galleryImgsStr) {
      const tokens = String(galleryImgsStr).split(",");
      tokens.forEach(tok => {
        const found = checkFile(imageFolderName, tok.trim());
        if (!found) {
          console.log(`❌ Row ${rowNum} (${title}): Gallery image missing: "${tok.trim()}"`);
          missingCount++;
        }
      });
    }
  });
  
  console.log(`Done checking ${xlsxFilename}. Total missing references: ${missingCount}`);
}

function checkFile(folder, filename) {
  const extensions = [".webp", ".png", ".jpg", ".jpeg"];
  for (const ext of extensions) {
    let testName = filename;
    if (!path.extname(filename)) {
      testName = `${filename}${ext}`;
    }
    const testPath = path.join(process.cwd(), "public", folder, testName);
    if (fs.existsSync(testPath)) {
      return true;
    }
  }
  return false;
}

checkCategory("Super Heroes Category.xlsx", "SuperHeros");
checkCategory("Water Animals Category.xlsx", "water animal");
