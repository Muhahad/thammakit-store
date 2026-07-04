"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/lib/actions/auth";

/** Customer registration; on success, auto-signs in and redirects home. */
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form) as Record<string, string>;

    const res = await registerUser(payload);
    if (res.error) {
      setErrors(res.error as Record<string, string[]>);
      setLoading(false);
      return;
    }

    // Auto-login after successful registration.
    await signIn("credentials", { email: payload.email, password: payload.password, redirect: false });
    toast.success("สมัครสมาชิกสำเร็จ 🎉");
    router.push("/");
    router.refresh();
  }

  const Err = ({ f }: { f: string }) =>
    errors[f]?.[0] ? <p className="mt-1 text-xs text-destructive">{errors[f][0]}</p> : null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">สมัครสมาชิก</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {[
          { name: "name", label: "ชื่อ-นามสกุล", type: "text" },
          { name: "email", label: "อีเมล", type: "email" },
          { name: "phone", label: "เบอร์มือถือ", type: "tel" },
          { name: "password", label: "รหัสผ่าน", type: "password" },
          { name: "confirmPassword", label: "ยืนยันรหัสผ่าน", type: "password" },
        ].map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="mb-1 block text-sm">{f.label}</label>
            <input id={f.name} name={f.name} type={f.type} required
              className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            <Err f={f.name} />
          </div>
        ))}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว? <Link href="/login" className="text-primary hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}
