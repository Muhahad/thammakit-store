import type { Metadata } from "next";
import { CARRIERS } from "@/config/shipping";
import { formatTHB } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from "@/config/site";

export const metadata: Metadata = {
  title: "การจัดส่ง",
  description: "ข้อมูลการจัดส่งสินค้า ค่าจัดส่ง และผู้ให้บริการขนส่งทั่วประเทศไทย",
};

/** Static shipping information page (linked from the footer). */
export default function ShippingPage() {
  return (
    <div className="container max-w-2xl py-10 prose-sm">
      <h1 className="mb-4 text-2xl font-bold">การจัดส่ง</h1>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          เราจัดส่งสินค้าทั่วประเทศไทยผ่านผู้ให้บริการขนส่งชั้นนำ โดยจะจัดส่งภายใน
          1–2 วันทำการหลังยืนยันการชำระเงิน
        </p>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">ค่าจัดส่ง</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>ค่าจัดส่งเหมาจ่าย {formatTHB(FLAT_SHIPPING_FEE)} ต่อคำสั่งซื้อ</li>
            <li>
              <strong>ส่งฟรี</strong> เมื่อซื้อครบ {formatTHB(FREE_SHIPPING_THRESHOLD)} ขึ้นไป
            </li>
          </ul>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">ผู้ให้บริการขนส่ง</h2>
          <ul className="list-inside list-disc space-y-1">
            {Object.values(CARRIERS).map((c) => (
              <li key={c.label}>{c.label}</li>
            ))}
          </ul>
          <p className="mt-2 text-muted-foreground">
            เมื่อสินค้าถูกจัดส่ง คุณจะได้รับเลขพัสดุทางอีเมลและติดตามสถานะได้ในหน้า “คำสั่งซื้อ”
          </p>
        </div>
      </div>
    </div>
  );
}
