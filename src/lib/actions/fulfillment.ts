import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/mail";

/**
 * Mark an order paid and fulfill inventory — called by every payment webhook
 * (Stripe/Omise) and by admin bank-transfer approval.
 *
 * Idempotent: if the payment is already PAID it returns early, so duplicate
 * webhook deliveries don't double-decrement stock or re-send emails.
 *
 * On success it converts each line's *reservation* into a real stock decrement
 * (quantity -= qty, reserved -= qty) and bumps the product's soldCount.
 */
export async function markOrderPaid(orderId: string, providerRef?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true, user: { select: { email: true } } },
  });
  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.payment?.status === "PAID") return; // already fulfilled

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId },
      data: { status: "PAID", paidAt: new Date(), providerRef },
    });
    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });

    for (const item of order.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: { decrement: item.quantity },
          reserved: { decrement: item.quantity },
        },
      });
      await tx.product.update({
        where: { id: item.productId },
        data: { soldCount: { increment: item.quantity } },
      });
    }
  });

  // Best-effort email (don't fail the webhook if SMTP hiccups).
  if (order.user?.email) {
    await sendOrderConfirmation(order.user.email, {
      orderNumber: order.orderNumber,
      total: order.total,
    }).catch(() => {});
  }
}
