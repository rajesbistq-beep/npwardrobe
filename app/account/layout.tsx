import type { ReactNode } from "react";
import { StorefrontFooter } from "@/components/storefront/layout/storefront-footer";
import { StorefrontHeader } from "@/components/storefront/layout/storefront-header";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <div className="storefront-shell"><StorefrontHeader /><main className="storefront-main">{children}</main><StorefrontFooter /></div>;
}
