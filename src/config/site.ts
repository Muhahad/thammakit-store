/** Global, market-wide constants for the Thai storefront. */

export const SITE = {
  name: "ร้านค้าธรรมกิจ",
  nameEn: "Thammakit Store",
  description:
    "ร้านค้าออนไลน์ครบวงจร สินค้าคุณภาพ จัดส่งทั่วไทย ชำระเงินง่ายด้วย PromptPay",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "th_TH",
  currency: "THB",
} as const;

/** Thailand VAT rate. Prices in this store are VAT-inclusive. */
export const VAT_RATE = 0.07;

/** Free-shipping threshold (satang). ฿1,000. */
export const FREE_SHIPPING_THRESHOLD = 100_000;

/** Flat shipping fee when under the free-shipping threshold (satang). ฿50. */
export const FLAT_SHIPPING_FEE = 5_000;

export const SUPPORTED_LOCALES = ["th", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
