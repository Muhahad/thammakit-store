"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Product image gallery with thumbnail selection and hover-zoom.
 * Zoom follows the cursor by shifting `transform-origin` on mouse move.
 */
export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState("center");
  const current = images[active];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
        onMouseMove={onMove}
      >
        {current && (
          <Image
            src={current.url}
            alt={current.alt ?? name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-200 group-hover:scale-150"
            style={{ transformOrigin: origin }}
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              aria-label={`รูปที่ ${i + 1}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border-2",
                i === active ? "border-primary" : "border-transparent",
              )}
            >
              <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
