import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/actions/fulfillment";

/**
 * Omise webhook. Omise posts event objects; on a completed & paid charge we look
 * up the order via the charge metadata (set in createOmiseCharge) and fulfill it.
 *
 * Harden in production by verifying the request originates from Omise — restrict
 * by source IP or a shared secret path segment, since Omise does not sign bodies.
 */
export async function POST(req: Request) {
  const event = await req.json().catch(() => null);
  if (!event) return new Response("Bad request", { status: 400 });

  if (event.key === "charge.complete" || event.data?.status === "successful") {
    const charge = event.data;
    const orderId = charge?.metadata?.orderId as string | undefined;

    if (orderId && charge.paid === true) {
      // Guard against spoofed amounts: confirm the charge matches our record.
      const payment = await prisma.payment.findUnique({ where: { orderId } });
      if (payment && charge.amount === payment.amount) {
        await markOrderPaid(orderId, charge.id);
      }
    }
  }

  return new Response("ok", { status: 200 });
}
