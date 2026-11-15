"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PriceDisplay } from "@/components/shared/price-display";

export type ProductCardData = { id: string; slug: string; name: string; subtitle?: string | null; imageUrl: string | null; imageAlt: string; price: number; compareAtPrice?: number | null; badge?: string | null; availability?: "available" | "unavailable" | "unknown" };
export function ProductCard({ product, saved = false, wishlistBusy = false, onToggleWishlist, onQuickAdd }: { product: ProductCardData; saved?: boolean; wishlistBusy?: boolean; onToggleWishlist?: (productId: string) => void; onQuickAdd?: (product: ProductCardData) => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <article className="product-card">
    <div className="product-card__media">
      <Link className="product-card__image-link" href={`/products/${encodeURIComponent(product.slug)}`} aria-label={`View ${product.name}`}>
        {product.imageUrl && !imageFailed ? <Image src={product.imageUrl} alt={product.imageAlt} fill sizes="(max-width: 767px) 46vw, (max-width: 1199px) 30vw, 22vw" className="product-card__image" onError={() => setImageFailed(true)} /> : <span className="product-card__image-fallback" role="img" aria-label={product.imageAlt}>Image unavailable</span>}
      </Link>
      {product.badge && <span className="product-card__badge">{product.badge}</span>}
      {onToggleWishlist && <button className="product-card__wishlist" type="button" aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${saved ? "from" : "to"} wishlist`} aria-pressed={saved} disabled={wishlistBusy} onClick={() => onToggleWishlist(product.id)}><HeartIcon filled={saved} /></button>}
    </div>
    <div className="product-card__details"><Link href={`/products/${encodeURIComponent(product.slug)}`} className="product-card__title type-title-md">{product.name}</Link>{product.subtitle && <p className="product-card__subtitle type-body-sm">{product.subtitle}</p>}<PriceDisplay amount={product.price} compareAt={product.compareAtPrice} />
      {product.availability === "unavailable" && <p className="product-card__availability">Currently unavailable</p>}
      {product.availability === "unknown" && <p className="product-card__availability">Availability confirmed with product details</p>}
      {onQuickAdd && <button className="product-card__quick-add" type="button" onClick={() => onQuickAdd(product)}>Choose options</button>}
    </div>
  </article>;
}

function HeartIcon({ filled }: { filled: boolean }) { return <svg aria-hidden="true" viewBox="0 0 24 24" className="product-card__heart" fill={filled ? "currentColor" : "none"}><path d="M20.8 8.7c0 4.2-8.8 10.1-8.8 10.1S3.2 12.9 3.2 8.7A4.4 4.4 0 0 1 12 6.6a4.4 4.4 0 0 1 8.8 2.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>; }
