import Link from "next/link";

import { formatRarityLabel } from "@/lib/rarities";
import type { Card } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type NewArrivalCardProps = {
  card: Card;
};

export function NewArrivalCard({ card }: NewArrivalCardProps) {
  const rarityLabel = formatRarityLabel(card.rarity, card.is_alt_art);

  return (
    <Link
      href={`/cards/${card.id}`}
      className="group flex h-[214px] flex-col overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white p-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.14)] transition hover:border-slate-300"
    >
      <div className="relative mx-auto aspect-[4/5] w-[76px] overflow-hidden rounded-[0.95rem] bg-slate-100 shadow-[0_10px_18px_rgba(15,23,42,0.12)]">
        <img
          src={card.image_url}
          alt={card.card_name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-2.5 flex flex-1 flex-col text-center">
        <div className="min-h-[88px]">
          <h3 className="line-clamp-2 text-[0.88rem] font-semibold leading-5 text-ink">{card.card_name}</h3>
          <p className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-400">{card.card_code}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {rarityLabel}
          </p>
        </div>
        <div className="mt-auto pt-3">
          <p className="text-[1.2rem] font-semibold leading-none text-ink">{formatCurrency(card.price_sgd)}</p>
        </div>
      </div>
    </Link>
  );
}
