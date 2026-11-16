import "server-only";

import { requirePermission } from "@/lib/auth/authorization";
import { throwDatabaseError, validationError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import { approvedPublicMediaUrl } from "@/lib/utils/public-media";
import { adminProductListSchema, adminProductStatusSchema, adminVariantStatusSchema } from "@/lib/validations/admin-catalog";
import type { AdminVariantOptionCode } from "@/types/admin-catalog";

const ADMIN_PRODUCT_PAGE_SIZE = 20;

export async function getAdminCatalogCategories() {
  const supabase = await createClient();
  await requirePermission("products.manage");
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .is("deleted_at", null)
    .order("name")
    .limit(200);
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminProducts(input: unknown = {}) {
  const parsed = adminProductListSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("products.manage");
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, slug, status, default_price, sale_price, is_featured, updated_at, product_media(sort_order, is_primary, alt_text, media_assets(public_url, alt_text))", { count: "exact" })
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .range((parsed.data.page - 1) * ADMIN_PRODUCT_PAGE_SIZE, parsed.data.page * ADMIN_PRODUCT_PAGE_SIZE - 1);
  if (parsed.data.status !== "all") query = query.eq("status", parsed.data.status);
  if (parsed.data.search) query = query.ilike("name", `%${parsed.data.search.replace(/[%_]/g, "\\$&")}%`);
  const { data, error, count } = await query;
  if (error) throwDatabaseError(error);
  const rows = (data ?? []).map((product) => {
    const media = [...(product.product_media ?? [])].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    }).find((item) => item.media_assets?.public_url);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
      defaultPrice: product.default_price,
      salePrice: product.sale_price,
      isFeatured: product.is_featured,
      updatedAt: product.updated_at,
      imageUrl: approvedPublicMediaUrl(media?.media_assets?.public_url),
      imageAlt: media?.alt_text ?? media?.media_assets?.alt_text ?? product.name,
    };
  });
  return {
    products: rows,
    page: parsed.data.page,
    pageSize: ADMIN_PRODUCT_PAGE_SIZE,
    total: count ?? 0,
    search: parsed.data.search,
    status: parsed.data.status,
  };
}

export async function getAdminCatalogProduct(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return null;
  const supabase = await createClient();
  await requirePermission("products.manage");
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, slug, short_description, description, material, care_instructions, fit_notes, product_type, status, default_price, sale_price, is_featured, seo_title, seo_description")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (productError) throwDatabaseError(productError);
  if (!product) return null;

  const [categoryLinks, categories, variants, media] = await Promise.all([
    supabase.from("product_categories").select("category_id").eq("product_id", id).order("sort_order"),
    supabase.from("categories").select("id, slug, name").is("deleted_at", null).order("name").limit(200),
    supabase.from("product_variants")
      .select("id, sku, price_override, sale_price_override, status, sort_order")
      .eq("product_id", id)
      .is("deleted_at", null)
      .order("sort_order")
      .limit(200),
    supabase.from("product_media")
      .select("media_asset_id, sort_order, is_primary, alt_text, media_assets(id, public_url, alt_text, width, height, bytes)")
      .eq("product_id", id)
      .is("variant_id", null)
      .order("sort_order")
      .limit(20),
  ]);
  if (categoryLinks.error) throwDatabaseError(categoryLinks.error);
  if (categories.error) throwDatabaseError(categories.error);
  if (variants.error) throwDatabaseError(variants.error);
  if (media.error) throwDatabaseError(media.error);

  const variantIds = (variants.data ?? []).map(({ id: variantId }) => variantId);
  const optionResult = variantIds.length
    ? await supabase.from("product_variant_options")
      .select("variant_id, attribute_id, attribute_value_id")
      .in("variant_id", variantIds)
    : { data: [], error: null };
  if (optionResult.error) throwDatabaseError(optionResult.error);

  const optionAttributeIds = [...new Set((optionResult.data ?? []).map(({ attribute_id }) => attribute_id))];
  const optionValueIds = [...new Set((optionResult.data ?? []).map(({ attribute_value_id }) => attribute_value_id))];
  const [optionAttributes, optionValues] = await Promise.all([
    optionAttributeIds.length
      ? supabase.from("attributes").select("id, code").in("id", optionAttributeIds)
      : Promise.resolve({ data: [], error: null }),
    optionValueIds.length
      ? supabase.from("attribute_values").select("id, value, label, swatch_hex").in("id", optionValueIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (optionAttributes.error) throwDatabaseError(optionAttributes.error);
  if (optionValues.error) throwDatabaseError(optionValues.error);
  const attributeById = new Map((optionAttributes.data ?? []).map((attribute) => [attribute.id, attribute]));
  const valueById = new Map((optionValues.data ?? []).map((value) => [value.id, value]));
  const productOptions: Array<{ variantId: string; code: AdminVariantOptionCode; value: string; label: string; swatchHex: string | null }> = (optionResult.data ?? []).flatMap((option) => {
    const attribute = attributeById.get(option.attribute_id);
    const value = valueById.get(option.attribute_value_id);
    if (!attribute || !value || (attribute.code !== "size" && attribute.code !== "colour")) return [];
    const code: AdminVariantOptionCode = attribute.code === "size" ? "size" : "colour";
    return [{ variantId: option.variant_id, code, value: value.value, label: value.label, swatchHex: value.swatch_hex }];
  });

  return {
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.short_description ?? "",
      description: product.description ?? "",
      material: product.material ?? "",
      careInstructions: product.care_instructions ?? "",
      fitNotes: product.fit_notes ?? "",
      productType: product.product_type ?? "",
      status: adminProductStatusSchema.parse(product.status),
      defaultPrice: product.default_price,
      salePrice: product.sale_price,
      isFeatured: product.is_featured,
      seoTitle: product.seo_title ?? "",
      seoDescription: product.seo_description ?? "",
      categoryIds: (categoryLinks.data ?? []).map(({ category_id }) => category_id),
      variants: (variants.data ?? []).map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        status: adminVariantStatusSchema.parse(variant.status),
        priceOverride: variant.price_override,
        salePriceOverride: variant.sale_price_override,
        sortOrder: variant.sort_order,
        options: productOptions.filter((option) => option.variantId === variant.id).map((option) => ({
          code: option.code,
          value: option.value ?? "",
          label: option.label ?? "",
          swatchHex: option.swatchHex,
        })),
      })),
      media: (media.data ?? []).flatMap((item) => {
        const asset = item.media_assets;
        const imageUrl = approvedPublicMediaUrl(asset?.public_url);
        if (!asset || !imageUrl) return [];
        return [{
          assetId: asset.id,
          url: imageUrl,
          altText: item.alt_text ?? asset.alt_text ?? product.name,
          width: asset.width,
          height: asset.height,
          bytes: asset.bytes,
          isPrimary: item.is_primary,
          sortOrder: item.sort_order,
        }];
      }),
    },
    categories: categories.data ?? [],
  };
}
