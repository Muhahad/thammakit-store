"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Inner form — reads `callbackUrl` from the query string. `useSearchParams()`
 * opts a route into client-side rendering, so it must sit inside a <Suspense>
 * boundary (see the default export) to satisfy Next's static-generation rules.
 */
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">เข้าสู่ระบบ</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm">อีเมล</label>
          <input id="email" name="email" type="email" required
            className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm">รหัสผ่าน</label>
          <input id="password" name="password" type="password" required
            className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี? <Link href="/register" className="text-primary hover:underline">สมัครสมาชิก</Link>
      </p>
    </div>
  );
}

/** Page wrapper: provides the Suspense boundary required by useSearchParams(). */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-muted-foreground">กำลังโหลด...</div>}>
      <LoginForm />
    </Suspense>
  );
}
