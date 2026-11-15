import type { ReactNode } from "react";
export function FormSection({ title, description, children, required }: { title: string; description?: string; children: ReactNode; required?: boolean }) {
  return <fieldset className="form-section"><legend className="form-section__title">{title}{required && <span aria-hidden="true"> *</span>}</legend>{description && <p className="form-section__description">{description}</p>}<div className="form-section__content">{children}</div></fieldset>;
}
