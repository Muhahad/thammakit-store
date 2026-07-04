import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/** Augment NextAuth types to carry our `id` and `role` on the session/user. */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
