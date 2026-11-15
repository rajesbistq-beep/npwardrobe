export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ProductSort = "newest" | "featured" | "price_asc" | "price_desc";

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  currencyCode: string;
  defaultPrice: number;
  salePrice: number | null;
  featured: boolean;
  imageUrl: string | null;
  imageAlt: string;
};

export type PublicMedia = {
  id: string;
  publicUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
};
