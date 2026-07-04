"use server";

import { prisma } from "@/lib/prisma";

/**
 * Return authoritative product data for adding to cart. The client never sets
 * the price — it always comes from the DB here (prevents price tampering).
 */
export async function getProductForCart(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: { select: { url: true }, take: 1, orderBy: { position: "asc" } },
      inventory: { select: { quantity: true, reserved: true } },
    },
  });
  if (!product) return null;

  const stock = (product.inventory?.quantity ?? 0) - (product.inventory?.reserved ?? 0);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images[0]?.url,
    stock,
  };
}
