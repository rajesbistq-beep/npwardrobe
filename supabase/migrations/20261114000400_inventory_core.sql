-- 0004: location-based stock projections, adjustments and transfers.

create table public.inventory_locations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  name text not null,
  location_type text not null check (location_type in ('warehouse','store','other')),
  address_text text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_levels (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  location_id uuid not null references public.inventory_locations(id) on delete restrict,
  on_hand_quantity integer not null default 0 check (on_hand_quantity >= 0),
  version bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (variant_id, location_id),
  unique (id, variant_id, location_id)
);

create table public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.inventory_locations(id) on delete restrict,
  adjustment_reference text not null unique,
  reason_code text not null,
  reason text not null,
  status text not null default 'draft' check (status in ('draft','posted','voided')),
  created_by uuid not null references auth.users(id) on delete restrict,
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_adjustment_items (
  id uuid primary key default gen_random_uuid(),
  adjustment_id uuid not null references public.inventory_adjustments(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity_delta integer not null check (quantity_delta <> 0),
  counted_quantity integer check (counted_quantity is null or counted_quantity >= 0),
  created_at timestamptz not null default now(),
  unique (adjustment_id, variant_id)
);

create table public.inventory_transfers (
  id uuid primary key default gen_random_uuid(),
  transfer_reference text not null unique,
  from_location_id uuid not null references public.inventory_locations(id) on delete restrict,
  to_location_id uuid not null references public.inventory_locations(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','posted','cancelled')),
  reason text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_location_id <> to_location_id)
);

create table public.inventory_transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.inventory_transfers(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (transfer_id, variant_id)
);
