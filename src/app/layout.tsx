import "./globals.css";
import Layout from "@/components/Layout";
import { ShopProvider } from "@/context/ShopContext";

export const metadata = {
  title: "Saheli Shrungar",
  description: "Premium Kids Costumes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ShopProvider>
          <Layout>
            {children}
          </Layout>
        </ShopProvider>
      </body>
    </html>
  );
}
