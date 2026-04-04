# CardPulse

Telegram Mini App storefront MVP for a trading card business. Built with Next.js App Router, Tailwind CSS, Supabase Postgres, and a basic-auth protected admin panel.

## Features

- Mobile-first browse page with instant search and filter/sort controls
- Card detail page with quantity selection and cart-based claim flow
- Client-side cart with copy-to-clipboard export for Telegram
- Supabase-backed inventory with admin CRUD
- Basic-auth protected `/admin` panel for inventory management

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://qwkhzkttzajuclxemzka.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_B6x1ek0KRRSygNlHFtdVsw_ir8fwV0E
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=cardpulse
NEXT_PUBLIC_TELEGRAM_USERNAME=yourtelegramhandle
```

`SUPABASE_SERVICE_ROLE_KEY` is strongly recommended for admin writes because the bundled SQL enables public read access only.

3. In Supabase, open the SQL Editor and run [supabase/schema.sql](/Users/aloykok/Documents/CardPulse | Mini App/supabase/schema.sql).

4. Start the app:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

6. Visit `/admin` and sign in with the basic auth credentials above.

## Database

- Hosted DB: Supabase Postgres
- Schema + sample seed data: [supabase/schema.sql](/Users/aloykok/Documents/CardPulse | Mini App/supabase/schema.sql)
- The app expects a `public.cards` table with the fields already defined in that SQL file.

## Core structure

```text
app/
  admin/
    actions.ts
    page.tsx
  browse/
    page.tsx
  cart/
    page.tsx
  cards/[id]/
    page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  add-to-cart-button.tsx
  admin-select.tsx
  browse-list-item.tsx
  card-card.tsx
  cart-dock.tsx
  cart-link.tsx
  cart-page-client.tsx
  cart-provider.tsx
  empty-state.tsx
  filter-bar.tsx
  section-heading.tsx
  status-badge.tsx
lib/
  cart.ts
  queries.ts
  rarities.ts
  seed-data.ts
  sets.ts
  telegram.ts
  types.ts
  utils.ts
middleware.ts
supabase/
  schema.sql
utils/
  supabase/
    client.ts
    config.ts
    middleware.ts
    server.ts
```

## Notes

- Users build a cart, copy the cart text, and send it in Telegram manually.
- Admin image uploads still save into `public/uploads/`. For production hosting, use stable image URLs or move uploads to Supabase Storage next.
