import { formatCurrency } from "@/lib/utils";
import type { CartCardInput, CartItem } from "@/lib/types";

export const CART_STORAGE_KEY = "cardpulse-cart:v1";

export function createCartItem(card: CartCardInput, quantity: number): CartItem {
  return {
    ...card,
    selected_quantity: clampCartQuantity(quantity, card.available_quantity),
  };
}

export function clampCartQuantity(quantity: number, availableQuantity: number) {
  return Math.max(1, Math.min(quantity, Math.max(1, availableQuantity)));
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.selected_quantity, 0);
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + Number(item.price_sgd) * item.selected_quantity, 0);
}

export function getCartCopyText(items: CartItem[]) {
  const lines = items.map((item, index) => {
    const unitPrice = Number(item.price_sgd);
    const lineTotal = unitPrice * item.selected_quantity;
    return `${index + 1}. ${item.card_name} (${item.card_code}) x${item.selected_quantity} @ ${formatCurrency(unitPrice)} = ${formatCurrency(lineTotal)}`;
  });

  return [
    "CARDPULSE CART",
    ...lines,
    "",
    `Total items: ${getCartItemCount(items)}`,
    `Estimated total: ${formatCurrency(getCartSubtotal(items))}`,
  ].join("\n");
}
