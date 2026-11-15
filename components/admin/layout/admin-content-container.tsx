import type { ReactNode } from "react";

export function AdminContentContainer({ children }: { children: ReactNode }) {
  return <main className="admin-content-container">{children}</main>;
}
