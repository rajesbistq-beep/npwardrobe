import type { ReactNode } from "react";
export function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return <details className="ui-accordion" open={defaultOpen}><summary>{title}<span aria-hidden="true" className="ui-accordion__mark" /></summary><div className="ui-accordion__content">{children}</div></details>;
}
