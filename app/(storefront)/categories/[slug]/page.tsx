import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors/app-error";
import { CatalogControls, type CatalogFilterAttribute } from "@/components/storefront/catalog/catalog-controls";
import { CatalogPagination } from "@/components/storefront/catalog/catalog-pagination";
import { ProductGrid } from "@/components/storefront/catalog/product-grid";
import { CatalogSearchForm } from "@/components/storefront/catalog/catalog-search-form";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { getCategoryBySlug, getProductFilterOptions, getPublishedCategoryProducts } from "@/services/catalog.service";
import { catalogQueryString, parseCatalogQuery, type SearchParameterRecord } from "@/lib/catalog/query";
import { toProductCardData } from "@/lib/catalog/presentation";
import { captureAsync } from "@/lib/utils/capture-async";

type Props = PageProps<"/categories/[slug]">;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try { const { slug } = await params; const category = await getCategoryBySlug(slug); return { title: category.seo_title || category.name, description: category.seo_description || category.description || `Explore ${category.name} from NP Wardrobe.` }; }
  catch { return { title: "Category", description: "Explore published NP Wardrobe categories." }; }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, rawParams] = await Promise.all([params, searchParams]);
  const paramsRecord = rawParams as SearchParameterRecord;
  const { filters, invalid } = parseCatalogQuery(paramsRecord, { categorySlug: slug });
  const loaded = await captureAsync(Promise.all([getCategoryBySlug(slug), getPublishedCategoryProducts(slug, filters), getProductFilterOptions()]));
  if (!loaded.ok) {
    if (loaded.error instanceof AppError && loaded.error.code === "NOT_FOUND") notFound();
    return <div className="catalog-page"><ErrorState title="This category is unavailable" description="We could not load the category. Please reload the page to try again." /></div>;
  }
    const [category, result, options] = loaded.data;
    const attributes: CatalogFilterAttribute[] = options.attributes.map((attribute) => ({ code: attribute.code, options: options.values.filter((value) => value.attribute_id === attribute.id).map((value) => ({ id: value.id, label: value.label })) }));
    return <div className="catalog-page">
      {category.image?.public_url && <div className="category-hero"><Image src={category.image.public_url} alt={category.image.alt_text || category.name} fill sizes="100vw" priority /><span aria-hidden="true" /><div><p className="type-label-sm">Category</p><h1 className="type-display">{category.name}</h1>{category.description && <p className="type-body-lg">{category.description}</p>}</div></div>}
      {!category.image?.public_url && <header className="catalog-intro"><p className="type-label-sm">Category</p><h1 className="type-headline-lg">{category.name}</h1>{category.description && <p className="type-body-md">{category.description}</p>}</header>}
      {!!category.children.length && <nav className="category-links" aria-label="Subcategories">{category.children.map((child) => <Link key={child.id} href={`/categories/${encodeURIComponent(child.slug)}`}>{child.name}</Link>)}</nav>}
      <CatalogSearchForm action={`/categories/${encodeURIComponent(slug)}`} value={filters.search ?? ""} />
      {invalid && <p className="catalog-query-warning" role="status">Some filters were invalid and have been cleared.</p>}
      <div className="catalog-toolbar"><p className="catalog-result-count">{result.total} {result.total === 1 ? "product" : "products"}</p><CatalogControls key={JSON.stringify(paramsRecord)} search={filters.search ?? ""} sort={filters.sort} attributes={attributes} selectedValues={{ size: filters.sizeValueIds ?? [], colour: filters.colourValueIds ?? [] }} minPrice={filters.minPrice} maxPrice={filters.maxPrice} activeCount={(filters.sizeValueIds?.length ?? 0) + (filters.colourValueIds?.length ?? 0) + Number(Boolean(filters.minPrice || filters.maxPrice))} /></div>
      {result.items.length ? <ProductGrid products={result.items.map(toProductCardData)} /> : <EmptyState title="No products in this category yet" description="Published products will appear here when they are available." actionLabel="Browse all products" actionHref="/shop" />}
      <CatalogPagination page={result.page} pageSize={result.pageSize} total={result.total} query={catalogQueryString(paramsRecord)} />
    </div>;
}
