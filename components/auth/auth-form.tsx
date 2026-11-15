"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, recoverySchema, registerSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { adminLogin, customerLogin, customerRegister, requestPasswordReset, updateRecoveredPassword, syncCustomerState } from "@/app/actions/auth";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

type Mode = "login" | "register" | "forgot" | "reset" | "admin";
type Values = { email: string; password: string; fullName: string; termsAccepted: boolean };

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const schema = mode === "register" ? registerSchema : mode === "forgot" ? recoverySchema : mode === "reset" ? resetPasswordSchema : loginSchema;
  const form = useForm<Values>({ resolver: zodResolver(schema) as unknown as Resolver<Values>, defaultValues: { email: "", password: "", fullName: "", termsAccepted: false } });
  const label = mode === "admin" ? "Staff sign in" : mode === "register" ? "Create your account" : mode === "forgot" ? "Reset your password" : mode === "reset" ? "Choose a new password" : "Welcome back";

  async function submit(values: Values) {
    setBusy(true); setNotice("");
    try {
      if (mode === "register") {
        const result = await customerRegister(values);
        setNotice(result.message);
      } else if (mode === "forgot") {
        const result = await requestPasswordReset(values);
        setNotice(result.message);
      } else if (mode === "reset") {
        const result = await updateRecoveredPassword(values);
        setNotice(result.message);
        if (result.ok) router.replace("/auth/login?state=password-updated");
      } else if (mode === "admin") {
        const result = await adminLogin(values);
        if (!result.ok) { setNotice(result.message); return; }
        router.replace(result.message === "Staff identity verified." ? "/admin" : "/admin/mfa");
      } else {
        const result = await customerLogin(values, params.get("next"));
        if (!result.ok) { setNotice(result.message); return; }
        const guestCart = useCartStore.getState().items;
        const guestWishlist = useWishlistStore.getState().items;
        if (guestCart.length || guestWishlist.length) {
          const sync = await syncCustomerState(guestCart, guestWishlist);
          setNotice(sync.message);
          if (sync.status === "synchronized") {
            const currentCart = useCartStore.getState().items;
            const currentWishlist = useWishlistStore.getState().items;
            if (JSON.stringify(currentCart) === JSON.stringify(guestCart)) useCartStore.getState().replaceItems(sync.cartItems ?? []);
            if (JSON.stringify(currentWishlist) === JSON.stringify(guestWishlist)) useWishlistStore.getState().replaceItems(sync.wishlistItems ?? []);
          } else return;
        }
        router.replace(result.destination ?? "/");
        router.refresh();
      }
    } catch { setNotice("Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return <section className={`auth-card${mode === "admin" ? " auth-card--admin" : ""}`} aria-labelledby="auth-title">
    <Link className="auth-brand" href="/">NP WARDROBE</Link>
    <p className="eyebrow">{mode === "admin" ? "Secure staff portal" : "A considered wardrobe"}</p>
    <h1 id="auth-title">{label}</h1>
    {params.get("state") === "password-updated" && <p className="auth-notice" role="status">Your password has been updated. Sign in to continue.</p>}
    {params.get("state") === "success" && <p className="auth-notice" role="status">Your email is verified. You can sign in.</p>}
    <form noValidate onSubmit={form.handleSubmit(submit)}>
      {mode === "register" && <Field label="Full name" name="fullName" error={form.formState.errors.fullName?.message}><input id="fullName" autoComplete="name" {...form.register("fullName")} /></Field>}
      {mode !== "reset" && <Field label="Email address" name="email" error={form.formState.errors.email?.message}><input id="email" type="email" autoComplete="email" {...form.register("email")} /></Field>}
      {mode !== "forgot" && <Field label={mode === "reset" ? "New password" : "Password"} name="password" error={form.formState.errors.password?.message}><span className="password-control"><input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "reset" ? "new-password" : mode === "register" ? "new-password" : "current-password"} {...form.register("password")} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></span></Field>}
      {mode === "register" && <label className="auth-consent"><input type="checkbox" {...form.register("termsAccepted")} /><span>I agree to the terms and privacy policy.</span></label>}
      {mode === "login" && <p className="auth-inline-link"><Link href="/auth/forgot-password">Forgot password?</Link></p>}
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      {form.formState.errors.root && <p className="auth-error" role="alert">{form.formState.errors.root.message}</p>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "admin" ? "Sign in securely" : mode === "register" ? "Create account" : mode === "forgot" ? "Send reset link" : mode === "reset" ? "Update password" : "Sign in"}</button>
    </form>
    {mode === "login" && <p className="auth-switch">New to NP Wardrobe? <Link href="/auth/register">Create an account</Link></p>}
    {mode === "register" && <p className="auth-switch">Already registered? <Link href="/auth/login">Sign in</Link></p>}
    {mode === "forgot" && <p className="auth-switch"><Link href="/auth/login">Return to sign in</Link></p>}
    {mode === "admin" && <p className="auth-switch"><Link href="/auth/forgot-password">Forgot password?</Link></p>}
  </section>;
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  const errorId = `${name}-error`;
  return <div className="auth-field"><label htmlFor={name}>{label}</label><div>{children}</div>{error && <p className="auth-error" id={errorId}>{error}</p>}</div>;
}
