import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Export orders as CSV (admin only). Streams a downloadable file.
 * Values are quoted and internal quotes escaped to keep the CSV well-formed.
 */
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true, status: true, shipName: true, shipPhone: true,
      shipProvince: true, subtotal: true, discount: true, shippingFee: true,
      total: true, couponCode: true, createdAt: true,
    },
  });

  const header = [
    "OrderNumber", "Status", "Customer", "Phone", "Province",
    "Subtotal(THB)", "Discount(THB)", "Shipping(THB)", "Total(THB)", "Coupon", "CreatedAt",
  ];

  const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = orders.map((o) =>
    [
      o.orderNumber, o.status, o.shipName, o.shipPhone, o.shipProvince,
      (o.subtotal / 100).toFixed(2), (o.discount / 100).toFixed(2),
      (o.shippingFee / 100).toFixed(2), (o.total / 100).toFixed(2),
      o.couponCode, o.createdAt.toISOString(),
    ].map(esc).join(","),
  );

  // Prepend BOM so Excel opens Thai characters correctly.
  const csv = "﻿" + [header.join(","), ...rows].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
    },
  });
}
