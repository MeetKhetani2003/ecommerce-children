const xlsx = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "..", "public", "Our Helpers Category.xlsx");
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

console.log("Excel rows:");
rows.forEach((row) => {
  console.log(`Title: ${row.Title || row.title} | Sizes & Stock: ${row["Sizes & Stock"] || row["sizes & stock"] || row.Sizes}`);
});
