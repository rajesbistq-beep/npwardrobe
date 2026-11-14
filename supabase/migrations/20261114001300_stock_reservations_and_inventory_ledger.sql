-- 0013: reservation lifecycle and append-only inventory movement ledger.

create table public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  status text not null check (status in ('active','committed','released','expired')),
  idempotency_key uuid not null unique,
  expires_at timestamptz not null,
  committed_at timestamptz,
  released_at timestamptz,
  expired_at timestamptz,
  release_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > created_at),
  check (
    (status = 'active' and committed_at is null and released_at is null and expired_at is null)
    or (status = 'committed' and committed_at is not null and released_at is null and expired_at is null)
    or (status = 'released' and released_at is not null and committed_at is null and expired_at is null)
    or (status = 'expired' and expired_at is not null and committed_at is null and released_at is null)
  )
);
create unique index stock_reservations_one_active_per_order_uidx
  on public.stock_reservations(order_id) where status = 'active';

alter table public.order_items add constraint order_items_id_variant_uidx unique (id, variant_id);

create table public.stock_reservation_items (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.stock_reservations(id) on delete restrict,
  order_item_id uuid not null,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  location_id uuid not null references public.inventory_locations(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  foreign key (order_item_id, variant_id) references public.order_items(id, variant_id) on delete restrict,
  unique (reservation_id, order_item_id, location_id),
  unique (id, variant_id, location_id)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_level_id uuid not null,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  location_id uuid not null references public.inventory_locations(id) on delete restrict,
  movement_type text not null check (movement_type in ('opening_balance','adjustment','reservation_created','reservation_released','reservation_committed','return_restock','damage_writeoff','transfer_in','transfer_out')),
  on_hand_delta integer not null default 0,
  reserved_delta integer not null default 0,
  reservation_item_id uuid references public.stock_reservation_items(id) on delete restrict,
  adjustment_item_id uuid references public.inventory_adjustment_items(id) on delete restrict,
  order_item_id uuid references public.order_items(id) on delete restrict,
  return_inspection_id uuid references public.return_inspections(id) on delete restrict,
  transfer_id uuid references public.inventory_transfers(id) on delete restrict,
  reason text,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (inventory_level_id, variant_id, location_id)
    references public.inventory_levels(id, variant_id, location_id) on delete restrict,
  check (on_hand_delta <> 0 or reserved_delta <> 0)
);

comment on column public.inventory_levels.on_hand_quantity is 'Current on-hand projection. Reserved is derived from active reservation items; never duplicate reserved_quantity here.';
comment on table public.inventory_movements is 'Append-only inventory ledger. Current levels must reconcile to movement history.';
