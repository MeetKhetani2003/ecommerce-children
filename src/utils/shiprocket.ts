import dbConnect from "./dbConnect";
import { Order } from "@/models/Order";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// In-memory cache for Shiprocket JWT token
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// Formats a date as YYYY-MM-DD HH:MM (Shiprocket format)
function formatShiprocketDate(date: Date): string {
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Clean and validate phone number (needs to be a 10-digit number for Indian phone numbers)
function cleanPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 10) {
    // Return last 10 digits
    return cleaned.slice(-10);
  }
  return "9999999999"; // Fallback dummy valid phone
}

// Parse address text to extract city, state and pincode
export async function parseAddressAndGetLocation(address: string) {
  // Default values
  let pincode = "400001"; // Default Mumbai GPO
  let city = "Mumbai";
  let state = "Maharashtra";

  if (!address) {
    return { pincode, city, state };
  }

  // 1. Look for a 6-digit pincode in the address string
  const pinMatch = address.match(/\b\d{6}\b/);
  if (pinMatch) {
    pincode = pinMatch[0];
    
    // 2. Try fetching location information from Postal Pincode API
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const office = data[0].PostOffice[0];
        if (office.District) city = office.District;
        if (office.State) state = office.State;
      }
    } catch (err) {
      console.warn(`[Shiprocket Address Parser] Pincode lookup failed for ${pincode}, falling back to defaults.`, err);
    }
  } else {
    // If no pincode is found, try checking if standard state names are mentioned in the address text
    const states = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
      "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
      "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
      "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
      "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Jammu and Kashmir", "Puducherry"
    ];
    
    for (const s of states) {
      if (new RegExp(`\\b${s}\\b`, "i").test(address)) {
        state = s;
        break;
      }
    }
  }

  return { pincode, city, state };
}

// Authenticate with Shiprocket API and cache the token
export async function getShiprocketToken(): Promise<string> {
  if (process.env.SHIP_ROCKET_SANDBOX === "true") {
    return "mock_sandbox_token_1234567890";
  }

  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.SHIP_ROCKET_EMAIL;
  const password = process.env.SHIP_ROCKET_PASS;

  if (!email || !password) {
    throw new Error("Shiprocket credentials (SHIP_ROCKET_EMAIL / SHIP_ROCKET_PASS) are not defined in environmental variables.");
  }

  console.log(`[Shiprocket Auth] Fetching fresh token for ${email}...`);
  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shiprocket auth login failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error("Shiprocket auth token was not returned in login response.");
  }

  // Token is valid for 240 hours. Cache it for 230 hours (to be safe).
  cachedToken = data.token;
  tokenExpiry = now + 230 * 60 * 60 * 1000;
  return cachedToken as string;
}

/**
 * Automates the Shiprocket integration for an order:
 * 1. Creates a shipment order on Shiprocket
 * 2. Automatically assigns courier and obtains AWB number
 * 3. Updates the local order with tracking details
 */
export async function createShiprocketShipmentAndAwb(orderId: string) {
  await dbConnect();
  
  // Find local order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found in database.`);
  }

  if (!order.shippingDetails) {
    throw new Error(`Order ${orderId} does not have shipping details.`);
  }

  // Sandbox simulation mode
  if (process.env.SHIP_ROCKET_SANDBOX === "true") {
    const mockShipmentId = Math.floor(10000000 + Math.random() * 90000000);
    const mockAwbCode = `SR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const mockTrackingLink = `https://shiprocket.co/tracking/${mockAwbCode}`;
    
    console.log(`[Shiprocket Sandbox Mode] Simulating shipment and AWB for Order: ${orderId}`);
    
    order.trackingNumber = mockAwbCode;
    order.trackingLink = mockTrackingLink;
    order.shippingStatus = "Shipped";
    await order.save();
    
    return {
      success: true,
      shiprocketOrderId: `mock_order_${mockShipmentId}`,
      shipmentId: mockShipmentId,
      awbCode: mockAwbCode,
      trackingLink: mockTrackingLink
    };
  }

  const token = await getShiprocketToken();

  let shipmentId: string | number;
  let shiprocketOrderId: string;

  // Recovery path: Check if order has already been successfully created on Shiprocket
  // but AWB assignment was pending (trackingNumber looks like PENDING_AWB_<shipmentId>)
  if (order.trackingNumber && order.trackingNumber.startsWith("PENDING_AWB_")) {
    shipmentId = order.trackingNumber.replace("PENDING_AWB_", "");
    shiprocketOrderId = order._id.toString();
    console.log(`[Shiprocket Recover AWB] Order was already created. Resuming AWB assignment directly for Shipment ID: ${shipmentId}...`);
  } else {
    const addressInfo = await parseAddressAndGetLocation(order.shippingDetails.address);

    // Split name into first and last
    const nameParts = (order.shippingDetails.name || "Customer").trim().split(/\s+/);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    // Format order date
    const orderDateStr = formatShiprocketDate(order.createdAt || new Date());

    // Map payment method
    const isCod = order.paymentMethod === "cod";
    const paymentMethod = isCod ? "COD" : "Prepaid";

    // Calculate items quantity for default package dimensions
    const totalQty = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const weight = Math.max(0.5, totalQty * 0.5); // 0.5 kg per item, minimum 0.5 kg

    // Map order items to Shiprocket format
    const orderItems = order.items.map((item: any) => ({
      name: item.title,
      sku: item.productId.toString(),
      units: item.quantity,
      selling_price: item.price.toString(),
    }));

    const payload = {
      order_id: order._id.toString(),
      order_date: orderDateStr,
      pickup_location: process.env.SHIP_ROCKET_PICKUP_LOCATION || "Primary",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: order.shippingDetails.address.substring(0, 95),
      billing_address_2: order.shippingDetails.address.length > 95 ? order.shippingDetails.address.substring(95, 190) : "",
      billing_city: addressInfo.city,
      billing_pincode: addressInfo.pincode,
      billing_state: addressInfo.state,
      billing_country: "India",
      billing_email: order.email || "customer@saheli.com",
      billing_phone: cleanPhoneNumber(order.shippingDetails.phone),
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: paymentMethod,
      sub_total: order.subtotal,
      length: 30,
      breadth: 20,
      height: 10,
      weight: weight,
    };

    console.log(`[Shiprocket Create Order] Sending payload for Order ID: ${order._id}...`);
    let orderRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    let orderData;
    if (!orderRes.ok) {
      const errorBody = await orderRes.text();
      let healed = false;
      try {
        const errorObj = JSON.parse(errorBody);
        // Check for wrong pickup location error and auto-correct it
        if (
          (errorObj?.message?.toLowerCase().includes("pickup location") || 
           errorObj?.message?.toLowerCase().includes("pickup_location")) &&
          errorObj?.data?.data?.length > 0
        ) {
          const correctLocation = errorObj.data.data[0].pickup_location;
          if (correctLocation && correctLocation !== payload.pickup_location) {
            console.log(`[Shiprocket Auto-Heal] Wrong pickup location entered. Auto-retrying with location: "${correctLocation}"`);
            payload.pickup_location = correctLocation;
            
            orderRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(payload),
            });
            
            if (orderRes.ok) {
              orderData = await orderRes.json();
              healed = true;
              console.log("[Shiprocket Auto-Heal] Order creation succeeded after correcting pickup location.");
            } else {
              console.error("[Shiprocket Auto-Heal] Auto-corrected retry also failed.");
            }
          }
        }
      } catch (parseErr) {
        console.error("[Shiprocket Auto-Heal] Parse error details:", parseErr);
      }

      if (!healed) {
        throw new Error(`Shiprocket Order creation failed: ${orderRes.status} - ${errorBody}`);
      }
    } else {
      orderData = await orderRes.json();
    }

    shiprocketOrderId = orderData.order_id;
    shipmentId = orderData.shipment_id;
  }

  if (!shipmentId) {
    throw new Error("Shiprocket order creation succeeded, but no shipment_id was returned.");
  }

  console.log(`[Shiprocket AWB Assignment] Assigning AWB for Shipment ID: ${shipmentId}...`);
  const awbRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ shipment_id: shipmentId }),
  });

  if (!awbRes.ok) {
    const errorBody = await awbRes.text();
    // Order was created, update locally but note AWB failure
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        trackingNumber: `PENDING_AWB_${shipmentId}`,
        trackingLink: `https://shiprocket.co/`,
      }
    });
    throw new Error(`Shiprocket AWB assignment failed: ${awbRes.status} - ${errorBody}`);
  }

  const awbData = await awbRes.json();
  const awbCode = awbData?.response?.data?.awb_code;

  if (!awbCode) {
    // AWB assignment failed/returned empty, update locally with pending status
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        trackingNumber: `PENDING_AWB_${shipmentId}`,
        trackingLink: `https://shiprocket.co/`,
      }
    });
    throw new Error(`AWB code was not generated successfully: ${JSON.stringify(awbData)}`);
  }

  console.log(`[Shiprocket Success] Successfully generated AWB: ${awbCode} for Order: ${orderId}`);
  
  // Save AWB and details locally
  const trackingLink = `https://shiprocket.co/tracking/${awbCode}`;
  order.trackingNumber = awbCode;
  order.trackingLink = trackingLink;
  order.shippingStatus = "Shipped"; // Mark as Shipped since shipping is created and AWB integrated
  await order.save();

  return {
    success: true,
    shiprocketOrderId,
    shipmentId,
    awbCode,
    trackingLink
  };
}

/**
 * Checks tracking status from Shiprocket and updates the local order status
 */
export async function syncShiprocketTracking(orderId: string) {
  await dbConnect();
  
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found in database.`);
  }

  if (process.env.SHIP_ROCKET_SANDBOX === "true") {
    console.log(`[Shiprocket Sandbox Mode] Simulating tracking update for Order: ${orderId}`);
    let nextStatus = order.shippingStatus;
    if (order.shippingStatus === "Shipped") {
      nextStatus = "Delivered";
    }
    const hasChanged = nextStatus !== order.shippingStatus;
    if (hasChanged) {
      order.shippingStatus = nextStatus;
      await order.save();
    }
    return {
      success: true,
      awbCode: order.trackingNumber || "MOCK_AWB",
      currentStatus: "Delivered",
      mappedStatus: nextStatus,
      updated: hasChanged
    };
  }

  if (!order.trackingNumber || order.trackingNumber.startsWith("PENDING_AWB_")) {
    throw new Error(`Order ${orderId} does not have a valid AWB tracking number yet.`);
  }

  const token = await getShiprocketToken();
  const awbCode = order.trackingNumber;

  console.log(`[Shiprocket Tracking] Syncing status for AWB: ${awbCode}...`);
  const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shiprocket tracking lookup failed: ${response.status} - ${errText}`);
  }

  const trackingData = await response.json();
  const shipmentTrack = trackingData?.tracking_data?.shipment_track;
  
  if (!Array.isArray(shipmentTrack) || shipmentTrack.length === 0) {
    throw new Error(`No tracking data found for AWB: ${awbCode}`);
  }

  const info = shipmentTrack[0];
  const currentStatus = info.current_status || "";
  
  console.log(`[Shiprocket Tracking] AWB: ${awbCode} status is: ${currentStatus}`);

  // Map tracking status to our Order shippingStatus
  let newShippingStatus = order.shippingStatus;
  
  const lowerStatus = currentStatus.toLowerCase();
  if (lowerStatus === "delivered") {
    newShippingStatus = "Delivered";
  } else if (lowerStatus === "cancelled" || lowerStatus === "canceled") {
    newShippingStatus = "Cancelled";
  } else if (
    lowerStatus === "shipped" || 
    lowerStatus === "in transit" || 
    lowerStatus === "out for delivery" || 
    lowerStatus === "picked up" ||
    lowerStatus === "out for pickup" ||
    lowerStatus === "dispatched"
  ) {
    newShippingStatus = "Shipped";
  } else if (lowerStatus === "return" || lowerStatus === "rto") {
    newShippingStatus = "Exchange Processing"; // RTO maps to processing or status update
  }

  if (newShippingStatus !== order.shippingStatus) {
    order.shippingStatus = newShippingStatus;
    await order.save();
    console.log(`[Shiprocket Tracking] Updated Order: ${orderId} status to: ${newShippingStatus}`);
  }

  return {
    success: true,
    awbCode,
    currentStatus,
    mappedStatus: newShippingStatus,
    updated: newShippingStatus !== order.shippingStatus
  };
}

/**
 * Generates a 6x4 inch thermal-ready shipping/courier label PDF in LANDSCAPE orientation
 */
export async function generateShippingLabelPDF(orderId: string, autoPrint = false): Promise<Buffer> {
  await dbConnect();
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found in database.`);
  }

  if (!order.shippingDetails) {
    throw new Error(`Order ${orderId} does not have shipping details.`);
  }

  const pdfDoc = await PDFDocument.create();
  
  // 6 x 4 inches in PostScript points: 432 x 288 pt (standard landscape thermal shipping label)
  const page = pdfDoc.addPage([432, 288]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Outer border box (Margin 10pt)
  page.drawRectangle({
    x: 10,
    y: 10,
    width: 412,
    height: 268,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1.5,
  });

  // 1. Header Box (Y: 243 to 278, Height: 35)
  page.drawRectangle({
    x: 10,
    y: 243,
    width: 412,
    height: 35,
    color: rgb(240/255, 230/255, 242/255),
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  page.drawText("SAHELI SHRUNGAR", {
    x: 18,
    y: 261,
    size: 11.5,
    font: boldFont,
    color: rgb(139/255, 29/255, 143/255),
  });

  page.drawText("FANCY DRESS SPECIALIST", {
    x: 18,
    y: 251,
    size: 7,
    font: boldFont,
    color: rgb(107/255, 90/255, 111/255),
  });

  // Header Right Side Badge (EXPRESS SHIPPING)
  page.drawRectangle({
    x: 316,
    y: 251,
    width: 96,
    height: 18,
    color: rgb(139/255, 29/255, 143/255),
    borderRadius: 4,
  } as any);

  page.drawText("EXPRESS SHIPPING", {
    x: 325,
    y: 257,
    size: 7,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Vertical Divider line between Left and Right columns
  page.drawLine({
    start: { x: 216, y: 45 },
    end: { x: 216, y: 243 },
    thickness: 1.2,
    color: rgb(0, 0, 0),
  });

  // Left Column Horizontal Splitter (SHIP TO vs. RETURN ADDRESS)
  page.drawLine({
    start: { x: 10, y: 105 },
    end: { x: 216, y: 105 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Right Column Horizontal Splitters (BARCODE vs. SPECS vs. CHECKLIST)
  page.drawLine({
    start: { x: 216, y: 145 },
    end: { x: 422, y: 145 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 216, y: 95 },
    end: { x: 422, y: 95 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // 2. Left Column - SHIP TO (RECIPIENT)
  page.drawText("SHIP TO (RECIPIENT):", {
    x: 18,
    y: 228,
    size: 7.5,
    font: boldFont,
    color: rgb(139/255, 29/255, 143/255),
  });

  page.drawText(order.shippingDetails.name, {
    x: 18,
    y: 214,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Phone number cleanup (prevent double +91 +91)
  let cleanPhone = order.shippingDetails.phone.trim();
  cleanPhone = cleanPhone.replace(/[\s\-\(\)]/g, ""); // Strip punctuation
  if (!cleanPhone.startsWith("+")) {
    if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
      cleanPhone = "+" + cleanPhone;
    } else {
      if (cleanPhone.startsWith("0")) {
        cleanPhone = cleanPhone.substring(1);
      }
      cleanPhone = "+91" + cleanPhone;
    }
  }

  page.drawText(`Contact Phone: ${cleanPhone}`, {
    x: 18,
    y: 201,
    size: 8.5,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Address text (Prefixed with "Address: ")
  const fullAddressText = `Address: ${order.shippingDetails.address}`;
  page.drawText(fullAddressText, {
    x: 18,
    y: 189,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
    maxWidth: 186,
    lineHeight: 10.5,
  });

  // Highlight Destination PINCODE
  const pincodeMatch = order.shippingDetails.address.match(/\b\d{6}\b/);
  const pinText = pincodeMatch ? pincodeMatch[0] : "400001";
  
  page.drawRectangle({
    x: 18,
    y: 110,
    width: 186,
    height: 20,
    color: rgb(248/255, 240/255, 249/255),
  });

  page.drawText(`PINCODE: ${pinText}`, {
    x: 24,
    y: 116,
    size: 9.5,
    font: boldFont,
    color: rgb(139/255, 29/255, 143/255),
  });

  // 3. Left Column Bottom - RETURN ADDRESS (SENDER)
  page.drawText("FROM / RETURN TO:", {
    x: 18,
    y: 93,
    size: 6.5,
    font: boldFont,
    color: rgb(107/255, 90/255, 111/255),
  });

  page.drawText("Saheli Shrungar Costumes", {
    x: 18,
    y: 83,
    size: 8,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText("Anand Nagar Main Road, Oppo Harsad Provision Store,\nRajkot, Gujarat - 360002. Contact: 8866331293", {
    x: 18,
    y: 73,
    size: 6.5,
    font: font,
    color: rgb(0, 0, 0),
    maxWidth: 186,
    lineHeight: 8.5,
  });

  // 4. Right Column - AWB Barcode & Specs
  // Fetch and embed the barcode from bwip-js API
  const barcodeValue = order.trackingNumber || order._id.toString();
  let barcodeImage = null;
  try {
    const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(barcodeValue)}&scale=3&height=12&includetext=false`;
    const res = await fetch(barcodeUrl);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      barcodeImage = await pdfDoc.embedPng(buffer);
    }
  } catch (err) {
    console.error("[Courier Label PDF] Barcode fetch failed:", err);
  }

  if (barcodeImage) {
    page.drawImage(barcodeImage, {
      x: 224,
      y: 178,
      width: 190,
      height: 48,
    });
  } else {
    page.drawRectangle({
      x: 224,
      y: 178,
      width: 190,
      height: 48,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
  }

  const isRealAwb = order.trackingNumber && !order.trackingNumber.startsWith("PENDING_AWB_");
  const trackingNumberText = isRealAwb ? order.trackingNumber : "MOCK_AWB_SANDBOX_TEST";
  page.drawText(`AWB NO: ${trackingNumberText}`, {
    x: 224,
    y: 160,
    size: 9,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // 5. Right Column Middle - PACKAGE SPECIFICATION
  page.drawText("PACKAGE SPECIFICATION:", {
    x: 224,
    y: 134,
    size: 6.5,
    font: boldFont,
    color: rgb(107/255, 90/255, 111/255),
  });

  const dateStr = new Date(order.createdAt || new Date()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  page.drawText(`Order ID: #${order._id.toString().substring(0, 16)}`, {
    x: 224,
    y: 124,
    size: 7.5,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Date: ${dateStr}`, {
    x: 224,
    y: 114,
    size: 7,
    font: font,
    color: rgb(0, 0, 0),
  });


  // 6. Right Column Bottom - Items Checklist & Specifications
  page.drawText("ITEMS CHECKLIST & SIZES:", {
    x: 224,
    y: 85,
    size: 6.5,
    font: boldFont,
    color: rgb(139/255, 29/255, 143/255),
  });

  let itemY = 73;
  order.items.slice(0, 3).forEach((item: any) => {
    const sizePart = item.size ? ` | Size: ${item.size.toUpperCase()}` : " | Size: Std";
    page.drawText(`[ ]  ${item.title.substring(0, 20)} (Qty: ${item.quantity})${sizePart}`, {
      x: 224,
      y: itemY,
      size: 7,
      font: font,
      color: rgb(0, 0, 0),
    });
    itemY -= 9.5;
  });

  if (order.items.length > 3) {
    page.drawText(`... and ${order.items.length - 3} more items`, {
      x: 224,
      y: itemY,
      size: 6,
      font: font,
      color: rgb(120/255, 120/255, 120/255),
    });
  }

  // Horizontal Divider for bottom payment badge
  page.drawLine({
    start: { x: 10, y: 45 },
    end: { x: 422, y: 45 },
    thickness: 1.2,
    color: rgb(0, 0, 0),
  });

  // 6. Payment Badge Banner (Y: 10 to 45, Height: 35)
  const isCod = order.paymentMethod === "cod";
  const payMethodText = isCod ? `COD (Collect Rs. ${order.total})` : "PREPAID - ONLINE SECURED";
  const payMethodColor = isCod ? rgb(180/255, 83/255, 9/255) : rgb(21/255, 128/255, 61/255);

  page.drawRectangle({
    x: 11,
    y: 11,
    width: 410,
    height: 33,
    color: isCod ? rgb(254/255, 243/255, 199/255) : rgb(240/255, 253/255, 244/255),
  });

  page.drawText(payMethodText.toUpperCase(), {
    x: 18,
    y: 24,
    size: 10.5,
    font: boldFont,
    color: payMethodColor,
  });

  page.drawText(`TOTAL COLLECTABLE BILL: Rs. ${order.total}`, {
    x: 18,
    y: 14,
    size: 7,
    font: font,
    color: payMethodColor,
  });

  // Trigger print dialog automatically when PDF opens
  if (autoPrint) {
    pdfDoc.addJavaScript("print", "print({});");
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
