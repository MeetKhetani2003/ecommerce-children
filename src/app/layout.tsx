import "./globals.css";
import Layout from "@/components/Layout";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Saheli Shrungar",
  description: "Premium Kids Costumes",
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
