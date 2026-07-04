/**
 * PromptPay QR generation (EMVCo QR Code standard, Bank of Thailand spec).
 *
 * Builds the QR *payload string* which is then rendered to an image with the
 * `qrcode` package. Supports both mobile-number and National-ID/Tax-ID merchants,
 * and dynamic amounts (so the payer can't change the total).
 *
 * References the same TLV structure used by Thai banking apps; verified against
 * dtinth/promptpay-qr. No external dependency — pure, testable functions.
 */
import QRCode from "qrcode";

/** Encode one EMVCo TLV field: 2-digit id + 2-digit length + value. */
function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

/**
 * Normalize the merchant target to the 13-char PromptPay proxy value.
 * - 13-digit input => National ID / Tax ID (used with sub-tag 02).
 * - otherwise => mobile: leading 0 replaced with 66, left-padded to 13 (sub-tag 01).
 */
function formatTarget(id: string): { value: string; subTag: string } {
  const digits = id.replace(/\D/g, "");
  if (digits.length >= 13) {
    return { value: digits.slice(0, 13), subTag: "02" };
  }
  const value = ("0000000000000" + digits.replace(/^0/, "66")).slice(-13);
  return { value, subTag: "01" };
}

/** CRC-16/CCITT-FALSE checksum (poly 0x1021, init 0xFFFF) — EMVCo tag 63. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Build a PromptPay EMVCo payload string.
 * @param merchantId  Mobile number (0XXXXXXXXX) or National/Tax ID (13 digits).
 * @param amountBaht  Optional amount in Baht; when provided the QR is "dynamic".
 */
export function generatePromptPayPayload(
  merchantId: string,
  amountBaht?: number,
): string {
  const { value, subTag } = formatTarget(merchantId);

  const merchantAccount = tlv(
    "29",
    tlv("00", "A000000677010111") + tlv(subTag, value),
  );

  let payload =
    tlv("00", "01") + // payload format indicator
    tlv("01", amountBaht != null ? "12" : "11") + // dynamic vs static
    merchantAccount +
    tlv("53", "764") + // currency THB
    (amountBaht != null ? tlv("54", amountBaht.toFixed(2)) : "") +
    tlv("58", "TH"); // country

  payload += "6304"; // CRC tag + length, checksum appended below
  return payload + crc16(payload);
}

/**
 * Generate a PromptPay QR as a data URL (PNG) for an order.
 * @param satang amount in satang; converted to Baht for the payload.
 */
export async function generatePromptPayQr(
  merchantId: string,
  satang: number,
): Promise<{ payload: string; dataUrl: string }> {
  const payload = generatePromptPayPayload(merchantId, satang / 100);
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
  return { payload, dataUrl };
}
