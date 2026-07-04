"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleCoupon, deleteCoupon } from "@/lib/actions/admin-coupons";

/** Per-row toggle (enable/disable) + delete controls for a coupon. */
export function CouponRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      await toggleCoupon(id, !isActive);
      toast.success(isActive ? "ปิดใช้งานคูปองแล้ว" : "เปิดใช้งานคูปองแล้ว");
      router.refresh();
    });
  }

  function onDelete() {
    if (!confirm("ยืนยันการลบคูปองนี้?")) return;
    startTransition(async () => {
      await deleteCoupon(id);
      toast.success("ลบคูปองแล้ว");
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" onClick={onToggle} disabled={pending}>
        {isActive ? "ปิด" : "เปิด"}
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete} disabled={pending}>
        ลบ
      </Button>
    </div>
  );
}
