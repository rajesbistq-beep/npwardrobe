# NP Wardrobe — Supabase PostgreSQL migrations

**Package status:** generated implementation starter from the owner-approved `BACKEND_SCHEMA.md`, the five completed project documents, and 30/30 BACKEND_SCHEMA interview decisions. The ZIP includes the approved source documents and a traceability map. These migrations have **not** been applied to a live Supabase project. Run the local validation workflow below before staging or production.

## Contents

```text
README.md
docs/
  ARCHITECTURE_TRACEABILITY.md
  approved/
    PROJECT_OVERVIEW.md
    PRD.md
    TRD.md
    APP_FLOW.md
    UI_UX_DESIGN.md
    BACKEND_SCHEMA.md
supabase/
  config.toml
  seed.sql
  migrations/
    20261114000100_platform_extensions.sql
    20261114000200_geography_and_media.sql
    20261114000300_catalogue.sql
    20261114000400_inventory_core.sql
    20261114000500_customers_and_shopping.sql
    20261114000600_orders_and_status_history.sql
    20261114000700_payments_and_refunds.sql
    20261114000800_shipping_and_shipments.sql
    20261114000900_returns_exchanges_and_reviews.sql
    20261114001000_promotions_and_coupons.sql
    20261114001100_cms_activity_and_notifications.sql
    20261114001200_staff_integrations_and_audit.sql
    20261114001300_stock_reservations_and_inventory_ledger.sql
    20261114001400_indexes_views_and_deferred_constraints.sql
    20261114001500_rls_policies_and_storage.sql
    20261114001600_transactional_rpcs.sql
  tests/
    schema_smoke.sql
    transaction_test_plan.md
```

## Apply locally first

Use a current Supabase CLI and Docker. From the repository root (after copying this package's `supabase/` directory into the application repo):

```bash
supabase start
supabase db reset
```

`db reset` recreates the local database, applies migrations in timestamp order, and then runs `supabase/seed.sql`. Do not run `db reset` against a remote production database.

Run the static schema checks against the local database:

```bash
psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/schema_smoke.sql
```

Then manually exercise the 36 acceptance cases in `supabase/tests/transaction_test_plan.md`. These tests require representative local fixtures and at least two concurrent database sessions for the race tests.

## Link and push only after local validation

```bash
supabase login
supabase link --project-ref YOUR_STAGING_PROJECT_REF
supabase db push
```

Use a dedicated staging Supabase project first. Review the remote migration plan and backup state before accepting changes. After application-level integration tests and owner review, repeat the process for production with its own project reference. Keep staging and production secrets separate.

## Important setup tasks before enabling checkout

1. Import Nepal provinces, districts, municipalities and wards from a verified, maintained administrative dataset. The package intentionally does not invent or seed these reference rows.
2. Create the initial inventory location and load owner-verified products, variants, SKUs and opening quantities. There is no guessed opening stock.
3. Configure at least one shipping zone/rate using owner-approved coverage and fees. The checkout RPC requires a server-validated active shipping zone and quote snapshot.
4. Configure COD and eSewa manual instructions/QR in `payment_methods.public_configuration` (display-safe fields only), keep credentials/provider secrets outside the public configuration in server environment secrets, review eligibility rules, then explicitly enable the corresponding `payment_methods` row. Seed methods start disabled.
5. Set and validate the stock-reservation expiry duration in server configuration. The database requires a future expiry timestamp on checkout; no duration has been invented.
6. Create the first owner Supabase Auth account, enforce MFA, then assign the `owner` role through a tightly controlled, reviewed provisioning procedure. Seed data does not create users or assign privileged roles.
7. Create the private `payment-evidence` storage bucket/policies through migrations. Configure its upload size and MIME allowlist according to the owner-approved evidence policy before enabling uploads. Guest proof uploads must use a short-lived server-issued signed upload URL; direct object insert policy is for authenticated customers only.
8. Configure Vercel secrets for Supabase server/service credentials, Resend and approved external providers. Never put secrets in SQL, `site_settings`, or `integration_providers.public_configuration`.

## Security boundaries

- Never expose the Supabase `service_role` key in browser code. Public payment-method reads are column-restricted to `public_configuration`; the private `configuration` JSON remains unavailable through the Data API.
- `create_checkout_order(...)` is service-role-only. The Next.js server must authenticate the customer (if present), validate the guest session, verify address hierarchy, calculate/validate shipping and ensure the request hash is canonical before calling it.
- `transition_order`, `decide_manual_payment`, `record_cod_collection`, and `post_inventory_adjustment` require an authenticated active staff member, `aal2` MFA assurance and the corresponding seeded permission. Public product reviews are exposed through a projection without customer/order identifiers; raw review rows are not granted to anonymous users. Non-COD orders cannot be confirmed until their payment summary is fully `paid`; COD may be confirmed unpaid and collected only after delivery is recorded.
- `submit_manual_esewa_payment` is service-role-only. A Next.js server route must authenticate a registered customer or verify a guest order challenge, pass that verified identity to the RPC, and calculate `p_new_reservation_expires_at` from an owner-configured verification-hold setting. Never expose this RPC or the service role key to the browser. The function is idempotent, creates a payment attempt/history/outbox record and extends only a still-active reservation. If the hold has already expired, the request is rejected for manual support reconciliation rather than accepting a payment against unreserved stock.
- RLS denies guest order reads directly. Public order tracking needs a separate rate-limited challenge/verification API; do not expose `guest_order_access_challenges`.
- Order/payment/history/ledger changes are function-driven. Do not grant browser writes to order totals, payment state, inventory levels, stock reservations, payment evidence metadata, audit history or outbox rows.
- The RLS policies are a baseline and must be tested against `anon`, customer A, customer B, each staff role and owner before launch.

## Deliberate implementation gates / not silently assumed

- `create_checkout_order` currently handles validated item/variant pricing, stock reservation, order snapshots, initial payment and outbox creation. It currently records `discount_total = 0`; coupon/promotion redemption and discount snapshot application need their own atomic checkout extension before the promotion feature is enabled.
- The shipping fee and rule snapshot are supplied by the trusted Next.js server after it resolves active zone/rate rules. The DB rejects a missing/inactive zone but does not guess fees or determine the owner’s delivery policy.
- Tax is stored as zero by this checkout RPC until the owner confirms applicable tax rules.
- Manual eSewa submission is recorded through the server-only `submit_manual_esewa_payment` RPC; approval/rejection is recorded only by a staff verifier function. Approval requires the order to remain pending with an active stock reservation. Provider gateway callbacks, signature verification and the outbox delivery worker need provider-specific code and credentials before Phase 2.
- SMS OTP delivery, resend templates, automated WhatsApp Business messages, courier APIs, and analytics providers are not enabled by these schema migrations.
- Guest order challenge issuance/verification, review submission eligibility checks, return quantity eligibility, exchange stock reservation, shipment quantity reconciliation, coupon cap enforcement, and some admin CRUD operations still require server endpoints or additional transactional functions before those UI features are switched on.
- A production owner provisioning script is intentionally not included. Creating or assigning a privileged owner must be a separate audited operation after MFA setup.

## Migration conventions

- Filenames use Supabase's timestamped `<timestamp>_<name>.sql` convention.
- Once a migration has reached a shared environment, do not edit it. Ship corrections in a new migration.
- `text` keys are normalized to lower-case rather than relying on `citext`; unique functional indexes are used for case-insensitive SKUs/public references where needed.
- All business timestamps use `timestamptz`; render local times in `Asia/Kathmandu`.
- Money uses `numeric(12,2)` and NPR only for Phase 1.
- Core commerce relations are normalized. JSONB is reserved for immutable snapshots, sanitized provider payloads, validated CMS blocks and audit before/after values.

## Recommended next implementation work

1. Run `supabase db reset` and resolve any database-engine/version-specific migration errors.
2. Add database-level tests for checkout idempotency, stock oversell prevention, expired reservation release, order transitions, manual payment decisions and RLS isolation.
3. Add the server-only Next.js repository/services and Zod input schemas for each RPC.
4. Add coupon redemption and the remaining workflow functions listed in `BACKEND_SCHEMA.md` before enabling those application features.
5. Generate TypeScript database types from the validated local schema and commit them with the app.
