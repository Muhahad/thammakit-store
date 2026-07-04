import { describe, it, expect } from "vitest";
import {
  isValidThaiMobile,
  normalizeThaiPhone,
  isValidThaiNationalId,
} from "@/lib/validators/thai";
import { vatFromInclusive, formatTHB, bahtToSatang, slugify } from "@/lib/utils";
import { generatePromptPayPayload } from "@/lib/payments/promptpay";
import { computeOrderTotals } from "@/lib/pricing";
import type { Coupon } from "@prisma/client";

describe("Thai phone validation", () => {
  it("accepts valid local mobiles", () => {
    expect(isValidThaiMobile("0812345678")).toBe(true);
    expect(isValidThaiMobile("081-234-5678")).toBe(true);
    expect(isValidThaiMobile("+66812345678")).toBe(true);
  });
  it("rejects invalid numbers", () => {
    expect(isValidThaiMobile("021234567")).toBe(false); // landline prefix
    expect(isValidThaiMobile("08123456")).toBe(false); // too short
  });
  it("normalizes +66 to leading 0", () => {
    expect(normalizeThaiPhone("+66812345678")).toBe("0812345678");
    expect(normalizeThaiPhone("081-234-5678")).toBe("0812345678");
  });
});

describe("Thai National ID checksum", () => {
  it("validates a correct 13-digit id (check digit 8)", () => {
    expect(isValidThaiNationalId("1101700230708")).toBe(true);
  });
  it("rejects a wrong checksum", () => {
    expect(isValidThaiNationalId("1101700230705")).toBe(false);
  });
});

describe("Money helpers", () => {
  it("extracts 7% VAT from a VAT-inclusive amount", () => {
    // ฿107.00 inclusive => ฿7.00 VAT
    expect(vatFromInclusive(10700)).toBe(700);
  });
  it("formats satang as THB", () => {
    expect(formatTHB(19900)).toContain("199.00");
  });
  it("converts baht to satang", () => {
    expect(bahtToSatang(199.99)).toBe(19999);
  });
});

describe("slugify (Thai combining marks)", () => {
  it("preserves Thai vowels/tone marks instead of stripping them", () => {
    // Regression: combining marks (\p{M}) were treated as separators, mangling
    // "กันน้ำ" into "ก-นน-ำ" and breaking product URLs.
    expect(slugify("ลำโพงพกพากันน้ำ")).toBe("ลำโพงพกพากันน้ำ");
    expect(slugify("เสื้อยืดคอตตอนพรีเมียม")).toBe("เสื้อยืดคอตตอนพรีเมียม");
  });
  it("turns spaces/symbols into single hyphens and trims them", () => {
    expect(slugify("Hello  World!")).toBe("hello-world");
    expect(slugify("หูฟัง Bluetooth 5.3")).toBe("หูฟัง-bluetooth-5-3");
  });
});

describe("PromptPay payload", () => {
  it("produces a payload with correct EMVCo header + THB currency + CRC", () => {
    const payload = generatePromptPayPayload("0812345678", 100);
    expect(payload.startsWith("000201")).toBe(true); // format indicator
    expect(payload).toContain("5303764"); // currency THB (764)
    expect(payload).toContain("5406100.00"); // amount 100.00
    expect(payload).toMatch(/6304[0-9A-F]{4}$/); // CRC tag + 4 hex
  });
  it("is static (poi=11) when no amount is given", () => {
    expect(generatePromptPayPayload("0812345678")).toContain("010211");
  });
});

describe("Order pricing", () => {
  const lines = [{ productId: "p1", unitPrice: 50000, quantity: 2 }]; // ฿1,000

  it("applies free shipping over the ฿1,000 threshold", () => {
    const r = computeOrderTotals(lines);
    expect(r.subtotal).toBe(100000);
    expect(r.shippingFee).toBe(0);
    expect(r.total).toBe(100000);
  });

  it("applies a percentage coupon with a max-discount cap", () => {
    const coupon = {
      type: "PERCENTAGE", value: 10, minSpend: 0, maxDiscount: 5000,
      isActive: true, startsAt: null, endsAt: null, usageLimit: null, usedCount: 0,
    } as unknown as Coupon;
    const r = computeOrderTotals(lines, coupon);
    // 10% of ฿1,000 = ฿100, capped at ฿50
    expect(r.discount).toBe(5000);
    expect(r.total).toBe(95000);
  });
});
