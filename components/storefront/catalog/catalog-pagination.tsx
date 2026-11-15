import Link from "next/link";

export function CatalogPagination({ page, pageSize, total, query }: { page: number; pageSize: number; total: number; query: string }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const url = (nextPage: number) => {
    const params = new URLSearchParams(query);
    params.set("page", String(nextPage));
    return `?${params.toString()}`;
  };
  return <nav className="catalog-pagination" aria-label="Product pages">
    {page > 1 ? <Link href={url(page - 1)}>Previous</Link> : <span aria-disabled="true">Previous</span>}
    <span aria-current="page">Page {page} of {pages}</span>
    {page < pages ? <Link href={url(page + 1)}>Next</Link> : <span aria-disabled="true">Next</span>}
  </nav>;
}
