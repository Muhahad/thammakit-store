import Link from "next/link";
import { SITE } from "@/config/site";
import { NewsletterForm } from "./newsletter-form";

/** Storefront footer: link columns, newsletter signup, payment/shipping notes. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-primary">{SITE.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{SITE.description}</p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">ช้อปปิ้ง</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products" className="hover:text-primary">สินค้าทั้งหมด</Link></li>
            <li><Link href="/products?sort=popular" className="hover:text-primary">สินค้าขายดี</Link></li>
            <li><Link href="/products?sort=newest" className="hover:text-primary">สินค้าใหม่</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">ช่วยเหลือ</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/orders" className="hover:text-primary">ติดตามคำสั่งซื้อ</Link></li>
            <li><Link href="/shipping" className="hover:text-primary">การจัดส่ง</Link></li>
            <li><Link href="/returns" className="hover:text-primary">การคืนสินค้า</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">รับข่าวสารและโปรโมชั่น</h4>
          <NewsletterForm />
          <p className="mt-4 text-xs text-muted-foreground">
            ชำระเงินด้วย PromptPay · บัตรเครดิต · โอนผ่านธนาคาร
          </p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {year} {SITE.name} · ราคารวม VAT 7% แล้ว · จัดส่งทั่วประเทศไทย
      </div>
    </footer>
  );
}
