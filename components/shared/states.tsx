import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({ title, description, actionLabel, actionHref }: { title: string; description: string; actionLabel?: string; actionHref?: string }) {
  return <section className="state-panel" aria-labelledby="empty-state-title"><span className="state-panel__mark" aria-hidden="true">◇</span><h2 id="empty-state-title" className="type-headline-sm">{title}</h2><p className="type-body-sm">{description}</p>{actionLabel && actionHref && <Link className="ui-button ui-button--secondary" href={actionHref}>{actionLabel}</Link>}</section>;
}
export function ErrorState({ title = "Something went wrong", description, onRetry }: { title?: string; description: string; onRetry?: () => void }) {
  return <section className="state-panel state-panel--error" role="alert"><h2 className="type-headline-sm">{title}</h2><p>{description}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</section>;
}
export function LoadingState({ label = "Loading", rows = 3 }: { label?: string; rows?: number }) {
  return <div className="loading-state" role="status" aria-label={label}>{Array.from({ length: rows }, (_, index) => <Skeleton className="loading-state__row" key={index} />)}</div>;
}
export function ContentPanel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="content-panel"><header><h2 className="type-title-md">{title}</h2>{description && <p className="type-body-sm">{description}</p>}</header>{children}</section>;
}
