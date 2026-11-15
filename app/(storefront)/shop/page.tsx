import type { Metadata } from "next";
import { CatalogControls, type CatalogFilterAttribute } from "@/components/storefront/catalog/catalog-controls";
import { CatalogPagination } from "@/components/storefront/catalog/catalog-pagination";
import { ProductGrid } from "@/components/storefront/catalog/product-grid";
import { CatalogSearchForm } from "@/components/storefront/catalog/catalog-search-form";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { getActiveCategories, getProductFilterOptions, getPublishedProducts } from "@/services/catalog.service";
import { parseCatalogQuery, catalogQueryString, type SearchParameterRecord } from "@/lib/catalog/query";
import { toProductCardData } from "@/lib/catalog/presentation";
import { captureAsync } from "@/lib/utils/capture-async";

export const metadata: Metadata = { title: "Shop All Products", description: "Browse the published NP Wardrobe collection." };

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams as SearchParameterRecord;
  const { filters, invalid } = parseCatalogQuery(params);
  const search = filters.search ?? "";
  const loaded = await captureAsync(Promise.all([getPublishedProducts(filters), getProductFilterOptions(), getActiveCategories()]));
  if (!loaded.ok) return <div className="catalog-page"><ErrorState title="The shop is unavailable" description="We could not load the catalogue. Please reload the page to try again." /></div>;
    const [result, options, categories] = loaded.data;
    const attributes: CatalogFilterAttribute[] = options.attributes.map((attribute) => ({
      code: attribute.code,
      options: options.values.filter((value) => value.attribute_id === attribute.id).map((value) => ({ id: value.id, label: value.label })),
    }));
    const selectedValues = { size: filters.sizeValueIds ?? [], colour: filters.colourValueIds ?? [] };
    const activeCount = selectedValues.size.length + selectedValues.colour.length + Number(filters.minPrice !== undefined || filters.maxPrice !== undefined) + Number(Boolean(params.category)) + Number(filters.sort !== "featured");
    const paramsForPagination: SearchParameterRecord = invalid ? {} : { ...params };
    const activeCategory = typeof params.category === "string" ? params.category : "";
    return <div className="catalog-page">
      <header className="catalog-intro"><p className="type-label-sm">NP Wardrobe</p><h1 className="type-headline-lg">{search ? "Search the collection" : "Shop all products"}</h1><p className="type-body-md">{search ? `Results for “${search}”` : "Explore the published collection."}</p></header>
      <CatalogSearchForm action="/shop" value={search} />
      {invalid && <p className="catalog-query-warning" role="status">Some filters were invalid and have been cleared.</p>}
      <div className="catalog-toolbar"><p className="catalog-result-count" aria-live="polite">{result.total} {result.total === 1 ? "product" : "products"}</p><CatalogControls key={JSON.stringify(params)} search={search} sort={filters.sort} attributes={attributes} selectedValues={selectedValues} minPrice={filters.minPrice} maxPrice={filters.maxPrice} activeCount={activeCount} categories={categories.map((category) => ({ id: category.slug, label: category.name }))} categorySlug={activeCategory} /></div>
      {result.items.length ? <ProductGrid products={result.items.map(toProductCardData)} /> : <EmptyState title={search ? "No matching products found" : "No published products yet"} description={search ? "Try another search or clear your filters to browse the current collection." : "The shop will show products here once they are published."} actionLabel={search || activeCount ? "Clear search and filters" : "Explore categories"} actionHref="/shop" />}
      <CatalogPagination page={result.page} pageSize={result.pageSize} total={result.total} query={catalogQueryString(paramsForPagination)} />
    </div>;
}
