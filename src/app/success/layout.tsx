import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";

export const metadata: Metadata = {
  title: "Order Success | Saheli Shrungar",
  description: "Your order was successfully placed at Saheli Shrungar.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${siteUrl}/success`,
  },
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
