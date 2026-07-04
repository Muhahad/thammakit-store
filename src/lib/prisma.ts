import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton.
 *
 * In development, Next.js hot-reload re-imports modules repeatedly which would
 * otherwise create a new PrismaClient (and a new connection pool) on every
 * reload, exhausting the database. We cache the instance on `globalThis`.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
