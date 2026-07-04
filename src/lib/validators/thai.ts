import { z } from "zod";

/**
 * Thai mobile number validation.
 * Accepts local format 0[6|8|9]XXXXXXXX (10 digits) with optional spaces/dashes,
 * and the +66 international prefix. Normalizes to local 0XXXXXXXXX.
 */
const THAI_MOBILE_REGEX = /^(?:\+?66|0)(6|8|9)\d{8}$/;

export function normalizeThaiPhone(input: string): string {
  const digits = input.replace(/[\s-]/g, "");
  // Convert +66 / 66 prefix to leading 0
  if (digits.startsWith("+66")) return "0" + digits.slice(3);
  if (digits.startsWith("66") && digits.length === 11) return "0" + digits.slice(2);
  return digits;
}

export function isValidThaiMobile(input: string): boolean {
  return THAI_MOBILE_REGEX.test(input.replace(/[\s-]/g, ""));
}

/** Zod schema for a Thai mobile field (stored normalized as 0XXXXXXXXX). */
export const thaiPhoneSchema = z
  .string()
  .refine(isValidThaiMobile, {
    message: "กรุณากรอกเบอร์มือถือให้ถูกต้อง (เช่น 081-234-5678)",
  })
  .transform(normalizeThaiPhone);

/** Thai postal code: exactly 5 digits. */
export const thaiZipcodeSchema = z
  .string()
  .regex(/^\d{5}$/, { message: "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก" });

/**
 * Validate a Thai National ID / Tax ID (13 digits) using the official
 * checksum. Used for PromptPay merchant IDs and tax invoices.
 */
export function isValidThaiNationalId(id: string): boolean {
  const digits = id.replace(/\D/g, "");
  if (!/^\d{13}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(digits[i]) * (13 - i);
  const check = (11 - (sum % 11)) % 10;
  return check === Number(digits[12]);
}
