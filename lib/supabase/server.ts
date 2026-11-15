/**
 * Supabase server client for NP Wardrobe.
 *
 * Use this client in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 *
 * Do NOT use this client in:
 * - Client Components ('use client')
 * - proxy.ts (it receives a request/response cookie adapter instead)
 *
 * A NEW client must be created for each server request. Never reuse a single
 * client instance across requests — doing so would leave later responses
 * without required cache headers and cause auth issues.
 *
 * The client uses the public anon key and is subject to Supabase RLS.
 * For privileged (service-role) operations, use lib/supabase/service-role.ts.
 *
 * See docs/TRD.md §6, docs/BACKEND_SCHEMA.md §8, and @supabase/ssr design docs.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";
import { requirePublicSupabaseConfig } from "@/lib/env";

/**
 * Creates a new Supabase server client bound to the current request's cookies.
 *
 * Call once per request at the top of a Server Component, Server Action, or
 * Route Handler. Reads session cookies from the incoming request and writes
 * refreshed tokens back via Set-Cookie headers when needed.
 *
 * Cookie writes are caught and silently skipped when running in a Server
 * Component context (where response headers cannot be modified), as required
 * by @supabase/ssr. All other errors are re-thrown.
 */
export async function createClient() {
  // cookies() is async in Next.js 16; must be awaited before passing to
  // createServerClient so the cookie store is fully resolved. Reading the
  // request first also keeps environment validation out of the static shell
  // when this client is reached by a request-bound auth check.
  const cookieStore = await cookies();
  const env = requirePublicSupabaseConfig();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        /**
         * Returns all cookies from the current request.
         * Used by @supabase/ssr to read the existing session tokens.
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * Writes refreshed session cookies to the HTTP response.
         *
         * In Server Components, the response headers are sealed and
         * cookie writes will throw. We catch that specific error and
         * continue — the session will be refreshed on the next
         * request via the proxy.ts cookie refresh path.
         *
         * All other errors are re-thrown so they remain visible.
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Server Components cannot modify outgoing cookies. Keep this
            // narrow so serialization or adapter errors still surface.
            if (
              error instanceof Error &&
              error.message.includes(
                "Cookies can only be modified in a Server Action or Route Handler",
              )
            ) {
              return;
            }
            throw error;
          }
        },
      },
    }
  );
}
