import Link from "next/link";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { FreshnessBadge } from "@/components/freshness-badge";
import { formatRarityLabel } from "@/lib/rarities";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/utils";
import type { Card } from "@/lib/types";

type CardCardProps = {
  card: Card;
};

export function CardCard({ card }: CardCardProps) {
  const canClaim = card.quantity > 0;
  const rarityLabel = formatRarityLabel(card.rarity, card.is_alt_art);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_18px_38px_rgba(0,0,0,0.18)]">
      <Link href={`/cards/${card.id}`} className="block flex-1">
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
          <img
            src={card.image_url}
            alt={card.card_name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-sm">
              {rarityLabel}
            </span>
            <StatusBadge available={canClaim} />
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="space-y-1.5">
            <h3 className="line-clamp-2 min-h-[3.5rem] font-heading text-lg font-semibold leading-7 tracking-tight text-ink">
              {card.card_name}
            </h3>
            <p className="text-sm font-medium text-slate-400">{card.card_code}</p>
            <div className="flex min-h-[2.75rem] flex-wrap items-start gap-2 pt-1">
              <FreshnessBadge listedAt={card.created_at} />
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                {card.card_type}
              </span>
              <span className="line-clamp-2 text-sm leading-5 text-slate-500">{card.set_code}</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Price</p>
              <p className="text-xl font-semibold text-ink">{formatCurrency(card.price_sgd)}</p>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              {card.quantity} in stock
            </span>
          </div>
        </div>
      </Link>
      <div className="mt-auto space-y-3 px-4 pb-4">
        <AddToCartButton
          card={{
            id: card.id,
            card_name: card.card_name,
            card_code: card.card_code,
            set_code: card.set_code,
            card_type: card.card_type,
            rarity: rarityLabel,
            is_alt_art: card.is_alt_art,
            price_sgd: card.price_sgd,
            image_url: card.image_url,
            available_quantity: canClaim ? card.quantity : 0,
          }}
          compact
          className="btn-primary min-w-0 justify-center"
        />
        <Link
          href={`/cards/${card.id}`}
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-ink transition hover:border-slate-300 hover:bg-white"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
