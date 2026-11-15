"use client";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
export function ConfirmationDialog({ open, onCancel, onConfirm, title, description, confirmLabel, cancelLabel = "Go back", busy = false }: { open: boolean; onCancel: () => void; onConfirm: () => void; title: string; description: string; confirmLabel: string; cancelLabel?: string; busy?: boolean }) {
  return <Dialog open={open} onClose={onCancel} title={title} description={description} footer={<><Button variant="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</Button><Button variant="destructive" onClick={onConfirm} disabled={busy} loading={busy} loadingLabel="Working">{confirmLabel}</Button></>}><p className="type-body-md">Please review this action before continuing.</p></Dialog>;
}
