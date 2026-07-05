"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/** Animated hero banner (Framer Motion). Gradient background, dual CTA. */
export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container flex flex-col items-center gap-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl"
        >
          สังฆภัณฑ์ครบครัน <span className="text-primary">ทำบุญสะดวก</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl text-lg text-muted-foreground"
        >
          ผ้าไตร · ชุดสังฆทาน · บาตร · เครื่องสักการะ · จัดส่งทั่วไทย · ส่งฟรีเมื่อซื้อครบ ฿1,000
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-3"
        >
          <Button asChild size="lg"><Link href="/products">เลือกซื้อสินค้า</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/products?sort=popular">สินค้าขายดี</Link></Button>
        </motion.div>
      </div>
    </section>
  );
}
