"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/payments/stripe-client";
import { createStripePaymentIntent } from "@/lib/actions/payment";
import { formatTHB } from "@/lib/utils";
import { SITE } from "@/config/site";

/** Inner form — must be rendered inside <Elements> to access Stripe hooks. */
function CheckoutFields({ amount, orderId }: { amount: number; orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);

    // Redirects to return_url on success; the Stripe webhook marks the order paid.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${SITE.url}/orders/${orderId}` },
    });

    // Only reached if confirmation fails immediately (e.g. validation / card error).
    if (error) {
      toast.error(error.message ?? "ชำระเงินไม่สำเร็จ");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      <PaymentElement />
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || submitting}>
        {submitting ? "กำลังดำเนินการ..." : `ชำระเงิน ${formatTHB(amount)}`}
      </Button>
    </form>
  );
}

/**
 * Stripe card payment for an order. Fetches a PaymentIntent client secret from
 * the server, then mounts Stripe Elements. Amount/orderId are display-only; the
 * server sets the real charge amount from the DB.
 */
export function StripePayment({ orderId, amount }: { orderId: string; amount: number }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createStripePaymentIntent(orderId).then((res) => {
      if (res.error) setError(res.error);
      else setClientSecret(res.clientSecret ?? null);
    });
  }, [orderId]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!clientSecret) return <p className="text-sm text-muted-foreground">กำลังเตรียมการชำระเงิน...</p>;

  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: { theme: "stripe", variables: { colorPrimary: "#178a5a" } },
      }}
    >
      <CheckoutFields amount={amount} orderId={orderId} />
    </Elements>
  );
}
