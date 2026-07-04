"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

/**
 * Change a user's role (CUSTOMER <-> ADMIN).
 *
 * Safety rails:
 *  - Admin-only.
 *  - An admin cannot demote *themselves* (prevents accidentally locking the
 *    whole team out of the dashboard mid-session).
 *  - Refuses to remove the last remaining admin.
 */
export async function updateUserRole(userId: string, role: Role) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "FORBIDDEN" };

  if (userId === session.user.id && role !== "ADMIN") {
    return { error: "ไม่สามารถถอดสิทธิ์แอดมินของตัวเองได้" };
  }

  if (role === "CUSTOMER") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (target?.role === "ADMIN" && admins <= 1) {
      return { error: "ต้องมีแอดมินอย่างน้อย 1 คน" };
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { ok: true };
}
