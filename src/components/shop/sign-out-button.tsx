"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Sign out and return to the homepage. */
export function SignOutButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut className="size-4" /> ออกจากระบบ
    </Button>
  );
}
