import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware runs on the edge for every matched request. It uses the edge-safe
 * auth config to enforce the `authorized` route guard (admin + account areas).
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect app routes; exclude static assets, images, and the auth API.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
