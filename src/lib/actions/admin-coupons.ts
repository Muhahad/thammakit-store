"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { couponSchema } from "@/lib/validators";

/** Throw unless the caller is an admin. */
async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("FORBIDDEN");
}

/**
 * Create a discount coupon. `value` semantics depend on `type`:
 *  - PERCENTAGE   -> percent off (0–100)
 *  - FIXED        -> satang off
 *  - FREE_SHIPPING-> value ignored
 * `minSpend`/`maxDiscount` are satang (converted from Baht by the form).
 * Codes are unique + uppercased by the schema.
 */
export async function createCoupon(input: unknown) {
  await assertAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { error: { code: ["โค้ดนี้มีอยู่แล้ว"] } };

  await prisma.coupon.create({ data: parsed.data });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

/** Update an existing coupon (all fields optional). */
export async function updateCoupon(id: string, input: unknown) {
  await assertAdmin();
  const parsed = couponSchema.partial().safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await prisma.coupon.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

/** Enable/disable a coupon without deleting it (preserves usage history). */
export async function toggleCoupon(id: string, isActive: boolean) {
  await assertAdmin();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

/** Delete a coupon. Orders keep their snapshotted couponCode, so this is safe. */
export async function deleteCoupon(id: string) {
  await assertAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}
