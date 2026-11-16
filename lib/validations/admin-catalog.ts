import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).nullable();

export const adminProductStatusSchema = z.enum(["draft", "published", "archived"]);
export const adminVariantStatusSchema = z.enum(["active", "inactive", "archived"]);
export const uploadedAdminProductMediaSchema = z.object({
  media: z.object({
    assetId: z.uuid(),
    url: z.url(),
    altText: z.string().min(1).max(180),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    bytes: z.number().int().positive(),
    isPrimary: z.boolean(),
    sortOrder: z.number().int().min(0),
  }),
});

export const adminProductListSchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  status: z.enum(["all", "draft", "published", "archived"]).default("all"),
  search: z.string().trim().max(100).default(""),
});

export const adminCatalogProductSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: optionalText(500),
  description: optionalText(10000),
  material: optionalText(300),
  careInstructions: optionalText(1000),
  fitNotes: optionalText(1000),
  productType: optionalText(100),
  defaultPrice: z.number().finite().min(0).max(10000000),
  salePrice: z.number().finite().min(0).max(10000000).nullable(),
  status: adminProductStatusSchema,
  isFeatured: z.boolean(),
  seoTitle: optionalText(180),
  seoDescription: optionalText(320),
  categoryIds: z.array(z.uuid()).max(50),
  variants: z.array(z.object({
    id: z.uuid().optional(),
    sku: z.string().trim().min(1).max(100),
    status: adminVariantStatusSchema,
    priceOverride: z.number().finite().min(0).max(10000000).nullable(),
    salePriceOverride: z.number().finite().min(0).max(10000000).nullable(),
    sortOrder: z.number().int().min(0).max(10000),
    options: z.array(z.object({
      code: z.enum(["size", "colour"]),
      value: z.string().trim().min(1).max(80),
      label: z.string().trim().min(1).max(80),
      swatchHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
    })).max(2),
  })).min(1).max(200),
  media: z.array(z.object({
    assetId: z.uuid(),
    altText: z.string().trim().min(1).max(180),
    isPrimary: z.boolean(),
    sortOrder: z.number().int().min(0).max(10000),
  })).max(20),
}).superRefine((product, context) => {
  if (product.salePrice !== null && product.salePrice > product.defaultPrice) {
    context.addIssue({ code: "custom", path: ["salePrice"], message: "Sale price cannot exceed the regular price." });
  }
  const skus = product.variants.map(({ sku }) => sku.toLowerCase());
  if (new Set(skus).size !== skus.length) {
    context.addIssue({ code: "custom", path: ["variants"], message: "Each variant must have a unique SKU." });
  }
  for (const [index, variant] of product.variants.entries()) {
    const optionCodes = variant.options.map(({ code }) => code);
    if (new Set(optionCodes).size !== optionCodes.length) {
      context.addIssue({ code: "custom", path: ["variants", index, "options"], message: "A variant can have only one value per option." });
    }
    if (variant.salePriceOverride !== null && variant.salePriceOverride > (variant.priceOverride ?? product.defaultPrice)) {
      context.addIssue({ code: "custom", path: ["variants", index, "salePriceOverride"], message: "Variant sale price cannot exceed its regular price." });
    }
  }
  const primaryImages = product.media.filter(({ isPrimary }) => isPrimary);
  if (product.media.length > 0 && primaryImages.length !== 1) {
    context.addIssue({ code: "custom", path: ["media"], message: "Choose exactly one primary image." });
  }
});

export type AdminCatalogProductInput = z.infer<typeof adminCatalogProductSchema>;
