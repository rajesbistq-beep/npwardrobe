import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export default function RegisterPage() { return <Suspense fallback={<div className="auth-card" role="status">Loading registration…</div>}><AuthForm mode="register" /></Suspense>; }
