"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProductFilterDrawer, type FilterOption } from "@/components/storefront/product-filter-drawer";

export type CatalogFilterAttribute = { code: string; options: FilterOption[] };
const sortOptions: FilterOption[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price_asc", label: "Price: low to high (base product price)" },
  { id: "price_desc", label: "Price: high to low (base product price)" },
];

export function CatalogControls({ search, sort, attributes, selectedValues, minPrice, maxPrice, activeCount, categories, categorySlug }: {
  search: string; sort: string; attributes: CatalogFilterAttribute[]; selectedValues: Record<string, string[]>; minPrice?: number; maxPrice?: number; activeCount: number; categories?: FilterOption[]; categorySlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(selectedValues);
  const [draftSort, setDraftSort] = useState(sort);
  const [draftMin, setDraftMin] = useState(minPrice?.toString() ?? "");
  const [draftMax, setDraftMax] = useState(maxPrice?.toString() ?? "");
  const [draftCategory, setDraftCategory] = useState(categorySlug ?? "");
  const router = useRouter();
  const pathname = usePathname();
  const toggle = (code: string, id: string) => setDraft((current) => {
    const values = current[code] ?? [];
    return { ...current, [code]: values.includes(id) ? values.filter((value) => value !== id) : [...values, id] };
  });
  function apply() {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (draftCategory) query.set("category", draftCategory);
    if (draftSort !== "featured") query.set("sort", draftSort);
    for (const [code, ids] of Object.entries(draft)) for (const id of ids) query.append(code, id);
    if (draftMin) query.set("minPrice", draftMin);
    if (draftMax) query.set("maxPrice", draftMax);
    router.push(`${pathname}${query.size ? `?${query.toString()}` : ""}`);
    setOpen(false);
  }
  function reset() {
    setDraft({}); setDraftSort("featured"); setDraftMin(""); setDraftMax(""); setDraftCategory("");
    const query = new URLSearchParams(); if (search) query.set("q", search);
    router.push(`${pathname}${query.size ? `?${query.toString()}` : ""}`); setOpen(false);
  }
  const sizeOptions = attributes.find(({ code }) => code === "size")?.options;
  const colourOptions = attributes.find(({ code }) => code === "colour")?.options;
  return <div className="catalog-controls">
    <label className="catalog-controls__sort">Sort by <select value={sort} onChange={(event) => { const query = new URLSearchParams(window.location.search); query.set("sort", event.currentTarget.value); query.delete("page"); router.push(`${pathname}?${query.toString()}`); }}>
      {sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select></label>
    <button className="ui-button ui-button--secondary" type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>Filter{activeCount ? ` (${activeCount})` : ""}</button>
    <ProductFilterDrawer open={open} onClose={() => setOpen(false)} onApply={apply} onReset={reset} sortOptions={sortOptions} sortValue={draftSort} onSortChange={setDraftSort} sizes={sizeOptions} selectedSizeIds={draft.size ?? []} onSizeToggle={(id) => toggle("size", id)} colours={colourOptions} selectedColourIds={draft.colour ?? []} onColourToggle={(id) => toggle("colour", id)}>
      {categories && <fieldset className="filter-group"><legend className="type-label-md">Category</legend><label className="catalog-category-select">Choose category<select className="ui-input" value={draftCategory} onChange={(event) => setDraftCategory(event.currentTarget.value)}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label></fieldset>}
      <fieldset className="filter-group"><legend className="type-label-md">Price range · base product price</legend><div className="catalog-price-fields"><label>Minimum NPR <input className="ui-input" type="number" min="0" max="10000000" value={draftMin} onChange={(event) => setDraftMin(event.currentTarget.value)} /></label><label>Maximum NPR <input className="ui-input" type="number" min="0" max="10000000" value={draftMax} onChange={(event) => setDraftMax(event.currentTarget.value)} /></label></div></fieldset>
    </ProductFilterDrawer>
  </div>;
}
