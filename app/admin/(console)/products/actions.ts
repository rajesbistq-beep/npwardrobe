"use server";

import { revalidatePath } from "next/cache";
import { AppError, throwDatabaseError } from "@/lib/errors/app-error";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
import { adminCatalogProductSchema } from "@/lib/validations/admin-catalog";

export type ProductActionState = {
  status: "idle" | "error" | "success";
  message: string;
  productId?: string;
  fieldErrors?: Record<string, string[]>;
};

function readJson(formData: FormData, key: string): unknown {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.NaN;
}

export async function saveCatalogProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = adminCatalogProductSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription") || null,
    description: formData.get("description") || null,
    material: formData.get("material") || null,
    careInstructions: formData.get("careInstructions") || null,
    fitNotes: formData.get("fitNotes") || null,
    productType: formData.get("productType") || null,
    defaultPrice: numberOrNull(formData.get("defaultPrice")),
    salePrice: numberOrNull(formData.get("salePrice")),
    status: formData.get("status"),
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
    categoryIds: formData.getAll("categoryId"),
    variants: readJson(formData, "variants"),
    media: readJson(formData, "media"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the highlighted product details and try again.",
      fieldErrors: parsed.error.issues.reduce<Record<string, string[]>>((errors, issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        errors[key] ??= [];
        errors[key].push(issue.message);
        return errors;
      }, {}),
    };
  }

  try {
    await requirePermission("products.manage");
    const supabase = await createClient();
    const oldSlugResult = parsed.data.id
      ? await supabase.from("products").select("slug").eq("id", parsed.data.id).maybeSingle()
      : { data: null, error: null };
    if (oldSlugResult.error) throwDatabaseError(oldSlugResult.error);

    const { data: productId, error } = await supabase.rpc("save_catalog_product", {
      p_product: {
        ...(parsed.data.id ? { id: parsed.data.id } : {}),
        slug: parsed.data.slug,
        name: parsed.data.name,
        short_description: parsed.data.shortDescription,
        description: parsed.data.description,
        material: parsed.data.material,
        care_instructions: parsed.data.careInstructions,
        fit_notes: parsed.data.fitNotes,
        product_type: parsed.data.productType,
        status: parsed.data.status,
        default_price: parsed.data.defaultPrice,
        sale_price: parsed.data.salePrice,
        is_featured: parsed.data.isFeatured,
        seo_title: parsed.data.seoTitle,
        seo_description: parsed.data.seoDescription,
      },
      p_categories: parsed.data.categoryIds,
      p_variants: parsed.data.variants.map((variant) => ({
        ...(variant.id ? { id: variant.id } : {}),
        sku: variant.sku,
        status: variant.status,
        price_override: variant.priceOverride,
        sale_price_override: variant.salePriceOverride,
        sort_order: variant.sortOrder,
        options: variant.options.map((option) => ({
          code: option.code,
          value: option.value,
          label: option.label,
          swatch_hex: option.swatchHex,
        })),
      })),
      p_media: parsed.data.media.map((image) => ({
        asset_id: image.assetId,
        alt_text: image.altText,
        is_primary: image.isPrimary,
        sort_order: image.sortOrder,
      })),
    });
    if (error) throwDatabaseError(error);
    if (!productId) throw new AppError("DATABASE_ERROR", "The product could not be saved.");

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/categories");
    revalidatePath("/categories/[slug]", "page");
    revalidatePath("/collections");
    revalidatePath("/collections/[slug]", "page");
    if (oldSlugResult.data?.slug) revalidatePath(`/products/${oldSlugResult.data.slug}`);
    revalidatePath(`/products/${parsed.data.slug}`);
    revalidatePath("/admin/products");
    return { status: "success", message: "Product saved.", productId };
  } catch (error) {
    if (error instanceof AppError) return { status: "error", message: error.message };
    throw error;
  }
}
