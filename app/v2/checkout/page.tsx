// =============================================================================
// /v2/checkout — Redirects to Stripe checkout
// =============================================================================
// Usage: /v2/checkout?plan=solo (or report, advisor)
// Calls POST /api/v2/checkout → gets Stripe URL → redirects
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";
import { useRouter, useSearchParams } from "next/navigation";

const PLANS: Record<string, { name: string; name_fr: string; price: string; desc: string; desc_fr: string }> = {
  report: { name: "Full Leak Report", name_fr: "Rapport complet", price: "$47", desc: "One-time analysis with fix plan", desc_fr: "Analyse unique avec plan de correction" },
  solo: { name: "Fruxal Solo", name_fr: "Fruxal Solo", price: "$49/mo", desc: "Full leak report, alerts & fix steps — for self-employed", desc_fr: "Rapport complet, alertes et étapes — pour travailleurs autonomes" },
  business: { name: "Fruxal Business", name_fr: "Fruxal Affaires", price: "$150/mo", desc: "Benchmarks, QuickBooks & advisor call — for businesses with employees", desc_fr: "Repères, QuickBooks et appel conseiller — pour entreprises avec employés" },
  advisor: { name: "Fruxal Advisor", name_fr: "Fruxal Conseiller", price: "$79/mo", desc: "Full advisor with monthly re-scans", desc_fr: "Conseiller complet avec rescans mensuels" },
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, setLang, t, isFR } = useLang();
  const plan = searchParams.get("plan") || "solo";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const planInfo = PLANS[plan] || PLANS.solo;

  useEffect(() => {
    async function redirect() {
      try {
        // Get prescan scanId if available
        let scanId = "";
        try {
          const raw = sessionStorage.getItem("lg_prescan_result");
          if (raw) {
            const p = JSON.parse(raw);
            scanId = p.prescanRunId || "";
          }
        } catch { /* non-fatal */ }

        const res = await fetch("/api/v2/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan in PLANS ? plan : "solo", scanId }),
        });

        const json = await res.json();

        if (json.url) {
          typeof window !== "undefined" && window.location.href = json.url;
        } else {
          setError(json.error || "Could not create checkout session");
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    }
    redirect();
  }, [plan]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 font-sans">
      <div className="absolute top-4 right-4"><LangToggle lang={lang} setLang={setLang} /></div>
      <div className="text-center max-w-xs">
        {loading ? (
          <>
            <div className="w-10 h-10 border-2 border-border border-t-brand rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif text-lg font-semibold text-ink mb-1">{isFR ? planInfo.name_fr : planInfo.name}</p>
            <p className="text-sm text-ink-muted mb-1">{planInfo.price}</p>
            <p className="text-xs text-ink-faint">{t("Redirecting to secure checkout…", "Redirection vers le paiement sécurisé…")}</p>
          </>
        ) : error ? (
          <>
            <p className="font-serif text-lg font-semibold text-negative mb-2">{t("Checkout Error", "Erreur de paiement")}</p>
            <p className="text-sm text-ink-muted mb-4">{error}</p>
            <button
              onClick={() => router.push("/v2/dashboard")}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand rounded-lg"
            >
              {t("Back to Dashboard", "Retour au tableau de bord")}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
