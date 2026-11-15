import Link from "next/link";

export function AdminBreadcrumbs({ title }: { title: string }) {
  return <nav className="admin-breadcrumbs" aria-label="Breadcrumb"><Link href="/admin">Administration</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>;
}
