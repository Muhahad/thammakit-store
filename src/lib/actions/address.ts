"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";

/** List the signed-in user's saved addresses (default first). */
export async function getUserAddresses() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

/**
 * Create an address. If it's flagged default (or is the user's first), all other
 * addresses are un-defaulted in the same transaction so exactly one is default.
 */
export async function createAddress(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { error: "กรุณาเข้าสู่ระบบ" };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  const count = await prisma.address.count({ where: { userId: session.user.id } });
  const makeDefault = data.isDefault || count === 0;

  await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
    }
    await tx.address.create({ data: { ...data, isDefault: makeDefault, userId: session.user.id } });
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true };
}

/** Delete one of the user's addresses (ownership enforced by the where clause). */
export async function deleteAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "กรุณาเข้าสู่ระบบ" };
  await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/account/addresses");
  return { ok: true };
}
