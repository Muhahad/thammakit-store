import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";

export const metadata: Metadata = { title: "รายการโปรด", robots: { index: false } };

/** Wishlist grid — reuses ProductCard with the shared productCard select shape. */
export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/wishlist");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      product: {
        select: {
          id: true, name: true, slug: true, price: true, compareAtPrice: true,
          ratingAvg: true, ratingCount: true,
          images: { select: { url: true, alt: true }, orderBy: { position: "asc" }, take: 1 },
          inventory: { select: { quantity: true } },
        },
      },
    },
  });

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">รายการโปรด</h1>
      {items.length === 0 ? (
        <div className="rounded-xl border p-10 text-center text-muted-foreground">
          ยังไม่มีสินค้าในรายการโปรด — <Link href="/products" className="text-primary hover:underline">เลือกซื้อสินค้า</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((w) => (
            <ProductCard key={w.product.id} product={w.product} />
          ))}
        </div>
      )}
    </div>
  );
}
