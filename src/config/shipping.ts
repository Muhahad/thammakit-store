import type { ShippingCarrier } from "@prisma/client";

/**
 * Thai shipping carriers with public tracking URLs.
 * `track(no)` returns the customer-facing tracking page for a tracking number.
 */
export const CARRIERS: Record<
  ShippingCarrier,
  { label: string; labelEn: string; track: (no: string) => string }
> = {
  FLASH_EXPRESS: {
    label: "Flash Express",
    labelEn: "Flash Express",
    track: (no) => `https://www.flashexpress.com/fle/tracking?se=${no}`,
  },
  KERRY: {
    label: "Kerry Express",
    labelEn: "Kerry Express",
    track: (no) => `https://th.kerryexpress.com/th/track/?track=${no}`,
  },
  THAILAND_POST: {
    label: "ไปรษณีย์ไทย",
    labelEn: "Thailand Post",
    track: (no) => `https://track.thailandpost.co.th/?trackNumber=${no}`,
  },
  JT_EXPRESS: {
    label: "J&T Express",
    labelEn: "J&T Express",
    track: (no) => `https://www.jtexpress.co.th/index/query/gzquery.html?bill=${no}`,
  },
};

export const CARRIER_OPTIONS = Object.entries(CARRIERS).map(([value, c]) => ({
  value: value as ShippingCarrier,
  label: c.label,
}));
