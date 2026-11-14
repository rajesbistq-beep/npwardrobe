-- 0007: payment methods, payment ledger, attempts, evidence and refund records.

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  display_name text not null,
  provider_code text,
  phase text not null check (phase in ('phase_1','phase_2')),
  is_enabled boolean not null default false,
  public_configuration jsonb not null default '{}'::jsonb,
  configuration jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.payment_methods.public_configuration is 'Public, display-safe payment instructions and QR asset references only; never store credentials here.';
comment on column public.payment_methods.configuration is 'Private server-only provider configuration. Never expose through the Supabase Data API.';

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_method_id uuid not null references public.payment_methods(id) on delete restrict,
  provider_code text,
  currency_code char(3) not null default 'NPR' check (currency_code = 'NPR'),
  amount numeric(12,2) not null check (amount > 0),
  status text not null check (status in ('unpaid','pending_verification','paid','rejected','failed','partially_refunded','refunded','cancelled')),
  provider_payment_reference text,
  customer_reference text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  rejection_reason text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  idempotency_key uuid not null unique,
  status text not null check (status in ('created','submitted','pending_verification','succeeded','failed','rejected','cancelled','timed_out')),
  request_reference text,
  request_hash text not null,
  response_reference text,
  error_code text,
  error_message_safe text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (payment_id, attempt_number)
);

create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  payment_attempt_id uuid references public.payment_attempts(id) on delete restrict,
  provider_code text not null,
  provider_transaction_id text,
  transaction_type text not null check (transaction_type in ('authorization','capture','verification','cod_collection','gateway_callback','reversal','refund')),
  amount numeric(12,2) not null check (amount >= 0),
  currency_code char(3) not null default 'NPR' check (currency_code = 'NPR'),
  status text not null check (status in ('received','verified','failed','reversed')),
  provider_occurred_at timestamptz,
  verified_at timestamptz,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index payment_transactions_provider_ref_uidx
  on public.payment_transactions(provider_code, provider_transaction_id)
  where provider_transaction_id is not null;

create table public.payment_evidence (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  payment_attempt_id uuid references public.payment_attempts(id) on delete set null,
  bucket_name text not null,
  object_path text not null unique,
  original_filename text,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0),
  checksum_sha256 text,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payment_status_history (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  from_status text,
  to_status text not null check (to_status in ('unpaid','pending_verification','paid','rejected','failed','partially_refunded','refunded','cancelled')),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('customer','staff','owner','system','provider')),
  reason text,
  provider_event_id uuid,
  created_at timestamptz not null default now()
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid not null references public.payments(id) on delete restrict,
  return_request_id uuid,
  amount numeric(12,2) not null check (amount > 0),
  currency_code char(3) not null default 'NPR' check (currency_code = 'NPR'),
  status text not null check (status in ('requested','approved','processing','succeeded','failed','rejected','cancelled')),
  reason text not null,
  provider_refund_reference text,
  requested_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  processed_by uuid references auth.users(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.refund_status_history (
  id uuid primary key default gen_random_uuid(),
  refund_id uuid not null references public.refunds(id) on delete restrict,
  from_status text,
  to_status text not null check (to_status in ('requested','approved','processing','succeeded','failed','rejected','cancelled')),
  actor_user_id uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.orders
  add constraint orders_selected_payment_method_fk
  foreign key (selected_payment_method_code) references public.payment_methods(code) on update cascade on delete restrict;
