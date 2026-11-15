import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors/app-error";
import { CatalogControls, type CatalogFilterAttribute } from "@/components/storefront/catalog/catalog-controls";
import { CatalogPagination } from "@/components/storefront/catalog/catalog-pagination";
import { ProductGrid } from "@/components/storefront/catalog/product-grid";
import { CatalogSearchForm } from "@/components/storefront/catalog/catalog-search-form";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { catalogQueryString, parseCatalogQuery, type SearchParameterRecord } from "@/lib/catalog/query";
import { toProductCardData } from "@/lib/catalog/presentation";
import { getProductFilterOptions, getProductsInCollection, getPublishedCollectionBySlug } from "@/services/catalog.service";
import { captureAsync } from "@/lib/utils/capture-async";

type Props = PageProps<"/collections/[slug]">;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try { const { slug } = await params; const collection = await getPublishedCollectionBySlug(slug); return { title: collection.seo_title || collection.name, description: collection.seo_description || collection.description || `Explore ${collection.name} from NP Wardrobe.`, openGraph: { title: collection.seo_title || collection.name, description: collection.seo_description || collection.description || `Explore ${collection.name} from NP Wardrobe.`, images: collection.image?.public_url ? [{ url: collection.image.public_url, alt: collection.image.alt_text || collection.name }] : undefined } }; }
  catch { return { title: "Collection", description: "Explore published NP Wardrobe collections." }; }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ slug }, rawParams] = await Promise.all([params, searchParams]);
  const paramsRecord = rawParams as SearchParameterRecord;
  const { filters, invalid } = parseCatalogQuery(paramsRecord, { collectionSlug: slug });
  const loaded = await captureAsync(Promise.all([getPublishedCollectionBySlug(slug), getProductsInCollection(slug, filters), getProductFilterOptions()]));
  if (!loaded.ok) {
    if (loaded.error instanceof AppError && loaded.error.code === "NOT_FOUND") notFound();
    return <div className="catalog-page"><ErrorState title="This collection is unavailable" description="We could not load the collection. Please reload the page to try again." /></div>;
  }
    const [collection, result, filterOptions] = loaded.data;
    const attributes: CatalogFilterAttribute[] = filterOptions.attributes.map((attribute) => ({ code: attribute.code, options: filterOptions.values.filter((value) => value.attribute_id === attribute.id).map((value) => ({ id: value.id, label: value.label })) }));
    return <div className="catalog-page">
      {collection.image?.public_url ? <div className="category-hero"><Image src={collection.image.public_url} alt={collection.image.alt_text || collection.name} fill sizes="100vw" priority /><span aria-hidden="true" /><div><p className="type-label-sm">Curated edit</p><h1 className="type-display">{collection.name}</h1>{collection.description && <p className="type-body-lg">{collection.description}</p>}</div></div> : <header className="catalog-intro"><p className="type-label-sm">Curated edit</p><h1 className="type-headline-lg">{collection.name}</h1>{collection.description && <p className="type-body-md">{collection.description}</p>}</header>}
      {invalid && <p className="catalog-query-warning" role="status">Some filters were invalid and have been cleared.</p>}
      <CatalogSearchForm action={`/collections/${encodeURIComponent(slug)}`} value={filters.search ?? ""} />
      <div className="catalog-toolbar"><p className="catalog-result-count">{result.total} {result.total === 1 ? "product" : "products"}</p><CatalogControls key={JSON.stringify(paramsRecord)} search={filters.search ?? ""} sort={filters.sort} attributes={attributes} selectedValues={{ size: filters.sizeValueIds ?? [], colour: filters.colourValueIds ?? [] }} minPrice={filters.minPrice} maxPrice={filters.maxPrice} activeCount={(filters.sizeValueIds?.length ?? 0) + (filters.colourValueIds?.length ?? 0) + Number(Boolean(filters.minPrice || filters.maxPrice))} /></div>
      {result.items.length ? <ProductGrid products={result.items.map(toProductCardData)} /> : <EmptyState title="No products in this collection yet" description="This published collection currently has no matching products." actionLabel="Browse all products" actionHref="/shop" />}
      <CatalogPagination page={result.page} pageSize={result.pageSize} total={result.total} query={catalogQueryString(paramsRecord)} />
    </div>;
}
