-- 0011: CMS, public content, customer activity and notification records.

create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug)),
  page_type text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  canonical_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cms_page_translations (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  locale text not null check (locale in ('en','ne')),
  title text not null,
  summary text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  unique (page_id, locale)
);

create table public.cms_page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  section_key text not null,
  section_type text not null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  placement text not null,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  target_url text,
  status text not null default 'draft' check (status in ('draft','scheduled','active','paused','expired')),
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.banner_translations (
  id uuid primary key default gen_random_uuid(),
  banner_id uuid not null references public.banners(id) on delete cascade,
  locale text not null check (locale in ('en','ne')),
  headline text,
  subheadline text,
  alt_text text,
  cta_label text,
  created_at timestamptz not null default now(),
  unique (banner_id, locale)
);

create table public.faq_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faq_entries (
  id uuid primary key default gen_random_uuid(),
  faq_category_id uuid references public.faq_categories(id) on delete set null,
  faq_key text not null unique check (faq_key = lower(faq_key)),
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faq_translations (
  id uuid primary key default gen_random_uuid(),
  faq_entry_id uuid not null references public.faq_entries(id) on delete cascade,
  locale text not null check (locale in ('en','ne')),
  question text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  unique (faq_entry_id, locale)
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique check (setting_key = lower(setting_key)),
  setting_value jsonb not null,
  is_public boolean not null default false,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  guest_session_hash text,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  event_data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  check ((customer_id is not null) <> (guest_session_hash is not null))
);

create table public.recently_viewed_products (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade,
  guest_session_hash text,
  product_id uuid not null references public.products(id) on delete cascade,
  last_viewed_at timestamptz not null,
  view_count integer not null default 1 check (view_count > 0),
  check ((customer_id is not null) <> (guest_session_hash is not null))
);
create unique index recently_viewed_customer_product_uidx on public.recently_viewed_products(customer_id, product_id) where customer_id is not null;
create unique index recently_viewed_guest_product_uidx on public.recently_viewed_products(guest_session_hash, product_id) where guest_session_hash is not null;

create table public.customer_search_history (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade,
  guest_session_hash text,
  query_text text not null,
  locale text check (locale is null or locale in ('en','ne')),
  searched_at timestamptz not null,
  created_at timestamptz not null default now(),
  check ((customer_id is not null) <> (guest_session_hash is not null))
);

create table public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  channel text not null check (channel in ('email','whatsapp','in_app')),
  event_type text not null,
  locale text not null check (locale in ('en','ne')),
  subject text,
  body_template text not null,
  provider_template_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code, channel, locale)
);

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  customer_id uuid references public.profiles(id) on delete set null,
  event_payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  notification_event_id uuid references public.notification_events(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  channel text not null check (channel in ('email','whatsapp','in_app')),
  template_id uuid references public.notification_templates(id) on delete set null,
  recipient_snapshot text,
  subject_snapshot text,
  body_snapshot text,
  status text not null default 'queued' check (status in ('queued','processing','sent','delivered','failed','cancelled','read')),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  provider_code text,
  provider_message_id text,
  status text not null check (status in ('queued','submitted','accepted','delivered','failed','bounced','undeliverable')),
  error_code text,
  error_message_safe text,
  attempted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (notification_id, attempt_number)
);

create table public.customer_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  channel text not null check (channel in ('email','whatsapp','in_app')),
  transactional_enabled boolean not null default true,
  marketing_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (customer_id, channel)
);
