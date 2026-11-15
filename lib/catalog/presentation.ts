import type { ProductCard } from "@/types/domain";
import type { ProductCardData } from "@/components/storefront/product-card";

export function toProductCardData(product: ProductCard): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    subtitle: product.shortDescription,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    price: product.salePrice ?? product.defaultPrice,
    compareAtPrice: product.salePrice === null ? null : product.defaultPrice,
  };
}
