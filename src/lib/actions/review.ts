"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";

/**
 * Submit (or update) a product review.
 *
 * Rules:
 *  - Must be signed in.
 *  - Verified-purchase only: the user must have a DELIVERED order containing the
 *    product. This blocks fake reviews.
 *  - One review per user per product (enforced by a unique index + upsert).
 *  - After writing, the product's denormalized ratingAvg/ratingCount are
 *    recomputed in the same transaction so listings/PDP stay accurate.
 */
export async function submitReview(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { error: "กรุณาเข้าสู่ระบบ" };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: "ข้อมูลรีวิวไม่ถูกต้อง" };
  const { productId, rating, title, comment } = parsed.data;

  const purchased = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: "DELIVERED",
      items: { some: { productId } },
    },
    select: { id: true },
  });
  if (!purchased) return { error: "คุณสามารถรีวิวได้เฉพาะสินค้าที่ซื้อและได้รับแล้ว" };

  await prisma.$transaction(async (tx) => {
    await tx.review.upsert({
      where: { productId_userId: { productId, userId: session.user.id } },
      update: { rating, title, comment },
      create: { productId, userId: session.user.id, rating, title, comment },
    });

    const agg = await tx.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    await tx.product.update({
      where: { id: productId },
      data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
    });
  });

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (product) revalidatePath(`/products/${product.slug}`);
  return { ok: true };
}
