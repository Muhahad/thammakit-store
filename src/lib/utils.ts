import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { VAT_RATE } from "@/config/site";

/** Merge Tailwind class names, resolving conflicts (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an amount in *satang* as Thai Baht for display.
 * @example formatTHB(19900) => "฿199.00"
 */
export function formatTHB(satang: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(satang / 100);
}

/** Convert baht (number, may have decimals) to integer satang. */
export function bahtToSatang(baht: number): number {
  return Math.round(baht * 100);
}

/**
 * Extract the VAT component from a VAT-inclusive amount (satang).
 * Thai prices are quoted VAT-inclusive, so VAT = total * rate / (1 + rate).
 * @example vatFromInclusive(10700) // => 700 (VAT within ฿107.00)
 */
export function vatFromInclusive(inclusiveSatang: number): number {
  return Math.round((inclusiveSatang * VAT_RATE) / (1 + VAT_RATE));
}

/** Generate a human-friendly order number, e.g. TK-20260704-8F3A. */
export function generateOrderNumber(): string {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TK-${date}-${rand}`;
}

/** URL-safe slug from a name (keeps Thai characters, spaces -> hyphen). */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Format a date in Thai locale (Buddhist era). */
export function formatThaiDate(date: Date | string): string {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
