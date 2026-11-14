-- 0006: durable orders, immutable line snapshots and state histories.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null,
  customer_id uuid references public.profiles(id) on delete restrict,
  guest_name text,
  guest_phone_e164 text,
  guest_email text,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending_verification','partially_paid','paid','rejected','failed','partially_refunded','refunded')),
  currency_code char(3) not null default 'NPR' check (currency_code = 'NPR'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount_total numeric(12,2) not null default 0 check (discount_total >= 0),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  tax_total numeric(12,2) not null default 0 check (tax_total >= 0),
  grand_total numeric(12,2) not null check (grand_total >= 0),
  delivery_address_snapshot jsonb not null,
  billing_address_snapshot jsonb,
  shipping_zone_id uuid,
  shipping_rule_snapshot jsonb,
  selected_payment_method_code text not null,
  cod_terms_snapshot jsonb,
  customer_note text,
  admin_note text,
  checkout_idempotency_key uuid not null unique,
  checkout_request_hash text not null,
  whatsapp_handoff_attempted_at timestamptz,
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount_total <= subtotal),
  check (grand_total = subtotal - discount_total + shipping_fee + tax_total),
  check (customer_id is not null or (guest_name is not null and guest_phone_e164 is not null))
);
create unique index orders_public_reference_lower_uidx on public.orders(lower(public_reference));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid,
  variant_id uuid,
  product_name_snapshot text not null,
  variant_name_snapshot text,
  sku_snapshot text not null,
  attributes_snapshot jsonb not null default '[]'::jsonb,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  unit_discount numeric(12,2) not null default 0 check (unit_discount >= 0 and unit_discount <= unit_price),
  quantity integer not null check (quantity > 0),
  line_subtotal numeric(12,2) not null check (line_subtotal >= 0),
  line_discount numeric(12,2) not null default 0 check (line_discount >= 0 and line_discount <= line_subtotal),
  line_total numeric(12,2) not null check (line_total >= 0),
  currency_code char(3) not null default 'NPR' check (currency_code = 'NPR'),
  created_at timestamptz not null default now(),
  foreign key (variant_id, product_id) references public.product_variants(id, product_id) on delete set null,
  check (line_subtotal = unit_price * quantity),
  check (line_total = line_subtotal - line_discount)
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  from_status text,
  to_status text not null check (to_status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  reason text,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('customer','staff','owner','system')),
  request_id text,
  created_at timestamptz not null default now()
);

create table public.order_payment_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  from_status text,
  to_status text not null check (to_status in ('unpaid','pending_verification','partially_paid','paid','rejected','failed','partially_refunded','refunded')),
  reason text,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('customer','staff','owner','system','provider')),
  request_id text,
  created_at timestamptz not null default now()
);

create table public.guest_order_access_challenges (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  phone_hash text not null,
  challenge_hash text not null,
  expires_at timestamptz not null,
  attempt_count smallint not null default 0 check (attempt_count >= 0),
  verified_at timestamptz,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
