import type { ReactNode } from "react";
import { Suspense } from "react";
import { StorefrontFooter } from "@/components/storefront/layout/storefront-footer";
import { StorefrontHeader } from "@/components/storefront/layout/storefront-header";
import { StorefrontBottomNavigation } from "@/components/storefront/layout/storefront-bottom-navigation";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return <div className="storefront-shell"><StorefrontHeader /><main className="storefront-main">{children}</main><StorefrontFooter /><Suspense fallback={null}><StorefrontBottomNavigation /></Suspense></div>;
}
