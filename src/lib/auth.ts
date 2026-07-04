import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validators";

/**
 * Full NextAuth v5 setup (Node.js runtime).
 *
 * - Credentials provider: email + password verified against `passwordHash`
 *   with bcrypt. Returns null on any failure (no user enumeration).
 * - Google OAuth (optional, enabled when env vars are present).
 * - JWT sessions (see auth.config.ts) so middleware can authorize on the edge.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Cast needed: @auth/prisma-adapter bundles its own @auth/core copy, so its
  // Adapter type is nominally distinct from next-auth's even though it's compatible.
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
  ],
});
