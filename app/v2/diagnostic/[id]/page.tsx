// =============================================================================
// src/app/v2/diagnostic/[id]/page.tsx
// =============================================================================
// Interactive diagnostic report viewer.
// Displays: scores, executive summary, findings, action plan, risk matrix.
// Download PDF button, share functionality.
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";
import { useParams, useRouter } from "next/navigation";

interface Report {
  id: string;
  status: string;
  tier: string;
  language: string;
  scores: { overall: number; compliance: number; efficiency: number; optimization: number; growth: number };
  executive_summary: string;
  executive_summary_fr: string;
  findings: Finding[];
  action_plan: ActionItem[];
  risk_matrix: RiskItem[];
  benchmark_comparisons: Benchmark[];
  totals: { annual_leaks: number; potential_savings: number; penalty_exposure: number; programs_value: number; findings_count: number; critical_findings: number };
  prescan_context_used?: boolean;
  prescan_run_id?: string;
  goal_suggestion?: any;
  meta: { model: string; duration_ms: number; created_at: string; completed_at: string };
}

interface Finding {
  category: string; severity: string; title: string; title_fr: string;
  description: string; description_fr: string; impact_min: number; impact_max: number;
  recommendation: string; recommendation_fr: string; priority: number;
  timeline: string; difficulty: string; solution_type: string;
  partner_slugs?: string[]; program_slugs?: string[]; obligation_slug?: string;
  confirmed_from_prescan?: boolean;
  prescan_only?: boolean;
}

interface ActionItem {
  priority: number; title: string; title_fr: string;
  description: string; description_fr: string;
  estimated_savings: number; timeline: string; difficulty: string; category: string;
}

interface RiskItem {
  area: string; area_fr: string; risk_level: string; likelihood: string; impact: string;
  current_status: string; current_status_fr: string;
  recommendation: string; recommendation_fr: string;
}

interface Benchmark {
  metric: string; metric_fr: string; your_value: string; industry_avg: string;
  top_quartile: string; gap: string; gap_fr: string;
  recommendation: string; recommendation_fr: string;
}

const SEV_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-l-red-500" },
  high: { bg: "bg-orange-500/8", text: "text-orange-400", border: "border-l-orange-500" },
  medium: { bg: "bg-yellow-500/8", text: "text-yellow-400", border: "border-l-yellow-500" },
  low: { bg: "bg-blue-500/8", text: "text-blue-400", border: "border-l-blue-500" },
};

const RISK_BG: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400", high: "bg-orange-500/15 text-orange-400",
  medium: "bg-yellow-500/15 text-yellow-400", low: "bg-blue-500/15 text-blue-400",
};

type Tab = "findings" | "plan" | "risk" | "benchmarks";

export default function DiagnosticReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("findings");
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [prescanLink, setPrescanLink] = useState<any>(null);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalSaved, setGoalSaved] = useState(false);
  const [goalFormType, setGoalFormType] = useState<"accept"|"adjust"|"own"|null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [compStatus, setCompStatus] = useState<"loading"|"generating"|"ready"|"first_scan"|"hidden">("loading");
  const [compExpanded, setCompExpanded] = useState(false);
  const [findingSolutions, setFindingSolutions] = useState<Record<string, any[]>>({});
  const [lang, setLang] = useState<"en" | "fr">("en");
  const isFr = lang === "fr";
  const t = (en: string, fr: string) => isFr ? fr : en;


  // Fetch matched solutions for all finding categories (batch)
  useEffect(() => {
    if (!report?.findings?.length) return;
    const bid = (report as any).businessId ?? "";
    if (!bid) return;
    const cats = [...new Set(report.findings.map((f: any) => f.category).filter(Boolean))].slice(0, 10) as string[];
    fetch("/api/v2/solutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: bid, categories: cats }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.solutions) setFindingSolutions(d.solutions); })
      .catch(() => {});
  }, [report?.findings?.length]);

  // Poll for comparison banner (max 15 polls × 2s = 30s)
  useEffect(() => {
    if (!report?.id) return;
    let polls = 0;
    const poll = async () => {
      try {
        const res = await fetch(`/api/v2/comparisons/${report.id}`);
        if (!res.ok) { setCompStatus("hidden"); return; }
        const d = await res.json();
        if (d.status === "first_scan") { setCompStatus("first_scan"); return; }
        if (d.status === "ready") { setComparison(d.comparison); setCompStatus("ready"); return; }
        if (d.status === "generating" && polls < 15) {
          polls++;
          setTimeout(poll, 2000);
        } else {
          setCompStatus("hidden");
        }
      } catch { setCompStatus("hidden"); }
    };
    poll();
  }, [report?.id]);

  // Fetch active goal to decide whether to show suggestion
  useEffect(() => {
    if (!report?.id) return;
    const bid = (report as any).businessId ?? "";
    if (!bid) return;
    fetch(`/api/v2/goals?businessId=${bid}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.activeGoal) setActiveGoal(d.activeGoal); })
      .catch(() => {});
  }, [report?.id]);

  // Fetch prescan continuity data when report loads with prescan context
  useEffect(() => {
    if (!report?.prescan_context_used || !report?.id) return;
    fetch(`/api/v2/diagnostic/prescan-link?reportId=${report.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPrescanLink(d); })
      .catch(() => {});
  }, [report?.prescan_context_used, report?.id]);

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let pollCount = 0;

    async function load() {
      try {
        const res = await fetch(`/api/v2/diagnostic/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setReport(json.data);
          if (json.data?.language === "fr") setLang("fr");
          // If still analyzing, start polling every 4s until complete (max 3 min)
          // If status is still 'analyzing' but report is >5 min old, treat as failed
          const reportAge = json.data?.created_at
            ? Date.now() - new Date(json.data.created_at).getTime()
            : 0;
          const stale = reportAge > 5 * 60 * 1000; // 5 minutes
          if (json.data?.status === "analyzing" && !stale && !pollInterval) {
            pollInterval = setInterval(async () => {
              pollCount++;
              try {
                const pr = await fetch(`/api/v2/diagnostic/${params.id}`);
                const pd = await pr.json();
                if (pd.success && pd.data?.status === "completed") {
                  clearInterval(pollInterval!);
                  setReport(pd.data);
                } else if (pollCount >= 32 || pd.data?.status === "failed") { // 32 × 4s = 128s ≈ Vercel limit
                  clearInterval(pollInterval!);
                  setError(t("Analysis timed out. Please try again.", "Délai dépassé. Veuillez réessayer."));
                }
              } catch { clearInterval(pollInterval!); }
            }, 4000);
          }
        } else {
          setError(json.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-brand/30 border-t-brand rounded-full animate-spin mx-auto" />
          <p className="text-sm text-ink-faint">{isFr ? "Chargement du rapport..." : "Loading report..."}</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400 text-sm">{error || t("Report not found", "Rapport introuvable")}</p>
          <button onClick={() => router.push("/v2/dashboard")} className="text-xs text-brand-accent underline">
            ← {isFr ? "Retour" : "Back"}
          </button>
        </div>
      </div>
    );
  }

  if (report.status === "analyzing") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-brand/30 border-t-brand rounded-full animate-spin mx-auto" />
          <p className="text-ink text-sm font-semibold">{isFr ? "Analyse en cours..." : "Analysis in progress..."}</p>
          <p className="text-xs text-ink-faint">{isFr ? "Cela peut prendre 30-60 secondes" : "This may take 30-60 seconds"}</p>
        </div>
      </div>
    );
  }

  const scores = report.scores ?? { overall: 0, compliance: 0, efficiency: 0, growth: 0 };
  const totals = report.totals ?? { annual_leaks: 0, potential_savings: 0, programs_value: 0, penalty_exposure: 0 };
  const findings = filterSeverity
    ? (report.findings ?? []).filter((f: any) => f.severity === filterSeverity)
    : (report.findings ?? []);

  const TABS: { key: Tab; label: string; labelFr: string; count?: number }[] = [
    { key: "findings", label: "Findings", labelFr: "Constats", count: (report.findings ?? []).length },
    { key: "plan", label: t("Action Plan", "Plan d'action"), labelFr: "Plan d'action", count: ((report.action_plan as any)?.optimal_sequence ?? []).length },
    { key: "risk", label: t("Risk Matrix", "Matrice de risque"), labelFr: "Risques", count: (report.risk_matrix ?? []).length },
    { key: "benchmarks", label: t("Benchmarks", "Repères"), labelFr: "Comparaisons" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-xl border-b border-white/[0.12]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/v2/dashboard")} className="text-ink-faint hover:text-ink-faint text-sm">←</button>
            <span className="text-ink-secondary font-semibold text-sm">{isFr ? "Rapport diagnostique" : "Diagnostic Report"}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/api/v2/diagnostic/${params.id}/pdf?language=${lang}`} target="_blank"
              className="text-[10px] px-3 py-1.5 rounded-lg bg-white/[0.04] text-ink/90 hover:text-ink-secondary border border-white/[0.16] transition-colors">
              📄 PDF
            </a>
            <button onClick={() => setLang(l => l === "fr" ? "en" : "fr")}
              className="text-xs text-ink-faint hover:text-ink-faint px-2 py-1 rounded border border-white/[0.16]">
              {isFr ? "EN" : "FR"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Score Ring + KPIs */}
        <div className="flex items-start gap-6 mb-6" style={{ animation: "fadeUp 0.3s ease-out" }}>
          {/* Large score ring */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              <circle cx="48" cy="48" r="42" fill="none"
                stroke={scores.overall >= 70 ? "#10b981" : scores.overall >= 40 ? "#eab308" : "#ef4444"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${scores.overall * 2.64} 264`}
                style={{ transition: "stroke-dasharray 1.5s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-ink">{scores.overall}</span>
              <span className="text-[10px] text-ink-faint uppercase">{isFr ? "Score" : "Score"}</span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2">
            <MiniKPI value={`$${Math.round(totals.annual_leaks ?? 0).toLocaleString()}`} label={isFr ? "Fuites/an" : "Leaks/yr"} color="text-red-400" />
            <MiniKPI value={`$${Math.round(totals.potential_savings ?? 0).toLocaleString()}`} label={isFr ? "Économies" : "Savings"} color="text-brand-accent" />
            <MiniKPI value={`$${Math.round(totals.programs_value ?? 0).toLocaleString()}`} label={isFr ? "Programmes" : t("Programs", "Programmes")} color="text-blue-400" />
            <MiniKPI value={`$${Math.round(totals.penalty_exposure ?? 0).toLocaleString()}`} label={isFr ? "Pénalités" : "Penalties"} color="text-orange-400" />
          </div>
        </div>

        {/* 4 Score bars */}
        <div className="grid grid-cols-4 gap-2 mb-6" style={{ animation: "fadeUp 0.35s ease-out" }}>
          {([
            { key: "compliance", label: isFr ? "Conformité" : "Compliance", color: "#3b82f6" },
            { key: "efficiency", label: isFr ? "Efficacité" : "Efficiency", color: "#10b981" },
            { key: "optimization", label: isFr ? "Optimisation" : "Optimization", color: "#8b5cf6" },
            { key: "growth", label: isFr ? "Croissance" : "Growth", color: "#f59e0b" },
          ] as const).map(s => (
            <div key={s.key} className="bg-white/[0.06] border border-white/[0.14] rounded-xl px-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-ink-faint">{s.label}</span>
                <span className="text-xs font-bold" style={{ color: s.color }}>{(scores as any)[s.key]}</span>
              </div>
              <div className="h-1 bg-white/[0.04] rounded-full">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: (scores as any)[s.key] + "%", background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Executive Summary */}
        <div className="bg-white/[0.06] border border-white/[0.14] rounded-xl p-5 mb-6" style={{ animation: "fadeUp 0.4s ease-out" }}>
          <h2 className="text-sm font-semibold text-ink-secondary mb-3">{isFr ? "Résumé exécutif" : "Executive Summary"}</h2>
          <p className="text-xs text-ink-secondary leading-relaxed whitespace-pre-wrap">
            {isFr ? (report.executive_summary_fr || report.executive_summary) : report.executive_summary}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto" style={{ animation: "fadeUp 0.45s ease-out" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                tab === t.key
                  ? "bg-brand/10 text-brand-accent border border-brand/20"
                  : "bg-white/[0.06] text-ink-faint border border-transparent hover:text-ink-faint"
              }`}>
              {isFr ? t.labelFr : t.label}
              {t.count !== undefined && <span className="text-[10px] opacity-50">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Findings Tab */}
        {tab === "findings" && (
          <div>
            {/* Severity filter */}
            <div className="flex gap-1 mb-3">
              {["critical", "high", "medium", "low"].map(sev => {
                const count = (report.findings ?? []).filter((f: any) => f.severity === sev).length;
                if (count === 0) return null;
                const st = SEV_STYLE[sev];
                return (
                  <button key={sev} onClick={() => setFilterSeverity(filterSeverity === sev ? null : sev)}
                    className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${
                      filterSeverity === sev ? `${st.bg} ${st.text}` : "bg-white/[0.06] text-ink/85"
                    }`}>
                    {sev} ({count})
                  </button>
                );
              })}
              {filterSeverity && (
                <button onClick={() => setFilterSeverity(null)} className="text-[10px] text-ink/55 hover:text-ink-faint ml-1">✕</button>
              )}
            </div>




            {/* Comparison banner — animates in after page load */}
            {compStatus === "ready" && comparison && (
              <div className="mb-4 rounded-xl border overflow-hidden"
                style={{ borderColor: "rgba(27,58,45,0.2)", background: "rgba(27,58,45,0.03)", animation: "fadeUp 0.4s ease-out both" }}>
                <div className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ borderColor: "rgba(27,58,45,0.12)", background: "rgba(27,58,45,0.06)" }}>
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#1B3A2D" }}>
                      {isFr ? `DEPUIS VOTRE DERNIER SCAN (${comparison.days_between_scans} jours)` : `SINCE YOUR LAST SCAN (${comparison.days_between_scans} days ago)`}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  {comparison.comparison_headline && (
                    <p className="text-[13px] font-bold text-ink mb-2">&ldquo;{comparison.comparison_headline}&rdquo;</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                    <div>
                      <p className="text-[11px] text-ink-muted uppercase tracking-wider mb-0.5">Score</p>
                      <p className="text-[12px] font-bold" style={{ color: (comparison.score_delta ?? 0) > 0 ? "#2D7A50" : (comparison.score_delta ?? 0) < 0 ? "#C4841D" : "#8E8C85" }}>
                        {comparison.previous_score} → {comparison.new_score}
                        {(comparison.score_delta ?? 0) !== 0 && ` (${comparison.score_delta > 0 ? "+" : ""}${comparison.score_delta})`}
                        {(comparison.score_delta ?? 0) > 0 ? " ↑" : (comparison.score_delta ?? 0) < 0 ? " ↓" : ""}
                      </p>
                    </div>
                    {comparison.savings_recovered_monthly > 0 && (
                      <div>
                        <p className="text-[11px] text-ink-muted uppercase tracking-wider mb-0.5">{isFr ? "Récupéré" : "Fixed"}</p>
                        <p className="text-[12px] font-bold text-positive">+${(comparison.savings_recovered_monthly ?? 0).toLocaleString()}/mo</p>
                      </div>
                    )}
                    {comparison.findings_new_count > 0 && (
                      <div>
                        <p className="text-[11px] text-ink-muted uppercase tracking-wider mb-0.5">{isFr ? "Nouveaux" : "New"}</p>
                        <p className="text-[12px] font-bold" style={{ color: "#C4841D" }}>{comparison.findings_new_count} ⚠️</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] text-ink-muted uppercase tracking-wider mb-0.5">Net</p>
                      <p className="text-[12px] font-bold" style={{ color: (comparison.net_monthly_improvement ?? 0) >= 0 ? "#2D7A50" : "#C4841D" }}>
                        {(comparison.net_monthly_improvement ?? 0) >= 0 ? "+" : ""}${(comparison.net_monthly_improvement ?? 0).toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setCompExpanded(!compExpanded)}
                    className="text-[10px] font-semibold text-brand hover:underline">
                    {compExpanded ? (isFr ? "Masquer ▲" : "Hide ▲") : (isFr ? "Voir le détail ▾" : "See detailed comparison ▾")}
                  </button>
                  {compExpanded && comparison.comparison_narrative && (
                    <p className="mt-2 text-[12px] text-ink leading-relaxed">{comparison.comparison_narrative}</p>
                  )}
                </div>
              </div>
            )}
            {compStatus === "generating" && (
              <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl border border-border-light">
                <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin shrink-0" />
                <p className="text-[11px] text-ink-faint">{isFr ? "Comparaison avec votre dernier scan…" : "Comparing with your previous scan…"}</p>
              </div>
            )}

            {/* Goal suggestion card — shown when no active goal and report has a suggestion */}
            {report?.goal_suggestion && !activeGoal && !goalSaved && (
              <div className="mb-4 rounded-xl border overflow-hidden"
                style={{ borderColor: "rgba(27,58,45,0.2)", background: "rgba(27,58,45,0.03)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(27,58,45,0.12)", background: "rgba(27,58,45,0.06)" }}>
                  <div className="flex items-center gap-2">
                    
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#1B3A2D" }}>
                      {isFr ? "OBJECTIF SUGGÉRÉ SUR 90 JOURS" : "SUGGESTED 90-DAY GOAL"}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  {!showGoalForm ? (
                    <>
                      <p className="text-[14px] font-black text-ink mb-1">
                        &ldquo;{report.goal_suggestion.goal_title}&rdquo;
                      </p>
                      {report.goal_suggestion.goal_description && (
                        <p className="text-[11px] text-ink/85 mb-2 leading-relaxed">
                          {report.goal_suggestion.goal_description}
                        </p>
                      )}
                      {report.goal_suggestion.suggestion_rationale && (
                        <p className="text-[10px] text-ink/90 italic mb-3">
                          {report.goal_suggestion.suggestion_rationale}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            const bid = (report as any).businessId ?? "";
                            if (!bid) return;
                            const res = await fetch("/api/v2/goals", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                businessId: bid,
                                goal: { ...report.goal_suggestion, source_report_id: report.id },
                              }),
                            });
                            if (res.ok) setGoalSaved(true);
                          }}
                          className="px-3 py-1.5 text-[11px] font-bold text-white rounded-lg hover:opacity-90 transition"
                          style={{ background: "#1B3A2D" }}>
                          {isFr ? "Accepter cet objectif ✓" : "Accept this goal ✓"}
                        </button>
                        <button onClick={() => setShowGoalForm(true)}
                          className="px-3 py-1.5 text-[11px] font-semibold text-ink-muted border border-border-light rounded-lg hover:bg-bg-section transition">
                          {isFr ? "Ajuster" : "Adjust"}
                        </button>
                        <button onClick={() => setGoalSaved(true)}
                          className="px-3 py-1.5 text-[11px] text-ink-faint hover:text-ink transition">
                          {isFr ? "Ignorer" : "Dismiss"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-ink-faint">
                      {isFr ? "Rendez-vous sur votre tableau de bord pour définir un objectif personnalisé." :
                       "Head to your dashboard to set a custom goal."}
                      <a href="/v2/dashboard" className="ml-1 text-brand font-semibold hover:underline">
                        {isFr ? "Tableau de bord →" : "Dashboard →"}
                      </a>
                    </p>
                  )}
                  {goalSaved && (
                    <p className="text-[11px] font-semibold text-positive">
                      ✅ {isFr ? "Objectif enregistré — visible sur votre tableau de bord." : "Goal saved — visible on your dashboard."}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Prescan continuity banner */}
            {report?.prescan_context_used && (
              <div className="mb-4 rounded-xl p-4"
                style={{ background: "rgba(196,132,29,0.07)", border: "1px solid rgba(196,132,29,0.2)" }}>
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">🔍</span>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-amber-700 mb-1 uppercase tracking-wider">
                      {isFr ? "Continuité avec votre analyse initiale" : "Continuity with your initial scan"}
                    </p>
                    {prescanLink ? (
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-3 text-[11px]">
                          <span className="text-ink/90">
                            {isFr ? "Analyse initiale :" : "Initial scan flagged:"}{" "}
                            <strong>{(prescanLink.leaks_confirmed ?? 0) + (prescanLink.leaks_not_found ?? 0)} {isFr ? "problèmes" : "issues"}</strong>
                          </span>
                          <span className="text-green-700">
                            ✅ {isFr ? "Confirmés :" : "Confirmed:"} <strong>{prescanLink.leaks_confirmed ?? 0}</strong>
                          </span>
                          {(prescanLink.leaks_new ?? 0) > 0 && (
                            <span className="text-blue-700">
                              🔵 {isFr ? "Nouvelles découvertes :" : "New discoveries:"} <strong>{prescanLink.leaks_new}</strong>
                            </span>
                          )}
                        </div>
                        {prescanLink.continuity_narrative && (
                          <p className="text-[11px] text-ink/85 italic mt-1">&ldquo;{prescanLink.continuity_narrative}&rdquo;</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-ink/80">
                        {isFr
                          ? "Ce diagnostic intègre les données de votre analyse initiale."
                          : "This diagnostic incorporated data from your initial scan."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {findings.map((f, i) => {
                const st = SEV_STYLE[f.severity] || SEV_STYLE.low;
                return (
                  <div key={i} className={`${st.bg} border-l-2 ${st.border} rounded-r-xl p-4`}
                    style={{ animation: `fadeUp 0.2s ease-out ${i * 0.03}s both` }}>

                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${st.bg} ${st.text}`}>{f.severity}</span>
                      <span className="text-[10px] text-ink/55 uppercase">{f.category}</span>
                      {f.confirmed_from_prescan && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(196,132,29,0.12)", color: "#C4841D" }}>
                          ✓ {isFr ? "Confirmé depuis l'analyse initiale" : "Confirmed from initial scan"}
                        </span>
                      )}
                      {!f.confirmed_from_prescan && report?.prescan_context_used && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(59,130,246,0.10)", color: "#3B82F6" }}>
                          {isFr ? "Nouvelle découverte" : "New — not in initial scan"}
                        </span>
                      )}
                      <span className="text-[10px] text-ink/80 ml-auto">#{f.priority}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-ink mb-1">
                      {isFr ? (f.title_fr || f.title) : f.title}
                    </h3>
                    <p className="text-xs text-ink/90 leading-relaxed mb-2">
                      {isFr ? (f.description_fr || f.description) : f.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] mb-2">
                      <span className={`font-bold ${st.text}`}>💰 ${(f.impact_min ?? 0).toLocaleString()}–${(f.impact_max ?? 0).toLocaleString()}/yr</span>
                      <span className="text-ink/55">⏱ {f.timeline}</span>
                      <span className="text-ink/55">📊 {f.difficulty}</span>
                      <span className="text-ink/80">{f.solution_type}</span>
                    </div>
                    <div className="bg-brand/5 border border-brand/10 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-brand-accent">
                        ✅ {isFr ? (f.recommendation_fr || f.recommendation) : f.recommendation}
                      </p>
                    </div>
                    {/* Matched solutions for this finding */}
                    {findingSolutions[f.category]?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border-light">
                        <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                          isFr ? "Solutions pour ce constat" : "Solutions for this finding"
                        </p>
                        <div className="space-y-1">
                          {findingSolutions[f.category].slice(0, 2).map((s: any, si: number) => (
                            <div key={si} className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-ink-muted truncate">
                                → {s.name}{s.savings_estimate ? ` — ${s.savings_estimate}` : ""}
                              </span>
                              <button
                                className="text-[11px] font-bold text-brand shrink-0 hover:underline"
                                onClick={() => {
                                  fetch("/api/v2/solutions/click", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ solutionId: s.id, solutionName: s.name, url: s.url, source: "diagnostic" }),
                                  }).catch(() => {});
                                  window.open(s.url, "_blank", "noopener noreferrer");
                                }}>
                                {isFr ? "En savoir plus →" : "Learn more →"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Plan Tab */}
        {tab === "plan" && (
          <div className="space-y-2">
            {((report.action_plan as any)?.optimal_sequence ?? []).map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.06] border border-white/[0.14] rounded-xl p-4"
                style={{ animation: `fadeUp 0.2s ease-out ${i * 0.04}s both` }}>
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-accent">{a.priority}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-ink/90 mb-0.5">
                    {isFr ? (a.title_fr || a.title) : a.title}
                  </h3>
                  <p className="text-xs text-ink-muted mb-1.5">
                    {isFr ? (a.description_fr || a.description) : a.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-brand-accent font-semibold">${(a.estimated_savings ?? 0).toLocaleString()}</span>
                    <span className="text-ink/55">{a.timeline}</span>
                    <span className="text-ink/80">{a.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Risk Matrix Tab */}
        {tab === "risk" && (
          <div className="space-y-2">
            {(report.risk_matrix ?? []).map((r: any, i: number) => (
              <div key={i} className="bg-white/[0.06] border border-white/[0.14] rounded-xl p-4"
                style={{ animation: `fadeUp 0.2s ease-out ${i * 0.04}s both` }}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-ink-secondary">{isFr ? (r.area_fr || r.area) : r.area}</h3>
                  <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${RISK_BG[r.risk_level] || "bg-bg-section text-ink-faint"}`}>{r.risk_level}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                  <div><span className="text-ink/85">{isFr ? "Probabilité" : "Likelihood"}:</span> <span className="text-ink/90">{r.likelihood}</span></div>
                  <div><span className="text-ink/85">{isFr ? "Impact" : "Impact"}:</span> <span className="text-ink/90">{r.impact}</span></div>
                </div>
                <p className="text-xs text-ink-faint">{isFr ? (r.current_status_fr || r.current_status) : r.current_status}</p>
                <div className="mt-2 bg-brand/5 border border-brand/10 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-brand-accent">
                    {isFr ? (r.recommendation_fr || r.recommendation) : r.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Benchmarks Tab */}
        {tab === "benchmarks" && (
          <div className="space-y-2">
            {(report.benchmark_comparisons || []).map((b, i) => (
              <div key={i} className="bg-white/[0.06] border border-white/[0.14] rounded-xl p-4"
                style={{ animation: `fadeUp 0.2s ease-out ${i * 0.04}s both` }}>
                <h3 className="text-sm font-semibold text-ink-secondary mb-2">{isFr ? (b.metric_fr || b.metric) : b.metric}</h3>
                <div className="grid grid-cols-3 gap-3 text-center mb-2">
                  <div><div className="text-xs font-bold text-ink-secondary">{b.your_value}</div><div className="text-[11px] text-ink/55">{isFr ? "Vous" : "You"}</div></div>
                  <div><div className="text-xs font-bold text-blue-400/60">{b.industry_avg}</div><div className="text-[11px] text-ink/55">{isFr ? "Moy. industrie" : "Industry Avg"}</div></div>
                  <div><div className="text-xs font-bold text-brand-accent">{(b as any).top_quartile || (b as any).top_performer}</div><div className="text-[11px] text-ink/55">{isFr ? "Top 25%" : "Top 25%"}</div></div>
                </div>
                <p className="text-[10px] text-ink-faint">{isFr ? (b.gap_fr || b.gap) : b.gap}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer meta */}
        <div className="text-center text-[10px] text-ink/80 mt-8 pb-4">
          {isFr ? "Généré en" : "Generated in"} {((report.meta?.duration_ms ?? 0) / 1000).toFixed(1)}s ·
          {report.meta?.model} ·
          {new Date(report.meta?.created_at).toLocaleDateString(isFr ? "fr-CA" : "en-CA")}
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
    <div className="bg-white/[0.06] border border-white/[0.14] rounded-xl px-3 py-2.5 text-center">
      <div className={`text-base font-black ${color}`}>{value}</div>
      <div className="text-[11px] text-ink/85 uppercase">{label}</div>
    </div>
  );
}