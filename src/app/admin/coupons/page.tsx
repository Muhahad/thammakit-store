import type { Coupon } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import { CouponForm } from "@/components/admin/coupon-form";
import { CouponRowActions } from "@/components/admin/coupon-row-actions";

/** Human-readable discount label for a coupon row. */
function discountLabel(c: Coupon): string {
  if (c.type === "FREE_SHIPPING") return "ส่งฟรี";
  if (c.type === "PERCENTAGE") {
    return `${c.value}%${c.maxDiscount ? ` (สูงสุด ${formatTHB(c.maxDiscount)})` : ""}`;
  }
  return formatTHB(c.value); // FIXED (satang)
}

/** Admin coupon management: list + create + enable/disable + delete. */
export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">คูปองส่วนลด ({coupons.length})</h1>
      </div>

      <CouponForm />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="p-3">โค้ด</th>
              <th className="p-3">ส่วนลด</th>
              <th className="p-3 text-right">ขั้นต่ำ</th>
              <th className="p-3 text-right">ใช้แล้ว</th>
              <th className="p-3">ช่วงเวลา</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">ยังไม่มีคูปอง</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3">
                    <span className="font-mono font-semibold">{c.code}</span>
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  </td>
                  <td className="p-3">{discountLabel(c)}</td>
                  <td className="p-3 text-right">{c.minSpend > 0 ? formatTHB(c.minSpend) : "-"}</td>
                  <td className="p-3 text-right">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {c.startsAt ? formatThaiDate(c.startsAt) : "-"}
                    {c.endsAt ? ` → ${formatThaiDate(c.endsAt)}` : ""}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {c.isActive ? "เปิดใช้งาน" : "ปิด"}
                    </span>
                  </td>
                  <td className="p-3">
                    <CouponRowActions id={c.id} isActive={c.isActive} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
