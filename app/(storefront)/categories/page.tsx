import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { getActiveCategories } from "@/services/catalog.service";
import { captureAsync } from "@/lib/utils/capture-async";

export const metadata: Metadata = { title: "Categories", description: "Explore published NP Wardrobe categories." };

export default async function CategoriesPage() {
  const loaded = await captureAsync(getActiveCategories());
  if (!loaded.ok) return <div className="catalog-page"><ErrorState title="Categories are unavailable" description="We could not load published categories. Please reload the page to try again." /></div>;
    const categories = loaded.data;
    if (!categories.length) return <div className="catalog-page"><header className="catalog-intro"><h1 className="type-headline-lg">Explore categories</h1></header><EmptyState title="Categories are being prepared" description="Published category edits will appear here when they are available." actionLabel="Browse the shop" actionHref="/shop" /></div>;
    const roots = categories.filter((category) => category.parent_id === null);
    return <div className="catalog-page"><header className="catalog-intro"><p className="type-label-sm">NP Wardrobe</p><h1 className="type-headline-lg">Explore categories</h1><p className="type-body-md">Find your edit from the published categories.</p></header><section className="category-directory" aria-label="Published categories">{roots.map((category) => <div key={category.id}><Link className="category-directory__item" href={`/categories/${encodeURIComponent(category.slug)}`}>{category.image?.public_url && <Image src={category.image.public_url} alt={category.image.alt_text || category.name} fill sizes="(max-width: 767px) 46vw, 30vw" />}<span className="category-directory__copy"><strong>{category.name}</strong>{category.description && <span>{category.description}</span>}<span>Explore →</span></span></Link>{categories.some((child) => child.parent_id === category.id) && <ul className="category-directory__children">{categories.filter((child) => child.parent_id === category.id).map((child) => <li key={child.id}><Link href={`/categories/${encodeURIComponent(child.slug)}`}>{child.name}</Link></li>)}</ul>}</div>)}</section></div>;
}
