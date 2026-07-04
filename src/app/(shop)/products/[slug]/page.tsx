import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import { productJsonLd } from "@/lib/seo";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductCard } from "@/components/shop/product-card";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { Star, Truck, ShieldCheck } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Per-product SEO metadata (title, description, Open Graph, Twitter). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "ไม่พบสินค้า" };

  const image = product.images[0]?.url;
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const stock = (product.inventory?.quantity ?? 0) - (product.inventory?.reserved ?? 0);
  const inStock = stock > 0;
  const related = await getRelatedProducts(product.categoryId, product.id);
  const specs = (product.specs as { label: string; value: string }[] | null) ?? [];

  const jsonLd = productJsonLd({
    name: product.name,
    description: product.description,
    slug: product.slug,
    price: product.price,
    images: product.images,
    sku: product.sku,
    ratingAvg: product.ratingAvg,
    ratingCount: product.ratingCount,
    inStock,
  });

  return (
    <div className="container py-8">
      {/* Structured data for rich search results */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="size-4 fill-accent text-accent" />
            <span>{product.ratingAvg.toFixed(1)}</span>
            <span>· {product.ratingCount} รีวิว</span>
            <span>· ขายแล้ว {product.soldCount} ชิ้น</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatTHB(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatTHB(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <p className={`mt-2 text-sm font-medium ${inStock ? "text-primary" : "text-destructive"}`}>
            {inStock ? `มีสินค้า (คงเหลือ ${stock} ชิ้น)` : "สินค้าหมด"}
          </p>

          <div className="mt-6 flex gap-3">
            <div className="flex-1"><AddToCartButton productId={product.id} disabled={!inStock} full /></div>
            <WishlistButton productId={product.id} />
          </div>

          {/* Shipping / guarantee info */}
          <div className="mt-6 space-y-2 rounded-lg border p-4 text-sm">
            <p className="flex items-center gap-2"><Truck className="size-4 text-primary" /> จัดส่งทั่วไทย · ส่งฟรีเมื่อซื้อครบ ฿1,000</p>
            <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> รับประกันสินค้าของแท้ · ราคารวม VAT 7%</p>
          </div>
        </div>
      </div>

      {/* Description + specifications */}
      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-semibold">รายละเอียดสินค้า</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        </div>
        {specs.length > 0 && (
          <div>
            <h2 className="mb-3 text-xl font-semibold">ข้อมูลจำเพาะ</h2>
            <dl className="divide-y rounded-lg border">
              {specs.map((s) => (
                <div key={s.label} className="flex justify-between p-3 text-sm">
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">รีวิวจากลูกค้า ({product.reviews.length})</h2>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวสินค้านี้</p>
        ) : (
          <ul className="space-y-4">
            {product.reviews.map((r) => (
              <li key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.user.name ?? "ลูกค้า"}</span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={i < r.rating ? "size-3.5 fill-accent text-accent" : "size-3.5 text-muted"} />
                    ))}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">{formatThaiDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="mt-1 text-sm font-medium">{r.title}</p>}
                {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
