"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
export type FilterOption = { id: string; label: string };
export function ProductFilterDrawer({ open, title = "Filter & sort", onClose, onApply, onReset, sortOptions, sortValue, onSortChange, sizes, selectedSizeIds = [], onSizeToggle, colours, selectedColourIds = [], onColourToggle, availabilityOptions, availabilityValue, onAvailabilityChange, priceRange, children }: {
  open: boolean; title?: string; onClose: () => void; onApply: () => void; onReset: () => void; children?: ReactNode;
  sortOptions?: FilterOption[]; sortValue?: string; onSortChange?: (value: string) => void;
  sizes?: FilterOption[]; selectedSizeIds?: string[]; onSizeToggle?: (id: string) => void;
  colours?: FilterOption[]; selectedColourIds?: string[]; onColourToggle?: (id: string) => void;
  availabilityOptions?: FilterOption[]; availabilityValue?: string; onAvailabilityChange?: (value: string) => void;
  priceRange?: { min: number; max: number; value: [number, number]; onChange: (value: [number, number]) => void };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = dialogRef.current; if (!dialog) return; if (open && !dialog.open) dialog.showModal(); if (!open && dialog.open) dialog.close(); }, [open]);
  return <dialog ref={dialogRef} className="filter-drawer" aria-labelledby="filter-drawer-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={onClose}>
    <header className="filter-drawer__header"><h2 id="filter-drawer-title" className="type-headline-sm">{title}</h2><button type="button" className="filter-drawer__close" aria-label="Close filters" onClick={onClose}>×</button></header>
    <div className="filter-drawer__body">
      {sortOptions && onSortChange && <FilterGroup title="Sort by"><label className="sr-only" htmlFor="product-sort">Sort products</label><select className="ui-input" id="product-sort" value={sortValue ?? ""} onChange={(event) => onSortChange(event.currentTarget.value)}>{sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></FilterGroup>}
      {sizes && onSizeToggle && <FilterGroup title="Size"><OptionList options={sizes} selected={selectedSizeIds} onToggle={onSizeToggle} name="product-size" /></FilterGroup>}
      {colours && onColourToggle && <FilterGroup title="Colour"><OptionList options={colours} selected={selectedColourIds} onToggle={onColourToggle} name="product-colour" /></FilterGroup>}
      {priceRange && <FilterGroup title="Price range"><div className="filter-price-range"><label>Minimum <span className="type-numeric">{priceRange.value[0]}</span><input aria-label="Minimum price" type="range" min={priceRange.min} max={priceRange.max} value={priceRange.value[0]} onChange={(event) => priceRange.onChange([Number(event.currentTarget.value), priceRange.value[1]])} /></label><label>Maximum <span className="type-numeric">{priceRange.value[1]}</span><input aria-label="Maximum price" type="range" min={priceRange.min} max={priceRange.max} value={priceRange.value[1]} onChange={(event) => priceRange.onChange([priceRange.value[0], Number(event.currentTarget.value)])} /></label></div></FilterGroup>}
      {availabilityOptions && onAvailabilityChange && <FilterGroup title="Availability"><label className="sr-only" htmlFor="product-availability">Availability</label><select className="ui-input" id="product-availability" value={availabilityValue ?? ""} onChange={(event) => onAvailabilityChange(event.currentTarget.value)}>{availabilityOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></FilterGroup>}
      {children}
    </div><footer className="filter-drawer__footer"><Button variant="secondary" onClick={onReset}>Reset all</Button><Button onClick={onApply}>Apply filters</Button></footer>
  </dialog>;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) { return <fieldset className="filter-group"><legend className="type-label-md">{title}</legend>{children}</fieldset>; }
function OptionList({ options, selected, onToggle, name }: { options: FilterOption[]; selected: string[]; onToggle: (id: string) => void; name: string }) { return <div className="filter-options">{options.map((option) => <label key={option.id}><input type="checkbox" name={name} checked={selected.includes(option.id)} onChange={() => onToggle(option.id)} />{option.label}</label>)}</div>; }
