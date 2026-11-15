# Task 003 — Local database contract inventory

Internal implementation reference. Verified against the 17 local migrations, generated `types/database.types.ts`, the local PostgreSQL catalogs, seed data, schema smoke SQL and transaction test plan on 15 November 2026. No remote project was linked or queried.

## Relevant data model

| Area | Tables / relationships used by this task |
|---|---|
| Catalogue | `products` → `product_variants`; `product_categories` links products to `categories`; `collection_products` links products to `collections`; `product_variant_options` → `attributes` and `attribute_values`; `product_media` → `media_assets`. Product/category/collection publication state and soft deletion are stored on their primary rows. |
| Inventory | `inventory_levels` → `product_variants` and `inventory_locations`; `stock_reservations` → `orders`; `stock_reservation_items` → reservation, order item, variant and location; `inventory_movements` → inventory level and its source event. |
| Orders | `orders` → customer profile, immutable delivery/billing snapshots and selected payment method; `order_items` preserve product/variant, price and attribute snapshots; `order_status_history` is append-only. |
| Payments | `payments` → order and payment method; `payment_attempts`, `payment_transactions`, `payment_status_history`, `order_payment_status_history`, `payment_evidence`, `refunds` and refund history preserve separate payment/refund lifecycles. |
| Staff authorization | `staff_profiles` → `staff_role_assignments` → `roles` → `role_permissions` → `permissions`. Assignments are active while `revoked_at IS NULL`. |

The generated public database type contains **no PostgreSQL enum types**. Statuses, methods, role codes and reason codes are `text` values constrained by SQL `CHECK` clauses and seeded permission records.

## Views and RLS boundaries

- `v_inventory_availability` is `security_invoker = true`; it derives reserved and available quantities from active reservation rows. The local database grants authenticated SELECT, not anonymous SELECT. Its underlying inventory and reservation policies require `inventory.view` or `orders.view`; public catalogue requests cannot use it for availability filtering.
- `v_public_product_reviews` is a `security_barrier` projection containing approved public review fields without customer or order identifiers. It is readable by `anon` and `authenticated`.
- Public catalogue table grants are filtered by RLS to published, non-deleted products/categories and currently active collections, active variants, filterable attributes, and public media. Catalogue services use the request-scoped Supabase client and add explicit publication filters.
- Customer reads of orders, items, status history, payments, shipments and refunds are scoped by RLS to `orders.customer_id = auth.uid()`. There is no guest-order lookup/verification RPC; a public reference alone is not proof.
- Staff reads are permission-aware RLS policies. The `private.has_permission(text)` helper checks non-null `auth.uid()`, `aal2`, an active staff profile with MFA enforced, a non-revoked role assignment and the permission code. `private.is_active_staff()` also requires `aal2`.
- Payment evidence lives in a private Storage bucket. The implemented payment reads do not select `payment_evidence` or expose object paths.

## RPC signatures and actual local EXECUTE privileges

Privileges below were checked using `has_function_privilege` and `pg_proc.proacl`, not inferred from migration comments.

| RPC | Exact arguments → return | Actual callers | Guard / transaction behavior |
|---|---|---|---|
| `create_checkout_order(jsonb, uuid, text, text, text, jsonb, jsonb, uuid, jsonb, numeric, text, uuid, uuid, text, timestamptz, text)` | `p_items, p_customer_id, p_guest_name, p_guest_phone_e164, p_guest_email, p_delivery_address_snapshot, p_billing_address_snapshot, p_shipping_zone_id, p_shipping_rule_snapshot, p_shipping_fee, p_payment_method_code, p_location_id, p_idempotency_key, p_request_hash, p_reservation_expires_at, p_customer_note` → `uuid` | `service_role` only; `anon` and `authenticated` denied | Atomic order, immutable line snapshots, payment, reservation, inventory movement, history, audit and outbox creation. Advisory transaction lock by idempotency key; same key/hash returns the prior order, different hash fails. Prices and availability are recomputed/locked in SQL. Shipping snapshot/fee and location/expiry are supplied by the trusted server. Discounts remain zero. |
| `submit_manual_esewa_payment(uuid, text, uuid, timestamptz, uuid, boolean)` | `p_payment_id, p_customer_reference, p_idempotency_key, p_new_reservation_expires_at, p_verified_customer_id, p_guest_challenge_verified` → `uuid` | `service_role` only; `anon` and `authenticated` denied | Service-role-only atomic attempt/history/outbox update. Customer identity must be supplied and match the order owner; guest calls require a successfully verified challenge boolean. Idempotency hashes payment ID plus normalized reference. Requires a future owner-configured reservation extension and an active reservation. |
| `transition_order(uuid, text, text, text)` | `p_order_id, p_target_status, p_reason, p_request_id` → `void` | `authenticated` and `service_role`; `anon` denied | Checks `orders.transition`; cancellation also checks `orders.cancel`. Permission helper enforces `aal2`. Writes order, reservation/ledger effects, history, audit and outbox in one function transaction. `p_request_id` is recorded but does not make retries idempotent. |
| `decide_manual_payment(uuid, text, text)` | `p_payment_id, p_decision, p_reason` → `void` | `authenticated` and `service_role`; `anon` denied | Checks `payments.verify` (`aal2` via helper), validates approve/reject and reason, updates payment and order summary/history/audit/outbox transactionally. It does not treat a browser redirect or evidence upload as verification. |
| `record_cod_collection(uuid, numeric, text)` | `p_payment_id, p_collected_amount, p_reference` → `void` | `authenticated` and `service_role`; `anon` denied | Checks `payments.cod_collect` (`aal2` via helper); database verifies COD method, unpaid exact amount and delivered order. Transaction records payment, collection transaction, history, audit and outbox. |
| `post_inventory_adjustment(uuid, uuid, integer, text, text)` | `p_variant_id, p_location_id, p_quantity_delta, p_reason_code, p_reason` → `uuid` | `authenticated` and `service_role`; `anon` denied | Checks `inventory.adjust` (`aal2` via helper), locks the inventory level, rejects zero delta or any result below active reservations, and writes adjustment, ledger and audit rows transactionally. It has no idempotency key. |
| `expire_due_reservations(integer)`, `commit_stock_reservation(uuid)`, `release_stock_reservation(uuid, text)` | Exact signatures in generated types | `service_role` only | Background/transactional reservation operations. Not exposed through application services in this task. |

### ACL finding

The local database has a broad default function ACL in `public`: newly created functions receive EXECUTE for `anon`, `authenticated` and `service_role`. The migrations revoke `PUBLIC` and selected role grants, but `REVOKE ... FROM PUBLIC` does not remove grants to those explicit roles. Migration 017 revokes `PUBLIC`, `anon` and `authenticated` from the two server-only RPCs, then grants `service_role`; for staff RPCs it revokes those client roles and grants `authenticated`, but leaves the default `service_role=X` ACL in place. `service_role` is not a member of `authenticated`.

The staff RPC bodies still require `auth.uid()`, `aal2` and the permission helper, so the application wrappers call them only with the authenticated request-scoped client, which preserves the user JWT. The service-role client is not used for staff operations. This additional database EXECUTE grant is a security review finding for a later migration task; this task does not edit migration history.

## Authorization and identity handling in the application

- `getAuthorizationContext()` verifies identity with `auth.getUser()` and claims with `auth.getClaims()`, then reads the caller's staff profile and active role/permission joins using the same user-scoped server client. It never accepts a user ID, role or permission from request input.
- Staff roles require `staff_status = active`, `mfa_enforced = true` and `aal2`; owner/admin contexts come from actual assigned role codes. All permission-bearing RPC calls run through the request-scoped client so PostgreSQL independently checks the same `auth.uid()` and MFA claim.
- No current service uses the service-role key. The service-only RPCs are not called until their required server configuration and identity workflows are present.

## Implemented service reads and writes

| Service | Tables/views and permissions |
|---|---|
| Catalogue | Published reads from `products`, `categories`, `collections`, `product_categories`, `collection_products`, `attributes`, `attribute_values`, `product_variant_options`, `product_variants`, `product_media`, and public `media_assets`; RLS remains active. |
| Inventory | `v_inventory_availability`, `inventory_levels`, `inventory_movements`, `stock_reservations`, `stock_reservation_items`; reads require `inventory.view`. Adjustment uses `post_inventory_adjustment` via authenticated client and requires `inventory.adjust`. |
| Orders | Owner-scoped customer reads from `orders`, `order_items`, `order_status_history`, `order_payment_status_history`, `payments`, `shipments`; admin lists/details require `orders.view`, payment summaries require `payments.view`, shipment summaries require `deliveries.view`. Status transition uses `transition_order` with `orders.transition`, plus `orders.cancel` for cancellation. |
| Payments | Customer-owned payment/status/refund reads; staff payment records/attempts/transactions/refund reads require `payments.view`. `decide_manual_payment` requires `payments.verify`. COD collection requires `payments.cod_collect` and `payments.view`; the RPC receives the amount read from the authoritative payment row, never a browser amount. |

## Deliberate blockers (no unsafe stubs)

- **Checkout service:** no approved server resolver/configuration is present for the fulfillment location, active Nepal geography, shipping-zone/rate selection and shipping quote, or reservation expiry duration. Payment methods are seeded disabled. The RPC trusts the server-supplied shipping snapshot/fee and expiry, and the server must validate address hierarchy. No wrapper accepts those values from a browser or fabricates policy values. Guest checkout identity/session validation is also not yet implemented.
- **Manual eSewa customer submission:** the RPC itself safely compares a server-verified customer ID with the order owner, or requires a completed guest challenge. The guest challenge issuance/verification workflow and owner-configured reservation extension are absent. The wrapper is therefore not implemented; the service-role RPC is not exposed to ordinary client/server callers without those prerequisites.
- **Guest order reads:** no challenge verification endpoint/RPC is available. Public-reference-only guest lookup remains unimplemented.
- **Refund mutations:** no approved refund transactional RPC or complete refund business/approval workflow exists. Refund reads are implemented; no direct table writes are used.
- **Availability filtering in public catalogues:** the inventory view is authenticated-only and its underlying RLS is permission-protected. Public catalogue services do not expose stock quantities or pretend that unavailable public data is known.
- **Low-stock alerts:** inventory schema has no low-stock threshold field/configuration, so no guessed alert rule is implemented.

## Source of truth and validation

The public Database type is generated from the local schema and currently includes both views and all public RPC signatures. The transaction test plan documents checkout idempotency/concurrency and RLS acceptance cases; TypeScript wrappers do not claim to prove those database guarantees. The schema smoke assertion block passed against the local database. No migration, seed or generated type changes were required by Task 003.
