// =============================================================================
// src/app/auth/login/page.tsx — LOGIN PAGE
// =============================================================================
// Two methods:
//   1. Google OAuth (one click)
//   2. Email + password
//
// Redirects to /v2/dashboard after login.
// useOnboardingRedirect in dashboard handles the rest.
// =============================================================================

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/v2/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(
    errorParam === "CredentialsSignin" ? "Invalid email or password." :
    errorParam ? "Something went wrong. Please try again." : ""
  );

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    // Pre-flight: check if account exists and auth method
    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const check = await checkRes.json();

      if (!check.exists) {
        setError("No account found with this email. Please create an account first.");
        setLoading(false);
        return;
      }

      if (check.method === "google") {
        setError("This account was created with Google. Please click 'Sign in with Google' above.");
        setLoading(false);
        return;
      }
    } catch {
      // If check fails, proceed to normal login
    }

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Incorrect password. Please try again.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl font-black text-emerald-400 mx-auto mb-3">L</div>
          <h1 className="text-white/70 text-lg font-bold">Welcome back</h1>
          <p className="text-white/20 text-xs mt-1">Sign in to your Fruxal account</p>
        </div>

        {/* Google OAuth */}
        <button onClick={handleGoogle} disabled={googleLoading}
          className="w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-white/50 text-sm font-medium transition-all flex items-center justify-center gap-3 mb-4">
          {googleLoading ? (
            <span className="w-4 h-4 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/[0.04]" />
          <span className="text-white/10 text-[10px] uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>

        {/* Email + Password form */}
        <div onSubmit={handleCredentials}>
          <div className="space-y-3">
            <div>
              <label className="text-white/20 text-[10px] uppercase tracking-wider font-bold mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@business.com" autoComplete="email" autoFocus
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white/60 text-sm placeholder:text-white/10 focus:outline-none focus:border-emerald-500/30 transition-colors" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-white/20 text-[10px] uppercase tracking-wider font-bold">Password</label>
                <Link href="/auth/forgot" className="text-emerald-400/30 text-[10px] hover:text-emerald-400/50 transition-colors">
                  Forgot?
                </Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white/60 text-sm placeholder:text-white/10 focus:outline-none focus:border-emerald-500/30 transition-colors" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2">
              <p className="text-red-400/60 text-[11px]">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleCredentials} disabled={loading || !email || !password}
            className={`w-full mt-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
              !loading && email && password
                ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/15 active:scale-[0.98]"
                : "bg-white/[0.04] text-white/15 cursor-not-allowed"
            }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </div>

        {/* Signup link */}
        <p className="text-center text-white/15 text-xs mt-6">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-emerald-400/50 hover:text-emerald-400/70 font-medium transition-colors">
            Create one free
          </Link>
        </p>

        {/* Back to home */}
        <p className="text-center mt-4">
          <Link href="/" className="text-white/8 text-[10px] hover:text-white/15 transition-colors">
            ← Back to fruxal.ca
          </Link>
        </p>
      </div>
    </div>
  );
}
