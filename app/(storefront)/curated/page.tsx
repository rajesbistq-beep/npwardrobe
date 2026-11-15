import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { getActiveCategories, getPublishedCollections } from "@/services/catalog.service";
import { captureAsync } from "@/lib/utils/capture-async";

export const metadata: Metadata = { title: "Curated edits", description: "Explore published editorial collections from NP Wardrobe." };

export default async function CuratedPage() {
  const loaded = await captureAsync(Promise.all([getPublishedCollections(), getActiveCategories()]));
  if (!loaded.ok) return <div className="catalog-page"><ErrorState title="Curated edits are unavailable" description="We could not load published collections. Please reload the page to try again." /></div>;
    const [collections, categories] = loaded.data;
    return <div className="catalog-page"><header className="catalog-intro"><p className="type-label-sm">NP Wardrobe</p><h1 className="type-headline-lg">Curated edits</h1><p className="type-body-md">Explore the published collections.</p></header>
      <section className="catalog-section"><h2 className="type-headline-md">Categories</h2>{categories.length ? <nav className="category-links" aria-label="Published categories">{categories.filter((category) => category.parent_id === null).map((category) => <span key={category.id}><Link href={`/categories/${encodeURIComponent(category.slug)}`}>{category.name}</Link>{categories.filter((child) => child.parent_id === category.id).map((child) => <Link key={child.id} href={`/categories/${encodeURIComponent(child.slug)}`}>{child.name}</Link>)}</span>)}</nav> : <p>No published categories are available yet.</p>}</section>
      <section className="catalog-section"><h2 className="type-headline-md">Collections</h2>{collections.length ? <div className="collection-list collection-list--directory">{collections.map((collection) => <Link className="collection-link" key={collection.id} href={`/collections/${encodeURIComponent(collection.slug)}`}>{collection.image?.public_url && <Image src={collection.image.public_url} alt={collection.image.alt_text || collection.name} fill sizes="(max-width: 767px) 92vw, 30vw" />}<span className="type-headline-sm">{collection.name}</span>{collection.description && <span className="type-body-sm">{collection.description}</span>}<span className="editorial-card__link">Explore →</span></Link>)}</div> : <EmptyState title="No published collections yet" description="Curated edits will appear here when they are published." actionLabel="Browse all products" actionHref="/shop" />}</section>
    </div>;
}
