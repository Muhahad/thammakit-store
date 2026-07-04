import Stripe from "stripe";

/**
 * Stripe server client. THB is a zero-decimal-aware currency in Stripe but still
 * charged in the smallest unit (satang), which matches how we store money — so
 * we pass `amount` (satang) directly.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

/** Create a PaymentIntent for an order. Returns the client secret for Stripe.js. */
export async function createPaymentIntent(params: {
  amountSatang: number;
  orderId: string;
  orderNumber: string;
}) {
  return stripe.paymentIntents.create({
    amount: params.amountSatang,
    currency: "thb",
    metadata: { orderId: params.orderId, orderNumber: params.orderNumber },
    automatic_payment_methods: { enabled: true },
  });
}
