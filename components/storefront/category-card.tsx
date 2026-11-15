import Image from "next/image";
import Link from "next/link";
export type EditorialCardData = { title: string; href: string; imageUrl: string; imageAlt: string; description?: string };
export function CategoryCard({ item, size = "regular" }: { item: EditorialCardData; size?: "regular" | "feature" }) {
  return <Link className={`editorial-card editorial-card--${size}`} href={item.href}><Image src={item.imageUrl} alt={item.imageAlt} fill sizes={size === "feature" ? "(max-width: 767px) 92vw, 58vw" : "(max-width: 767px) 46vw, 30vw"} unoptimized className="editorial-card__image" /><span className="editorial-card__shade" aria-hidden="true" /><span className="editorial-card__copy"><span className="type-headline-sm">{item.title}</span>{item.description && <span className="type-body-sm">{item.description}</span>}<span className="editorial-card__link">Explore <span aria-hidden="true">→</span></span></span></Link>;
}
