import "./globals.css";
import Layout from "@/components/Layout";
import Providers from "@/components/Providers";

export const metadata = {
  title: {
    default: "Saheli Shrungar - Premium Kids Fancy Dress Costumes",
    template: "%s | Saheli Shrungar",
  },
  description: "India's premier online store for premium kids fancy dress costumes for school annual days, competitions, and festivals. Fast next-day delivery, secure payments, and COD.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Saheli Shrungar - Premium Kids Fancy Dress Costumes",
    description: "India's premier online store for premium kids fancy dress costumes for school events. Animals, mythology, dance, helpers. Fast next-day delivery and COD.",
    url: "https://sahelishrungar.com",
    siteName: "Saheli Shrungar",
    images: [
      {
        url: "/assets/logo.png",
        width: 500,
        height: 500,
        alt: "Saheli Shrungar Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saheli Shrungar - Premium Kids Fancy Dress Costumes",
    description: "India's premier online store for premium kids fancy dress costumes for school events. Fast next-day delivery and COD.",
    images: ["/assets/logo.png"],
  },
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster position="top-center" />
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
