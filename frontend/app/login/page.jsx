"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { api } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

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
    setToast("Google login will be available in a future update.");
    window.setTimeout(() => setToast(""), 3500);
  };

  return <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center px-4 py-12">
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
      <button onClick={google} disabled={loading} aria-label="Continue with Google" className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 font-medium transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-70"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.22Z"/><path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.27.31-1.84V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.37l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.13c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.22 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 7.85 9.46 6.13 12 6.13Z"/></svg><span>Continue with Google</span></button>
      {toast && <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>}
    </div>
  </main>;
}