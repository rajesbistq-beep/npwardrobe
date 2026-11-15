"use client";

import type { CSSProperties } from "react";
export type VariantOption = { id: string; label: string; available: boolean };
export function SizeSelector({ options, value, onChange, label = "Choose a size" }: { options: VariantOption[]; value?: string; onChange: (id: string) => void; label?: string }) {
  return <fieldset className="variant-selector"><legend className="type-label-md">{label}</legend><div className="variant-selector__options">{options.map((option) => <button key={option.id} type="button" className={`size-option${value === option.id ? " is-selected" : ""}${!option.available ? " is-unavailable" : ""}`} aria-pressed={value === option.id} aria-label={`${option.label}${option.available ? "" : ", unavailable"}`} disabled={!option.available} onClick={() => onChange(option.id)}>{option.label}</button>)}</div></fieldset>;
}
export function ColourSwatch({ options, value, onChange, label = "Choose a colour" }: { options: Array<VariantOption & { colour: string }>; value?: string; onChange: (id: string) => void; label?: string }) {
  return <fieldset className="variant-selector"><legend className="type-label-md">{label}</legend><div className="variant-selector__options">{options.map((option) => <button key={option.id} type="button" className={`colour-option${value === option.id ? " is-selected" : ""}`} style={{ "--swatch-colour": option.colour } as CSSProperties} aria-pressed={value === option.id} aria-label={`${option.label}${option.available ? "" : ", unavailable"}`} disabled={!option.available} onClick={() => onChange(option.id)}><span aria-hidden="true" /> <span>{option.label}</span></button>)}</div></fieldset>;
}
