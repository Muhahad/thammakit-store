import Stripe from "stripe";

/**
 * Lazily-initialized Stripe server client.
 *
 * We must NOT construct `new Stripe(...)` at module load: Next.js imports route
 * modules during the build's "collect page data" step, which would throw when
 * STRIPE_SECRET_KEY is absent (e.g. a deploy that hasn't set payment keys yet).
 * Instantiating on first use keeps the build independent of runtime secrets.
 */
let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return client;
}

/** Create a PaymentIntent for an order. Returns the client secret for Stripe.js. */
export async function createPaymentIntent(params: {
  amountSatang: number;
  orderId: string;
  orderNumber: string;
}) {
  return stripe().paymentIntents.create({
    amount: params.amountSatang,
    currency: "thb",
    metadata: { orderId: params.orderId, orderNumber: params.orderNumber },
    automatic_payment_methods: { enabled: true },
  });
}
