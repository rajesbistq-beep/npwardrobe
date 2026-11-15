import Link from "next/link";

export function StorefrontFooter() {
  return (
    <footer className="storefront-footer">
      <div className="storefront-footer__inner">
        <div><p className="brand-lockup__name">NP Wardrobe</p><p>Women’s fashion from Nepal.</p></div>
        <nav aria-label="Customer care">
          <Link href="/about">Our story</Link><Link href="/faq">FAQ</Link><Link href="/shipping-returns">Shipping &amp; returns</Link><Link href="/contact">Contact</Link>
        </nav>
        <a className="whatsapp-link" href="https://wa.me/9779740258617" target="_blank" rel="noreferrer">Contact us on WhatsApp</a>
      </div>
      <p className="storefront-footer__legal">© NP Wardrobe. All rights reserved.</p>
    </footer>
  );
}
