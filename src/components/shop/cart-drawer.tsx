"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatTHB } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Slide-over cart drawer driven by the Zustand store. Accessible: closes on
 * overlay click, traps nothing heavy (single focusable region), labelled controls.
 */
export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, remove, subtotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="ตะกร้าสินค้า" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">ตะกร้าสินค้า ({items.length})</h2>
          <Button variant="ghost" size="icon" aria-label="ปิด" onClick={() => setOpen(false)}>
            <X className="size-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            ตะกร้าว่างเปล่า
          </div>
        ) : (
          <ul className="flex-1 divide-y overflow-y-auto">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3 p-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="line-clamp-2 text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-primary">{formatTHB(item.price)}</span>
                  <div className="mt-auto flex items-center gap-2">
                    <Button variant="outline" size="icon" className="size-7" aria-label="ลดจำนวน"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="size-7" aria-label="เพิ่มจำนวน"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="size-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="ml-auto size-7 text-destructive" aria-label="ลบ"
                      onClick={() => remove(item.productId)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="mb-3 flex justify-between font-semibold">
              <span>ยอดรวม</span>
              <span className="text-primary">{formatTHB(subtotal())}</span>
            </div>
            <Button asChild size="lg" className="w-full" onClick={() => setOpen(false)}>
              <Link href="/checkout">ดำเนินการชำระเงิน</Link>
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
