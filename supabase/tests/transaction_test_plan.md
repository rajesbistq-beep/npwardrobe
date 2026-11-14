# NP Wardrobe — required transaction/RLS validation plan

These are acceptance tests for a Supabase local database plus the Next.js server layer. Do not mark database implementation complete until every case is automated (Vitest/pgTAP/Playwright as appropriate).

## Checkout and inventory concurrency

1. **Valid guest checkout:** with an active product/variant, configured inventory level, active shipping zone, enabled payment method and valid future reservation expiry, call `create_checkout_order` with one line. Assert one pending order, one immutable order item, one unpaid payment, one active reservation, matching reservation item, positive reserved movement and one `order.created` outbox event.
2. **Valid customer checkout:** repeat with an active Supabase profile. Assert `customer_id` is set and guest contact fields can remain null.
3. **Idempotent retry:** repeat the exact call with the same idempotency key and request hash. Assert the same order UUID and no duplicate payment/reservation/outbox rows.
4. **Idempotency conflict:** reuse the key with a different request hash. Assert the RPC fails and creates no rows.
5. **No stock:** request more than on-hand minus active reservations. Assert transaction rollback leaves no order, payment, reservation, movement or outbox event.
6. **Concurrent last unit:** run two checkout calls in separate sessions for the same variant/location with one available unit. Exactly one succeeds; available stock never becomes negative.
7. **Multiple line rollback:** one available line plus one unavailable line. Assert all writes roll back.
8. **Variant/pricing change:** use inactive variant/draft product and assert checkout rejection; update product price before final submit and assert RPC uses current database pricing, not a browser-supplied price.
9. **Ambiguous sale configuration:** active product sale plus variant regular price override without a variant sale override must fail closed.
10. **Reservation expiry:** expire a due pending order reservation; state becomes `expired`, one reserved release movement is appended, and a retry does not append a second movement.
11. **Confirmation:** transition pending to confirmed with valid active reservation. Assert reservation committed, on-hand decremented once, reserved projection released, and history/audit/outbox created. A non-COD order with payment status other than `paid` must be rejected; COD may be confirmed unpaid.
12. **Pre-dispatch cancellation:** cancel pending (release active hold) and confirmed/processing (restore committed stock through a compensating adjustment). Assert repeated/invalid cancellation cannot duplicate stock.
13. **Invalid transitions:** reject pending-to-shipped, delivered-to-cancelled, and shipped-to-cancelled with no row changes.
14. **Manual inventory adjustment:** positive/negative adjustment requires MFA + `inventory.adjust`, a reason and cannot reduce on-hand below active reserved quantity.

## Payments

15. **eSewa manual submission:** Next.js server authenticates a registered customer or verifies the guest-order challenge, then calls the service-role-only `submit_manual_esewa_payment` RPC. Assert ownership/challenge checks, a new attempt row, payment/order status history, audit/outbox event, and extension of only an active reservation using the owner-configured hold deadline.
16. **eSewa submission idempotency:** replay the same idempotency key and reference; return the same attempt. Reuse the key with a different payment/reference; reject. Submit after reservation expiry; reject for manual support reconciliation. Payment proof upload must never mark the payment paid.
17. **Payment verification authorization:** staff without `payments.verify` or without `aal2` cannot approve/reject, even by direct RPC invocation.
18. **Manual approval:** authorized reviewer approves one pending manual eSewa payment. Assert verifier, timestamp, transaction, payment history, order summary history and outbox event.
19. **Duplicate decision:** a second decision for an already decided payment fails without creating a second transaction.
20. **Rejection:** record required reason and reject; order summary is recalculated from underlying payment rows.
21. **COD collection:** only `cod` method is accepted; order must already be delivered; amount must exactly match outstanding payment in this initial RPC; repeated collection is rejected.
22. **Refund cap:** before refund workflow is enabled, add tests that cumulative successful refunds cannot exceed captured/collected payments and that request/approval is not equivalent to success.

## RLS isolation

23. Anonymous user cannot read any order, payment, address, cart, wishlist, reservation, audit, staff or integration row.
24. Customer A cannot select or mutate customer B's profile, addresses, carts, wishlist, notifications, orders, payments or account activity. Customer can read only exchange items attached to their own return request.
25. Customer cannot update order/payment statuses, totals, payment references, stock levels, reservations, movement ledger or audit rows.
26. Customer can update only profile display name and preferred locale; cannot write verified phone timestamp or account status.
27. Staff without a module permission cannot read or mutate that module's private rows.
28. A staff role without `payments.verify` cannot verify eSewa; a role with only `inventory.view` cannot adjust stock.
29. Disabling/suspending staff immediately removes effective permissions.
30. Public user sees only published products/categories/collections/CMS and approved reviews; raw review customer/order identifiers remain inaccessible, and public review media is limited to approved reviews.
31. Private `payment-evidence` bucket rejects anonymous and unauthorized object reads; signed guest upload URLs are short-lived and scoped to one payment.

## Integration and recovery

32. Duplicate `(provider_id, provider_event_id)` webhook insert is rejected.
33. An unverified webhook cannot mutate payments/orders.
34. Outbox worker claims rows with `FOR UPDATE SKIP LOCKED`; retry must be idempotent and provider failure must not roll back an existing order.
35. Append-only order/payment/inventory/audit histories reject UPDATE and DELETE.
36. Restore a recent backup into a non-production environment and run the schema smoke plus reconciliation tests.
