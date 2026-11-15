import type { ReactNode } from "react";
export function PageHeader({ title, description, breadcrumbs, action }: { title: string; description?: string; breadcrumbs?: string[]; action?: ReactNode }) {
  return <header className="admin-page-header">{breadcrumbs && <nav aria-label="Breadcrumb"><ol>{breadcrumbs.map((item, index) => <li key={`${item}-${index}`} aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}>{item}</li>)}</ol></nav>}<div className="admin-page-header__row"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div></header>;
}
