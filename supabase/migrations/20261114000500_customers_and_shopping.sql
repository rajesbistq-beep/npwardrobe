-- 0005: Supabase Auth-linked profiles, Nepal addresses, account carts and wishlists.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text,
  email text,
  phone_e164 text,
  phone_verified_at timestamptz,
  avatar_media_id uuid references public.media_assets(id) on delete set null,
  preferred_locale text not null default 'en' check (preferred_locale in ('en','ne')),
  account_status text not null default 'active' check (account_status in ('active','deactivated','restricted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  recipient_name text not null,
  recipient_phone_e164 text not null,
  province_id uuid not null references public.provinces(id) on delete restrict,
  district_id uuid not null,
  municipality_id uuid not null,
  ward_id uuid not null,
  street_address text not null,
  house_number text,
  landmark text,
  delivery_instructions text,
  label text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (district_id, province_id) references public.districts(id, province_id) on delete restrict,
  foreign key (municipality_id, district_id) references public.municipalities(id, district_id) on delete restrict,
  foreign key (ward_id, municipality_id) references public.wards(id, municipality_id) on delete restrict
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','converted','abandoned')),
  currency_code char(3) not null default 'NPR' check (currency_code = 'NPR'),
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  created_at timestamptz not null default now()
);
create unique index wishlist_items_product_uidx on public.wishlist_items(wishlist_id, product_id) where variant_id is null;
create unique index wishlist_items_variant_uidx on public.wishlist_items(wishlist_id, variant_id) where variant_id is not null;
