import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/config/site";

/**
 * Dynamic sitemap: static routes + every active product and category.
 * Next.js serves this at /sitemap.xml and revalidates on each request in prod
 * (cheap query with indexed selects).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/products`, changeFrequency: "daily", priority: 0.9 },
  ];

  // Degrade gracefully: if the DB is unreachable (e.g. during a deploy blip),
  // still emit the static routes rather than failing the whole build.
  let products: { slug: string; updatedAt: Date }[] = [];
  let categories: { slug: string; updatedAt: Date }[] = [];
  try {
    [products, categories] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);
  } catch {
    return staticRoutes;
  }

  return [
    ...staticRoutes,
    ...categories.map((c) => ({
      url: `${SITE.url}/products?category=${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${SITE.url}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
