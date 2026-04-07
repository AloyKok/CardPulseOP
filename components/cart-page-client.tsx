"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart-provider";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { getTelegramProfileLink, getTelegramUsernameDisplay } from "@/lib/telegram";
import { formatCurrency } from "@/lib/utils";

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

const TELEGRAM_USERNAME = getTelegramUsernameDisplay();
const TELEGRAM_URL = getTelegramProfileLink();

export function CartPageClient() {
  const { items, hydrated, itemCount, subtotal, copyText: cartText, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyText(cartText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleTelegramCheckout = () => {
    trackAnalyticsEvent({
      event_name: "telegram_checkout_clicked",
      metadata: {
        item_count: itemCount,
        cart_size: items.length,
        subtotal,
      },
    });
    window.location.href = TELEGRAM_URL;
  };

  if (!hydrated) {
    return (
      <main className="pb-10">
        <section className="card-shell rounded-[2rem] p-6">
          <p className="text-stone">Loading cart...</p>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="pb-10">
        <section className="card-shell rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white">Cart</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink">
            Your cart is empty.
          </h1>
          <p className="mt-3 max-w-xl text-stone">
            Add cards from the browse page or a card detail page, then copy the list and send it in
            Telegram to {TELEGRAM_USERNAME}.
          </p>
          <Link href="/browse" className="btn-primary mt-6">
            Browse inventory
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6 pb-10">
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white">Cart</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-ink">
          Review your claim list.
        </h1>
        <p className="max-w-2xl text-stone">
          Adjust quantities, copy the cart text, then paste it into Telegram and send it to {TELEGRAM_USERNAME}.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card-shell overflow-hidden rounded-[1.75rem]">
          <div className="divide-y divide-slate-200">
            {items.map((item) => (
              <article key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={item.image_url}
                    alt={item.card_name}
                    className="aspect-[3/4] w-[88px] shrink-0 rounded-2xl object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="line-clamp-2 text-[1.05rem] font-semibold leading-6 text-ink">
                          {item.card_name}
                        </h2>
                        <p className="mt-1 text-sm text-stone">{item.card_code}</p>
                      </div>
                      <p className="text-base font-semibold text-ink">
                        {formatCurrency(item.price_sgd * item.selected_quantity)}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone">
                      <span>{item.rarity}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.card_type}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.set_code}</span>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            item.selected_quantity === 1
                              ? removeFromCart(item.id)
                              : updateQuantity(
                                  item.id,
                                  item.selected_quantity - 1,
                                  item.available_quantity,
                                )
                          }
                          className="px-3 py-2 text-lg text-stone sm:px-4"
                        >
                          −
                        </button>
                        <span className="min-w-12 text-center text-sm font-semibold text-ink">
                          {item.selected_quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.selected_quantity + 1, item.available_quantity)
                          }
                          disabled={item.selected_quantity >= item.available_quantity}
                          className="px-3 py-2 text-lg text-stone disabled:opacity-30 sm:px-4"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <p className="text-sm text-stone">
                          {formatCurrency(item.price_sgd)} each · {item.available_quantity} available
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm font-medium text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="card-shell h-fit rounded-[1.75rem] p-5">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone">Summary</p>
              <p className="mt-2 font-heading text-3xl font-semibold text-ink">
                {itemCount} item{itemCount > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-stone">Estimated total: {formatCurrency(subtotal)}</p>
            </div>

            <button type="button" onClick={handleCopy} className="btn-primary w-full">
              {copied ? "Copied" : "Copy cart items"}
            </button>
            <p className="text-center text-sm text-stone">
              After copying, open Telegram and message <span className="font-semibold text-ink">{TELEGRAM_USERNAME}</span>.
            </p>
            <button type="button" onClick={handleTelegramCheckout} className="btn-secondary w-full justify-center">
              Open Telegram
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="btn-secondary w-full justify-center"
            >
              Clear cart
            </button>

            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone">Copied text preview</p>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{cartText}</pre>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
