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
`SUPABASE_SERVICE_ROLE_KEY` is required for admin writes, image uploads, and analytics event storage.

3. In Supabase, open the SQL Editor and run [supabase/schema.sql](/Users/aloykok/Documents/CardPulse | Mini App/supabase/schema.sql).
4. If your database was already set up before analytics was added, also run [supabase/migrations/20260407_add_analytics_events.sql](/Users/aloykok/Documents/CardPulse | Mini App/supabase/migrations/20260407_add_analytics_events.sql).

5. Start the app:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

7. Visit `/admin` and sign in with the basic auth credentials above.

## Database

- Hosted DB: Supabase Postgres
- Schema + sample seed data: [supabase/schema.sql](/Users/aloykok/Documents/CardPulse | Mini App/supabase/schema.sql)
- Analytics migration: [supabase/migrations/20260407_add_analytics_events.sql](/Users/aloykok/Documents/CardPulse | Mini App/supabase/migrations/20260407_add_analytics_events.sql)
- The app expects both `public.cards` and `public.analytics_events` to exist.

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
- Admin image uploads use Supabase Storage in the `card-images` bucket.
- `/admin/analytics` shows the lightweight internal analytics dashboard once the analytics migration has been run.
