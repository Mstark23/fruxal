"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LeakCard {
  id: string; code: string; icon: string;
  title: string; titleFR: string;
  description: string; descriptionFR: string;
  category: string; estimatedAnnual: number;
  severityScore: number; severityLabel: string; severityColor: string;
  confidenceScore: number; priorityScore: number; status: string;
}

interface PrescanData {
  prescanRunId: string; industrySlug: string; province: string;
  revenueBand: string; annualRevenue: number | null;
  fhScore: number; dhScore: number;
  totalLeak: number; totalLeakLow: number; totalLeakHigh: number;
  leaks: LeakCard[];
}

const fmt = (n: number) =>
  n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n).toLocaleString();

function HealthRing({ score }: { score: number }) {
  const color = score >= 70 ? "#00c853" : score >= 40 ? "#ff8f00" : "#ff3d57";
  return (
    <div className="relative w-20 h-20">
      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#1e293b" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.91" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">{score}</span>
    </div>
  );
}

export default function PrescanSnapshot({ prescanRunId, lang = "en" }: { prescanRunId: string; lang?: "en" | "fr" }) {
  const router = useRouter();
  const [data, setData]       = useState<PrescanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!prescanRunId) return;
    fetch(`/api/prescan/results?prescanRunId=${prescanRunId}`)
      .then(r => { if (!r.ok) throw new Error("Failed to load results"); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [prescanRunId]);

  const isFR = lang === "fr";

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl animate-pulse mb-4">💧</div>
        <div className="text-white/60 text-sm">{isFR ? "Chargement de vos résultats..." : "Loading your results..."}</div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <div className="text-white/60 mb-4">{error || "Results not found"}</div>
        <button onClick={() => router.push("/prescan")}
          className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-xl">
          {isFR ? "Nouveau prescan" : "Run New Prescan"}
        </button>
      </div>
    </div>
  );

  const hasLeaks = data.leaks.length > 0;

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-lg font-black">💧 Fruxal</div>
            <div className="text-xs text-white/40 mt-0.5">
              {isFR ? "Vue d'ensemble de vos fuites financières" : "Your Financial Leak Snapshot"}
            </div>
          </div>
          <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-bold uppercase tracking-wider">
            {isFR ? "Aperçu gratuit" : "Free Preview"}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Block 1: Summary ──────────────────────────────────── */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-2">
                {isFR ? "Fuite estimée par année" : "Estimated Annual Leak"}
              </div>
              {data.totalLeak > 0 ? (
                <>
                  <div className="text-4xl font-black text-red-400">
                    {fmt(data.totalLeakLow)}
                    <span className="text-2xl text-white/30 mx-2">–</span>
                    {fmt(data.totalLeakHigh)}
                    <span className="text-base text-white/40 font-normal ml-1">/yr</span>
                  </div>
                  <div className="text-xs text-white/30 mt-2">
                    {isFR
                      ? `Basé sur des entreprises similaires — ${data.province || "QC"}`
                      : `Based on similar businesses — ${data.province || "QC"}`}
                  </div>
                </>
              ) : (
                <div className="text-3xl font-black text-emerald-400">
                  {isFR ? "Aucune fuite détectée" : "No leaks detected"}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <HealthRing score={data.fhScore} />
              <div className="text-xs text-white/40">{isFR ? "Score financier" : "Financial Health"}</div>
            </div>
          </div>
        </div>

        {/* ── Block 2: Leak Cards ───────────────────────────────── */}
        {hasLeaks ? (
          <div className="space-y-3">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider">
              {isFR
                ? `${data.leaks.length} fuite(s) détectée(s)`
                : `${data.leaks.length} leak${data.leaks.length !== 1 ? "s" : ""} detected`}
            </div>
            {data.leaks.map(leak => (
              <div key={leak.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl mt-0.5 shrink-0">{leak.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-white">{isFR ? leak.titleFR : leak.title}</div>
                      <div className="text-sm text-white/50 mt-1 leading-relaxed">
                        {isFR ? leak.descriptionFR : leak.description}
                      </div>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: leak.severityColor + "22", color: leak.severityColor }}>
                          {leak.severityLabel}
                        </span>
                        <span className="text-xs text-white/30">
                          {leak.confidenceScore}% {isFR ? "confiance" : "confidence"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {leak.estimatedAnnual > 0 && (
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-red-400">{fmt(leak.estimatedAnnual)}</div>
                      <div className="text-xs text-white/30">/yr</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">✅</div>
            <div className="font-bold text-emerald-300">
              {isFR ? "Aucune fuite majeure détectée" : "No major leaks detected"}
            </div>
            <div className="text-sm text-white/40 mt-1">
              {isFR ? "Votre entreprise semble bien optimisée." : "Your business looks well-optimized based on what you shared."}
            </div>
          </div>
        )}

        {/* ── Block 3: Connect Real Data CTA ───────────────────── */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900/80 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0">
              🔌
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg mb-1">
                {isFR ? "Ces chiffres sont des estimations. Connectez vos vraies données." : "These are estimates. Connect your real data."}
              </div>
              <div className="text-sm text-white/55 mb-4 leading-relaxed">
                {isFR
                  ? "Connectez votre logiciel comptable ou relevés bancaires. Fruxal calcule vos fuites exactes et les surveille chaque mois."
                  : "Link your accounting software or bank statements. Fruxal calculates your exact leaks and monitors them every month."}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: "📊", label: isFR ? "Fuites exactes" : "Exact leaks" },
                  { icon: "🔔", label: isFR ? "Alertes dérive" : "Drift alerts" },
                  { icon: "📈", label: isFR ? "Suivi mensuel" : "Monthly tracking" },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2">
                    <span>{f.icon}</span>
                    <span className="text-xs text-white/70 font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push(`/register?prescanRunId=${prescanRunId}&from=prescan`)}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all"
              >
                {isFR ? "Connecter mes vraies données →" : "Connect my real data →"}
              </button>
              <div className="text-xs text-white/25 mt-2">
                {isFR ? "Gratuit pour commencer • Aucune carte de crédit" : "Free to start • No credit card required"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Block 4: Monitoring OFF notice ───────────────────── */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <div className="text-sm text-white/40 leading-relaxed">
            {isFR
              ? "Surveillance désactivée. Ce snapshot est ponctuel — si vos coûts dérivent le mois prochain, vous ne le saurez pas."
              : "Monitoring is off. This is a one-time snapshot — if your costs drift next month, you won't know."}
            <button
              onClick={() => router.push(`/register?prescanRunId=${prescanRunId}&from=prescan`)}
              className="ml-1 text-emerald-400 hover:underline font-medium"
            >
              {isFR ? "Activer →" : "Activate →"}
            </button>
          </div>
        </div>

        <div className="flex justify-center pb-4">
          <button onClick={() => router.push("/prescan")}
            className="text-xs text-white/20 hover:text-white/50 transition">
            {isFR ? "Recommencer le prescan" : "Run a new prescan"}
          </button>
        </div>
      </main>
    </div>
  );
}
