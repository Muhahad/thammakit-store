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

// Themed stock photos (Unsplash). Swap for your own product shots via the admin
// Cloudinary upload anytime. `img(id)` builds an optimized 800px URL.
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=70&auto=format&fit=crop`;

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
    { name: "ผ้าไตร-จีวร", nameEn: "Monk Robes", slug: "robes", image: img("1704408347810-8c7048e445a9") },
    { name: "ชุดสังฆทาน", nameEn: "Offering Sets", slug: "offering-sets", image: img("1495667496513-9068843d7679") },
    { name: "บาตร-เครื่องใช้พระ", nameEn: "Alms Bowls", slug: "alms-bowls", image: img("1629953031870-02be15a295ee") },
    { name: "เครื่องสักการะ", nameEn: "Incense & Candles", slug: "incense-candles", image: img("1551690935-a9e6f0a7e788") },
    { name: "โต๊ะหมู่บูชา-พระพุทธรูป", nameEn: "Altar & Buddha", slug: "altar-buddha", image: img("1609745772921-f520289e9618") },
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
      cat: "robes", price: 125000, compareAtPrice: 159000, image: "1704408347810-8c7048e445a9",
      featured: true, best: true,
      desc: "ผ้าไตรครบชุด เนื้อผ้ามัสลินคุณภาพสูง สีเหลืองทองสวยงาม เหมาะสำหรับถวายพระในทุกโอกาสบุญ",
    },
    {
      name: "ชุดสังฆทานถังเหลือง จัดเต็ม 25 รายการ",
      cat: "offering-sets", price: 45900, compareAtPrice: 59000, image: "1663075039616-dd9ea424b68e",
      featured: true, best: true,
      desc: "ชุดสังฆทานถังเหลือง คัดสรรของใช้จำเป็นสำหรับพระสงฆ์ครบ 25 รายการ พร้อมถวายทันที ของใหม่ ไม่หมดอายุ",
    },
    {
      name: "ชุดสังฆทานยา เวชภัณฑ์ดูแลสุขภาพพระสงฆ์",
      cat: "offering-sets", price: 39000, image: "1495667496513-9068843d7679", brandNew: true,
      desc: "ชุดสังฆทานยาและเวชภัณฑ์ คัดสรรยาสามัญประจำวัด ถวายเพื่อดูแลสุขภาพพระภิกษุสงฆ์",
    },
    {
      name: "บาตรพระสแตนเลส 7 นิ้ว พร้อมฝาและเชิงบาตร",
      cat: "alms-bowls", price: 65000, image: "1629953031870-02be15a295ee", best: true,
      desc: "บาตรสแตนเลสอย่างดี ขนาด 7 นิ้ว ไม่เป็นสนิม พร้อมฝาปิดและเชิงบาตร ทนทาน ใช้งานได้ยาวนาน",
    },
    {
      name: "ตาลปัตร พัดยศ ปักลายไทยงานประณีต",
      cat: "alms-bowls", price: 52000, image: "1513415564515-763d91423bdd",
      desc: "ตาลปัตรงานปักลายไทยประณีต ด้ามจับแข็งแรง เหมาะสำหรับถวายในงานพิธีสำคัญ",
    },
    {
      name: "ธูปหอมอโรม่า กล่อง 100 ดอก",
      cat: "incense-candles", price: 9900, image: "1541795083-1b160cf4f3d7", brandNew: true,
      desc: "ธูปหอมกลิ่นอโรม่า ควันน้อย จุดง่าย กล่องละ 100 ดอก สำหรับสักการะบูชาพระรัตนตรัย",
    },
    {
      name: "เทียนพรรษา แกะสลักลายไทย สูง 12 นิ้ว",
      cat: "incense-candles", price: 29000, image: "1561212856-44e9bae482aa", featured: true,
      desc: "เทียนพรรษาแกะสลักลายไทยอย่างวิจิตร เนื้อเทียนแท้ จุดได้นาน เหมาะสำหรับถวายในเทศกาลเข้าพรรษา",
    },
    {
      name: "กระถางธูปทองเหลือง ลายมงคล",
      cat: "incense-candles", price: 35000, image: "1543274420-090dfb67739d",
      desc: "กระถางธูปทองเหลืองแท้ ลวดลายมงคล งานหล่อประณีต สำหรับโต๊ะหมู่บูชาและศาลพระ",
    },
    {
      name: "โต๊ะหมู่บูชา หมู่ 7 ไม้สักทอง แกะสลัก",
      cat: "altar-buddha", price: 429000, compareAtPrice: 490000, image: "1609745772921-f520289e9618",
      featured: true, best: true,
      desc: "โต๊ะหมู่บูชาหมู่ 7 ไม้สักทองแท้ แกะสลักลายไทยงานฝีมือช่าง แข็งแรงทนทาน เสริมความเป็นสิริมงคลแก่บ้าน",
    },
    {
      name: "พระพุทธรูปปางสมาธิ หน้าตัก 9 นิ้ว เนื้อทองเหลือง",
      cat: "altar-buddha", price: 190000, compareAtPrice: 259000, image: "1529485726363-95c8d62f656f",
      brandNew: true,
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
          create: { url: img(p.image), publicId: `seed/${slug}`, alt: p.name, position: 0 },
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
