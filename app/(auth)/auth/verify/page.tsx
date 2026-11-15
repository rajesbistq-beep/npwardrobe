import { Suspense } from "react";
import Link from "next/link";
import { AuthFeedback } from "@/components/auth/auth-feedback";
export default function VerifyPage() { return <section className="auth-card"><Link className="auth-brand" href="/">NP WARDROBE</Link><p className="eyebrow">Email verification</p><h1>Check your inbox</h1><p className="auth-description">Use the secure link we sent to confirm your email address. If the link expired, register again or request a fresh email.</p><Suspense><AuthFeedback /></Suspense><p className="auth-switch"><Link href="/auth/login">Return to sign in</Link></p></section>; }
