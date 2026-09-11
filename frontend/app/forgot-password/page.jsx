"use client";
import Link from "next/link";
import { useState } from "react";
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to send reset link");
            }
            alert(result.message || "Reset link sent");
            setEmail("");
        }
        catch (error) {
            alert(error instanceof Error ? error.message : "Failed to send reset link");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4 py-16">
      <div className="w-full rounded-[28px] border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/50 sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Reset password</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Forgot your password?</h1>
        <p className="mt-3 text-sm text-slate-600">Enter your registered email and we’ll send a link to create a new password.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white" placeholder="you@example.com"/>
          </div>

          <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600">
          Remembered it? <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Back to login</Link>
        </div>
      </div>
    </main>);
}
