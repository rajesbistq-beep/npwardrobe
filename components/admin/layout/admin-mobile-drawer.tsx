"use client";

import { useEffect, useRef, useState } from "react";
import { AdminSidebar } from "./admin-sidebar";

export function AdminMobileDrawer() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <div className="admin-mobile-drawer">
      <button className="admin-menu-toggle" type="button" aria-expanded={open} aria-controls="admin-mobile-panel" onClick={() => setOpen((value) => !value)}>
        <span className="sr-only">{open ? "Close" : "Open"} administration menu</span><span aria-hidden="true">☰</span>
      </button>
      {open && <dialog ref={dialogRef} id="admin-mobile-panel" className="admin-mobile-drawer__panel" aria-label="Administration navigation" onCancel={() => setOpen(false)} onClose={() => setOpen(false)}>
          <button className="admin-mobile-drawer__close" type="button" onClick={() => setOpen(false)}>Close menu</button>
          <AdminSidebar onNavigate={() => setOpen(false)} />
      </dialog>}
    </div>
  );
}
