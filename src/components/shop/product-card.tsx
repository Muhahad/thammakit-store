import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatTHB } from "@/lib/utils";
import type { ProductCardData } from "@/lib/queries";
import { AddToCartButton } from "./add-to-cart-button";

/**
 * Product card for grids (homepage sections, listing page).
 * Server Component — renders the interactive add-to-cart button as a client island.
 */
export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  const inStock = (product.inventory?.quantity ?? 0) > 0;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">ไม่มีรูป</div>
        )}
        {onSale && (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
            ลดราคา
          </span>
        )}
        {!inStock && (
          <span className="absolute right-2 top-2 rounded-full bg-foreground/80 px-2 py-1 text-xs text-background">
            สินค้าหมด
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium hover:text-primary">
          {product.name}
        </Link>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-accent text-accent" aria-hidden />
          <span>{product.ratingAvg.toFixed(1)}</span>
          <span aria-hidden>·</span>
          <span>{product.ratingCount} รีวิว</span>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-semibold text-primary">{formatTHB(product.price)}</span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatTHB(product.compareAtPrice!)}
            </span>
          )}
        </div>

        <AddToCartButton productId={product.id} disabled={!inStock} />
      </div>
    </div>
  );
}
