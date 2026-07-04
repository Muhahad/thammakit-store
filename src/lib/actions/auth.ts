"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

/**
 * Register a new customer. Hashes the password with bcrypt and stores the phone
 * normalized. Returns a generic error on duplicate email (no enumeration detail
 * beyond "email already used", which is standard UX).
 */
export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: { email: ["อีเมลนี้ถูกใช้งานแล้ว"] } };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "CUSTOMER" },
  });

  return { ok: true };
}
