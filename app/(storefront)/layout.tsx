import type { ReactNode } from "react";
import { Suspense } from "react";
import { StorefrontFooter } from "@/components/storefront/layout/storefront-footer";
import { StorefrontHeader } from "@/components/storefront/layout/storefront-header";
import { StorefrontBottomNavigation } from "@/components/storefront/layout/storefront-bottom-navigation";
import { CatalogStoreHydrator } from "@/components/storefront/catalog/catalog-store-hydrator";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return <div className="storefront-shell"><CatalogStoreHydrator /><StorefrontHeader /><main className="storefront-main">{children}</main><StorefrontFooter /><Suspense fallback={null}><StorefrontBottomNavigation /></Suspense></div>;
}
