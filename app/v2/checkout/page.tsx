// =============================================================================
// app/v2/checkout/page.tsx
// Shows a plan summary confirmation screen BEFORE redirecting to Stripe.
// Reduces checkout abandonment by giving users one final value summary.
// =============================================================================

"use client";

import { useState, Suspense } from "react";
import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";
import { useRouter, useSearchParams } from "next/navigation";

const PLANS: Record<string, {
  name: string; name_fr: string; price: string; price_fr: string;
  desc: string; desc_fr: string;
  features: string[]; features_fr: string[];
  guarantee: string; guarantee_fr: string;
}> = {
  solo: {
    name: "Fruxal Solo", name_fr: "Fruxal Solo",
    price: "$49/month", price_fr: "49 $/mois",
    desc: "For self-employed and solo operators under $500K revenue.",
    desc_fr: "Pour travailleurs autonomes sous 500 K$ de revenus.",
    features: [
      "Full leak report with dollar amounts",
      "Financial Health Score",
      "90-day action plan",
      "Monthly re-scans",
      "Government programs matched",
      "AI financial advisor chat",
    ],
    features_fr: [
      "Rapport de fuites avec montants",
      "Score de santé financière",
      "Plan d'action 90 jours",
      "Analyses mensuelles",
      "Programmes gouvernementaux",
      "Chat conseiller IA",
    ],
    guarantee: "7-day free trial · Cancel anytime · No credit card until trial ends",
    guarantee_fr: "7 jours gratuits · Annulez à tout moment · Aucune carte jusqu'à la fin de l'essai",
  },
  business: {
    name: "Fruxal Business", name_fr: "Fruxal Affaires",
    price: "$149/month", price_fr: "149 $/mois",
    desc: "For businesses with employees doing $150K–$1M revenue.",
    desc_fr: "Pour entreprises avec employés entre 150 K$ et 1 M$.",
    features: [
      "Everything in Solo",
      "Industry benchmarks",
      "Payroll & compliance audit",
      "QuickBooks integration",
      "Monthly advisor call",
      "Multi-business support",
    ],
    features_fr: [
      "Tout du Solo",
      "Repères de l'industrie",
      "Audit paie et conformité",
      "Intégration QuickBooks",
      "Appel conseiller mensuel",
      "Multi-entreprises",
    ],
    guarantee: "7-day free trial · Cancel anytime · No credit card until trial ends",
    guarantee_fr: "7 jours gratuits · Annulez à tout moment · Aucune carte jusqu'à la fin de l'essai",
  },
  report: {
    name: "Full Leak Report", name_fr: "Rapport complet",
    price: "$47 one-time", price_fr: "47 $ unique",
    desc: "One-time full diagnostic with fix plan.",
    desc_fr: "Diagnostic complet unique avec plan de correction.",
    features: ["Full diagnostic report", "All leaks with dollar amounts", "Step-by-step fix plan", "Government programs"],
    features_fr: ["Rapport de diagnostic complet", "Toutes les fuites avec montants", "Plan de correction étape par étape", "Programmes gouvernementaux"],
    guarantee: "One-time payment · Instant access · No subscription",
    guarantee_fr: "Paiement unique · Accès instantané · Sans abonnement",
  },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, setLang, t, isFR } = useLang();
  const plan = searchParams.get("plan") || "solo";
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planInfo = PLANS[plan] || PLANS.solo;

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      let scanId = "";
      try {
        const raw = sessionStorage.getItem("lg_prescan_result");
        if (raw) { const p = JSON.parse(raw); scanId = p.prescanRunId || ""; }
      } catch { /* non-fatal */ }

      const res = await fetch("/api/v2/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan in PLANS ? plan : "solo", scanId }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error || "Could not create checkout session");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12 font-sans">
      <div className="absolute top-4 right-4"><LangToggle lang={lang} setLang={setLang} /></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="font-serif text-[17px] font-semibold text-ink tracking-tight">Fruxal</span>
        </div>

        {/* Plan summary card */}
        <div className="bg-white border border-border-light rounded-2xl p-6 mb-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-1">
                {t("You're starting", "Vous commencez")}
              </p>
              <h1 className="font-serif text-[24px] text-ink font-normal">
                {isFR ? planInfo.name_fr : planInfo.name}
              </h1>
              <p className="text-[13px] text-ink-secondary mt-1">
                {isFR ? planInfo.desc_fr : planInfo.desc}
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-serif text-[22px] text-ink font-semibold">
                {isFR ? planInfo.price_fr : planInfo.price}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-border-light pt-4 mb-4">
            <ul className="space-y-2.5">
              {(isFR ? planInfo.features_fr : planInfo.features).map(f => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-ink-secondary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Guarantee */}
          <div className="bg-positive/5 border border-positive/15 rounded-xl px-4 py-3 text-[11px] text-positive font-semibold text-center">
            {isFR ? planInfo.guarantee_fr : planInfo.guarantee}
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex justify-center gap-6 mb-6 text-[10px] text-ink-faint">
          {[
            t("🔒 Secure checkout", "🔒 Paiement sécurisé"),
            t("🍁 Canadian company", "🍁 Entreprise canadienne"),
            t("❌ Cancel anytime", "❌ Annulez à tout moment"),
          ].map(s => <span key={s}>{s}</span>)}
        </div>

        {/* CTA */}
        {error && (
          <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-4 text-[15px] font-bold text-white bg-brand rounded-xl hover:bg-brand-light disabled:opacity-60 transition shadow-lg shadow-brand/20"
        >
          {loading
            ? t("Redirecting to secure checkout…", "Redirection vers le paiement sécurisé…")
            : t("Continue to secure checkout →", "Continuer vers le paiement sécurisé →")}
        </button>

        <p className="text-[10px] text-ink-faint text-center mt-3">
          {t("Powered by Stripe · Your card details are never stored by Fruxal", "Propulsé par Stripe · Vos coordonnées bancaires ne sont jamais stockées par Fruxal")}
        </p>

        <button onClick={() => router.back()} className="w-full text-center mt-4 text-[12px] text-ink-faint hover:text-ink-secondary transition">
          ← {t("Go back", "Retour")}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
