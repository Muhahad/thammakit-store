"use client";

import Link from "next/link";
import { ShoppingBag, Search, Heart, User, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { SITE } from "@/config/site";

/**
 * Sticky storefront header with search, wishlist, account, cart badge, and a
 * dark-mode toggle. Cart count is reactive via the Zustand store.
 */
export function SiteHeader() {
  const count = useCart((s) => s.count());
  const setOpen = useCart((s) => s.setOpen);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="text-xl font-bold text-primary shrink-0">
          {SITE.name}
        </Link>

        <form action="/products" className="relative ml-auto hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            placeholder="ค้นหาสินค้า..."
            aria-label="ค้นหาสินค้า"
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1 md:ml-0">
          <Button variant="ghost" size="icon" aria-label="สลับธีม" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="size-5 dark:hidden" />
            <Moon className="hidden size-5 dark:block" />
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="รายการโปรด">
            <Link href="/wishlist"><Heart className="size-5" /></Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="บัญชีของฉัน">
            <Link href="/account"><User className="size-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative" aria-label="ตะกร้าสินค้า" onClick={() => setOpen(true)}>
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
