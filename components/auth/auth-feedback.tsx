"use client";

import { useSearchParams } from "next/navigation";
export function AuthFeedback() {
  const state = useSearchParams().get("state");
  if (!state) return null;
  const message = state === "success" ? "Your email has been verified. You can sign in." : state === "password-updated" ? "Your password has been updated. Sign in to continue." : state === "missing" ? "This link is missing its verification code." : "This link is invalid or has expired. Request a new link to continue.";
  return <p className={state === "success" || state === "password-updated" ? "auth-notice" : "auth-error"} role="status">{message}</p>;
}
