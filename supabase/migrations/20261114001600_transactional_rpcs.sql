-- 0016: controlled transactional operations. Do not call from the browser with
-- service_role credentials. Server-only checkout uses service_role after the
-- Next.js service authenticates the customer and validates its request.

create or replace function private.commit_reservation(p_reservation_id uuid, p_actor_user_id uuid default null, p_actor_type text default 'system')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_res public.stock_reservations%rowtype;
  v_item record;
begin
  select * into v_res from public.stock_reservations where id = p_reservation_id for update;
  if not found then raise exception 'RESERVATION_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_res.status = 'committed' then return; end if;
  if v_res.status <> 'active' then raise exception 'RESERVATION_NOT_ACTIVE' using errcode = '55000'; end if;
  if v_res.expires_at <= pg_catalog.now() then raise exception 'RESERVATION_EXPIRED' using errcode = '55000'; end if;

  for v_item in
    select sri.*, il.id as level_id, il.on_hand_quantity
    from public.stock_reservation_items sri
    join public.inventory_levels il
      on il.variant_id = sri.variant_id and il.location_id = sri.location_id
    where sri.reservation_id = p_reservation_id
    order by sri.location_id, sri.variant_id
    for update of il
  loop
    if v_item.on_hand_quantity < v_item.quantity then
      raise exception 'INVENTORY_LEDGER_INCONSISTENT' using errcode = '23514';
    end if;
    update public.inventory_levels
       set on_hand_quantity = on_hand_quantity - v_item.quantity,
           version = version + 1,
           updated_at = pg_catalog.now()
     where id = v_item.level_id;
    insert into public.inventory_movements(
      inventory_level_id, variant_id, location_id, movement_type,
      on_hand_delta, reserved_delta, reservation_item_id, order_item_id,
      reason, actor_user_id
    ) values (
      v_item.level_id, v_item.variant_id, v_item.location_id, 'reservation_committed',
      -v_item.quantity, -v_item.quantity, v_item.id, v_item.order_item_id,
      'Order reservation committed', p_actor_user_id
    );
  end loop;

  update public.stock_reservations
     set status = 'committed', committed_at = pg_catalog.now(), updated_at = pg_catalog.now()
   where id = p_reservation_id and status = 'active';
end;
$$;

create or replace function private.release_reservation(
  p_reservation_id uuid,
  p_target_status text,
  p_reason text,
  p_actor_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_res public.stock_reservations%rowtype;
  v_item record;
begin
  if p_target_status not in ('released','expired') then
    raise exception 'INVALID_RESERVATION_TARGET' using errcode = '22023';
  end if;
  select * into v_res from public.stock_reservations where id = p_reservation_id for update;
  if not found then raise exception 'RESERVATION_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_res.status in ('released','expired') then return; end if;
  if v_res.status = 'committed' then raise exception 'COMMITTED_RESERVATION_CANNOT_BE_RELEASED' using errcode = '55000'; end if;
  if v_res.status <> 'active' then raise exception 'RESERVATION_NOT_ACTIVE' using errcode = '55000'; end if;

  for v_item in
    select sri.*, il.id as level_id
    from public.stock_reservation_items sri
    join public.inventory_levels il
      on il.variant_id = sri.variant_id and il.location_id = sri.location_id
    where sri.reservation_id = p_reservation_id
    order by sri.location_id, sri.variant_id
    for update of il
  loop
    insert into public.inventory_movements(
      inventory_level_id, variant_id, location_id, movement_type,
      on_hand_delta, reserved_delta, reservation_item_id, order_item_id,
      reason, actor_user_id
    ) values (
      v_item.level_id, v_item.variant_id, v_item.location_id,
      case when p_target_status = 'expired' then 'reservation_released' else 'reservation_released' end,
      0, -v_item.quantity, v_item.id, v_item.order_item_id, p_reason, p_actor_user_id
    );
  end loop;

  update public.stock_reservations
     set status = p_target_status,
         released_at = case when p_target_status = 'released' then pg_catalog.now() else null end,
         expired_at = case when p_target_status = 'expired' then pg_catalog.now() else null end,
         release_reason = p_reason,
         updated_at = pg_catalog.now()
   where id = p_reservation_id and status = 'active';
end;
$$;

create or replace function public.expire_due_reservations(p_batch_size integer default 100)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row record;
  v_count integer := 0;
begin
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;
  if p_batch_size < 1 or p_batch_size > 1000 then
    raise exception 'INVALID_BATCH_SIZE' using errcode = '22023';
  end if;

  for v_row in
    select sr.id
      from public.stock_reservations sr
      join public.orders o on o.id = sr.order_id
     where sr.status = 'active' and sr.expires_at <= pg_catalog.now() and o.status = 'pending'
     order by sr.expires_at
     limit p_batch_size
     for update of sr skip locked
  loop
    perform private.release_reservation(v_row.id, 'expired', 'Reservation expiry reached', null);
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.commit_stock_reservation(p_reservation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501'; end if;
  perform private.commit_reservation(p_reservation_id, null, 'system');
end;
$$;

create or replace function public.release_stock_reservation(p_reservation_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501'; end if;
  perform private.release_reservation(p_reservation_id, 'released', coalesce(nullif(p_reason,''),'Released by trusted workflow'), null);
end;
$$;

create or replace function public.create_checkout_order(
  p_items jsonb,
  p_customer_id uuid,
  p_guest_name text,
  p_guest_phone_e164 text,
  p_guest_email text,
  p_delivery_address_snapshot jsonb,
  p_billing_address_snapshot jsonb,
  p_shipping_zone_id uuid,
  p_shipping_rule_snapshot jsonb,
  p_shipping_fee numeric,
  p_payment_method_code text,
  p_location_id uuid,
  p_idempotency_key uuid,
  p_request_hash text,
  p_reservation_expires_at timestamptz,
  p_customer_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.orders%rowtype;
  v_payment_method public.payment_methods%rowtype;
  v_line jsonb;
  v_prepared jsonb := '[]'::jsonb;
  v_variant record;
  v_inventory_level_id uuid;
  v_on_hand_quantity integer;
  v_quantity integer;
  v_reserved integer;
  v_regular_price numeric(12,2);
  v_unit_price numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_grand_total numeric(12,2);
  v_order_id uuid;
  v_order_item_id uuid;
  v_payment_id uuid;
  v_reservation_id uuid;
  v_reference text;
  v_attributes jsonb;
  v_variant_label text;
begin
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;
  if p_idempotency_key is null or p_request_hash is null or length(p_request_hash) < 16 then
    raise exception 'INVALID_IDEMPOTENCY_INPUT' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_idempotency_key::text, 0));
  select * into v_existing from public.orders where checkout_idempotency_key = p_idempotency_key;
  if found then
    if v_existing.checkout_request_hash <> p_request_hash then
      raise exception 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST' using errcode = '23505';
    end if;
    return v_existing.id;
  end if;

  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array' or pg_catalog.jsonb_array_length(p_items) = 0 then
    raise exception 'CHECKOUT_ITEMS_REQUIRED' using errcode = '22023';
  end if;
  if (select count(*) from pg_catalog.jsonb_array_elements(p_items)) <>
     (select count(distinct value->>'variant_id') from pg_catalog.jsonb_array_elements(p_items)) then
    raise exception 'DUPLICATE_VARIANT_LINES_NOT_ALLOWED' using errcode = '22023';
  end if;
  if p_delivery_address_snapshot is null or pg_catalog.jsonb_typeof(p_delivery_address_snapshot) <> 'object' then
    raise exception 'DELIVERY_ADDRESS_REQUIRED' using errcode = '22023';
  end if;
  if p_shipping_zone_id is null or p_shipping_rule_snapshot is null or p_shipping_fee is null or p_shipping_fee < 0 then
    raise exception 'VALIDATED_SHIPPING_QUOTE_REQUIRED' using errcode = '22023';
  end if;
  if p_reservation_expires_at is null or p_reservation_expires_at <= pg_catalog.now() then
    raise exception 'VALID_RESERVATION_EXPIRY_REQUIRED' using errcode = '22023';
  end if;
  if p_customer_id is null and (nullif(trim(p_guest_name),'') is null or nullif(trim(p_guest_phone_e164),'') is null) then
    raise exception 'GUEST_CONTACT_REQUIRED' using errcode = '22023';
  end if;
  if p_customer_id is not null and not exists (
    select 1 from public.profiles pr where pr.id = p_customer_id and pr.account_status = 'active'
  ) then
    raise exception 'CUSTOMER_NOT_ACTIVE' using errcode = '23514';
  end if;
  select * into v_payment_method from public.payment_methods
   where code = lower(p_payment_method_code) and is_enabled;
  if not found then raise exception 'PAYMENT_METHOD_NOT_ENABLED' using errcode = '23514'; end if;
  if not exists (select 1 from public.shipping_zones z where z.id = p_shipping_zone_id and z.is_active) then
    raise exception 'SHIPPING_ZONE_NOT_ACTIVE' using errcode = '23514';
  end if;
  if not exists (select 1 from public.inventory_locations l where l.id = p_location_id and l.is_active) then
    raise exception 'INVENTORY_LOCATION_NOT_ACTIVE' using errcode = '23514';
  end if;

  -- Expire due pending-order holds before checking availability. Expiration itself is atomic.
  perform public.expire_due_reservations(1000);

  -- Lock inventory rows in deterministic variant order and build trusted snapshots from current catalogue data.
  for v_line in
    select value from pg_catalog.jsonb_array_elements(p_items)
    order by value->>'variant_id'
  loop
    if coalesce(v_line->>'variant_id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or coalesce(v_line->>'quantity','') !~ '^[1-9][0-9]*$' then
      raise exception 'INVALID_CHECKOUT_LINE' using errcode = '22023';
    end if;
    v_quantity := (v_line->>'quantity')::integer;
    if v_quantity > 99 then raise exception 'QUANTITY_LIMIT_EXCEEDED' using errcode = '22023'; end if;

    select v.id as variant_id, v.product_id, v.sku, v.status as variant_status,
           v.price_override, v.sale_price_override, v.sale_starts_at as variant_sale_starts_at,
           v.sale_ends_at as variant_sale_ends_at,
           p.name as product_name, p.status as product_status, p.default_price, p.sale_price,
           p.sale_starts_at as product_sale_starts_at, p.sale_ends_at as product_sale_ends_at
      into v_variant
      from public.product_variants v
      join public.products p on p.id = v.product_id
     where v.id = (v_line->>'variant_id')::uuid
       and v.status = 'active' and v.deleted_at is null
       and p.status = 'published' and p.deleted_at is null
     for update of v, p;
    if not found then raise exception 'PRODUCT_VARIANT_NOT_PURCHASABLE' using errcode = '23514'; end if;

    select il.id, il.on_hand_quantity into v_inventory_level_id, v_on_hand_quantity
      from public.inventory_levels il
     where il.variant_id = v_variant.variant_id and il.location_id = p_location_id
     for update;
    if not found then raise exception 'INVENTORY_NOT_CONFIGURED' using errcode = '23514'; end if;

    select coalesce(sum(sri.quantity),0)::integer into v_reserved
      from public.stock_reservation_items sri
      join public.stock_reservations sr on sr.id = sri.reservation_id
     where sr.status = 'active' and sri.variant_id = v_variant.variant_id and sri.location_id = p_location_id;
    if v_on_hand_quantity - v_reserved < v_quantity then
      raise exception 'INSUFFICIENT_STOCK' using errcode = '23514';
    end if;

    v_regular_price := coalesce(v_variant.price_override, v_variant.default_price);
    v_unit_price := v_regular_price;
    if v_variant.price_override is not null and v_variant.sale_price is not null
       and (v_variant.product_sale_starts_at is null or v_variant.product_sale_starts_at <= pg_catalog.now())
       and (v_variant.product_sale_ends_at is null or v_variant.product_sale_ends_at > pg_catalog.now()) then
      raise exception 'AMBIGUOUS_PRODUCT_AND_VARIANT_SALE_PRICE' using errcode = '23514';
    end if;
    if v_variant.sale_price_override is not null
       and (v_variant.variant_sale_starts_at is null or v_variant.variant_sale_starts_at <= pg_catalog.now())
       and (v_variant.variant_sale_ends_at is null or v_variant.variant_sale_ends_at > pg_catalog.now()) then
      if v_variant.sale_price_override > v_regular_price then
        raise exception 'SALE_PRICE_EXCEEDS_REGULAR_PRICE' using errcode = '23514';
      end if;
      v_unit_price := v_variant.sale_price_override;
    elsif v_variant.price_override is null and v_variant.sale_price is not null
       and (v_variant.product_sale_starts_at is null or v_variant.product_sale_starts_at <= pg_catalog.now())
       and (v_variant.product_sale_ends_at is null or v_variant.product_sale_ends_at > pg_catalog.now()) then
      v_unit_price := v_variant.sale_price;
    end if;

    select coalesce(
             pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('attribute', a.code, 'value', av.value, 'label', av.label) order by a.sort_order),
             '[]'::jsonb
           ),
           pg_catalog.string_agg(av.label, ' / ' order by a.sort_order)
      into v_attributes, v_variant_label
      from public.product_variant_options pvo
      join public.attributes a on a.id = pvo.attribute_id
      join public.attribute_values av on av.id = pvo.attribute_value_id and av.attribute_id = pvo.attribute_id
     where pvo.variant_id = v_variant.variant_id;

    v_prepared := v_prepared || pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
      'variant_id', v_variant.variant_id,
      'product_id', v_variant.product_id,
      'product_name', v_variant.product_name,
      'variant_name', v_variant_label,
      'sku', v_variant.sku,
      'attributes', v_attributes,
      'unit_price', v_unit_price,
      'quantity', v_quantity
    ));
    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
  end loop;

  v_grand_total := v_subtotal + p_shipping_fee;
  v_reference := 'NW-' || pg_catalog.upper(pg_catalog.substr(pg_catalog.replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into public.orders(
    public_reference, customer_id, guest_name, guest_phone_e164, guest_email,
    status, payment_status, currency_code, subtotal, discount_total, shipping_fee,
    tax_total, grand_total, delivery_address_snapshot, billing_address_snapshot,
    shipping_zone_id, shipping_rule_snapshot, selected_payment_method_code,
    customer_note, checkout_idempotency_key, checkout_request_hash
  ) values (
    v_reference, p_customer_id, p_guest_name, p_guest_phone_e164, p_guest_email,
    'pending', 'unpaid', 'NPR', v_subtotal, 0, p_shipping_fee, 0, v_grand_total,
    p_delivery_address_snapshot, p_billing_address_snapshot, p_shipping_zone_id,
    p_shipping_rule_snapshot, lower(p_payment_method_code), p_customer_note,
    p_idempotency_key, p_request_hash
  ) returning id into v_order_id;

  insert into public.stock_reservations(order_id, status, idempotency_key, expires_at)
  values (v_order_id, 'active', p_idempotency_key, p_reservation_expires_at)
  returning id into v_reservation_id;

  for v_line in select value from pg_catalog.jsonb_array_elements(v_prepared) loop
    insert into public.order_items(
      order_id, product_id, variant_id, product_name_snapshot, variant_name_snapshot,
      sku_snapshot, attributes_snapshot, unit_price, unit_discount, quantity,
      line_subtotal, line_discount, line_total, currency_code
    ) values (
      v_order_id, (v_line->>'product_id')::uuid, (v_line->>'variant_id')::uuid,
      v_line->>'product_name', v_line->>'variant_name', v_line->>'sku',
      v_line->'attributes', (v_line->>'unit_price')::numeric, 0,
      (v_line->>'quantity')::integer,
      (v_line->>'unit_price')::numeric * (v_line->>'quantity')::integer,
      0, (v_line->>'unit_price')::numeric * (v_line->>'quantity')::integer, 'NPR'
    ) returning id into v_order_item_id;

    select id into v_inventory_level_id from public.inventory_levels
     where variant_id = (v_line->>'variant_id')::uuid and location_id = p_location_id;
    insert into public.stock_reservation_items(reservation_id, order_item_id, variant_id, location_id, quantity)
    values (v_reservation_id, v_order_item_id, (v_line->>'variant_id')::uuid, p_location_id, (v_line->>'quantity')::integer);
    insert into public.inventory_movements(
      inventory_level_id, variant_id, location_id, movement_type,
      on_hand_delta, reserved_delta, reservation_item_id, order_item_id, reason
    ) values (
      v_inventory_level_id, (v_line->>'variant_id')::uuid, p_location_id, 'reservation_created',
      0, (v_line->>'quantity')::integer,
      (select sri.id from public.stock_reservation_items sri where sri.reservation_id = v_reservation_id and sri.order_item_id = v_order_item_id),
      v_order_item_id, 'Checkout stock reservation'
    );
  end loop;

  insert into public.payments(order_id, payment_method_id, provider_code, currency_code, amount, status)
  values (v_order_id, v_payment_method.id, coalesce(v_payment_method.provider_code, v_payment_method.code), 'NPR', v_grand_total, 'unpaid')
  returning id into v_payment_id;
  insert into public.payment_status_history(payment_id, from_status, to_status, actor_type, reason)
  values (v_payment_id, null, 'unpaid', 'system', 'Payment record created with order');
  insert into public.order_status_history(order_id, from_status, to_status, actor_type, reason)
  values (v_order_id, null, 'pending', 'system', 'Checkout order created');
  insert into public.order_payment_status_history(order_id, from_status, to_status, actor_type, reason)
  values (v_order_id, null, 'unpaid', 'system', 'Initial payment summary');
  insert into public.audit_logs(actor_type, action, entity_type, entity_id, after_data, reason)
  values ('system', 'order.created', 'order', v_order_id,
          pg_catalog.jsonb_build_object('public_reference', v_reference, 'grand_total', v_grand_total, 'currency', 'NPR'),
          'Order created through atomic checkout');
  insert into public.outbox_events(event_type, aggregate_type, aggregate_id, payload, idempotency_key)
  values ('order.created', 'order', v_order_id,
          pg_catalog.jsonb_build_object('order_id', v_order_id, 'public_reference', v_reference),
          'order.created:' || v_order_id::text);

  return v_order_id;
end;
$$;

create or replace function public.transition_order(p_order_id uuid, p_target_status text, p_reason text default null, p_request_id text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_res public.stock_reservations%rowtype;
  v_item record;
  v_old_status text;
begin
  if auth.uid() is null or not private.has_permission('orders.transition') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002'; end if;
  v_old_status := v_order.status;

  if p_target_status = 'confirmed'
     and v_order.selected_payment_method_code <> 'cod'
     and v_order.payment_status <> 'paid' then
    raise exception 'NON_COD_ORDER_REQUIRES_CONFIRMED_PAYMENT' using errcode = '23514';
  end if;

  if not (
    (v_old_status = 'pending' and p_target_status in ('confirmed','cancelled')) or
    (v_old_status = 'confirmed' and p_target_status in ('processing','cancelled')) or
    (v_old_status = 'processing' and p_target_status in ('shipped','cancelled')) or
    (v_old_status = 'shipped' and p_target_status = 'delivered')
  ) then raise exception 'INVALID_ORDER_TRANSITION' using errcode = '55000'; end if;

  if p_target_status = 'cancelled' and not private.has_permission('orders.cancel') then
    raise exception 'FORBIDDEN_CANCEL' using errcode = '42501';
  end if;
  if p_target_status = 'shipped' and not exists (
    select 1 from public.shipments s where s.order_id = p_order_id and s.dispatched_at is not null
  ) then raise exception 'DISPATCH_RECORD_REQUIRED' using errcode = '23514'; end if;
  if p_target_status = 'delivered' and not exists (
    select 1 from public.shipments s where s.order_id = p_order_id and s.status = 'delivered'
  ) then raise exception 'DELIVERY_CONFIRMATION_REQUIRED' using errcode = '23514'; end if;

  select * into v_res from public.stock_reservations where order_id = p_order_id order by created_at desc limit 1 for update;
  if p_target_status = 'confirmed' then
    if v_res.id is null then raise exception 'ORDER_RESERVATION_REQUIRED' using errcode = '23514'; end if;
    perform private.commit_reservation(v_res.id, auth.uid(), 'staff');
  elsif p_target_status = 'cancelled' and v_res.id is not null then
    if exists (select 1 from public.shipments s where s.order_id = p_order_id and s.dispatched_at is not null) then
      raise exception 'CANNOT_CANCEL_AFTER_DISPATCH' using errcode = '55000';
    end if;
    if v_res.status = 'active' then
      perform private.release_reservation(v_res.id, 'released', coalesce(p_reason,'Order cancelled'), auth.uid());
    elsif v_res.status = 'committed' then
      -- Once committed, a pre-dispatch cancellation restores on-hand stock through compensating ledger rows.
      for v_item in
        select sri.*, il.id as level_id
          from public.stock_reservation_items sri
          join public.inventory_levels il on il.variant_id = sri.variant_id and il.location_id = sri.location_id
         where sri.reservation_id = v_res.id
         order by sri.location_id, sri.variant_id
         for update of il
      loop
        update public.inventory_levels set on_hand_quantity = on_hand_quantity + v_item.quantity,
               version = version + 1, updated_at = pg_catalog.now()
         where id = v_item.level_id;
        insert into public.inventory_movements(
          inventory_level_id, variant_id, location_id, movement_type, on_hand_delta,
          reserved_delta, reservation_item_id, order_item_id, reason, actor_user_id
        ) values (
          v_item.level_id, v_item.variant_id, v_item.location_id, 'adjustment',
          v_item.quantity, 0, v_item.id, v_item.order_item_id,
          'Restock after pre-dispatch cancellation: ' || coalesce(p_reason,''), auth.uid()
        );
      end loop;
    end if;
  end if;

  update public.orders set status = p_target_status,
    confirmed_at = case when p_target_status = 'confirmed' then pg_catalog.now() else confirmed_at end,
    shipped_at = case when p_target_status = 'shipped' then pg_catalog.now() else shipped_at end,
    delivered_at = case when p_target_status = 'delivered' then pg_catalog.now() else delivered_at end,
    cancelled_at = case when p_target_status = 'cancelled' then pg_catalog.now() else cancelled_at end,
    updated_at = pg_catalog.now()
  where id = p_order_id;

  insert into public.order_status_history(order_id, from_status, to_status, reason, actor_user_id, actor_type, request_id)
  values (p_order_id, v_old_status, p_target_status, p_reason, auth.uid(), 'staff', p_request_id);
  insert into public.audit_logs(actor_user_id, actor_type, action, entity_type, entity_id, before_data, after_data, reason, request_id)
  values (auth.uid(), 'staff', 'order.status_changed', 'order', p_order_id,
          pg_catalog.jsonb_build_object('status',v_old_status), pg_catalog.jsonb_build_object('status',p_target_status), p_reason, p_request_id);
  insert into public.outbox_events(event_type, aggregate_type, aggregate_id, payload, idempotency_key)
  values ('order.status_changed', 'order', p_order_id,
          pg_catalog.jsonb_build_object('order_id',p_order_id,'from',v_old_status,'to',p_target_status),
          'order.status:' || p_order_id::text || ':' || p_target_status);
end;
$$;

-- Customer or server-verified guest submits a manual eSewa reference. The
-- trusted server must set p_verified_customer_id from the authenticated session,
-- or p_guest_challenge_verified=true only after the guest challenge succeeds.
create or replace function public.submit_manual_esewa_payment(
  p_payment_id uuid,
  p_customer_reference text,
  p_idempotency_key uuid,
  p_new_reservation_expires_at timestamptz,
  p_verified_customer_id uuid default null,
  p_guest_challenge_verified boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_reservation public.stock_reservations%rowtype;
  v_existing public.payment_attempts%rowtype;
  v_attempt_id uuid;
  v_attempt_number integer;
  v_request_hash text;
  v_old_order_payment_status text;
  v_actor_type text;
  v_actor_user_id uuid;
begin
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;
  if p_idempotency_key is null or nullif(trim(p_customer_reference),'') is null
     or length(trim(p_customer_reference)) > 200
     or p_new_reservation_expires_at is null
     or p_new_reservation_expires_at <= pg_catalog.now() then
    raise exception 'INVALID_PAYMENT_SUBMISSION' using errcode = '22023';
  end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then raise exception 'PAYMENT_NOT_FOUND' using errcode = 'P0002'; end if;
  select * into v_order from public.orders where id = v_payment.order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002'; end if;

  if auth.role() = 'service_role' then
    if v_order.customer_id is null then
      if p_guest_challenge_verified is not true then
        raise exception 'VERIFIED_GUEST_CHALLENGE_REQUIRED' using errcode = '42501';
      end if;
      v_actor_type := 'guest';
      v_actor_user_id := null;
    else
      if p_verified_customer_id is distinct from v_order.customer_id then
        raise exception 'CUSTOMER_OWNERSHIP_VERIFICATION_REQUIRED' using errcode = '42501';
      end if;
      v_actor_type := 'customer';
      v_actor_user_id := p_verified_customer_id;
    end if;
  end if;

  if v_order.status <> 'pending' then
    raise exception 'ORDER_NOT_AWAITING_PAYMENT' using errcode = '55000';
  end if;
  if not exists (
    select 1 from public.payment_methods pm
    where pm.id = v_payment.payment_method_id and pm.code = 'esewa_manual'
  ) then
    raise exception 'NOT_A_MANUAL_ESEWA_PAYMENT' using errcode = '23514';
  end if;

  v_request_hash := pg_catalog.md5(p_payment_id::text || ':' || lower(trim(p_customer_reference)));
  select * into v_existing from public.payment_attempts where idempotency_key = p_idempotency_key;
  if found then
    if v_existing.payment_id <> p_payment_id or v_existing.request_hash <> v_request_hash then
      raise exception 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST' using errcode = '23505';
    end if;
    return v_existing.id;
  end if;

  if v_payment.status not in ('unpaid','rejected','failed') then
    raise exception 'PAYMENT_NOT_ACCEPTING_A_NEW_SUBMISSION' using errcode = '55000';
  end if;

  select * into v_reservation
    from public.stock_reservations
   where order_id = v_order.id and status = 'active'
   order by created_at desc limit 1 for update;
  if not found or v_reservation.expires_at <= pg_catalog.now() then
    raise exception 'STOCK_RESERVATION_EXPIRED_CONTACT_SUPPORT' using errcode = '55000';
  end if;

  update public.stock_reservations
     set expires_at = greatest(expires_at, p_new_reservation_expires_at), updated_at = pg_catalog.now()
   where id = v_reservation.id;

  select coalesce(max(attempt_number),0) + 1 into v_attempt_number
    from public.payment_attempts where payment_id = p_payment_id;
  insert into public.payment_attempts(
    payment_id, attempt_number, idempotency_key, status, request_reference,
    request_hash, started_at, completed_at
  ) values (
    p_payment_id, v_attempt_number, p_idempotency_key, 'pending_verification',
    trim(p_customer_reference), v_request_hash, pg_catalog.now(), null
  ) returning id into v_attempt_id;

  update public.payments
     set status = 'pending_verification', customer_reference = trim(p_customer_reference),
         rejection_reason = null, updated_at = pg_catalog.now()
   where id = p_payment_id;
  insert into public.payment_status_history(payment_id, from_status, to_status, actor_user_id, actor_type, reason)
  values (p_payment_id, v_payment.status, 'pending_verification', v_actor_user_id, 'customer', 'Customer submitted eSewa reference');

  v_old_order_payment_status := v_order.payment_status;
  update public.orders set payment_status = 'pending_verification', updated_at = pg_catalog.now()
   where id = v_order.id;
  if v_old_order_payment_status <> 'pending_verification' then
    insert into public.order_payment_status_history(order_id, from_status, to_status, actor_user_id, actor_type, reason)
    values (v_order.id, v_old_order_payment_status, 'pending_verification', v_actor_user_id, 'customer', 'eSewa payment submitted for manual verification');
  end if;

  insert into public.audit_logs(actor_user_id, actor_type, action, entity_type, entity_id, before_data, after_data, reason)
  values (v_actor_user_id, v_actor_type, 'payment.manual_submission', 'payment', p_payment_id,
          pg_catalog.jsonb_build_object('status',v_payment.status),
          pg_catalog.jsonb_build_object('status','pending_verification','attempt_id',v_attempt_id),
          'Manual eSewa reference submitted');
  insert into public.outbox_events(event_type, aggregate_type, aggregate_id, payload, idempotency_key)
  values ('payment.submitted_for_verification', 'payment', p_payment_id,
          pg_catalog.jsonb_build_object('payment_id',p_payment_id,'attempt_id',v_attempt_id,'order_id',v_order.id),
          'payment.submitted:' || v_attempt_id::text);
  return v_attempt_id;
end;
$$;

create or replace function public.decide_manual_payment(p_payment_id uuid, p_decision text, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_reservation public.stock_reservations%rowtype;
  v_new_status text;
  v_old_order_payment_status text;
  v_paid numeric(12,2);
  v_refunded numeric(12,2);
  v_pending boolean;
  v_rejected boolean;
  v_failed boolean;
  v_new_order_status text;
begin
  if auth.uid() is null or not private.has_permission('payments.verify') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_decision not in ('approve','reject') or nullif(trim(p_reason),'') is null then
    raise exception 'DECISION_AND_REASON_REQUIRED' using errcode = '22023';
  end if;
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then raise exception 'PAYMENT_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_payment.status <> 'pending_verification' then raise exception 'PAYMENT_NOT_PENDING_VERIFICATION' using errcode = '55000'; end if;
  if not exists (
    select 1 from public.payment_methods pm where pm.id = v_payment.payment_method_id and pm.code = 'esewa_manual'
  ) then raise exception 'NOT_A_MANUAL_ESEWA_PAYMENT' using errcode = '23514'; end if;
  if p_decision = 'approve' and nullif(trim(v_payment.customer_reference),'') is null then
    raise exception 'PAYMENT_REFERENCE_REQUIRED' using errcode = '23514';
  end if;
  select * into v_order from public.orders where id = v_payment.order_id for update;
  if p_decision = 'approve' then
    if v_order.status <> 'pending' then
      raise exception 'ORDER_NOT_AWAITING_PAYMENT' using errcode = '55000';
    end if;
    select * into v_reservation from public.stock_reservations sr
     where sr.order_id = v_order.id and sr.status = 'active'
     order by sr.created_at desc limit 1 for update;
    if not found or v_reservation.expires_at <= pg_catalog.now() then
      raise exception 'STOCK_RESERVATION_EXPIRED_PAYMENT_REQUIRES_MANUAL_RECONCILIATION' using errcode = '55000';
    end if;
  end if;

  v_new_status := case when p_decision = 'approve' then 'paid' else 'rejected' end;
  update public.payments set status = v_new_status,
    verified_by = auth.uid(), verified_at = pg_catalog.now(),
    paid_at = case when v_new_status = 'paid' then pg_catalog.now() else paid_at end,
    rejection_reason = case when v_new_status = 'rejected' then p_reason else null end,
    updated_at = pg_catalog.now()
  where id = p_payment_id;
  update public.payment_attempts set status = case when v_new_status = 'paid' then 'succeeded' else 'rejected' end,
    completed_at = pg_catalog.now()
  where id = (select pa.id from public.payment_attempts pa where pa.payment_id = p_payment_id order by pa.attempt_number desc limit 1);
  insert into public.payment_status_history(payment_id, from_status, to_status, actor_user_id, actor_type, reason)
  values (p_payment_id, v_payment.status, v_new_status, auth.uid(), 'staff', p_reason);
  if v_new_status = 'paid' then
    insert into public.payment_transactions(payment_id, provider_code, transaction_type, amount, currency_code, status, verified_at, safe_metadata)
    values (p_payment_id, coalesce(v_payment.provider_code,'esewa_manual'), 'verification', v_payment.amount, v_payment.currency_code, 'verified', pg_catalog.now(), pg_catalog.jsonb_build_object('verification_source','admin_manual'));
  end if;

  v_old_order_payment_status := v_order.payment_status;
  select coalesce(sum(p.amount),0) into v_paid from public.payments p where p.order_id = v_order.id and p.status in ('paid','partially_refunded','refunded');
  select coalesce(sum(r.amount),0) into v_refunded from public.refunds r where r.order_id = v_order.id and r.status = 'succeeded';
  select exists(select 1 from public.payments p where p.order_id = v_order.id and p.status = 'pending_verification'),
         exists(select 1 from public.payments p where p.order_id = v_order.id and p.status = 'rejected'),
         exists(select 1 from public.payments p where p.order_id = v_order.id and p.status = 'failed')
    into v_pending, v_rejected, v_failed;
  v_new_order_status := case
    when v_refunded > 0 and v_refunded >= v_paid then 'refunded'
    when v_refunded > 0 then 'partially_refunded'
    when v_paid >= v_order.grand_total then 'paid'
    when v_paid > 0 then 'partially_paid'
    when v_pending then 'pending_verification'
    when v_rejected then 'rejected'
    when v_failed then 'failed'
    else 'unpaid' end;
  update public.orders set payment_status = v_new_order_status, updated_at = pg_catalog.now() where id = v_order.id;
  if v_old_order_payment_status <> v_new_order_status then
    insert into public.order_payment_status_history(order_id, from_status, to_status, reason, actor_user_id, actor_type)
    values (v_order.id, v_old_order_payment_status, v_new_order_status, p_reason, auth.uid(), 'staff');
  end if;
  insert into public.audit_logs(actor_user_id, actor_type, action, entity_type, entity_id, before_data, after_data, reason)
  values (auth.uid(), 'staff', 'payment.manual_decision', 'payment', p_payment_id,
          pg_catalog.jsonb_build_object('status',v_payment.status), pg_catalog.jsonb_build_object('status',v_new_status), p_reason);
  insert into public.outbox_events(event_type, aggregate_type, aggregate_id, payload, idempotency_key)
  values ('payment.status_changed', 'payment', p_payment_id,
          pg_catalog.jsonb_build_object('payment_id',p_payment_id,'status',v_new_status),
          'payment.status:' || p_payment_id::text || ':' || v_new_status);
end;
$$;

create or replace function public.record_cod_collection(p_payment_id uuid, p_collected_amount numeric, p_reference text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
begin
  if auth.uid() is null or not private.has_permission('payments.cod_collect') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then raise exception 'PAYMENT_NOT_FOUND' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.payment_methods pm where pm.id = v_payment.payment_method_id and pm.code = 'cod') then
    raise exception 'NOT_A_COD_PAYMENT' using errcode = '23514';
  end if;
  if v_payment.status <> 'unpaid' or p_collected_amount <> v_payment.amount then
    raise exception 'COD_COLLECTION_MUST_MATCH_OUTSTANDING_AMOUNT' using errcode = '23514';
  end if;
  update public.payments set status = 'paid', paid_at = pg_catalog.now(), verified_by = auth.uid(), verified_at = pg_catalog.now(), updated_at = pg_catalog.now() where id = p_payment_id;
  insert into public.payment_transactions(payment_id, provider_code, provider_transaction_id, transaction_type, amount, currency_code, status, verified_at, safe_metadata)
  values (p_payment_id, 'cod', null, 'cod_collection', p_collected_amount, 'NPR', 'verified', pg_catalog.now(), pg_catalog.jsonb_build_object('staff_reference',p_reference));
  insert into public.payment_status_history(payment_id, from_status, to_status, actor_user_id, actor_type, reason)
  values (p_payment_id, 'unpaid', 'paid', auth.uid(), 'staff', 'COD collected');
  select * into v_order from public.orders where id = v_payment.order_id for update;
  if v_order.status <> 'delivered' then
    raise exception 'COD_COLLECTION_REQUIRES_DELIVERED_ORDER' using errcode = '55000';
  end if;
  update public.orders set payment_status = 'paid', updated_at = pg_catalog.now() where id = v_order.id;
  if v_order.payment_status <> 'paid' then
    insert into public.order_payment_status_history(order_id, from_status, to_status, actor_user_id, actor_type, reason)
    values (v_order.id, v_order.payment_status, 'paid', auth.uid(), 'staff', 'COD collected');
  end if;
  insert into public.audit_logs(actor_user_id, actor_type, action, entity_type, entity_id, reason, after_data)
  values (auth.uid(), 'staff', 'payment.cod_collected', 'payment', p_payment_id, 'COD collection recorded', pg_catalog.jsonb_build_object('amount',p_collected_amount,'reference',p_reference));
  insert into public.outbox_events(event_type, aggregate_type, aggregate_id, payload, idempotency_key)
  values ('payment.status_changed', 'payment', p_payment_id,
          pg_catalog.jsonb_build_object('payment_id',p_payment_id,'status','paid','collection_method','cod'),
          'payment.cod_collected:' || p_payment_id::text);
end;
$$;

create or replace function public.post_inventory_adjustment(
  p_variant_id uuid, p_location_id uuid, p_quantity_delta integer,
  p_reason_code text, p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_level public.inventory_levels%rowtype;
  v_reserved integer;
  v_adjustment_id uuid;
  v_adjustment_item_id uuid;
  v_reference text;
begin
  if auth.uid() is null or not private.has_permission('inventory.adjust') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_quantity_delta = 0 or nullif(trim(p_reason_code),'') is null or nullif(trim(p_reason),'') is null then
    raise exception 'ADJUSTMENT_REASON_AND_NONZERO_DELTA_REQUIRED' using errcode = '22023';
  end if;
  select * into v_level from public.inventory_levels
   where variant_id = p_variant_id and location_id = p_location_id for update;
  if not found then raise exception 'INVENTORY_LEVEL_NOT_FOUND' using errcode = 'P0002'; end if;
  select coalesce(sum(sri.quantity),0)::integer into v_reserved
    from public.stock_reservation_items sri join public.stock_reservations sr on sr.id = sri.reservation_id
   where sri.variant_id = p_variant_id and sri.location_id = p_location_id and sr.status = 'active';
  if v_level.on_hand_quantity + p_quantity_delta < v_reserved then
    raise exception 'ADJUSTMENT_WOULD_INFRINGE_ACTIVE_RESERVATIONS' using errcode = '23514';
  end if;
  v_reference := 'ADJ-' || pg_catalog.upper(pg_catalog.substr(pg_catalog.replace(gen_random_uuid()::text,'-',''),1,12));
  insert into public.inventory_adjustments(location_id, adjustment_reference, reason_code, reason, status, created_by, posted_at)
  values (p_location_id, v_reference, p_reason_code, p_reason, 'posted', auth.uid(), pg_catalog.now()) returning id into v_adjustment_id;
  insert into public.inventory_adjustment_items(adjustment_id, variant_id, quantity_delta)
  values (v_adjustment_id, p_variant_id, p_quantity_delta) returning id into v_adjustment_item_id;
  update public.inventory_levels set on_hand_quantity = on_hand_quantity + p_quantity_delta,
    version = version + 1, updated_at = pg_catalog.now() where id = v_level.id;
  insert into public.inventory_movements(inventory_level_id, variant_id, location_id, movement_type, on_hand_delta, reserved_delta, adjustment_item_id, reason, actor_user_id)
  values (v_level.id, p_variant_id, p_location_id, 'adjustment', p_quantity_delta, 0, v_adjustment_item_id, p_reason, auth.uid());
  insert into public.audit_logs(actor_user_id, actor_type, action, entity_type, entity_id, reason, after_data)
  values (auth.uid(), 'staff', 'inventory.adjusted', 'inventory_adjustment', v_adjustment_id, p_reason,
          pg_catalog.jsonb_build_object('variant_id',p_variant_id,'location_id',p_location_id,'quantity_delta',p_quantity_delta));
  return v_adjustment_id;
end;
$$;

-- Create a minimal profile on Supabase Auth signup. User-controlled metadata is restricted to display name.
create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, display_name, email, phone_e164)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name',''), nullif(new.raw_user_meta_data->>'name','')),
    new.email,
    new.phone
  ) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_auth_user() from public;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
for each row execute function private.handle_new_auth_user();

-- Restrict helper access and expose only intended RPCs.
revoke all on function private.commit_reservation(uuid,uuid,text) from public;
revoke all on function private.release_reservation(uuid,text,text,uuid) from public;
revoke all on function public.expire_due_reservations(integer) from public;
revoke all on function public.commit_stock_reservation(uuid) from public;
revoke all on function public.release_stock_reservation(uuid,text) from public;
revoke all on function public.create_checkout_order(jsonb,uuid,text,text,text,jsonb,jsonb,uuid,jsonb,numeric,text,uuid,uuid,text,timestamptz,text) from public;
revoke all on function public.transition_order(uuid,text,text,text) from public;
revoke all on function public.submit_manual_esewa_payment(uuid,text,uuid,timestamptz,uuid,boolean) from public;
revoke all on function public.decide_manual_payment(uuid,text,text) from public;
revoke all on function public.record_cod_collection(uuid,numeric,text) from public;
revoke all on function public.post_inventory_adjustment(uuid,uuid,integer,text,text) from public;

grant execute on function public.expire_due_reservations(integer) to service_role;
grant execute on function public.commit_stock_reservation(uuid) to service_role;
grant execute on function public.release_stock_reservation(uuid,text) to service_role;
grant execute on function public.create_checkout_order(jsonb,uuid,text,text,text,jsonb,jsonb,uuid,jsonb,numeric,text,uuid,uuid,text,timestamptz,text) to service_role;
grant execute on function public.transition_order(uuid,text,text,text) to authenticated;
grant execute on function public.submit_manual_esewa_payment(uuid,text,uuid,timestamptz,uuid,boolean) to service_role;
grant execute on function public.decide_manual_payment(uuid,text,text) to authenticated;
grant execute on function public.record_cod_collection(uuid,numeric,text) to authenticated;
grant execute on function public.post_inventory_adjustment(uuid,uuid,integer,text,text) to authenticated;
