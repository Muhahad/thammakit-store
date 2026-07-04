import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Plus } from "lucide-react";

/** Admin product list with stock, price, and quick actions. */
export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, sku: true, price: true, isActive: true,
      images: { select: { url: true }, take: 1, orderBy: { position: "asc" } },
      inventory: { select: { quantity: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">จัดการสินค้า ({products.length})</h1>
        <Button asChild><Link href="/admin/products/new"><Plus className="size-4" /> เพิ่มสินค้า</Link></Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="p-3">สินค้า</th>
              <th className="p-3">SKU</th>
              <th className="p-3">หมวดหมู่</th>
              <th className="p-3 text-right">ราคา</th>
              <th className="p-3 text-right">คงเหลือ</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                      {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="40px" />}
                    </div>
                    <span className="line-clamp-1 font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.sku}</td>
                <td className="p-3 text-muted-foreground">{p.category.name}</td>
                <td className="p-3 text-right">{formatTHB(p.price)}</td>
                <td className={`p-3 text-right ${(p.inventory?.quantity ?? 0) <= 5 ? "text-destructive" : ""}`}>
                  {p.inventory?.quantity ?? 0}
                </td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {p.isActive ? "เปิดขาย" : "ปิด"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm"><Link href={`/admin/products/${p.id}`}>แก้ไข</Link></Button>
                    <DeleteProductButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
