"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { normalizeCardType } from "@/lib/card-types";
import {
  CART_STORAGE_KEY,
  clampCartQuantity,
  createCartItem,
  getCartCopyText,
  getCartItemCount,
  getCartSubtotal,
} from "@/lib/cart";
import type { CartCardInput, CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  copyText: string;
  addToCart: (card: CartCardInput, quantity: number) => void;
  updateQuantity: (id: number, quantity: number, availableQuantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        setItems(
          parsed.map((item) => ({
            ...item,
            card_type: normalizeCardType(String(item.card_type ?? "")),
          })),
        );
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const addToCart = (card: CartCardInput, quantity: number) => {
      if (card.available_quantity <= 0) {
        return;
      }

      setItems((current) => {
        const existing = current.find((item) => item.id === card.id);

        if (!existing) {
          return [...current, createCartItem(card, quantity)];
        }

        return current.map((item) =>
          item.id === card.id
            ? {
                ...item,
                available_quantity: card.available_quantity,
                selected_quantity: clampCartQuantity(
                  item.selected_quantity + quantity,
                  card.available_quantity,
                ),
              }
            : item,
        );
      });
    };

    const updateQuantity = (id: number, quantity: number, availableQuantity: number) => {
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                available_quantity: availableQuantity,
                selected_quantity: clampCartQuantity(quantity, availableQuantity),
              }
            : item,
        ),
      );
    };

    const removeFromCart = (id: number) => {
      setItems((current) => current.filter((item) => item.id !== id));
    };

    const clearCart = () => {
      setItems([]);
    };

    return {
      items,
      hydrated,
      itemCount: getCartItemCount(items),
      subtotal: getCartSubtotal(items),
      copyText: getCartCopyText(items),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    };
  }, [hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
