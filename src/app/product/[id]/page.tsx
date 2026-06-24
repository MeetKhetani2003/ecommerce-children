import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";
import ProductDetailClient from "@/components/ProductDetailClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProductData(id: string) {
  await dbConnect();
  
  let product = null;
  if (!isNaN(Number(id))) {
    product = await Product.findOne({ id: Number(id) }).lean();
  } else {
    product = await Product.findById(id).lean();
  }
  
  if (!product) return null;

  const allProducts = await Product.find({}).sort({ id: -1 }).lean();

  // Bulletproof serialization of Mongoose documents for client components
  return {
    product: JSON.parse(JSON.stringify(product)),
    allProducts: JSON.parse(JSON.stringify(allProducts)),
  };
}

function generateProductKeywords(product: any): string[] {
  const title = product.title || "";
  const category = product.category || "";
  const features = product.features || product.material || "";
  const description = product.description || "";

  const keywords = new Set<string>();

  // 1. Core Titles
  keywords.add(title.toLowerCase());
  keywords.add(`${title.toLowerCase()} costume`);
  keywords.add(`${title.toLowerCase()} fancy dress`);
  keywords.add(`${title.toLowerCase()} for kids`);
  keywords.add(`buy ${title.toLowerCase()} online`);
  keywords.add(`kids ${title.toLowerCase()} dress`);

  // 2. Category terms
  if (category) {
    keywords.add(`${category.toLowerCase()} fancy dress`);
    keywords.add(`kids ${category.toLowerCase()} costumes`);
    keywords.add(`buy ${category.toLowerCase()} costumes`);
  }

  // 3. Feature and Material integrations
  if (features) {
    const featureList = features.split(",").map((f: string) => f.trim().toLowerCase()).filter(Boolean);
    featureList.forEach((f: string) => {
      keywords.add(`${f} ${title.toLowerCase()}`);
      keywords.add(`${title.toLowerCase()} made of ${f}`);
    });
  }

  // 4. Common high-intent e-commerce searches
  keywords.add(`${title.toLowerCase()} school competition`);
  keywords.add(`${title.toLowerCase()} annual day`);
  keywords.add(`${title.toLowerCase()} stage show`);
  keywords.add(`${title.toLowerCase()} price`);
  keywords.add(`fancy dress ${title.toLowerCase()} complete set`);
  keywords.add(`kids fancy dress in india`);
  keywords.add(`fancy dress costumes with fast delivery`);

  // 5. Extracts from description
  const stopWords = new Set(["a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "in", "on", "at", "to", "for", "with", "by", "of", "from", "your", "kids", "premium", "quality", "perfect"]);
  const descWords = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, "")
    .split(/\s+/)
    .filter((w: string) => w.length > 3 && !stopWords.has(w));
  
  const uniqueDescWords = Array.from(new Set(descWords)).slice(0, 5);
  uniqueDescWords.forEach((word) => {
    keywords.add(`${word} ${title.toLowerCase()}`);
  });

  return Array.from(keywords).slice(0, 20);
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const data = await getProductData(id);
  
  if (!data || !data.product) {
    return {
      title: "Costume Not Found - Saheli Shrungar",
      description: "The requested kids fancy dress costume could not be found.",
    };
  }

  const { product } = data;
  const title = `Buy ${product.title} Online | Kids Fancy Dress Costume - Saheli Shrungar`;
  const description = product.description
    ? `${product.description.substring(0, 155)}...`
    : `Buy premium quality ${product.title} fancy dress costume for kids online at Saheli Shrungar. Complete set, fast next-day delivery, cash on delivery available.`;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";
  const canonicalUrl = `${siteUrl}/product/${product.id}`;

  return {
    title,
    description,
    keywords: generateProductKeywords(product),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: product.image, width: 800, height: 1000, alt: product.title }],
      type: "website",
      siteName: "Saheli Shrungar",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getProductData(id);

  if (!data) {
    notFound();
  }

  const { product, allProducts } = data;

  // Generate JSON-LD Product Schema Markup
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.image,
    "description": product.description || `Premium ${product.title} kids costume.`,
    "sku": product.sku || `SAH-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Saheli Shrungar"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com"}/product/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Saheli Shrungar"
      }
    }
  };

  // Generate Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": product.category,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com"}/products?category=${encodeURIComponent(product.category)}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.title,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com"}/product/${product.id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient product={product} allProducts={allProducts} />
    </>
  );
}
