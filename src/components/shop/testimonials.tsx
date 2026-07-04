import { Star } from "lucide-react";

const REVIEWS = [
  { name: "สมชาย ก.", text: "ของดี ส่งไว แพ็คของมาอย่างดี ประทับใจมากครับ", rating: 5 },
  { name: "Ratchada P.", text: "จ่ายผ่าน PromptPay สะดวกมาก สินค้าตรงปก", rating: 5 },
  { name: "นภาพร ส.", text: "บริการดีเยี่ยม มีปัญหาแอดมินตอบไว แนะนำเลยค่ะ", rating: 4 },
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
