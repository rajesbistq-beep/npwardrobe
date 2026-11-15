"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/shop", label: "Shop", icon: "search" },
  { href: "/wishlist", label: "Saved", icon: "heart" },
  { href: "/cart", label: "Bag", icon: "bag" },
  { href: "/account", label: "Profile", icon: "profile" },
] as const;
const focusedPrefixes = ["/cart", "/checkout", "/order-confirmation"];
export function StorefrontBottomNavigation() {
  const pathname = usePathname();
  if (focusedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return null;
  return <nav className="storefront-bottom-nav" aria-label="Primary mobile navigation">{tabs.map((tab) => {
    const active = tab.href === "/" ? pathname === "/" : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
    return <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined}><span className="storefront-bottom-nav__icon" aria-hidden="true"><TabIcon name={tab.icon} /></span><span>{tab.label}</span></Link>;
  })}</nav>;
}

function TabIcon({ name }: { name: (typeof tabs)[number]["icon"] }) {
  const paths = {
    home: <path d="m3.5 10 8.5-7 8.5 7v10.5H14v-6h-4v6H3.5V10Z" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    heart: <path d="M20.6 8.7c0 4.2-8.6 10.1-8.6 10.1S3.4 12.9 3.4 8.7a4.4 4.4 0 0 1 8.6-1.8 4.4 4.4 0 0 1 8.6 1.8Z" />,
    bag: <><path d="M4 8h16l1 13H3L4 8Z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
