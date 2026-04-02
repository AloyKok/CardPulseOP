# CardPulse

Telegram Mini App storefront MVP for a trading card business. Built with Next.js App Router, Tailwind CSS, SQLite, and a basic-auth protected admin panel.

## Features

- Homepage with featured cards, new arrivals, and browse-all sections
- Browse page with card name/code search and rarity/set/price filters
- Card detail page with cart-based claim flow
- Client-side cart with copy-to-clipboard export for Telegram
- SQLite-backed inventory with automatic seeding on first run
- Admin panel for add, edit, delete, price, quantity, availability, featured state, and image URL/upload

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Optional: define admin and Telegram settings in `.env.local`:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=cardpulse
NEXT_PUBLIC_TELEGRAM_USERNAME=yourtelegramhandle
```

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

5. Visit `/admin` and sign in with the basic auth credentials above.

## Database

- SQLite file: `data/cardpulse.db`
- The database auto-creates the `cards` table and seeds 12 sample cards on first run.
- Reset the database and restore sample data:

```bash
npm run db:reset
```

Then restart the app.

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
  card-card.tsx
  cart-dock.tsx
  cart-link.tsx
  cart-page-client.tsx
  cart-provider.tsx
  add-to-cart-button.tsx
  empty-state.tsx
  filter-bar.tsx
  section-heading.tsx
  status-badge.tsx
lib/
  db.ts
  cart.ts
  queries.ts
  seed-data.ts
  telegram.ts
  types.ts
  utils.ts
middleware.ts
scripts/
  reset-db.mjs
```

## Notes

- Users now build a cart, copy the cart text, and send it in Telegram manually.
- Uploaded admin images are stored in `public/uploads/`.
