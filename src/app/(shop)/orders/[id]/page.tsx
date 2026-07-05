import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import { CARRIERS } from "@/config/shipping";
import { CheckCircle2, Clock } from "lucide-react";
import { StripePayment } from "@/components/shop/stripe-payment";

export const metadata: Metadata = { title: "รายละเอียดคำสั่งซื้อ", robots: { index: false } };

const STATUS_FLOW = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const STATUS_LABEL: Record<string, string> = {
  PENDING: "รอชำระเงิน", PAID: "ชำระเงินแล้ว", PROCESSING: "กำลังเตรียมสินค้า",
  SHIPPED: "จัดส่งแล้ว", DELIVERED: "ได้รับสินค้าแล้ว", CANCELLED: "ยกเลิก", REFUNDED: "คืนเงิน",
};

/** Order detail + payment instructions. Ownership enforced by userId filter. */
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true, payment: true },
  });
  if (!order) notFound();

  // Render the PromptPay QR on the server from the stored EMVCo payload.
  const qrDataUrl =
    order.payment?.method === "PROMPTPAY" && order.payment.promptpayPayload
      ? await QRCode.toDataURL(order.payment.promptpayPayload, { width: 240, margin: 1 })
      : null;

  const currentIndex = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6 rounded-xl border bg-primary/5 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 size-10 text-primary" />
        <h1 className="text-xl font-bold">ขอบคุณสำหรับคำสั่งซื้อ</h1>
        <p className="text-sm text-muted-foreground">เลขที่คำสั่งซื้อ {order.orderNumber}</p>
      </div>

      {/* Status timeline */}
      {order.status !== "CANCELLED" && (
        <ol className="mb-6 flex justify-between text-center text-xs">
          {STATUS_FLOW.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col items-center gap-1">
              <span className={`flex size-7 items-center justify-center rounded-full ${i <= currentIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i <= currentIndex ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
              </span>
              <span className={i <= currentIndex ? "font-medium" : "text-muted-foreground"}>{STATUS_LABEL[s]}</span>
            </li>
          ))}
        </ol>
      )}

      {/* Payment section */}
      {order.status === "PENDING" && order.payment && (
        <section className="mb-6 rounded-xl border p-6 text-center">
          <h2 className="mb-3 font-semibold">ชำระเงิน {formatTHB(order.total)}</h2>

          {order.payment.method === "PROMPTPAY" && qrDataUrl && (
            <>
              <Image src={qrDataUrl} alt="PromptPay QR" width={240} height={240} className="mx-auto" unoptimized />
              <p className="mt-2 text-sm text-muted-foreground">สแกน QR ด้วยแอปธนาคารเพื่อชำระเงิน</p>
              <p className="text-xs text-muted-foreground">QR หมดอายุใน 30 นาที · ระบบจะยืนยันอัตโนมัติ</p>
            </>
          )}

          {order.payment.method === "BANK_TRANSFER" && (
            <div className="text-left text-sm">
              <p>โอนเงินมาที่:</p>
              <p className="mt-1 font-medium">{process.env.BANK_NAME}</p>
              <p>ชื่อบัญชี: {process.env.BANK_ACCOUNT_NAME}</p>
              <p>เลขบัญชี: {process.env.BANK_ACCOUNT_NUMBER}</p>
              <p className="mt-2 text-muted-foreground">โอนแล้วกรุณาแนบสลิปในหน้านี้ (อัปโหลดผ่าน Cloudinary)</p>
            </div>
          )}

          {order.payment.method === "STRIPE" && (
            <StripePayment orderId={order.id} amount={order.total} />
          )}

          {order.payment.method === "OMISE" && (
            // Omise uses the same pattern: create a charge from an Omise.js token,
            // then confirm via the /api/webhooks/omise handler (already wired).
            <p className="text-sm text-muted-foreground">ชำระผ่าน Omise (บัตร/TrueMoney/Internet Banking)</p>
          )}
        </section>
      )}

      {/* Items */}
      <section className="rounded-xl border">
        <h2 className="border-b p-4 font-semibold">รายการสินค้า</h2>
        <ul className="divide-y">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 p-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" sizes="56px" />}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{it.name}</p>
                <p className="text-muted-foreground">{formatTHB(it.unitPrice)} × {it.quantity}</p>
              </div>
              <span className="text-sm font-medium">{formatTHB(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1 border-t p-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">ยอดสินค้า</dt><dd>{formatTHB(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-primary"><dt>ส่วนลด{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd>-{formatTHB(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted-foreground">ค่าจัดส่ง</dt><dd>{order.shippingFee === 0 ? "ฟรี" : formatTHB(order.shippingFee)}</dd></div>
          <div className="flex justify-between text-xs text-muted-foreground"><dt>รวม VAT 7%</dt><dd>{formatTHB(order.vatAmount)}</dd></div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold"><dt>ยอดรวม</dt><dd className="text-primary">{formatTHB(order.total)}</dd></div>
        </dl>
      </section>

      {/* Shipping address + tracking */}
      <section className="mt-4 rounded-xl border p-4 text-sm">
        <h2 className="mb-2 font-semibold">ที่อยู่จัดส่ง</h2>
        <p>{order.shipName} · {order.shipPhone}</p>
        <p className="text-muted-foreground">
          {order.shipLine1} ต.{order.shipSubdistrict} อ.{order.shipDistrict} จ.{order.shipProvince} {order.shipZipcode}
        </p>
        {order.trackingNumber && order.carrier && (
          <p className="mt-2">
            ติดตามพัสดุ ({CARRIERS[order.carrier].label}):{" "}
            <a href={CARRIERS[order.carrier].track(order.trackingNumber)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {order.trackingNumber}
            </a>
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">สั่งซื้อเมื่อ {formatThaiDate(order.createdAt)}</p>
      </section>
    </div>
  );
}
