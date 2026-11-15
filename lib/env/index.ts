import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1).url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional(),
  ),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

/** Validates only the public project URL for privileged server client creation. */
export function getSupabaseUrl(): string {
  const result = z.string().min(1).url().safeParse(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!result.success) {
    throw new Error("Missing or invalid public environment variable: NEXT_PUBLIC_SUPABASE_URL.");
  }
  return result.data;
}

/** Lazily validate public client variables, so unrelated static builds need no Supabase config. */
export function getPublicEnv(): PublicEnv {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!result.success) {
    const invalidNames = [...new Set(result.error.issues.map((issue) => issue.path.join(".")))];
    throw new Error(
      `Missing or invalid public environment variables: ${invalidNames.join(", ")}. Check .env.example for required names.`,
    );
  }
  return result.data;
}
