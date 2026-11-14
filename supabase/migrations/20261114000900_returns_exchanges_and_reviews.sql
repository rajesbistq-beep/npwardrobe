-- 0009: cancellation/return/exchange workflows, inspections and verified reviews.

create table public.order_cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  requested_by_customer_id uuid references public.profiles(id) on delete set null,
  guest_contact_snapshot jsonb,
  reason_code text,
  reason text,
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','rejected','executed','withdrawn')),
  decision_by uuid references auth.users(id) on delete set null,
  decision_reason text,
  decided_at timestamptz,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index one_active_cancellation_request_per_order_uidx
  on public.order_cancellation_requests(order_id)
  where status in ('submitted','under_review','approved');

create table public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  customer_id uuid references public.profiles(id) on delete set null,
  request_type text not null check (request_type in ('return','exchange')),
  guest_contact_snapshot jsonb,
  reason_code text not null,
  reason text,
  customer_notes text,
  status text not null default 'submitted' check (status in ('submitted','under_review','information_requested','approved','rejected','pickup_scheduled','received','inspecting','refund_processing','exchange_processing','completed','withdrawn')),
  decision_by uuid references auth.users(id) on delete set null,
  decision_reason text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.return_request_items (
  id uuid primary key default gen_random_uuid(),
  return_request_id uuid not null references public.return_requests(id) on delete restrict,
  order_item_id uuid not null references public.order_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  requested_resolution text not null check (requested_resolution in ('refund','exchange','store_decision')),
  reason text,
  created_at timestamptz not null default now()
);

create table public.exchange_items (
  id uuid primary key default gen_random_uuid(),
  return_request_item_id uuid not null references public.return_request_items(id) on delete restrict,
  requested_variant_id uuid references public.product_variants(id) on delete restrict,
  approved_variant_id uuid references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price_difference numeric(12,2) not null default 0,
  status text not null default 'requested' check (status in ('requested','approved','rejected','fulfilled','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.return_shipments (
  id uuid primary key default gen_random_uuid(),
  return_request_id uuid not null references public.return_requests(id) on delete restrict,
  courier_id uuid references public.couriers(id) on delete set null,
  tracking_number text,
  status text not null default 'pending' check (status in ('pending','scheduled','picked_up','in_transit','received','failed','cancelled')),
  scheduled_at timestamptz,
  received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.return_inspections (
  id uuid primary key default gen_random_uuid(),
  return_request_item_id uuid not null references public.return_request_items(id) on delete restrict,
  inspected_by uuid not null references auth.users(id) on delete restrict,
  condition text not null check (condition in ('uninspected','new','good','damaged','used','incomplete','other')),
  inspection_notes text,
  restock_decision text not null check (restock_decision in ('restock','do_not_restock','quarantine')),
  restock_location_id uuid references public.inventory_locations(id) on delete restrict,
  restocked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (return_request_item_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  order_item_id uuid not null references public.order_items(id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  verified_purchase boolean not null default true,
  status text not null default 'pending' check (status in ('pending','approved','rejected','hidden')),
  moderated_by uuid references auth.users(id) on delete set null,
  moderated_at timestamptz,
  moderation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, order_item_id)
);

create table public.review_media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.review_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  is_helpful boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (review_id, customer_id)
);

create table public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reported_by uuid references public.profiles(id) on delete set null,
  reason_code text not null,
  details text,
  status text not null default 'open' check (status in ('open','reviewed','dismissed','actioned')),
  handled_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.refunds
  add constraint refunds_return_request_fk foreign key (return_request_id)
  references public.return_requests(id) on delete set null;

alter table public.inventory_transfers
  add constraint inventory_transfer_from_to_different check (from_location_id <> to_location_id);
