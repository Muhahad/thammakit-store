import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserAddresses } from "@/lib/actions/address";
import { SignOutButton } from "@/components/shop/sign-out-button";
import { Package, Heart, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "บัญชีของฉัน", robots: { index: false } };

/** Account hub: profile summary, saved addresses, and quick links. */
export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");
  const addresses = await getUserAddresses();

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">สวัสดี, {session.user.name ?? "ลูกค้า"}</h1>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/orders", label: "คำสั่งซื้อ", icon: Package },
          { href: "/wishlist", label: "รายการโปรด", icon: Heart },
          { href: "/account/addresses", label: "ที่อยู่", icon: MapPin },
        ].map((l) => (
          <Link key={l.label} href={l.href} className="flex items-center gap-3 rounded-xl border p-4 hover:border-primary">
            <l.icon className="size-5 text-primary" /> <span className="text-sm font-medium">{l.label}</span>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">ที่อยู่ของฉัน</h2>
      <ul className="space-y-2">
        {addresses.map((a) => (
          <li key={a.id} className="rounded-lg border p-4 text-sm">
            <p className="font-medium">
              {a.fullName} · {a.phone}
              {a.isDefault && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">ที่อยู่หลัก</span>}
            </p>
            <p className="text-muted-foreground">{a.line1} ต.{a.subdistrict} อ.{a.district} จ.{a.province} {a.zipcode}</p>
          </li>
        ))}
        {addresses.length === 0 && <li className="text-sm text-muted-foreground">ยังไม่มีที่อยู่ — เพิ่มได้ในขั้นตอนชำระเงิน</li>}
      </ul>
    </div>
  );
}
