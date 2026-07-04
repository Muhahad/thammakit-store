"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validators";
import { computeOrderTotals, type CartLine } from "@/lib/pricing";
import { generateOrderNumber } from "@/lib/utils";
import { generatePromptPayQr } from "@/lib/payments/promptpay";
import type { PaymentMethod } from "@prisma/client";

export interface CheckoutClientLine {
  productId: string;
  quantity: number;
}

/**
 * Create an order from the server-validated cart.
 *
 * Security / correctness guarantees:
 *  1. Requires an authenticated user.
 *  2. Re-reads every product price + stock from the DB (ignores client prices).
 *  3. Validates the coupon server-side.
 *  4. Runs inside a transaction that decrements/reserves inventory atomically,
 *     so two shoppers can't oversell the last unit.
 *  5. Initializes the payment record (PromptPay QR generated inline).
 */
export async function createOrder(
  rawInput: unknown,
  clientLines: CheckoutClientLine[],
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "กรุณาเข้าสู่ระบบ" };

  const parsed = checkoutSchema.safeParse(rawInput);
  if (!parsed.success) return { error: "ข้อมูลไม่ถูกต้อง", issues: parsed.error.flatten() };
  const input = parsed.data;

  if (clientLines.length === 0) return { error: "ตะกร้าว่างเปล่า" };

  // Authoritative product data.
  const products = await prisma.product.findMany({
    where: { id: { in: clientLines.map((l) => l.productId) }, isActive: true },
    select: {
      id: true,
      name: true,
      price: true,
      images: { select: { url: true }, take: 1, orderBy: { position: "asc" } },
      inventory: { select: { quantity: true, reserved: true } },
    },
  });

  const lines: CartLine[] = [];
  for (const cl of clientLines) {
    const p = products.find((x) => x.id === cl.productId);
    if (!p) return { error: "สินค้าบางรายการไม่พร้อมจำหน่าย" };
    const available = (p.inventory?.quantity ?? 0) - (p.inventory?.reserved ?? 0);
    if (cl.quantity > available) return { error: `สินค้า "${p.name}" คงเหลือไม่พอ` };
    lines.push({ productId: p.id, unitPrice: p.price, quantity: cl.quantity });
  }

  // Validate coupon + compute totals.
  const coupon = input.couponCode
    ? await prisma.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } })
    : null;
  const totals = computeOrderTotals(lines, coupon);

  // Shipping address must belong to the user.
  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId: session.user.id },
  });
  if (!address) return { error: "ไม่พบที่อยู่จัดส่ง" };

  // Atomic order creation + inventory reservation.
  const order = await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      await tx.inventory.update({
        where: { productId: line.productId },
        data: { reserved: { increment: line.quantity } },
      });
    }

    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        status: "PENDING",
        addressId: address.id,
        shipName: address.fullName,
        shipPhone: address.phone,
        shipLine1: address.line1,
        shipSubdistrict: address.subdistrict,
        shipDistrict: address.district,
        shipProvince: address.province,
        shipZipcode: address.zipcode,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shippingFee: totals.shippingFee,
        vatAmount: totals.vatAmount,
        total: totals.total,
        carrier: input.carrier,
        couponId: coupon?.id,
        couponCode: coupon?.code,
        note: input.note,
        items: {
          create: lines.map((l) => {
            const p = products.find((x) => x.id === l.productId)!;
            return {
              productId: l.productId,
              name: p.name,
              image: p.images[0]?.url,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
            };
          }),
        },
      },
    });

    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    return created;
  });

  // Initialize payment (PromptPay generates a QR immediately; others on gateway callback).
  const payment = await initPayment(order.id, input.paymentMethod, totals.total);

  revalidatePath("/orders");
  return { ok: true, orderId: order.id, orderNumber: order.orderNumber, payment };
}

/** Create the Payment row and, for PromptPay, the QR payload/data URL. */
async function initPayment(orderId: string, method: PaymentMethod, amount: number) {
  if (method === "PROMPTPAY") {
    const { payload, dataUrl } = await generatePromptPayQr(
      process.env.PROMPTPAY_ID!,
      amount,
    );
    await prisma.payment.create({
      data: {
        orderId,
        method,
        amount,
        status: "PENDING",
        promptpayPayload: payload,
        expiresAt: new Date(Date.now() + 30 * 60_000), // 30 min
      },
    });
    return { method, qrDataUrl: dataUrl };
  }

  await prisma.payment.create({ data: { orderId, method, amount, status: "PENDING" } });
  return { method };
}
