-- 0014: cross-domain foreign keys, indexes, search vector and inventory read model.

create index districts_province_idx on public.districts(province_id);
create index municipalities_district_idx on public.municipalities(district_id);
create index wards_municipality_idx on public.wards(municipality_id);
create index categories_parent_sort_idx on public.categories(parent_id, sort_order) where deleted_at is null;
create index collections_status_sort_idx on public.collections(status, sort_order) where deleted_at is null;
create index products_status_sort_idx on public.products(status, sort_order) where deleted_at is null;
create index products_featured_idx on public.products(is_featured, sort_order) where status = 'published' and deleted_at is null;
create index product_categories_category_sort_idx on public.product_categories(category_id, sort_order);
create unique index product_categories_one_primary_uidx on public.product_categories(product_id) where is_primary;
create index collection_products_product_idx on public.collection_products(product_id);
create index product_variants_product_status_idx on public.product_variants(product_id, status) where deleted_at is null;
create index product_variant_options_attribute_value_idx on public.product_variant_options(attribute_id, attribute_value_id);
create unique index product_media_primary_product_uidx on public.product_media(product_id) where is_primary and variant_id is null;
create unique index product_media_primary_variant_uidx on public.product_media(variant_id) where is_primary and variant_id is not null;
create index product_media_gallery_idx on public.product_media(product_id, variant_id, sort_order);
create index collection_media_order_idx on public.collection_media(collection_id, sort_order);
create index inventory_levels_location_variant_idx on public.inventory_levels(location_id, variant_id);
create index inventory_adjustments_status_created_idx on public.inventory_adjustments(status, created_at desc);
create index inventory_transfers_status_created_idx on public.inventory_transfers(status, created_at desc);
create index customer_addresses_customer_idx on public.customer_addresses(customer_id) where deleted_at is null;
create unique index customer_addresses_default_uidx on public.customer_addresses(customer_id) where is_default and deleted_at is null;
create index cart_items_cart_idx on public.cart_items(cart_id);
create index wishlist_items_wishlist_idx on public.wishlist_items(wishlist_id, created_at desc);
create index orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index orders_payment_status_created_idx on public.orders(payment_status, created_at desc);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_variant_idx on public.order_items(variant_id) where variant_id is not null;
create index order_status_history_order_created_idx on public.order_status_history(order_id, created_at);
create index payments_order_status_idx on public.payments(order_id, status);
create index payment_attempts_payment_created_idx on public.payment_attempts(payment_id, created_at desc);
create index payment_evidence_payment_idx on public.payment_evidence(payment_id, uploaded_at desc);
create index refunds_payment_status_idx on public.refunds(payment_id, status);
create index shipping_zone_districts_district_idx on public.shipping_zone_districts(district_id);
create index shipping_zone_municipalities_municipality_idx on public.shipping_zone_municipalities(municipality_id);
create index shipping_rates_zone_active_idx on public.shipping_rates(shipping_zone_id, sort_order) where is_active;
create index shipments_order_created_idx on public.shipments(order_id, created_at desc);
create index shipments_tracking_idx on public.shipments(tracking_number) where tracking_number is not null;
create index shipment_events_shipment_occurred_idx on public.shipment_tracking_events(shipment_id, occurred_at desc);
create index return_requests_order_created_idx on public.return_requests(order_id, created_at desc);
create index reviews_product_status_created_idx on public.reviews(product_id, status, created_at desc);
create index review_votes_review_idx on public.review_votes(review_id);
create index promotions_status_dates_idx on public.promotions(status, starts_at, ends_at);
create index coupon_redemptions_customer_idx on public.coupon_redemptions(coupon_id, customer_id) where customer_id is not null;
create index cms_pages_status_published_idx on public.cms_pages(status, published_at);
create index cms_sections_page_order_idx on public.cms_page_sections(page_id, sort_order);
create index banners_placement_status_dates_idx on public.banners(placement, status, starts_at, ends_at);
create index customer_events_customer_time_idx on public.customer_events(customer_id, occurred_at desc) where customer_id is not null;
create index recently_viewed_customer_time_idx on public.recently_viewed_products(customer_id, last_viewed_at desc) where customer_id is not null;
create index search_history_customer_time_idx on public.customer_search_history(customer_id, searched_at desc) where customer_id is not null;
create index notifications_customer_created_idx on public.notifications(customer_id, created_at desc);
create index notification_deliveries_status_idx on public.notification_deliveries(status, attempted_at);
create index staff_assignments_staff_active_idx on public.staff_role_assignments(staff_user_id) where revoked_at is null;
create index audit_logs_entity_created_idx on public.audit_logs(entity_type, entity_id, created_at desc);
create index audit_logs_actor_created_idx on public.audit_logs(actor_user_id, created_at desc);
create index webhook_events_status_received_idx on public.webhook_events(status, received_at);
create index outbox_events_ready_idx on public.outbox_events(status, available_at) where status in ('pending','retryable_failed');
create index stock_reservations_expiry_idx on public.stock_reservations(expires_at) where status = 'active';
create index stock_reservation_items_variant_location_idx on public.stock_reservation_items(variant_id, location_id);
create index inventory_movements_variant_location_created_idx on public.inventory_movements(variant_id, location_id, created_at desc);
create index inventory_movements_order_item_idx on public.inventory_movements(order_item_id) where order_item_id is not null;

-- Cross-domain FKs for inventory reservations (all referenced tables now exist).
alter table public.stock_reservation_items
  add constraint reservation_item_level_fk foreign key (variant_id, location_id)
  references public.inventory_levels(variant_id, location_id) on delete restrict;

-- Generated full-text search vector uses the built-in simple configuration.
alter table public.products add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(material, '')), 'D')
  ) stored;
create index products_search_vector_gin_idx on public.products using gin(search_vector);

-- Safe public review projection. The view owner applies the approved-only filter;
-- raw review rows (including order/customer identifiers) are not exposed to anon.
create or replace view public.v_public_product_reviews
with (security_barrier = true)
as
select r.id, r.product_id, r.rating, r.title, r.body, r.verified_purchase, r.created_at
from public.reviews r
where r.status = 'approved';

create or replace view public.v_inventory_availability
with (security_invoker = true)
as
select
  il.id as inventory_level_id,
  il.variant_id,
  il.location_id,
  il.on_hand_quantity,
  coalesce(sum(sri.quantity) filter (where sr.status = 'active'), 0)::integer as reserved_quantity,
  (il.on_hand_quantity - coalesce(sum(sri.quantity) filter (where sr.status = 'active'), 0))::integer as available_quantity,
  il.updated_at
from public.inventory_levels il
left join public.stock_reservation_items sri
  on sri.variant_id = il.variant_id and sri.location_id = il.location_id
left join public.stock_reservations sr on sr.id = sri.reservation_id
 group by il.id, il.variant_id, il.location_id, il.on_hand_quantity, il.updated_at;

comment on view public.v_inventory_availability is 'Reserved quantity is derived only from active stock_reservations. Expired timestamps count until state is atomically expired.';

-- Generic updated_at maintenance for tables which carry that column.
do $$
declare r record;
begin
  for r in
    select table_schema, table_name
    from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
    group by table_schema, table_name
  loop
    execute format('drop trigger if exists set_updated_at on %I.%I', r.table_schema, r.table_name);
    execute format('create trigger set_updated_at before update on %I.%I for each row execute function private.set_updated_at()', r.table_schema, r.table_name);
  end loop;
end;
$$;

create or replace function private.reject_append_only_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'APPEND_ONLY_RECORD' using errcode = '55000';
end;
$$;

revoke all on function private.reject_append_only_mutation() from public;

do $$
declare t text;
begin
  foreach t in array array[
    'order_status_history','order_payment_status_history','payment_status_history',
    'refund_status_history','shipment_tracking_events','inventory_movements','audit_logs'
  ] loop
    execute format('create trigger %I before update or delete on public.%I for each row execute function private.reject_append_only_mutation()', t || '_append_only', t);
  end loop;
end;
$$;
