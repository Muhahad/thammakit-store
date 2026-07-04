import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Centralized read queries for the storefront (Server Components call these).
 * Keeping selects here avoids over-fetching and gives one place to add caching.
 */

const productCard = {
  id: true,
  name: true,
  slug: true,
  price: true,
  compareAtPrice: true,
  ratingAvg: true,
  ratingCount: true,
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" }, take: 1 },
  inventory: { select: { quantity: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCard }>;

/** Homepage: featured products. */
export function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    select: productCard,
    take,
    orderBy: { createdAt: "desc" },
  });
}

/** Homepage: newest products. */
export function getNewArrivals(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isNewArrival: true },
    select: productCard,
    take,
    orderBy: { createdAt: "desc" },
  });
}

/** Homepage: best sellers (by units sold). */
export function getBestSellers(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isBestSeller: true },
    select: productCard,
    take,
    orderBy: { soldCount: "desc" },
  });
}

/** Homepage: category tiles. */
export function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true, slug: true, image: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Product listing page with search / filter / sort. Returns items + total count
 * for pagination. All filters are optional and composed into one `where`.
 */
export async function getProducts(params: {
  q?: string;
  categorySlug?: string;
  minPrice?: number; // satang
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  perPage?: number;
}) {
  const { q, categorySlug, minPrice, maxPrice, sort = "newest", page = 1, perPage = 12 } = params;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { nameEn: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...((minPrice != null || maxPrice != null) && {
      price: { ...(minPrice != null && { gte: minPrice }), ...(maxPrice != null && { lte: maxPrice }) },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc" ? { price: "asc" }
    : sort === "price-desc" ? { price: "desc" }
    : sort === "popular" ? { soldCount: "desc" }
    : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCard,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, pages: Math.ceil(total / perPage), page };
}

/** Full product detail by slug (PDP). */
export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      inventory: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/** Related products in the same category (excludes the current product). */
export function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  return prisma.product.findMany({
    where: { categoryId, id: { not: excludeId }, isActive: true },
    select: productCard,
    take,
  });
}
