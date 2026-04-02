"use client";

import { useState } from "react";

import { useCart } from "@/components/cart-provider";
import type { CartCardInput } from "@/lib/types";

type AddToCartButtonProps = {
  card: CartCardInput;
  className?: string;
  label?: string;
  compact?: boolean;
};

export function AddToCartButton({
  card,
  className,
  label = "CLAIM",
  compact = false,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isDisabled = card.available_quantity <= 0;
  const canDecrease = quantity > 1;
  const canIncrease = quantity < card.available_quantity;
  const layoutClassName = compact
    ? "flex-row items-stretch"
    : "flex-col items-center sm:flex-row sm:items-center";
  const selectorClassName = compact
    ? "inline-flex min-w-[116px] items-center justify-between overflow-hidden rounded-full border border-slate-200 bg-white"
    : "inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm";
  const buttonClassName = compact
    ? `${className ?? "btn-primary"} flex-1 justify-center`
    : className ?? "btn-primary";

  return (
    <div className={`flex gap-3 ${layoutClassName}`}>
      <div className={selectorClassName}>
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          disabled={!canDecrease || isDisabled}
          className="px-3 py-3 text-lg text-stone disabled:opacity-30 sm:px-4"
        >
          −
        </button>
        <span className="min-w-12 text-center text-sm font-semibold text-ink">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.min(card.available_quantity, current + 1))}
          disabled={!canIncrease || isDisabled}
          className="px-3 py-3 text-lg text-stone disabled:opacity-30 sm:px-4"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          addToCart(card, quantity);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1500);
        }}
        disabled={isDisabled}
        className={`${buttonClassName} ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
      >
        {isDisabled ? "Sold" : added ? "Added" : `${label} (${quantity})`}
      </button>
    </div>
  );
}
