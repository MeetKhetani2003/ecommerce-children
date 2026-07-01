import fs from "fs";
import path from "path";

// Read and parse .env.local manually for this test script
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};

envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    // Remove wrapping quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    envVars[key] = value;
  }
});

const email = envVars["SHIP_ROCKET_EMAIL"];
const password = envVars["SHIP_ROCKET_PASS"];

console.log("Testing authentication with Shiprocket...");
console.log(`Email: ${email}`);
console.log(`Password (masked): ${password ? password.substring(0, 5) + "... (length: " + password.length + ")" : "undefined"}`);

try {
  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    console.log("SUCCESS! Authenticated successfully.");
    console.log("Token sample:", data.token.substring(0, 20) + "...");
  } else {
    console.log(`FAILED! Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data));
  }
} catch (error) {
  console.error("Error occurred:", error);
}
