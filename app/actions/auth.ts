"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { callbackUrl, safeCustomerDestination } from "@/lib/auth/redirects";
import { getAuthorizationContext } from "@/lib/auth/authorization";
import { guestCartSchema, guestWishlistSchema, loginSchema, recoverySchema, registerSchema, resetPasswordSchema, totpCodeSchema } from "@/lib/validations/auth";
import type { GuestCartItem } from "@/stores/cart-store";
import type { GuestWishlistItem } from "@/stores/wishlist-store";

const RECOVERY_COOKIE = "npw-recovery-session";
type ActionResult = { ok: boolean; message: string };

export async function customerLogin(input: unknown, next?: unknown): Promise<ActionResult & { destination?: string }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Enter a valid email and password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: "We couldn’t sign you in. Check your details or verify your email." };
  return { ok: true, message: "Signed in.", destination: safeCustomerDestination(next) };
}

export async function customerRegister(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the form fields and accept the terms to continue." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName }, emailRedirectTo: callbackUrl("verify") },
  });
  if (error) return { ok: false, message: "We couldn’t complete registration. Check your details and try again." };
  return { ok: true, message: "Check your inbox for a verification link." };
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = recoverySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: callbackUrl("reset-password") });
  return { ok: true, message: "If an account matches that email, a reset link is on its way." };
}

export async function updateRecoveredPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Use a password with at least 8 characters." };
  const jar = await cookies();
  if (!jar.get(RECOVERY_COOKIE)?.value) return { ok: false, message: "This recovery link is invalid or has expired. Request a new one." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, message: "This recovery link is invalid or has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: "We couldn’t update your password. The recovery link may have expired." };
  await supabase.auth.signOut({ scope: "local" });
  jar.delete(RECOVERY_COOKIE);
  return { ok: true, message: "Password updated. You can now sign in." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  const jar = await cookies();
  jar.delete(RECOVERY_COOKIE);
  redirect("/");
}

export async function adminLogin(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Enter a valid email and password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: "Sign-in failed. Check your credentials or contact your administrator." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Staff access could not be verified." };
  const [{ data: profile }, { data: assignments }, { data: factors }, { data: assurance }] = await Promise.all([
    supabase.from("staff_profiles").select("staff_status,mfa_enforced").eq("id", user.id).maybeSingle(),
    supabase.from("staff_role_assignments").select("id").eq("staff_user_id", user.id).is("revoked_at", null),
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (!profile || profile.staff_status !== "active" || !profile.mfa_enforced || !assignments?.length) {
    await supabase.auth.signOut({ scope: "local" });
    return { ok: false, message: "This account is not eligible for staff access." };
  }
  if (assurance?.currentLevel === "aal2") {
    const context = await getAuthorizationContext();
    if (context && "roleCodes" in context && context.roleCodes.length && context.permissions.length) return { ok: true, message: "Staff identity verified." };
  }
  return { ok: true, message: factors?.totp?.some((factor) => factor.status === "verified") ? "Complete authenticator verification." : "Set up an authenticator to continue." };
}

async function eligibleStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: profile }, { data: assignments }] = await Promise.all([
    supabase.from("staff_profiles").select("staff_status,mfa_enforced").eq("id", user.id).maybeSingle(),
    supabase.from("staff_role_assignments").select("id").eq("staff_user_id", user.id).is("revoked_at", null),
  ]);
  return profile?.staff_status === "active" && profile.mfa_enforced && assignments?.length ? { supabase, user } : null;
}

export type MfaSetup = { ok: true; factorId: string; challengeId: string; qrCode?: string; secret?: string; enrolled: boolean } | { ok: false; message: string };
export async function beginAdminMfa(): Promise<MfaSetup> {
  const eligible = await eligibleStaff();
  if (!eligible) return { ok: false, message: "Staff access could not be verified. Sign in again." };
  const { supabase } = eligible;
  const context = await getAuthorizationContext();
  if (context && "roleCodes" in context && context.roleCodes.length && context.permissions.length) return { ok: false, message: "Verification is already complete." };
  const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
  if (factorError) return { ok: false, message: "Could not load authenticator status. Try again." };
  let factorId = factors.totp.find((factor) => factor.status === "verified")?.id;
  let qrCode: string | undefined;
  let secret: string | undefined;
  if (!factorId) {
    for (const factor of factors.totp.filter((item) => item.status !== "verified")) await supabase.auth.mfa.unenroll({ factorId: factor.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "NP Wardrobe staff authenticator" });
    if (error || !data) return { ok: false, message: "Could not start authenticator setup. Try again." };
    factorId = data.id;
    qrCode = data.totp.qr_code;
    secret = data.totp.secret;
  }
  const { data: challenge, error } = await supabase.auth.mfa.challenge({ factorId });
  if (error || !challenge) return { ok: false, message: "Could not start verification. Try again." };
  return { ok: true, factorId, challengeId: challenge.id, qrCode, secret, enrolled: !qrCode };
}

export async function verifyAdminMfa(input: unknown): Promise<ActionResult> {
  if (!input || typeof input !== "object") return { ok: false, message: "Enter the six-digit authenticator code." };
  const record = input as Record<string, unknown>;
  const code = totpCodeSchema.safeParse(record.code);
  const factorId = typeof record.factorId === "string" && /^[0-9a-f-]{36}$/i.test(record.factorId) ? record.factorId : "";
  const challengeId = typeof record.challengeId === "string" && /^[0-9a-f-]{36}$/i.test(record.challengeId) ? record.challengeId : "";
  if (!code.success || !factorId || !challengeId) return { ok: false, message: "Enter a valid six-digit authenticator code." };
  const eligible = await eligibleStaff();
  if (!eligible) return { ok: false, message: "Staff access could not be verified." };
  const { data: factors } = await eligible.supabase.auth.mfa.listFactors();
  if (!factors?.totp.some((factor) => factor.id === factorId)) return { ok: false, message: "Authenticator verification expired. Start again." };
  const { error } = await eligible.supabase.auth.mfa.verify({ factorId, challengeId, code: code.data });
  if (error) return { ok: false, message: "That code could not be verified. Check your authenticator and try again." };
  const { data: assurance } = await eligible.supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const context = await getAuthorizationContext();
  if (assurance?.currentLevel !== "aal2" || !context || !("roleCodes" in context) || !context.roleCodes.length || !context.permissions.length) {
    await eligible.supabase.auth.signOut({ scope: "local" });
    return { ok: false, message: "Staff authorization could not be confirmed." };
  }
  return { ok: true, message: "Authenticator verified." };
}

export type SyncResult = { status: "synchronized" | "partially_synchronized" | "failed"; message: string; cartItems?: GuestCartItem[]; wishlistItems?: GuestWishlistItem[] };
export async function syncCustomerState(cart: GuestCartItem[], wishlist: GuestWishlistItem[]): Promise<SyncResult> {
  const cartParsed = guestCartSchema.safeParse(cart);
  const wishlistParsed = guestWishlistSchema.safeParse(wishlist);
  if (!cartParsed.success || !wishlistParsed.success) return { status: "failed", message: "Saved shopping data could not be validated." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "failed", message: "Sign in again before syncing saved items." };
  let hasFailure = false;
  const variants = cartParsed.data.map((item) => item.variantId);
  const variantRows = variants.length ? await supabase.from("product_variants").select("id,product_id").in("id", variants).eq("status", "active").is("deleted_at", null) : { data: [], error: null };
  if (variantRows.error) hasFailure = true;
  const activeVariants = new Map((variantRows.data ?? []).map((row) => [row.id, row.product_id]));
  if (cartParsed.data.some((item) => !activeVariants.has(item.variantId))) hasFailure = true;
  const cloudCartResult = await supabase.from("carts").select("id").eq("customer_id", user.id).eq("status", "active").maybeSingle();
  if (cloudCartResult.error) hasFailure = true;
  let cartId = cloudCartResult.data?.id;
  if (!cartId && cartParsed.data.length && !cloudCartResult.error) {
    const created = await supabase.from("carts").insert({ customer_id: user.id, status: "active" }).select("id").single();
    if (!created.error) cartId = created.data.id;
    else {
      const retryRead = await supabase.from("carts").select("id").eq("customer_id", user.id).eq("status", "active").maybeSingle();
      if (retryRead.error || !retryRead.data) hasFailure = true;
      else cartId = retryRead.data.id;
    }
  }
  if (cartId) {
    const existing = await supabase.from("cart_items").select("id,variant_id,quantity").eq("cart_id", cartId);
    if (existing.error) hasFailure = true;
    else for (const item of cartParsed.data) {
      const productId = activeVariants.get(item.variantId);
      if (!productId) continue;
      const found = existing.data.find((line) => line.variant_id === item.variantId);
      if (found) {
        if (found.quantity < item.quantity) {
          const changed = await supabase.from("cart_items").update({ quantity: item.quantity }).eq("id", found.id).lt("quantity", item.quantity);
          if (changed.error) hasFailure = true;
        }
      } else {
        const inserted = await supabase.from("cart_items").insert({ cart_id: cartId, product_id: productId, variant_id: item.variantId, quantity: item.quantity });
        if (inserted.error) {
          const recheck = await supabase.from("cart_items").select("id,quantity").eq("cart_id", cartId).eq("variant_id", item.variantId).maybeSingle();
          if (recheck.error || !recheck.data) hasFailure = true;
          else if (recheck.data.quantity < item.quantity) {
            const changed = await supabase.from("cart_items").update({ quantity: item.quantity }).eq("id", recheck.data.id).lt("quantity", item.quantity);
            if (changed.error) hasFailure = true;
          }
        }
      }
    }
  } else if (cartParsed.data.length) hasFailure = true;

  let wishlistId: string | undefined;
  const existingWishlist = await supabase.from("wishlists").select("id").eq("customer_id", user.id).maybeSingle();
  if (existingWishlist.error) hasFailure = true;
  wishlistId = existingWishlist.data?.id;
  if (!wishlistId && wishlistParsed.data.length && !existingWishlist.error) {
    const created = await supabase.from("wishlists").insert({ customer_id: user.id }).select("id").single();
    if (!created.error) wishlistId = created.data.id;
    else {
      const retry = await supabase.from("wishlists").select("id").eq("customer_id", user.id).maybeSingle();
      if (retry.error || !retry.data) hasFailure = true;
      else wishlistId = retry.data.id;
    }
  }
  if (wishlistId) {
    const products = [...new Set(wishlistParsed.data.map((item) => item.productId))];
    const validProducts = products.length ? await supabase.from("products").select("id").in("id", products).eq("status", "published").is("deleted_at", null) : { data: [], error: null };
    if (validProducts.error) hasFailure = true;
    const productSet = new Set((validProducts.data ?? []).map((row) => row.id));
    if (productSet.size !== products.length) hasFailure = true;
    const optionalVariants = wishlistParsed.data.flatMap((item) => item.variantId ? [item.variantId] : []);
    const validWishlistVariants = optionalVariants.length ? await supabase.from("product_variants").select("id,product_id").in("id", optionalVariants).eq("status", "active").is("deleted_at", null) : { data: [], error: null };
    if (validWishlistVariants.error) hasFailure = true;
    const variantProduct = new Map((validWishlistVariants.data ?? []).map((row) => [row.id, row.product_id]));
    const lines = await supabase.from("wishlist_items").select("product_id,variant_id").eq("wishlist_id", wishlistId);
    if (lines.error) hasFailure = true;
    else for (const item of wishlistParsed.data) {
      if (!productSet.has(item.productId)) continue;
      if (item.variantId && variantProduct.get(item.variantId) !== item.productId) { hasFailure = true; continue; }
      if (lines.data.some((line) => line.product_id === item.productId && line.variant_id === item.variantId)) continue;
      const inserted = await supabase.from("wishlist_items").insert({ wishlist_id: wishlistId, product_id: item.productId, variant_id: item.variantId });
      if (inserted.error) {
        const retryQuery = supabase.from("wishlist_items").select("id").eq("wishlist_id", wishlistId).eq("product_id", item.productId);
        const retry = await (item.variantId ? retryQuery.eq("variant_id", item.variantId) : retryQuery.is("variant_id", null)).maybeSingle();
        if (retry.error || !retry.data) hasFailure = true;
      }
    }
  } else if (wishlistParsed.data.length) hasFailure = true;
  if (hasFailure) return { status: cartId || wishlistId ? "partially_synchronized" : "failed", message: "Some saved items could not be synced. Your guest items are preserved; retry to continue." };
  const [mergedCart, mergedWishlist] = await Promise.all([
    cartId ? supabase.from("cart_items").select("variant_id,quantity").eq("cart_id", cartId) : Promise.resolve({ data: [], error: null }),
    wishlistId ? supabase.from("wishlist_items").select("product_id,variant_id").eq("wishlist_id", wishlistId) : Promise.resolve({ data: [], error: null }),
  ]);
  if (mergedCart.error || mergedWishlist.error) return { status: "partially_synchronized", message: "Items were saved, but the merged list could not be reloaded. Your guest items are preserved; retry to continue." };
  return {
    status: "synchronized",
    message: "Your saved items are synced to your account.",
    cartItems: (mergedCart.data ?? []).map((item) => ({ variantId: item.variant_id, quantity: item.quantity })),
    wishlistItems: (mergedWishlist.data ?? []).map((item) => ({ productId: item.product_id, variantId: item.variant_id })),
  };
}
