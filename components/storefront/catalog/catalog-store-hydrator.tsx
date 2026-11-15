"use client";

import { useEffect } from "react";
import { hydrateCartStore } from "@/stores/cart-store";
import { hydrateWishlistStore } from "@/stores/wishlist-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { syncCustomerState } from "@/app/actions/auth";

export function CatalogStoreHydrator() {
  useEffect(() => {
    void (async () => {
      await Promise.all([hydrateCartStore(), hydrateWishlistStore()]);
      const current = useWishlistStore.getState().items;
      const merged = await syncCustomerState([], current);
      if (merged.status === "synchronized") useWishlistStore.getState().replaceItems(merged.wishlistItems ?? []);
    })();
  }, []);
  return null;
}
