"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/lib/actions/review";
import { cn } from "@/lib/utils";

/**
 * Review submission form (verified-purchase enforced server-side). Interactive
 * star rating; on success it refreshes so the new review + rating appear.
 */
export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitReview({
        productId,
        rating,
        title: (f.get("title") as string) || undefined,
        comment: (f.get("comment") as string) || undefined,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("ขอบคุณสำหรับรีวิว");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-4">
      <h3 className="font-medium">เขียนรีวิว</h3>
      <div className="flex gap-1" role="radiogroup" aria-label="ให้คะแนน">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={rating === i + 1}
            aria-label={`${i + 1} ดาว`}
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
          >
            <Star className={cn("size-6", (hover || rating) > i ? "fill-accent text-accent" : "text-muted")} />
          </button>
        ))}
      </div>
      <input name="title" placeholder="หัวข้อรีวิว (ไม่บังคับ)" className="h-9 w-full rounded-md border bg-background px-3 text-sm" />
      <textarea name="comment" placeholder="แบ่งปันความคิดเห็นของคุณ" rows={3} className="w-full rounded-md border bg-background p-3 text-sm" />
      <Button type="submit" disabled={pending}>{pending ? "กำลังส่ง..." : "ส่งรีวิว"}</Button>
    </form>
  );
}
