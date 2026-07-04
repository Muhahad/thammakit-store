"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** URL-driven pagination control for the product listing page. */
export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(page));
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="แบ่งหน้า">
      <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => goTo(currentPage - 1)} aria-label="ก่อนหน้า">
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        หน้า {currentPage} / {totalPages}
      </span>
      <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => goTo(currentPage + 1)} aria-label="ถัดไป">
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
