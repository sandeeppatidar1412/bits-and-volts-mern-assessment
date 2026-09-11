"use client";

import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { api } from "../../lib/api";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const completeGoogleLogin = async ({ credential }) => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
      signIn(data.token, data.user);
      router.replace("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(form) });
      signIn(data.token, data.user);
      router.replace("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const google = () => {
    setError("");
    if (!googleClientId) return setError("Google login is not configured yet.");
    if (!googleReady || !window.google) return setError("Google sign-in is still loading. Please try again.");
    window.google.accounts.id.prompt();
  };

  const initializeGoogle = () => {
    if (!googleClientId || !window.google) return;
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: completeGoogleLogin });
    setGoogleReady(true);
  };

  return <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center px-4 py-12">
    {googleClientId && <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} onError={() => setError("Google sign-in could not be loaded. Please try again.")} />}
    <div className="w-full rounded-[28px] border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/50">
      <p className="text-sm font-medium uppercase tracking-[.2em] text-emerald-600">Login</p><h1 className="mt-2 text-3xl font-bold">Sign in</h1>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        <label className="block text-sm font-medium">Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="you@example.com" /></label>
        <label className="block text-sm font-medium">Password<input type="password" required minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="At least 6 characters" /></label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-between text-sm"><Link href="/forgot-password" className="text-emerald-600">Forgot password?</Link><Link href="/register">Create account</Link></div>
        <button disabled={loading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-70">{loading ? "Signing in…" : "Sign in"}</button>
      </form>
      <div className="my-6 border-t border-slate-200" />
      <button onClick={google} disabled={loading || !googleClientId} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-medium disabled:opacity-70">Continue with Google</button>
    </div>
  </main>;
}