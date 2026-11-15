/** Limit database-provided image URLs to the configured media providers. */
export function approvedPublicMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.hostname === "res.cloudinary.com" && url.protocol === "https:") return url.toString();
    const configured = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!configured) return null;
    const origin = new URL(configured);
    return url.origin === origin.origin && url.pathname.startsWith("/storage/v1/object/public/") ? url.toString() : null;
  } catch {
    return null;
  }
}
