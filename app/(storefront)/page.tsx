import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getActiveCategories, getHomepageBanners, getPublishedCollections, getPublishedProducts } from "@/services/catalog.service";
import { CategoryCard } from "@/components/storefront/category-card";
import { ProductGrid } from "@/components/storefront/catalog/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { toProductCardData } from "@/lib/catalog/presentation";
import { captureAsync } from "@/lib/utils/capture-async";

export async function generateMetadata(): Promise<Metadata> {
  const banners = await captureAsync(getHomepageBanners());
  const hero = banners.ok ? banners.data.find((banner) => banner.placement === "homepage_hero") : null;
  const title = hero?.copy?.headline || "NP Wardrobe | Considered fashion";
  const description = hero?.copy?.subheadline || "Explore the published collection from NP Wardrobe.";
  return { title, description, openGraph: { title, description, type: "website", images: hero?.image.public_url ? [{ url: hero.image.public_url, alt: hero.copy?.alt_text || hero.image.alt_text || "NP Wardrobe" }] : undefined } };
}

export default async function HomePage() {
  const loaded = await captureAsync(Promise.all([
      getHomepageBanners(), getActiveCategories(), getPublishedCollections(),
      getPublishedProducts({ page: 1, pageSize: 8, featuredOnly: true, sort: "featured" }),
      getPublishedProducts({ page: 1, pageSize: 8, sort: "newest" }),
    ]));
  if (!loaded.ok) return <div className="catalog-page"><ErrorState title="The catalogue is unavailable" description="We could not load the published collection. Please try again later." /></div>;
    const [banners, categories, collections, featured, latest] = loaded.data;
    const imageCategories = categories.filter((category) => category.image?.public_url);
    const products = featured.items.length ? featured.items : latest.items;
    const hero = banners.find((banner) => banner.placement === "homepage_hero");
    const announcement = banners.find((banner) => banner.placement === "announcement");
    const bannerHref = (target: string | null) => target && target.startsWith("/") && !target.startsWith("//") && !target.includes("\\") ? target : null;
    return <div className="catalog-page home-page">
      {announcement && <aside className="home-announcement" aria-label="Store announcement">{announcement.copy?.headline && <strong>{announcement.copy.headline}</strong>}{announcement.copy?.subheadline && <span>{announcement.copy.subheadline}</span>}{bannerHref(announcement.target_url) && <Link href={bannerHref(announcement.target_url)!}>{announcement.copy?.cta_label || "Learn more"}</Link>}</aside>}
      {hero ? <section className="home-hero" aria-label="Featured editorial"><Image src={hero.image.public_url!} alt={hero.copy?.alt_text || hero.image.alt_text || ""} fill sizes="100vw" priority className="home-hero__image" /><span className="home-hero__veil" /><div className="home-hero__copy"><p className="type-label-sm">NP Wardrobe</p><h1 className="type-display">{hero.copy?.headline || "A considered wardrobe"}</h1>{hero.copy?.subheadline && <p className="type-body-lg">{hero.copy.subheadline}</p>}{bannerHref(hero.target_url) && <Link className="ui-button" href={bannerHref(hero.target_url)!}>{hero.copy?.cta_label || "Explore the edit"}</Link>}</div></section>
        : <section className="home-hero home-hero--text"><p className="type-label-sm">NP Wardrobe</p><h1 className="type-display">A considered wardrobe</h1><p className="type-body-lg">Explore the published collection and discover pieces selected for your wardrobe.</p><Link className="ui-button" href="/shop">Explore the shop</Link></section>}

      <section className="catalog-section" aria-labelledby="home-categories"><SectionHeading eyebrow="Find your edit" title="Explore by category" titleId="home-categories" />{imageCategories.length ? <div className="editorial-grid">{imageCategories.slice(0, 6).map((category) => <CategoryCard key={category.id} item={{ title: category.name, href: `/categories/${encodeURIComponent(category.slug)}`, description: category.description ?? undefined, imageUrl: category.image!.public_url!, imageAlt: category.image!.alt_text || category.name }} />)}</div> : <EmptyState title="Categories are being prepared" description="Published category edits will appear here when they are available." actionLabel="Browse the shop" actionHref="/shop" />}{categories.length > 0 && <p className="category-links">{categories.filter((category) => !category.image?.public_url).map((category) => <Link key={category.id} href={`/categories/${encodeURIComponent(category.slug)}`}>{category.name}</Link>)}</p>}</section>

      {collections.length > 0 && <section className="catalog-section"><SectionHeading eyebrow="Curated for you" title="The edits" action={<Link className="text-link" href="/curated">View all</Link>} /><div className="collection-list">{collections.slice(0, 4).map((collection) => <Link className="collection-link" key={collection.id} href={`/collections/${encodeURIComponent(collection.slug)}`}>{collection.image?.public_url && <Image src={collection.image.public_url} alt={collection.image.alt_text || collection.name} fill sizes="(max-width: 767px) 92vw, 30vw" />}<span className="type-headline-sm">{collection.name}</span>{collection.description && <span className="type-body-sm">{collection.description}</span>}</Link>)}</div></section>}

      <section className="catalog-section"><SectionHeading eyebrow={featured.items.length ? "Selected pieces" : "The collection"} title={featured.items.length ? "Featured pieces" : "Discover the collection"} action={<Link className="text-link" href="/shop">Shop all</Link>} />{products.length ? <ProductGrid products={products.map(toProductCardData)} /> : <EmptyState title="The collection is being prepared" description="Published product details will appear here when they are available." actionLabel="Explore categories" actionHref="/categories" />}</section>
      <section className="home-brand-note"><p className="type-label-sm">NP Wardrobe</p><h2 className="type-headline-md">A wardrobe, considered.</h2><p className="type-body-md">Discover the collection and find the pieces that feel right for you.</p><Link className="text-link" href="/about">Our story</Link></section>
    </div>;
}
