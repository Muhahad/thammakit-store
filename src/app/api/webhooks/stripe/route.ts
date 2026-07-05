import { stripe } from "@/lib/payments/stripe";
import { markOrderPaid } from "@/lib/actions/fulfillment";
import type Stripe from "stripe";

/**
 * Stripe webhook. Verifies the signature (rejects forged requests), then on a
 * successful PaymentIntent marks the corresponding order paid.
 *
 * IMPORTANT: reads the raw body (req.text()) — Stripe signature verification
 * requires the exact bytes, so we must not let a JSON parser touch it first.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, {
      status: 400,
    });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata.orderId;
    if (orderId) await markOrderPaid(orderId, intent.id);
  }

  return new Response("ok", { status: 200 });
}
