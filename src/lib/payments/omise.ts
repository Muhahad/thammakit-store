import Omise from "omise";

/**
 * Omise (Opn Payments) client — popular Thai gateway supporting credit cards,
 * internet banking, TrueMoney Wallet, and its own PromptPay source.
 * Amounts are in satang, matching our storage.
 */
export const omise = Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

/**
 * Create an Omise charge from a tokenized card / source produced on the client.
 * @param token Omise card token or source id from Omise.js.
 */
export async function createOmiseCharge(params: {
  amountSatang: number;
  token: string;
  orderId: string;
}) {
  return omise.charges.create({
    amount: params.amountSatang,
    currency: "thb",
    card: params.token,
    metadata: { orderId: params.orderId },
  });
}
