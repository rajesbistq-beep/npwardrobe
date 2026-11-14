-- 0002: Nepal geography reference hierarchy and media metadata.

create table public.provinces (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  name_en text not null,
  name_ne text,
  sort_order smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id)
);

create table public.districts (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references public.provinces(id) on delete restrict,
  code text not null unique check (code = lower(code)),
  name_en text not null,
  name_ne text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (province_id, name_en),
  unique (id, province_id)
);

create table public.municipalities (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts(id) on delete restrict,
  code text not null unique check (code = lower(code)),
  name_en text not null,
  name_ne text,
  municipality_type text not null check (municipality_type in ('metropolitan','sub_metropolitan','municipality','rural_municipality')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (district_id, name_en),
  unique (id, district_id)
);

create table public.wards (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete restrict,
  ward_number smallint not null check (ward_number > 0),
  name_en text,
  name_ne text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipality_id, ward_number),
  unique (id, municipality_id)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('cloudinary','supabase_storage')),
  storage_visibility text not null check (storage_visibility in ('public','private')),
  provider_asset_id text not null,
  public_url text,
  bucket_name text,
  object_path text,
  format text,
  mime_type text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  bytes bigint check (bytes is null or bytes >= 0),
  alt_text text,
  alt_text_ne text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_asset_id),
  check (
    (provider = 'cloudinary' and storage_visibility = 'public' and public_url is not null)
    or
    (provider = 'supabase_storage' and bucket_name is not null and object_path is not null)
  )
);

comment on table public.provinces is 'Seed only from a verified Nepal administrative reference source; no guessed geography.';
comment on table public.media_assets is 'Stores media metadata only. Private payment file bytes remain in private Supabase Storage.';
