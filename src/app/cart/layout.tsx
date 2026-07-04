import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";

export const metadata: Metadata = {
  title: "Your Cart | Saheli Shrungar",
  description: "View and manage your fancy dress costumes cart at Saheli Shrungar. Secure checkout and fast delivery.",
  alternates: {
    canonical: `${siteUrl}/cart`,
  },
  openGraph: {
    title: "Your Cart | Saheli Shrungar",
    description: "View and manage your fancy dress costumes cart at Saheli Shrungar. Secure checkout and fast delivery.",
    url: `${siteUrl}/cart`,
  }
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
