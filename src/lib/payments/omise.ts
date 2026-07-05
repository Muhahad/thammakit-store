import Omise from "omise";

/**
 * Lazily-initialized Omise (Opn Payments) client — popular Thai gateway for
 * cards, internet banking, TrueMoney Wallet, and PromptPay.
 *
 * Same rationale as the Stripe client: constructing at module load would couple
 * the build to runtime secrets, so we defer creation until first use. Amounts
 * are in satang, matching our storage.
 */
let client: ReturnType<typeof Omise> | null = null;

export function omise(): ReturnType<typeof Omise> {
  if (!client) {
    client = Omise({
      publicKey: process.env.OMISE_PUBLIC_KEY!,
      secretKey: process.env.OMISE_SECRET_KEY!,
    });
  }
  return client;
}

/**
 * Create an Omise charge from a tokenized card / source produced on the client.
 * @param token Omise card token or source id from Omise.js.
 */
export async function createOmiseCharge(params: {
  amountSatang: number;
  token: string;
  orderId: string;
}) {
  return omise().charges.create({
    amount: params.amountSatang,
    currency: "thb",
    card: params.token,
    metadata: { orderId: params.orderId },
  });
}
