// app/v2/diagnostic/[id]/page.tsx
// Diagnostic report viewer — solutions[] rendered directly from finding JSON.
// No API call per finding. Click tracked to /api/v2/affiliate/click.
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Solution {
  name: string;
  url: string;
  why: string;
  price_approx?: string;
  category?: string;
}

interface Finding {
  id?: string; category: string; severity: string;
  title: string; title_fr?: string;
  description: string; description_fr?: string;
  impact_min: number; impact_max: number;
  recommendation: string; recommendation_fr?: string;
  priority?: number; timeline?: string; difficulty?: string;
  solutions?: Solution[];
  // legacy support
  partner_slugs?: string[];
}

interface Report {
  id: string; status: string; tier: string; language: string;
  scores: { overall: number; compliance: number; efficiency: number; optimization: number; growth: number };
  executive_summary: string; executive_summary_fr?: string;
  findings: Finding[]; action_plan: any[];
  risk_matrix: any[]; benchmark_comparisons: any[];
  totals: { annual_leaks: number; potential_savings: number; penalty_exposure: number; programs_value: number };
  meta: { model: string; duration_ms: number; created_at: string };
}

const SEV: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-500/10",   text: "text-red-400",    border: "border-l-red-500" },
  high:     { bg: "bg-orange-500/8", text: "text-orange-400", border: "border-l-orange-500" },
  medium:   { bg: "bg-yellow-500/8", text: "text-yellow-400", border: "border-l-yellow-500" },
  low:      { bg: "bg-blue-500/8",   text: "text-blue-400",   border: "border-l-blue-500" },
};

const RISK_BG: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400", high: "bg-orange-500/15 text-orange-400",
  medium: "bg-yellow-500/15 text-yellow-400", low: "bg-blue-500/15 text-blue-400",
};

type Tab = "findings" | "plan" | "risk" | "benchmarks";

// ─── Solution buttons — reads directly from finding.solutions[], no API call ──
function SolutionButtons({
  finding, businessId, lang,
}: {
  finding: Finding; businessId: string; lang: "en" | "fr";
}) {
  const [opened, setOpened] = useState<string | null>(null);
  const solutions = finding.solutions || [];
  if (!solutions.length) return null;

  function handleClick(s: Solution) {
    setOpened(s.url);

    // Fire-and-forget click tracking
    fetch("/api/v2/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:       s.name,
        url:        s.url,
        category:   s.category || finding.category,
        findingId:  finding.id || null,
        businessId: businessId || null,
        source:     "diagnostic_report",
      }),
    }).catch(() => {});

    window.open(s.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/[0.05]">
      <p className="text-[9px] text-white/20 uppercase tracking-wider mb-2">
        {lang === "fr" ? "Solutions recommandées" : "Recommended solutions"}
      </p>
      <div className="space-y-1.5">
        {solutions.slice(0, 3).map((s, i) => (
          <button key={i} onClick={() => handleClick(s)}
            className={`w-full flex items-start gap-2.5 text-left px-3 py-2 rounded-lg border transition-all ${
              opened === s.url
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-white/[0.02] border-white/[0.06] hover:border-emerald-500/25 hover:bg-white/[0.04]"
            }`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold ${opened === s.url ? "text-emerald-400" : "text-white/60"}`}>
                  {s.name}
                </span>
                {s.price_approx && (
                  <span className="text-[9px] text-white/20 shrink-0">{s.price_approx}</span>
                )}
                <span className={`ml-auto text-[10px] shrink-0 ${opened === s.url ? "text-emerald-400/60" : "text-white/20"}`}>
                  {opened === s.url ? "Opened ✓" : "→"}
                </span>
              </div>
              <p className="text-[10px] text-white/30 leading-snug mt-0.5">{s.why}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function DiagnosticReportPage() {
  const params  = useParams();
  const router  = useRouter();
  const [report, setReport]               = useState<Report | null>(null);
  const [businessId, setBusinessId]       = useState("");
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [tab, setTab]                     = useState<Tab>("findings");
  const [filterSev, setFilterSev]         = useState<string | null>(null);
  const [lang, setLang]                   = useState<"en"|"fr">("en");
  const isFr = lang === "fr";
  const t = (en: string, fr: string) => isFr ? fr : en;

  useEffect(() => {
    fetch(`/api/v2/diagnostic/${params.id}`)
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setReport(j.data);
          setBusinessId(j.data.business_id || "");
          if (j.data.language === "fr") setLang("fr");
        } else {
          setError(j.error);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !report) return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center text-center p-8">
      <div>
        <p className="text-red-400 text-sm mb-3">{error || t("Report not found","Rapport introuvable")}</p>
        <button onClick={() => router.push("/v2/dashboard")} className="text-xs text-emerald-400 underline">
          {t("Back","Retour")}
        </button>
      </div>
    </div>
  );

  if (report.status === "analyzing") return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        <p className="text-white text-sm font-semibold">{t("Analyzing your business...","Analyse en cours...")}</p>
        <p className="text-xs text-white/25">{t("This takes 30–60 seconds","Cela peut prendre 30–60 secondes")}</p>
      </div>
    </div>
  );

  const scores  = report.scores  ?? {};
  const totals  = report.totals  ?? {};
  const findings = filterSev
    ? (report.findings ?? []).filter(f => f.severity === filterSev)
    : (report.findings ?? []);

  const TABS: { key: Tab; label: string; labelFr: string; count?: number }[] = [
    { key: "findings",   label: "Findings",    labelFr: "Constats",      count: (report.findings ?? []).length },
    { key: "plan",       label: "Action Plan", labelFr: "Plan d'action", count: (report.action_plan ?? []).length },
    { key: "risk",       label: "Risk Matrix", labelFr: "Risques",       count: (report.risk_matrix ?? []).length },
    { key: "benchmarks", label: "Benchmarks",  labelFr: "Comparaisons" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e14]">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0e14]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/v2/dashboard")} className="text-white/25 hover:text-white/50 text-sm">
              &larr;
            </button>
            <span className="text-white/60 font-semibold text-sm">{t("Diagnostic Report","Rapport diagnostique")}</span>
            <span className="text-[10px] text-white/20 uppercase ml-1">{report.tier}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/api/v2/diagnostic/${params.id}/pdf?language=${lang}`} target="_blank"
              className="text-[10px] px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 border border-white/[0.06] transition-colors">
              PDF
            </a>
            <button onClick={() => setLang(l => l === "fr" ? "en" : "fr")}
              className="text-xs text-white/25 hover:text-white/50 px-2 py-1 rounded border border-white/[0.06]">
              {isFr ? "EN" : "FR"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Score ring + KPIs */}
        <div className="flex items-start gap-6" style={{ animation: "fadeUp .3s ease-out" }}>
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              <circle cx="48" cy="48" r="42" fill="none"
                stroke={(scores.overall ?? 0) >= 70 ? "#10b981" : (scores.overall ?? 0) >= 40 ? "#eab308" : "#ef4444"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(scores.overall ?? 0) * 2.64} 264`}
                style={{ transition: "stroke-dasharray 1.5s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{scores.overall ?? 0}</span>
              <span className="text-[8px] text-white/25 uppercase">Score</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2">
            <MiniKPI value={`$${(totals.annual_leaks ?? 0).toLocaleString()}`}    label={t("Leaks/yr","Fuites/an")}   color="text-red-400" />
            <MiniKPI value={`$${(totals.potential_savings ?? 0).toLocaleString()}`} label={t("Savings","Economies")} color="text-emerald-400" />
            <MiniKPI value={`$${(totals.programs_value ?? 0).toLocaleString()}`}  label={t("Programs","Programmes")} color="text-blue-400" />
            <MiniKPI value={`$${(totals.penalty_exposure ?? 0).toLocaleString()}`} label={t("Penalties","Penalites")} color="text-orange-400" />
          </div>
        </div>

        {/* Score bars */}
        <div className="grid grid-cols-4 gap-2" style={{ animation: "fadeUp .35s ease-out" }}>
          {([
            { key: "compliance",   label: t("Compliance","Conformite"),     color: "#3b82f6" },
            { key: "efficiency",   label: t("Efficiency","Efficacite"),     color: "#10b981" },
            { key: "optimization", label: t("Optimization","Optimisation"), color: "#8b5cf6" },
            { key: "growth",       label: t("Growth","Croissance"),         color: "#f59e0b" },
          ] as const).map(s => (
            <div key={s.key} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-white/25">{s.label}</span>
                <span className="text-xs font-bold" style={{ color: s.color }}>{(scores as any)[s.key] ?? 0}</span>
              </div>
              <div className="h-1 bg-white/[0.04] rounded-full">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(scores as any)[s.key] ?? 0}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Executive summary */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5" style={{ animation: "fadeUp .4s ease-out" }}>
          <h2 className="text-sm font-semibold text-white/60 mb-3">{t("Executive Summary","Resume executif")}</h2>
          <p className="text-xs text-white/50 leading-relaxed whitespace-pre-wrap">
            {isFr ? (report.executive_summary_fr || report.executive_summary) : report.executive_summary}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto" style={{ animation: "fadeUp .45s ease-out" }}>
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                tab === tb.key
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-white/[0.02] text-white/30 border border-transparent hover:text-white/50"
              }`}>
              {isFr ? tb.labelFr : tb.label}
              {tb.count !== undefined && <span className="text-[10px] opacity-50">{tb.count}</span>}
            </button>
          ))}
        </div>

        {/* Findings */}
        {tab === "findings" && (
          <div>
            <div className="flex gap-1 mb-3 flex-wrap">
              {["critical","high","medium","low"].map(sev => {
                const count = (report.findings ?? []).filter(f => f.severity === sev).length;
                if (!count) return null;
                const s = SEV[sev];
                return (
                  <button key={sev} onClick={() => setFilterSev(filterSev === sev ? null : sev)}
                    className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${
                      filterSev === sev ? `${s.bg} ${s.text}` : "bg-white/[0.02] text-white/20"
                    }`}>
                    {sev} ({count})
                  </button>
                );
              })}
              {filterSev && (
                <button onClick={() => setFilterSev(null)} className="text-[10px] text-white/15 hover:text-white/30 ml-1">clear</button>
              )}
            </div>

            <div className="space-y-2">
              {findings.map((f, i) => {
                const s = SEV[f.severity] || SEV.low;
                return (
                  <div key={i} className={`${s.bg} border-l-2 ${s.border} rounded-r-xl p-4`}
                    style={{ animation: `fadeUp .2s ease-out ${i * .03}s both` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${s.bg} ${s.text}`}>{f.severity}</span>
                      <span className="text-[10px] text-white/15 uppercase">{f.category}</span>
                      {f.priority && <span className="text-[10px] text-white/10 ml-auto">#{f.priority}</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-white/80 mb-1">
                      {isFr ? (f.title_fr || f.title) : f.title}
                    </h3>
                    <p className="text-xs text-white/35 leading-relaxed mb-2">
                      {isFr ? (f.description_fr || f.description) : f.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] mb-2">
                      <span className={`font-bold ${s.text}`}>
                        ${(f.impact_min ?? 0).toLocaleString()}–${(f.impact_max ?? 0).toLocaleString()}/yr
                      </span>
                      {f.timeline && <span className="text-white/15">{f.timeline}</span>}
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-emerald-400/70">
                        {isFr ? (f.recommendation_fr || f.recommendation) : f.recommendation}
                      </p>
                    </div>
                    {/* Solutions — reads from finding.solutions[] directly, zero API calls */}
                    <SolutionButtons finding={f} businessId={businessId} lang={lang} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Plan */}
        {tab === "plan" && (
          <div className="space-y-2">
            {(report.action_plan ?? []).map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"
                style={{ animation: `fadeUp .2s ease-out ${i * .04}s both` }}>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-emerald-400">{a.rank || a.priority}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white/75 mb-0.5">
                    {isFr ? (a.action_fr || a.action || a.title_fr || a.title) : (a.action || a.title)}
                  </h3>
                  <p className="text-xs text-white/30 mb-1.5">
                    {isFr ? (a.why_first_fr || a.why_first || a.description_fr || a.description)
                           : (a.why_first || a.description)}
                  </p>
                  {(a.ebitda_improvement || a.estimated_savings) && (
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      +${((a.ebitda_improvement || a.estimated_savings) ?? 0).toLocaleString()} EBITDA
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Risk Matrix */}
        {tab === "risk" && (
          <div className="space-y-2">
            {(report.risk_matrix ?? []).map((r: any, i: number) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"
                style={{ animation: `fadeUp .2s ease-out ${i * .04}s both` }}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-white/70">{isFr ? (r.area_fr || r.area) : r.area}</h3>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${RISK_BG[r.risk_level] || "bg-white/5 text-white/30"}`}>{r.risk_level}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                  <div><span className="text-white/20">{t("Likelihood","Probabilite")}:</span> <span className="text-white/40">{r.likelihood}</span></div>
                  <div><span className="text-white/20">Impact:</span> <span className="text-white/40">{r.impact}</span></div>
                </div>
                <p className="text-xs text-white/25">{isFr ? (r.current_status_fr || r.current_status) : r.current_status}</p>
                <div className="mt-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-emerald-400/60">
                    {isFr ? (r.recommendation_fr || r.recommendation) : r.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Benchmarks */}
        {tab === "benchmarks" && (
          <div className="space-y-2">
            {(report.benchmark_comparisons || []).map((b: any, i: number) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"
                style={{ animation: `fadeUp .2s ease-out ${i * .04}s both` }}>
                <h3 className="text-sm font-semibold text-white/70 mb-3">
                  {isFr ? (b.metric_name_fr || b.metric_name || b.metric_fr || b.metric) : (b.metric_name || b.metric)}
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center mb-2">
                  <div>
                    <div className="text-xs font-bold text-white/60">{b.your_value}</div>
                    <div className="text-[9px] text-white/15">{t("You","Vous")}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-400/60">{b.industry_avg}</div>
                    <div className="text-[9px] text-white/15">{t("Industry Avg","Moy. industrie")}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400/60">{b.top_quartile}</div>
                    <div className="text-[9px] text-white/15">Top 25%</div>
                  </div>
                </div>
                {/* Visual gap bar */}
                {b.your_value_raw != null && b.top_quartile_raw != null && (
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden mt-2">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, Math.max(5, (b.your_value_raw / b.top_quartile_raw) * 100))}%`,
                        background: b.status === "above" ? "#10b981" : b.status === "at" ? "#eab308" : "#ef4444",
                      }} />
                  </div>
                )}
                <p className="text-[10px] text-white/25 mt-2">{isFr ? (b.gap_fr || b.gap) : b.gap}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-white/10 pb-4">
          {t("Generated in","Genere en")} {((report.meta?.duration_ms ?? 0) / 1000).toFixed(1)}s
          &nbsp;·&nbsp;{report.meta?.model}
          &nbsp;·&nbsp;{new Date(report.meta?.created_at).toLocaleDateString(isFr ? "fr-CA" : "en-CA")}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}

function MiniKPI({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2.5 text-center">
      <div className={`text-base font-black ${color}`}>{value}</div>
      <div className="text-[9px] text-white/20 uppercase">{label}</div>
    </div>
  );
}
