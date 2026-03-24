"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const prescanRunId = params.get("prescanRunId");
  const intent = params.get("intent"); // "download" → auto-trigger PDF after signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    try {
      // 1. Create account
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password, name, prescanRunId }),
      });

      const regData = await res.json();
      if (!res.ok) {
        setError(regData.error || "Registration failed");
        return;
      }

      // qualifiedPlan comes from the API — derived from actual prescan DB data
      // "solo" → /v2/dashboard, "business" | "enterprise" → /v2/business
      const qualifiedPlan: string = regData.qualifiedPlan || "solo";

      // 2. Auto-login
      const loginResult = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        window.location.href = "/login";
        return;
      }

      // 3. Wait for session to be readable
      let sessionOk = false;
      for (let i = 0; i < 5; i++) {
        const session = await getSession();
        if (session?.user) { sessionOk = true; break; }
        await new Promise(r => setTimeout(r, 300));
      }

      if (!sessionOk) {
        window.location.href = "/login";
        return;
      }

      // *** DO NOT CLEAR sessionStorage here ***
      // The dashboard needs lg_prescan_result to display leaks.
      // Dashboard will clear it after reading.

      // 4. Route to correct dashboard based on qualifiedPlan from API (authoritative)
      // Fallback: check sessionStorage if API returned default "solo" and no prescanRunId
      let dashBase = "/v2/dashboard/solo";

      if (qualifiedPlan === "enterprise") {
        dashBase = "/v2/dashboard/enterprise";
      } else if (qualifiedPlan === "business") {
        dashBase = "/v2/dashboard/business";
      } else {
        // Double-check sessionStorage in case API had no prescan data but session does
        try {
          const raw = sessionStorage.getItem("lg_prescan_result");
          if (raw) {
            const p = JSON.parse(raw);
            const tier = p.tier || "";
            const emp = Number(p.inputs?.employeeCount ?? 0);
            const rev = Number(p.inputs?.annualRevenue ?? 0);
            if (rev >= 1_000_000 || tier === "enterprise") {
              dashBase = "/v2/dashboard/enterprise";
            } else if (tier === "growth" || emp >= 6 || rev >= 500_000) {
              dashBase = "/v2/dashboard/business";
            }
          }
        } catch { /* non-fatal */ }
      }

      // Write fruxal_tier so tier router never re-routes on first load
      try {
        if (dashBase.includes("enterprise")) localStorage.setItem("fruxal_tier", "enterprise");
        else if (dashBase.includes("business")) localStorage.setItem("fruxal_tier", "business");
      } catch { /* non-fatal */ }

      const dest = prescanRunId
        ? dashBase + "?prescanRunId=" + prescanRunId + (intent === "download" ? "&autoDownload=1" : "")
        : dashBase;
      window.location.href = dest;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg font-sans flex items-center justify-center px-6">
      <p className="text-[11px] text-center text-ink-faint mb-3">
        By signing up you agree to our 
        <a href="/legal/terms" className="underline hover:text-ink" target="_blank">Terms of Service</a> and 
        <a href="/legal/privacy" className="underline hover:text-ink" target="_blank">Privacy Policy</a>.
      </p>
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="font-serif text-[17px] font-semibold text-ink tracking-tight">Fruxal</span>
        </div>

        <div className="flex justify-end mb-4"><LangToggle lang={lang} setLang={setLang} /></div>
        <h1 className="font-serif text-[28px] text-ink font-normal mb-2">{t("Create your account", "Créer votre compte")}</h1>
        <p className="text-sm text-ink-secondary mb-8">{t("Access your financial dashboard and start protecting your margins.", "Accédez à votre tableau de bord financier et protégez vos marges.")}</p>

        {/* Google OAuth — PRIMARY CTA */}
        <button
          onClick={() => {
            const dest = prescanRunId ? `/v2/dashboard?prescanRunId=${prescanRunId}` : "/v2/dashboard";
            signIn("google", { callbackUrl: dest });
          }}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-border rounded-sm text-sm font-semibold text-ink hover:bg-bg-section hover:border-border-focus transition shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t("Continue with Google", "Continuer avec Google")}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border-light" />
          <span className="text-[11px] text-ink-faint font-medium">{t("or sign up with email", "ou avec email")}</span>
          <div className="flex-1 h-px bg-border-light" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">{t("Full name", "Nom complet")}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 bg-white border border-border rounded-sm text-body text-ink font-sans outline-none focus:border-brand focus:ring-[3px] focus:ring-brand-soft transition" placeholder={t("Your name", "Votre nom")} />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-white border border-border rounded-sm text-body text-ink font-sans outline-none focus:border-brand focus:ring-[3px] focus:ring-brand-soft transition" placeholder="you@company.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 bg-white border border-border rounded-sm text-body text-ink font-sans outline-none focus:border-brand focus:ring-[3px] focus:ring-brand-soft transition" placeholder={t("Min. 8 characters", "Min. 8 caractères")} />
          </div>
          <button type="submit" aria-label="Create account" disabled={loading} className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light disabled:opacity-50 transition mt-2">
            {loading ? t("Creating account…", "Création du compte…") : t("Create account →", "Créer un compte →")}
          </button>
        </form>

        <p className="text-xs text-ink-faint text-center mt-6">
          {t("Already have an account?", "Déjà un compte ?")} <a href="/login" className="text-brand font-medium">{t("Sign in", "Se connecter")}</a>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg"><div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}