"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { CardFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  filters: CardFilters;
  rarities: string[];
  sets: string[];
  resultCount: number;
};

const sortOptions = [
  { value: "", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A-Z" },
];

function MobileSheet({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] border-t border-slate-200 bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-5 shadow-[0_-24px_60px_rgba(0,0,0,0.55)]">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-200" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink">{title}</h2>
            <p className="mt-1 text-sm text-stone">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-stone"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-current" aria-hidden="true">
              <path d="M5 5L15 15M15 5L5 15" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FilterBar({ filters, rarities, sets, resultCount }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(filters.query ?? "");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [draftRarity, setDraftRarity] = useState(filters.rarity ?? "");
  const [draftSet, setDraftSet] = useState(filters.set ?? "");
  const [draftMinPrice, setDraftMinPrice] = useState(filters.minPrice ?? "");
  const [draftMaxPrice, setDraftMaxPrice] = useState(filters.maxPrice ?? "");

  useEffect(() => {
    setQuery(filters.query ?? "");
    setDraftRarity(filters.rarity ?? "");
    setDraftSet(filters.set ?? "");
    setDraftMinPrice(filters.minPrice ?? "");
    setDraftMaxPrice(filters.maxPrice ?? "");
  }, [filters]);

  const activeFilterCount = [filters.rarity, filters.set, filters.minPrice, filters.maxPrice].filter(Boolean)
    .length;

  const sortLabel = useMemo(
    () => sortOptions.find((option) => option.value === (filters.sort ?? ""))?.label ?? "Newest first",
    [filters.sort],
  );

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    if (nextUrl === currentUrl) {
      return;
    }

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      updateParams({ query: query.trim() });
    }, 260);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetFilters = () => {
    setDraftRarity("");
    setDraftSet("");
    setDraftMinPrice("");
    setDraftMaxPrice("");
    updateParams({
      rarity: "",
      set: "",
      minPrice: "",
      maxPrice: "",
    });
    setFilterOpen(false);
  };

  const applyFilters = () => {
    updateParams({
      rarity: draftRarity,
      set: draftSet,
      minPrice: draftMinPrice,
      maxPrice: draftMaxPrice,
    });
    setFilterOpen(false);
  };

  const sharedFieldClassName =
    "w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white";

  return (
    <>
      <section className="space-y-4">
        <div className="space-y-2 md:hidden">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-[2rem] font-semibold tracking-tight text-white">
                Browse Cards
              </h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">
              {resultCount} listed
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Search fast, scan premium hits, and build your cart without losing your place.
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 stroke-current" aria-hidden="true">
                <path d="M14.5 14.5L18 18" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="8.75" cy="8.75" r="5.75" strokeWidth="1.8" />
              </svg>
            </span>
            <input
              id="query"
              name="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search card name or code"
              className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-[15px] text-ink outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink transition hover:bg-slate-100"
            >
              Filters
              {activeFilterCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setSortOpen(true)}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink transition hover:bg-slate-100"
            >
              Sort
              <span className="truncate text-stone">{sortLabel}</span>
            </button>
          </div>

          <div className="mt-3 hidden grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] gap-3 md:grid">
            <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink">
              {resultCount} cards ready to browse
            </div>
            <select
              value={filters.rarity ?? ""}
              onChange={(event) => updateParams({ rarity: event.target.value })}
              className={sharedFieldClassName}
            >
              <option value="">All rarity</option>
              {rarities.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
            <select
              value={filters.set ?? ""}
              onChange={(event) => updateParams({ set: event.target.value })}
              className={sharedFieldClassName}
            >
              <option value="">All sets</option>
              {sets.map((set) => (
                <option key={set} value={set}>
                  {set}
                </option>
              ))}
            </select>
            <select
              value={filters.sort ?? ""}
              onChange={(event) => updateParams({ sort: event.target.value })}
              className={sharedFieldClassName}
            >
              {sortOptions.map((option) => (
                <option key={option.value || "default"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <MobileSheet
        open={filterOpen}
        title="Filter Cards"
        subtitle="Narrow inventory by rarity, set, or budget."
        onClose={() => setFilterOpen(false)}
      >
        <div className="space-y-4">
          <select
            value={draftRarity}
            onChange={(event) => setDraftRarity(event.target.value)}
            className={sharedFieldClassName}
          >
            <option value="">All rarity</option>
            {rarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
          <select
            value={draftSet}
            onChange={(event) => setDraftSet(event.target.value)}
            className={sharedFieldClassName}
          >
            <option value="">All sets</option>
            {sets.map((set) => (
              <option key={set} value={set}>
                {set}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={draftMinPrice}
              onChange={(event) => setDraftMinPrice(event.target.value)}
              placeholder="Min SGD"
              className={sharedFieldClassName}
            />
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={draftMaxPrice}
              onChange={(event) => setDraftMaxPrice(event.target.value)}
              placeholder="Max SGD"
              className={sharedFieldClassName}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-ink"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-black px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]"
            >
              Apply filters
            </button>
          </div>
        </div>
      </MobileSheet>

      <MobileSheet
        open={sortOpen}
        title="Sort Results"
        subtitle="Choose the order that helps you scan faster."
        onClose={() => setSortOpen(false)}
      >
        <div className="space-y-2">
          {sortOptions.map((option) => {
            const active = (filters.sort ?? "") === option.value;

            return (
              <button
                key={option.value || "default"}
                type="button"
                onClick={() => {
                  updateParams({ sort: option.value });
                  setSortOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-[1.2rem] border px-4 py-3 text-left text-sm transition",
                  active
                    ? "border-slate-900 bg-slate-100 text-ink"
                    : "border-slate-200 bg-slate-50 text-stone",
                )}
              >
                <span>{option.label}</span>
                {active ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 stroke-current" aria-hidden="true">
                      <path d="M4.5 10.5L8 14L15.5 6.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </MobileSheet>
    </>
  );
}
