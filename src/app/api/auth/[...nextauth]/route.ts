import { handlers } from "@/lib/auth";

/** NextAuth v5 catch-all route: exposes GET/POST for sign-in, callback, etc. */
export const { GET, POST } = handlers;
