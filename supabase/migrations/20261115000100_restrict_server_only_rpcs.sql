-- 0017: explicitly restrict server-only RPC execution privileges.
-- Supabase projects may have default function EXECUTE grants to API roles;
-- revoking from PUBLIC alone does not remove direct grants to anon/authenticated.

-- Internal security-definer helpers: callable only by their owning functions.
revoke all privileges on function private.commit_reservation(uuid, uuid, text)
  from public, anon, authenticated;
revoke all privileges on function private.release_reservation(uuid, text, text, uuid)
  from public, anon, authenticated;
revoke all privileges on function private.handle_new_auth_user()
  from public, anon, authenticated;

-- Server-only operations. Next.js server code must authenticate/authorize the
-- request and call these with the server-side service-role client. Never expose
-- the service-role key to browser code.
revoke all privileges on function public.expire_due_reservations(integer)
  from public, anon, authenticated;
revoke all privileges on function public.commit_stock_reservation(uuid)
  from public, anon, authenticated;
revoke all privileges on function public.release_stock_reservation(uuid, text)
  from public, anon, authenticated;
revoke all privileges on function public.create_checkout_order(
  jsonb, uuid, text, text, text, jsonb, jsonb, uuid, jsonb, numeric,
  text, uuid, uuid, text, timestamptz, text
) from public, anon, authenticated;
revoke all privileges on function public.submit_manual_esewa_payment(
  uuid, text, uuid, timestamptz, uuid, boolean
) from public, anon, authenticated;

-- Grant these operations only to service_role. Their functions also verify
-- auth.role() = 'service_role' as defense in depth.
grant execute on function public.expire_due_reservations(integer) to service_role;
grant execute on function public.commit_stock_reservation(uuid) to service_role;
grant execute on function public.release_stock_reservation(uuid, text) to service_role;
grant execute on function public.create_checkout_order(
  jsonb, uuid, text, text, text, jsonb, jsonb, uuid, jsonb, numeric,
  text, uuid, uuid, text, timestamptz, text
) to service_role;
grant execute on function public.submit_manual_esewa_payment(
  uuid, text, uuid, timestamptz, uuid, boolean
) to service_role;

-- Staff-facing RPCs: remove PUBLIC/anon access, then grant authenticated access.
-- The functions enforce their own granular staff permissions and MFA checks.
revoke all privileges on function public.transition_order(uuid, text, text, text)
  from public, anon, authenticated;
revoke all privileges on function public.decide_manual_payment(uuid, text, text)
  from public, anon, authenticated;
revoke all privileges on function public.record_cod_collection(uuid, numeric, text)
  from public, anon, authenticated;
revoke all privileges on function public.post_inventory_adjustment(uuid, uuid, integer, text, text)
  from public, anon, authenticated;

grant execute on function public.transition_order(uuid, text, text, text) to authenticated;
grant execute on function public.decide_manual_payment(uuid, text, text) to authenticated;
grant execute on function public.record_cod_collection(uuid, numeric, text) to authenticated;
grant execute on function public.post_inventory_adjustment(uuid, uuid, integer, text, text) to authenticated;

-- Defensive assertions: fail this migration if the critical privilege boundary
-- is not established as intended.
do $$
begin
  if has_function_privilege(
    'anon',
    'public.submit_manual_esewa_payment(uuid,text,uuid,timestamp with time zone,uuid,boolean)',
    'execute'
  ) then
    raise exception 'ANON_MUST_NOT_EXECUTE_MANUAL_ESEWA_SUBMISSION_RPC';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.submit_manual_esewa_payment(uuid,text,uuid,timestamp with time zone,uuid,boolean)',
    'execute'
  ) then
    raise exception 'AUTHENTICATED_MUST_NOT_EXECUTE_MANUAL_ESEWA_SUBMISSION_RPC';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.submit_manual_esewa_payment(uuid,text,uuid,timestamp with time zone,uuid,boolean)',
    'execute'
  ) then
    raise exception 'SERVICE_ROLE_MUST_EXECUTE_MANUAL_ESEWA_SUBMISSION_RPC';
  end if;
end;
$$;
