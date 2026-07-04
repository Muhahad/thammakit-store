import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard, Package, ShoppingCart, Ticket, Users, LogOut,
} from "lucide-react";
import { SITE } from "@/config/site";

const NAV = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/admin/products", label: "สินค้า", icon: Package },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingCart },
  { href: "/admin/coupons", label: "คูปองส่วนลด", icon: Ticket },
  { href: "/admin/users", label: "ผู้ใช้งาน", icon: Users },
];

/**
 * Admin shell with sidebar. Defense-in-depth: middleware already blocks
 * non-admins, but we re-check the session here (server-side) so this layout is
 * safe even if middleware config changes.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?callbackUrl=/admin");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/30 p-4 md:flex">
        <Link href="/admin" className="mb-6 text-lg font-bold text-primary">
          {SITE.name} · Admin
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="size-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="size-4" /> กลับหน้าร้าน
        </Link>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
