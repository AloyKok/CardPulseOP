alter table public.cards
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.cards
set updated_at = coalesce(updated_at, created_at, timezone('utc', now()))
where updated_at is null;

create index if not exists cards_updated_at_idx
  on public.cards (updated_at desc);
