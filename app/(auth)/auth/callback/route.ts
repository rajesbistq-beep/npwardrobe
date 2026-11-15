import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeCustomerDestination } from "@/lib/auth/redirects";

const RECOVERY_COOKIE = "npw-recovery-session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const recovery = url.searchParams.get("next") === "reset-password";
  const returnTo = recovery ? "/auth/reset-password" : safeCustomerDestination(url.searchParams.get("returnTo"));
  const base = new URL(recovery ? "/auth/reset-password" : "/auth/verify", request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    base.searchParams.set("state", url.searchParams.has("error") ? "invalid" : "missing");
    return NextResponse.redirect(base);
  }
  const supabase = await createClient();
  const flowId = url.searchParams.get("sb_flow_id");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
  if (error || !data.user) {
    base.searchParams.set("state", "expired");
    return NextResponse.redirect(base);
  }
  if (recovery) {
    if ((data as typeof data & { redirectType?: string | null }).redirectType !== "recovery") {
      base.searchParams.set("state", "invalid");
      return NextResponse.redirect(base);
    }
    const jar = await cookies();
    jar.set(RECOVERY_COOKIE, crypto.randomUUID(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/auth/reset-password", maxAge: 15 * 60 });
    return NextResponse.redirect(new URL(returnTo, request.url));
  }
  const destination = new URL(returnTo, request.url);
  destination.searchParams.set("state", "success");
  return NextResponse.redirect(destination);
}
