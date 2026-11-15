"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { beginAdminMfa, verifyAdminMfa } from "@/app/actions/auth";

type Flow = { factorId: string; challengeId: string; qrCode?: string; secret?: string; enrolled: boolean };
export function AdminMfaForm() {
  const router = useRouter();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useForm<{ code: string }>({ resolver: zodResolver(z.object({ code: z.string().regex(/^\d{6}$/) })) as import("react-hook-form").Resolver<{ code: string }>, defaultValues: { code: "" } });
  async function start() {
    setBusy(true); setNotice("");
    const result = await beginAdminMfa();
    if (result.ok) { setFlow(result); form.reset(); } else setNotice(result.message);
    setBusy(false);
  }
  async function submit({ code }: { code: string }) {
    if (!flow) return;
    setBusy(true); setNotice("");
    const result = await verifyAdminMfa({ ...flow, code });
    if (result.ok) { setFlow(null); router.replace("/admin"); router.refresh(); }
    else { setNotice(result.message); form.setValue("code", ""); }
    setBusy(false);
  }
  return <section className="auth-card auth-card--admin" aria-labelledby="mfa-title">
    <a className="auth-brand" href="/admin/login">NP WARDROBE · STAFF</a><p className="eyebrow">Multi-factor security</p><h1 id="mfa-title">Authenticator verification</h1>
    {flow?.qrCode && <div className="mfa-enrollment"><p>Scan this code with your authenticator app, then enter the six-digit code.</p><Image src={flow.qrCode} alt="Authenticator enrollment QR code" width={240} height={240} unoptimized /><p>Can’t scan? Enter this setup key manually:</p><code>{flow.secret}</code></div>}
    {flow && <form noValidate onSubmit={form.handleSubmit(submit)}><div className="auth-field"><label htmlFor="totp-code">Six-digit code</label><input id="totp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...form.register("code")} aria-describedby={form.formState.errors.code ? "totp-error" : undefined} />{form.formState.errors.code && <p className="auth-error" id="totp-error">Enter six digits.</p>}</div><button className="auth-submit" disabled={busy}>{busy ? "Verifying…" : flow.enrolled ? "Verify and continue" : "Verify authenticator"}</button></form>}
    {notice && <p className="auth-notice" role="status">{notice}</p>}
    {!flow && <button className="auth-submit" onClick={() => void start()} disabled={busy}>{busy ? "Preparing…" : "Start verification"}</button>}
    <p className="auth-switch">Keep your authenticator available. Contact your administrator if you cannot access it.</p>
  </section>;
}
