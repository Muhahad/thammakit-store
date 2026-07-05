import { Star } from "lucide-react";

const REVIEWS = [
  { name: "คุณสมชาย ก.", text: "ผ้าไตรเนื้อดีมาก จัดส่งไว แพ็คเรียบร้อย ถวายวัดได้อย่างสมเกียรติครับ", rating: 5 },
  { name: "คุณรัชดา พ.", text: "สั่งชุดสังฆทานไปทำบุญวันเกิด ของครบ จ่าย PromptPay สะดวกมากค่ะ", rating: 5 },
  { name: "คุณนภาพร ส.", text: "โต๊ะหมู่บูชางานสวย ไม้แน่น แอดมินให้คำแนะนำดีมาก ประทับใจค่ะ", rating: 4 },
];

/** Social-proof testimonials section (static content, server-rendered). */
export function Testimonials() {
  return (
    <section className="bg-muted/30 py-14">
      <div className="container">
        <h2 className="mb-8 text-center text-2xl font-bold">ลูกค้าพูดถึงเรา</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rounded-xl border bg-card p-6">
              <div className="mb-3 flex gap-0.5" aria-label={`${r.rating} ดาว`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < r.rating ? "size-4 fill-accent text-accent" : "size-4 text-muted"} />
                ))}
              </div>
              <blockquote className="text-sm text-muted-foreground">“{r.text}”</blockquote>
              <figcaption className="mt-4 text-sm font-medium">{r.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
