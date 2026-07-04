"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

/** Heart toggle that calls the wishlist server action; redirects guests to login. */
export function WishlistButton({ productId, initialSaved = false }: { productId: string; initialSaved?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if (res.error === "AUTH_REQUIRED") {
        router.push("/login?callbackUrl=/wishlist");
        return;
      }
      setSaved(!!res.added);
      toast.success(res.added ? "เพิ่มในรายการโปรดแล้ว" : "นำออกจากรายการโปรดแล้ว");
    });
  }

  return (
    <Button variant="outline" size="icon" onClick={onClick} disabled={pending} aria-label="รายการโปรด" aria-pressed={saved}>
      <Heart className={cn("size-5", saved && "fill-destructive text-destructive")} />
    </Button>
  );
}
