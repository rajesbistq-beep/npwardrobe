import type { ReactNode } from "react";
export type FeedbackTone = "success" | "warning" | "error" | "info";
export function Feedback({ tone, title, children, className }: { tone: FeedbackTone; title?: string; children: ReactNode; className?: string }) {
  return <div className={`feedback feedback--${tone}${className ? ` ${className}` : ""}`} role={tone === "error" ? "alert" : "status"}>{title && <strong>{title}</strong>}<div>{children}</div></div>;
}
