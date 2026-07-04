import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no database / bcrypt imports) — used by middleware.
 * The `authorized` callback is the route guard; the full provider list lives in
 * `auth.ts` which runs in the Node.js runtime.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    /** Route protection evaluated in middleware for every matched request. */
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user;
      const path = nextUrl.pathname;

      const isAdminArea = path.startsWith("/admin");
      const isAccountArea =
        path.startsWith("/account") ||
        path.startsWith("/checkout") ||
        path.startsWith("/orders") ||
        path.startsWith("/wishlist");

      if (isAdminArea) return user?.role === "ADMIN";
      if (isAccountArea) return !!user;
      return true; // public routes
    },
    /** Persist id + role onto the JWT so we don't hit the DB on every request. */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    /** Expose id + role to the client session. */
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
  },
  providers: [], // added in auth.ts
} satisfies NextAuthConfig;
