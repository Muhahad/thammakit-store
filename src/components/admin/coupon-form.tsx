"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCoupon } from "@/lib/actions/admin-coupons";

type CouponType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";

/**
 * Collapsible create-coupon form. Money fields are entered in Baht and converted
 * to satang before submit; for PERCENTAGE, `value` is the percent (0–100).
 */
export function CouponForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CouponType>("PERCENTAGE");
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const f = new FormData(e.currentTarget);
    const rawValue = Number(f.get("value") ?? 0);

    const payload = {
      code: f.get("code") as string,
      description: (f.get("description") as string) || undefined,
      type,
      // percent stays as-is; fixed amount is Baht -> satang; free-shipping = 0
      value: type === "PERCENTAGE" ? rawValue : type === "FIXED" ? Math.round(rawValue * 100) : 0,
      minSpend: Math.round(Number(f.get("minSpend") ?? 0) * 100),
      maxDiscount: f.get("maxDiscount") ? Math.round(Number(f.get("maxDiscount")) * 100) : undefined,
      usageLimit: f.get("usageLimit") ? Number(f.get("usageLimit")) : undefined,
      perUserLimit: f.get("perUserLimit") ? Number(f.get("perUserLimit")) : undefined,
      startsAt: (f.get("startsAt") as string) || undefined,
      endsAt: (f.get("endsAt") as string) || undefined,
      isActive: true,
    };

    startTransition(async () => {
      const res = await createCoupon(payload);
      if (res.error) {
        setErrors(res.error as Record<string, string[]>);
        toast.error("บันทึกไม่สำเร็จ ตรวจสอบข้อมูล");
        return;
      }
      toast.success("สร้างคูปองแล้ว");
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> สร้างคูปอง
      </Button>
    );
  }

  const input = "h-9 w-full rounded-md border bg-background px-2 text-sm";
  const Err = ({ f }: { f: string }) =>
    errors[f]?.[0] ? <p className="mt-1 text-xs text-destructive">{errors[f][0]}</p> : null;

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <h2 className="font-semibold">สร้างคูปองใหม่</h2>
      </div>

      <div>
        <label className="mb-1 block text-xs">โค้ด (เช่น WELCOME10)</label>
        <input name="code" required className={`${input} uppercase`} />
        <Err f="code" />
      </div>
      <div>
        <label className="mb-1 block text-xs">ประเภทส่วนลด</label>
        <select value={type} onChange={(e) => setType(e.target.value as CouponType)} className={input}>
          <option value="PERCENTAGE">เปอร์เซ็นต์ (%)</option>
          <option value="FIXED">จำนวนเงินคงที่ (฿)</option>
          <option value="FREE_SHIPPING">ส่งฟรี</option>
        </select>
      </div>

      {type !== "FREE_SHIPPING" && (
        <div>
          <label className="mb-1 block text-xs">
            {type === "PERCENTAGE" ? "ส่วนลด (%)" : "ส่วนลด (฿)"}
          </label>
          <input name="value" type="number" min="0" step={type === "PERCENTAGE" ? "1" : "0.01"} required className={input} />
          <Err f="value" />
        </div>
      )}
      {type === "PERCENTAGE" && (
        <div>
          <label className="mb-1 block text-xs">ส่วนลดสูงสุด (฿, ไม่บังคับ)</label>
          <input name="maxDiscount" type="number" min="0" step="0.01" className={input} />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs">ยอดซื้อขั้นต่ำ (฿)</label>
        <input name="minSpend" type="number" min="0" step="0.01" defaultValue="0" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs">จำกัดจำนวนครั้ง (ทั้งหมด)</label>
        <input name="usageLimit" type="number" min="1" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs">จำกัดต่อผู้ใช้</label>
        <input name="perUserLimit" type="number" min="1" className={input} />
      </div>

      <div>
        <label className="mb-1 block text-xs">เริ่มใช้ (ไม่บังคับ)</label>
        <input name="startsAt" type="datetime-local" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs">หมดอายุ (ไม่บังคับ)</label>
        <input name="endsAt" type="datetime-local" className={input} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs">คำอธิบาย (ไม่บังคับ)</label>
        <input name="description" className={input} />
      </div>

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "กำลังบันทึก..." : "บันทึกคูปอง"}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
      </div>
    </form>
  );
}
