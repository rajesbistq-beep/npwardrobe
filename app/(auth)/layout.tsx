import type { ReactNode } from "react";

export default function CustomerAuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-layout">{children}</main>;
}
