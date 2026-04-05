import Link from "next/link";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatRarityLabel } from "@/lib/rarities";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/utils";
import type { Card } from "@/lib/types";

type CardCardProps = {
  card: Card;
};

export function CardCard({ card }: CardCardProps) {
  const canClaim = Boolean(card.is_available && card.quantity > 0);
  const rarityLabel = formatRarityLabel(card.rarity, card.is_alt_art);

  return (
    <article className="card-shell group flex h-full flex-col overflow-hidden rounded-[1.75rem]">
      <Link href={`/cards/${card.id}`} className="block flex-1">
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
          <img
            src={card.image_url}
            alt={card.card_name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="pill bg-white/90 text-slate-700">{rarityLabel}</span>
            <StatusBadge available={canClaim} />
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="space-y-1.5">
            <h3 className="line-clamp-2 min-h-[3.5rem] font-heading text-lg font-semibold leading-7 tracking-tight text-ink">
              {card.card_name}
            </h3>
            <p className="text-sm font-medium text-stone">{card.card_code}</p>
            <p className="line-clamp-2 min-h-[2.75rem] text-sm leading-5 text-slate-500">
              {card.set_code}
            </p>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone">Price</p>
              <p className="text-xl font-semibold text-ink">{formatCurrency(card.price_sgd)}</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-stone">{card.quantity} in stock</span>
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
            rarity: rarityLabel,
            is_alt_art: card.is_alt_art,
            price_sgd: card.price_sgd,
            image_url: card.image_url,
            available_quantity: canClaim ? card.quantity : 0,
          }}
          compact
          className="btn-primary min-w-0 justify-center"
        />
        <Link href={`/cards/${card.id}`} className="btn-secondary w-full justify-center">
          Details
        </Link>
      </div>
    </article>
  );
}
