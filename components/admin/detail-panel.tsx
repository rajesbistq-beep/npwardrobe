import type { ReactNode } from "react";
export function DetailPanel({ title, description, children, aside }: { title: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return <section className="detail-panel"><header><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{aside}</header><div className="detail-panel__content">{children}</div></section>;
}
