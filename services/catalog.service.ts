import "server-only";
import { cache } from "react";

import { AppError, throwDatabaseError, validationError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import { productListFiltersSchema, productSlugSchema, type ProductListFilters } from "@/lib/validations/catalog";
import type { PageResult, ProductCard, PublicMedia } from "@/types/domain";
import { approvedPublicMediaUrl } from "@/lib/utils/public-media";

const pageSizeCeiling = 1000; // Matches supabase/config.toml api.max_rows.

function activeSale(price: number | null, startsAt: string | null, endsAt: string | null) {
  if (price === null) return false;
  const now = Date.now();
  return (!startsAt || Date.parse(startsAt) <= now) && (!endsAt || Date.parse(endsAt) > now);
}

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
      .select("product_id, sort_order")
      .eq("collection_id", collectionId)
      .order("sort_order", { ascending: true })
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
      .eq("status", "published")
      .is("deleted_at", null)
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
      .eq("status", "published")
      .is("deleted_at", null)
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
  if (filters.minPrice !== undefined) query = query.gte("default_price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("default_price", filters.maxPrice);
  if (filters.featuredOnly) query = query.eq("is_featured", true);

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
  const rows = data ?? [];
  const mediaResult = rows.length
    ? await supabase.from("product_media").select("product_id, media_asset_id, alt_text, is_primary, sort_order").in("product_id", rows.map(({ id }) => id)).is("variant_id", null).neq("media_role", "size_reference").order("is_primary", { ascending: false }).order("sort_order", { ascending: true })
    : { data: [], error: null };
  if (mediaResult.error) throwDatabaseError(mediaResult.error);
  const assetIds = [...new Set((mediaResult.data ?? []).map(({ media_asset_id }) => media_asset_id))];
  const assetsResult = assetIds.length
    ? await supabase.from("media_assets").select("id, public_url, alt_text").in("id", assetIds).eq("storage_visibility", "public")
    : { data: [], error: null };
  if (assetsResult.error) throwDatabaseError(assetsResult.error);
  const assets = new Map((assetsResult.data ?? []).flatMap((asset) => {
    const publicUrl = approvedPublicMediaUrl(asset.public_url);
    return publicUrl ? [[asset.id, { ...asset, public_url: publicUrl }] as const] : [];
  }));
  const mediaByProduct = new Map<string, { id: string; public_url: string | null; alt_text: string | null }>();
  for (const media of mediaResult.data ?? []) {
    const asset = assets.get(media.media_asset_id);
    if (asset && !mediaByProduct.has(media.product_id)) mediaByProduct.set(media.product_id, { ...asset, alt_text: media.alt_text ?? asset.alt_text });
  }
  return {
    items: rows.map((row) => {
      const image = mediaByProduct.get(row.id);
      return ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description,
      currencyCode: row.currency_code,
      defaultPrice: row.default_price,
      salePrice: activeSale(row.sale_price, row.sale_starts_at, row.sale_ends_at) ? row.sale_price : null,
      featured: row.is_featured,
      imageUrl: image?.public_url ?? null,
      imageAlt: image?.alt_text || row.name,
    }); }),
    page: filters.page,
    pageSize: filters.pageSize,
    total: count ?? 0,
  };
}

export const getPublishedProductBySlug = cache(async (input: unknown) => {
  const parsed = productSlugSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, slug, name, short_description, description, material, care_instructions, fit_notes, product_type, currency_code, default_price, sale_price, sale_starts_at, sale_ends_at, seo_title, seo_description, canonical_url")
    .eq("slug", parsed.data)
    .eq("status", "published")
    .is("deleted_at", null)
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .maybeSingle();
  if (error) throwDatabaseError(error);
  if (!product) throw new AppError("NOT_FOUND", "Product not found.");

  const [variantsResult, mediaResult] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, product_id, price_override, sale_price_override, sale_starts_at, sale_ends_at, sort_order")
      .eq("product_id", product.id)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true })
      .limit(pageSizeCeiling),
    supabase
      .from("product_media")
      .select("id, variant_id, media_asset_id, media_role, sort_order, is_primary, alt_text")
      .eq("product_id", product.id)
      .neq("media_role", "size_reference")
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
      ? supabase.from("product_variant_options").select("variant_id, attribute_id, attribute_value_id").in("variant_id", variantIds).order("attribute_id", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    mediaIds.length
      ? supabase.from("media_assets").select("id, public_url, alt_text, alt_text_ne, width, height").in("id", mediaIds).eq("storage_visibility", "public")
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (optionsResult.error) throwDatabaseError(optionsResult.error);
  if (assetsResult.error) throwDatabaseError(assetsResult.error);
  const valueIds = [...new Set((optionsResult.data ?? []).map(({ attribute_value_id }) => attribute_value_id))];
  const attributeIds = [...new Set((optionsResult.data ?? []).map(({ attribute_id }) => attribute_id))];
  const [valuesResult, attributesResult] = await Promise.all([
    valueIds.length
      ? supabase.from("attribute_values").select("id, value, label, label_ne, swatch_hex").in("id", valueIds)
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
  const optionsByVariant = new Map<string, Array<{ code: string; name: string; value: string; label: string; labelNe: string | null; attributeValueId: string; swatchHex: string | null }>>();
  for (const option of optionsResult.data ?? []) {
    const attribute = attributes.get(option.attribute_id);
    const value = values.get(option.attribute_value_id);
    if (!attribute || !value) continue;
    const list = optionsByVariant.get(option.variant_id) ?? [];
    list.push({ code: attribute.code, name: attribute.name, value: value.value, label: value.label, labelNe: value.label_ne, attributeValueId: value.id, swatchHex: value.swatch_hex });
    optionsByVariant.set(option.variant_id, list);
  }

  const mediaByVariant = new Map<string, PublicMedia[]>();
  const baseMedia: PublicMedia[] = [];
  const activeVariantIds = new Set((variantsResult.data ?? []).map(({ id }) => id));
  for (const item of mediaResult.data ?? []) {
    if (item.variant_id && !activeVariantIds.has(item.variant_id)) continue;
    const asset = mediaAssets.get(item.media_asset_id);
    const publicUrl = approvedPublicMediaUrl(asset?.public_url);
    if (!asset || !publicUrl) continue;
    const media: PublicMedia = { id: asset.id, publicUrl, altText: item.alt_text ?? asset.alt_text, width: asset.width, height: asset.height };
    if (item.variant_id) mediaByVariant.set(item.variant_id, [...(mediaByVariant.get(item.variant_id) ?? []), media]);
    else baseMedia.push(media);
  }
  const productSaleActive = activeSale(product.sale_price, product.sale_starts_at, product.sale_ends_at);
  return {
    ...product,
    variants: (variantsResult.data ?? []).map((variant) => ({
      ...variant,
      options: optionsByVariant.get(variant.id) ?? [],
      media: mediaByVariant.get(variant.id) ?? [],
      currentPrice: activeSale(variant.sale_price_override, variant.sale_starts_at, variant.sale_ends_at)
        ? variant.sale_price_override ?? variant.price_override ?? product.default_price
        : variant.price_override === null && productSaleActive ? product.sale_price ?? product.default_price : variant.price_override ?? product.default_price,
      compareAtPrice: activeSale(variant.sale_price_override, variant.sale_starts_at, variant.sale_ends_at)
        ? variant.price_override ?? product.default_price
        : variant.price_override === null && productSaleActive ? product.default_price : null,
      priceAmbiguous: variant.price_override !== null && productSaleActive && variant.sale_price_override === null,
    })),
    media: baseMedia,
    currentPrice: productSaleActive ? product.sale_price ?? product.default_price : product.default_price,
    compareAtPrice: productSaleActive ? product.default_price : null,
  };
});

export async function getProductFilterOptions() {
  const supabase = await createClient();
  const { data: attributes, error: attributesError } = await supabase.from("attributes").select("id, code, name, sort_order").eq("is_active", true).eq("is_filterable", true).in("code", ["size", "colour"]).order("sort_order", { ascending: true }).limit(10);
  if (attributesError) throwDatabaseError(attributesError);
  const ids = (attributes ?? []).map(({ id }) => id);
  const { data: values, error } = ids.length
    ? await supabase.from("attribute_values").select("id, attribute_id, value, label, label_ne, swatch_hex, sort_order").in("attribute_id", ids).eq("is_active", true).order("sort_order", { ascending: true }).limit(100)
    : { data: [], error: null };
  if (error) throwDatabaseError(error);
  return { attributes: attributes ?? [], values: values ?? [] };
}

async function attachMedia<T extends { image_asset_id?: string | null; hero_media_id?: string | null }>(rows: T[], field: "image_asset_id" | "hero_media_id") {
  const ids = [...new Set(rows.flatMap((row) => row[field] ? [row[field] as string] : []))];
  if (!ids.length) return rows.map((row) => ({ ...row, image: null }));
  const supabase = await createClient();
  const { data, error } = await supabase.from("media_assets").select("id, public_url, alt_text, alt_text_ne, width, height").in("id", ids).eq("storage_visibility", "public");
  if (error) throwDatabaseError(error);
  const media = new Map((data ?? []).flatMap((asset) => {
    const publicUrl = approvedPublicMediaUrl(asset.public_url);
    return publicUrl ? [[asset.id, { ...asset, public_url: publicUrl }] as const] : [];
  }));
  return rows.map((row) => ({ ...row, image: row[field] ? media.get(row[field] as string) ?? null : null }));
}

export async function getActiveCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, slug, name, description, image_asset_id, sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .order("sort_order", { ascending: true })
    .limit(pageSizeCeiling);
  if (error) throwDatabaseError(error);
  return attachMedia(data ?? [], "image_asset_id");
}

export const getCategoryBySlug = cache(async (input: unknown) => {
  const parsed = productSlugSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, slug, name, description, image_asset_id, sort_order, seo_title, seo_description")
    .eq("slug", parsed.data)
    .eq("status", "published")
    .is("deleted_at", null)
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .maybeSingle();
  if (error) throwDatabaseError(error);
  if (!data) throw new AppError("NOT_FOUND", "Category not found.");
  const [withImage, children] = await Promise.all([
    attachMedia([data], "image_asset_id"),
    supabase.from("categories").select("id, parent_id, slug, name, description, image_asset_id, sort_order").eq("parent_id", data.id).eq("status", "published").is("deleted_at", null).or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`).order("sort_order", { ascending: true }).limit(48),
  ]);
  if (children.error) throwDatabaseError(children.error);
  return { ...withImage[0], children: await attachMedia(children.data ?? [], "image_asset_id") };
});

export async function getPublishedCollections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, collection_type, hero_media_id, starts_at, ends_at, sort_order, seo_title, seo_description")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .limit(pageSizeCeiling);
  if (error) throwDatabaseError(error);
  return attachMedia(data ?? [], "hero_media_id");
}

export async function getProductsInCollection(collectionSlug: string, filters: unknown = {}) {
  const parsedSlug = productSlugSchema.safeParse(collectionSlug);
  if (!parsedSlug.success) throw validationError();
  const parsedFilters = productListFiltersSchema.safeParse({ ...(filters as object), collectionSlug: parsedSlug.data });
  if (!parsedFilters.success) throw validationError();
  const requested = parsedFilters.data;
  const first = await getPublishedProducts({ ...requested, page: 1, pageSize: 48 });
  const products = [...first.items];
  const pageCount = Math.min(Math.ceil(first.total / 48), Math.ceil(pageSizeCeiling / 48));
  for (let page = 2; page <= pageCount; page += 1) {
    const result = await getPublishedProducts({ ...requested, page, pageSize: 48 });
    products.push(...result.items);
  }
  if (requested.sort === "featured") {
    const supabase = await createClient();
    const { data: collection } = await supabase.from("collections").select("id").eq("slug", parsedSlug.data).eq("status", "published").is("deleted_at", null).maybeSingle();
    if (collection) {
      const ids = await productIdsForCollection(collection.id);
      const byId = new Map(products.map((product) => [product.id, product]));
      products.splice(0, products.length, ...ids.flatMap((id) => byId.has(id) ? [byId.get(id)!] : []));
    }
  }
  const pageStart = (requested.page - 1) * requested.pageSize;
  return { ...first, items: products.slice(pageStart, pageStart + requested.pageSize) };
}

export async function getPublishedCategoryProducts(categorySlug: string, filters: unknown = {}) {
  const slug = productSlugSchema.safeParse(categorySlug);
  if (!slug.success) throw validationError();
  return getPublishedProducts({ ...(filters as object), categorySlug: slug.data });
}

export const getPublishedCollectionBySlug = cache(async (input: unknown) => {
  const slug = productSlugSchema.safeParse(input);
  if (!slug.success) throw validationError();
  const supabase = await createClient();
  const { data, error } = await supabase.from("collections").select("id, slug, name, description, collection_type, hero_media_id, starts_at, ends_at, sort_order, seo_title, seo_description").eq("slug", slug.data).eq("status", "published").is("deleted_at", null).or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`).maybeSingle();
  if (error) throwDatabaseError(error);
  if (!data) throw new AppError("NOT_FOUND", "Collection not found.");
  const [withImage] = await Promise.all([attachMedia([data], "hero_media_id")]);
  return withImage[0];
});

export const getHomepageBanners = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("banners").select("id, name, placement, media_asset_id, target_url, sort_order").in("placement", ["homepage_hero", "announcement"]).eq("status", "active").order("placement", { ascending: true }).order("sort_order", { ascending: true }).limit(8);
  if (error) throwDatabaseError(error);
  const ids = (data ?? []).map(({ media_asset_id }) => media_asset_id);
  const assets = ids.length ? await supabase.from("media_assets").select("id, public_url, alt_text, alt_text_ne").in("id", ids).eq("storage_visibility", "public") : { data: [], error: null };
  if (assets.error) throwDatabaseError(assets.error);
  const translations = data?.length ? await supabase.from("banner_translations").select("banner_id, headline, subheadline, alt_text, cta_label").in("banner_id", data.map(({ id }) => id)).eq("locale", "en") : { data: [], error: null };
  if (translations.error) throwDatabaseError(translations.error);
  const mediaById = new Map((assets.data ?? []).flatMap((asset) => {
    const publicUrl = approvedPublicMediaUrl(asset.public_url);
    return publicUrl ? [[asset.id, { ...asset, public_url: publicUrl }] as const] : [];
  }));
  const copyById = new Map((translations.data ?? []).map((copy) => [copy.banner_id, copy]));
  return (data ?? []).flatMap((banner) => {
    const image = mediaById.get(banner.media_asset_id);
    if (!image?.public_url) return [];
    return [{ ...banner, image, copy: copyById.get(banner.id) ?? null }];
  });
});

export async function getProductExtras(productId: string) {
  const supabase = await createClient();
  const [guideLinks, relatedLinks] = await Promise.all([
    supabase.from("product_size_guides").select("size_guide_id, is_primary").eq("product_id", productId).order("is_primary", { ascending: false }).limit(4),
    supabase.from("related_products").select("related_product_id, relation_type, sort_order").eq("product_id", productId).order("sort_order", { ascending: true }).limit(12),
  ]);
  for (const result of [guideLinks, relatedLinks]) if (result.error) throwDatabaseError(result.error);
  const guideIds = (guideLinks.data ?? []).map(({ size_guide_id }) => size_guide_id);
  const relatedIds = [...new Set((relatedLinks.data ?? []).map(({ related_product_id }) => related_product_id))];
  const [guides, relatedProducts] = await Promise.all([
    guideIds.length ? supabase.from("size_guides").select("id, slug, name, description, measurement_unit").in("id", guideIds).eq("status", "published") : { data: [], error: null },
    relatedIds.length ? supabase.from("products").select("id, slug, name").in("id", relatedIds).eq("status", "published").is("deleted_at", null).or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`).limit(12) : { data: [], error: null },
  ]);
  if (guides.error) throwDatabaseError(guides.error);
  if (relatedProducts.error) throwDatabaseError(relatedProducts.error);
  const guidesById = new Map((guides.data ?? []).map((guide) => [guide.id, guide]));
  const relatedById = new Map((relatedProducts.data ?? []).map((product) => [product.id, product]));
  return {
    sizeGuides: guideIds.flatMap((id) => guidesById.has(id) ? [guidesById.get(id)!] : []),
    relatedProducts: relatedIds.flatMap((id) => relatedById.has(id) ? [relatedById.get(id)!] : []),
  };
}

export async function getApprovedProductReviews(productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("v_public_product_reviews").select("id, product_id, rating, title, body, verified_purchase, created_at").eq("product_id", productId).order("created_at", { ascending: false }).limit(12);
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getPublishedSizeGuide(input?: unknown) {
  const supabase = await createClient();
  let guideQuery = supabase.from("size_guides").select("id, slug, name, description, measurement_unit").eq("status", "published");
  if (input !== undefined) {
    const slug = productSlugSchema.safeParse(input);
    if (!slug.success) throw validationError();
    guideQuery = guideQuery.eq("slug", slug.data);
  }
  const { data: guides, error } = await guideQuery.order("name", { ascending: true }).limit(50);
  if (error) throwDatabaseError(error);
  if (input !== undefined && !guides?.[0]) throw new AppError("NOT_FOUND", "Size guide not found.");
  const guide = input === undefined ? null : guides?.[0] ?? null;
  if (!guide) return { guides: guides ?? [], guide: null, rows: [] };
  const { data: rows, error: rowsError } = await supabase.from("size_guide_rows").select("id, size_label, sort_order, fit_note").eq("size_guide_id", guide.id).order("sort_order", { ascending: true }).limit(60);
  if (rowsError) throwDatabaseError(rowsError);
  const rowIds = (rows ?? []).map(({ id }) => id);
  const { data: measurements, error: measurementsError } = rowIds.length
    ? await supabase.from("size_guide_measurements").select("size_guide_row_id, measurement_code, label, value, unit, sort_order").in("size_guide_row_id", rowIds).order("sort_order", { ascending: true }).limit(300)
    : { data: [], error: null };
  if (measurementsError) throwDatabaseError(measurementsError);
  return { guides: guides ?? [], guide, rows: (rows ?? []).map((row) => ({ ...row, measurements: (measurements ?? []).filter((measurement) => measurement.size_guide_row_id === row.id) })) };
}
