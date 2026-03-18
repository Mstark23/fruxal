"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const redirectTo  = searchParams.get("redirect");
  const { lang, setLang, t, isFR } = useLang();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [hint, setHint]         = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setHint("");
    setLoading(true);

    // Step 1: Check if account exists and what auth method it uses
    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const check = await checkRes.json();

      if (!check.exists) {
        setError("No account found with this email.");
        setHint("Need an account? Create one free below.");
        setLoading(false);
        return;
      }

      if (check.method === "google") {
        setError("This account was created with Google.");
        setHint(`Please use the "${t("Sign in with Google", "Se connecter avec Google")}" button below.`);
        setLoading(false);
        return;
      }
    } catch {
      // If check-email fails, proceed to normal login
    }

    // Step 2: Attempt sign-in
    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Incorrect password.");
      setHint("Double-check your password and try again.");
      setLoading(false);
    } else {
      // Route to correct dashboard based on role first, then prescan tier
      let dashBase = "/v2/dashboard";
      try {
        // Check role from session — reps go straight to /rep/dashboard
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const role = sessionData?.user?.role;
        const roleRedirect = sessionData?.user?.redirectTo;

        if (role === "rep") {
          window.location.href = redirectTo || callbackUrl || "/rep/dashboard";
          return;
        }

        if (roleRedirect && roleRedirect !== "/v2/dashboard") {
          window.location.href = redirectTo || callbackUrl || roleRedirect;
          return;
        }

        // Non-rep: use prescan tier to pick dashboard variant
        const raw = sessionStorage.getItem("lg_prescan_result");
        if (raw) {
          const p = JSON.parse(raw);
          const prescanTier = p.tier || "";
          const emp = p.inputs?.employeeCount || 0;
          const rev = p.inputs?.annualRevenue || 0;
          if (rev >= 1_000_000 || prescanTier === "enterprise") {
            dashBase = "/v2/dashboard/enterprise";
          } else if (prescanTier === "growth" || Number(emp) > 0 || Number(rev) >= 500_000) {
            dashBase = "/v2/dashboard/business";
          }
        }
        // Write fruxal_tier so tier router never re-routes on first load
        try {
          if (dashBase.includes("enterprise")) localStorage.setItem("fruxal_tier", "enterprise");
          else if (dashBase.includes("business")) localStorage.setItem("fruxal_tier", "business");
        } catch {}
      } catch {}
      const dest = redirectTo || callbackUrl || dashBase;
      const safeDest = dest.startsWith("/") ? dest : dashBase;
      // Hard redirect so fresh session cookie is sent with the next request
      window.location.href = safeDest;
    }
  };

  const handleGoogleSignIn = () => {
    const dest = redirectTo || callbackUrl || "/v2/dashboard";
    signIn("google", { callbackUrl: dest || "/v2/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
            </div>
            <span className="font-serif text-[17px] font-semibold text-ink tracking-tight">Fruxal</span>
          </Link>
        </div>

        <div className="flex justify-end mb-4"><LangToggle lang={lang} setLang={setLang} /></div>
        <h1 className="font-serif text-[28px] text-ink font-normal mb-2">{t("Welcome back", "Bienvenue")}</h1>
        <p className="text-sm text-ink-secondary mb-8">{t("Sign in to access your financial dashboard.", "Connectez-vous à votre tableau de bord financier.")}</p>

        {error && (
          <div className="bg-negative/8 border border-negative/20 text-negative text-sm font-medium px-4 py-3 rounded-sm mb-4">
            <p>{error}</p>
            {hint && <p className="text-xs mt-1 font-normal opacity-80">{hint}</p>}
          </div>
        )}

        {/* Google OAuth */}
        <button onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2.5 py-3 bg-white border border-border rounded-sm text-sm font-medium text-ink hover:bg-gray-50 transition mb-4">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t("Sign in with Google", "Se connecter avec Google")}
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-bg px-3 text-ink-faint">or</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">{t("Email", "Courriel")}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-sm text-body text-ink font-sans outline-none focus:border-brand focus:ring-[3px] focus:ring-brand-soft transition"
              placeholder="you@company.com" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">{t("Password", "Mot de passe")}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-sm text-body text-ink font-sans outline-none focus:border-brand focus:ring-[3px] focus:ring-brand-soft transition"
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light transition disabled:opacity-50 mt-2">
            {loading ? t("Signing in…", "Connexion…") : t("Sign in →", "Se connecter →")}
          </button>
        </form>

        <p className="text-xs text-ink-faint text-center mt-6">
          {t("Don't have an account?", "Pas encore de compte ?")} <Link href="/register" className="text-brand font-medium">{t("Create one free", "Créer un compte gratuit")}</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg"><div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}