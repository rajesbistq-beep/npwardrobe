import "server-only";
import { z } from "zod";

const privateEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type PrivateEnv = z.infer<typeof privateEnvSchema>;

/** Validate server secrets on demand; error text never contains secret values. */
export function getPrivateEnv(): PrivateEnv {
  const result = privateEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!result.success) {
    throw new Error("Missing or invalid server environment variable: SUPABASE_SERVICE_ROLE_KEY.");
  }
  return result.data;
}
