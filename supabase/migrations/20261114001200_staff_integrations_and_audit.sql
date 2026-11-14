-- 0012: staff RBAC, append-only audit ledger and integration event coordination.

create table public.staff_profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null,
  staff_status text not null default 'invited' check (staff_status in ('invited','active','suspended','disabled')),
  mfa_enforced boolean not null default true,
  last_active_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  name text not null,
  description text,
  is_system_role boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  module text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table public.staff_role_assignments (
  id uuid primary key default gen_random_uuid(),
  staff_user_id uuid not null references public.staff_profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null
);
create unique index staff_role_assignments_active_uidx
  on public.staff_role_assignments(staff_user_id, role_id) where revoked_at is null;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('customer','staff','owner','system','provider','guest')),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  reason text,
  request_id text,
  ip_hash text,
  user_agent_summary text,
  created_at timestamptz not null default now()
);

create table public.integration_providers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  provider_type text not null check (provider_type in ('payment','messaging','email','courier','storage','analytics','sms')),
  display_name text not null,
  status text not null default 'not_configured' check (status in ('not_configured','test','active','disabled')),
  public_configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.integration_providers(id) on delete restrict,
  provider_event_id text not null,
  event_type text not null,
  signature_verified boolean not null default false,
  payload_sanitized jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received','verified','processing','processed','retryable_failed','permanently_failed','rejected')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error_safe text,
  request_id text,
  created_at timestamptz not null default now(),
  unique (provider_id, provider_event_id)
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending','processing','sent','retryable_failed','permanently_failed','cancelled')),
  available_at timestamptz not null default now(),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error_safe text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.couriers
  add constraint couriers_integration_provider_fk
  foreign key (integration_provider_id) references public.integration_providers(id) on delete set null;

alter table public.payment_status_history
  add constraint payment_status_history_provider_event_fk
  foreign key (provider_event_id) references public.webhook_events(id) on delete set null;
