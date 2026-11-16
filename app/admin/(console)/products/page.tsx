import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminProducts } from "@/services/admin-catalog.service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function price(value: number) {
  return new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 2 }).format(value);
}

function statusLabel(status: string) {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}

function statusClass(status: string) {
  if (status === "published") return "product-catalog__status--published";
  if (status === "archived") return "product-catalog__status--archived";
  return "product-catalog__status--draft";
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(first(params.page)) || 1);
  const status = first(params.status) ?? "all";
  const search = first(params.q) ?? "";
  const result = await getAdminProducts({ page, status, search });
  const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="admin-content-container">
      <PageHeader
        title="Product catalogue"
        description="Create products, manage variants and publish customer-ready listings."
        breadcrumbs={["Commerce", "Products"]}
        action={<Link className="ui-button ui-button--primary" href="/admin/products/new">Add product</Link>}
      />
      <form className="product-catalog__filters" method="get">
        <label className="product-catalog__search">
          <span className="sr-only">Search products</span>
          <input className="ui-input" name="q" type="search" maxLength={100} placeholder="Search product names…" defaultValue={result.search} />
        </label>
        <label className="product-catalog__status-filter">
          <span className="sr-only">Filter by publication status</span>
          <select className="ui-input" name="status" defaultValue={result.status}>
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <input type="hidden" name="page" value="1" />
        <button className="ui-button ui-button--secondary" type="submit">Apply filters</button>
      </form>

      <div className="product-catalog__summary" aria-live="polite">
        {result.total} {result.total === 1 ? "product" : "products"} · Page {result.page} of {pageCount}
      </div>
      {result.products.length ? (
        <div className="product-catalog__list">
          {result.products.map((product) => (
            <article className="product-catalog__item" key={product.id}>
              <Link className="product-catalog__image" href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`}>
                {product.imageUrl
                  ? <Image src={product.imageUrl} alt={product.imageAlt} fill sizes="(max-width: 700px) 25vw, 88px" />
                  : <span aria-hidden="true">NW</span>}
              </Link>
              <div className="product-catalog__details">
                <Link className="product-catalog__name" href={`/admin/products/${product.id}`}>{product.name}</Link>
                <span className="product-catalog__slug">/{product.slug}</span>
              </div>
              <span className={`product-catalog__status ${statusClass(product.status)}`}>{statusLabel(product.status)}</span>
              <div className="product-catalog__price">
                {product.salePrice !== null ? <><del>{price(product.defaultPrice)}</del><strong>{price(product.salePrice)}</strong></> : <strong>{price(product.defaultPrice)}</strong>}
              </div>
              {product.isFeatured && <span className="product-catalog__featured">Featured</span>}
              <Link className="ui-button ui-button--secondary ui-button--small" href={`/admin/products/${product.id}`}>Edit</Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="product-catalog__empty">
          <h2>{result.search || result.status !== "all" ? "No matching products" : "Your catalogue is ready to grow"}</h2>
          <p>{result.search || result.status !== "all" ? "Adjust the filters or try another search." : "Create your first product, add its variants and images, then publish it to the storefront."}</p>
          {!result.search && result.status === "all" && <Link className="ui-button ui-button--primary" href="/admin/products/new">Add your first product</Link>}
        </div>
      )}
      <nav className="product-catalog__pagination" aria-label="Product catalogue pages">
        {result.page > 1 ? <Link className="ui-button ui-button--secondary ui-button--small" href={pageHref(result.page - 1, result.search, result.status)}>Previous</Link> : <span />}
        <span>Page {result.page} / {pageCount}</span>
        {result.page < pageCount ? <Link className="ui-button ui-button--secondary ui-button--small" href={pageHref(result.page + 1, result.search, result.status)}>Next</Link> : <span />}
      </nav>
    </div>
  );
}

function pageHref(page: number, search: string, status: string) {
  const query = new URLSearchParams({ page: page.toString(), status });
  if (search) query.set("q", search);
  return `/admin/products?${query.toString()}`;
}
