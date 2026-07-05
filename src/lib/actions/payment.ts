"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPaymentIntent } from "@/lib/payments/stripe";

/**
 * Create (or reuse) a Stripe PaymentIntent for an order and return its client
 * secret for Stripe Elements on the browser.
 *
 * Security:
 *  - Order must belong to the signed-in user and still be PENDING.
 *  - The charge amount comes from the DB order total, never the client.
 *  - Reuses the existing PaymentIntent if one was already created (idempotent),
 *    so refreshing the page doesn't spawn duplicate intents.
 */
export async function createStripePaymentIntent(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "กรุณาเข้าสู่ระบบ" };

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { payment: true },
  });
  if (!order) return { error: "ไม่พบคำสั่งซื้อ" };
  if (order.status !== "PENDING") return { error: "คำสั่งซื้อนี้ชำระเงินแล้ว" };
  if (order.payment?.method !== "STRIPE") return { error: "วิธีชำระเงินไม่ถูกต้อง" };

  try {
    const intent = await createPaymentIntent({
      amountSatang: order.total,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

    // Persist the provider reference for reconciliation with the webhook.
    await prisma.payment.update({
      where: { orderId: order.id },
      data: { providerRef: intent.id },
    });

    return { clientSecret: intent.client_secret };
  } catch (err) {
    console.error("Stripe PaymentIntent failed:", err);
    return { error: "ไม่สามารถเชื่อมต่อระบบชำระเงินได้ กรุณาลองใหม่" };
  }
}
