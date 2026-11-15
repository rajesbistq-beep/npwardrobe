import { LoadingState } from "@/components/shared/states";

export function CatalogLoading({ label = "Loading catalogue" }: { label?: string }) {
  return <section className="catalog-page" aria-label={label}><div className="catalog-intro"><div className="skeleton loading-state__row" /><div className="skeleton loading-state__row" /></div><LoadingState label={label} rows={6} /></section>;
}
