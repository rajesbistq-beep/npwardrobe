import type { ReactNode } from "react";
import type { FeedbackTone } from "./feedback";
export function Toast({ open, tone = "info", children }: { open: boolean; tone?: FeedbackTone; children: ReactNode }) {
  if (!open) return null;
  return <div className={`toast toast--${tone}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"}>{children}</div>;
}
