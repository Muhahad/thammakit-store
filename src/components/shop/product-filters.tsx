"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Cat {
  id: string;
  name: string;
  slug: string;
}

/**
 * Filter + sort sidebar. Reads current state from the URL and writes changes
 * back as query params (server re-renders the list). Keeps the app URL-driven
 * so results are shareable and crawlable.
 */
export function ProductFilters({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Build a new URL with one param changed, resetting pagination.
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const activeCategory = params.get("category");
  const activeSort = params.get("sort") ?? "newest";

  return (
    <aside className="space-y-6" aria-label="ตัวกรองสินค้า">
      {/* Sort */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">เรียงตาม</h3>
        <select
          value={activeSort}
          onChange={(e) => setParam("sort", e.target.value)}
          aria-label="เรียงลำดับสินค้า"
          className="h-9 w-full rounded-md border bg-background px-2 text-sm"
        >
          <option value="newest">ใหม่ล่าสุด</option>
          <option value="popular">ขายดี</option>
          <option value="price-asc">ราคาต่ำ → สูง</option>
          <option value="price-desc">ราคาสูง → ต่ำ</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">หมวดหมู่</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <button
              onClick={() => setParam("category", null)}
              className={!activeCategory ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}
            >
              ทั้งหมด
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setParam("category", c.slug)}
                className={activeCategory === c.slug ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">ช่วงราคา (฿)</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setParam("min", (form.get("min") as string) || null);
            const max = form.get("max") as string;
            const next = new URLSearchParams(params.toString());
            if (form.get("min")) next.set("min", form.get("min") as string);
            else next.delete("min");
            if (max) next.set("max", max);
            else next.delete("max");
            next.delete("page");
            router.push(`${pathname}?${next.toString()}`);
          }}
          className="flex items-center gap-2"
        >
          <input name="min" type="number" min={0} placeholder="ต่ำสุด" defaultValue={params.get("min") ?? ""}
            className="h-9 w-full rounded-md border bg-background px-2 text-sm" aria-label="ราคาต่ำสุด" />
          <span>-</span>
          <input name="max" type="number" min={0} placeholder="สูงสุด" defaultValue={params.get("max") ?? ""}
            className="h-9 w-full rounded-md border bg-background px-2 text-sm" aria-label="ราคาสูงสุด" />
          <button type="submit" className="h-9 shrink-0 rounded-md bg-primary px-3 text-sm text-primary-foreground">ตกลง</button>
        </form>
      </div>
    </aside>
  );
}
