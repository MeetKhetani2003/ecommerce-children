import ProductsListingClient from "@/components/ProductsListingClient";

interface PageProps {
  params: Promise<{ city: string }>;
}

const formatCityName = (str: string) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export async function generateMetadata({ params }: PageProps) {
  const { city } = await params;
  const cityName = formatCityName(city);
  
  const title = `Kids Fancy Dress Costumes in ${cityName} | Buy Online - Saheli Shrungar`;
  const description = `Premium fancy dress costumes for kids in ${cityName}. Shop complete costume sets for school events, competitions, and dance annual days in ${cityName}. Fast next-day delivery and cash on delivery.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";
  const canonicalUrl = `${siteUrl}/city/${city.toLowerCase()}`;

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

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;
  const cityName = formatCityName(city);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Saheli Shrungar - Kids Fancy Dress in ${cityName}`,
    "image": `${process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com"}/assets/logo.png`,
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com"}/city/${city.toLowerCase()}`,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com"}/city/${city.toLowerCase()}`,
    "priceRange": "INR",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": cityName,
      "addressCountry": "IN"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": cityName
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <ProductsListingClient initialCity={city} />
    </>
  );
}
