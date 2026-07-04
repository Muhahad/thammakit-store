"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validators";
import { deleteImage } from "@/lib/cloudinary";

/** Throw unless the caller is an admin. Used by every mutating admin action. */
async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}

/**
 * Create a product with images (already uploaded to Cloudinary client-side) and
 * an initial inventory row. Wrapped in a transaction for consistency.
 */
export async function createProduct(input: unknown) {
  await assertAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const data = parsed.data;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      nameEn: data.nameEn,
      slug: data.slug,
      description: data.description,
      descriptionEn: data.descriptionEn,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      sku: data.sku,
      categoryId: data.categoryId,
      weightGrams: data.weightGrams,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      isNewArrival: data.isNewArrival,
      isBestSeller: data.isBestSeller,
      specs: data.specs,
      images: { create: data.images.map((img, i) => ({ ...img, position: i })) },
      inventory: { create: { quantity: data.quantity } },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, id: product.id };
}

/** Update a product's core fields and inventory quantity. */
export async function updateProduct(id: string, input: unknown) {
  await assertAdmin();
  const parsed = productSchema.partial().safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const { quantity, images: _images, ...fields } = parsed.data;

  await prisma.product.update({ where: { id }, data: fields });
  if (quantity != null) {
    await prisma.inventory.update({ where: { productId: id }, data: { quantity } });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true };
}

/** Soft-friendly delete: remove Cloudinary assets then the product row. */
export async function deleteProduct(id: string) {
  await assertAdmin();
  const images = await prisma.productImage.findMany({ where: { productId: id }, select: { publicId: true } });
  await Promise.allSettled(images.map((img) => deleteImage(img.publicId)));
  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  return { ok: true };
}

/** Update order shipping status + tracking; used by the orders admin page. */
export async function updateOrderStatus(
  orderId: string,
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  tracking?: { carrier: string; trackingNumber: string },
) {
  await assertAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === "SHIPPED" && tracking && {
        carrier: tracking.carrier as never,
        trackingNumber: tracking.trackingNumber,
        shippedAt: new Date(),
      }),
      ...(status === "DELIVERED" && { deliveredAt: new Date() }),
    },
  });
  revalidatePath("/admin/orders");
  return { ok: true };
}
