"use client";

import Link from "next/link";
import { useState } from "react";

type NavigationLink = { href: string; label: string };

export function MobileNavigation({ links }: { links: NavigationLink[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-navigation">
      <button className="mobile-navigation__toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
        <span className="sr-only">{open ? "Close" : "Open"} navigation</span>
        <span aria-hidden="true" className="menu-glyph">{open ? "×" : "☰"}</span>
      </button>
      {open && (
        <nav className="mobile-navigation__panel" id="mobile-menu" aria-label="Mobile navigation">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
          <Link href="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
          <Link href="/cart" onClick={() => setOpen(false)}>Shopping bag</Link>
          <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
        </nav>
      )}
    </div>
  );
}
