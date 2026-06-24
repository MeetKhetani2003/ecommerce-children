import ProductsListingClient from "@/components/ProductsListingClient";

interface PageProps {
  params: Promise<{ brand: string }>;
}

const formatBrandName = (str: string) => {
  if (str.toLowerCase() === "saheli-shrungar") return "Saheli Shrungar";
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export async function generateMetadata({ params }: PageProps) {
  const { brand } = await params;
  const brandName = formatBrandName(brand);
  
  const title = `Buy ${brandName} Kids Costumes Online in India - Saheli Shrungar`;
  const description = `Shop premium kids fancy dress costumes from ${brandName} at Saheli Shrungar. Complete costume sets, accessories, and widgets for school event annual functions. COD & fast delivery.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";
  const canonicalUrl = `${siteUrl}/brand/${brand.toLowerCase()}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Saheli Shrungar",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { brand } = await params;

  return (
    <ProductsListingClient initialBrand={brand} />
  );
}
