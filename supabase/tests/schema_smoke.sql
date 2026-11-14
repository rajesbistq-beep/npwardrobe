-- Run after `supabase db reset` against the local database.
-- Fail fast if an application table is missing RLS or required schema objects.
do $$
declare
  v_unprotected text;
  v_missing text;
begin
  select string_agg(tablename, ', ' order by tablename)
    into v_unprotected
    from pg_catalog.pg_tables
   where schemaname = 'public' and rowsecurity = false;
  if v_unprotected is not null then
    raise exception 'RLS_DISABLED_ON_PUBLIC_TABLES: %', v_unprotected;
  end if;

  select string_agg(required_name, ', ' order by required_name)
    into v_missing
    from unnest(array[
      'products','product_variants','product_variant_options','inventory_levels',
      'orders','order_items','payments','payment_attempts','stock_reservations',
      'stock_reservation_items','inventory_movements','profiles','customer_addresses',
      'roles','permissions','role_permissions','staff_role_assignments','audit_logs',
      'webhook_events','outbox_events','return_requests','return_inspections'
    ]) required_name
   where to_regclass('public.' || required_name) is null;
  if v_missing is not null then
    raise exception 'MISSING_REQUIRED_TABLES: %', v_missing;
  end if;

  if to_regclass('public.v_inventory_availability') is null then
    raise exception 'MISSING_INVENTORY_AVAILABILITY_VIEW';
  end if;
  if to_regclass('public.v_public_product_reviews') is null then
    raise exception 'MISSING_SAFE_PUBLIC_REVIEW_VIEW';
  end if;
  if to_regprocedure('public.create_checkout_order(jsonb,uuid,text,text,text,jsonb,jsonb,uuid,jsonb,numeric,text,uuid,uuid,text,timestamp with time zone,text)') is null then
    raise exception 'MISSING_CREATE_CHECKOUT_ORDER_RPC';
  end if;
  if to_regprocedure('public.submit_manual_esewa_payment(uuid,text,uuid,timestamp with time zone,uuid,boolean)') is null then
    raise exception 'MISSING_MANUAL_ESEWA_SUBMISSION_RPC';
  end if;
  if not exists (select 1 from public.permissions where code = 'payments.verify') then
    raise exception 'MISSING_PERMISSION_SEEDS';
  end if;
  if exists (select 1 from public.payment_methods where code in ('cod','esewa_manual') and is_enabled) then
    raise exception 'PAYMENT_METHODS_MUST_START_DISABLED_UNTIL_CONFIGURED';
  end if;
  if has_column_privilege('anon','public.payment_methods','configuration','select')
     or has_column_privilege('authenticated','public.payment_methods','configuration','select') then
    raise exception 'PRIVATE_PAYMENT_CONFIGURATION_EXPOSED';
  end if;
  if not has_column_privilege('anon','public.payment_methods','public_configuration','select') then
    raise exception 'PUBLIC_PAYMENT_CONFIGURATION_NOT_READABLE';
  end if;
  if has_function_privilege('authenticated',
       'public.submit_manual_esewa_payment(uuid,text,uuid,timestamp with time zone,uuid,boolean)','execute') then
    raise exception 'MANUAL_ESEWA_SUBMISSION_RPC_MUST_BE_SERVER_ONLY';
  end if;
  if has_table_privilege('anon','public.reviews','select')
     or has_column_privilege('anon','public.reviews','customer_id','select')
     or has_column_privilege('authenticated','public.reviews','customer_id','select')
     or has_column_privilege('authenticated','public.reviews','order_item_id','select') then
    raise exception 'RAW_REVIEW_IDENTIFIERS_MUST_NOT_BE_EXPOSED';
  end if;
  if not has_table_privilege('anon','public.v_public_product_reviews','select') then
    raise exception 'SAFE_REVIEW_VIEW_NOT_PUBLIC';
  end if;
end;
$$;

select 'NP Wardrobe schema smoke checks passed.' as result;
