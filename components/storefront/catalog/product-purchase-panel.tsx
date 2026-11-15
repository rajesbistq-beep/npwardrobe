"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/shared/price-display";
import { ColourSwatch, SizeSelector } from "@/components/storefront/variant-selectors";
import { QuantityStepper } from "@/components/storefront/quantity-stepper";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { setCustomerWishlistItem } from "@/app/actions/wishlist";

type VariantOption = { code: string; name: string; value: string; label: string; attributeValueId: string; swatchHex: string | null };
export type PurchaseVariant = { id: string; currentPrice: number; compareAtPrice: number | null; priceAmbiguous: boolean; options: VariantOption[]; media: { publicUrl: string | null; altText: string | null }[] };

export function ProductPurchasePanel({ productId, productName, basePrice, baseCompareAt, variants, sizeGuideHref, onVariantMediaChange }: {
  productId: string; productName: string; basePrice: number; baseCompareAt: number | null; variants: PurchaseVariant[]; sizeGuideHref?: string; onVariantMediaChange?: (images: { src: string; alt: string }[]) => void;
}) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const addVariant = useCartStore((state) => state.addVariant);
  const savedItems = useWishlistStore((state) => state.items);
  const addWish = useWishlistStore((state) => state.add);
  const removeWish = useWishlistStore((state) => state.remove);
  const groups = useMemo(() => {
    const values = new Map<string, Map<string, VariantOption>>();
    for (const variant of variants) for (const option of variant.options) {
      const group = values.get(option.code) ?? new Map<string, VariantOption>();
      group.set(option.attributeValueId, option); values.set(option.code, group);
    }
    return [...values.entries()].map(([code, options]) => ({ code, name: [...options.values()][0]?.name ?? code, options: [...options.values()] }));
  }, [variants]);
  const candidates = (selection: Record<string, string>) => variants.filter((variant) => Object.entries(selection).every(([code, valueId]) => variant.options.some((option) => option.code === code && option.attributeValueId === valueId)));
  const selectedVariant = variants.find((variant) => groups.every(({ code }) => selectedValues[code]) && variant.options.every((option) => selectedValues[option.code] === option.attributeValueId));
  const price = selectedVariant?.currentPrice ?? basePrice;
  const compareAt = selectedVariant ? selectedVariant.compareAtPrice : baseCompareAt;
  const variantImages = useMemo(() => selectedVariant?.media.flatMap((image) => image.publicUrl ? [{ src: image.publicUrl, alt: image.altText || productName }] : []) ?? [], [selectedVariant, productName]);
  useEffect(() => { onVariantMediaChange?.(variantImages); }, [onVariantMediaChange, variantImages]);
  const wishItem = { productId, variantId: selectedVariant?.id ?? null };
  const saved = savedItems.some((item) => item.productId === productId && item.variantId === wishItem.variantId);

  function choose(code: string, valueId: string) {
    const proposed = { ...selectedValues, [code]: valueId };
    const matches = candidates(proposed);
    if (!matches.length) return;
    const compatible: Record<string, string> = { [code]: valueId };
    for (const [otherCode, otherValue] of Object.entries(selectedValues)) {
      if (otherCode !== code && matches.some((variant) => variant.options.some((option) => option.code === otherCode && option.attributeValueId === otherValue))) compatible[otherCode] = otherValue;
    }
    setSelectedValues(compatible); setMessage("");
  }

  function addToBag() {
    if (selectedVariant?.priceAmbiguous) { setMessage("This variant price needs confirmation. Please contact the store before adding it to your bag."); return; }
    if (!selectedVariant) { setMessage(groups.length ? "Choose a valid option combination first." : "This product has no active sellable variant at the moment."); return; }
    const before = useCartStore.getState().items;
    const existing = before.find((item) => item.variantId === selectedVariant.id);
    if (existing && existing.quantity + quantity > 99) { setMessage("The bag limit for this variant is 99."); return; }
    addVariant(selectedVariant.id, quantity);
    const after = useCartStore.getState().items;
    if (after.find((item) => item.variantId === selectedVariant.id)?.quantity !== (existing?.quantity ?? 0) + quantity) { setMessage("The item could not be added. Please try again."); return; }
    setMessage(`${productName} added to your bag.`);
  }

  async function toggleWishlist() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await setCustomerWishlistItem(wishItem, !saved);
      if (result.status === "failed") { setMessage("Your wishlist could not be updated. Please try again."); return; }
      if (saved) removeWish(wishItem); else addWish(wishItem);
      setMessage(saved ? "Removed from your wishlist." : "Saved to your wishlist.");
    } catch { setMessage("Your wishlist could not be updated. Please try again."); }
    finally { setBusy(false); }
  }

  return <section className="product-purchase" aria-label="Product options and purchase">
    {selectedVariant?.priceAmbiguous ? <p className="catalog-query-warning" role="status">Price confirmation is required for this option.</p> : <PriceDisplay amount={price} compareAt={compareAt} />}
    {groups.map((group) => {
      const possible = candidates(Object.fromEntries(Object.entries(selectedValues).filter(([code]) => code !== group.code)));
      const optionProps = group.options.map((option) => ({ id: option.attributeValueId, label: option.label, available: possible.some((variant) => variant.options.some((candidate) => candidate.code === group.code && candidate.attributeValueId === option.attributeValueId)) }));
      if (group.code === "size") return <div key={group.code}><SizeSelector options={optionProps} value={selectedValues[group.code]} onChange={(id) => choose(group.code, id)} />{sizeGuideHref && <a className="product-size-guide" href={sizeGuideHref}>View size guide</a>}</div>;
      if (group.code === "colour") return <ColourSwatch key={group.code} options={group.options.map((option) => ({ id: option.attributeValueId, label: option.label, available: optionProps.find(({ id }) => id === option.attributeValueId)?.available ?? false, colour: option.swatchHex ?? "#D8CFCC" }))} value={selectedValues[group.code]} onChange={(id) => choose(group.code, id)} />;
      return <fieldset className="variant-selector" key={group.code}><legend className="type-label-md">{group.name}</legend><div className="variant-selector__options">{optionProps.map((option) => <button key={option.id} type="button" className={`size-option${selectedValues[group.code] === option.id ? " is-selected" : ""}`} aria-pressed={selectedValues[group.code] === option.id} disabled={!option.available} onClick={() => choose(group.code, option.id)}>{option.label}</button>)}</div></fieldset>;
    })}
    <p className="product-availability">Availability is confirmed during checkout.</p>
    <div className="product-purchase__actions"><QuantityStepper value={quantity} onChange={setQuantity} min={1} max={99} /><Button onClick={addToBag} disabled={variants.length === 0 || selectedVariant?.priceAmbiguous}>Add to Bag</Button><Button type="button" variant="secondary" aria-pressed={saved} onClick={toggleWishlist} disabled={busy}>{saved ? "Saved" : "Save"}</Button></div>
    <p className="product-purchase__notice" role="status" aria-live="polite">{message}</p>
  </section>;
}
