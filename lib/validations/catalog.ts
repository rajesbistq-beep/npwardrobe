import { z } from "zod";

const slugSchema = z.string().trim().min(1).refine((value) => value === value.toLowerCase());

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(24),
});

export const productSlugSchema = slugSchema;

export const productListFiltersSchema = paginationSchema.extend({
  search: z.string().trim().min(1).max(100).optional(),
  categorySlug: slugSchema.optional(),
  collectionSlug: slugSchema.optional(),
  sizeValueIds: z.array(z.uuid()).max(30).optional(),
  colourValueIds: z.array(z.uuid()).max(30).optional(),
  minPrice: z.coerce.number().min(0).max(10000000).optional(),
  maxPrice: z.coerce.number().min(0).max(10000000).optional(),
  featuredOnly: z.boolean().optional(),
  sort: z.enum(["newest", "featured", "price_asc", "price_desc"]).default("featured"),
}).refine((value) => value.minPrice === undefined || value.maxPrice === undefined || value.minPrice <= value.maxPrice);

export type ProductListFilters = z.infer<typeof productListFiltersSchema>;
