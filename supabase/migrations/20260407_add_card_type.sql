alter table public.cards
  add column if not exists card_type text not null default 'Character';

update public.cards
set card_type = 'Character'
where card_type is null or trim(card_type) = '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cards_card_type_check'
  ) then
    alter table public.cards
      add constraint cards_card_type_check
      check (card_type in ('Character', 'Leader', 'Event', 'Stage', 'Don'));
  end if;
end $$;

create index if not exists cards_type_idx on public.cards (card_type);
