-- 0018: transactional staff catalogue writes and zero-stock inventory setup.

alter table public.product_media
  add column alt_text text check (alt_text is null or pg_catalog.char_length(alt_text) <= 180);

insert into public.attributes (code, name, attribute_type, is_variant_defining, is_filterable, sort_order)
values
  ('size', 'Size', 'size', true, true, 10),
  ('colour', 'Colour', 'colour_swatch', true, true, 20)
on conflict (code) do nothing;

drop policy attribute_values_public_read on public.attribute_values;
create policy attribute_values_public_read on public.attribute_values for select to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.attributes as attribute
       where attribute.id = attribute_id and attribute.is_active and attribute.is_filterable
    )
    and exists (
      select 1
        from public.product_variant_options as option
        join public.product_variants as variant on variant.id = option.variant_id
        join public.products as product on product.id = variant.product_id
       where option.attribute_value_id = attribute_values.id
         and variant.status = 'active' and variant.deleted_at is null
         and product.status = 'published' and product.deleted_at is null
         and (product.published_at is null or product.published_at <= pg_catalog.now())
    )
  );

create or replace function private.ensure_variant_inventory_levels()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active' and new.deleted_at is null then
    insert into public.inventory_levels (variant_id, location_id, on_hand_quantity)
    select new.id, location.id, 0
      from public.inventory_locations as location
     where location.is_active
    on conflict (variant_id, location_id) do nothing;
  end if;
  return new;
end;
$$;

create or replace function private.ensure_location_inventory_levels()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_active then
    insert into public.inventory_levels (variant_id, location_id, on_hand_quantity)
    select variant.id, new.id, 0
      from public.product_variants as variant
     where variant.status = 'active' and variant.deleted_at is null
    on conflict (variant_id, location_id) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function private.ensure_variant_inventory_levels() from public, anon, authenticated;
revoke all on function private.ensure_location_inventory_levels() from public, anon, authenticated;

create trigger product_variants_initialize_inventory
after insert or update on public.product_variants
for each row execute function private.ensure_variant_inventory_levels();

create trigger inventory_locations_initialize_levels
after insert or update of is_active on public.inventory_locations
for each row execute function private.ensure_location_inventory_levels();

insert into public.inventory_levels (variant_id, location_id, on_hand_quantity)
select variant.id, location.id, 0
  from public.product_variants as variant
  cross join public.inventory_locations as location
 where variant.status = 'active'
   and variant.deleted_at is null
   and location.is_active
on conflict (variant_id, location_id) do nothing;

create or replace function public.create_inventory_location(
  p_code text,
  p_name text,
  p_location_type text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_location_id uuid;
begin
  if auth.uid() is null or not private.has_permission('inventory.adjust') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_code is null or p_code !~ '^[a-z0-9][a-z0-9_-]{1,31}$'
     or p_name is null or pg_catalog.char_length(pg_catalog.btrim(p_name)) not between 1 and 120
     or p_location_type is null or p_location_type not in ('warehouse', 'store', 'other') then
    raise exception 'INVALID_INVENTORY_LOCATION' using errcode = '22023';
  end if;
  insert into public.inventory_locations (code, name, location_type, is_active)
  values (p_code, pg_catalog.btrim(p_name), p_location_type, true)
  returning id into v_location_id;
  insert into public.audit_logs (
    actor_user_id, actor_type, action, entity_type, entity_id, after_data
  ) values (
    auth.uid(), 'staff', 'inventory.location_created', 'inventory_location',
    v_location_id, pg_catalog.jsonb_build_object('code', p_code, 'name', pg_catalog.btrim(p_name), 'location_type', p_location_type)
  );
  return v_location_id;
end;
$$;

revoke all on function public.create_inventory_location(text, text, text) from public, anon;
grant execute on function public.create_inventory_location(text, text, text) to authenticated;

create or replace function public.save_catalog_product(
  p_product jsonb,
  p_categories uuid[],
  p_variants jsonb,
  p_media jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
  v_product_before jsonb;
  v_product_status text;
  v_variant jsonb;
  v_option jsonb;
  v_variant_id uuid;
  v_attribute_id uuid;
  v_attribute_type text;
  v_value_id uuid;
  v_option_count integer;
  v_media_count integer;
  v_category_count integer;
  v_signature text;
begin
  if auth.uid() is null or not private.has_permission('products.manage') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_product is null or pg_catalog.jsonb_typeof(p_product) <> 'object'
     or p_variants is null or pg_catalog.jsonb_typeof(p_variants) <> 'array'
     or pg_catalog.jsonb_array_length(p_variants) < 1
     or pg_catalog.jsonb_array_length(p_variants) > 200
     or p_media is null or pg_catalog.jsonb_typeof(p_media) <> 'array'
     or pg_catalog.jsonb_array_length(p_media) > 20
     or coalesce(pg_catalog.cardinality(p_categories), 0) > 50 then
    raise exception 'INVALID_CATALOGUE_INPUT' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_typeof(p_product->'id') not in ('string', 'null')
     or pg_catalog.jsonb_typeof(p_product->'name') <> 'string'
     or pg_catalog.jsonb_typeof(p_product->'slug') <> 'string'
     or pg_catalog.jsonb_typeof(p_product->'default_price') <> 'number'
     or pg_catalog.jsonb_typeof(p_product->'status') <> 'string'
     or pg_catalog.jsonb_typeof(p_product->'is_featured') <> 'boolean' then
    raise exception 'INVALID_CATALOGUE_INPUT' using errcode = '22023';
  end if;

  v_product_status := p_product->>'status';
  if v_product_status not in ('draft', 'published', 'archived') then
    raise exception 'INVALID_CATALOGUE_INPUT' using errcode = '22023';
  end if;

  if p_product->>'id' is not null then
    v_product_id := (p_product->>'id')::uuid;
    select pg_catalog.to_jsonb(product) into v_product_before
      from public.products as product
     where product.id = v_product_id and product.deleted_at is null
     for update;
    if not found then raise exception 'PRODUCT_NOT_FOUND' using errcode = 'P0002'; end if;
    update public.products
       set slug = p_product->>'slug',
           name = pg_catalog.btrim(p_product->>'name'),
           short_description = nullif(pg_catalog.btrim(p_product->>'short_description'), ''),
           description = nullif(pg_catalog.btrim(p_product->>'description'), ''),
           material = nullif(pg_catalog.btrim(p_product->>'material'), ''),
           care_instructions = nullif(pg_catalog.btrim(p_product->>'care_instructions'), ''),
           fit_notes = nullif(pg_catalog.btrim(p_product->>'fit_notes'), ''),
           product_type = nullif(pg_catalog.btrim(p_product->>'product_type'), ''),
           status = v_product_status,
           default_price = (p_product->>'default_price')::numeric,
           sale_price = nullif(p_product->>'sale_price', '')::numeric,
           is_featured = (p_product->>'is_featured')::boolean,
           seo_title = nullif(pg_catalog.btrim(p_product->>'seo_title'), ''),
           seo_description = nullif(pg_catalog.btrim(p_product->>'seo_description'), ''),
           published_at = case
             when v_product_status <> 'published' then null
             else coalesce(published_at, pg_catalog.now())
           end,
           updated_at = pg_catalog.now()
     where id = v_product_id;
  else
    insert into public.products (
      slug, name, short_description, description, material, care_instructions,
      fit_notes, product_type, status, default_price, sale_price, is_featured,
      seo_title, seo_description, published_at
    ) values (
      p_product->>'slug',
      pg_catalog.btrim(p_product->>'name'),
      nullif(pg_catalog.btrim(p_product->>'short_description'), ''),
      nullif(pg_catalog.btrim(p_product->>'description'), ''),
      nullif(pg_catalog.btrim(p_product->>'material'), ''),
      nullif(pg_catalog.btrim(p_product->>'care_instructions'), ''),
      nullif(pg_catalog.btrim(p_product->>'fit_notes'), ''),
      nullif(pg_catalog.btrim(p_product->>'product_type'), ''),
      v_product_status,
      (p_product->>'default_price')::numeric,
      nullif(p_product->>'sale_price', '')::numeric,
      (p_product->>'is_featured')::boolean,
      nullif(pg_catalog.btrim(p_product->>'seo_title'), ''),
      nullif(pg_catalog.btrim(p_product->>'seo_description'), ''),
      case when v_product_status = 'published' then pg_catalog.now() else null end
    ) returning id into v_product_id;
  end if;

  select pg_catalog.count(distinct category_id)::integer into v_category_count
    from pg_catalog.unnest(coalesce(p_categories, array[]::uuid[])) as selected(category_id);
  if v_category_count <> coalesce(pg_catalog.cardinality(p_categories), 0) then
    raise exception 'DUPLICATE_CATEGORY' using errcode = '22023';
  end if;
  delete from public.product_categories where product_id = v_product_id;
  insert into public.product_categories (product_id, category_id, is_primary, sort_order)
  select v_product_id, category_id, position = 1, (position - 1)::integer
    from pg_catalog.unnest(coalesce(p_categories, array[]::uuid[]))
         with ordinality as selected(category_id, position);

  update public.product_variants
     set status = 'inactive',
         option_signature = '__pending__' || id::text,
         updated_at = pg_catalog.now()
   where product_id = v_product_id and deleted_at is null;
  delete from public.product_attributes where product_id = v_product_id;

  for v_variant in select value from pg_catalog.jsonb_array_elements(p_variants) loop
    if pg_catalog.jsonb_typeof(v_variant) <> 'object'
       or pg_catalog.jsonb_typeof(v_variant->'sku') <> 'string'
       or pg_catalog.jsonb_typeof(v_variant->'options') <> 'array'
       or coalesce(v_variant->>'status', 'active') not in ('active', 'inactive', 'archived')
       or pg_catalog.jsonb_array_length(v_variant->'options') > 2 then
      raise exception 'INVALID_CATALOGUE_VARIANT' using errcode = '22023';
    end if;
    if nullif(v_variant->>'sale_price_override', '') is not null
       and (v_variant->>'sale_price_override')::numeric >
           coalesce(nullif(v_variant->>'price_override', '')::numeric, (p_product->>'default_price')::numeric) then
      raise exception 'INVALID_CATALOGUE_VARIANT_PRICE' using errcode = '22023';
    end if;
    v_variant_id := nullif(v_variant->>'id', '')::uuid;
    if v_variant_id is not null and not exists (
      select 1 from public.product_variants
       where id = v_variant_id and product_id = v_product_id and deleted_at is null
    ) then
      raise exception 'PRODUCT_VARIANT_NOT_FOUND' using errcode = 'P0002';
    end if;

    if v_variant_id is null then
      insert into public.product_variants (
        product_id, sku, option_signature, price_override, sale_price_override,
        status, sort_order
      ) values (
        v_product_id, pg_catalog.btrim(v_variant->>'sku'), '__pending__' || pg_catalog.gen_random_uuid()::text,
        nullif(v_variant->>'price_override', '')::numeric,
        nullif(v_variant->>'sale_price_override', '')::numeric,
        coalesce(v_variant->>'status', 'active'),
        coalesce(nullif(v_variant->>'sort_order', '')::integer, 0)
      ) returning id into v_variant_id;
    else
      update public.product_variants
         set sku = pg_catalog.btrim(v_variant->>'sku'),
             price_override = nullif(v_variant->>'price_override', '')::numeric,
             sale_price_override = nullif(v_variant->>'sale_price_override', '')::numeric,
             status = coalesce(v_variant->>'status', 'active'),
             sort_order = coalesce(nullif(v_variant->>'sort_order', '')::integer, 0),
             updated_at = pg_catalog.now()
       where id = v_variant_id;
    end if;

    v_option_count := 0;
    for v_option in select value from pg_catalog.jsonb_array_elements(v_variant->'options') loop
      if pg_catalog.jsonb_typeof(v_option) <> 'object'
         or v_option->>'code' not in ('size', 'colour')
         or pg_catalog.jsonb_typeof(v_option->'value') <> 'string'
         or pg_catalog.jsonb_typeof(v_option->'label') <> 'string' then
        raise exception 'INVALID_CATALOGUE_OPTION' using errcode = '22023';
      end if;
      if v_option->>'code' = 'colour'
         and nullif(v_option->>'swatch_hex', '') is not null
         and (v_option->>'swatch_hex') !~ '^#[0-9A-Fa-f]{6}$' then
        raise exception 'INVALID_CATALOGUE_OPTION' using errcode = '22023';
      end if;

      select id, attribute_type into v_attribute_id, v_attribute_type
        from public.attributes
       where code = v_option->>'code' and is_active;
      if not found or (v_option->>'code' = 'size' and v_attribute_type <> 'size')
         or (v_option->>'code' = 'colour' and v_attribute_type <> 'colour_swatch') then
        raise exception 'PRODUCT_ATTRIBUTE_CONFIGURATION_INVALID' using errcode = '22023';
      end if;
      insert into public.product_attributes (product_id, attribute_id, is_required, sort_order)
      values (v_product_id, v_attribute_id, true, case when v_option->>'code' = 'size' then 10 else 20 end)
      on conflict (product_id, attribute_id) do nothing;

      insert into public.attribute_values (attribute_id, value, label, swatch_hex)
      values (
        v_attribute_id,
        pg_catalog.lower(pg_catalog.regexp_replace(pg_catalog.btrim(v_option->>'value'), '[^a-zA-Z0-9]+', '-', 'g')),
        pg_catalog.btrim(v_option->>'label'),
        nullif(v_option->>'swatch_hex', '')
      )
      on conflict (attribute_id, value) do update
        set label = excluded.label,
            swatch_hex = excluded.swatch_hex,
            is_active = true,
            updated_at = pg_catalog.now()
      returning id into v_value_id;
      insert into public.product_variant_options (variant_id, product_id, attribute_id, attribute_value_id)
      values (v_variant_id, v_product_id, v_attribute_id, v_value_id);
      v_option_count := v_option_count + 1;
    end loop;

    if v_option_count > 0 then
      select pg_catalog.string_agg(option.attribute_id::text || ':' || option.attribute_value_id::text, '|' order by option.attribute_id)
        into v_signature
        from public.product_variant_options as option
       where option.variant_id = v_variant_id;
    else
      v_signature := 'default';
    end if;
    update public.product_variants
       set option_signature = v_signature, updated_at = pg_catalog.now()
     where id = v_variant_id;
  end loop;

  select pg_catalog.count(*)::integer into v_media_count
    from pg_catalog.jsonb_array_elements(p_media);
  if exists (
    select 1
      from pg_catalog.jsonb_array_elements(p_media) as item
     where pg_catalog.jsonb_typeof(item->'asset_id') <> 'string'
        or pg_catalog.jsonb_typeof(item->'alt_text') <> 'string'
        or pg_catalog.char_length(pg_catalog.btrim(item->>'alt_text')) not between 1 and 180
        or not exists (
          select 1 from public.media_assets as asset
           where asset.id = (item->>'asset_id')::uuid
             and asset.provider = 'cloudinary'
             and asset.storage_visibility = 'public'
             and asset.public_url is not null
        )
  ) then
    raise exception 'INVALID_PRODUCT_MEDIA' using errcode = '22023';
  end if;
  if v_media_count <> (
    select pg_catalog.count(distinct item->>'asset_id')::integer
      from pg_catalog.jsonb_array_elements(p_media) as item
  ) then
    raise exception 'DUPLICATE_PRODUCT_MEDIA' using errcode = '22023';
  end if;
  if v_media_count > 0 and (
    select pg_catalog.count(*) from pg_catalog.jsonb_array_elements(p_media) as item
     where coalesce((item->>'is_primary')::boolean, false)
  ) > 1 then
    raise exception 'MULTIPLE_PRIMARY_PRODUCT_MEDIA' using errcode = '22023';
  end if;

  delete from public.product_media where product_id = v_product_id and variant_id is null;
  insert into public.product_media (product_id, media_asset_id, media_role, sort_order, is_primary, alt_text)
  select v_product_id,
         (item->>'asset_id')::uuid,
         case when coalesce((item->>'is_primary')::boolean, false)
                    or (position = 1 and not exists (
                      select 1 from pg_catalog.jsonb_array_elements(p_media) as primary_item
                       where coalesce((primary_item->>'is_primary')::boolean, false)
                    )) then 'primary' else 'gallery' end,
         coalesce(nullif(item->>'sort_order', '')::integer, (position - 1)::integer),
         coalesce((item->>'is_primary')::boolean, false)
           or (position = 1 and not exists (
             select 1 from pg_catalog.jsonb_array_elements(p_media) as primary_item
              where coalesce((primary_item->>'is_primary')::boolean, false)
           )),
         pg_catalog.btrim(item->>'alt_text')
    from pg_catalog.jsonb_array_elements(p_media) with ordinality as media(item, position);

  if v_product_status = 'published' and (
    not exists (
      select 1 from public.product_variants
       where product_id = v_product_id and status = 'active' and deleted_at is null
    )
    or v_media_count = 0
  ) then
    raise exception 'PUBLISHED_PRODUCT_REQUIRES_VARIANT_AND_MEDIA' using errcode = '22023';
  end if;

  insert into public.audit_logs (
    actor_user_id, actor_type, action, entity_type, entity_id, before_data, after_data
  ) values (
    auth.uid(),
    'staff',
    case when v_product_before is null then 'catalog.product_created' else 'catalog.product_updated' end,
    'product',
    v_product_id,
    case when v_product_before is null then null else pg_catalog.jsonb_build_object(
      'slug', v_product_before->>'slug',
      'status', v_product_before->>'status',
      'default_price', v_product_before->>'default_price'
    ) end,
    pg_catalog.jsonb_build_object(
      'slug', p_product->>'slug',
      'status', v_product_status,
      'default_price', p_product->>'default_price',
      'variant_count', pg_catalog.jsonb_array_length(p_variants),
      'media_count', v_media_count
    )
  );
  return v_product_id;
end;
$$;

revoke all on function public.save_catalog_product(jsonb, uuid[], jsonb, jsonb) from public, anon;
grant execute on function public.save_catalog_product(jsonb, uuid[], jsonb, jsonb) to authenticated;

