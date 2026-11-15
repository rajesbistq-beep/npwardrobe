import Link from "next/link";
import { MobileNavigation } from "./mobile-navigation";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/curated", label: "Curated" },
];

export function StorefrontHeader() {
  return (
    <header className="storefront-header">
      <div className="storefront-header__inner">
        <MobileNavigation links={links} />
        <Link className="brand-lockup" href="/" aria-label="NP Wardrobe home">
          <span className="brand-lockup__name">NP Wardrobe</span>
        </Link>
        <nav className="storefront-nav" aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <nav className="storefront-actions" aria-label="Your shopping">
          <Link href="/shop" aria-label="Search the shop">Search</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/cart">Bag</Link>
          <Link href="/account">Account</Link>
        </nav>
      </div>
    </header>
  );
}
