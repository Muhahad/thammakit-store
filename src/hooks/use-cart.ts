"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client-side cart store (guest + logged-in). Persisted to localStorage so a
 * guest keeps their cart across reloads. On login, the guest cart is merged into
 * the DB cart via a server action (see lib/actions/cart.ts).
 */
export interface CartLineItem {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number; // satang
  quantity: number;
  maxQuantity: number; // available stock
}

interface CartState {
  items: CartLineItem[];
  isOpen: boolean;
  add: (item: Omit<CartLineItem, "quantity">, qty?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  /** Total number of units in the cart (for the header badge). */
  count: () => number;
  /** Subtotal in satang. */
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const quantity = Math.min(existing.quantity + qty, item.maxQuantity);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity } : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(qty, item.maxQuantity) }],
            isOpen: true,
          };
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQuantity: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxQuantity)) } : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "thammakit-cart" },
  ),
);
