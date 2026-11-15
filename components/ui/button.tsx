import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "whatsapp";
export function Button({ variant = "primary", size = "default", loading = false, loadingLabel = "Loading", className, type = "button", disabled, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "default" | "small" | "icon"; loading?: boolean; loadingLabel?: string }) {
  return <button className={cn("ui-button", `ui-button--${variant}`, `ui-button--${size}`, className)} type={type} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{loading && <span className="ui-button__spinner" aria-hidden="true" />}{children}{loading && <span className="sr-only">{loadingLabel}</span>}</button>;
}
