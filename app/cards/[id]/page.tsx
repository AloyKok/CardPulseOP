import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { FreshnessBadge } from "@/components/freshness-badge";
import { getFreshnessContext } from "@/lib/freshness";
import { formatRarityLabel } from "@/lib/rarities";
import { StatusBadge } from "@/components/status-badge";
import { getCardById } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CardDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = await params;
  const card = await getCardById(Number(id));

  if (!card) {
    notFound();
  }

  const canClaim = card.quantity > 0;
  const rarityLabel = formatRarityLabel(card.rarity, card.is_alt_art);
  const freshnessContext = getFreshnessContext(card.created_at);

  return (
    <main className="pb-10">
      <div className="mb-6">
        <Link href="/browse" className="text-sm font-medium text-white hover:text-slate-300">
          ← Back to browse
        </Link>
      </div>
      <section className="grid gap-6 rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-panel sm:p-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="mx-auto w-full max-w-[230px] overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-sm lg:mx-0 lg:max-w-[280px]">
          <img
            src={card.image_url}
            alt={card.card_name}
            className="aspect-[3/4] h-full w-full object-cover"
          />
        </div>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill bg-slate-100 text-slate-700">{card.card_type}</span>
            <span className="pill bg-slate-100 text-ink">{rarityLabel}</span>
            <span className="pill bg-slate-100 text-slate-700">{card.set_code}</span>
            <StatusBadge available={canClaim} />
            <FreshnessBadge listedAt={card.created_at} />
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-[2rem]">
              {card.card_name}
            </h1>
            <p className="text-base text-stone">{card.card_code}</p>
            {freshnessContext ? <p className="text-sm font-medium text-slate-500">{freshnessContext}</p> : null}
            <p className="font-heading text-3xl font-semibold text-ink">
              {formatCurrency(card.price_sgd)}
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-slate-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">
              Ready to claim
            </p>
            <div className="mt-4">
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
                className={`btn-primary w-full justify-center text-center sm:min-w-[180px] ${
                  canClaim ? "" : "cursor-not-allowed opacity-40"
                }`}
              />
            </div>
            <p className="mt-3 text-sm text-stone">
              Add this card to your cart, then copy your cart list and send it in Telegram manually.
            </p>
          </div>

          <dl className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-stone">Card Type</dt>
              <dd className="mt-1 font-medium text-ink">{card.card_type}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-stone">Character</dt>
              <dd className="mt-1 font-medium text-ink">{card.character}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-stone">Language</dt>
              <dd className="mt-1 font-medium text-ink">{card.language}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-stone">Condition</dt>
              <dd className="mt-1 font-medium text-ink">{card.condition}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-stone">Stock Quantity</dt>
              <dd className="mt-1 font-medium text-ink">{card.quantity}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-stone">Listed</dt>
              <dd className="mt-1 font-medium text-ink">{formatDate(card.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-stone">Availability</dt>
              <dd className="mt-1 font-medium text-ink">{canClaim ? "Available" : "Sold Out"}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
