import { prisma } from "@/lib/prisma";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import { OrderStatusControl } from "@/components/admin/order-status-control";

/** Admin order list with inline status + tracking controls. */
export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, orderNumber: true, status: true, total: true, shipName: true,
      shipProvince: true, carrier: true, trackingNumber: true, createdAt: true,
      payment: { select: { method: true, status: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">คำสั่งซื้อ ({orders.length})</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="text-sm">
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-muted-foreground">{o.shipName} · {o.shipProvince}</p>
                <p className="text-xs text-muted-foreground">{formatThaiDate(o.createdAt)}</p>
                <p className="mt-1 text-xs">
                  ชำระ: {o.payment?.method ?? "-"} ·{" "}
                  <span className={o.payment?.status === "PAID" ? "text-primary" : "text-muted-foreground"}>
                    {o.payment?.status ?? "PENDING"}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">{formatTHB(o.total)}</p>
              </div>
            </div>
            <div className="mt-3 border-t pt-3">
              <OrderStatusControl
                orderId={o.id}
                status={o.status}
                carrier={o.carrier}
                trackingNumber={o.trackingNumber}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
