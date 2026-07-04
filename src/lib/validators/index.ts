import { z } from "zod";
import { thaiPhoneSchema, thaiZipcodeSchema } from "./thai";
import { THAI_PROVINCES } from "@/config/provinces";

// ── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z.string().min(2, "กรุณากรอกชื่อ").max(80),
    email: z.string().email("อีเมลไม่ถูกต้อง"),
    phone: thaiPhoneSchema,
    password: z
      .string()
      .min(8, "รหัสผ่านอย่างน้อย 8 ตัวอักษร")
      .regex(/[A-Za-z]/, "ต้องมีตัวอักษร")
      .regex(/\d/, "ต้องมีตัวเลข"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

// ── Address ──────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  fullName: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล").max(120),
  phone: thaiPhoneSchema,
  line1: z.string().min(3, "กรุณากรอกที่อยู่").max(255),
  subdistrict: z.string().min(1, "กรุณากรอกตำบล/แขวง"),
  district: z.string().min(1, "กรุณากรอกอำเภอ/เขต"),
  province: z.enum(THAI_PROVINCES, { message: "กรุณาเลือกจังหวัด" }),
  zipcode: thaiZipcodeSchema,
  isDefault: z.boolean().optional().default(false),
});

// ── Product (admin) ──────────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  nameEn: z.string().max(200).optional(),
  slug: z.string().min(2),
  description: z.string().min(10, "รายละเอียดอย่างน้อย 10 ตัวอักษร"),
  descriptionEn: z.string().optional(),
  price: z.number().int().positive("ราคาต้องมากกว่า 0"), // satang
  compareAtPrice: z.number().int().positive().optional(),
  sku: z.string().min(1),
  categoryId: z.string().cuid(),
  weightGrams: z.number().int().positive().default(500),
  quantity: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  specs: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
  images: z
    .array(z.object({ url: z.string().url(), publicId: z.string(), alt: z.string().optional() }))
    .default([]),
});

// ── Review ───────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).optional(),
});

// ── Coupon (admin) ───────────────────────────────────────────────────────────

export const couponSchema = z.object({
  code: z.string().min(3).max(30).transform((s) => s.toUpperCase()),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z.number().int().min(0),
  minSpend: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

// ── Checkout ─────────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  addressId: z.string().cuid(),
  carrier: z.enum(["FLASH_EXPRESS", "KERRY", "THAILAND_POST", "JT_EXPRESS"]),
  paymentMethod: z.enum(["PROMPTPAY", "STRIPE", "OMISE", "BANK_TRANSFER"]),
  couponCode: z.string().optional(),
  note: z.string().max(500).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
