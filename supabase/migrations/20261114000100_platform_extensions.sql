-- NP Wardrobe / Supabase PostgreSQL
-- 0001: platform prerequisites and private schema
-- Use normalized lower-case text keys instead of citext for portability.

create schema if not exists extensions;
create schema if not exists private;
revoke all on schema private from public;

create extension if not exists pgcrypto with schema extensions;

-- Supabase owns auth/storage schemas. This migration intentionally does not
-- create or alter their internal tables.

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;

comment on schema private is 'Internal NP Wardrobe helpers. Not exposed through the Supabase Data API.';
