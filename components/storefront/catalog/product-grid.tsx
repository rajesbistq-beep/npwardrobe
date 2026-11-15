import { ProductTile } from "./product-tile";
import type { ProductCardData } from "@/components/storefront/product-card";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return <div className="product-grid">{products.map((product) => <ProductTile key={product.id} product={product} />)}</div>;
}
