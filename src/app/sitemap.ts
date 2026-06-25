import { MetadataRoute } from "next";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// Major Indian cities list for pre-populating the sitemap
const MAJOR_CITIES = [
  "mumbai",
  "delhi",
  "bangalore",
  "pune",
  "hyderabad",
  "chennai",
  "kolkata",
  "ahmedabad",
  "surat",
  "jaipur",
  "lucknow",
  "patna",
  "indore",
  "thane",
  "bhopal",
  "visakhapatnam",
  "vadodara",
  "ghaziabad",
  "ludhiana",
  "agra",
  "nashik",
  "faridabad",
  "meerut",
  "rajkot",
  "varanasi",
  "srinagar",
  "aurangabad",
  "dhanbad",
  "amritsar",
  "navi-mumbai",
  "ranchi",
  "gwalior",
  "coimbatore",
  "vijayawada",
  "jodhpur",
  "madurai",
  "raipur",
  "kota",
  "chandigarh",
  "guwahati",
  "solapur",
  "mysore",
  "gurgaon",
  "noida",
  "kochi"
];

const CATEGORIES = [
  "Animal Costume",
  "Birds Costume",
  "Insect Costume",
  "Water Animals Costume",
  "Fruit Costume",
  "Vegetable Costume",
  "Flower Costume",
  "Indian State Costume",
  "Indian Mythology Costume",
  "Indian Dance Costume",
  "Republic Day / Independence Day",
  "National Heroes",
  "Halloween Costumes",
  "Super Heroes",
  "Cartoon Characters Costume",
  "Our Helpers",
  "Community Helpers",
  "Caps / Hats / Safa / Pagdi",
  "Face Masks",
  "Hair Wigs",
  "Silver / Golden Jewellery",
  "Umbrella / Fans",
  "Offer Products"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahelishrungar.com";
  
  // 1. Static Routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    await dbConnect();

    // 2. Dynamic Categories Routes
    CATEGORIES.forEach((cat) => {
      routes.push({
        url: `${siteUrl}/products?category=${encodeURIComponent(cat)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    // 3. Dynamic Products Routes
    const products = await Product.find({}).lean();
    products.forEach((p: any) => {
      routes.push({
        url: `${siteUrl}/product/${p.slug || p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    // 4. Unique Brands Routes
    const uniqueBrands = await Product.distinct("brand");
    const validBrands = uniqueBrands.filter(Boolean) as string[];
    
    // Add default brand if not already present
    if (!validBrands.some(b => slugify(b) === "saheli-shrungar")) {
      validBrands.push("Saheli Shrungar");
    }

    validBrands.forEach((brand) => {
      const brandSlug = slugify(brand);
      routes.push({
        url: `${siteUrl}/brand/${brandSlug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    // 5. City-Based Local Landing Pages
    MAJOR_CITIES.forEach((city) => {
      routes.push({
        url: `${siteUrl}/city/${city}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      // 6. City + Brand Combinations (For top 10 cities to prevent sitemap bloat)
      const TOP_10_CITIES = ["mumbai", "delhi", "bangalore", "pune", "hyderabad", "chennai", "kolkata", "ahmedabad", "surat", "jaipur"];
      if (TOP_10_CITIES.includes(city)) {
        validBrands.forEach((brand) => {
          const brandSlug = slugify(brand);
          routes.push({
            url: `${siteUrl}/city/${city}/${brandSlug}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
          });
        });
      }
    });

  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
  }

  return routes;
}
