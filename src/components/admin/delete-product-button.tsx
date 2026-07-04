"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/admin-products";

/** Delete a product after confirmation; removes Cloudinary images server-side. */
export function DeleteProductButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("ยืนยันการลบสินค้านี้? การลบไม่สามารถย้อนกลับได้")) return;
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.ok) toast.success("ลบสินค้าแล้ว");
      else toast.error("ลบไม่สำเร็จ");
    });
  }

  return (
    <Button variant="destructive" size="sm" onClick={onClick} disabled={pending}>
      {pending ? "..." : "ลบ"}
    </Button>
  );
}
