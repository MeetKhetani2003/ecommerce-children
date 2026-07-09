import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Contact } from "@/models/Contact";
import { sendContactEmail } from "@/utils/emailService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, reason, message } = body;

    if (!name || !email || !phone || !reason || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Save to database
    const newContact = await Contact.create({
      name,
      email,
      phone,
      reason,
      message,
    });

    // Send Email to Admin
    await sendContactEmail({ name, email, phone, reason, message });

    return NextResponse.json({ success: true, message: "Inquiry submitted successfully", data: newContact });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
