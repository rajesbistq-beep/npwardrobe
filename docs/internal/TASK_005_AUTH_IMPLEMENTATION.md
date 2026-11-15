# Task 005 — Authentication implementation notes

## Implemented flows

- Customer email/password registration, email confirmation, login and logout use the request-scoped Supabase SSR client. Signup metadata contains only the display name; the existing auth trigger creates the profile.
- `/auth/callback` exchanges the PKCE code. Callback destinations are constrained to the approved verification/reset flows and customer paths. Recovery completion requires a short-lived HttpOnly marker plus a valid Supabase session; a successful reset signs out the local session.
- Password recovery returns a generic response regardless of whether the address belongs to an account.
- `/admin/login` checks the authenticated identity, active `staff_profiles` row, MFA enforcement and non-revoked role assignment. `/admin/mfa` enrolls or challenges a TOTP factor and only proceeds after AAL2 and a non-empty authorization context from `getAuthorizationContext()`.
- The account layout and admin top bar expose local sign-out. Customer sign-out retains the local cart and wishlist.
- Guest cart and wishlist merge writes use the request-scoped authenticated client, RLS and active catalogue checks. Same-variant cart quantity uses `max(cloud, guest)` to make retries idempotent without increasing quantity repeatedly. The merged cloud list is reloaded into Zustand after successful sync. Partial failure leaves local guest state intact.

## Database boundary

Used `profiles` via the existing auth trigger; `staff_profiles`, `staff_role_assignments`, roles and permissions through `getAuthorizationContext()`; and customer-owned `carts`, `cart_items`, `wishlists`, `wishlist_items`, `products` and `product_variants` under existing RLS. No service-role client or schema migration was used.

The cart/wishlist schema has no single transactional merge RPC. Writes are individually RLS-scoped and retry-safe, but a network interruption can leave a partial merge. The action reports partial status and retains guest state so a retry can reconcile it.

## Configuration and outstanding decisions

- `supabase/config.toml` enables local email confirmation and TOTP, and explicitly disables SMS signup/confirmation. Production provider settings must be reviewed separately.
- Redirect callbacks use `NEXT_PUBLIC_SITE_URL`; local development falls back to `http://127.0.0.1:3000`, matching local Supabase configuration. Production requires the variable to be explicitly set.
- The approved documents do not define a dedicated URL locale convention. Existing unprefixed auth URLs are preserved; no locale router was introduced.
- The registration UI requires terms acceptance, but the database has no terms/privacy consent ledger and no documented terms/privacy content route. Acceptance is validated for signup but not persisted as a durable consent record. No marketing consent is requested or recorded.
- Phone OTP is not available because SMS provider selection is pending; the form does not claim phone verification.
- Supabase Auth owns provider rate controls. No app-level rate limiter or CAPTCHA provider is configured.

## Verification

`npm run lint`, `npm run typecheck` and `npm run build` are run for this task. The local Supabase CLI status check could not complete in this environment: it was denied write access to `C:\Users\xmast\.supabase\telemetry.json`. No remote Supabase project was queried and no local auth scenario is claimed as tested.
