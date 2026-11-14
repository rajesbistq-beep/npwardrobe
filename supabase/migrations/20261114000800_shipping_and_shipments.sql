-- 0008: configurable delivery coverage/rates and shipment tracking.

create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  name text not null,
  description text,
  is_active boolean not null default true,
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipping_zone_provinces (
  shipping_zone_id uuid not null references public.shipping_zones(id) on delete cascade,
  province_id uuid not null references public.provinces(id) on delete restrict,
  primary key (shipping_zone_id, province_id)
);
create table public.shipping_zone_districts (
  shipping_zone_id uuid not null references public.shipping_zones(id) on delete cascade,
  district_id uuid not null references public.districts(id) on delete restrict,
  primary key (shipping_zone_id, district_id)
);
create table public.shipping_zone_municipalities (
  shipping_zone_id uuid not null references public.shipping_zones(id) on delete cascade,
  municipality_id uuid not null references public.municipalities(id) on delete restrict,
  primary key (shipping_zone_id, municipality_id)
);

create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  shipping_zone_id uuid not null references public.shipping_zones(id) on delete restrict,
  rate_name text not null,
  fee numeric(12,2) not null check (fee >= 0),
  currency_code char(3) not null default 'NPR' check (currency_code = 'NPR'),
  minimum_order_total numeric(12,2) check (minimum_order_total is null or minimum_order_total >= 0),
  free_shipping_threshold numeric(12,2) check (free_shipping_threshold is null or free_shipping_threshold >= 0),
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_until is null or valid_from is null or valid_until > valid_from)
);

create table public.couriers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  name text not null,
  tracking_url_template text,
  contact_details jsonb not null default '{}'::jsonb,
  integration_provider_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  courier_id uuid references public.couriers(id) on delete set null,
  shipment_reference text unique,
  tracking_number text,
  status text not null default 'pending' check (status in ('pending','assigned','dispatched','in_transit','attempted','delivered','failed','returned','cancelled')),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  currency_code char(3) not null default 'NPR' check (currency_code = 'NPR'),
  dispatched_at timestamptz,
  delivered_at timestamptz,
  delivery_exception text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipment_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete restrict,
  order_item_id uuid not null references public.order_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (shipment_id, order_item_id)
);

create table public.shipment_tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete restrict,
  status text not null,
  description text,
  location_text text,
  source text not null check (source in ('staff','courier_api','system')),
  provider_event_id uuid,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.orders
  add constraint orders_shipping_zone_fk foreign key (shipping_zone_id)
  references public.shipping_zones(id) on delete set null;
