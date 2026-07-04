import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";

export const metadata: Metadata = {
  title: "Your Wishlist | Saheli Shrungar",
  description: "View your saved fancy dress costumes and favorite items at Saheli Shrungar.",
  alternates: {
    canonical: `${siteUrl}/wishlist`,
  },
  openGraph: {
    title: "Your Wishlist | Saheli Shrungar",
    description: "View your saved fancy dress costumes and favorite items at Saheli Shrungar.",
    url: `${siteUrl}/wishlist`,
  }
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
