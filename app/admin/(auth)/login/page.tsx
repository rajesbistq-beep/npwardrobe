import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export default function AdminLoginPage() { return <Suspense fallback={<div className="auth-card auth-card--admin" role="status">Loading staff sign-in…</div>}><AuthForm mode="admin" /></Suspense>; }
