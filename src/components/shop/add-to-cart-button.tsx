"use client";

import { useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { getProductForCart } from "@/lib/actions/cart";

/**
 * Client island: adds a product to the cart. Fetches authoritative price/stock
 * from the server (never trusts client-supplied price) before adding.
 */
export function AddToCartButton({
  productId,
  disabled,
  quantity = 1,
  full,
}: {
  productId: string;
  disabled?: boolean;
  quantity?: number;
  full?: boolean;
}) {
  const add = useCart((s) => s.add);
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      const product = await getProductForCart(productId);
      if (!product) {
        toast.error("ไม่พบสินค้า");
        return;
      }
      if (product.stock <= 0) {
        toast.error("สินค้าหมด");
        return;
      }
      add(
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price: product.price,
          maxQuantity: product.stock,
        },
        quantity,
      );
      toast.success("เพิ่มลงตะกร้าแล้ว");
    });
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={disabled || pending}
      size="sm"
      className={full ? "w-full" : "w-full"}
      aria-label="เพิ่มลงตะกร้า"
    >
      <ShoppingCart className="size-4" />
      {pending ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
    </Button>
  );
}
