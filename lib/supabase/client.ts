/**
 * Supabase browser client for NP Wardrobe.
 *
 * Use this client in:
 * - Client Components ('use client')
 * - Browser event handlers
 *
 * Do NOT use this client in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 * - proxy.ts
 * - Any server-only service module
 *
 * This module uses createBrowserClient from @supabase/ssr which persists the
 * session in cookies (not localStorage), making the session accessible server-
 * side on every request.
 *
 * isSingleton: true ensures only one client instance exists per browser tab,
 * preventing multiple simultaneous token refresh cycles.
 *
 * See docs/TRD.md §6 and docs/BACKEND_SCHEMA.md §17.1.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { requirePublicSupabaseConfig } from "@/lib/env";

/**
 * Returns a Supabase client for use in browser (Client Component) contexts.
 *
 * The client is a singleton per browser tab — multiple calls return the same
 * instance. Session tokens are stored in cookies (not localStorage) so the
 * server can read them on the next request.
 *
 * Only the public anon key is used here. This client is subject to Row Level
 * Security; it cannot bypass RLS policies.
 */
export function createClient() {
  const env = requirePublicSupabaseConfig();
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    key,
    {
      // Ensures one client instance per browser tab to prevent multiple
      // concurrent token refresh operations.
      isSingleton: true,
    }
  );
}
