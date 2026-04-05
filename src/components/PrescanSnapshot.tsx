"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
const fmt = (n: number) =>
  n >= 10000 ? "$" + (n / 1000).toFixed(0) + "K"
  : n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K"
  : "$" + Math.round(n).toLocaleString();

const fmtFull = (n: number) => "$" + Math.round(n).toLocaleString();

const slugToLabel = (slug: string) =>
  slug.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const categoryIcon: Record<string, string> = {
  payments: "💳", banking: "🏦", insurance: "🛡️", payroll: "👥",
  tax: "📋", fuel: "⛽", subscriptions: "💻", other: "💧",
};

const severityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function HealthRing({ score, size = 100 }: { score: number; size?: number }) {
  const color = score >= 70 ? "#00c853" : score >= 40 ? "#ff8f00" : "#ff3d57";
  const bg = score >= 70 ? "#00c85315" : score >= 40 ? "#ff8f0015" : "#ff3d5715";
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1.5s ease" }} />
        <circle cx="50" cy="50" r="34" fill={bg} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-white" style={{ fontSize: size * 0.28 }}>{score}</span>
        <span className="text-white/40" style={{ fontSize: size * 0.1 }}>/100</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-[#0c1425] border border-white/[0.06] rounded-xl p-4">
      <div className="text-[10px] text-white/35 font-bold uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-2xl font-black ${accent || "text-white"}`}>{value}</div>
      {sub && <div className="text-[11px] text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

function LeakRow({ leak, isFR, onFix }: { leak: LeakCard; isFR: boolean; onFix: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#0c1425] border border-white/[0.06] rounded-xl overflow-hidden transition-all">
      {/* Main row */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 hover:bg-white/[0.02] transition">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-lg shrink-0">
            {leak.icon}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm truncate">{isFR ? leak.titleFR : leak.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: leak.severityColor + "20", color: leak.severityColor }}>
                {leak.severityLabel}
              </span>
              <span className="text-[10px] text-white/25">
                {categoryIcon[leak.category] || "💧"} {slugToLabel(leak.category)}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right shrink-0">
            {leak.estimatedAnnual > 0 ? (
              <>
                <div className="text-lg font-black text-red-400">{fmt(leak.estimatedAnnual)}</div>
                <div className="text-[10px] text-white/25">{isFR ? "/an" : "/yr"}</div>
              </>
            ) : (
              <div className="text-sm text-white/25">{isFR ? "À évaluer" : "TBD"}</div>
            )}
          </div>

          {/* Expand arrow */}
          <svg className={`w-4 h-4 text-white/20 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.04]">
          <div className="pt-4 space-y-4">
            {/* Description */}
            <p className="text-sm text-white/50 leading-relaxed">
              {isFR ? leak.descriptionFR : leak.description}
            </p>

            {/* Confidence + Priority */}
            <div className="flex gap-4">
              <div className="flex-1 bg-white/[0.02] rounded-lg p-3">
                <div className="text-[10px] text-white/30 uppercase tracking-wide mb-1">
                  {isFR ? "Confiance" : "Confidence"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${leak.confidenceScore}%` }} />
                  </div>
                  <span className="text-xs text-white/50 font-bold">{leak.confidenceScore}%</span>
                </div>
              </div>
              <div className="flex-1 bg-white/[0.02] rounded-lg p-3">
                <div className="text-[10px] text-white/30 uppercase tracking-wide mb-1">
                  {isFR ? "Priorité" : "Priority"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(leak.priorityScore * 5, 100)}%` }} />
                  </div>
                  <span className="text-xs text-white/50 font-bold">{leak.priorityScore}</span>
                </div>
              </div>
            </div>

            {/* Fix action - locked */}
            <button onClick={onFix}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition group">
              <span className="text-lg">🔒</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-white/60 group-hover:text-emerald-400 transition">
                  {isFR ? "Comment corriger cette fuite?" : "How to fix this leak?"}
                </div>
                <div className="text-[10px] text-white/25">
                  {isFR ? "Activez la surveillance pour débloquer le plan d'action" : "Activate monitoring to unlock the action plan"}
                </div>
              </div>
              <span className="text-emerald-500/60 text-sm">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
export default function PrescanSnapshot({ prescanRunId, lang = "en" }: { prescanRunId: string; lang?: "en" | "fr" }) {
  const router = useRouter();
  const [data, setData]       = useState<PrescanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!prescanRunId) return;
    fetch(`/api/prescan/results?prescanRunId=${prescanRunId}`)
      .then(r => { if (!r.ok) throw new Error("Failed to load results"); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [prescanRunId]);

  const isFR = lang === "fr";

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin" />
        </div>
        <div className="text-white/50 text-sm">{isFR ? "Chargement du tableau de bord..." : "Loading your dashboard..."}</div>
      </div>
    </div>
  );

  // ── Error ──
  if (error || !data) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mb-4">⚠️</div>
        <div className="text-lg font-bold text-white mb-2">{isFR ? "Résultats introuvables" : "Results not found"}</div>
        <div className="text-sm text-white/40 mb-6">{error || (isFR ? "Ce prescan n'existe pas ou a expiré." : "This prescan doesn't exist or has expired.")}</div>
        <button onClick={() => router.push("/prescan")}
          className="px-6 py-2.5 bg-emerald-500 text-black font-bold rounded-xl text-sm hover:bg-emerald-400 transition">
          {isFR ? "Nouveau prescan →" : "Run New Prescan →"}
        </button>
      </div>
    </div>
  );

  const hasLeaks = data.leaks.length > 0;
  const sortedLeaks = [...data.leaks].sort((a, b) =>
    (severityOrder[a.severityLabel] ?? 99) - (severityOrder[b.severityLabel] ?? 99)
  );
  const urgentLeaks = sortedLeaks.filter(l => l.severityScore >= 60);
  const otherLeaks = sortedLeaks.filter(l => l.severityScore < 60);
  const categories = [...new Set(data.leaks.map(l => l.category))];
  const goUpgrade = () => router.push(`/register?prescanRunId=${prescanRunId}&from=prescan`);

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* ════ Top Nav ════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-sm">💧</div>
            <div>
              <div className="text-sm font-black tracking-tight">Leak & Grow</div>
              <div className="text-[10px] text-white/30">
                {isFR ? "Système financier" : "Financial Operating System"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
              {isFR ? "Aperçu gratuit" : "Free Preview"}
            </span>
            <button onClick={goUpgrade}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition">
              {isFR ? "Activer la surveillance" : "Activate Monitoring"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ════ Executive Control Block ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-8">

          {/* Left: summary */}
          <div className="space-y-4">
            {/* Greeting */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black">
                {isFR ? "Votre Tableau de Bord Financier" : "Your Financial Control Center"}
              </h1>
              <p className="text-sm text-white/40 mt-1">
                {isFR
                  ? `${slugToLabel(data.industrySlug)} • ${data.province || "QC"} • Revenus: ${data.annualRevenue ? fmtFull(data.annualRevenue) + "/an" : data.revenueBand}`
                  : `${slugToLabel(data.industrySlug)} • ${data.province || "QC"} • Revenue: ${data.annualRevenue ? fmtFull(data.annualRevenue) + "/yr" : data.revenueBand}`}
              </p>
            </div>

            {/* Metric row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard
                label={isFR ? "Fuite estimée/an" : "Est. Annual Leak"}
                value={data.totalLeak > 0 ? fmt(data.totalLeak) : "$0"}
                sub={data.totalLeak > 0 ? `${fmt(data.totalLeakLow)} – ${fmt(data.totalLeakHigh)}` : undefined}
                accent={data.totalLeak > 0 ? "text-red-400" : "text-emerald-400"}
              />
              <MetricCard
                label={isFR ? "Fuites trouvées" : "Leaks Found"}
                value={`${data.leaks.length}`}
                sub={urgentLeaks.length > 0 ? `${urgentLeaks.length} ${isFR ? "urgente(s)" : "urgent"}` : undefined}
              />
              <MetricCard
                label={isFR ? "Catégories" : "Categories"}
                value={`${categories.length}`}
                sub={categories.map(c => categoryIcon[c] || "💧").join(" ")}
              />
              <MetricCard
                label={isFR ? "Qualité données" : "Data Quality"}
                value={`${data.dhScore}%`}
                sub={isFR ? "Basé sur le prescan" : "Based on prescan"}
                accent={data.dhScore >= 60 ? "text-emerald-400" : "text-amber-400"}
              />
            </div>
          </div>

          {/* Right: health score */}
          <div className="flex flex-col items-center justify-center bg-[#0c1425] border border-white/[0.06] rounded-2xl px-8 py-6">
            <HealthRing score={data.fhScore} size={120} />
            <div className="text-xs text-white/40 mt-3 font-bold uppercase tracking-wider">
              {isFR ? "Score de santé financière" : "Financial Health Score"}
            </div>
            <div className="text-[10px] text-white/20 mt-1">
              {data.fhScore >= 70
                ? (isFR ? "Bon — quelques optimisations possibles" : "Good — some optimizations possible")
                : data.fhScore >= 40
                  ? (isFR ? "Attention — des fuites significatives" : "Attention — significant leaks found")
                  : (isFR ? "Critique — intervention requise" : "Critical — action required")}
            </div>
          </div>
        </div>

        {/* ════ Monitoring Status Banner ══════════════════════════════════════ */}
        <div className="mb-6 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {isFR ? "Surveillance désactivée" : "Monitoring Paused"}
            </span>
          </div>
          <p className="text-xs text-white/40 flex-1">
            {isFR
              ? "Ce diagnostic est une photo instantanée. Si vos coûts dérivent le mois prochain, vous ne le saurez pas. Activez la surveillance pour une protection continue."
              : "This is a point-in-time snapshot. If your costs drift next month, you won't know. Activate monitoring for continuous protection."}
          </p>
          <button onClick={goUpgrade}
            className="shrink-0 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/20 transition">
            {isFR ? "Activer →" : "Activate →"}
          </button>
        </div>

        {/* ════ Leak Monitoring Block ═════════════════════════════════════════ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white/50">
              {isFR ? "Fuites détectées" : "Detected Leaks"}
            </h2>
            <div className="text-[10px] text-white/20">
              {isFR ? "Triées par sévérité" : "Sorted by severity"}
            </div>
          </div>

          {hasLeaks ? (
            <div className="space-y-2">
              {sortedLeaks.map(leak => (
                <LeakRow key={leak.id} leak={leak} isFR={isFR} onFix={() => setShowUpgrade(true)} />
              ))}
            </div>
          ) : (
            <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-lg font-bold text-emerald-300">
                {isFR ? "Aucune fuite majeure détectée" : "No major leaks detected"}
              </div>
              <div className="text-sm text-white/40 mt-1">
                {isFR ? "Votre entreprise semble bien optimisée." : "Your business appears well-optimized."}
              </div>
            </div>
          )}
        </div>

        {/* ════ Benchmark Context ═════════════════════════════════════════════ */}
        {hasLeaks && (
          <div className="mb-8 bg-[#0c1425] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">
              {isFR ? "Contexte de comparaison" : "Benchmark Context"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
                <span className="text-xl">🏢</span>
                <div>
                  <div className="text-xs text-white/30">{isFR ? "Industrie" : "Industry"}</div>
                  <div className="text-sm font-bold text-white">{slugToLabel(data.industrySlug)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
                <span className="text-xl">📍</span>
                <div>
                  <div className="text-xs text-white/30">{isFR ? "Province" : "Province"}</div>
                  <div className="text-sm font-bold text-white">{data.province || "QC"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
                <span className="text-xl">💰</span>
                <div>
                  <div className="text-xs text-white/30">{isFR ? "Tranche de revenus" : "Revenue Band"}</div>
                  <div className="text-sm font-bold text-white">
                    {data.annualRevenue ? fmtFull(data.annualRevenue) : slugToLabel(data.revenueBand)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-white/20">
              {isFR
                ? "Vos résultats sont comparés aux données de référence québécoises pour votre secteur et taille d'entreprise."
                : "Your results are compared against Quebec benchmark data for your industry and business size."}
            </div>
          </div>
        )}

        {/* ════ Connect Data CTA ═════════════════════════════════════════════ */}
        <div className="mb-6 relative overflow-hidden rounded-2xl border border-emerald-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-[#0c1425] to-[#020617]" />
          <div className="relative p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">
                  {isFR ? "Prochaine étape" : "Next Step"}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">
                  {isFR ? "Transformez ces estimations en données exactes" : "Turn these estimates into exact data"}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed mb-5">
                  {isFR
                    ? "Connectez QuickBooks, vos relevés bancaires ou fichiers CSV. Leak & Grow calcule vos fuites exactes et les surveille chaque mois — automatiquement."
                    : "Connect QuickBooks, bank statements, or CSV files. Leak & Grow calculates your exact leaks and monitors them every month — automatically."}
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {[
                    { icon: "📊", label: isFR ? "Fuites exactes" : "Exact leak amounts" },
                    { icon: "🔔", label: isFR ? "Alertes automatiques" : "Automatic alerts" },
                    { icon: "📈", label: isFR ? "Tendances mensuelles" : "Monthly trends" },
                    { icon: "🎯", label: isFR ? "Plans d'action" : "Fix playbooks" },
                  ].map(f => (
                    <span key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full text-[11px] text-white/60">
                      <span>{f.icon}</span> {f.label}
                    </span>
                  ))}
                </div>

                <button onClick={goUpgrade}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {isFR ? "Activer la surveillance gratuite →" : "Activate free monitoring →"}
                </button>
                <div className="text-[10px] text-white/20 mt-2">
                  {isFR ? "30 jours gratuits • Aucune carte de crédit requise" : "30 days free • No credit card required"}
                </div>
              </div>

              {/* Visual */}
              <div className="hidden sm:flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-5xl">🛡️</span>
                </div>
                <div className="text-[10px] text-emerald-400/50 font-bold uppercase tracking-wider text-center">
                  {isFR ? "Protection continue" : "Continuous Protection"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ Footer ═══════════════════════════════════════════════════════ */}
        <div className="text-center py-6 space-y-3">
          <button onClick={() => router.push("/prescan")}
            className="text-xs text-white/15 hover:text-white/40 transition">
            {isFR ? "Recommencer le prescan" : "Run a new prescan"}
          </button>
          <div className="text-[10px] text-white/10">
            {isFR
              ? "Leak & Grow — Système d'exploitation financier pour PME"
              : "Leak & Grow — Financial Operating System for Small Businesses"}
          </div>
        </div>
      </div>

      {/* ════ Upgrade Modal ══════════════════════════════════════════════════ */}
      {showUpgrade && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowUpgrade(false)} />
          <div className="relative bg-[#0c1425] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full">
            <button onClick={() => setShowUpgrade(false)} className="absolute top-4 right-4 text-white/30 hover:text-white/60">✕</button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl mb-4">🔓</div>
              <h3 className="text-lg font-black text-white mb-2">
                {isFR ? "Débloquez les plans d'action" : "Unlock Fix Playbooks"}
              </h3>
              <p className="text-sm text-white/40">
                {isFR
                  ? "Activez la surveillance pour accéder aux étapes de correction, aux alertes et au suivi mensuel."
                  : "Activate monitoring to access step-by-step fix guides, alerts, and monthly tracking."}
              </p>
            </div>
            <div className="space-y-2 mb-6">
              {[
                { icon: "✅", text: isFR ? "Plans de correction étape par étape" : "Step-by-step fix playbooks" },
                { icon: "✅", text: isFR ? "Alertes quand vos coûts dérivent" : "Alerts when your costs drift" },
                { icon: "✅", text: isFR ? "Tendances et graphiques mensuels" : "Monthly trend graphs" },
                { icon: "✅", text: isFR ? "Score de santé financière en temps réel" : "Live Financial Health Score" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-white/60">
                  <span>{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
            <button onClick={goUpgrade}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition">
              {isFR ? "Commencer gratuitement →" : "Start free →"}
            </button>
            <div className="text-[10px] text-white/20 text-center mt-2">
              {isFR ? "30 jours gratuits • Annulez à tout moment" : "30 days free • Cancel anytime"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}