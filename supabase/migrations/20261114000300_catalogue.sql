-- 0003: categories, collections, products, attributes, variants and catalogue media links.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete restrict,
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  description text,
  image_asset_id uuid references public.media_assets(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (parent_id is null or parent_id <> id)
);

create table public.category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  locale text not null check (locale in ('en','ne')),
  name text not null,
  description text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  unique (category_id, locale)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  description text,
  collection_type text not null check (collection_type in ('editorial','campaign','system','seasonal')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  hero_media_id uuid references public.media_assets(id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.collection_translations (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  locale text not null check (locale in ('en','ne')),
  name text not null,
  description text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  unique (collection_id, locale)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  short_description text,
  description text,
  material text,
  care_instructions text,
  fit_notes text,
  product_type text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  currency_code char(3) not null default 'NPR' check (currency_code = 'NPR'),
  default_price numeric(12,2) not null check (default_price >= 0),
  sale_price numeric(12,2) check (sale_price is null or (sale_price >= 0 and sale_price <= default_price)),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  canonical_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (sale_ends_at is null or sale_starts_at is null or sale_ends_at > sale_starts_at)
);

create table public.product_translations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null check (locale in ('en','ne')),
  name text not null,
  short_description text,
  description text,
  material text,
  care_instructions text,
  fit_notes text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  unique (product_id, locale)
);

create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create table public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create table public.related_products (
  product_id uuid not null references public.products(id) on delete cascade,
  related_product_id uuid not null references public.products(id) on delete cascade,
  relation_type text not null default 'related' check (relation_type in ('related','complete_the_look','similar')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, related_product_id, relation_type),
  check (product_id <> related_product_id)
);

create table public.attributes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  name text not null,
  attribute_type text not null check (attribute_type in ('text','select','colour_swatch','size')),
  is_variant_defining boolean not null default true,
  is_filterable boolean not null default true,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attribute_values (
  id uuid primary key default gen_random_uuid(),
  attribute_id uuid not null references public.attributes(id) on delete restrict,
  value text not null,
  label text not null,
  label_ne text,
  swatch_hex char(7) check (swatch_hex is null or swatch_hex ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attribute_id, value),
  unique (attribute_id, id)
);

create table public.product_attributes (
  product_id uuid not null references public.products(id) on delete cascade,
  attribute_id uuid not null references public.attributes(id) on delete restrict,
  is_required boolean not null default false,
  sort_order integer not null default 0,
  primary key (product_id, attribute_id)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  sku text not null,
  barcode text unique,
  option_signature text not null,
  price_override numeric(12,2) check (price_override is null or price_override >= 0),
  sale_price_override numeric(12,2) check (sale_price_override is null or (sale_price_override >= 0 and (price_override is null or sale_price_override <= price_override))),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  status text not null default 'active' check (status in ('active','inactive','archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (product_id, option_signature),
  unique (id, product_id),
  check (sale_ends_at is null or sale_starts_at is null or sale_ends_at > sale_starts_at)
);
create unique index product_variants_sku_lower_uidx on public.product_variants (lower(sku));

create table public.product_variant_options (
  variant_id uuid not null,
  product_id uuid not null,
  attribute_id uuid not null,
  attribute_value_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (variant_id, attribute_id),
  unique (variant_id, attribute_value_id),
  foreign key (variant_id, product_id) references public.product_variants(id, product_id) on delete cascade,
  foreign key (product_id, attribute_id) references public.product_attributes(product_id, attribute_id) on delete cascade,
  foreign key (attribute_id, attribute_value_id) references public.attribute_values(attribute_id, id) on delete restrict
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  media_role text not null check (media_role in ('primary','gallery','detail','size_reference')),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (variant_id, product_id) references public.product_variants(id, product_id) on delete cascade
);

create table public.collection_media (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  media_role text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (collection_id, media_asset_id)
);

create table public.size_guides (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug = lower(slug)),
  description text,
  measurement_unit text not null default 'cm' check (measurement_unit in ('cm','in')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.size_guide_rows (
  id uuid primary key default gen_random_uuid(),
  size_guide_id uuid not null references public.size_guides(id) on delete cascade,
  size_label text not null,
  sort_order integer not null default 0,
  fit_note text,
  unique (size_guide_id, size_label)
);

create table public.size_guide_measurements (
  id uuid primary key default gen_random_uuid(),
  size_guide_row_id uuid not null references public.size_guide_rows(id) on delete cascade,
  measurement_code text not null,
  label text not null,
  value numeric(8,2) not null check (value >= 0),
  unit text not null check (unit in ('cm','in')),
  sort_order integer not null default 0,
  unique (size_guide_row_id, measurement_code)
);

create table public.product_size_guides (
  product_id uuid not null references public.products(id) on delete cascade,
  size_guide_id uuid not null references public.size_guides(id) on delete restrict,
  is_primary boolean not null default true,
  primary key (product_id, size_guide_id)
);

comment on column public.product_variants.option_signature is 'Server-generated canonical sorted attribute-value ID signature; never trust a browser-provided signature.';
