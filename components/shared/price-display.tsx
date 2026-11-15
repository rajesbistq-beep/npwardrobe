import { formatNpr } from "@/lib/utils/currency";

export function PriceDisplay({ amount, compareAt, className }: { amount: number; compareAt?: number | null; className?: string }) {
  return <span className={`price-display${className ? ` ${className}` : ""}`}><span className="type-currency">{formatNpr(amount)}</span>{compareAt != null && compareAt > amount && <><span className="sr-only">, previously </span><del>{formatNpr(compareAt)}</del></>}</span>;
}
