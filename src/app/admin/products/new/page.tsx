import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

/** Create-product page. */
export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">เพิ่มสินค้าใหม่</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
