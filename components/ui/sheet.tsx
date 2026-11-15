"use client";
import type { ReactNode } from "react";
import { Dialog } from "./dialog";
export function Sheet({ open, onClose, title, description, side = "right", children, footer }: { open: boolean; onClose: () => void; title: string; description?: string; side?: "left" | "right" | "bottom"; children: ReactNode; footer?: ReactNode }) {
  return <Dialog open={open} onClose={onClose} title={title} description={description} footer={footer} className={`ui-sheet ui-sheet--${side}`}>{children}</Dialog>;
}
