"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductGallery, type GalleryImage } from "@/components/storefront/product-gallery";
import { ProductPurchasePanel, type PurchaseVariant } from "@/components/storefront/catalog/product-purchase-panel";
import { EmptyState } from "@/components/shared/states";
import { formatDate } from "@/lib/utils/dates";

type ProductDetailData = {
  id: string; slug: string; name: string; short_description: string | null; description: string | null; material: string | null; care_instructions: string | null; fit_notes: string | null;
  currentPrice: number; compareAtPrice: number | null; media: { publicUrl: string | null; altText: string | null }[]; variants: PurchaseVariant[];
};
type RelatedProduct = { id: string; slug: string; name: string };
type ApprovedReview = { id: string | null; rating: number | null; title: string | null; body: string | null; verified_purchase: boolean | null; created_at: string | null };

export function ProductDetailClient({ product, sizeGuideHref, relatedProducts, reviews }: { product: ProductDetailData; sizeGuideHref?: string; relatedProducts: RelatedProduct[]; reviews: ApprovedReview[] }) {
  const [variantMedia, setVariantMedia] = useState<GalleryImage[]>([]);
  const images = variantMedia.length ? variantMedia : product.media.flatMap((media) => media.publicUrl ? [{ src: media.publicUrl, alt: media.altText || product.name }] : []);
  return <div className="catalog-page product-detail-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/shop">Shop</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav>
    <div className="product-detail-layout"><ProductGallery images={images} productName={product.name} />
      <div className="product-detail-copy"><p className="type-label-sm">NP Wardrobe</p><h1 className="type-headline-lg">{product.name}</h1>{product.short_description && <p className="type-body-lg">{product.short_description}</p>}
        <ProductPurchasePanel productId={product.id} productName={product.name} basePrice={product.currentPrice} baseCompareAt={product.compareAtPrice} variants={product.variants} sizeGuideHref={sizeGuideHref} onVariantMediaChange={setVariantMedia} />
        {product.description && <section className="product-copy-section"><h2 className="type-headline-sm">Details</h2><p>{product.description}</p></section>}
        {product.material && <section className="product-copy-section"><h2 className="type-headline-sm">Material</h2><p>{product.material}</p></section>}
        {product.fit_notes && <section className="product-copy-section"><h2 className="type-headline-sm">Fit</h2><p>{product.fit_notes}</p></section>}
        {product.care_instructions && <section className="product-copy-section"><h2 className="type-headline-sm">Care</h2><p>{product.care_instructions}</p></section>}
        {sizeGuideHref && <Link className="product-size-guide product-size-guide--detail" href={sizeGuideHref}>Size guide</Link>}
      </div>
    </div>
    {relatedProducts.length > 0 && <section className="product-related"><h2 className="type-headline-md">Related pieces</h2><ul>{relatedProducts.map((related) => <li key={related.id}><Link href={`/products/${encodeURIComponent(related.slug)}`}>{related.name}</Link></li>)}</ul></section>}
    {reviews.length > 0 && <section className="product-reviews"><h2 className="type-headline-md">Customer reviews</h2><ul>{reviews.map((review) => <li key={review.id ?? `${review.created_at}-${review.rating}`}><div aria-label={`${review.rating ?? 0} out of 5 stars`}>{"★".repeat(review.rating ?? 0)}</div>{review.title && <h3>{review.title}</h3>}{review.body && <p>{review.body}</p>}<p>{review.verified_purchase ? "Verified purchase" : "Customer review"}{review.created_at && <> · <time dateTime={review.created_at}>{formatDate(review.created_at)}</time></>}</p></li>)}</ul></section>}
    {product.variants.length === 0 && <EmptyState title="Variants are not currently available" description="This published product does not have an active variant to add to your bag." actionLabel="Continue browsing" actionHref="/shop" />}
  </div>;
}
