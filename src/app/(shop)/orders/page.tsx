import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTHB, formatThaiDate } from "@/lib/utils";

export const metadata: Metadata = { title: "ประวัติการสั่งซื้อ", robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "รอชำระเงิน", PAID: "ชำระแล้ว", PROCESSING: "กำลังเตรียม",
  SHIPPED: "จัดส่งแล้ว", DELIVERED: "สำเร็จ", CANCELLED: "ยกเลิก", REFUNDED: "คืนเงิน",
};

/** Customer order history. */
export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, _count: { select: { items: true } } },
  });

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="mb-6 text-2xl font-bold">ประวัติการสั่งซื้อ</h1>
      {orders.length === 0 ? (
        <div className="rounded-xl border p-10 text-center text-muted-foreground">
          ยังไม่มีคำสั่งซื้อ — <Link href="/products" className="text-primary hover:underline">เริ่มช้อปปิ้ง</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="flex items-center justify-between rounded-xl border p-4 hover:border-primary">
                <div className="text-sm">
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-muted-foreground">{o._count.items} รายการ · {formatThaiDate(o.createdAt)}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-primary">{formatTHB(o.total)}</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{STATUS_LABEL[o.status]}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
