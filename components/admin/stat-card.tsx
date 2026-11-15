import type { ReactNode } from "react";
export function StatCard({ label, value, description, icon, loading = false }: { label: string; value?: string | number; description?: string; icon?: ReactNode; loading?: boolean }) {
  return <article className="stat-card" aria-busy={loading}><div className="stat-card__head"><span>{label}</span>{icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}</div>{loading ? <div className="stat-card__skeleton" aria-label={`Loading ${label}`} /> : <p className="stat-card__value">{value ?? "—"}</p>}{description && <p className="stat-card__description">{description}</p>}</article>;
}
