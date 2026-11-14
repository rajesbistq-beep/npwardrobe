-- 0010: promotion definitions, coupon codes and redemption records.

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  promotion_type text not null check (promotion_type in ('product_sale','category_sale','cart_discount','free_shipping','campaign')),
  discount_type text not null check (discount_type in ('fixed','percentage','free_shipping')),
  discount_value numeric(12,2) not null check (discount_value >= 0),
  minimum_order_total numeric(12,2) check (minimum_order_total is null or minimum_order_total >= 0),
  maximum_discount numeric(12,2) check (maximum_discount is null or maximum_discount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  per_customer_limit integer check (per_customer_limit is null or per_customer_limit > 0),
  stacking_rule text not null default 'exclusive' check (stacking_rule in ('exclusive','stackable')),
  priority integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','active','paused','expired','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.promotion_products (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (promotion_id, product_id)
);

create table public.promotion_categories (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (promotion_id, category_id)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete restrict,
  code text not null unique check (code = upper(code)),
  status text not null default 'draft' check (status in ('draft','active','paused','expired')),
  starts_at timestamptz,
  ends_at timestamptz,
  total_redemption_limit integer check (total_redemption_limit is null or total_redemption_limit > 0),
  per_customer_limit integer check (per_customer_limit is null or per_customer_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  customer_id uuid references public.profiles(id) on delete set null,
  guest_identity_hash text,
  discount_amount numeric(12,2) not null check (discount_amount >= 0),
  status text not null check (status in ('reserved','applied','reversed')),
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (coupon_id, order_id),
  check (customer_id is not null or guest_identity_hash is not null)
);

create table public.order_discounts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  promotion_id uuid references public.promotions(id) on delete set null,
  coupon_id uuid references public.coupons(id) on delete set null,
  code_snapshot text,
  name_snapshot text not null,
  discount_type text not null check (discount_type in ('fixed','percentage','free_shipping')),
  discount_value numeric(12,2) not null check (discount_value >= 0),
  applied_amount numeric(12,2) not null check (applied_amount >= 0),
  rule_snapshot jsonb not null,
  created_at timestamptz not null default now()
);
