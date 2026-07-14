import { Coupon } from "@/models/Coupon";
import { sendWelcomeCouponEmail } from "@/utils/emailService";

export async function checkAndSendWelcomeCoupon(user: any): Promise<string | null> {
  // If the coupon was already sent, do nothing
  if (user.welcomeCouponSent) {
    return null;
  }

  // Check if profile is complete (phone AND at least one address)
  const hasPhone = !!user.phone && user.phone.trim() !== "";
  const hasAddress = !!user.defaultAddress || (user.addresses && user.addresses.length > 0);

  if (hasPhone && hasAddress) {
    // Generate a unique 10% coupon code
    const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedCouponCode = `WELCOME10-${uniqueSuffix}`;
    
    await Coupon.create({
      code: generatedCouponCode,
      discountPercent: 10,
      active: true
    });

    user.welcomeCouponSent = true;
    await user.save();

    // Send the coupon to the user's email asynchronously
    sendWelcomeCouponEmail(user.email, user.name || "Customer", generatedCouponCode).catch((err) => {
      console.error("Failed to send welcome coupon email:", err);
    });

    return generatedCouponCode;
  }

  return null;
}
