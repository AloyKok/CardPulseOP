"use client";

import Link from "next/link";

import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { formatRarityLabel } from "@/lib/rarities";
import type { Card } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type RelatedCardProps = {
  card: Card;
  currentCardId: number;
};

export function RelatedCard({ card, currentCardId }: RelatedCardProps) {
  const rarityLabel = formatRarityLabel(card.rarity, card.is_alt_art);

  return (
    <Link
      href={`/cards/${card.id}`}
      onClick={() =>
        trackAnalyticsEvent({
          event_name: "related_product_clicked",
          card_id: card.id,
          metadata: {
            current_card_id: currentCardId,
            clicked_card_id: card.id,
            set_code: card.set_code,
          },
        })
      }
      className="group flex min-w-0 flex-col overflow-hidden rounded-[1.45rem] border border-slate-200 bg-white shadow-[0_14px_28px_rgba(0,0,0,0.14)] transition hover:border-slate-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={card.image_url}
          alt={card.card_name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full border border-slate-200 bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
            {rarityLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="space-y-1">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-[0.95rem] font-semibold leading-5 text-ink">
            {card.card_name}
          </h3>
          <p className="line-clamp-1 text-xs font-medium text-slate-400">{card.card_code}</p>
        </div>
        <p className="mt-auto text-lg font-semibold leading-none text-ink">
          {formatCurrency(card.price_sgd)}
        </p>
      </div>
    </Link>
  );
}
