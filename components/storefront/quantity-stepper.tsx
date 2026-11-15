"use client";

export function QuantityStepper({ value, onChange, min = 1, max, label = "Quantity" }: { value: number; onChange: (value: number) => void; min?: number; max?: number; label?: string }) {
  return <div className="quantity-stepper" role="group" aria-label={label}><button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button><output aria-live="polite" aria-label={`${value} items`}>{value}</output><button type="button" aria-label="Increase quantity" disabled={max !== undefined && value >= max} onClick={() => onChange(max === undefined ? value + 1 : Math.min(max, value + 1))}>+</button></div>;
}
