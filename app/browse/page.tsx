import Link from "next/link";
import { redirect } from "next/navigation";

import { BrowseListItem } from "@/components/browse-list-item";
import { CardCard } from "@/components/card-card";
import { FilterBar } from "@/components/filter-bar";
import { NewArrivalsCarousel } from "@/components/new-arrivals-carousel";
import { getCards, getFilterOptions, getNewArrivalCards } from "@/lib/queries";
import type { CardFilters } from "@/lib/types";

export const dynamic = "force-dynamic";

const CARDS_PER_PAGE = 20;

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFilterValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const pageParam = Number(getFilterValue(params.page));
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const filters: CardFilters = {
    query: getFilterValue(params.query),
    rarity: getFilterValue(params.rarity),
    aa: getFilterValue(params.aa),
    type: getFilterValue(params.type),
    set: getFilterValue(params.set),
    minPrice: getFilterValue(params.minPrice),
    maxPrice: getFilterValue(params.maxPrice),
    sort: getFilterValue(params.sort),
  };

  const showNewArrivals =
    currentPage === 1 &&
    !filters.query &&
    !filters.rarity &&
    !filters.aa &&
    !filters.type &&
    !filters.set &&
    !filters.minPrice &&
    !filters.maxPrice &&
    (!filters.sort || filters.sort === "");

  const [{ rarities, sets, types }, paginatedCards, newArrivals] = await Promise.all([
    getFilterOptions(),
    getCards(filters, currentPage, CARDS_PER_PAGE),
    showNewArrivals ? getNewArrivalCards(6) : Promise.resolve([]),
  ]);
  const { cards, totalCount, totalPages, page } = paginatedCards;

  const baseParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const resolved = Array.isArray(value) ? value[0] : value;

    if (!resolved || key === "page") {
      continue;
    }

    baseParams.set(key, resolved);
  }

  const getPageHref = (nextPage: number) => {
    const nextParams = new URLSearchParams(baseParams.toString());

    if (nextPage > 1) {
      nextParams.set("page", String(nextPage));
    }

    const query = nextParams.toString();
    return query ? `/browse?${query}` : "/browse";
  };

  if (totalCount > 0 && currentPage > totalPages) {
    redirect(getPageHref(totalPages));
  }

  return (
    <main className="space-y-5 pb-40 md:space-y-6 md:pb-12">
      {showNewArrivals && newArrivals.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Fresh drops</p>
              <h2 className="font-heading text-[1.35rem] font-semibold tracking-tight text-white">New Arrivals</h2>
              <p className="text-[13px] text-slate-400">Freshly added cards</p>
            </div>
          </div>
          <NewArrivalsCarousel cards={newArrivals} />
        </section>
      ) : null}

      <section className="hidden space-y-3 md:block">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white">Inventory</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-white">
          Browse the CardPulse catalog.
        </h1>
        <p className="max-w-2xl text-slate-400">
          Search card names or codes, then narrow the list by type, rarity, set, price, and sort order.
        </p>
      </section>

      <FilterBar
        filters={filters}
        rarities={rarities}
        types={types}
        sets={sets}
        resultCount={totalCount}
      />

      <section className="space-y-4 pt-1">
        <div className="hidden items-center justify-between md:flex">
          <p className="text-sm text-slate-400">
            {totalCount} cards found
            {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
          </p>
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
            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-white">
                <Link
                  href={getPageHref(page - 1)}
                  className={`inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 text-sm font-medium transition ${
                    page > 1
                      ? "border-white/15 bg-white/8 hover:bg-white/12"
                      : "pointer-events-none border-white/8 bg-white/5 text-white/35"
                  }`}
                >
                  Previous
                </Link>
                <p className="text-sm font-medium text-slate-300">
                  Page {page} of {totalPages}
                </p>
                <Link
                  href={getPageHref(page + 1)}
                  className={`inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 text-sm font-medium transition ${
                    page < totalPages
                      ? "border-white/15 bg-white/8 hover:bg-white/12"
                      : "pointer-events-none border-white/8 bg-white/5 text-white/35"
                  }`}
                >
                  Next
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] px-6 py-10 text-center shadow-[0_20px_46px_rgba(0,0,0,0.28)]">
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
