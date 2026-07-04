"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Toggle a product in the current user's wishlist. Returns the new state
 * (`added`), or an auth error the client can use to redirect to /login.
 */
export async function toggleWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "AUTH_REQUIRED" };

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { added: false };
  }

  await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
  revalidatePath("/wishlist");
  return { added: true };
}
