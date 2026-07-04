import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/queries";
import { ProductCard } from "@/components/shop/product-card";
import { ProductFilters } from "@/components/shop/product-filters";
import { Pagination } from "@/components/shop/pagination";

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด",
  description: "เลือกซื้อสินค้าคุณภาพ ค้นหา กรอง และเรียงลำดับได้ตามต้องการ",
};

// Catalog changes with merchandising; revalidate every 60s (ISR).
export const revalidate = 60;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  min?: string;
  max?: string;
  page?: string;
}>;

/**
 * Product Listing Page. A Server Component that reads filters from the URL
 * (searchParams) so state is shareable/bookmarkable and SEO-friendly — no client
 * fetch. The filter sidebar is a small client island that just rewrites the URL.
 */
export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  // Degrade gracefully if the DB is unreachable at build time (empty result +
  // no categories); the page is dynamic on searchParams so it re-runs per request.
  const [{ items, total, pages }, categories] = await Promise.all([
    getProducts({
      q: sp.q,
      categorySlug: sp.category,
      sort: sp.sort,
      minPrice: sp.min ? Number(sp.min) * 100 : undefined, // baht → satang
      maxPrice: sp.max ? Number(sp.max) * 100 : undefined,
      page,
    }),
    getCategories(),
  ]).catch(() => [{ items: [], total: 0, pages: 0, page: 1 }, []] as [
    Awaited<ReturnType<typeof getProducts>>,
    Awaited<ReturnType<typeof getCategories>>,
  ]);

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">
          {sp.q ? `ผลการค้นหา “${sp.q}”` : "สินค้าทั้งหมด"}
        </h1>
        <p className="text-sm text-muted-foreground">พบ {total.toLocaleString()} รายการ</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <ProductFilters categories={categories} />

        <div>
          {items.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border text-muted-foreground">
              ไม่พบสินค้าที่ตรงกับเงื่อนไข
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={pages} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
