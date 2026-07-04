/**
 * Seed script — run with `npm run db:seed`.
 * Creates: an admin user, top-level categories, demo products (+inventory, images),
 * and a welcome coupon. Idempotent via upsert on unique fields.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  // ── Admin ──────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!", 10);
  await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@thammakit.com" },
    update: {},
    create: {
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@thammakit.com",
      name: "ผู้ดูแลระบบ",
      role: "ADMIN",
      passwordHash,
    },
  });

  // ── Categories ─────────────────────────────────────────────────────────────
  const categoryData = [
    { name: "เสื้อผ้าแฟชั่น", nameEn: "Fashion" },
    { name: "อุปกรณ์อิเล็กทรอนิกส์", nameEn: "Electronics" },
    { name: "ของใช้ในบ้าน", nameEn: "Home & Living" },
    { name: "ความงามและสุขภาพ", nameEn: "Beauty & Health" },
  ];
  const categories = [];
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { slug: slugify(c.nameEn) },
      update: {},
      create: { ...c, slug: slugify(c.nameEn) },
    });
    categories.push(cat);
  }

  // ── Demo products ──────────────────────────────────────────────────────────
  const demo = [
    { name: "เสื้อยืดคอตตอนพรีเมียม", price: 39900, compareAtPrice: 59900, cat: 0, featured: true, best: true },
    { name: "หูฟังไร้สาย Bluetooth 5.3", price: 129000, compareAtPrice: 189000, cat: 1, featured: true, brandNew: true },
    { name: "หม้อทอดไร้น้ำมัน 5.5 ลิตร", price: 189000, cat: 2, best: true },
    { name: "เซรั่มบำรุงผิวหน้าวิตามินซี", price: 45900, cat: 3, brandNew: true, featured: true },
    { name: "กระเป๋าสะพายหนังแท้", price: 259000, cat: 0, best: true },
    { name: "ลำโพงพกพากันน้ำ", price: 89900, compareAtPrice: 119900, cat: 1, brandNew: true },
  ];

  for (const [i, p] of demo.entries()) {
    const slug = `${slugify(p.name)}-${i + 1}`;
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        sku: `SKU-${String(i + 1).padStart(4, "0")}`,
        description: `${p.name} คุณภาพดี วัสดุคัดสรร รับประกันความพึงพอใจ จัดส่งรวดเร็วทั่วประเทศไทย`,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        categoryId: categories[p.cat]!.id,
        isFeatured: p.featured ?? false,
        isNewArrival: p.brandNew ?? false,
        isBestSeller: p.best ?? false,
        ratingAvg: 4.5,
        ratingCount: 12,
        soldCount: Math.floor(Math.random() * 200),
        images: {
          create: {
            url: `https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&sig=${i}`,
            publicId: `seed/${slug}`,
            alt: p.name,
            position: 0,
          },
        },
        inventory: { create: { quantity: 100, lowStockThreshold: 10 } },
      },
    });
  }

  // ── Coupon ─────────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "ส่วนลด 10% สำหรับลูกค้าใหม่",
      type: "PERCENTAGE",
      value: 10,
      minSpend: 30000, // ฿300
      maxDiscount: 10000, // cap ฿100
      usageLimit: 1000,
      isActive: true,
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
