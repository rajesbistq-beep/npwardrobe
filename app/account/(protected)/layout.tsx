import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAuthorizationContext } from "@/lib/auth/authorization";

export default async function CustomerAccountLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="access-check" role="status">Checking your account…</div>}><AuthorizedCustomerAccount>{children}</AuthorizedCustomerAccount></Suspense>;
}

async function AuthorizedCustomerAccount({ children }: { children: ReactNode }) {
  const context = await getAuthorizationContext();
  if (context?.kind !== "customer") redirect("/auth/login");
  return <div className="account-layout">{children}</div>;
}
