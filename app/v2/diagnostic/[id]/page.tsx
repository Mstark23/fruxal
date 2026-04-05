// =============================================================================
// src/app/v2/diagnostic/[id]/page.tsx
// =============================================================================
// Interactive diagnostic report viewer.
// Displays: scores, executive summary, findings, action plan, risk matrix.
// Download PDF button, share functionality, CSV export.
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
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
  critical: { bg: "bg-[#B34040]/[0.08]", text: "text-[#B34040]", border: "border-l-[#B34040]" },
  high: { bg: "bg-[#C4841D]/[0.08]", text: "text-[#C4841D]", border: "border-l-[#C4841D]" },
  medium: { bg: "bg-[#0369a1]/[0.08]", text: "text-[#0369a1]", border: "border-l-[#0369a1]" },
  low: { bg: "bg-[#8E8C85]/[0.08]", text: "text-[#8E8C85]", border: "border-l-[#8E8C85]" },
};

const RISK_COLOR: Record<string, string> = {
  critical: "#B34040", high: "#C4841D", medium: "#0369a1", low: "#8E8C85",
};

type Tab = "findings" | "plan" | "risk" | "benchmarks";

/* ---- helper: parse numeric from benchmark string like "3.2%" or "$1,200" ---- */
function parseNumeric(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.\-]/g, "");
  return parseFloat(cleaned) || 0;
}

/* ---- helper: map likelihood/impact string to grid index ---- */
function riskAxisIndex(val: string): number {
  const v = (val || "").toLowerCase();
  if (v === "very low" || v === "minimal") return 0;
  if (v === "low") return 1;
  if (v === "medium" || v === "moderate") return 2;
  if (v === "high") return 3;
  if (v === "very high" || v === "critical" || v === "severe") return 4;
  return 2; // default to medium
}

export default function DiagnosticReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("findings");
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [prescanLink, setPrescanLink] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [compStatus, setCompStatus] = useState<"loading"|"generating"|"ready"|"first_scan"|"hidden">("loading");
  const [compExpanded, setCompExpanded] = useState(false);
  const [findingSolutions, setFindingSolutions] = useState<Record<string, any[]>>({});
  const [expandedFindings, setExpandedFindings] = useState<Set<number>>(new Set());
  const [shareCopied, setShareCopied] = useState(false);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const isFr = lang === "fr";
  const t = (en: string, fr: string) => isFr ? fr : en;

  const toggleFinding = useCallback((idx: number) => {
    setExpandedFindings(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, []);

  const exportCSV = useCallback(() => {
    if (!report?.findings) return;
    const rows = [["Severity","Priority","Title","Category","Impact Min","Impact Max","Timeline","Difficulty"]];
    (report.findings ?? []).forEach(f => {
      rows.push([
        f.severity,
        String(f.priority),
        isFr ? (f.title_fr || f.title) : f.title,
        f.category,
        String(f.impact_min ?? 0),
        String(f.impact_max ?? 0),
        f.timeline,
        f.difficulty,
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `diagnostic-findings-${report.id}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [report, isFr]);

  // Fetch matched solutions for all finding categories (batch)
  // Solutions are rep-only -- not fetched for customer view
  useEffect(() => {}, []);

  // Poll for comparison banner (max 15 polls x 2s = 30s)
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
                } else if (pollCount >= 32 || pd.data?.status === "failed") { // 32 x 4s = 128s ~ Vercel limit
                  clearInterval(pollInterval!);
                  setError(t("Analysis timed out. Please try again.", "Delai depasse. Veuillez reessayer."));
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
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="relative w-10 h-10 mx-auto">
            <div className="absolute inset-0 rounded-[10px] border-2 border-[#1B3A2D]/20 border-t-[#1B3A2D] animate-spin" style={{ animationDuration: "1.2s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2.2" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
            </div>
          </div>
          <p className="text-sm text-[#8E8C85]">{isFr ? "Chargement du rapport..." : "Loading report..."}</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-[#B34040] text-sm">{error || t("Report not found", "Rapport introuvable")}</p>
          <button onClick={() => router.push("/v2/dashboard")} className="text-xs text-[#1B3A2D] underline">
            &larr; {isFr ? "Retour" : "Back"}
          </button>
        </div>
      </div>
    );
  }

  if (report.status === "analyzing") {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-[12px] border-2 border-[#1B3A2D]/20 border-t-[#1B3A2D] animate-spin" style={{ animationDuration: "1.2s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2.2" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
            </div>
          </div>
          <p className="text-[#1A1A18] text-sm font-semibold">{isFr ? "Fruxal analyse votre entreprise..." : "Fruxal is analyzing your business..."}</p>
          <p className="text-xs text-[#8E8C85]">{isFr ? "Cela peut prendre 30-60 secondes" : "This may take 30-60 seconds"}</p>
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
    { key: "findings", label: "Leaks Found", labelFr: "Fuites detectees", count: (report.findings ?? []).length },
    { key: "plan", label: t("Recovery Sequence", "Sequence de recuperation"), labelFr: "Sequence de recuperation", count: ((report.action_plan as any)?.optimal_sequence ?? []).length },
    { key: "risk", label: t("Risk Matrix", "Matrice de risque"), labelFr: "Risques", count: (report.risk_matrix ?? []).length },
    { key: "benchmarks", label: t("Benchmarks", "Reperes"), labelFr: "Comparaisons" },
  ];

  // Build risk matrix grid data
  const riskGrid: { row: number; col: number; items: RiskItem[] }[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => ({ row: 0, col: 0, items: [] as RiskItem[] }))
  );
  (report.risk_matrix ?? []).forEach(r => {
    const row = 4 - riskAxisIndex(r.likelihood); // invert so high is top
    const col = riskAxisIndex(r.impact);
    if (riskGrid[row] && riskGrid[row][col]) {
      riskGrid[row][col].items.push(r);
    }
  });

  const axisLabels = [
    isFr ? "Tres bas" : "Very Low",
    isFr ? "Bas" : "Low",
    isFr ? "Moyen" : "Medium",
    isFr ? "Eleve" : "High",
    isFr ? "Tres eleve" : "Very High",
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E3DD]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/v2/dashboard")} className="text-[#8E8C85] hover:text-[#56554F] text-sm">&larr;</button>
            <span className="text-[#56554F] font-semibold text-sm">{isFr ? "Rapport diagnostique" : "Diagnostic Report"}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/api/v2/diagnostic/${params.id}/pdf?language=${lang}`} target="_blank"
              className="text-[10px] px-3 py-1.5 rounded-lg bg-white text-[#56554F] hover:text-[#1A1A18] border border-[#E5E3DD] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{display:"inline",marginRight:4}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF
            </a>
            <button onClick={handleShare}
              className="text-[10px] px-3 py-1.5 rounded-lg bg-white text-[#56554F] hover:text-[#1A1A18] border border-[#E5E3DD] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{display:"inline",marginRight:4}}><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              {shareCopied ? (isFr ? "Copie!" : "Copied!") : (isFr ? "Partager" : "Share")}
            </button>
            <button onClick={() => setLang(l => l === "fr" ? "en" : "fr")}
              className="text-xs text-[#8E8C85] hover:text-[#56554F] px-2 py-1 rounded border border-[#E5E3DD]">
              {isFr ? "EN" : "FR"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-[#8E8C85] mb-5" style={{ animation: "fadeUp 0.25s ease-out" }}>
          <button onClick={() => router.push("/v2/dashboard")} className="hover:text-[#56554F] transition-colors">
            {isFr ? "Tableau de bord" : "Dashboard"}
          </button>
          <span className="text-[#B5B3AD]">&rsaquo;</span>
          <span className="text-[#56554F] font-medium">{isFr ? "Rapport diagnostique" : "Diagnostic Report"}</span>
        </nav>

        {/* Score Ring + KPIs */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6" style={{ animation: "fadeUp 0.3s ease-out" }}>
          {/* Large score ring */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="none" stroke="#F0EFEB" strokeWidth="6" />
              <circle cx="48" cy="48" r="42" fill="none"
                stroke={scores.overall >= 70 ? "#10b981" : scores.overall >= 40 ? "#eab308" : "#ef4444"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${scores.overall * 2.64} 264`}
                style={{ transition: "stroke-dasharray 1.5s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#1A1A18]">{scores.overall}</span>
              <span className="text-[10px] text-[#8E8C85] uppercase">{isFr ? "Score" : "Score"}</span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
            <MiniKPI value={`$${Math.round(totals.annual_leaks ?? 0).toLocaleString()}`} label={isFr ? "Fuites/an" : "Leaks/yr"} color="text-[#B34040]" />
            <MiniKPI value={`$${Math.round(totals.potential_savings ?? 0).toLocaleString()}`} label={isFr ? "Economies" : "Savings"} color="text-[#1B3A2D]" />
            <MiniKPI value={`$${Math.round(totals.programs_value ?? 0).toLocaleString()}`} label={isFr ? "Programmes" : t("Programs", "Programmes")} color="text-[#0369a1]" />
            <MiniKPI value={`$${Math.round(totals.penalty_exposure ?? 0).toLocaleString()}`} label={isFr ? "Penalites" : "Penalties"} color="text-[#C4841D]" />
          </div>
        </div>

        {/* 4 Score bars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6" style={{ animation: "fadeUp 0.35s ease-out" }}>
          {([
            { key: "compliance", label: isFr ? "Risque conformite" : "Compliance Risk", color: "#3b82f6" },
            { key: "efficiency", label: isFr ? "Sante financiere" : "Financial Health", color: "#10b981" },
            { key: "optimization", label: isFr ? "Optimisation tarifs" : "Pricing Health", color: "#8b5cf6" },
            { key: "growth", label: isFr ? "Pret a croitre" : "Growth Readiness", color: "#f59e0b" },
          ] as const).map(s => (
            <div key={s.key} className="bg-white border border-[#E5E3DD] rounded-xl px-3 py-2"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#8E8C85]">{s.label}</span>
                <span className="text-xs font-bold" style={{ color: s.color }}>{(scores as any)[s.key]}</span>
              </div>
              <div className="h-1 bg-[#F0EFEB] rounded-full">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: (scores as any)[s.key] + "%", background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Executive Summary */}
        <div className="bg-white border border-[#E5E3DD] rounded-xl p-5 mb-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", animation: "fadeUp 0.4s ease-out" }}>
          <h2 className="text-sm font-semibold text-[#1A1A18] mb-3">{isFr ? "Votre situation en clair" : "Here's your situation, clearly"}</h2>
          <p className="text-xs text-[#56554F] leading-relaxed whitespace-pre-wrap">
            {isFr ? (report.executive_summary_fr || report.executive_summary) : report.executive_summary}
          </p>
        </div>

        {/* Rep context note */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.10)", animation: "fadeUp 0.45s ease-out" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className="text-[11px] text-[#56554F] leading-relaxed">
            {isFr
              ? "Votre rep examinera ce rapport avec vous lors de votre appel. Vous n'avez rien a faire avec ces resultats -- ils s'en occupent."
              : "Your rep will review this report with you on your call. You don't need to do anything with these findings -- they handle it."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto" style={{ animation: "fadeUp 0.45s ease-out" }}>
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                tab === tb.key
                  ? "bg-[#1B3A2D]/10 text-[#1B3A2D]"
                  : "bg-[#F0EFEB] text-[#8E8C85] hover:text-[#56554F]"
              }`}>
              {isFr ? tb.labelFr : tb.label}
              {tb.count !== undefined && <span className="text-[10px] opacity-50">{tb.count}</span>}
            </button>
          ))}
        </div>

        {/* ======================== FINDINGS TAB ======================== */}
        {tab === "findings" && (
          <div>
            {/* Severity filter + CSV export */}
            <div className="flex items-center gap-1 mb-3 flex-wrap">
              {["critical", "high", "medium", "low"].map(sev => {
                const count = (report.findings ?? []).filter((f: any) => f.severity === sev).length;
                if (count === 0) return null;
                const st = SEV_STYLE[sev];
                return (
                  <button key={sev} onClick={() => setFilterSeverity(filterSeverity === sev ? null : sev)}
                    className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${
                      filterSeverity === sev ? `${st.bg} ${st.text} font-semibold` : "bg-[#F0EFEB] text-[#56554F]"
                    }`}>
                    {{
                      critical: isFr ? `Urgent (${count})` : `Urgent (${count})`,
                      high: isFr ? `Bientot (${count})` : `High (${count})`,
                      medium: isFr ? `Planifier (${count})` : `Medium (${count})`,
                      low: isFr ? `Bon a savoir (${count})` : `Good to Know (${count})`,
                    }[sev]}
                  </button>
                );
              })}
              {filterSeverity && (
                <button onClick={() => setFilterSeverity(null)} className="text-[10px] text-[#8E8C85] hover:text-[#56554F] ml-1">&times;</button>
              )}
              <button onClick={exportCSV}
                className="ml-auto text-[10px] px-2.5 py-1 rounded-md bg-white border border-[#E5E3DD] text-[#56554F] hover:text-[#1A1A18] transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{display:"inline",marginRight:3}}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {isFr ? "Exporter CSV" : "Export CSV"}
              </button>
            </div>

            {/* Comparison banner */}
            {compStatus === "ready" && comparison && (
              <div className="mb-4 rounded-xl border overflow-hidden bg-white"
                style={{ borderColor: "rgba(27,58,45,0.15)", animation: "fadeUp 0.4s ease-out both" }}>
                <div className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ borderColor: "rgba(27,58,45,0.10)", background: "rgba(27,58,45,0.04)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B3A2D]">
                      {isFr ? `DEPUIS VOTRE DERNIER SCAN (${comparison.days_between_scans} jours)` : `SINCE YOUR LAST SCAN (${comparison.days_between_scans} days ago)`}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  {comparison.comparison_headline && (
                    <p className="text-[13px] font-bold text-[#1A1A18] mb-2">&ldquo;{comparison.comparison_headline}&rdquo;</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                    <div>
                      <p className="text-[11px] text-[#8E8C85] uppercase tracking-wider mb-0.5">Score</p>
                      <p className="text-[12px] font-bold" style={{ color: (comparison.score_delta ?? 0) > 0 ? "#1B3A2D" : (comparison.score_delta ?? 0) < 0 ? "#C4841D" : "#8E8C85" }}>
                        {comparison.previous_score} &rarr; {comparison.new_score}
                        {(comparison.score_delta ?? 0) !== 0 && ` (${comparison.score_delta > 0 ? "+" : ""}${comparison.score_delta})`}
                        {(comparison.score_delta ?? 0) > 0 ? " ↑" : (comparison.score_delta ?? 0) < 0 ? " ↓" : ""}
                      </p>
                    </div>
                    {comparison.savings_recovered_monthly > 0 && (
                      <div>
                        <p className="text-[11px] text-[#8E8C85] uppercase tracking-wider mb-0.5">{isFr ? "Recupere" : "Recovered"}</p>
                        <p className="text-[12px] font-bold text-[#1B3A2D]">+${(comparison.savings_recovered_monthly ?? 0).toLocaleString()}/mo</p>
                      </div>
                    )}
                    {comparison.findings_new_count > 0 && (
                      <div>
                        <p className="text-[11px] text-[#8E8C85] uppercase tracking-wider mb-0.5">{isFr ? "Nouveaux" : "New"}</p>
                        <p className="text-[12px] font-bold text-[#C4841D]">{comparison.findings_new_count} new</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] text-[#8E8C85] uppercase tracking-wider mb-0.5">Net</p>
                      <p className="text-[12px] font-bold" style={{ color: (comparison.net_monthly_improvement ?? 0) >= 0 ? "#1B3A2D" : "#C4841D" }}>
                        {(comparison.net_monthly_improvement ?? 0) >= 0 ? "+" : ""}${(comparison.net_monthly_improvement ?? 0).toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setCompExpanded(!compExpanded)}
                    className="text-[10px] font-semibold text-[#1B3A2D] hover:underline">
                    {compExpanded ? (isFr ? "Masquer ▲" : "Hide ▲") : (isFr ? "Voir le detail ▾" : "See detailed comparison ▾")}
                  </button>
                  {compExpanded && comparison.comparison_narrative && (
                    <p className="mt-2 text-[12px] text-[#56554F] leading-relaxed">{comparison.comparison_narrative}</p>
                  )}
                </div>
              </div>
            )}
            {compStatus === "generating" && (
              <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#E5E3DD]">
                <div className="w-4 h-4 border-2 border-[#1B3A2D]/30 border-t-[#1B3A2D] rounded-full animate-spin shrink-0" />
                <p className="text-[11px] text-[#8E8C85]">{isFr ? "Comparaison avec votre dernier scan..." : "Comparing with your previous scan..."}</p>
              </div>
            )}

            {/* Prescan continuity banner */}
            {report?.prescan_context_used && (
              <div className="mb-4 rounded-xl p-4 bg-white"
                style={{ border: "1px solid rgba(196,132,29,0.2)" }}>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 shrink-0 text-[#C4841D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-[#C4841D] mb-1 uppercase tracking-wider">
                      {isFr ? "Continuite avec votre analyse initiale" : "Continuity with your initial scan"}
                    </p>
                    {prescanLink ? (
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-3 text-[11px]">
                          <span className="text-[#56554F]">
                            {isFr ? "Analyse initiale :" : "Initial scan flagged:"}{" "}
                            <strong>{(prescanLink.leaks_confirmed ?? 0) + (prescanLink.leaks_not_found ?? 0)} {isFr ? "problemes" : "issues"}</strong>
                          </span>
                          <span className="text-[#1B3A2D]">
                            {isFr ? "Confirmes :" : "Confirmed:"} <strong>{prescanLink.leaks_confirmed ?? 0}</strong>
                          </span>
                          {(prescanLink.leaks_new ?? 0) > 0 && (
                            <span className="text-[#0369a1]">
                              {isFr ? "Nouvelles decouvertes :" : "New discoveries:"} <strong>{prescanLink.leaks_new}</strong>
                            </span>
                          )}
                        </div>
                        {prescanLink.continuity_narrative && (
                          <p className="text-[11px] text-[#56554F] italic mt-1">&ldquo;{prescanLink.continuity_narrative}&rdquo;</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#56554F]">
                        {isFr
                          ? "Ce diagnostic integre les donnees de votre analyse initiale."
                          : "This diagnostic incorporated data from your initial scan."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Finding cards -- collapsible */}
            <div className="space-y-2">
              {findings.map((f, i) => {
                const st = SEV_STYLE[f.severity] || SEV_STYLE.low;
                const isExpanded = expandedFindings.has(i);
                return (
                  <div key={i} className={`bg-white border border-[#E5E3DD] border-l-2 ${st.border} rounded-r-xl overflow-hidden`}
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", animation: `fadeUp 0.2s ease-out ${i * 0.03}s both` }}>

                    {/* Collapsed summary -- always visible, clickable */}
                    <button
                      onClick={() => toggleFinding(i)}
                      className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-[#FAFAF8] transition-colors"
                    >
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${st.bg} ${st.text} shrink-0`}>{f.severity}</span>
                      <h3 className="text-sm font-semibold text-[#1A1A18] flex-1 min-w-0 truncate">
                        {isFr ? (f.title_fr || f.title) : f.title}
                      </h3>
                      {f.confirmed_from_prescan && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: "rgba(196,132,29,0.10)", color: "#C4841D" }}>
                          &#10003; {isFr ? "Confirme" : "Confirmed"}
                        </span>
                      )}
                      {!f.confirmed_from_prescan && report?.prescan_context_used && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: "rgba(3,105,161,0.08)", color: "#0369a1" }}>
                          {isFr ? "Nouveau" : "New"}
                        </span>
                      )}
                      <span className={`text-[11px] font-bold ${st.text} shrink-0`}>
                        ${(f.impact_min ?? 0).toLocaleString()}&ndash;${(f.impact_max ?? 0).toLocaleString()}/yr
                      </span>
                      {/* Chevron */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8C85" strokeWidth="2" strokeLinecap="round"
                        className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[#F0EFEB]">
                        <div className="flex items-center gap-3 text-[10px] mt-2 mb-2">
                          <span className="text-[#8E8C85] uppercase">{f.category}</span>
                          <span className="text-[#B5B3AD]">#{f.priority}</span>
                          <span className="text-[#B5B3AD]">{f.timeline}</span>
                          <span className="text-[#B5B3AD]">{f.difficulty}</span>
                        </div>
                        <p className="text-xs text-[#56554F] leading-relaxed mb-3">
                          {isFr ? (f.description_fr || f.description) : f.description}
                        </p>
                        <div className="bg-[#1B3A2D]/[0.03] border border-[#1B3A2D]/10 rounded-lg px-3 py-2">
                          <p className="text-[9px] font-bold text-[#1B3A2D]/50 uppercase tracking-wider mb-1">
                            {isFr ? "Ce que votre rep va adresser" : "What your rep will address"}
                          </p>
                          <p className="text-[11px] text-[#1B3A2D]">
                            {isFr ? (f.recommendation_fr || f.recommendation) : f.recommendation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================== RECOVERY SEQUENCE TAB ======================== */}
        {tab === "plan" && (
          <div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 bg-white border border-[#E5E3DD]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#1B3A2D] animate-pulse shrink-0" />
              <p className="text-[11px] text-[#56554F]">
                {isFr
                  ? "Votre rep travaillera ces elements dans cet ordre. Aucune action requise de votre part."
                  : "Your rep will work through these in this order. No action needed from you."}
              </p>
            </div>

            {/* Timeline layout */}
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[14px] top-2 bottom-2 w-[2px] bg-[#E5E3DD]" />

              {((report.action_plan as any)?.optimal_sequence ?? []).map((a: any, i: number) => {
                const diffColor = a.difficulty === "easy" ? "bg-[#1B3A2D]/10 text-[#1B3A2D]"
                  : a.difficulty === "medium" ? "bg-[#C4841D]/10 text-[#C4841D]"
                  : "bg-[#B34040]/10 text-[#B34040]";
                return (
                  <div key={i} className="relative mb-3" style={{ animation: `fadeUp 0.2s ease-out ${i * 0.04}s both` }}>
                    {/* Node on the line */}
                    <div className="absolute left-[-22px] top-4 w-7 h-7 rounded-full bg-[#1B3A2D] flex items-center justify-center z-10">
                      <span className="text-[10px] font-bold text-white">{a.priority}</span>
                    </div>

                    {/* Card */}
                    <div className="bg-white border border-[#E5E3DD] rounded-xl p-4"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                      <h3 className="text-sm font-semibold text-[#1A1A18] mb-1">
                        {isFr ? (a.title_fr || a.title) : a.title}
                      </h3>
                      <p className="text-xs text-[#56554F] mb-2">
                        {isFr ? (a.description_fr || a.description) : a.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <span className="font-bold text-[#1B3A2D]">${(a.estimated_savings ?? 0).toLocaleString()}</span>
                        {a.timeline && (
                          <span className="px-2 py-0.5 rounded bg-[#F0EFEB] text-[#56554F] font-medium">{a.timeline}</span>
                        )}
                        {a.difficulty && (
                          <span className={`px-2 py-0.5 rounded font-medium ${diffColor}`}>{a.difficulty}</span>
                        )}
                        {a.category && (
                          <span className="text-[#B5B3AD]">{a.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================== RISK MATRIX TAB ======================== */}
        {tab === "risk" && (
          <div>
            {/* 2D Visual Risk Matrix */}
            <div className="bg-white border border-[#E5E3DD] rounded-xl p-4 mb-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", animation: "fadeUp 0.3s ease-out" }}>
              <h3 className="text-xs font-semibold text-[#1A1A18] mb-3">{isFr ? "Matrice de risque" : "Risk Matrix"}</h3>
              <div className="flex">
                {/* Y-axis label */}
                <div className="flex flex-col items-center justify-center mr-1">
                  <span className="text-[9px] text-[#8E8C85] font-medium writing-mode-vertical"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.05em" }}>
                    {isFr ? "PROBABILITE" : "LIKELIHOOD"} &rarr;
                  </span>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-5 gap-[2px]">
                    {riskGrid.map((row, ri) =>
                      row.map((cell, ci) => {
                        // Background intensity: top-right = most dangerous
                        const dangerLevel = (4 - ri) + ci; // 0-8 scale
                        const bgOpacity = Math.max(0.02, dangerLevel * 0.015);
                        const bgColor = dangerLevel >= 6 ? `rgba(179,64,64,${bgOpacity})`
                          : dangerLevel >= 4 ? `rgba(196,132,29,${bgOpacity})`
                          : dangerLevel >= 2 ? `rgba(3,105,161,${bgOpacity})`
                          : `rgba(142,140,133,${bgOpacity})`;
                        return (
                          <div key={`${ri}-${ci}`}
                            className="aspect-square rounded-md flex flex-wrap items-center justify-center gap-0.5 p-0.5 min-h-[36px]"
                            style={{ background: bgColor, border: "1px solid #F0EFEB" }}>
                            {cell.items.map((item, ii) => (
                              <div key={ii}
                                className="w-4 h-4 rounded-full flex items-center justify-center cursor-default"
                                style={{ background: RISK_COLOR[item.risk_level] || "#8E8C85" }}
                                title={isFr ? (item.area_fr || item.area) : item.area}>
                                <span className="text-[7px] font-bold text-white">
                                  {(isFr ? (item.area_fr || item.area) : item.area).charAt(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })
                    )}
                  </div>
                  {/* X-axis labels */}
                  <div className="grid grid-cols-5 gap-[2px] mt-1">
                    {axisLabels.map((l, i) => (
                      <span key={i} className="text-[8px] text-[#B5B3AD] text-center">{l}</span>
                    ))}
                  </div>
                  <p className="text-[9px] text-[#8E8C85] text-center mt-1 font-medium tracking-wider">
                    {isFr ? "IMPACT" : "IMPACT"} &rarr;
                  </p>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#F0EFEB]">
                {(["critical", "high", "medium", "low"] as const).map(level => (
                  <div key={level} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: RISK_COLOR[level] }} />
                    <span className="text-[9px] text-[#8E8C85] capitalize">{level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail cards below the matrix */}
            <div className="space-y-2">
              {(report.risk_matrix ?? []).map((r: any, i: number) => {
                const riskColor = RISK_COLOR[r.risk_level] || "#8E8C85";
                return (
                  <div key={i} className="bg-white border border-[#E5E3DD] rounded-xl p-4"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", animation: `fadeUp 0.2s ease-out ${i * 0.04}s both` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: riskColor }} />
                      <h3 className="text-sm font-semibold text-[#1A1A18]">{isFr ? (r.area_fr || r.area) : r.area}</h3>
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded"
                        style={{ background: `${riskColor}12`, color: riskColor }}>
                        {r.risk_level}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                      <div><span className="text-[#8E8C85]">{isFr ? "Probabilite" : "Likelihood"}:</span> <span className="text-[#56554F]">{r.likelihood}</span></div>
                      <div><span className="text-[#8E8C85]">{isFr ? "Impact" : "Impact"}:</span> <span className="text-[#56554F]">{r.impact}</span></div>
                    </div>
                    <p className="text-xs text-[#8E8C85]">{isFr ? (r.current_status_fr || r.current_status) : r.current_status}</p>
                    <div className="mt-2 bg-[#1B3A2D]/[0.03] border border-[#1B3A2D]/10 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-[#1B3A2D]">
                        {isFr ? (r.recommendation_fr || r.recommendation) : r.recommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================== BENCHMARKS TAB ======================== */}
        {tab === "benchmarks" && (
          <div className="space-y-3">
            {(report.benchmark_comparisons || []).map((b, i) => {
              const yourNum = parseNumeric(b.your_value);
              const avgNum = parseNumeric(b.industry_avg);
              const topNum = parseNumeric((b as any).top_quartile || (b as any).top_performer || "0");
              const maxVal = Math.max(yourNum, avgNum, topNum, 1);
              const isAboveAvg = yourNum >= avgNum;

              return (
                <div key={i} className="bg-white border border-[#E5E3DD] rounded-xl p-4"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", animation: `fadeUp 0.2s ease-out ${i * 0.04}s both` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-[#1A1A18] flex-1">{isFr ? (b.metric_fr || b.metric) : b.metric}</h3>
                    {isAboveAvg ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#1B3A2D]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {isFr ? "Au-dessus de la moyenne" : "Above average"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#B34040]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B34040" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                        {isFr ? "Sous la moyenne" : "Below average"}
                      </span>
                    )}
                  </div>

                  {/* Bar chart */}
                  <div className="space-y-2">
                    {/* Your value */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#56554F] w-20 shrink-0 text-right">{isFr ? "Vous" : "You"}</span>
                      <div className="flex-1 h-4 bg-[#F0EFEB] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(2, (yourNum / maxVal) * 100)}%`, background: "#1B3A2D" }} />
                      </div>
                      <span className="text-[11px] font-bold text-[#1A1A18] w-16 shrink-0">{b.your_value}</span>
                    </div>
                    {/* Industry avg */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#8E8C85] w-20 shrink-0 text-right">{isFr ? "Moy. industrie" : "Industry Avg"}</span>
                      <div className="flex-1 h-4 bg-[#F0EFEB] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(2, (avgNum / maxVal) * 100)}%`, background: "#B5B3AD" }} />
                      </div>
                      <span className="text-[11px] font-medium text-[#8E8C85] w-16 shrink-0">{b.industry_avg}</span>
                    </div>
                    {/* Top quartile */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#8E8C85] w-20 shrink-0 text-right">{isFr ? "Top 25%" : "Top 25%"}</span>
                      <div className="flex-1 h-4 bg-[#F0EFEB] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(2, (topNum / maxVal) * 100)}%`, background: "#6EE7B7" }} />
                      </div>
                      <span className="text-[11px] font-medium text-[#8E8C85] w-16 shrink-0">{(b as any).top_quartile || (b as any).top_performer}</span>
                    </div>
                  </div>

                  {/* Gap / recommendation */}
                  <p className="text-[10px] text-[#8E8C85] mt-3 leading-relaxed">
                    {isFr ? (b.recommendation_fr || b.recommendation || b.gap_fr || b.gap) : (b.recommendation || b.gap)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer meta */}
        <div className="text-center text-[10px] text-[#B5B3AD] mt-8 pb-4">
          {isFr ? "Genere en" : "Generated in"} {((report.meta?.duration_ms ?? 0) / 1000).toFixed(1)}s &middot;{" "}
          {report.meta?.model} &middot;{" "}
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
    <div className="bg-white border border-[#E5E3DD] rounded-xl px-3 py-2.5 text-center"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div className={`text-base font-black ${color}`}>{value}</div>
      <div className="text-[11px] text-[#56554F] uppercase">{label}</div>
    </div>
  );
}
