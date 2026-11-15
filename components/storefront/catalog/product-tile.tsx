"use client";

import { useState } from "react";
import { ProductCard, type ProductCardData } from "@/components/storefront/product-card";
import { useWishlistStore } from "@/stores/wishlist-store";
import { setCustomerWishlistItem } from "@/app/actions/wishlist";

export function ProductTile({ product }: { product: ProductCardData }) {
  const items = useWishlistStore((state) => state.items);
  const add = useWishlistStore((state) => state.add);
  const remove = useWishlistStore((state) => state.remove);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const saved = items.some((item) => item.productId === product.id && item.variantId === null);
  async function toggle(productId: string) {
    if (busy) return;
    setBusy(true);
    const item = { productId, variantId: null };
    try {
      const result = await setCustomerWishlistItem(item, !saved);
      if (result.status === "failed") { setNotice("Your wishlist could not be updated. Please try again."); return; }
      if (saved) remove(item); else add(item);
      setNotice(`${product.name} ${saved ? "removed from" : "saved to"} your wishlist.`);
    } catch { setNotice("Your wishlist could not be updated. Please try again."); }
    finally { setBusy(false); }
  }
  return <div><ProductCard product={product} saved={saved} wishlistBusy={busy} onToggleWishlist={toggle} /><span className="sr-only" role="status" aria-live="polite">{notice}</span></div>;
}
