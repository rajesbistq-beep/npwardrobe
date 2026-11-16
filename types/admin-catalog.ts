export type AdminProductStatus = "draft" | "published" | "archived";
export type AdminVariantStatus = "active" | "inactive" | "archived";
export type AdminVariantOptionCode = "size" | "colour";

export interface AdminProductImage {
  assetId: string;
  url: string;
  altText: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface AdminProductVariant {
  id?: string;
  sku: string;
  status: AdminVariantStatus;
  priceOverride: number | null;
  salePriceOverride: number | null;
  sortOrder: number;
  options: Array<{
    code: AdminVariantOptionCode;
    value: string;
    label: string;
    swatchHex: string | null;
  }>;
}

export interface AdminProductEditorData {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  material: string;
  careInstructions: string;
  fitNotes: string;
  productType: string;
  status: AdminProductStatus;
  defaultPrice: number | null;
  salePrice: number | null;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  categoryIds: string[];
  variants: AdminProductVariant[];
  media: AdminProductImage[];
}
