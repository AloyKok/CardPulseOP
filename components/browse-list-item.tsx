import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { formatRarityLabel } from "@/lib/rarities";
import { formatCurrency } from "@/lib/utils";
import type { Card } from "@/lib/types";

type BrowseListItemProps = {
  card: Card;
};

export function BrowseListItem({ card }: BrowseListItemProps) {
  const canClaim = card.quantity > 0;
  const rarityLabel = formatRarityLabel(card.rarity, card.is_alt_art);

  return (
    <article className="group">
      <Link
        href={`/cards/${card.id}`}
        className="block rounded-[1.65rem] border border-slate-200 bg-white p-3.5 shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition duration-200 hover:border-slate-300 hover:bg-white"
      >
        <div className="flex items-start gap-3.5">
          <div className="relative aspect-[3/4] w-[88px] shrink-0 overflow-hidden rounded-[1.15rem] border border-slate-200 bg-slate-100 shadow-[0_12px_24px_rgba(15,23,42,0.12)]">
            <img src={card.image_url} alt={card.card_name} className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <StatusBadge available={canClaim} />
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Price</p>
                <p className="mt-1 text-[1.35rem] font-semibold leading-none text-ink">
                  {formatCurrency(card.price_sgd)}
                </p>
              </div>
            </div>

            <h3 className="mt-3 line-clamp-2 text-[1.04rem] font-semibold leading-6 text-ink">
              {card.card_name}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-400">{card.card_code}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                {card.card_type}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
                {rarityLabel}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                {card.quantity} in stock
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
