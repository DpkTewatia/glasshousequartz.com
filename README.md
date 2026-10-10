# Glasshouse Quartz

A rebuild of [glasshousequartz.com](https://www.glasshousequartz.com) as a
Next.js storefront: **Next 16 (App Router) · React 19 · TypeScript · Tailwind 3 ·
Bootstrap 5 · MySQL 8**.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

No database is required to run it. With `DATABASE_URL` unset the storefront
reads `data/catalog.json` — the real catalog, all 118 products — so a clean
checkout is fully browsable. See [Data](#data) to switch to MySQL.

```bash
npm run build        # production build
npm start            # serve the build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

---

## Why this rebuild

The existing store runs Shopify's **Brooklyn** theme, which Shopify retired.
It is Online Store 1.0, so it cannot use sections everywhere, app blocks or
metafields, and it still ships jQuery 2.2.3. Auditing the live site turned up
three problems worth naming:

| | Before | After |
|---|---|---|
| Products reachable from navigation | **77 of 118** | **118 of 118** |
| Collections in nav that render empty | **5** (incl. Chris Morgan, 77 products) | 0 |
| Page titles / meta descriptions | every page `"GlasshouseQuartz"` | per page, per product |
| Structured data | none | `Product` + `AggregateOffer` JSON-LD |

**41 of 118 published products — 35% of the catalog — were orphaned**: not
reachable from any working collection page, only by direct link or search. That
included nearly the whole Cookies water-pipe and hand-pipe line. The taxonomy in
`scripts/build-catalog.mjs` is what fixes it; it fails the build if any product
ends up in no collection.

---

## Architecture

```
src/
├── app/
│   ├── layout.tsx              Bootstrap CSS first, then globals.css
│   ├── page.tsx                Home
│   ├── collections/            Index + [handle]
│   ├── products/[handle]/      PDP with JSON-LD
│   ├── pages/[slug]/           About, Chris Morgan, contact, policies
│   ├── cart/                   Static shell + client cart
│   ├── search/
│   ├── api/cart/               Cart read + mutate
│   ├── actions.ts              Newsletter + contact (server actions)
│   ├── sitemap.ts, robots.ts
├── components/
│   ├── site/                   Header, Footer, MobileNav, AgeGate, forms
│   ├── commerce/               ProductCard, Gallery, Purchase, Cart*
│   ├── home/                   Hero, ValueProps, CollectionRail, FeatureBand
│   └── ui/
└── lib/
    ├── db.ts                   mysql2 pool, query/execute/transaction
    ├── catalog.ts              Catalog reads (MySQL, else catalog.json)
    ├── cart.ts                 Cart storage (MySQL, else cookie)
    ├── payments.ts             Payment provider boundary
    ├── sort.ts                 Client-safe sorting
    ├── site.ts, pages.ts       Content
db/
├── schema.sql                  MySQL DDL
└── seed.mjs                    Applies schema, loads the catalog
scripts/
└── build-catalog.mjs           data/raw -> data/catalog.json
```

### Everything that can be static, is

| Route | Rendering |
|---|---|
| `/`, `/collections`, `/cart`, `/robots.txt`, `/sitemap.xml` | Static |
| `/products/[handle]` | 118 pages prerendered |
| `/collections/[handle]` | 18 pages prerendered |
| `/pages/[slug]` | 6 pages prerendered |
| `/api/cart`, `/search` | Dynamic |

This took deliberate work. Anything reading cookies during render opts its whole
route out of static rendering, so **the cart is a client island**
(`CartProvider` → `/api/cart`) rather than something the layout reads. Sorting
on collection pages happens in the browser via `useSearchParams` inside a
`Suspense` boundary, for the same reason. The header, footer and every product
page are therefore plain static HTML that a CDN can serve.

### Tailwind and Bootstrap together

Both ship a base reset — Tailwind's Preflight and Bootstrap's Reboot — and
running both is the usual reason these two fight. The setup here:

1. `layout.tsx` imports Bootstrap's CSS **before** `globals.css`, so Tailwind's
   utilities always cascade after Bootstrap's components.
2. `tailwind.config.ts` sets `corePlugins: { preflight: false }`. Reboot is the
   single base reset.
3. `globals.css` hands Bootstrap our design tokens through its CSS variables
   (`--bs-body-color`, `--bs-border-radius: 0`, …), so its components render in
   the gallery palette instead of Bootstrap blue.
4. Our own element resets live in `@layer base`, not at the top level — CSS
   written outside a layer beats every layered rule, which would silently make
   utilities like `font-bold` lose to an element selector.

Bootstrap supplies behaviour we would otherwise hand-roll: the cart drawer and
mobile menu (offcanvas), nav dropdowns, and the mobile accordion. Tailwind does
all the styling.

---

## Data

### Without MySQL (default)

`data/catalog.json` is generated from `data/raw/` — the real Shopify export —
by `npm run catalog`. It is the same data the seeder loads, not a mock.

### With MySQL

```bash
cp .env.example .env.local
# DATABASE_URL="mysql://user:password@127.0.0.1:3306/glasshousequartz"

npm run db:setup     # apply db/schema.sql, then load the catalog
npm run db:seed      # reload the catalog only
```

`lib/catalog.ts` uses MySQL whenever `DATABASE_URL` is set and the server
answers, and falls back to the JSON otherwise — so a database outage degrades to
a browsable catalog instead of a 500. Carts move from a cookie to the `carts` /
`cart_lines` tables automatically once a database is present.

Schema notes:

- **Money is `INT UNSIGNED`, in cents.** Never floats.
- **Order lines copy the price at purchase time.** An order must stay truthful
  about what was charged after the product is repriced or deleted.
- `products` carries a `FULLTEXT` index on title + description.
- Re-seeding replaces catalog rows and leaves carts, orders, subscribers and
  contact messages alone.

> **Not yet executed.** `db/schema.sql` is written for MySQL 8 but no MySQL
> server was available on the build machine, so it has been parsed and reviewed
> but never actually run. Apply it to a scratch database before trusting it.

---

## Checkout

**There is none, deliberately.** `src/lib/payments.ts` defines a
`PaymentProvider` interface and ships an `unconfigured` implementation that
refuses to take money, so the flow up to payment is real and testable while a
missing configuration fails loudly instead of appearing to work. The cart page
says so in plain language rather than showing a dead button.

Moving off Shopify means giving up its checkout, and checkout is the part you
should not hand-roll: card data, PCI DSS scope, 3-D Secure, tax and shipping
rates, fraud rules, chargebacks. To go live, implement `PaymentProvider` for
Stripe Checkout (there is a worked sketch in the file's header comment) and set
`PAYMENT_PROVIDER`. Mark orders paid from the **webhook**, never from the
browser returning to the success URL.

Two things to settle before launch:

- Card networks and most PSPs classify smoking accessories as restricted or
  high-risk. Confirm acceptance with the provider first.
- Tax and shipping rates are not calculated anywhere yet.

---

## Design

Gallery white: white ground, black type, hairline rules, generous space, and a
display serif (Instrument Serif) against Inter for UI.

One decision worth recording. This catalog is largely **clear glass and quartz
photographed on a studio sweep**, and sampling those photos shows the backdrop
is not white — it runs from `rgb(249)` at the centre to `rgb(236)` in the
corners. On a white panel the product vanished; on a grey panel the photo's own
background read as a hard rectangle. Multiply blending was tried and rejected —
it is only seamless when the photo background is pure white, which none of these
are. The panel is instead tuned to `#fafafa`, within a level or two of the
photo's own backdrop, so the image edge disappears and the corners fall away as
a vignette that grounds the object. See `.media-panel` in `globals.css`.

Also worth knowing: the existing logo is a white dragon on transparency, which
is invisible on a white ground, so the header uses a typographic wordmark
(`components/site/Wordmark.tsx`). The dragon can come back as a favicon or on
dark surfaces without touching that component.

---

## Content

Business details, policies and the Chris Morgan story are carried over from the
live site — the Sacramento address, `glasshousepremium@gmail.com`, the 7-day
return window, the 10% restocking fee, the 24-hour size swap. Marketing copy was
rewritten for the new layout, but every claim it makes ("full weld", "single
piece of quartz", "twenty years") already appears on the current site. Nothing
factual is invented.

The **Terms & Conditions have not been reviewed by a lawyer.** They restructure
the existing page's substance into readable sections; treat them as a starting
point.

An age gate (21+) is enforced client-side via `localStorage`. It is a
deterrent and a signal of intent, not identity verification.

---

## Migration notes

`next.config.ts` permanently redirects the old Shopify collection handles
(`/collections/glasshouse-cups` → `/collections/banger-kits`, the whole
`cookies-*` family → `/collections/cookies`, and so on) so existing links and
indexed URLs keep working.

Product images are served straight from Shopify's CDN, which resizes each one
to the width requested and returns WebP — or AVIF for a few PNG originals — (see
`src/lib/image-loader.ts`), rather than being re-hosted. That is fine
indefinitely, but it does mean the Shopify CDN stays a dependency — plan to
move the 590 images if the Shopify account is ever closed.

---

## Known gaps

- No checkout (see above).
- `db/schema.sql` has not been executed against a real MySQL server.
- No automated tests.
- No admin UI; the catalog is regenerated from `data/raw` and reseeded.
- Search is substring-and-score in memory. Fine for 118 products; swap to the
  `FULLTEXT` index if the catalog grows.
- Product descriptions are thin because the source data is thin — most products
  have no description at all in Shopify.
