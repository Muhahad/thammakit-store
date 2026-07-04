# Deployment & Optimization (Steps 9–10)

## Step 9 — Deploy to Vercel

### 1. Database (Neon / Vercel Postgres / Supabase)
Create a PostgreSQL database and grab two connection strings:
- `DATABASE_URL` — **pooled** (PgBouncer) connection for the app.
- `DIRECT_URL` — direct connection for `prisma migrate`.

### 2. Push code & import to Vercel
```bash
git add -A && git commit -m "init: thammakit store"
git push  # to GitHub/GitLab, then "Import Project" in Vercel
```

### 3. Environment variables (Vercel → Settings → Environment Variables)
Copy every key from `.env.example`. Critical for production:
- `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_URL=https://your-domain`
- `DATABASE_URL`, `DIRECT_URL`
- Stripe / Omise keys + `STRIPE_WEBHOOK_SECRET`
- `PROMPTPAY_ID`, bank details
- Cloudinary + SMTP + analytics ids

### 4. Build
`vercel.json` runs `prisma generate && prisma migrate deploy && next build`, so
migrations apply automatically on each deploy. Seed once from your machine:
```bash
DATABASE_URL=... npm run db:seed
```

### 5. Wire webhooks (after first deploy)
- **Stripe**: add endpoint `https://your-domain/api/webhooks/stripe` for
  `payment_intent.succeeded`; copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
- **Omise**: add endpoint `https://your-domain/api/webhooks/omise` for `charge.complete`.

### 6. Google Search Console
Add the property, submit `https://your-domain/sitemap.xml`.

---

## Step 10 — Optimization checklist

### Performance
- **Server Components by default** — data fetched via Prisma on the server, no
  client waterfalls (homepage, PLP, PDP).
- **ISR** — `export const revalidate` on catalog pages; on-demand
  `revalidatePath()` after admin edits so stock/price stay fresh.
- **next/image** — AVIF/WebP, responsive `sizes`, `priority` only on the PDP hero.
- **Code splitting** — client islands (cart, gallery, forms) are the only
  hydrated JS; everything else ships zero JS.
- **Fonts** — `next/font` self-hosts "Prompt" (Thai) with `display: swap`.

### SEO
- Metadata + Open Graph + Twitter cards per page (`generateMetadata`).
- Product **JSON-LD** structured data (rich results).
- Dynamic `sitemap.xml`, `robots.txt`, `manifest.webmanifest`.

### Accessibility (WCAG AA)
- Semantic landmarks, labelled inputs/buttons, `aria-*` on interactive controls.
- Visible `:focus-visible` ring, keyboard-operable cart/drawer/gallery.
- Color tokens meet AA contrast in light **and** dark mode.

### Security
- Zod validation on every server action + API route.
- Role checks in middleware **and** re-checked server-side (`assertAdmin`).
- Prices/stock always re-read from DB (never trust the client).
- Stripe webhook signature verification; in-memory rate limiting (swap for
  Upstash Redis in multi-region).
- Security headers in `next.config.ts` (HSTS, X-Frame-Options, nosniff, etc.).
- Passwords hashed with bcrypt; SQL injection prevented by Prisma parametrization.

### What to build next (same patterns as the slices provided)
- `/checkout` multi-step UI wired to `createOrder` + Stripe Elements / PromptPay QR view.
- `/account`, `/orders`, `/wishlist` customer pages (queries already exist).
- Admin `products/`, `orders/`, `coupons/`, `users/` list+form pages
  (server actions already exist: `admin-products.ts`, `updateOrderStatus`).
- Omise webhook (mirror the Stripe one, call `markOrderPaid`).
- Review submission form (validator + `reviewSchema` ready).
