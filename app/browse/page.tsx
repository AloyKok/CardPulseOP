import { BrowseListItem } from "@/components/browse-list-item";
import { CardCard } from "@/components/card-card";
import { FilterBar } from "@/components/filter-bar";
import { getCards, getFilterOptions } from "@/lib/queries";
import type { CardFilters } from "@/lib/types";

export const dynamic = "force-dynamic";

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFilterValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;

  const filters: CardFilters = {
    query: getFilterValue(params.query),
    rarity: getFilterValue(params.rarity),
    set: getFilterValue(params.set),
    minPrice: getFilterValue(params.minPrice),
    maxPrice: getFilterValue(params.maxPrice),
    sort: getFilterValue(params.sort),
  };

  const { rarities, sets } = getFilterOptions();
  const cards = getCards(filters);

  return (
    <main className="space-y-6 pb-36 md:pb-10">
      <section className="hidden space-y-3 md:block">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white">Inventory</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-white">
          Browse the CardPulse catalog.
        </h1>
        <p className="max-w-2xl text-slate-400">
          Search card names or codes, then narrow the list by rarity, set, price, and sort order.
        </p>
      </section>

      <FilterBar filters={filters} rarities={rarities} sets={sets} resultCount={cards.length} />

      <section className="space-y-4">
        <div className="hidden items-center justify-between md:flex">
          <p className="text-sm text-slate-400">{cards.length} cards found</p>
        </div>
        {cards.length > 0 ? (
          <>
            <div className="space-y-3 md:hidden">
              {cards.map((card) => (
                <BrowseListItem key={card.id} card={card} />
              ))}
            </div>
            <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <CardCard key={card.id} card={card} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] px-6 py-10 text-center">
            <h3 className="font-heading text-xl font-semibold text-white">No cards match these filters.</h3>
            <p className="mt-2 text-slate-400">
              Try widening the search or clearing one of the active filters.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
