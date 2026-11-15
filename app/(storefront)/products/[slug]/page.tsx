import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/storefront/catalog/product-detail-client";
import { ErrorState } from "@/components/shared/states";
import { AppError } from "@/lib/errors/app-error";
import { getApprovedProductReviews, getProductExtras, getPublishedProductBySlug } from "@/services/catalog.service";
import { captureAsync } from "@/lib/utils/capture-async";

type Props = PageProps<"/products/[slug]">;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getPublishedProductBySlug(slug);
    const title = product.seo_title || product.name;
    const description = product.seo_description || product.short_description || product.description || `Explore ${product.name} from NP Wardrobe.`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    let canonical: string | undefined;
    if (siteUrl) {
      const expected = new URL(`/products/${encodeURIComponent(product.slug)}`, siteUrl);
      if (product.canonical_url) {
        try {
          const stored = new URL(product.canonical_url, siteUrl);
          if (stored.origin === expected.origin && stored.pathname === expected.pathname) canonical = stored.toString();
        } catch { canonical = undefined; }
      }
      canonical ??= expected.toString();
    }
    const images = product.media[0]?.publicUrl ? [{ url: product.media[0].publicUrl, alt: product.media[0].altText || product.name }] : undefined;
    return { title, description, alternates: canonical ? { canonical } : undefined, openGraph: { title, description, type: "website", url: canonical, images } };
  } catch { return { title: "Product unavailable", description: "View published products from NP Wardrobe." }; }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const productResult = await captureAsync(getPublishedProductBySlug(slug));
  if (!productResult.ok) {
    if (productResult.error instanceof AppError && productResult.error.code === "NOT_FOUND") notFound();
    return <div className="catalog-page"><ErrorState title="This product is unavailable" description="We could not load the product details. Please reload the page to try again." /></div>;
  }
    const product = productResult.data;
    const extrasResult = await captureAsync(Promise.all([getProductExtras(product.id), getApprovedProductReviews(product.id)]));
    if (!extrasResult.ok) return <div className="catalog-page"><ErrorState title="This product is unavailable" description="We could not load the product details. Please reload the page to try again." /></div>;
    const [extras, reviews] = extrasResult.data;
    const sizeGuide = extras.sizeGuides[0];
    return <ProductDetailClient product={product} reviews={reviews} sizeGuideHref={sizeGuide ? `/size-guide?guide=${encodeURIComponent(sizeGuide.slug)}` : undefined} relatedProducts={extras.relatedProducts} />;
}
