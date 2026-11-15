import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().url().optional(),
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().url().optional(),
  ),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

function normalize(value: string | undefined) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function isPlaceholder(value: string | undefined) {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return [
    "",
    "changeme",
    "change-me",
    "replace-me",
    "placeholder",
    "example",
    "your_anon_key",
    "your-anon-key",
    "your_supabase_anon_key",
    "your-public-key",
    "your-public-anon-key",
    "demo",
    "test",
  ].includes(normalized);
}

export function getPublicEnvStatus() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: normalize(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    NEXT_PUBLIC_SITE_URL: normalize(process.env.NEXT_PUBLIC_SITE_URL),
  };

  const missing: string[] = [];
  const invalid: string[] = [];

  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  } else {
    const parsed = z.string().trim().url().safeParse(env.NEXT_PUBLIC_SUPABASE_URL);
    if (!parsed.success) invalid.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  } else if (isPlaceholder(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    invalid.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (env.NEXT_PUBLIC_SITE_URL !== undefined) {
    const parsed = z.string().trim().url().safeParse(env.NEXT_PUBLIC_SITE_URL);
    if (!parsed.success) invalid.push("NEXT_PUBLIC_SITE_URL");
  }

  return {
    configured: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}

/** Validates only the public project URL for privileged server client creation. */
export function getSupabaseUrl(): string {
  const env = getPublicEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Supabase is not configured. Missing required public variable: NEXT_PUBLIC_SUPABASE_URL.");
  }
  return env.NEXT_PUBLIC_SUPABASE_URL;
}

/** Returns environment values without crashing when the backend is unset in local development. */
export function getPublicEnv(): PublicEnv {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!result.success) {
    return {
      NEXT_PUBLIC_SUPABASE_URL: normalize(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      NEXT_PUBLIC_SITE_URL: normalize(process.env.NEXT_PUBLIC_SITE_URL),
    };
  }

  return result.data;
}

export function requirePublicSupabaseConfig() {
  const status = getPublicEnvStatus();
  if (!status.configured) {
    const missing = [...new Set([...status.missing, ...status.invalid])];
    throw new Error(
      `Supabase is not configured. Missing or invalid public environment variables: ${missing.join(", ")}. Set them in .env.local and keep the names exactly as in .env.example.`,
    );
  }

  const env = getPublicEnv();
  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}
