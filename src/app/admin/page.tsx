import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { TrendingUp, ShoppingCart, Package, AlertTriangle } from "lucide-react";

/** KPI card. */
function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-5 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

/**
 * Admin dashboard — sales KPIs and recent orders.
 * All aggregates run in parallel; only PAID+ orders count toward revenue.
 */
export default async function AdminDashboard() {
  const paidStatuses = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

  const [revenue, orderCount, productCount, lowStock, recentOrders] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: [...paidStatuses] } } }),
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, orderNumber: true, total: true, status: true, shipName: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ภาพรวมร้านค้า</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="ยอดขายรวม" value={formatTHB(revenue._sum.total ?? 0)} icon={TrendingUp} />
        <Stat label="คำสั่งซื้อทั้งหมด" value={orderCount.toLocaleString()} icon={ShoppingCart} />
        <Stat label="สินค้าที่ขาย" value={productCount.toLocaleString()} icon={Package} />
        <Stat label="สินค้าใกล้หมด" value={lowStock.toLocaleString()} icon={AlertTriangle} />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">คำสั่งซื้อล่าสุด</h2>
          <a href="/api/admin/orders/export" className="text-sm text-primary hover:underline">
            ส่งออก CSV
          </a>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="p-3">เลขที่</th>
              <th className="p-3">ลูกค้า</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{o.orderNumber}</td>
                <td className="p-3">{o.shipName}</td>
                <td className="p-3"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{o.status}</span></td>
                <td className="p-3 text-right">{formatTHB(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
