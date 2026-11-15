/**
 * Supabase service-role client for NP Wardrobe.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SECURITY BOUNDARY — READ BEFORE IMPORTING THIS MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This module is SERVER-ONLY and uses the Supabase service-role key.
 * The service-role key BYPASSES Row Level Security (RLS).
 *
 * NEVER import this module in:
 * - Client Components ('use client')
 * - proxy.ts
 * - Shared UI components or feature modules
 * - Any file that may be bundled into the browser
 * - Barrel exports that mix browser and server code
 *
 * ONLY import this module in explicitly authorized server-side workflows:
 * - Checkout order creation (create_checkout_order RPC)
 * - Manual eSewa payment submission (submit_manual_esewa_payment RPC)
 * - Admin staff operations requiring service-level DB access
 * - Secure server actions and route handlers that have already authenticated
 *   the actor, validated inputs and checked permissions
 *
 * The `server-only` import enforces this boundary at build time — any attempt
 * to import this module from a Client Component will cause a build error.
 *
 * See docs/BACKEND_SCHEMA.md §8, docs/README.md §Security boundaries, and
 * docs/TRD.md §16.3.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSupabaseUrl } from "@/lib/env";
import { getPrivateEnv } from "@/lib/env/server";

/**
 * Creates a Supabase service-role client for privileged server-side operations.
 *
 * Key properties:
 * - Bypasses all RLS policies — every caller is responsible for authorizing
 *   the operation before calling any service-role function.
 * - Session auto-refresh and browser-side cookie persistence are disabled —
 *   this is a stateless server client.
 * - Environment variables are validated at call time; a descriptive error
 *   is thrown if either required variable is absent (never revealing values).
 *
 * The caller MUST have already:
 * 1. Authenticated the request actor (customer session or admin MFA claim).
 * 2. Validated all inputs with Zod server-side schemas.
 * 3. Verified the actor has permission for the requested operation.
 * 4. Ensured audit logging will record the operation.
 */
export function createServiceRoleClient() {
  const supabaseUrl = getSupabaseUrl();
  const privateEnv = getPrivateEnv();

  return createSupabaseClient<Database>(
    supabaseUrl,
    privateEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        // Disable automatic session management — this is a server-side
        // privileged client, not a user-facing session client.
        autoRefreshToken: false,
        persistSession: false,
        // Detect session from browser storage is irrelevant server-side.
        detectSessionInUrl: false,
      },
    }
  );
}
