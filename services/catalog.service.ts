import "server-only";

import { AppError, throwDatabaseError, validationError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import { productListFiltersSchema, productSlugSchema, type ProductListFilters } from "@/lib/validations/catalog";
import type { PageResult, ProductCard, PublicMedia } from "@/types/domain";

const pageSizeCeiling = 1000; // Matches supabase/config.toml api.max_rows.

function intersectIds(left: Set<string>, right: Set<string>): Set<string> {
  const result = new Set<string>();
  left.forEach((id) => {
    if (right.has(id)) result.add(id);
  });
  return result;
}

async function fetchAllProductIds(
  loadPage: (from: number, to: number) => Promise<{ ids: string[]; error: { code?: string; message?: string } | null }>,
) {
  const ids: string[] = [];
  for (let from = 0; ; from += pageSizeCeiling) {
    const { ids: pageIds, error } = await loadPage(from, from + pageSizeCeiling - 1);
    if (error) throwDatabaseError(error);
    ids.push(...pageIds);
    if (pageIds.length < pageSizeCeiling) break;
  }
  return [...new Set(ids)];
}

async function productIdsForCategory(categoryId: string) {
  const supabase = await createClient();
  return fetchAllProductIds(async (from, to) => {
    const { data, error } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", categoryId)
      .order("product_id", { ascending: true })
      .range(from, to);
    return { ids: (data ?? []).map(({ product_id }) => product_id), error };
  });
}

async function productIdsForCollection(collectionId: string) {
  const supabase = await createClient();
  return fetchAllProductIds(async (from, to) => {
    const { data, error } = await supabase
      .from("collection_products")
      .select("product_id")
      .eq("collection_id", collectionId)
      .order("product_id", { ascending: true })
      .range(from, to);
    return { ids: (data ?? []).map(({ product_id }) => product_id), error };
  });
}

async function matchingVariantsByProduct(
  valueIds: string[],
  attributeCode: "size" | "colour",
): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data: attribute, error: attributeError } = await supabase
    .from("attributes")
    .select("id")
    .eq("code", attributeCode)
    .eq("is_active", true)
    .eq("is_filterable", true)
    .maybeSingle();
  if (attributeError) throwDatabaseError(attributeError);
  if (!attribute) return new Map();

  const { data: values, error: valuesError } = await supabase
    .from("attribute_values")
    .select("id")
    .eq("attribute_id", attribute.id)
    .eq("is_active", true)
    .in("id", valueIds);
  if (valuesError) throwDatabaseError(valuesError);
  const validValueIds = (values ?? []).map(({ id }) => id);
  if (validValueIds.length === 0) return new Map();

  const matchingVariants = new Set<string>();
  const matchingProducts = new Map<string, string>();
  for (let from = 0; ; from += pageSizeCeiling) {
    const { data, error } = await supabase
      .from("product_variant_options")
      .select("variant_id, product_id, attribute_value_id")
      .in("attribute_value_id", validValueIds)
      .order("variant_id", { ascending: true })
      .order("attribute_value_id", { ascending: true })
      .range(from, from + pageSizeCeiling - 1);
    if (error) throwDatabaseError(error);
    for (const row of data ?? []) {
      matchingVariants.add(row.variant_id);
      matchingProducts.set(row.variant_id, row.product_id);
    }
    if ((data ?? []).length < pageSizeCeiling) break;
  }
  return new Map([...matchingVariants].flatMap((variantId) => {
    const productId = matchingProducts.get(variantId);
    return productId ? [[variantId, productId] as const] : [];
  }));
}

export async function getPublishedProducts(input: unknown = {}): Promise<PageResult<ProductCard>> {
  const parsed = productListFiltersSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  const filters: ProductListFilters = parsed.data;
  const supabase = await createClient();

  let requiredProductIds: Set<string> | null = null;
  if (filters.categorySlug) {
    const { data: category, error } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (error) throwDatabaseError(error);
    if (!category) return { items: [], page: filters.page, pageSize: filters.pageSize, total: 0 };
    requiredProductIds = new Set(await productIdsForCategory(category.id));
  }
  if (filters.collectionSlug) {
    const { data: collection, error } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", filters.collectionSlug)
      .maybeSingle();
    if (error) throwDatabaseError(error);
    if (!collection) return { items: [], page: filters.page, pageSize: filters.pageSize, total: 0 };
    const collectionProducts = new Set(await productIdsForCollection(collection.id));
    requiredProductIds = requiredProductIds
      ? new Set([...requiredProductIds].filter((id) => collectionProducts.has(id)))
      : collectionProducts;
  }

  let matchingVariantProducts: Map<string, string> | null = null;
  for (const [attributeCode, valueIds] of [
    ["size", filters.sizeValueIds],
    ["colour", filters.colourValueIds],
  ] as const) {
    if (!valueIds?.length) continue;
    const matchingVariants = await matchingVariantsByProduct(valueIds, attributeCode);
    if (matchingVariantProducts === null) {
      matchingVariantProducts = matchingVariants;
    } else {
      const commonVariants = new Map<string, string>();
      matchingVariantProducts.forEach((productId, variantId) => {
        if (matchingVariants.has(variantId)) commonVariants.set(variantId, productId);
      });
      matchingVariantProducts = commonVariants;
    }
  }
  if (matchingVariantProducts) {
    const matchingProductIds = new Set(matchingVariantProducts.values());
    requiredProductIds = requiredProductIds
      ? intersectIds(requiredProductIds, matchingProductIds)
      : matchingProductIds;
  }
  if (requiredProductIds?.size === 0) {
    return { items: [], page: filters.page, pageSize: filters.pageSize, total: 0 };
  }

  let query = supabase
    .from("products")
    .select("id, slug, name, short_description, currency_code, default_price, sale_price, sale_starts_at, sale_ends_at, is_featured", { count: "exact" })
    .eq("status", "published")
    .is("deleted_at", null)
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`);
  if (requiredProductIds) query = query.in("id", [...requiredProductIds]);
  if (filters.search) query = query.textSearch("search_vector", filters.search, { type: "websearch", config: "simple" });

  switch (filters.sort) {
    case "newest":
      query = query.order("published_at", { ascending: false, nullsFirst: false });
      break;
    case "price_asc":
      // Product-level base price only; effective variant price ranges need a DB read model.
      query = query.order("default_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("default_price", { ascending: false });
      break;
    default:
      query = query.order("is_featured", { ascending: false }).order("sort_order", { ascending: true });
  }
  query = query.order("id", { ascending: true });
  const from = (filters.page - 1) * filters.pageSize;
  const { data, error, count } = await query.range(from, from + filters.pageSize - 1);
  if (error) throwDatabaseError(error);
  return {
    items: (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description,
      currencyCode: row.currency_code,
      defaultPrice: row.default_price,
      salePrice: row.sale_price,
      saleStartsAt: row.sale_starts_at,
      saleEndsAt: row.sale_ends_at,
      featured: row.is_featured,
    })),
    page: filters.page,
    pageSize: filters.pageSize,
    total: count ?? 0,
  };
}

export async function getPublishedProductBySlug(input: unknown) {
  const parsed = productSlugSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, slug, name, short_description, description, material, care_instructions, fit_notes, product_type, currency_code, default_price, sale_price, sale_starts_at, sale_ends_at, seo_title, seo_description")
    .eq("slug", parsed.data)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throwDatabaseError(error);
  if (!product) throw new AppError("NOT_FOUND", "Product not found.");

  const [variantsResult, mediaResult] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, product_id, sku, price_override, sale_price_override, sale_starts_at, sale_ends_at, weight_grams, sort_order")
      .eq("product_id", product.id)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true })
      .limit(pageSizeCeiling),
    supabase
      .from("product_media")
      .select("id, media_asset_id, media_role, sort_order, is_primary")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true })
      .limit(pageSizeCeiling),
  ]);
  if (variantsResult.error) throwDatabaseError(variantsResult.error);
  if (mediaResult.error) throwDatabaseError(mediaResult.error);

  const variantIds = (variantsResult.data ?? []).map(({ id }) => id);
  const mediaIds = [...new Set((mediaResult.data ?? []).map(({ media_asset_id }) => media_asset_id))];
  const [optionsResult, assetsResult] = await Promise.all([
    variantIds.length
      ? supabase.from("product_variant_options").select("variant_id, attribute_id, attribute_value_id").in("variant_id", variantIds)
      : Promise.resolve({ data: [], error: null }),
    mediaIds.length
      ? supabase.from("media_assets").select("id, public_url, alt_text, alt_text_ne, width, height").in("id", mediaIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (optionsResult.error) throwDatabaseError(optionsResult.error);
  if (assetsResult.error) throwDatabaseError(assetsResult.error);
  const valueIds = [...new Set((optionsResult.data ?? []).map(({ attribute_value_id }) => attribute_value_id))];
  const attributeIds = [...new Set((optionsResult.data ?? []).map(({ attribute_id }) => attribute_id))];
  const [valuesResult, attributesResult] = await Promise.all([
    valueIds.length
      ? supabase.from("attribute_values").select("id, value, label, label_ne").in("id", valueIds)
      : Promise.resolve({ data: [], error: null }),
    attributeIds.length
      ? supabase.from("attributes").select("id, code, name").in("id", attributeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (valuesResult.error) throwDatabaseError(valuesResult.error);
  if (attributesResult.error) throwDatabaseError(attributesResult.error);

  const values = new Map((valuesResult.data ?? []).map((value) => [value.id, value]));
  const attributes = new Map((attributesResult.data ?? []).map((attribute) => [attribute.id, attribute]));
  const mediaAssets = new Map((assetsResult.data ?? []).map((asset) => [asset.id, asset]));
  const optionsByVariant = new Map<string, Array<{ code: string; name: string; value: string; label: string; labelNe: string | null }>>();
  for (const option of optionsResult.data ?? []) {
    const attribute = attributes.get(option.attribute_id);
    const value = values.get(option.attribute_value_id);
    if (!attribute || !value) continue;
    const list = optionsByVariant.get(option.variant_id) ?? [];
    list.push({ code: attribute.code, name: attribute.name, value: value.value, label: value.label, labelNe: value.label_ne });
    optionsByVariant.set(option.variant_id, list);
  }

  return {
    ...product,
    variants: (variantsResult.data ?? []).map((variant) => ({
      ...variant,
      options: optionsByVariant.get(variant.id) ?? [],
    })),
    media: (mediaResult.data ?? []).flatMap((item) => {
      const asset = mediaAssets.get(item.media_asset_id);
      if (!asset?.public_url) return [];
      const media: PublicMedia = {
        id: asset.id,
        publicUrl: asset.public_url,
        altText: asset.alt_text,
        width: asset.width,
        height: asset.height,
      };
      return [{ ...item, asset: media }];
    }),
  };
}

export async function getActiveCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, slug, name, description, image_asset_id, sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .limit(pageSizeCeiling);
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getCategoryBySlug(input: unknown) {
  const parsed = productSlugSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, slug, name, description, image_asset_id, sort_order")
    .eq("slug", parsed.data)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throwDatabaseError(error);
  if (!data) throw new AppError("NOT_FOUND", "Category not found.");
  return data;
}

export async function getPublishedCollections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, collection_type, hero_media_id, starts_at, ends_at, sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .limit(pageSizeCeiling);
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getProductsInCollection(collectionSlug: string, filters: unknown = {}) {
  const parsedSlug = productSlugSchema.safeParse(collectionSlug);
  if (!parsedSlug.success) throw validationError();
  return getPublishedProducts({ ...(filters as object), collectionSlug: parsedSlug.data });
}
