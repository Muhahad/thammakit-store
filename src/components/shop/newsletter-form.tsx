"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Newsletter signup — posts the email to /api/newsletter. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("สมัครรับข่าวสารเรียบร้อย 🎉");
      setEmail("");
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="อีเมลของคุณ"
        aria-label="อีเมลสำหรับรับข่าวสาร"
        className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "..." : "สมัคร"}
      </Button>
    </form>
  );
}
