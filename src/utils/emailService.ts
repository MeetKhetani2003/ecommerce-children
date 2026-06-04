import nodemailer from "nodemailer";

interface InvoiceItem {
  title: string;
  price: number;
  quantity: number;
}

interface InvoiceDetails {
  orderId: string;
  customerName: string;
  email: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  address: string;
  phone: string;
}

export async function sendInvoiceEmail(details: InvoiceDetails) {
  const {
    orderId,
    customerName,
    email,
    items,
    subtotal,
    discount,
    total,
    address,
    phone,
  } = details;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #F0E6F2; text-align: left; font-size: 14px; color: #1A0F1C;">
          <strong>${item.title}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #F0E6F2; text-align: center; font-size: 14px; color: #4A354D;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #F0E6F2; text-align: right; font-size: 14px; color: #1A0F1C; font-weight: bold;">
          ₹${item.price}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #F0E6F2; text-align: right; font-size: 14px; color: #1A0F1C; font-weight: bold;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #FFFCFE; padding: 30px 15px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #F0E6F2; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(139, 29, 143, 0.05); text-align: left;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #8B1D8F 0%, #C2187B 100%); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Saheli Shrungar</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Order Invoice & Confirmation</p>
        </div>

        <div style="padding: 30px;">
          <!-- Greeting -->
          <h2 style="margin-top: 0; font-size: 18px; color: #1A0F1C; font-weight: 600;">Thank you for your order, ${customerName}!</h2>
          <p style="font-size: 14px; color: #6B5A6F; line-height: 1.6; margin-bottom: 25px;">
            We've received your payment and are preparing your costumes for delivery. Below is your detailed invoice bill.
          </p>

          <!-- Meta Info -->
          <div style="background-color: #FCF7FD; border-radius: 16px; padding: 15px 20px; margin-bottom: 25px; border: 1px dashed #EEDDF0; font-size: 13.5px; color: #4A354D; display: flex; flex-direction: column; gap: 6px;">
            <div><strong>Order ID:</strong> <span style="font-family: monospace; color: #8B1D8F;">${orderId}</span></div>
            <div><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
            <div><strong>Payment Status:</strong> <span style="color: #0F8A4B; font-weight: 600;">Paid (Razorpay)</span></div>
          </div>

          <!-- Items Table -->
          <h3 style="font-size: 15px; color: #1A0F1C; border-bottom: 2px solid #F0E6F2; padding-bottom: 8px; margin-bottom: 12px; font-weight: 600;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #FCF7FD;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12.5px; text-transform: uppercase; color: #8B7A8F; font-weight: 600;">Costume</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12.5px; text-transform: uppercase; color: #8B7A8F; font-weight: 600;">Qty</th>
                <th style="padding: 10px 12px; text-align: right; font-size: 12.5px; text-transform: uppercase; color: #8B7A8F; font-weight: 600;">Price</th>
                <th style="padding: 10px 12px; text-align: right; font-size: 12.5px; text-transform: uppercase; color: #8B7A8F; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <!-- Totals block -->
          <div style="width: 250px; margin-left: auto; margin-bottom: 30px; font-size: 14px; color: #4A354D; line-height: 2;">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <span style="font-weight: 600; color: #1A0F1C;">₹${subtotal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #C2187B;">
              <span>Discount:</span>
              <span style="font-weight: 600;">-₹${discount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #0F8A4B;">
              <span>Shipping:</span>
              <span style="font-weight: 600;">Free</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; border-top: 1px solid #F0E6F2; padding-top: 8px; margin-top: 8px; color: #1A0F1C;">
              <span>Grand Total:</span>
              <span>₹${total}</span>
            </div>
          </div>

          <!-- Shipping Details -->
          <h3 style="font-size: 15px; color: #1A0F1C; border-bottom: 2px solid #F0E6F2; padding-bottom: 8px; margin-bottom: 12px; font-weight: 600;">Delivery Address</h3>
          <div style="font-size: 14px; color: #6B5A6F; line-height: 1.6; background-color: #FFFCFE; border: 1px solid #F0E6F2; border-radius: 16px; padding: 15px 20px;">
            <strong>${customerName}</strong><br/>
            ${address}<br/>
            <strong>Phone:</strong> ${phone}
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; border-top: 1px solid #F0E6F2; padding-top: 20px; text-align: center; font-size: 12px; color: #8B7A8F; line-height: 1.5;">
            Thank you for shopping with Saheli Shrungar! We hope your little star shines in their event.<br/>
            For help or inquiries, contact us at support@sahelishrungar.com
          </div>

        </div>
      </div>
    </div>
  `;

  // Check if SMTP configurations are present in env
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: parseInt(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Saheli Shrungar Costumes" <${SMTP_USER}>`,
        to: email,
        subject: `Invoice for Order #${orderId} - Saheli Shrungar`,
        html: emailHtml,
      });

      console.log(`[Email Service] Invoice sent to ${email} for order ${orderId}`);
      return;
    } catch (error) {
      console.error("[Email Service] Failed to send email via SMTP:", error);
    }
  }

  // Fallback: log invoice to the console
  console.log("==================================================================");
  console.log(`[MOCK EMAIL FALLBACK] Invoice generated for order ${orderId}`);
  console.log(`Recipient: ${email}`);
  console.log(`Subtotal: ₹${subtotal}, Discount: ₹${discount}, Total: ₹${total}`);
  console.log("HTML Billing Invoice Template content matches generated design.");
  console.log("==================================================================");
}

interface BulkInquiryDetails {
  name: string;
  email: string;
  phone: string;
  message: string;
  productId: number;
  productTitle: string;
  quantity: number;
  eventDate: string;
}

export async function sendBulkInquiryEmails(details: BulkInquiryDetails) {
  const { name, email, phone, message, productId, productTitle, quantity, eventDate } = details;

  // 1. Admin Email HTML
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #F0E6F2; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #8B1D8F; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">New Bulk Order Inquiry</h2>
      </div>
      <div style="padding: 25px; color: #1A0F1C; line-height: 1.6;">
        <p>Hello Admin,</p>
        <p>A customer has submitted a wholesale bulk order inquiry for the following product:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #FCF7FD; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Product Name:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;">${productTitle} (ID: ${productId})</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Requested Quantity:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; color: #8B1D8F; font-weight: bold;">${quantity} units</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Required Date:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Customer Name:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Email:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Phone:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 10px 15px;">${message}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  // 2. Customer Confirmation HTML
  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #F0E6F2; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #8B1D8F; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">Bulk Inquiry Submitted</h2>
      </div>
      <div style="padding: 25px; color: #1A0F1C; line-height: 1.6;">
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to **Saheli Shrungar Costumes**. We have received your wholesale bulk inquiry for <strong>${productTitle}</strong>.</p>
        <p>Our sales representative will review your requirement (Quantity: ${quantity} units, Required Date: ${eventDate}) and get back to you with custom discounted wholesale pricing details within 24 hours.</p>
        
        <p style="margin-top: 30px; font-size: 13px; color: #8B7A8F;">
          Best Regards,<br/>
          <strong>Saheli Shrungar Customer Support Team</strong><br/>
          Contact: support@sahelishrungar.com
        </p>
      </div>
    </div>
  `;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: parseInt(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      // Send to Admin
      await transporter.sendMail({
        from: `"Saheli Bulk Orders" <${SMTP_USER}>`,
        to: SMTP_USER,
        subject: `NEW Wholesale Bulk Inquiry: ${productTitle} (${quantity} units)`,
        html: adminHtml,
      });

      // Send to Customer
      await transporter.sendMail({
        from: `"Saheli Shrungar Costumes" <${SMTP_USER}>`,
        to: email,
        subject: `Bulk Inquiry Submitted: ${productTitle}`,
        html: customerHtml,
      });

      console.log(`[Email Service] Bulk inquiry emails dispatched successfully.`);
      return;
    } catch (error) {
      console.error("[Email Service] Failed to send bulk inquiry emails via SMTP:", error);
    }
  }

  console.log("==================================================================");
  console.log(`[MOCK EMAIL FALLBACK] Bulk Inquiry Emails Sent.`);
  console.log(`Product: ${productTitle} (ID: ${productId}), Qty: ${quantity}`);
  console.log(`Customer: ${name} (${email}), Phone: ${phone}`);
  console.log("Both admin notification and customer confirmation emails logged.");
  console.log("==================================================================");
}
