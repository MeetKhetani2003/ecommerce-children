import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";

export const metadata: Metadata = {
  title: "My Profile | Saheli Shrungar",
  description: "Manage your profile, view order history, and saved addresses at Saheli Shrungar.",
  alternates: {
    canonical: `${siteUrl}/profile`,
  },
  openGraph: {
    title: "My Profile | Saheli Shrungar",
    description: "Manage your profile, view order history, and saved addresses at Saheli Shrungar.",
    url: `${siteUrl}/profile`,
  }
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
