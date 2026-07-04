# ร้านค้าธรรมกิจ (Thammakit Store)

Production-ready e-commerce platform built for the **Thai market** — THB currency, VAT 7%,
Thai address model (จังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์), Thai mobile validation, and Thai
payment rails (PromptPay QR, Omise, Stripe, Bank Transfer).

## Tech Stack

| Layer          | Technology                                             |
| -------------- | ------------------------------------------------------ |
| Framework      | Next.js 15 (App Router) + React 19 + TypeScript        |
| Styling        | Tailwind CSS + shadcn/ui + Framer Motion               |
| Data           | Prisma ORM + PostgreSQL                                |
| Auth           | NextAuth v5 (Auth.js) — credentials + OAuth            |
| Payments       | Stripe · Omise · PromptPay QR · Bank Transfer          |
| Media          | Cloudinary (signed uploads)                            |
| Email          | Nodemailer (SMTP / Resend)                             |
| Deployment     | Vercel + Vercel Postgres / Neon                        |

## Architecture (Step 1)

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                             │
│   React 19 Server Components (default) + Client Components (islands)  │
└───────────────┬──────────────────────────────────────┬───────────────┘
                │                                        │
     Server Components /                        Client interactivity
     Server Actions (mutations)                 (cart store, forms)
                │                                        │
┌───────────────▼────────────────────────────────────────▼─────────────┐
│                     NEXT.JS 15 (App Router)                           │
│                                                                        │
│  src/app/(shop)      Public storefront (SSR/ISR, SEO)                 │
│  src/app/(auth)      Login / Register                                 │
│  src/app/admin       Protected dashboard (role=ADMIN)                 │
│  src/app/api         Route Handlers (webhooks, REST-ish endpoints)    │
│                                                                        │
│  middleware.ts       Auth guard + security + rate limiting            │
└───────────────┬────────────────────────────────────────┬─────────────┘
                │                                        │
        Prisma Client                            External services
                │                                        │
┌───────────────▼──────────┐          ┌──────────────────▼──────────────┐
│      PostgreSQL          │          │ Stripe · Omise · Cloudinary ·   │
│  (12+ relational tables) │          │ SMTP · PromptPay lib            │
└──────────────────────────┘          └─────────────────────────────────┘
```

### Rendering strategy
- **Server Components by default** — product listings, PDPs, homepage sections fetch
  directly via Prisma (no client waterfalls).
- **Client islands** — cart drawer, add-to-cart, filters, image zoom, forms.
- **ISR** on catalog pages (`revalidate`), **on-demand revalidation** after admin edits.
- **Server Actions** for mutations (cart, reviews, checkout) with Zod validation.

### Folder structure
```
src/
├── app/
│   ├── (shop)/            # storefront route group
│   │   ├── page.tsx           # homepage
│   │   ├── products/          # PLP + PDP ([slug])
│   │   ├── cart/ checkout/ orders/ wishlist/ account/
│   ├── (auth)/            # login, register
│   ├── admin/             # dashboard, products, orders, coupons, users
│   ├── api/               # webhooks (stripe/omise), cloudinary sign, sitemap data
│   ├── layout.tsx  globals.css  sitemap.ts  robots.ts  manifest.ts
├── components/
│   ├── ui/                # shadcn primitives
│   ├── shop/              # storefront components
│   └── admin/             # dashboard components
├── lib/
│   ├── prisma.ts          # singleton client
│   ├── auth.ts            # NextAuth config
│   ├── utils.ts           # cn(), formatTHB()
│   ├── validators/        # Zod schemas (Thai phone, zipcode, etc.)
│   ├── payments/          # promptpay, stripe, omise
│   ├── actions/           # server actions
│   ├── cloudinary.ts  mail.ts  rate-limit.ts  seo.ts
├── config/                # constants: provinces, shipping carriers, tax
├── hooks/  types/  emails/
prisma/  schema.prisma  seed.ts
```

## Getting started

> Requires **Node.js 20+** and a **PostgreSQL** database.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env      # then fill in the values

# 3. Set up the database
npm run db:generate       # generate Prisma client
npm run db:migrate        # create tables (dev)
npm run db:seed           # seed categories, demo products, admin user

# 4. Run
npm run dev               # http://localhost:3000
```

## The 10 build steps
1. **Architecture** — this document + folder structure.
2. **Database schema** — `prisma/schema.prisma` (Users, Products, Categories, Orders,
   OrderItems, Coupons, Addresses, Payments, Reviews, Wishlist, Cart, Inventory).
3. **Backend** — Prisma singleton, server actions, API route handlers.
4. **Authentication** — NextAuth v5 (credentials + Google), role-based middleware.
5. **Frontend** — storefront: homepage, PLP, PDP, cart, wishlist, account.
6. **Admin dashboard** — CRUD products, orders, coupons, users, sales, CSV export.
7. **Payment** — PromptPay QR, Stripe, Omise, bank transfer + webhooks.
8. **Testing** — Vitest unit tests for Thai domain logic (VAT, phone, PromptPay).
9. **Deployment** — Vercel + Postgres, env, webhook wiring.
10. **Optimization** — image/caching/SEO/accessibility/security hardening.

See `/docs` inline comments — every important function is documented.
