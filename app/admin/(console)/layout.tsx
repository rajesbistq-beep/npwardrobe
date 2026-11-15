import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminTopbar } from "@/components/admin/layout/admin-topbar";
import { getAuthorizationContext } from "@/lib/auth/authorization";

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="access-check" role="status">Checking staff access…</div>}><AuthorizedAdminShell>{children}</AuthorizedAdminShell></Suspense>;
}

async function AuthorizedAdminShell({ children }: { children: ReactNode }) {
  const context = await getAuthorizationContext();
  if (!context) redirect("/admin/login");
  if (context.kind === "mfa_required") redirect("/admin/mfa");
  if (!("roleCodes" in context) || context.roleCodes.length === 0 || context.permissions.length === 0) redirect("/");

  return <div className="admin-shell"><AdminSidebar /><div className="admin-workspace"><AdminTopbar /><div className="admin-main">{children}</div></div></div>;
}
