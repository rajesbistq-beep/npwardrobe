import type { ReactNode } from "react";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return <main className="admin-auth-layout">{children}</main>;
}
