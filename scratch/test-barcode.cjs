async function main() {
  const barcodeValue = "SR857900746076";
  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(barcodeValue)}&scale=3&height=12&includetext=false`;
  
  console.log("Fetching URL:", barcodeUrl);
  try {
    const res = await fetch(barcodeUrl);
    console.log("Status:", res.status);
    console.log("OK:", res.ok);
    if (!res.ok) {
      console.log("Error text:", await res.text());
    } else {
      console.log("Success! Image size:", (await res.arrayBuffer()).byteLength, "bytes");
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

main();
