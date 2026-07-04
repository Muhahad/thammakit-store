"use client";

import { useState, useTransition } from "react";
import type { OrderStatus, ShippingCarrier } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CARRIER_OPTIONS } from "@/config/shipping";
import { updateOrderStatus } from "@/lib/actions/admin-products";

/**
 * Inline control to advance an order's shipping status. When moving to SHIPPED,
 * a carrier + tracking number are required (the shipping notification email is
 * sent from the action).
 */
export function OrderStatusControl({
  orderId,
  status,
  carrier,
  trackingNumber,
}: {
  orderId: string;
  status: OrderStatus;
  carrier: ShippingCarrier | null;
  trackingNumber: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [nextStatus, setNextStatus] = useState<string>(status);
  const [selCarrier, setSelCarrier] = useState<string>(carrier ?? CARRIER_OPTIONS[0]!.value);
  const [tracking, setTracking] = useState(trackingNumber ?? "");

  function save() {
    if (nextStatus === "SHIPPED" && !tracking.trim()) {
      toast.error("กรุณากรอกเลขพัสดุ");
      return;
    }
    startTransition(async () => {
      const res = await updateOrderStatus(
        orderId,
        nextStatus as "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
        nextStatus === "SHIPPED" ? { carrier: selCarrier, trackingNumber: tracking } : undefined,
      );
      if (res.ok) toast.success("อัปเดตสถานะแล้ว");
      else toast.error("อัปเดตไม่สำเร็จ");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} className="h-9 rounded-md border bg-background px-2">
        {["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {nextStatus === "SHIPPED" && (
        <>
          <select value={selCarrier} onChange={(e) => setSelCarrier(e.target.value)} className="h-9 rounded-md border bg-background px-2">
            {CARRIER_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="เลขพัสดุ"
            className="h-9 w-40 rounded-md border bg-background px-2" aria-label="เลขพัสดุ" />
        </>
      )}

      <Button size="sm" onClick={save} disabled={pending || nextStatus === status && !tracking}>
        {pending ? "..." : "บันทึก"}
      </Button>
    </div>
  );
}
