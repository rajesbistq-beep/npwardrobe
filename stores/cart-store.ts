"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type GuestCartItem = {
  variantId: string;
  quantity: number;
};

type CartState = {
  items: GuestCartItem[];
  addVariant: (variantId: string, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeVariant: (variantId: string) => void;
  replaceItems: (items: GuestCartItem[]) => void;
  clear: () => void;
};

function validItems(items: GuestCartItem[]): GuestCartItem[] {
  return items.filter(
    (item) =>
      item.variantId.length > 0 &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 99,
  );
}

/** Guest cart persisted locally; checkout must reprice and recheck availability on the server. */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addVariant: (variantId, quantity = 1) => {
        if (!variantId || !Number.isInteger(quantity) || quantity <= 0) return;
        set((state) => {
          const existing = state.items.find((item) => item.variantId === variantId);
          if (existing && existing.quantity + quantity > 99) return state;
          if (!existing && quantity > 99) return state;
          return {
            items: existing
              ? state.items.map((item) =>
                  item.variantId === variantId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item,
                )
              : [...state.items, { variantId, quantity }],
          };
        });
      },
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity > 0 && Number.isInteger(quantity) && quantity <= 99
              ? state.items.map((item) =>
                  item.variantId === variantId ? { ...item, quantity } : item,
                )
              : state.items.filter((item) => item.variantId !== variantId),
        })),
      removeVariant: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      replaceItems: (items) => set({ items: validItems(items) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "np-wardrobe-cart-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Call after mount to avoid rendering server/client markup from different persisted state. */
export const hydrateCartStore = () => useCartStore.persist.rehydrate();
