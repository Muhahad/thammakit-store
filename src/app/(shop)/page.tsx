import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getNewArrivals, getBestSellers, getCategories } from "@/lib/queries";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/shop/hero-banner";
import { Testimonials } from "@/components/shop/testimonials";

// Revalidate the homepage every 5 minutes (ISR) — fresh merchandising without
// rebuilding on every request.
export const revalidate = 300;

/** A titled grid of products used for Featured / New / Best-seller sections. */
async function Section({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Awaited<ReturnType<typeof getFeaturedProducts>>;
}) {
  if (products.length === 0) return null;
  return (
    <section className="container py-10">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button asChild variant="link"><Link href={href}>ดูทั้งหมด →</Link></Button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  // Fetch all homepage data in parallel (Server Component — no client waterfall).
  const [featured, newArrivals, bestSellers, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getBestSellers(),
    getCategories(),
  ]);

  return (
    <>
      <HeroBanner />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container py-10">
          <h2 className="mb-6 text-2xl font-bold">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors hover:border-primary"
              >
                <div className="relative size-16 overflow-hidden rounded-full bg-muted">
                  {c.image && <Image src={c.image} alt={c.name} fill className="object-cover" sizes="64px" />}
                </div>
                <span className="text-center text-sm font-medium group-hover:text-primary">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Section title="สินค้าแนะนำ" href="/products?featured=1" products={featured} />
      <Section title="สินค้ามาใหม่" href="/products?sort=newest" products={newArrivals} />
      <Section title="สินค้าขายดี" href="/products?sort=popular" products={bestSellers} />

      <Testimonials />
    </>
  );
}
