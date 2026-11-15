import "server-only";
import { getPublicEnv } from "@/lib/env";

export function authSiteUrl(): string {
  const configured = getPublicEnv().NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:3000";
  throw new Error("NEXT_PUBLIC_SITE_URL must be set for authentication redirects in production.");
}

export function safeCustomerDestination(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  try {
    const parsed = new URL(value, "https://npwardrobe.invalid");
    const decodedPath = decodeURIComponent(parsed.pathname).toLowerCase();
    if (parsed.origin !== "https://npwardrobe.invalid" || decodedPath.startsWith("/admin") || decodedPath.startsWith("/auth/")) return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch { return "/"; }
}

export function callbackUrl(next: "verify" | "reset-password", destination = "/"): string {
  const url = new URL("/auth/callback", authSiteUrl());
  url.searchParams.set("next", next);
  if (next === "verify") url.searchParams.set("returnTo", safeCustomerDestination(destination));
  return url.toString();
}
