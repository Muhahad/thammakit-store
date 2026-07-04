import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import { UserRoleControl } from "@/components/admin/user-role-control";

/**
 * Admin user management: list users with lifetime spend + order count, and
 * promote/demote roles. Spend is summed from paid+ orders only.
 */
export default async function AdminUsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, phone: true, role: true, createdAt: true,
      _count: { select: { orders: true } },
      orders: {
        where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
        select: { total: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ผู้ใช้งาน ({users.length})</h1>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="p-3">ชื่อ / อีเมล</th>
              <th className="p-3">เบอร์โทร</th>
              <th className="p-3 text-right">คำสั่งซื้อ</th>
              <th className="p-3 text-right">ยอดใช้จ่าย</th>
              <th className="p-3">สมัครเมื่อ</th>
              <th className="p-3">บทบาท</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const spend = u.orders.reduce((s, o) => s + o.total, 0);
              return (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-3">
                    <p className="font-medium">{u.name ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">{u.phone ?? "-"}</td>
                  <td className="p-3 text-right">{u._count.orders}</td>
                  <td className="p-3 text-right">{formatTHB(spend)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{formatThaiDate(u.createdAt)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${u.role === "ADMIN" ? "bg-accent/20 text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      {u.role === "ADMIN" ? "แอดมิน" : "ลูกค้า"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <UserRoleControl userId={u.id} role={u.role} isSelf={u.id === session?.user?.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
