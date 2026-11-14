# NP Wardrobe — architecture traceability

This migration package is derived from the six approved project artifacts included in `docs/approved/` and the 30-question BACKEND_SCHEMA interview (all 30 answers selected option D). The SQL is an implementation starter, not a claim that every UI workflow is already implemented.

## Approved document connections

| Approved source | Architecture decisions carried into the database package |
|---|---|
| `PROJECT_OVERVIEW.md` | Single-brand Nepal fashion commerce; NPR; guest checkout; COD and manual eSewa first; nationwide Nepal delivery; privacy and admin operations. |
| `PRD.md` | Product and variant catalogue; categories/collections; customer accounts and addresses; cart/checkout; order tracking; payments; inventory; delivery; returns; reviews; admin and content management. |
| `TRD.md` | Supabase PostgreSQL/Auth/RLS/Storage; Next.js server-side workflows; Cloudinary public media; transactional database operations; Vercel deployment and CI. |
| `APP_FLOW.md` | Customer/admin routes; variant selection; cart merge; three-step checkout; structured Nepal addresses; order/payment status separation; manual eSewa verification; order tracking; cancellation/returns; staff operations. |
| `UI_UX_DESIGN.md` | Screen and content entities needed by the Stitch-derived experience: homepage banners, categories, product detail galleries, size guides, FAQs, About/Shipping content and curated collections. Presentation tokens stay in the frontend, not in relational business data. |
| `BACKEND_SCHEMA.md` | Normalized PostgreSQL table map, relationships, RLS, indexes, inventory ledger/reservations, state machines, auditability, migrations, seed and retention rules. |

## Migration order and domain map

| Migration | Domain | Depends on |
|---|---|---|
| `20261114000100_platform_extensions.sql` | PostgreSQL extensions, private schema, timestamp trigger helper | Supabase PostgreSQL platform |
| `20261114000200_geography_and_media.sql` | Nepal geography reference tables, media assets | 001 |
| `20261114000300_catalogue.sql` | Categories, collections, products, attributes, variants, media links and size guides | 001–002 |
| `20261114000400_inventory_core.sql` | Locations, stock projections, adjustments and transfers | 001–003 |
| `20261114000500_customers_and_shopping.sql` | Profiles, addresses, carts and wishlists | Supabase Auth; 001–004 |
| `20261114000600_orders_and_status_history.sql` | Orders, order lines, order/payment history, guest challenge records | 001–005 |
| `20261114000700_payments_and_refunds.sql` | Payment methods, payment attempts/transactions/evidence, refunds | 001–006 |
| `20261114000800_shipping_and_shipments.sql` | Shipping zones/rates, couriers, shipments and events | 001–007 |
| `20261114000900_returns_exchanges_and_reviews.sql` | Cancellations, returns, exchanges, inspections, reviews | 001–008 |
| `20261114001000_promotions_and_coupons.sql` | Promotions, coupons and redemptions | 001–009 |
| `20261114001100_cms_activity_and_notifications.sql` | CMS, customer activity, notifications and preferences | 001–010 |
| `20261114001200_staff_integrations_and_audit.sql` | Staff RBAC, audit, webhook and outbox tables | 001–011 |
| `20261114001300_stock_reservations_and_inventory_ledger.sql` | Reservation lifecycle and append-only stock movement ledger | 001–012 |
| `20261114001400_indexes_views_and_deferred_constraints.sql` | Query indexes, search vector, safe read models and cross-domain FKs | 001–013 |
| `20261114001500_rls_policies_and_storage.sql` | RLS, least-privilege grants, payment-evidence bucket | 001–014 |
| `20261114001600_transactional_rpcs.sql` | Checkout, reservation, payment submission/verification, order transitions and stock adjustments | 001–015 |

## Key invariants

1. Cart contents do not reserve stock. A reservation is created only when checkout creates the order.
2. `inventory_levels.on_hand_quantity` is the physical on-hand projection. Reserved quantity is derived from active reservation rows; there is no separately editable `reserved_quantity` counter.
3. Stock reservation, commit, release, expiry and checkout run inside database transactions with row locks and retry-safe identifiers.
4. Order state and payment state are separate. A non-COD order cannot be confirmed until payment is fully verified as paid. COD orders may be confirmed while unpaid; COD collection is recorded only after delivery.
5. Product name/SKU/attributes/price and delivery address are snapshotted on order records so future catalogue or address edits do not rewrite purchase history.
6. Customer-facing eSewa reference submission is called only by a trusted Next.js server using service role after customer ownership or guest challenge verification. The browser never receives service-role credentials.
7. Public payment-method reads expose only display-safe columns and `public_configuration`; private `configuration` is not selectable by `anon` or `authenticated`.
8. Public reviews are exposed via `v_public_product_reviews`; raw customer and order-item identifiers are not granted to anonymous users and are column-restricted for authenticated users.
9. RLS is enabled on all public application tables. Missing policies are intentional deny-by-default or server-only boundaries.
10. Seed data creates attributes, disabled payment-method rows and role/permission templates only. It does not create an owner user, live credentials, product prices, stock, shipping fees/policies or guessed geographic data.

## Known implementation gates

See the root `README.md` for the detailed list. Important gates include the owner-verified Nepal geography import, initial location and stock load, shipping coverage/rates, payment-method public instructions/QR, reservation hold duration, first MFA-protected owner assignment, coupon redemption workflow, guest tracking challenge endpoints, return/review eligibility checks, webhook signature verification and outbox workers.

## Validation status

The package has received static file/lexical checks (migration naming/order, balanced quotes/parentheses and presence of required files/RPC signatures). It has **not** been applied to a running PostgreSQL/Supabase instance in this environment. Run `supabase db reset` locally and execute `supabase/tests/schema_smoke.sql` before linking or pushing to staging.
