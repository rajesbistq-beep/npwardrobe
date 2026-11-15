"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Mirrors wishlist_items: product is required and variant is optional. */
export type GuestWishlistItem = {
  productId: string;
  variantId: string | null;
};

type WishlistState = {
  items: GuestWishlistItem[];
  add: (item: GuestWishlistItem) => void;
  remove: (item: GuestWishlistItem) => void;
  replaceItems: (items: GuestWishlistItem[]) => void;
  clear: () => void;
};

const keyOf = ({ productId, variantId }: GuestWishlistItem) =>
  `${productId}:${variantId ?? "product"}`;

/** Guest favorites contain catalogue identifiers only and can later merge with a signed-in wishlist. */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => {
        if (!item.productId) return;
        set((state) =>
          state.items.some((saved) => keyOf(saved) === keyOf(item))
            ? state
            : { items: [...state.items, item] },
        );
      },
      remove: (item) =>
        set((state) => ({
          items: state.items.filter((saved) => keyOf(saved) !== keyOf(item)),
        })),
      replaceItems: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "np-wardrobe-wishlist-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Call after mount to avoid server/client markup mismatches during persistence hydration. */
export const hydrateWishlistStore = () => useWishlistStore.persist.rehydrate();
