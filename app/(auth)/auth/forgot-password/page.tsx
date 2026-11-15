import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export default function ForgotPasswordPage() { return <Suspense fallback={<div className="auth-card" role="status">Loading recovery…</div>}><AuthForm mode="forgot" /></Suspense>; }
