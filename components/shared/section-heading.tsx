import type { ReactNode } from "react";
export function SectionHeading({ eyebrow, title, description, action, titleId }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; titleId?: string }) {
  return <header className="section-heading">{eyebrow && <p className="type-label-sm section-heading__eyebrow">{eyebrow}</p>}<div className="section-heading__row"><div><h2 id={titleId} className="type-headline-md">{title}</h2>{description && <p className="type-body-md section-heading__description">{description}</p>}</div>{action}</div></header>;
}
