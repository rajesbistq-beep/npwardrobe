import "server-only";

import { createClient } from "@/lib/supabase/server";
import { AppError, throwDatabaseError } from "@/lib/errors/app-error";

function isMissingAuthSession(error: { status?: number; name?: string; code?: string }): boolean {
  return error.status === 401 ||
    error.name === "AuthSessionMissingError" ||
    (error.status === 403 && error.code === "session_not_found");
}

export type AuthorizationContext =
  | { kind: "customer"; userId: string }
  | { kind: "authenticated"; userId: string }
  | { kind: "mfa_required"; userId: string }
  | { kind: "staff"; userId: string; roleCodes: string[]; permissions: string[] }
  | { kind: "admin"; userId: string; roleCodes: string[]; permissions: string[] }
  | { kind: "owner"; userId: string; roleCodes: string[]; permissions: string[] };

/** Resolve identity from Supabase Auth. Never accept an actor ID from request data. */
export async function getAuthorizationContext(): Promise<AuthorizationContext | null> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    if (isMissingAuthSession(userError)) return null;
    throw new AppError("DATABASE_ERROR", "Sign-in status could not be verified.", 503);
  }
  if (!userData.user) return null;
  const userId = userData.user.id;

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError) {
    if (isMissingAuthSession(claimsError)) return null;
    throw new AppError("DATABASE_ERROR", "Sign-in status could not be verified.", 503);
  }
  if (!claimsData?.claims) return null;
  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("id, staff_status, mfa_enforced")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throwDatabaseError(profileError);
  if (!profile) return { kind: "customer", userId };
  if (profile.staff_status !== "active" || !profile.mfa_enforced) {
    return { kind: "authenticated", userId };
  }
  if (claimsData.claims.aal !== "aal2") return { kind: "mfa_required", userId };

  const { data: assignments, error: assignmentError } = await supabase
    .from("staff_role_assignments")
    .select("role_id")
    .eq("staff_user_id", userId)
    .is("revoked_at", null);
  if (assignmentError) throwDatabaseError(assignmentError);

  const roleIds = [...new Set((assignments ?? []).map(({ role_id }) => role_id))];
  if (roleIds.length === 0) {
    return { kind: "staff", userId, roleCodes: [], permissions: [] };
  }

  const [rolesResult, rolePermissionsResult] = await Promise.all([
    supabase.from("roles").select("id, code").in("id", roleIds),
    supabase.from("role_permissions").select("permission_id").in("role_id", roleIds),
  ]);
  if (rolesResult.error) throwDatabaseError(rolesResult.error);
  if (rolePermissionsResult.error) throwDatabaseError(rolePermissionsResult.error);

  const permissionIds = [...new Set((rolePermissionsResult.data ?? []).map(({ permission_id }) => permission_id))];
  const permissionResult = permissionIds.length
    ? await supabase.from("permissions").select("code").in("id", permissionIds)
    : { data: [], error: null };
  if (permissionResult.error) throwDatabaseError(permissionResult.error);

  const roleCodes = (rolesResult.data ?? []).map(({ code }) => code);
  const permissions = (permissionResult.data ?? []).map(({ code }) => code);
  const base = { userId, roleCodes, permissions };
  if (roleCodes.includes("owner")) return { kind: "owner", ...base };
  if (roleCodes.includes("administrator")) return { kind: "admin", ...base };
  return { kind: "staff", ...base };
}

export async function requireAuthenticatedUser() {
  const context = await getAuthorizationContext();
  if (!context) throw new AppError("UNAUTHENTICATED", "Sign in to continue.");
  return context;
}

export async function requirePermission(permission: string) {
  const context = await requireAuthenticatedUser();
  if (context.kind === "mfa_required") {
    throw new AppError("FORBIDDEN", "Complete the required multi-factor verification.");
  }
  if (!("permissions" in context) || !context.permissions.includes(permission)) {
    throw new AppError("FORBIDDEN", "You are not allowed to perform this action.");
  }
  return context;
}
