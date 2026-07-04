import { SITE } from "@/config/site";

/**
 * Build schema.org Product JSON-LD for a PDP. Rendered in a <script> tag so
 * Google can show rich results (price, rating, availability).
 */
export function productJsonLd(product: {
  name: string;
  description: string;
  slug: string;
  price: number; // satang
  images: { url: string }[];
  sku: string;
  ratingAvg: number;
  ratingCount: number;
  inStock: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/products/${product.slug}`,
      priceCurrency: "THB",
      price: (product.price / 100).toFixed(2),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratingAvg.toFixed(1),
        reviewCount: product.ratingCount,
      },
    }),
  };
}
