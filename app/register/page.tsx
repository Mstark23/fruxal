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
            const emp = Number(p.inputs?.employeeCount || 0);
            const rev = Number(p.inputs?.annualRevenue || 0);
            if (rev >= 1_000_000 || tier === "enterprise") {
              dashBase = "/v2/dashboard/enterprise";
            } else if (tier === "growth" || emp >= 6 || rev >= 500_000) {
              dashBase = "/v2/dashboard/business";
            }
          }
        } catch {}
      }

      // Write fruxal_tier so tier router never re-routes on first load
      try {
        if (dashBase.includes("enterprise")) localStorage.setItem("fruxal_tier", "enterprise");
        else if (dashBase.includes("business")) localStorage.setItem("fruxal_tier", "business");
      } catch {}

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
          <button type="submit" disabled={loading} className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-sm hover:bg-brand-light disabled:opacity-50 transition mt-2">
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