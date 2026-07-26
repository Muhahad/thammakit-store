"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { confirmPayment } from "@/lib/actions/admin-products";

/**
 * Admin action: confirm that a PromptPay / bank-transfer payment was received.
 * Marks the order paid, decrements stock, and emails the customer.
 */
export function ConfirmPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("ยืนยันว่าได้รับชำระเงินสำหรับคำสั่งซื้อนี้แล้ว?")) return;
    startTransition(async () => {
      const res = await confirmPayment(orderId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("ยืนยันการชำระเงินแล้ว · ตัดสต็อกเรียบร้อย");
      router.refresh();
    });
  }

  return (
    <Button size="sm" onClick={onClick} disabled={pending}>
      <CheckCircle2 className="size-4" />
      {pending ? "กำลังยืนยัน..." : "ยืนยันการชำระเงิน"}
    </Button>
  );
}
