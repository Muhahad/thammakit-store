/**
 * Seed script — run with `npm run db:seed`.
 * Store theme: สังฆภัณฑ์ (Buddhist monk supplies & religious offerings).
 * Creates an admin user, category tree, demo products (+inventory, images),
 * and a welcome coupon. Clears the existing catalog first so re-runs are clean.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

// Placeholder image (replace with real photos via the admin Cloudinary upload).
const IMG = (sig: number) =>
  `https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&sig=${sig}`;

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

  // ── Clear existing demo data ────────────────────────────────────────────────
  // NOTE: this is a demo/dev seed — it fully resets the catalog. Orders are
  // cleared first (cascades OrderItem + Payment) so products can be removed
  // without hitting the OrderItem RESTRICT foreign key.
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({}); // cascades images/inventory/cart/wishlist/reviews
  await prisma.category.deleteMany({});

  // ── Categories (สังฆภัณฑ์) ────────────────────────────────────────────────
  const categoryData = [
    { name: "ผ้าไตร-จีวร", nameEn: "Monk Robes", slug: "robes" },
    { name: "ชุดสังฆทาน", nameEn: "Offering Sets", slug: "offering-sets" },
    { name: "บาตร-เครื่องใช้พระ", nameEn: "Alms Bowls", slug: "alms-bowls" },
    { name: "เครื่องสักการะ", nameEn: "Incense & Candles", slug: "incense-candles" },
    { name: "โต๊ะหมู่บูชา-พระพุทธรูป", nameEn: "Altar & Buddha", slug: "altar-buddha" },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await prisma.category.create({ data: c });
    categories[c.slug] = cat.id;
  }

  // ── Demo products ──────────────────────────────────────────────────────────
  const demo = [
    {
      name: "ผ้าไตรจีวร มัสลิน เกรดพรีเมียม สีเหลืองทอง",
      cat: "robes", price: 129000, compareAtPrice: 159000,
      featured: true, best: true,
      desc: "ผ้าไตรครบชุด เนื้อผ้ามัสลินคุณภาพสูง สีเหลืองทองสวยงาม เหมาะสำหรับถวายพระในทุกโอกาสบุญ",
    },
    {
      name: "ชุดสังฆทานถังเหลือง จัดเต็ม 25 รายการ",
      cat: "offering-sets", price: 39900, compareAtPrice: 49900,
      featured: true, best: true,
      desc: "ชุดสังฆทานถังเหลือง คัดสรรของใช้จำเป็นสำหรับพระสงฆ์ครบ 25 รายการ พร้อมถวายทันที ของใหม่ ไม่หมดอายุ",
    },
    {
      name: "ชุดสังฆทานยา เวชภัณฑ์ดูแลสุขภาพพระสงฆ์",
      cat: "offering-sets", price: 35000, brandNew: true,
      desc: "ชุดสังฆทานยาและเวชภัณฑ์ คัดสรรยาสามัญประจำวัด ถวายเพื่อดูแลสุขภาพพระภิกษุสงฆ์",
    },
    {
      name: "บาตรพระสแตนเลส 7 นิ้ว พร้อมฝาและเชิงบาตร",
      cat: "alms-bowls", price: 59000, best: true,
      desc: "บาตรสแตนเลสอย่างดี ขนาด 7 นิ้ว ไม่เป็นสนิม พร้อมฝาปิดและเชิงบาตร ทนทาน ใช้งานได้ยาวนาน",
    },
    {
      name: "ตาลปัตร พัดยศ ปักลายไทยงานประณีต",
      cat: "alms-bowls", price: 45000,
      desc: "ตาลปัตรงานปักลายไทยประณีต ด้ามจับแข็งแรง เหมาะสำหรับถวายในงานพิธีสำคัญ",
    },
    {
      name: "ธูปหอมอโรม่า กล่อง 100 ดอก",
      cat: "incense-candles", price: 8900, brandNew: true,
      desc: "ธูปหอมกลิ่นอโรม่า ควันน้อย จุดง่าย กล่องละ 100 ดอก สำหรับสักการะบูชาพระรัตนตรัย",
    },
    {
      name: "เทียนพรรษา แกะสลักลายไทย สูง 12 นิ้ว",
      cat: "incense-candles", price: 25900, featured: true,
      desc: "เทียนพรรษาแกะสลักลายไทยอย่างวิจิตร เนื้อเทียนแท้ จุดได้นาน เหมาะสำหรับถวายในเทศกาลเข้าพรรษา",
    },
    {
      name: "กระถางธูปทองเหลือง ลายมงคล",
      cat: "incense-candles", price: 28000,
      desc: "กระถางธูปทองเหลืองแท้ ลวดลายมงคล งานหล่อประณีต สำหรับโต๊ะหมู่บูชาและศาลพระ",
    },
    {
      name: "โต๊ะหมู่บูชา หมู่ 7 ไม้สักทอง แกะสลัก",
      cat: "altar-buddha", price: 390000, compareAtPrice: 450000,
      featured: true, best: true,
      desc: "โต๊ะหมู่บูชาหมู่ 7 ไม้สักทองแท้ แกะสลักลายไทยงานฝีมือช่าง แข็งแรงทนทาน เสริมความเป็นสิริมงคลแก่บ้าน",
    },
    {
      name: "พระพุทธรูปปางสมาธิ หน้าตัก 9 นิ้ว เนื้อทองเหลือง",
      cat: "altar-buddha", price: 150000, brandNew: true,
      desc: "พระพุทธรูปปางสมาธิ เนื้อทองเหลืองรมดำ หน้าตัก 9 นิ้ว พุทธลักษณะงดงาม เหมาะบูชาประจำบ้านและสำนักงาน",
    },
  ];

  for (const [i, p] of demo.entries()) {
    const slug = `${slugify(p.name)}-${i + 1}`;
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        sku: `TK-${String(i + 1).padStart(4, "0")}`,
        description: p.desc,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        categoryId: categories[p.cat]!,
        isFeatured: p.featured ?? false,
        isNewArrival: p.brandNew ?? false,
        isBestSeller: p.best ?? false,
        ratingAvg: 4.7,
        ratingCount: 18,
        soldCount: Math.floor(Math.random() * 300),
        images: {
          create: { url: IMG(i), publicId: `seed/${slug}`, alt: p.name, position: 0 },
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
      minSpend: 30000,
      maxDiscount: 10000,
      usageLimit: 1000,
      isActive: true,
    },
  });

  console.log("✅ Seed completed (สังฆภัณฑ์)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
