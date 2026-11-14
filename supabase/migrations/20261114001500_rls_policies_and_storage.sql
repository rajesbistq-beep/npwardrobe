-- 0015: least-privilege Supabase RLS and private payment-evidence storage.

create or replace function private.has_permission(p_permission_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select auth.uid() is not null
       and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
       and exists (
         select 1
         from public.staff_profiles sp
         join public.staff_role_assignments sra on sra.staff_user_id = sp.id and sra.revoked_at is null
         join public.role_permissions rp on rp.role_id = sra.role_id
         join public.permissions p on p.id = rp.permission_id
         where sp.id = auth.uid() and sp.staff_status = 'active' and sp.mfa_enforced
           and p.code = lower(p_permission_code)
       )), false)
$$;

create or replace function private.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select auth.uid() is not null
       and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
       and exists (
         select 1 from public.staff_profiles sp
         where sp.id = auth.uid() and sp.staff_status = 'active' and sp.mfa_enforced
       )), false)
$$;

revoke all on function private.has_permission(text) from public;
revoke all on function private.is_active_staff() from public;
grant usage on schema private to authenticated;
grant execute on function private.has_permission(text) to authenticated;
grant execute on function private.is_active_staff() to authenticated;

-- Every public application table has RLS enabled, even when there is no direct
-- client policy (no policy means deny by default).
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end;
$$;

-- Remove broad default table grants; grant only the operations used by clients.
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Public catalogue and published content.
grant select on public.provinces, public.districts, public.municipalities, public.wards,
  public.media_assets, public.categories, public.category_translations,
  public.collections, public.collection_translations, public.products,
  public.product_translations, public.product_categories, public.collection_products,
  public.related_products, public.attributes, public.attribute_values,
  public.product_attributes, public.product_variants, public.product_variant_options,
  public.product_media, public.collection_media, public.size_guides,
  public.size_guide_rows, public.size_guide_measurements, public.product_size_guides,
  public.cms_pages, public.cms_page_translations, public.cms_page_sections,
  public.banners, public.banner_translations, public.faq_categories,
  public.faq_entries, public.faq_translations, public.promotions,
  public.shipping_zones, public.shipping_rates, public.promotion_products, public.promotion_categories
  to anon, authenticated;

-- Public reviews are served through a projection that omits customer/order identifiers.
grant select on public.v_public_product_reviews to anon, authenticated;
grant select on public.review_media to anon, authenticated;

-- Expose only display-safe payment method columns. Never expose configuration JSON
-- (which may contain QR/media/configuration references) through the public Data API.
grant select (id, code, display_name, provider_code, phase, is_enabled, public_configuration, sort_order, created_at, updated_at)
  on public.payment_methods to anon, authenticated;

-- Customer-owned records. Sensitive writes remain through server workflows where noted.
grant select on public.profiles to authenticated;
grant update (display_name, preferred_locale) on public.profiles to authenticated;
grant select, insert, update, delete on public.customer_addresses to authenticated;
grant select, insert, update, delete on public.carts, public.cart_items,
  public.wishlists, public.wishlist_items to authenticated;
grant select on public.orders, public.order_items, public.order_status_history,
  public.order_payment_status_history, public.payments, public.payment_status_history,
  public.payment_evidence, public.shipments, public.shipment_items,
  public.shipment_tracking_events, public.order_cancellation_requests,
  public.return_requests, public.return_request_items, public.return_shipments,
  public.review_media, public.review_votes, public.review_reports,
  public.notifications, public.customer_notification_preferences,
  public.customer_events, public.recently_viewed_products, public.customer_search_history
  to authenticated;
-- Raw review rows omit customer/order identifiers from Data API reads.
grant select (id, product_id, rating, title, body, verified_purchase, status, created_at, updated_at)
  on public.reviews to authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant insert, update, delete on public.review_votes to authenticated;
grant select, insert, delete on public.customer_events, public.recently_viewed_products,
  public.customer_search_history to authenticated;
grant select, insert, update on public.customer_notification_preferences to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant select on public.order_discounts, public.refund_status_history, public.return_shipments, public.v_inventory_availability to authenticated;
grant select on public.payment_attempts, public.payment_transactions, public.coupon_redemptions to authenticated;
-- Underlying read grants are required by the security-invoker availability view;
-- row policies still limit these rows to staff with the appropriate permissions.
grant select on public.stock_reservations, public.stock_reservation_items to authenticated;
grant select on public.notification_events to authenticated;

-- Staff access is granted at table level but restricted by permission-aware policies.
grant select, insert, update, delete on all tables in schema public to service_role;
grant select, insert, update, delete on public.products, public.product_variants,
  public.categories, public.category_translations, public.collections,
  public.collection_translations, public.product_categories, public.collection_products,
  public.related_products, public.attributes, public.attribute_values,
  public.product_attributes, public.product_variant_options, public.media_assets,
  public.product_media, public.collection_media, public.size_guides,
  public.size_guide_rows, public.size_guide_measurements, public.product_size_guides,
  public.inventory_locations, public.inventory_levels, public.inventory_adjustments,
  public.inventory_adjustment_items, public.inventory_transfers, public.inventory_transfer_items,
  public.orders, public.order_items, public.payments, public.payment_attempts,
  public.payment_transactions, public.payment_evidence, public.refunds,
  public.shipping_zones, public.shipping_rates, public.couriers, public.shipments,
  public.shipment_items, public.shipment_tracking_events,
  public.order_cancellation_requests, public.return_requests, public.return_request_items,
  public.exchange_items, public.return_shipments, public.return_inspections,
  public.review_media, public.review_reports, public.promotions,
  public.promotion_products, public.promotion_categories, public.coupons,
  public.cms_pages, public.cms_page_translations, public.cms_page_sections,
  public.banners, public.banner_translations, public.faq_categories, public.faq_entries,
  public.faq_translations, public.site_settings, public.notification_templates,
  public.notifications, public.notification_deliveries, public.staff_profiles,
  public.roles, public.permissions, public.role_permissions, public.staff_role_assignments,
  public.audit_logs, public.integration_providers, public.webhook_events, public.outbox_events
  to authenticated;

-- Reference tables are readable to support structured address selection.
create policy geo_public_active_read on public.provinces for select to anon, authenticated using (is_active);
create policy districts_public_active_read on public.districts for select to anon, authenticated using (is_active);
create policy municipalities_public_active_read on public.municipalities for select to anon, authenticated using (is_active);
create policy wards_public_active_read on public.wards for select to anon, authenticated using (is_active);

create policy media_public_read on public.media_assets for select to anon, authenticated
  using (provider = 'cloudinary' and storage_visibility = 'public' and public_url is not null);
create policy media_staff_manage on public.media_assets for all to authenticated
  using (private.has_permission('products.manage') or private.has_permission('content.manage'))
  with check (private.has_permission('products.manage') or private.has_permission('content.manage'));

create policy categories_public_read on public.categories for select to anon, authenticated
  using (status = 'published' and deleted_at is null);
create policy categories_staff_manage on public.categories for all to authenticated
  using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy category_translations_public_read on public.category_translations for select to anon, authenticated
  using (exists (select 1 from public.categories c where c.id = category_id and c.status = 'published' and c.deleted_at is null));
create policy category_translations_staff_manage on public.category_translations for all to authenticated
  using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));

create policy collections_public_read on public.collections for select to anon, authenticated
  using (status = 'published' and deleted_at is null and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy collections_staff_manage on public.collections for all to authenticated
  using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy collection_translations_public_read on public.collection_translations for select to anon, authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id and c.status = 'published' and c.deleted_at is null));
create policy collection_translations_staff_manage on public.collection_translations for all to authenticated
  using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));

create policy products_public_read on public.products for select to anon, authenticated
  using (status = 'published' and deleted_at is null and (published_at is null or published_at <= now()));
create policy products_staff_manage on public.products for all to authenticated
  using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy product_translations_public_read on public.product_translations for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null));
create policy product_translations_staff_manage on public.product_translations for all to authenticated
  using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy product_categories_public_read on public.product_categories for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null)
     and exists (select 1 from public.categories c where c.id = category_id and c.status = 'published' and c.deleted_at is null));
create policy product_categories_staff_manage on public.product_categories for all to authenticated
  using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy collection_products_public_read on public.collection_products for select to anon, authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id and c.status = 'published' and c.deleted_at is null)
     and exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null));
create policy collection_products_staff_manage on public.collection_products for all to authenticated
  using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy related_products_public_read on public.related_products for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null)
     and exists (select 1 from public.products rp where rp.id = related_product_id and rp.status = 'published' and rp.deleted_at is null));
create policy related_products_staff_manage on public.related_products for all to authenticated
  using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));

create policy attributes_public_read on public.attributes for select to anon, authenticated using (is_active and is_filterable);
create policy attributes_staff_manage on public.attributes for all to authenticated using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy attribute_values_public_read on public.attribute_values for select to anon, authenticated using (is_active and exists (select 1 from public.attributes a where a.id = attribute_id and a.is_active and a.is_filterable));
create policy attribute_values_staff_manage on public.attribute_values for all to authenticated using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy product_attributes_public_read on public.product_attributes for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null));
create policy product_attributes_staff_manage on public.product_attributes for all to authenticated using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy product_variants_public_read on public.product_variants for select to anon, authenticated
  using (status = 'active' and deleted_at is null and exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null));
create policy product_variants_staff_manage on public.product_variants for all to authenticated using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy product_variant_options_public_read on public.product_variant_options for select to anon, authenticated
  using (exists (select 1 from public.product_variants v join public.products p on p.id = v.product_id where v.id = variant_id and v.status = 'active' and p.status = 'published' and p.deleted_at is null));
create policy product_variant_options_staff_manage on public.product_variant_options for all to authenticated using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy product_media_public_read on public.product_media for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null)
     and exists (select 1 from public.media_assets m where m.id = media_asset_id and m.storage_visibility = 'public'));
create policy product_media_staff_manage on public.product_media for all to authenticated using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));
create policy collection_media_public_read on public.collection_media for select to anon, authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id and c.status = 'published' and c.deleted_at is null));
create policy collection_media_staff_manage on public.collection_media for all to authenticated using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy size_guides_public_read on public.size_guides for select to anon, authenticated using (status = 'published');
create policy size_guides_staff_manage on public.size_guides for all to authenticated using (private.has_permission('content.manage') or private.has_permission('products.manage')) with check (private.has_permission('content.manage') or private.has_permission('products.manage'));
create policy size_guide_rows_public_read on public.size_guide_rows for select to anon, authenticated using (exists (select 1 from public.size_guides g where g.id = size_guide_id and g.status = 'published'));
create policy size_guide_rows_staff_manage on public.size_guide_rows for all to authenticated using (private.has_permission('content.manage') or private.has_permission('products.manage')) with check (private.has_permission('content.manage') or private.has_permission('products.manage'));
create policy size_guide_measurements_public_read on public.size_guide_measurements for select to anon, authenticated using (exists (select 1 from public.size_guide_rows r join public.size_guides g on g.id = r.size_guide_id where r.id = size_guide_row_id and g.status = 'published'));
create policy size_guide_measurements_staff_manage on public.size_guide_measurements for all to authenticated using (private.has_permission('content.manage') or private.has_permission('products.manage')) with check (private.has_permission('content.manage') or private.has_permission('products.manage'));
create policy product_size_guides_public_read on public.product_size_guides for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.deleted_at is null) and exists (select 1 from public.size_guides g where g.id = size_guide_id and g.status = 'published'));
create policy product_size_guides_staff_manage on public.product_size_guides for all to authenticated using (private.has_permission('products.manage')) with check (private.has_permission('products.manage'));

-- Customer identity and saved addresses.
create policy profiles_select_self on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_staff_view on public.profiles for select to authenticated using (private.has_permission('customers.view'));
create policy addresses_customer_all on public.customer_addresses for all to authenticated
  using (customer_id = auth.uid() and deleted_at is null)
  with check (customer_id = auth.uid());
create policy addresses_staff_view on public.customer_addresses for select to authenticated using (private.has_permission('customers.view'));

create policy carts_customer_all on public.carts for all to authenticated using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy cart_items_customer_all on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid()));
create policy wishlists_customer_all on public.wishlists for all to authenticated using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy wishlist_items_customer_all on public.wishlist_items for all to authenticated
  using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.customer_id = auth.uid()))
  with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.customer_id = auth.uid()));

-- Order, payment and shipment records are read-only to customers; creation and state changes are server functions.
create policy orders_customer_read on public.orders for select to authenticated using (customer_id = auth.uid());
create policy orders_staff_read on public.orders for select to authenticated using (private.has_permission('orders.view'));
create policy order_items_customer_read on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy order_items_staff_read on public.order_items for select to authenticated using (private.has_permission('orders.view'));
create policy order_status_customer_read on public.order_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy order_status_staff_read on public.order_status_history for select to authenticated using (private.has_permission('orders.view'));
create policy order_payment_history_customer_read on public.order_payment_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy order_payment_history_staff_read on public.order_payment_status_history for select to authenticated using (private.has_permission('payments.view'));
create policy payments_customer_read on public.payments for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy payments_staff_read on public.payments for select to authenticated using (private.has_permission('payments.view'));
create policy payment_history_customer_read on public.payment_status_history for select to authenticated using (exists (select 1 from public.payments p join public.orders o on o.id = p.order_id where p.id = payment_id and o.customer_id = auth.uid()));
create policy payment_history_staff_read on public.payment_status_history for select to authenticated using (private.has_permission('payments.view'));
create policy payment_attempts_staff_read on public.payment_attempts for select to authenticated using (private.has_permission('payments.view'));
create policy payment_transactions_staff_read on public.payment_transactions for select to authenticated using (private.has_permission('payments.view'));
create policy refunds_customer_read on public.refunds for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy refund_history_customer_read on public.refund_status_history for select to authenticated using (exists (select 1 from public.refunds r join public.orders o on o.id = r.order_id where r.id = refund_id and o.customer_id = auth.uid()));
create policy order_discounts_customer_read on public.order_discounts for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy return_shipments_customer_read on public.return_shipments for select to authenticated using (exists (select 1 from public.return_requests rr join public.orders o on o.id = rr.order_id where rr.id = return_request_id and o.customer_id = auth.uid()));
create policy exchange_items_customer_read on public.exchange_items for select to authenticated using (exists (select 1 from public.return_request_items rri join public.return_requests rr on rr.id = rri.return_request_id join public.orders o on o.id = rr.order_id where rri.id = return_request_item_id and (rr.customer_id = auth.uid() or o.customer_id = auth.uid())));
create policy payment_evidence_customer_read on public.payment_evidence for select to authenticated using (exists (select 1 from public.payments p join public.orders o on o.id = p.order_id where p.id = payment_id and o.customer_id = auth.uid()));
create policy payment_evidence_staff_read on public.payment_evidence for select to authenticated using (private.has_permission('payments.view'));
create policy shipments_customer_read on public.shipments for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy shipments_staff_read on public.shipments for select to authenticated using (private.has_permission('deliveries.view'));
create policy shipment_items_customer_read on public.shipment_items for select to authenticated using (exists (select 1 from public.shipments s join public.orders o on o.id = s.order_id where s.id = shipment_id and o.customer_id = auth.uid()));
create policy shipment_items_staff_read on public.shipment_items for select to authenticated using (private.has_permission('deliveries.view'));
create policy shipment_events_customer_read on public.shipment_tracking_events for select to authenticated using (exists (select 1 from public.shipments s join public.orders o on o.id = s.order_id where s.id = shipment_id and o.customer_id = auth.uid()));
create policy shipment_events_staff_read on public.shipment_tracking_events for select to authenticated using (private.has_permission('deliveries.view'));

-- Cancellation and returns are created/decided through server workflows.
create policy cancellation_customer_read on public.order_cancellation_requests for select to authenticated using (requested_by_customer_id = auth.uid() or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy cancellation_staff_manage on public.order_cancellation_requests for all to authenticated using (private.has_permission('orders.cancel')) with check (private.has_permission('orders.cancel'));
create policy return_requests_customer_read on public.return_requests for select to authenticated using (customer_id = auth.uid() or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy return_requests_staff_manage on public.return_requests for all to authenticated using (private.has_permission('returns.manage')) with check (private.has_permission('returns.manage'));
create policy return_items_customer_read on public.return_request_items for select to authenticated using (exists (select 1 from public.return_requests rr left join public.orders o on o.id = rr.order_id where rr.id = return_request_id and (rr.customer_id = auth.uid() or o.customer_id = auth.uid())));
create policy return_items_staff_manage on public.return_request_items for all to authenticated using (private.has_permission('returns.manage')) with check (private.has_permission('returns.manage'));
create policy return_shipments_staff_manage on public.return_shipments for all to authenticated using (private.has_permission('returns.manage')) with check (private.has_permission('returns.manage'));

-- Reviews are public only after moderation. Customer submissions are performed through a verified-purchase server endpoint.
create policy reviews_public_approved_read on public.reviews for select to anon, authenticated using (status = 'approved');
create policy reviews_customer_own_read on public.reviews for select to authenticated using (customer_id = auth.uid());
create policy reviews_staff_manage on public.reviews for all to authenticated using (private.has_permission('reviews.moderate')) with check (private.has_permission('reviews.moderate'));
create policy review_media_public_read on public.review_media for select to anon, authenticated using (exists (select 1 from public.v_public_product_reviews r where r.id = review_id));
create policy review_media_staff_manage on public.review_media for all to authenticated using (private.has_permission('reviews.moderate')) with check (private.has_permission('reviews.moderate'));
create policy review_votes_customer_all on public.review_votes for all to authenticated using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy review_reports_customer_insert on public.review_reports for insert to authenticated with check (reported_by = auth.uid());
create policy review_reports_staff_manage on public.review_reports for all to authenticated using (private.has_permission('reviews.view_reports')) with check (private.has_permission('reviews.view_reports'));

-- Promotions public surface omits coupon codes, usage limits and redemption records.
create policy promotions_public_active_read on public.promotions for select to anon, authenticated
  using (status = 'active' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy promotions_staff_manage on public.promotions for all to authenticated using (private.has_permission('promotions.manage')) with check (private.has_permission('promotions.manage'));
create policy coupons_staff_manage on public.coupons for all to authenticated using (private.has_permission('promotions.manage')) with check (private.has_permission('promotions.manage'));
create policy promotion_products_public_read on public.promotion_products for select to anon, authenticated using (exists (select 1 from public.promotions p where p.id = promotion_id and p.status = 'active'));
create policy promotion_products_staff_manage on public.promotion_products for all to authenticated using (private.has_permission('promotions.manage')) with check (private.has_permission('promotions.manage'));
create policy promotion_categories_public_read on public.promotion_categories for select to anon, authenticated using (exists (select 1 from public.promotions p where p.id = promotion_id and p.status = 'active'));
create policy promotion_categories_staff_manage on public.promotion_categories for all to authenticated using (private.has_permission('promotions.manage')) with check (private.has_permission('promotions.manage'));

-- CMS content is public only after publish; editors require CMS permission.
create policy cms_pages_public_read on public.cms_pages for select to anon, authenticated using (status = 'published' and (published_at is null or published_at <= now()));
create policy cms_pages_staff_manage on public.cms_pages for all to authenticated using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy cms_translations_public_read on public.cms_page_translations for select to anon, authenticated using (exists (select 1 from public.cms_pages p where p.id = page_id and p.status = 'published'));
create policy cms_translations_staff_manage on public.cms_page_translations for all to authenticated using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy cms_sections_public_read on public.cms_page_sections for select to anon, authenticated using (is_enabled and exists (select 1 from public.cms_pages p where p.id = page_id and p.status = 'published'));
create policy cms_sections_staff_manage on public.cms_page_sections for all to authenticated using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy banners_public_read on public.banners for select to anon, authenticated using (status = 'active' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy banners_staff_manage on public.banners for all to authenticated using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy banner_translations_public_read on public.banner_translations for select to anon, authenticated using (exists (select 1 from public.banners b where b.id = banner_id and b.status = 'active'));
create policy banner_translations_staff_manage on public.banner_translations for all to authenticated using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy faq_categories_public_read on public.faq_categories for select to anon, authenticated using (status = 'published');
create policy faq_categories_staff_manage on public.faq_categories for all to authenticated using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy faq_entries_public_read on public.faq_entries for select to anon, authenticated using (status = 'published');
create policy faq_entries_staff_manage on public.faq_entries for all to authenticated using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy faq_translations_public_read on public.faq_translations for select to anon, authenticated using (exists (select 1 from public.faq_entries f where f.id = faq_entry_id and f.status = 'published'));
create policy faq_translations_staff_manage on public.faq_translations for all to authenticated using (private.has_permission('content.manage')) with check (private.has_permission('content.manage'));
create policy site_settings_public_allowlist_read on public.site_settings for select to anon, authenticated
  using (is_public and setting_key in ('store_name','support_whatsapp','social_links','storefront_notice'));
create policy site_settings_staff_manage on public.site_settings for all to authenticated using (private.has_permission('settings.manage')) with check (private.has_permission('settings.manage'));

-- Notifications and user activity.
create policy notifications_customer_read on public.notifications for select to authenticated using (customer_id = auth.uid());
create policy notifications_customer_mark_read on public.notifications for update to authenticated using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy notification_preferences_customer_all on public.customer_notification_preferences for all to authenticated using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy customer_events_customer_read on public.customer_events for select to authenticated using (customer_id = auth.uid());
create policy recently_viewed_customer_all on public.recently_viewed_products for all to authenticated using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy search_history_customer_all on public.customer_search_history for all to authenticated using (customer_id = auth.uid()) with check (customer_id = auth.uid());

-- RBAC, inventory, operations, audit and integrations.
create policy staff_profiles_self_read on public.staff_profiles for select to authenticated using (id = auth.uid() or private.has_permission('staff.manage'));
create policy staff_profiles_manage on public.staff_profiles for all to authenticated using (private.has_permission('staff.manage')) with check (private.has_permission('staff.manage'));
create policy roles_staff_read on public.roles for select to authenticated using (private.is_active_staff());
create policy roles_staff_manage on public.roles for all to authenticated using (private.has_permission('staff.manage')) with check (private.has_permission('staff.manage'));
create policy permissions_staff_read on public.permissions for select to authenticated using (private.is_active_staff());
create policy permissions_staff_manage on public.permissions for all to authenticated using (private.has_permission('staff.manage')) with check (private.has_permission('staff.manage'));
create policy role_permissions_staff_read on public.role_permissions for select to authenticated using (private.is_active_staff());
create policy role_permissions_staff_manage on public.role_permissions for all to authenticated using (private.has_permission('staff.manage')) with check (private.has_permission('staff.manage'));
create policy staff_assignments_self_read on public.staff_role_assignments for select to authenticated using (staff_user_id = auth.uid() or private.has_permission('staff.manage'));
create policy staff_assignments_manage on public.staff_role_assignments for all to authenticated using (private.has_permission('staff.manage')) with check (private.has_permission('staff.manage'));
create policy audit_logs_staff_read on public.audit_logs for select to authenticated using (private.has_permission('audit.view'));
create policy inventory_locations_staff_manage on public.inventory_locations for all to authenticated using (private.has_permission('inventory.adjust')) with check (private.has_permission('inventory.adjust'));
create policy inventory_staff_read on public.inventory_levels for select to authenticated using (private.has_permission('inventory.view'));
create policy inventory_locations_staff_read on public.inventory_locations for select to authenticated using (private.has_permission('inventory.view'));
create policy inventory_adjustments_staff_read on public.inventory_adjustments for select to authenticated using (private.has_permission('inventory.view'));
create policy inventory_adjustments_staff_manage on public.inventory_adjustments for all to authenticated using (private.has_permission('inventory.adjust')) with check (private.has_permission('inventory.adjust'));
create policy inventory_adjustment_items_staff_read on public.inventory_adjustment_items for select to authenticated using (private.has_permission('inventory.view'));
create policy inventory_adjustment_items_staff_manage on public.inventory_adjustment_items for all to authenticated using (private.has_permission('inventory.adjust')) with check (private.has_permission('inventory.adjust'));
create policy inventory_transfers_staff_read on public.inventory_transfers for select to authenticated using (private.has_permission('inventory.view'));
create policy inventory_transfers_staff_manage on public.inventory_transfers for all to authenticated using (private.has_permission('inventory.adjust')) with check (private.has_permission('inventory.adjust'));
create policy inventory_transfer_items_staff_read on public.inventory_transfer_items for select to authenticated using (private.has_permission('inventory.view'));
create policy inventory_transfer_items_staff_manage on public.inventory_transfer_items for all to authenticated using (private.has_permission('inventory.adjust')) with check (private.has_permission('inventory.adjust'));
create policy stock_reservations_staff_read on public.stock_reservations for select to authenticated using (private.has_permission('inventory.view') or private.has_permission('orders.view'));
create policy stock_reservation_items_staff_read on public.stock_reservation_items for select to authenticated using (private.has_permission('inventory.view') or private.has_permission('orders.view'));
create policy inventory_movements_staff_read on public.inventory_movements for select to authenticated using (private.has_permission('inventory.view'));
create policy order_discounts_staff_read on public.order_discounts for select to authenticated using (private.has_permission('orders.view'));
-- Payment status changes are RPC-only; no direct UPDATE policy is defined.
create policy refunds_staff_read on public.refunds for select to authenticated using (private.has_permission('payments.view'));
create policy refunds_staff_manage on public.refunds for all to authenticated using (private.has_permission('refunds.approve')) with check (private.has_permission('refunds.approve'));
create policy refund_history_staff_read on public.refund_status_history for select to authenticated using (private.has_permission('payments.view'));
create policy shipping_zones_public_read on public.shipping_zones for select to anon, authenticated using (is_active);
create policy shipping_rates_public_read on public.shipping_rates for select to anon, authenticated using (is_active and exists (select 1 from public.shipping_zones z where z.id = shipping_zone_id and z.is_active));
create policy payment_methods_public_enabled_read on public.payment_methods for select to anon, authenticated using (is_enabled);
create policy shipping_staff_manage on public.shipping_zones for all to authenticated using (private.has_permission('deliveries.manage')) with check (private.has_permission('deliveries.manage'));
create policy shipping_rates_staff_manage on public.shipping_rates for all to authenticated using (private.has_permission('deliveries.manage')) with check (private.has_permission('deliveries.manage'));
create policy courier_staff_manage on public.couriers for all to authenticated using (private.has_permission('deliveries.manage')) with check (private.has_permission('deliveries.manage'));
create policy shipment_staff_manage on public.shipments for all to authenticated using (private.has_permission('deliveries.manage')) with check (private.has_permission('deliveries.manage'));
create policy shipment_events_staff_insert on public.shipment_tracking_events for insert to authenticated with check (private.has_permission('deliveries.manage'));
create policy shipment_events_staff_read_all on public.shipment_tracking_events for select to authenticated using (private.has_permission('deliveries.view'));
create policy returns_inspection_staff_manage on public.return_inspections for all to authenticated using (private.has_permission('returns.inspect')) with check (private.has_permission('returns.inspect'));
create policy exchange_items_staff_manage on public.exchange_items for all to authenticated using (private.has_permission('returns.manage')) with check (private.has_permission('returns.manage'));
create policy return_shipments_staff_read_all on public.return_shipments for select to authenticated using (private.has_permission('returns.manage'));
create policy reviews_reports_staff_read_all on public.review_reports for select to authenticated using (private.has_permission('reviews.view_reports'));
create policy coupons_redemption_staff_read on public.coupon_redemptions for select to authenticated using (private.has_permission('promotions.manage'));
create policy coupon_redemption_customer_read on public.coupon_redemptions for select to authenticated using (customer_id = auth.uid());
create policy notification_templates_staff_manage on public.notification_templates for all to authenticated using (private.has_permission('notifications.manage')) with check (private.has_permission('notifications.manage'));
create policy notification_deliveries_staff_read on public.notification_deliveries for select to authenticated using (private.has_permission('notifications.manage'));
create policy notification_events_staff_read on public.notification_events for select to authenticated using (private.has_permission('notifications.manage'));
create policy integrations_staff_read on public.integration_providers for select to authenticated using (private.has_permission('integrations.manage'));
create policy integrations_staff_manage on public.integration_providers for all to authenticated using (private.has_permission('integrations.manage')) with check (private.has_permission('integrations.manage'));
create policy webhook_events_staff_read on public.webhook_events for select to authenticated using (private.has_permission('integrations.manage'));
create policy outbox_events_staff_read on public.outbox_events for select to authenticated using (private.has_permission('integrations.manage'));

-- Internal records never receive anonymous/customer write policies.

-- State-bearing/financial/ledger tables are mutated only by trusted transactional RPCs or server-only service workflows.
revoke insert, update, delete on public.orders, public.order_items, public.order_status_history,
  public.order_payment_status_history, public.payments, public.payment_attempts,
  public.payment_transactions, public.payment_evidence, public.payment_status_history,
  public.refunds, public.refund_status_history, public.stock_reservations,
  public.stock_reservation_items, public.inventory_levels, public.inventory_movements,
  public.audit_logs, public.webhook_events, public.outbox_events, public.guest_order_access_challenges
  from authenticated, anon;

-- Private payment evidence bucket. Guest uploads must use a server-issued signed URL.
insert into storage.buckets (id, name, public)
values ('payment-evidence', 'payment-evidence', false)
on conflict (id) do update set public = false;

drop policy if exists payment_evidence_objects_customer_insert on storage.objects;
create policy payment_evidence_objects_customer_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payment-evidence'
    and exists (
      select 1 from public.payments p join public.orders o on o.id = p.order_id
      where p.id::text = split_part(name, '/', 1) and o.customer_id = auth.uid()
    )
  );
drop policy if exists payment_evidence_objects_authorized_read on storage.objects;
create policy payment_evidence_objects_authorized_read on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-evidence'
    and (
      exists (select 1 from public.payment_evidence pe join public.payments p on p.id = pe.payment_id join public.orders o on o.id = p.order_id where pe.object_path = name and o.customer_id = auth.uid())
      or private.has_permission('payments.view')
    )
  );

-- No UPDATE/DELETE policy for evidence objects. Replacements/deletions use a controlled server workflow.
