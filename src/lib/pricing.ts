import type { Coupon } from "@prisma/client";
import {
  FREE_SHIPPING_THRESHOLD,
  FLAT_SHIPPING_FEE,
} from "@/config/site";
import { vatFromInclusive } from "@/lib/utils";

export interface CartLine {
  productId: string;
  unitPrice: number; // satang, VAT-inclusive
  quantity: number;
}

export interface PricingResult {
  subtotal: number; // sum of lines (satang)
  discount: number; // coupon discount (satang)
  shippingFee: number; // (satang)
  vatAmount: number; // VAT within the (discounted) taxable amount (satang)
  total: number; // amount payable (satang)
}

/**
 * Validate a coupon against the current subtotal and return the discount amount
 * (satang) plus whether it grants free shipping. Returns 0 discount if invalid.
 *
 * All money is VAT-inclusive satang. Callers should surface `error` to the user.
 */
export function computeCouponDiscount(
  coupon: Coupon | null,
  subtotal: number,
): { discount: number; freeShipping: boolean; error?: string } {
  if (!coupon) return { discount: 0, freeShipping: false };

  const now = new Date();
  if (!coupon.isActive) return { discount: 0, freeShipping: false, error: "คูปองถูกปิดใช้งาน" };
  if (coupon.startsAt && coupon.startsAt > now)
    return { discount: 0, freeShipping: false, error: "คูปองยังไม่เริ่มใช้งาน" };
  if (coupon.endsAt && coupon.endsAt < now)
    return { discount: 0, freeShipping: false, error: "คูปองหมดอายุแล้ว" };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return { discount: 0, freeShipping: false, error: "คูปองถูกใช้ครบจำนวนแล้ว" };
  if (subtotal < coupon.minSpend)
    return {
      discount: 0,
      freeShipping: false,
      error: `ต้องซื้อขั้นต่ำ ฿${(coupon.minSpend / 100).toLocaleString()}`,
    };

  if (coupon.type === "FREE_SHIPPING") {
    return { discount: 0, freeShipping: true };
  }

  let discount =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value; // FIXED (satang)

  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal); // never exceed subtotal

  return { discount, freeShipping: false };
}

/**
 * Compute the full order total from cart lines and an optional coupon.
 * Prices are VAT-inclusive, so VAT is *extracted* from the discounted subtotal
 * for the tax-invoice breakdown (it is not added on top).
 */
export function computeOrderTotals(
  lines: CartLine[],
  coupon: Coupon | null = null,
): PricingResult {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  const { discount, freeShipping } = computeCouponDiscount(coupon, subtotal);
  const taxable = subtotal - discount;

  // Free-shipping is judged on the *pre-discount* subtotal, so applying a coupon
  // can never re-introduce a shipping fee (which would silently eat the discount).
  const shippingFee =
    freeShipping || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;

  const vatAmount = vatFromInclusive(taxable);
  const total = taxable + shippingFee;

  return { subtotal, discount, shippingFee, vatAmount, total };
}
