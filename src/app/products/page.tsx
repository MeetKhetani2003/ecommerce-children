import ProductsListingClient from "@/components/ProductsListingClient";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const catName = category || "All Costumes";
  
  const title = catName === "All" || catName === "All Costumes"
    ? "Buy Kids Fancy Dress Costumes Online - Saheli Shrungar"
    : `Buy ${catName} Costumes for Kids Online - Saheli Shrungar`;
  
  const description = catName === "All" || catName === "All Costumes"
    ? "Explore our wide range of premium fancy dress costumes for school events. Animals, birds, mythology, superheroes, national heroes, and helpers. Cash on delivery."
    : `Buy premium quality ${catName} fancy dress costumes for kids online at Saheli Shrungar. Ideal for school events, festivals, and stage shows. Complete sets, COD.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";
  const canonicalUrl = `${siteUrl}/products${category ? `?category=${encodeURIComponent(category)}` : ""}`;

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

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  
  return (
    <ProductsListingClient initialCategory={category} />
  );
}
