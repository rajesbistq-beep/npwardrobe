"use client";
import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
export function Dialog({ open, onClose, title, description, children, footer, className }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { const element = ref.current; if (!element) return; if (open && !element.open) element.showModal(); else if (!open && element.open) element.close(); }, [open]);
  return <dialog ref={ref} className={`ui-dialog${className ? ` ${className}` : ""}`} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={onClose}><header className="ui-dialog__header"><div><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div><button className="ui-dialog__close" type="button" aria-label="Close dialog" onClick={onClose}>×</button></header><div className="ui-dialog__body">{children}</div>{footer && <footer className="ui-dialog__footer">{footer}</footer>}</dialog>;
}
