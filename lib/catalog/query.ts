import { productListFiltersSchema } from "@/lib/validations/catalog";

export type SearchParameterRecord = Record<string, string | string[] | undefined>;

export function parseCatalogQuery(params: SearchParameterRecord, fixed: { categorySlug?: string; collectionSlug?: string } = {}) {
  const values = (value: string | string[] | undefined) => value === undefined ? undefined : Array.isArray(value) ? value : [value];
  const parsed = productListFiltersSchema.safeParse({
    page: params.page,
    pageSize: 24,
    search: typeof params.q === "string" ? params.q : typeof params.search === "string" ? params.search : undefined,
    categorySlug: fixed.categorySlug ?? (typeof params.category === "string" ? params.category : undefined),
    collectionSlug: fixed.collectionSlug,
    sort: params.sort,
    sizeValueIds: values(params.size),
    colourValueIds: values(params.colour),
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
  });
  if (parsed.success) return { filters: parsed.data, invalid: false };
  return { filters: productListFiltersSchema.parse({ ...fixed, pageSize: 24 }), invalid: true };
}

export function catalogQueryString(params: SearchParameterRecord) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) query.append(key, item);
  }
  return query.toString();
}
