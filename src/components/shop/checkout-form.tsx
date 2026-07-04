"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Address } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatTHB } from "@/lib/utils";
import {
  FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE, VAT_RATE,
} from "@/config/site";
import { CARRIER_OPTIONS } from "@/config/shipping";
import { createOrder } from "@/lib/actions/checkout";
import { NewAddressForm } from "./new-address-form";

const PAYMENT_METHODS = [
  { value: "PROMPTPAY", label: "PromptPay QR", desc: "สแกนจ่ายผ่านแอปธนาคาร" },
  { value: "STRIPE", label: "บัตรเครดิต/เดบิต", desc: "Visa · Mastercard (Stripe)" },
  { value: "OMISE", label: "Omise", desc: "บัตร · TrueMoney · Internet Banking" },
  { value: "BANK_TRANSFER", label: "โอนผ่านธนาคาร", desc: "แนบสลิปหลังโอน" },
] as const;

const STEPS = ["ที่อยู่จัดส่ง", "การจัดส่ง", "ชำระเงิน", "ตรวจสอบ"];

/**
 * Multi-step checkout. All money math here is for *display only*; the server
 * (createOrder) recomputes authoritatively from DB prices before charging.
 */
export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();

  const [addressId, setAddressId] = useState(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "");
  const [carrier, setCarrier] = useState<string>(CARRIER_OPTIONS[0]!.value);
  const [paymentMethod, setPaymentMethod] = useState<string>("PROMPTPAY");
  const [couponCode, setCouponCode] = useState("");
  const [note, setNote] = useState("");
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);

  // Client-side estimate of the totals (server is source of truth).
  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? FLAT_SHIPPING_FEE : 0;
    const vatAmount = Math.round((subtotal * VAT_RATE) / (1 + VAT_RATE));
    return { subtotal, shippingFee, vatAmount, total: subtotal + shippingFee };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center text-muted-foreground">
        ตะกร้าว่างเปล่า — <a href="/products" className="text-primary hover:underline">เลือกซื้อสินค้า</a>
      </div>
    );
  }

  function placeOrder() {
    if (!addressId) {
      toast.error("กรุณาเลือกที่อยู่จัดส่ง");
      setStep(0);
      return;
    }
    startTransition(async () => {
      const res = await createOrder(
        { addressId, carrier, paymentMethod, couponCode: couponCode || undefined, note: note || undefined },
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      );
      if (res.error) {
        toast.error(res.error);
        return;
      }
      clear();
      toast.success("สร้างคำสั่งซื้อสำเร็จ");
      router.push(`/orders/${res.orderId}`);
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Stepper */}
        <ol className="flex items-center gap-2 text-sm">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={`flex size-6 items-center justify-center rounded-full text-xs ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i + 1}
              </span>
              <span className={i === step ? "font-semibold" : "text-muted-foreground"}>{s}</span>
              {i < STEPS.length - 1 && <span className="text-muted-foreground">›</span>}
            </li>
          ))}
        </ol>

        {/* Step 0 — Address */}
        {step === 0 && (
          <div className="space-y-3">
            {addresses.map((a) => (
              <label key={a.id} className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${addressId === a.id ? "border-primary ring-1 ring-primary" : ""}`}>
                <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1" />
                <div className="text-sm">
                  <p className="font-medium">{a.fullName} · {a.phone}</p>
                  <p className="text-muted-foreground">{a.line1} ต.{a.subdistrict} อ.{a.district} จ.{a.province} {a.zipcode}</p>
                </div>
              </label>
            ))}
            {showNewAddress ? (
              <NewAddressForm onCreated={() => { setShowNewAddress(false); router.refresh(); }} />
            ) : (
              <Button variant="outline" onClick={() => setShowNewAddress(true)}>+ เพิ่มที่อยู่ใหม่</Button>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!addressId}>ถัดไป</Button>
            </div>
          </div>
        )}

        {/* Step 1 — Carrier */}
        {step === 1 && (
          <div className="space-y-3">
            {CARRIER_OPTIONS.map((c) => (
              <label key={c.value} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${carrier === c.value ? "border-primary ring-1 ring-primary" : ""}`}>
                <input type="radio" name="carrier" checked={carrier === c.value} onChange={() => setCarrier(c.value)} />
                <span className="text-sm font-medium">{c.label}</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {totals.shippingFee === 0 ? "ส่งฟรี" : formatTHB(FLAT_SHIPPING_FEE)}
                </span>
              </label>
            ))}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>ย้อนกลับ</Button>
              <Button onClick={() => setStep(2)}>ถัดไป</Button>
            </div>
          </div>
        )}

        {/* Step 2 — Payment */}
        {step === 2 && (
          <div className="space-y-3">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.value} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${paymentMethod === m.value ? "border-primary ring-1 ring-primary" : ""}`}>
                <input type="radio" name="payment" checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </label>
            ))}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>ย้อนกลับ</Button>
              <Button onClick={() => setStep(3)}>ถัดไป</Button>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-4">
            <ul className="divide-y rounded-lg border">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between p-3 text-sm">
                  <span>{i.name} × {i.quantity}</span>
                  <span>{formatTHB(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="หมายเหตุถึงร้านค้า (ไม่บังคับ)"
              className="w-full rounded-md border bg-background p-3 text-sm" rows={2} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>ย้อนกลับ</Button>
              <Button onClick={placeOrder} disabled={pending} size="lg">
                {pending ? "กำลังสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order summary sidebar */}
      <aside className="h-fit space-y-3 rounded-xl border p-4">
        <h2 className="font-semibold">สรุปคำสั่งซื้อ</h2>
        <div className="flex gap-2">
          <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="โค้ดส่วนลด"
            className="h-9 flex-1 rounded-md border bg-background px-2 text-sm" aria-label="โค้ดส่วนลด" />
        </div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">ยอดสินค้า</dt><dd>{formatTHB(totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">ค่าจัดส่ง</dt><dd>{totals.shippingFee === 0 ? "ฟรี" : formatTHB(totals.shippingFee)}</dd></div>
          <div className="flex justify-between text-xs text-muted-foreground"><dt>รวม VAT 7%</dt><dd>{formatTHB(totals.vatAmount)}</dd></div>
          <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
            <dt>ยอดชำระ</dt><dd className="text-primary">{formatTHB(totals.total)}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">ยอดสุดท้ายจะคำนวณอีกครั้งฝั่งเซิร์ฟเวอร์รวมส่วนลด</p>
      </aside>
    </div>
  );
}
