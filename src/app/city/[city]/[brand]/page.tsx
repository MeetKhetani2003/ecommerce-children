import ProductsListingClient from "@/components/ProductsListingClient";

interface PageProps {
  params: Promise<{ city: string; brand: string }>;
}

const formatName = (str: string) => {
  if (str.toLowerCase() === "saheli-shrungar") return "Saheli Shrungar";
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export async function generateMetadata({ params }: PageProps) {
  const { city, brand } = await params;
  const cityName = formatName(city);
  const brandName = formatName(brand);
  
  const title = `Buy ${brandName} Kids Fancy Dress Costumes in ${cityName} - Saheli Shrungar`;
  const description = `Shop premium ${brandName} kids fancy dress costumes in ${cityName} online at Saheli Shrungar. Get complete high quality costumes for school events with fast next-day delivery in ${cityName}.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";
  const canonicalUrl = `${siteUrl}/city/${city.toLowerCase()}/${brand.toLowerCase()}`;

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

export default async function CityBrandPage({ params }: PageProps) {
  const { city, brand } = await params;

  return (
    <ProductsListingClient initialCity={city} initialBrand={brand} />
  );
}
