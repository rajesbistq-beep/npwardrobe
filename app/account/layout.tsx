import type { ReactNode } from "react";
import { Suspense } from "react";
import { StorefrontFooter } from "@/components/storefront/layout/storefront-footer";
import { StorefrontHeader } from "@/components/storefront/layout/storefront-header";
import { signOut } from "@/app/actions/auth";
import { getAuthorizationContext } from "@/lib/auth/authorization";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <div className="storefront-shell"><StorefrontHeader /><Suspense><AccountSignOut /></Suspense><main className="storefront-main">{children}</main><StorefrontFooter /></div>;
}

async function AccountSignOut() {
  const context = await getAuthorizationContext();
  return context ? <div className="account-signout"><form action={signOut}><button type="submit">Sign out</button></form></div> : null;
}
