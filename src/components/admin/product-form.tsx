"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { createProduct, updateProduct } from "@/lib/actions/admin-products";

interface Category { id: string; name: string }
interface ProductImageInput { url: string; publicId: string; alt?: string }
interface Initial {
  id?: string;
  name?: string; slug?: string; description?: string; sku?: string;
  price?: number; compareAtPrice?: number | null; categoryId?: string;
  quantity?: number; weightGrams?: number;
  isActive?: boolean; isFeatured?: boolean; isNewArrival?: boolean; isBestSeller?: boolean;
  images?: ProductImageInput[];
}

/**
 * Create/edit product form. Images upload directly to Cloudinary using a signed
 * request from /api/cloudinary/sign (secret never touches the browser). Prices
 * are entered in Baht and converted to satang before submit.
 */
export function ProductForm({ categories, initial }: { categories: Category[]; initial?: Initial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState<ProductImageInput[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const isEdit = !!initial?.id;

  /** Upload selected files to Cloudinary via a server-signed request. */
  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const sign = await fetch("/api/cloudinary/sign", { method: "POST" }).then((r) => r.json());
      const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", sign.apiKey);
        fd.append("timestamp", String(sign.timestamp));
        fd.append("signature", sign.signature);
        fd.append("folder", "thammakit/products");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: fd });
        const data = await res.json();
        if (data.secure_url) setImages((prev) => [...prev, { url: data.secure_url, publicId: data.public_id }]);
      }
      toast.success("อัปโหลดรูปแล้ว");
    } catch {
      toast.error("อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      name: f.get("name") as string,
      slug: (f.get("slug") as string) || slugify(f.get("name") as string),
      description: f.get("description") as string,
      sku: f.get("sku") as string,
      price: Math.round(Number(f.get("price")) * 100), // baht → satang
      compareAtPrice: f.get("compareAtPrice") ? Math.round(Number(f.get("compareAtPrice")) * 100) : undefined,
      categoryId: f.get("categoryId") as string,
      quantity: Number(f.get("quantity") ?? 0),
      weightGrams: Number(f.get("weightGrams") ?? 500),
      isActive: f.get("isActive") === "on",
      isFeatured: f.get("isFeatured") === "on",
      isNewArrival: f.get("isNewArrival") === "on",
      isBestSeller: f.get("isBestSeller") === "on",
      images,
    };

    startTransition(async () => {
      const res = isEdit ? await updateProduct(initial!.id!, payload) : await createProduct(payload);
      if (res.error) {
        toast.error("บันทึกไม่สำเร็จ ตรวจสอบข้อมูล");
        return;
      }
      toast.success(isEdit ? "อัปเดตสินค้าแล้ว" : "เพิ่มสินค้าแล้ว");
      router.push("/admin/products");
      router.refresh();
    });
  }

  const input = "h-10 w-full rounded-md border bg-background px-3 text-sm";

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-sm">ชื่อสินค้า</label>
        <input name="name" defaultValue={initial?.name} required className={input} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Slug (เว้นว่างให้สร้างอัตโนมัติ)</label>
          <input name="slug" defaultValue={initial?.slug} className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm">SKU</label>
          <input name="sku" defaultValue={initial?.sku} required className={input} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm">รายละเอียด</label>
        <textarea name="description" defaultValue={initial?.description} required rows={4} className="w-full rounded-md border bg-background p-3 text-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm">ราคา (฿)</label>
          <input name="price" type="number" step="0.01" min="0" defaultValue={initial?.price ? initial.price / 100 : ""} required className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm">ราคาเดิม (฿)</label>
          <input name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={initial?.compareAtPrice ? initial.compareAtPrice / 100 : ""} className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm">จำนวนคงเหลือ</label>
          <input name="quantity" type="number" min="0" defaultValue={initial?.quantity ?? 0} className={input} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">หมวดหมู่</label>
          <select name="categoryId" defaultValue={initial?.categoryId} required className={input}>
            <option value="">เลือกหมวดหมู่</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm">น้ำหนัก (กรัม)</label>
          <input name="weightGrams" type="number" min="0" defaultValue={initial?.weightGrams ?? 500} className={input} />
        </div>
      </div>

      {/* Merchandising flags */}
      <fieldset className="flex flex-wrap gap-4 text-sm">
        {[
          { name: "isActive", label: "เปิดขาย", def: initial?.isActive ?? true },
          { name: "isFeatured", label: "สินค้าแนะนำ", def: initial?.isFeatured },
          { name: "isNewArrival", label: "สินค้าใหม่", def: initial?.isNewArrival },
          { name: "isBestSeller", label: "ขายดี", def: initial?.isBestSeller },
        ].map((c) => (
          <label key={c.name} className="flex items-center gap-2">
            <input type="checkbox" name={c.name} defaultChecked={c.def} /> {c.label}
          </label>
        ))}
      </fieldset>

      {/* Images */}
      <div>
        <label className="mb-1 block text-sm">รูปสินค้า (อัปโหลดได้หลายรูป)</label>
        <input type="file" accept="image/*" multiple onChange={onFiles} disabled={uploading} className="text-sm" />
        {uploading && <p className="mt-1 text-xs text-muted-foreground">กำลังอัปโหลด...</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={img.publicId} className="relative size-20 overflow-hidden rounded-md border">
              <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
              <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                className="absolute right-0 top-0 rounded-bl bg-destructive p-0.5 text-destructive-foreground" aria-label="ลบรูป">
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending || uploading}>{pending ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
      </div>
    </form>
  );
}
