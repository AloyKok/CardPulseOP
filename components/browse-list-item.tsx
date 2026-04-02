import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { formatRarityLabel } from "@/lib/rarities";
import { formatCurrency } from "@/lib/utils";
import type { Card } from "@/lib/types";

type BrowseListItemProps = {
  card: Card;
};

export function BrowseListItem({ card }: BrowseListItemProps) {
  const canClaim = Boolean(card.is_available && card.quantity > 0);
  const rarityLabel = formatRarityLabel(card.rarity, card.is_alt_art);

  return (
    <article className="group">
      <Link
        href={`/cards/${card.id}`}
        className="block rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_16px_36px_rgba(0,0,0,0.16)] transition duration-200 hover:border-slate-300 hover:bg-white"
      >
        <div className="flex items-start gap-4">
          <div className="relative aspect-[3/4] w-[92px] shrink-0 overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-100 shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
            <img src={card.image_url} alt={card.card_name} className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <StatusBadge available={canClaim} />
              <div className="text-right">
                <p className="text-[1.28rem] font-semibold leading-none text-ink">
                  {formatCurrency(card.price_sgd)}
                </p>
                <span className="mt-1 inline-block text-slate-300 transition group-hover:text-slate-500">
                  →
                </span>
              </div>
            </div>

            <h3 className="mt-3 line-clamp-2 text-[1.02rem] font-semibold leading-6 text-ink">
              {card.card_name}
            </h3>
            <p className="mt-1 text-sm font-medium text-stone">{card.card_code}</p>
            <p className="mt-1 line-clamp-1 text-sm text-slate-500">{card.set_code}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                {rarityLabel}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                {card.quantity} in stock
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
