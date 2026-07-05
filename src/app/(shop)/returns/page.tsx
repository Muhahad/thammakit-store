import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "การคืนสินค้า",
  description: "นโยบายการคืนและเปลี่ยนสินค้าของร้านค้าธรรมกิจ",
};

/** Static returns/refund policy page (linked from the footer). */
export default function ReturnsPage() {
  return (
    <div className="container max-w-2xl py-10">
      <h1 className="mb-4 text-2xl font-bold">การคืนและเปลี่ยนสินค้า</h1>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          เรารับประกันความพึงพอใจของลูกค้า หากสินค้ามีปัญหาหรือไม่ตรงตามที่สั่ง
          สามารถขอคืน/เปลี่ยนสินค้าได้ภายใน <strong>7 วัน</strong> นับจากวันที่ได้รับสินค้า
        </p>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">เงื่อนไข</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>สินค้าต้องอยู่ในสภาพสมบูรณ์ พร้อมบรรจุภัณฑ์และป้ายราคาเดิม</li>
            <li>แนบหลักฐานการสั่งซื้อ (เลขที่คำสั่งซื้อ)</li>
            <li>สินค้าลดราคาพิเศษอาจไม่อยู่ในเงื่อนไขการคืนเงิน</li>
          </ul>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">ขั้นตอน</h2>
          <ol className="list-inside list-decimal space-y-1">
            <li>ติดต่อทีมงานพร้อมแจ้งเลขที่คำสั่งซื้อและเหตุผล</li>
            <li>จัดส่งสินค้ากลับตามที่อยู่ที่ได้รับแจ้ง</li>
            <li>เมื่อได้รับและตรวจสอบแล้ว จะคืนเงินภายใน 3–7 วันทำการ</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
