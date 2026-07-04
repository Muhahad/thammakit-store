/**
 * One-off maintenance: recompute product & category slugs with the corrected
 * slugify() (which now preserves Thai combining marks). Non-destructive — only
 * updates the `slug` column in place. Safe to re-run (idempotent).
 *
 * Run: npx tsx scripts/fix-slugs.ts
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, slug: true } });
  let changed = 0;
  for (const p of products) {
    // Preserve the trailing "-N" uniqueness suffix if present.
    const suffixMatch = p.slug.match(/-(\d+)$/);
    const suffix = suffixMatch ? `-${suffixMatch[1]}` : "";
    const correct = `${slugify(p.name)}${suffix}`;
    if (correct !== p.slug) {
      await prisma.product.update({ where: { id: p.id }, data: { slug: correct } });
      console.log(`  ${p.slug}  ->  ${correct}`);
      changed++;
    }
  }
  console.log(`✅ Updated ${changed} product slug(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
