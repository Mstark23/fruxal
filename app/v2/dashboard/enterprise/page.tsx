// =============================================================================
// app/v2/dashboard/enterprise/page.tsx v4
// Enterprise dashboard. Light theme. $1M+ revenue CCPCs.
// KPI row 1: Health Score | Annual Leak | EBITDA Impact | Enterprise Value Impact
// KPI row 2: Exit Readiness | Bankability | Penalty Exposure | Programs
// Intake quality nudge | Financial context row | Structure flags
// Savings anchor
// Main grid: Findings (left) | Score bars + Exit readiness + Deadlines (right)
// Executive summary | Risk Matrix | CPA Briefing | Priority Sequence
// Strengths | Peer Benchmarks
// NEW (v4) 
// [1] Outreach Pipeline Tracker (stage bar when no engagement)
// [2] Document Vault (collapsible checklist)
// [3] Advisor / Rep Assignment card
// [4] Engagement Status (progress through stages)
// [5] Savings Tracker (confirmed vs projected + contingency fee)
// [6] Quick Actions (book call, share, PDF, audit, intake, AI chat)
// =============================================================================
"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { RecoveryCounter } from "@/components/v2/RecoveryCounter";
import { LiveScoreRing, ScoreSparkline, ScoreBreakdown, ScoreRingAddons } from "@/components/v2/LiveScoreRing";
import { LastBriefWidget } from "@/components/v2/LastBriefWidget";
import { JourneyTimeline } from "@/components/v2/JourneyTimeline";
import RecoveryTimeline, { buildTimelineSteps } from "@/components/v2/RecoveryTimeline";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
const AiChatWidget = lazy(() => import("@/components/v2/AiChatWidget"));
import DailyBriefing from "@/components/v2/DailyBriefing";

const fade = (delay = 0) => ({
  animation: `fadeUp 0.4s ease ${delay}s both`,
});

const fmtM = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${Math.round(n / 1_000)}K`
  : `$${(n ?? 0).toLocaleString()}`;

export default function EnterpriseDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const fetchedRef = useRef(false);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [loading, setLoading] = useState(true);
  const [reportId,   setReportId]   = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [rerunning,  setRerunning]  = useState(false);
  const [mounted,    setMounted]    = useState(false);

 // Diagnostic report data
  const [savingsAnchor,     setSavingsAnchor]     = useState("");
  const [savingsAnchorFr,   setSavingsAnchorFr]   = useState("");
  const [savingsAnchorConf, setSavingsAnchorConf] = useState<"exact"|"estimated">("estimated");
  const [execSummary, setExecSummary] = useState("");
  const [execSummaryFr, setExecSummaryFr] = useState("");
  const [scores, setScores] = useState({
    overall: 0, compliance: 0, efficiency: 0,
    optimization: 0, growth: 0, bankability: 0, exit_readiness: 0,
  });
  const [totals, setTotals] = useState({
    leaks: 0, savings: 0, penalties: 0, programs: 0,
    ebitda_impact: 0, enterprise_value_impact: 0,
  });
  const [findings, setFindings]       = useState<any[]>([]);
  const [riskMatrix, setRiskMatrix]   = useState<any[]>([]);
  const [exitReadiness, setExitReadiness] = useState<any>(null);
  const [briefing, setBriefing]       = useState<any>(null);
  const [planSequence, setPlanSequence] = useState<any[]>([]);
  const [strengths, setStrengths]     = useState<any[]>([]);
  const [benchmarks, setBenchmarks]   = useState<any[]>([]);
  const [nextReview, setNextReview]   = useState("");
  const [lastRun, setLastRun]           = useState<string | null>(null);
  const [hasReport, setHasReport]     = useState(false);
  const [isAnalyzing, setIsAnalyzing]  = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);

 // Dashboard / profile data
  const [profile, setProfile] = useState<any>(() => {
    let cookieCountry = "";
    try { cookieCountry = document.cookie.match(/fruxal_country=(\w+)/)?.[1] || ""; } catch {}
    return {
      country: cookieCountry,
      intake_quality_score: 0,
      exact_annual_revenue: null,
      gross_margin_pct: null,
      net_income_last_year: null,
      ebitda_estimate: null,
      exact_payroll_total: null,
      owner_salary: null,
      has_holdco: false,
      passive_income_over_50k: false,
      exit_horizon: null,
      lcge_eligible: null,
      shareholder_agreements: false,
    };
  });
  const [deadlines, setDeadlines]       = useState<any[]>([]);
  const [overdue, setOverdue]           = useState(0);
  const [penaltyExposure, setPenaltyExposure] = useState(0);

 // Enterprise engagement state 
  const [entStatus,      setEntStatus]      = useState<any>(null);
  const [entStatusLoaded, setEntStatusLoaded] = useState(false);
  const [docExpanded,    setDocExpanded]    = useState(false);
  const [savingsExpanded,setSavingsExpanded]= useState(false);
  const [findingsTab, setFindingsTab] = useState<"all"|"quick"|"strategic">("all");
  const [showCpaModal, setShowCpaModal] = useState(false);
  const [cpaCopied,    setCpaCopied]    = useState(false);

  // AI Tools state
  const [aiToolLoading, setAiToolLoading] = useState<string | null>(null);
  const [scenarioResult, setScenarioResult] = useState<any>(null);
  const [taxCalendar, setTaxCalendar] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [industryReport, setIndustryReport] = useState<any>(null);
  const [intelligence, setIntelligence] = useState<any>(null);
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [newIssues, setNewIssues] = useState<any[]>([]);

  // QBR state
  const [qbr, setQbr] = useState<any>(null);
  const [qbrExpanded, setQbrExpanded] = useState(false);

  // Share link state
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const isFr = lang === "fr";
  const t    = (en: string, fr: string) => isFr ? fr : en;

  /* ── renderToolResult: format AI tool output as readable cards ──────── */
  function renderToolResult(tool: string, data: any): JSX.Element {
    if (!data) return <p className="text-ink-faint text-[11px] py-4 text-center">{t("No results yet.", "Aucun résultat.")}</p>;

    // --- Scenario Model ---
    if (tool === "scenario") {
      if (typeof data === "string") return <div className="space-y-2">{renderFormattedText(data)}</div>;
      return (
        <div className="space-y-3">
          {Object.entries(data).map(([key, val]) => (
            <div key={key} className="bg-bg rounded-lg px-4 py-3 border border-border-light">
              <p className="text-[11px] font-bold text-ink uppercase tracking-wider mb-1.5">{key.replace(/_/g, " ")}</p>
              <div className="text-[12px] text-ink-secondary">{typeof val === "string" ? renderFormattedText(val) : typeof val === "number" ? <span className="font-serif text-[18px] font-bold text-ink">{typeof val === "number" && val > 100 ? `$${val.toLocaleString()}` : val}</span> : Array.isArray(val) ? <ul className="space-y-1 ml-1">{(val as any[]).map((v, i) => <li key={i} className="flex items-start gap-2"><span className="text-brand mt-0.5">{">"}</span><span>{typeof v === "string" ? v : JSON.stringify(v)}</span></li>)}</ul> : renderKeyValuePairs(val)}</div>
            </div>
          ))}
        </div>
      );
    }

    // --- Tax Calendar ---
    if (tool === "tax") {
      const items = Array.isArray(data) ? data : data?.items || data?.deadlines || data?.calendar || (typeof data === "object" ? Object.values(data).find(v => Array.isArray(v)) : null);
      if (Array.isArray(items) && items.length > 0) {
        return (
          <div className="space-y-2">
            {(items as any[]).map((item: any, i: number) => {
              const status = (item.status || "upcoming").toLowerCase();
              const statusColor = status === "overdue" ? { bg: "rgba(179,64,64,0.08)", text: "#B34040" } : status === "completed" ? { bg: "rgba(45,122,80,0.08)", text: "#2D7A50" } : { bg: "rgba(196,132,29,0.08)", text: "#C4841D" };
              const riskColor = (item.risk_level || item.risk || "").toLowerCase() === "high" || (item.risk_level || item.risk || "").toLowerCase() === "critical" ? "#B34040" : (item.risk_level || item.risk || "").toLowerCase() === "medium" ? "#C4841D" : "#2D7A50";
              return (
                <div key={i} className="flex items-center gap-3 bg-bg rounded-lg px-4 py-3 border border-border-light">
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ background: riskColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-ink">{item.title || item.name || item.summary || `Item ${i + 1}`}</p>
                    {(item.date || item.deadline || item.due_date) && <p className="text-[10px] text-ink-muted mt-0.5">{item.date || item.deadline || item.due_date}</p>}
                    {item.description && <p className="text-[10px] text-ink-faint mt-0.5">{item.description}</p>}
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0" style={{ background: statusColor.bg, color: statusColor.text }}>{status}</span>
                </div>
              );
            })}
          </div>
        );
      }
      if (typeof data === "string") return <div className="space-y-2">{renderFormattedText(data)}</div>;
      return renderKeyValuePairs(data);
    }

    // --- Anomaly Detection ---
    if (tool === "anomaly") {
      const items = Array.isArray(data) ? data : data?.anomalies || data?.alerts || data?.items || (typeof data === "object" ? Object.values(data).find(v => Array.isArray(v)) : null);
      if (Array.isArray(items) && items.length > 0) {
        return (
          <div className="space-y-2">
            {(items as any[]).map((a: any, i: number) => {
              const sev = (a.severity || a.risk_level || a.level || "medium").toLowerCase();
              const sevColor = sev === "critical" || sev === "high" ? { bg: "rgba(179,64,64,0.06)", border: "rgba(179,64,64,0.15)", badge: "#B34040" } : sev === "medium" ? { bg: "rgba(196,132,29,0.06)", border: "rgba(196,132,29,0.15)", badge: "#C4841D" } : { bg: "rgba(45,122,80,0.06)", border: "rgba(45,122,80,0.15)", badge: "#2D7A50" };
              return (
                <div key={i} className="rounded-lg px-4 py-3 border" style={{ background: sevColor.bg, borderColor: sevColor.border }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: sevColor.bg, color: sevColor.badge, border: `1px solid ${sevColor.border}` }}>{sev}</span>
                    <p className="text-[12px] font-semibold text-ink">{a.title || a.name || a.type || `Anomaly ${i + 1}`}</p>
                  </div>
                  {(a.description || a.message || a.detail) && <p className="text-[11px] text-ink-secondary mb-1.5">{a.description || a.message || a.detail}</p>}
                  {(a.suggested_action || a.recommendation || a.action) && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <span className="text-brand text-[10px] mt-px font-bold">{">"}</span>
                      <p className="text-[10px] text-brand font-medium">{a.suggested_action || a.recommendation || a.action}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }
      if (typeof data === "string") return <div className="space-y-2">{renderFormattedText(data)}</div>;
      return renderKeyValuePairs(data);
    }

    // --- Industry Report ---
    if (tool === "industry") {
      const metrics = Array.isArray(data) ? data : data?.metrics || data?.benchmarks || data?.comparisons || (typeof data === "object" ? Object.values(data).find(v => Array.isArray(v)) : null);
      if (Array.isArray(metrics) && metrics.length > 0) {
        return (
          <div className="space-y-1.5">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[9px] text-ink-faint uppercase tracking-wider font-semibold">
              <div className="col-span-4">{t("Metric", "Mesure")}</div>
              <div className="col-span-3 text-right">{t("Your Value", "Votre valeur")}</div>
              <div className="col-span-3 text-right">{t("Industry Avg", "Moy. industrie")}</div>
              <div className="col-span-2 text-right">{t("Status", "Statut")}</div>
            </div>
            {(metrics as any[]).map((m: any, i: number) => {
              const yours = m.value ?? m.your_value ?? m.actual ?? null;
              const avg = m.average ?? m.industry_average ?? m.benchmark ?? null;
              const isAbove = yours !== null && avg !== null ? Number(yours) >= Number(avg) : null;
              return (
                <div key={i} className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-bg rounded-lg border border-border-light items-center">
                  <div className="col-span-4 text-[11px] font-medium text-ink">{m.name || m.metric || m.label || `Metric ${i + 1}`}</div>
                  <div className="col-span-3 text-right text-[12px] font-semibold text-ink">{yours !== null ? (typeof yours === "number" ? yours.toLocaleString() : yours) : "—"}</div>
                  <div className="col-span-3 text-right text-[11px] text-ink-muted">{avg !== null ? (typeof avg === "number" ? avg.toLocaleString() : avg) : "—"}</div>
                  <div className="col-span-2 text-right">
                    {isAbove !== null ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: isAbove ? "rgba(45,122,80,0.08)" : "rgba(179,64,64,0.08)", color: isAbove ? "#2D7A50" : "#B34040" }}>
                        {isAbove ? (t("Above", "Au-dessus")) : (t("Below", "En-dessous"))}
                      </span>
                    ) : <span className="text-[10px] text-ink-faint">—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      if (typeof data === "string") return <div className="space-y-2">{renderFormattedText(data)}</div>;
      return renderKeyValuePairs(data);
    }

    // --- Intelligence ---
    if (tool === "intelligence") {
      const items = Array.isArray(data) ? data : data?.insights || data?.patterns || data?.items || (typeof data === "object" ? Object.values(data).find(v => Array.isArray(v)) : null);
      if (Array.isArray(items) && items.length > 0) {
        return (
          <div className="space-y-2">
            {(items as any[]).map((ins: any, i: number) => (
              <div key={i} className="flex items-start gap-3 bg-bg rounded-lg px-4 py-3 border border-border-light">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.06)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-ink mb-0.5">{ins.title || ins.name || ins.insight || `Insight ${i + 1}`}</p>
                  {(ins.description || ins.detail || ins.message) && <p className="text-[11px] text-ink-secondary">{ins.description || ins.detail || ins.message}</p>}
                  {(ins.impact || ins.value) && <p className="text-[10px] font-medium text-brand mt-1">{ins.impact || ins.value}</p>}
                </div>
              </div>
            ))}
          </div>
        );
      }
      if (typeof data === "string") return <div className="space-y-2">{renderFormattedText(data)}</div>;
      return renderKeyValuePairs(data);
    }

    // --- Generic fallback ---
    if (typeof data === "string") return <div className="space-y-2">{renderFormattedText(data)}</div>;
    return renderKeyValuePairs(data);
  }

  /* ── Helper: render formatted text (bold **headers**, bullet points) ── */
  function renderFormattedText(text: string): JSX.Element {
    const lines = text.split("\n");
    return (
      <>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-2" />;
          // Bold headers: **text** or lines ending with :
          const boldMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
          if (boldMatch) return <p key={i} className="text-[12px] font-bold text-ink mt-2">{boldMatch[1]}</p>;
          if (/^#{1,3}\s/.test(trimmed)) return <p key={i} className="text-[12px] font-bold text-ink mt-2">{trimmed.replace(/^#{1,3}\s*/, "")}</p>;
          // Bullet points
          if (/^[-•*]\s/.test(trimmed)) return <div key={i} className="flex items-start gap-2 ml-1"><span className="text-brand mt-0.5 shrink-0">{">"}</span><span className="text-[11px] text-ink-secondary">{trimmed.replace(/^[-•*]\s*/, "")}</span></div>;
          // Numbered items
          if (/^\d+[.)]\s/.test(trimmed)) return <div key={i} className="flex items-start gap-2 ml-1"><span className="text-[10px] font-bold text-ink-faint mt-px shrink-0">{trimmed.match(/^(\d+[.)])/)?.[1]}</span><span className="text-[11px] text-ink-secondary">{trimmed.replace(/^\d+[.)]\s*/, "")}</span></div>;
          // Header-like lines ending with colon
          if (/^[A-Z].*:$/.test(trimmed)) return <p key={i} className="text-[11px] font-bold text-ink mt-2">{trimmed}</p>;
          return <p key={i} className="text-[11px] text-ink-secondary">{trimmed}</p>;
        })}
      </>
    );
  }

  /* ── Helper: render object as clean key-value pairs ── */
  function renderKeyValuePairs(obj: any): JSX.Element {
    if (!obj || typeof obj !== "object") return <p className="text-[11px] text-ink-secondary">{String(obj)}</p>;
    if (Array.isArray(obj)) {
      return (
        <div className="space-y-2">
          {obj.map((item, i) => (
            <div key={i} className="bg-bg rounded-lg px-4 py-3 border border-border-light">
              {typeof item === "string" ? <p className="text-[11px] text-ink-secondary">{item}</p> : typeof item === "object" && item !== null ? (
                <div className="space-y-1">
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-2">
                      <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider shrink-0 min-w-[80px]">{k.replace(/_/g, " ")}</span>
                      <span className="text-[11px] text-ink-secondary">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-[11px] text-ink-secondary">{String(item)}</p>}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-1.5">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k} className="flex items-start gap-3 bg-bg rounded-lg px-4 py-2.5 border border-border-light">
            <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider shrink-0 min-w-[100px]">{k.replace(/_/g, " ")}</span>
            <span className="text-[11px] text-ink-secondary flex-1">{typeof v === "string" ? v : typeof v === "number" ? v.toLocaleString() : typeof v === "boolean" ? (v ? "Yes" : "No") : Array.isArray(v) ? (v as any[]).map(x => typeof x === "string" ? x : JSON.stringify(x)).join(", ") : typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  useEffect(() => {
    if (authLoading || fetchedRef.current) return;
    fetchedRef.current = true;
    try { if (typeof window !== "undefined") { const s = sessionStorage.getItem("lg_prescan_lang") || localStorage.getItem("fruxal_lang"); if (s === "fr" || s === "en") setLang(s as "en"|"fr"); } } catch { /* non-fatal */ }
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "1";

    async function load() {
      let redirected = false;
      try {
        const [dashRes, reportRes] = await Promise.all([
          fetch("/api/v2/dashboard").then(r => r.ok ? r.json() : null),
          fetch("/api/v2/diagnostic/latest").then(r => r.ok ? r.json() : null).catch(() => null).then(d => {
 // If analyzing use React state so banner is reactive (no page reload)
            if (d?.status === "analyzing") {
              setIsAnalyzing(true);
              // Persist reportId so we can deep-link even after tab close
              try { if (d.report_id) localStorage.setItem("fruxal_analyzing_report", d.report_id); } catch { /* non-fatal */ }
              let pollCount = 0;
              const poll = setInterval(async () => {
                pollCount++;
                try {
                  const pr = await fetch("/api/v2/diagnostic/latest");
                  if (!pr.ok) { clearInterval(poll); setIsAnalyzing(false); return; }
                  const pd = await pr.json();
                  if (pd?.status === "completed") {
                    clearInterval(poll);
                    try { localStorage.removeItem("fruxal_analyzing_report"); } catch { /* non-fatal */ }
                    setIsAnalyzing(false);
                    load();
                    return;
                  }
                  if (pd?.status === "failed" || pollCount >= 45) {
                    clearInterval(poll);
                    try { localStorage.removeItem("fruxal_analyzing_report"); } catch { /* non-fatal */ }
                    setIsAnalyzing(false);
                    setAnalysisFailed(true);
                  }
                } catch { clearInterval(poll); setIsAnalyzing(false); setAnalysisFailed(true); }
              }, 4000);
 // NO setTimeout fallback needed pollCount guard handles it
              void poll; // 2min max
            }
            return d;
          }),
        ]);

        if (dashRes?.success && dashRes.data) {
          const d = dashRes.data;
          setProfile(d.profile || {});
          if (d.businessId || d.business_id) setBusinessId(d.businessId || d.business_id);
          setDeadlines(d.obligations?.upcoming_deadlines || []);
          setOverdue(d.obligations?.overdue ?? 0);
          setPenaltyExposure(d.obligations?.penalty_exposure ?? 0);

 // Persist tier so layout sidebar stays enterprise-aware on all pages
          const bt = (d.tier || "free").toLowerCase();
          const recPlan = (d.recommended_plan || "").toLowerCase();
          try { localStorage.setItem("fruxal_tier", bt === "enterprise" || bt === "corp" ? "enterprise" : bt); } catch { /* non-fatal */ }

          if (!isPreview) {
            // Only redirect DOWN if the user has an active paid subscription at a lower tier
            // AND their revenue doesn't qualify for enterprise.
            // Free/unpaid users who qualify by revenue stay on enterprise — paywall gates their content.
            const qualifiesForEnterprise = recPlan === "enterprise" || bt === "enterprise" || bt === "corp";
            const qualifiesForBusiness   = recPlan === "business" || recPlan === "enterprise";

            if (!qualifiesForEnterprise && !qualifiesForBusiness && (bt === "solo" || bt === "pro")) {
              redirected = true; router.replace("/v2/dashboard/solo"); return;
            }
            if (!qualifiesForEnterprise && (bt === "business" || bt === "growth" || bt === "team")) {
              redirected = true; router.replace("/v2/dashboard/business"); return;
            }
            // bt === "free" with enterprise revenue → stay on enterprise dashboard
          }
        }

 // Fetch enterprise engagement status (non-blocking)
        if (redirected) return;
        fetch("/api/v2/enterprise/status").then(r => r.ok ? r.json() : null).catch(() => null).then(d => {
          if (d?.success) setEntStatus(d.data);
          setEntStatusLoaded(true);
        }).catch(() => { setEntStatusLoaded(true); });

        // Fetch latest QBR (non-blocking)
        fetch("/api/v2/qbr/latest").then(r => r.ok ? r.json() : null).then(d => {
          if (d?.success && d.qbr) setQbr(d.qbr);
        }).catch(() => {});

        // Fetch trends data
        fetch("/api/trends").then(r => r.json()).then(d => {
          if (d.trends?.length) setTrends(d.trends);
        }).catch(() => {});

        // Fetch new issues (leaks created in last 30 days)
        fetch("/api/v2/leaks?status=detected&since=30d").then(r => r.ok ? r.json() : null).then(d => {
          if (d?.leaks?.length) setNewIssues(d.leaks.filter((l: any) => {
            const created = new Date(l.created_at || l.detected_at);
            return (Date.now() - created.getTime()) < 30 * 86400000;
          }));
        }).catch(() => {});

        if (reportRes?.success && reportRes.data) {
          const r = reportRes.data;
          // Only mark report as present when it's actually complete —
          // analyzing state returns data but it's partial/empty
          const reportComplete = r.status === "completed" || (!r.status && r.findings?.length > 0);
          if (reportComplete) {
            setHasReport(true);
          }
          setReportId(reportRes.report_id);
          const _sa = r.savings_anchor;
          if (_sa && typeof _sa === "object") {
            setSavingsAnchor(_sa.headline || _sa.description || "");
            setSavingsAnchorFr(_sa.description_fr || _sa.description || _sa.headline || "");
          } else {
            setSavingsAnchor(r.savings_anchor || "");
            setSavingsAnchorFr(r.savings_anchor_fr || r.savings_anchor || "");
          }
          setSavingsAnchorConf((r.savings_anchor_confidence === "exact" ? "exact" : "estimated") as "exact"|"estimated");
          setExecSummary(r.executive_summary || "");
          setExecSummaryFr(r.executive_summary_fr || "");

          setScores({
            overall:        r.scores?.overall        ?? r.overall_score        ?? 0,
            compliance:     r.scores?.compliance     ?? r.compliance_score     ?? 0,
            efficiency:     r.scores?.efficiency     ?? r.efficiency_score     ?? 0,
            optimization:   r.scores?.optimization   ?? r.optimization_score   ?? 0,
            growth:         r.scores?.growth         ?? r.growth_score         ?? 0,
            bankability:    r.scores?.bankability    ?? r.bankability_score    ?? 0,
            exit_readiness: r.scores?.exit_readiness ?? r.exit_readiness_score ?? 0,
          });

          setTotals({
            leaks:                  r.totals?.annual_leaks           ?? r.total_annual_leaks          ?? 0,
            savings:                r.totals?.potential_savings      ?? r.total_potential_savings      ?? 0,
            penalties:              r.totals?.penalty_exposure       ?? r.total_penalty_exposure       ?? 0,
            programs:               r.totals?.programs_value         ?? r.total_programs_value         ?? 0,
            ebitda_impact:          r.ebitda_impact                  ?? r.totals?.ebitda_impact        ?? 0,
            enterprise_value_impact:r.enterprise_value_impact        ?? r.totals?.enterprise_value_impact ?? 0,
          });

          setFindings((r.findings || []).slice(0, 10));
          const RISK_NUM: Record<string,number> = { low:1, medium:2, high:3, critical:4 };
          setRiskMatrix((r.risk_matrix || []).map((rm: any) => ({
            area:           rm.area           || rm.risk           || rm.category || "",
            area_fr:        rm.area_fr        || rm.risk_fr        || "",
            risk_level:     rm.risk_level     || rm.severity       || "medium",
            likelihood:     typeof rm.likelihood === "number" ? rm.likelihood : (RISK_NUM[rm.likelihood] ?? 2),
            impact:         typeof rm.impact     === "number" ? rm.impact     : (RISK_NUM[rm.impact]     ?? 2),
            current_status: rm.current_status || rm.description    || "",
            current_status_fr: rm.current_status_fr || "",
            recommendation: rm.recommendation || rm.mitigation     || "",
            recommendation_fr: rm.recommendation_fr || "",
          })).sort((a: any, b: any) => (b.likelihood * b.impact) - (a.likelihood * a.impact)).slice(0, 7));
          setExitReadiness(r.exit_readiness || null);
          const _br = r.cpa_briefing || r.accountant_briefing || null;
          if (_br) {
 // Normalize talking_points: could be string[] or {point,point_fr}[]
            if (_br.talking_points?.length) {
              _br.talking_points = _br.talking_points.map((tp: any) =>
                typeof tp === "string" ? { point: tp, point_fr: tp } : tp
              );
            }
 // Normalize key_findings: could be string[] (used in CPA email)
            if (_br.key_findings?.length) {
              _br.key_findings = _br.key_findings.map((kf: any) =>
                typeof kf === "string" ? kf : (kf.finding || kf.text || JSON.stringify(kf))
              );
            }
          }
          setBriefing(_br);
          setStrengths(r.strengths || []);
          setBenchmarks((r.benchmark_comparisons || []).slice(0, 6).map((b: any) => ({
            metric_name:     b.metric_name     || b.metric        || "",
            metric_name_fr:  b.metric_name_fr  || b.metric_fr     || "",
            your_value:      b.your_value       || b.business_value || b.you || "",
            your_value_raw:  b.your_value_raw   ?? null,
            industry_avg:    b.industry_avg     || b.avg           || "",
            top_quartile:    b.top_quartile     || b.top_performer  || b.top || "",
            top_quartile_raw:b.top_quartile_raw ?? null,
            gap:             b.gap              || b.gap_description || "",
            gap_fr:          b.gap_fr           || "",
            lower_is_better: b.lower_is_better  ?? false,
            status:          b.status           || "",
          })));
          setNextReview(r.next_review_trigger || "");
          setLastRun(reportRes.completed_at || null);

          if (r.priority_sequence?.length) {
            setPlanSequence(r.priority_sequence.slice(0, 6).map((s: any, i: number) => ({
              rank:                        s.rank             ?? s.step                  ?? i + 1,
              action:                      s.action           || s.title                 || "",
              action_fr:                   s.action_fr        || s.title_fr              || "",
              why_first:                   s.why_first        || s.description           || s.why || "",
              why_first_fr:                s.why_first_fr     || s.description_fr        || "",
              expected_result:             s.expected_result  || (s.deadline ? `Target: ${s.deadline}` : ""),
              ebitda_improvement:          s.ebitda_improvement ?? 0,
              enterprise_value_improvement:s.enterprise_value_improvement ?? 0,
            })));
          } else if (Array.isArray(r.action_plan) && r.action_plan.length) {
 // action_plan is a flat array, map to priority_sequence shape
            setPlanSequence(r.action_plan.slice(0, 6).map((a: any, i: number) => ({
              rank: a.priority || i + 1,
              action: a.title,
              action_fr: a.title_fr,
              why_first: a.description,
              why_first_fr: a.description_fr,
              expected_result: `${a.estimated_savings ? `$${a.estimated_savings.toLocaleString()} savings` : ""} · ${a.timeline || ""}`.trim(),
              ebitda_improvement: a.ebitda_improvement ?? 0,
            })));
          }
        }
      } catch (e) {
        console.error("[EnterpriseDashboard]", e);
      } finally {
        setLoading(false);
        requestAnimationFrame(() => setMounted(true));
      }
    }
    load();
  }, [authLoading]);

  function rerunDiagnostic() {
    if (rerunning || isAnalyzing) return;
    setRerunning(true);
    fetch("/api/v2/diagnostic/rerun", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          // Set analyzing state — the poll loop in load() will detect completion
          // and call load() again to refresh the dashboard without a page reload.
          setIsAnalyzing(true);
          setAnalysisFailed(false);
          // Persist reportId so the "View progress" button works even if user switches tabs
          try { if (data.reportId) localStorage.setItem("fruxal_analyzing_report", data.reportId); } catch { /* non-fatal */ }
          // Start polling every 4s — mirrors the load() poll but scoped to rerun
          let pollCount = 0;
          const poll = setInterval(async () => {
            pollCount++;
            try {
              const pr  = await fetch("/api/v2/diagnostic/latest");
              if (!pr.ok) { clearInterval(poll); setIsAnalyzing(false); return; }
              const pd  = await pr.json();
              if (pd?.status === "completed") {
                clearInterval(poll);
                try { localStorage.removeItem("fruxal_analyzing_report"); } catch { /* non-fatal */ }
                setIsAnalyzing(false);
                // Reset fetchedRef so load() will re-run on next effect trigger
                fetchedRef.current = false;
                // Re-trigger the useEffect by toggling authLoading guard via a forced re-fetch
                window.location.reload();
              } else if (pd?.status === "failed" || pollCount >= 45) {
                clearInterval(poll);
                try { localStorage.removeItem("fruxal_analyzing_report"); } catch { /* non-fatal */ }
                setIsAnalyzing(false);
                setAnalysisFailed(true);
              }
            } catch { clearInterval(poll); setIsAnalyzing(false); setAnalysisFailed(true); }
          }, 4000);
        } else {
          alert(data.error || t("Failed to start diagnostic", "Echec du lancement"));
        }
        setRerunning(false);
      })
      .catch(function() { setRerunning(false); });
  }

  if (loading || authLoading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );

  const calendlyUrl = entStatus?.rep?.calendly_url
    || process.env.NEXT_PUBLIC_CALENDLY_URL
    || "https://calendly.com/fruxal/strategy"
    || null;
  const callHref   = calendlyUrl;
  const callIsEmail = false;

  const SEV: Record<string, { dot: string; badge: string; text: string }> = {
    critical: { dot: "#B34040", badge: "rgba(179,64,64,0.07)",   text: "#B34040" },
    high:     { dot: "#C4841D", badge: "rgba(196,132,29,0.07)",  text: "#C4841D" },
    medium:   { dot: "#0369a1", badge: "rgba(3,105,161,0.07)",   text: "#0369a1" },
    low:      { dot: "#8E8C85", badge: "rgba(142,140,133,0.07)", text: "#8E8C85" },
  };

  const RISK_COLORS: Record<string, { bg: string; text: string }> = {
    critical: { bg: "rgba(179,64,64,0.07)",   text: "#B34040" },
    high:     { bg: "rgba(196,132,29,0.07)",  text: "#C4841D" },
    medium:   { bg: "rgba(3,105,161,0.07)",   text: "#0369a1" },
    low:      { bg: "rgba(142,140,133,0.07)", text: "#8E8C85" },
  };

  const intakeQuality = profile.intake_quality_score ?? 0;
  const hasIntake     = intakeQuality >= 40;
  const hasEV         = totals.enterprise_value_impact > 0;
  const hasEBITDA     = totals.ebitda_impact > 0;

 // Re-run diagnostic 
 // Derived: onboarding step completion 
  const stepProfile   = intakeQuality >= 40;
  const stepDiagnostic = hasReport;
  const onboardingDone = stepProfile && stepDiagnostic;

 // QB/Plaid/Stripe local status (read from banner statuses already in page)
 // We don't re-fetch banners handle their own state; we just need any-connected signal
 // which is available from profile columns set by the aggregators.
  const anyIntegrationConnected = !!(
    profile.stripe_connected || profile.qb_connected || profile.plaid_connected
  );

 // Derived: staleness + money clock 
  const daysStale     = lastRun ? Math.floor((Date.now() - new Date(lastRun).getTime()) / 86400000) : null;
  const isStale       = daysStale !== null && daysStale > 60;
  const leakedToDate  = (daysStale && totals.leaks > 0)
    ? Math.round((totals.leaks / 365) * daysStale)
    : 0;

 // Derived: Next Best Action (step 1 of priority sequence) 
  const nba = planSequence[0] ?? null;


  return (
    <div className="bg-bg min-h-screen">
      <div className="px-6 lg:px-8 py-5 max-w-[1140px]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5" style={fade(0)}>
          <div>
            <h1 className="text-[15px] font-semibold text-ink">
              {t("Good morning", "Bonjour")}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {profile.industry && (
                <span className="text-[10px] text-ink-faint">
                  {profile.industry} · {profile.province}
                </span>
              )}
              {lastRun && (
                <span className={`text-[11px] ${isStale ? "text-caution font-semibold" : "text-ink-faint/60"}`}>
                  {t("Analysed", "Analysé")} {daysStale}d {t("ago", "il y a")}
                  {isStale && " · " + t("refresh recommended", "actualisation recommandée")}
                </span>
              )}
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: "rgba(27,58,45,0.10)", color: "#1B3A2D" }}>
                Enterprise
              </span>
              {intakeQuality > 0 && (
                <span className="text-[11px] text-ink-faint">
                  {t("Data quality:", "Qualité données:")} {intakeQuality}%
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile.country !== "US" && (
              <button onClick={() => { const nl = lang === "fr" ? "en" : "fr"; setLang(nl); try { localStorage.setItem("fruxal_lang", nl); sessionStorage.setItem("lg_prescan_lang", nl); } catch { /* non-fatal */ } }}
                className="h-6 px-2.5 text-[11px] font-bold text-ink-muted bg-white border border-border-light rounded-md hover:bg-bg-section transition">
                {isFr ? "EN" : "FR"}
              </button>
            )}
            {reportId && (
              <button onClick={() => router.push(`/v2/diagnostic/${reportId}`)}
                className="h-6 px-2.5 text-[11px] font-bold text-brand bg-brand/5 border border-brand/15 rounded-md hover:bg-brand/10 transition">
                {t("Full Report →", "Rapport →")}
              </button>
            )}
          </div>
        </div>

        {/* ── Calendly not configured warning (dev/staging only) ─────────── */}
        {callIsEmail && process.env.NODE_ENV !== "production" && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-3 text-left"
            style={{ background: "rgba(196,132,29,0.04)", border: "1px solid rgba(196,132,29,0.2)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" className="shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p className="text-[11px]" style={{ color: "#92400e" }}>
              <strong>NEXT_PUBLIC_CALENDLY_URL</strong> not set — "Book call" buttons will open mailto: instead of Calendly. Set this in Vercel environment variables.
            </p>
          </div>
        )}

        {/* ── Overdue alert ──────────────────────────────────────────────── */}
        {overdue > 0 && (
          <button onClick={() => router.push("/v2/obligations")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-left"
            style={{ background: "rgba(179,64,64,0.03)", border: "1px solid rgba(179,64,64,0.10)" }}>
            <div className="w-[6px] h-[6px] rounded-full bg-negative animate-pulse" />
            <span className="text-[11px] font-semibold text-negative flex-1">
              {overdue} {t("obligation(s) overdue", "obligation(s) en retard")} · ${(penaltyExposure ?? 0).toLocaleString()} {t("at risk", "à risque")}
            </span>
            <span className="text-[10px] font-semibold text-negative">{t("Resolve →", "Résoudre →")}</span>
          </button>
        )}

        {/* ── Data source banners ─────────────────────────────────────── */}

        {/* ── Intake quality nudge ───────────────────────────────────────── */}
        {intakeQuality < 60 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 mb-4 rounded-xl"
            style={{ background: "rgba(196,132,29,0.04)", border: "1px solid rgba(196,132,29,0.18)" }}
            {...fade(0.02)}>
            <div className="flex items-center gap-2.5">
              <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <div>
                <p className="text-[11px] font-bold" style={{ color: "#92400e" }}>
                  {t("Enterprise analysis needs your exact numbers", "L'analyse enterprise nécessite vos chiffres exacts")}
                </p>
                <p className="text-[10px]" style={{ color: "#b45309" }}>
                  {profile.country === "US"
                    ? "Upload Form 1120-S / 1120 + financial statements for precise EBITDA & exit planning"
                    : t("Upload T2 + financial statements for precise EBITDA, enterprise value & exit planning",
                       "Téléversez T2 + états financiers pour BAIIA, valeur d'entreprise et planification de sortie précis")}
                </p>
              </div>
            </div>
            <button onClick={() => router.push("/v2/diagnostic/intake")}
              className="flex-shrink-0 px-3 py-1.5 text-[10px] font-bold text-white rounded-lg transition"
              style={{ background: "#d97706" }}>
              {t("Complete intake →", "Compléter →")}
            </button>
          </div>
        )}

        {/* ── Financial context row (from intake) ────────────────────────── */}
        {hasIntake && (profile.exact_annual_revenue || profile.ebitda_estimate || profile.net_income_last_year || profile.gross_margin_pct) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4" style={fade(0.03)}>
            {[
              { label: t("Annual Revenue", "Revenus annuels"), val: profile.exact_annual_revenue, fmt: fmtM, sub: t("exact", "exact") },
              { label: "EBITDA", val: profile.ebitda_estimate, fmt: fmtM, sub: profile.ebitda_estimate ? t("exact", "exact") : t("estimated", "estimé") },
              { label: t("Net Income", "Revenu net"), val: profile.net_income_last_year, fmt: fmtM, sub: t("last year", "dernière année") },
              { label: t("Gross Margin", "Marge brute"), val: profile.gross_margin_pct, fmt: (v: number) => `${v}%`, sub: t("exact", "exact") },
            ].filter(c => c.val).map(({ label, val, fmt, sub }) => (
              <div key={label} className="bg-white border border-border-light rounded-xl px-4 py-3"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1">{label}</p>
                <p className="text-[15px] font-bold text-ink">{fmt(val!)}</p>
                <p className="text-[11px] text-ink-faint mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Structure flags ─────────────────────────────────────────────── */}
        {hasIntake && (profile.exit_horizon || profile.has_holdco || profile.passive_income_over_50k || profile.lcge_eligible !== null) && (
          <div className="flex flex-wrap gap-2 mb-4" style={fade(0.04)}>
            {profile.exit_horizon && profile.exit_horizon !== "none" && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: "rgba(27,58,45,0.07)", color: "#1B3A2D", border: "1px solid rgba(27,58,45,0.15)" }}>
                {t("Exit", "Sortie")}: {profile.exit_horizon}
              </span>
            )}
            {profile.has_holdco && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: "rgba(3,105,161,0.07)", color: "#0369a1", border: "1px solid rgba(3,105,161,0.15)" }}>
                Holdco / Opco
              </span>
            )}
            {profile.passive_income_over_50k && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: "rgba(179,64,64,0.07)", color: "#B34040", border: "1px solid rgba(179,64,64,0.15)" }}>
                {profile.country === "US" ? "Passive income >$50K — C-corp retained earnings risk" : t("Passive income >$50K — SBD at risk", "Revenus passifs >50K$ — DPE à risque")}
              </span>
            )}
            {profile.lcge_eligible === true && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: "rgba(45,122,80,0.07)", color: "#2D7A50", border: "1px solid rgba(45,122,80,0.15)" }}>
                {profile.country === "US" ? "QSBS eligible (Section 1202)" : t("LCGE eligible ($1.25M)", "ECGC admissible (1,25 M$)")}
              </span>
            )}
            {profile.shareholder_agreements && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: "rgba(142,140,133,0.07)", color: "#56554F", border: "1px solid rgba(142,140,133,0.20)" }}>
                {t("Shareholder agreements", "Conventions actionnaires")}
              </span>
            )}
          </div>
        )}

        {/* ── No report / Analyzing state + Onboarding ─────────────────────── */}
        {(isAnalyzing || analysisFailed) && (
          <div className="bg-white rounded-xl border mb-5 overflow-hidden"
            style={{ borderColor: analysisFailed ? "rgba(180,64,64,0.2)" : "rgba(27,58,45,0.12)", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="px-6 py-5 flex items-start gap-4"
              style={{ background: analysisFailed ? "rgba(180,64,64,0.04)" : "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
              {analysisFailed ? (
                <>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-red-700 mb-1">{t("Analysis did not complete", "L'analyse n'a pas pu être complétée")}</p>
                    <p className="text-[11px] text-red-600/80">{t("The AI engine timed out or encountered an error. Your data is saved — retry below.", "Le moteur IA a dépassé le délai. Vos données sont sauvegardées — réessayez ci-dessous.")}</p>
                  </div>
                  <button onClick={() => { setAnalysisFailed(false); rerunDiagnostic(); }}
                    className="shrink-0 h-8 px-4 text-[12px] font-bold text-white rounded-lg transition"
                    style={{ background: "#B34040" }}>
                    {t("Retry →", "Réessayer →")}
                  </button>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 mt-0.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-white mb-1">{t("Enterprise analysis in progress…", "Analyse enterprise en cours…")}</p>
                    <p className="text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>{t("Analyzing your business against 4,273 leak patterns across 10 financial dimensions…", "Analyse de votre entreprise avec 4 273 détecteurs sur 10 dimensions financières…")}</p>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full animate-pulse" style={{ width: "55%", transition: "width 2s ease" }} />
                    </div>
                  </div>
                  {(() => { try { const id = localStorage.getItem("fruxal_analyzing_report"); if (id) return (
                    <button onClick={() => router.push(`/v2/diagnostic/${id}`)}
                      className="shrink-0 h-8 px-3 text-[11px] font-medium rounded-lg transition"
                      style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
                      {t("View progress →", "Voir →")}
                    </button>
                  ); } catch { /* non-fatal */ } return null; })()}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Onboarding checklist — shown until first diagnostic is complete ── */}
        {!hasReport && !isAnalyzing && !analysisFailed && (
          <div className="bg-white rounded-xl border border-border-light mb-5 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

            {/* Header */}
            <div className="px-6 py-5 border-b border-border-light"
              style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
              <p className="text-[13px] font-bold text-white mb-1">
                {t("Get your Enterprise Diagnostic", "Obtenez votre diagnostic Enterprise")}
              </p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                {t("2 steps · takes about 5 minutes", "2 étapes · environ 5 minutes")}
              </p>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${[stepProfile, stepDiagnostic].filter(Boolean).length / 2 * 100}%`,
                    background: "rgba(255,255,255,0.75)"
                  }} />
              </div>
            </div>

            {/* Steps */}
            <div className="divide-y divide-border-light">

              {/* Step 1 — Business Profile */}
              <div className="px-6 py-4 flex items-start gap-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: stepProfile ? "rgba(45,122,80,0.1)" : "rgba(27,58,45,0.06)" }}>
                  {stepProfile ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <span className="text-[11px] font-bold text-ink-muted">1</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-semibold ${stepProfile ? "text-positive line-through opacity-60" : "text-ink"}`}>
                    {t("Complete your business profile", "Complétez votre profil d'entreprise")}
                  </p>
                  <p className="text-[10px] text-ink-faint mt-0.5">
                    {profile.country === "US" ? "Revenue, structure, state, exit horizon — the foundation of your diagnostic." :
                    t("Revenue, structure, province, exit horizon — the foundation of your diagnostic.",
                       "Revenus, structure, province, horizon de sortie — la base de votre diagnostic.")}
                  </p>
                </div>
                {!stepProfile && (
                  <button onClick={() => router.push("/v2/diagnostic/intake")}
                    className="shrink-0 h-7 px-3 text-[11px] font-bold text-white rounded-lg transition"
                    style={{ background: "#1B3A2D" }}>
                    {t("Start →", "Commencer →")}
                  </button>
                )}
              </div>

              {/* Optional — Connect data (boost accuracy) */}
              <div className="px-6 py-3 flex items-start gap-3"
                style={{ background: "#FAFAF8", borderTop: "1px dashed #E8E6E1" }}>
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: anyIntegrationConnected ? "rgba(45,122,80,0.1)" : "rgba(196,132,29,0.08)" }}>
                  {anyIntegrationConnected ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C4841D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[11px] font-semibold text-ink-secondary">
                      {t("Boost accuracy", "Améliorer la précision")}
                    </p>
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(196,132,29,0.08)", color: "#C4841D" }}>
                      {t("optional", "optionnel")}
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-faint mt-0.5">
                    {anyIntegrationConnected
                      ? t("Data source connected — your diagnostic will use real numbers.", "Source connectée — le diagnostic utilisera vos données réelles.")
                      : t("Connect QuickBooks, your bank, or Stripe to replace estimates with real figures.", "Connectez QuickBooks, votre banque ou Stripe pour remplacer les estimations.")}
                  </p>
                  {!anyIntegrationConnected && (
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {[
                        { label: "QuickBooks", href: "/api/quickbooks/connect" },
                        { label: "Bank",       href: "#plaid" },
                        { label: "Stripe",     href: "/api/stripe-connect/connect" },
                      ].map(i => (
                        <a key={i.label} href={i.href}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded border transition hover:border-brand/30 hover:text-brand"
                          style={{ borderColor: "#E8E6E1", color: "#56554F" }}>
                          {i.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 — Run diagnostic */}
              <div className="px-6 py-4 flex items-start gap-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(27,58,45,0.06)" }}>
                  <span className="text-[11px] font-bold text-ink-muted">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-ink">
                    {t("Run your diagnostic", "Lancez votre diagnostic")}
                  </p>
                  <p className="text-[10px] text-ink-faint mt-0.5">
                    {profile.country === "US"
                      ? "AI analysis across 7 dimensions — exit readiness, EBITDA impact, QSBS/entity structure, peer benchmarks, and more."
                      : t("AI analysis across 7 dimensions — exit readiness, EBITDA impact, RDTOH/CDA strategy, peer benchmarks, and more.",
                           "Analyse IA sur 7 dimensions — prêt à vendre, impact BAIIA, stratégie IMRTD/CDC, benchmarks et plus.")}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-[11px] text-ink-faint">✓ {t("Exit readiness score", "Score de préparation à la vente")}</span>
                    <span className="text-[11px] text-ink-faint">✓ {t("EBITDA gap analysis", "Analyse d'écart BAIIA")}</span>
                    <span className="text-[11px] text-ink-faint">✓ {t("Board briefing memo", "Mémo conseil d'administration")}</span>
                    <span className="text-[11px] text-ink-faint">✓ {t("CPA talking points", "Points pour comptable")}</span>
                  </div>
                </div>
                <button
                  onClick={() => stepProfile ? rerunDiagnostic() : router.push("/v2/diagnostic/intake")}
                  disabled={rerunning || isAnalyzing}
                  className="shrink-0 h-7 px-3 text-[11px] font-bold text-white rounded-lg transition disabled:opacity-50"
                  style={{ background: stepProfile ? "#1B3A2D" : "#B5B3AD" }}>
                  {rerunning ? t("Starting…", "Démarrage…") : t("Run →", "Lancer →")}
                </button>
              </div>

            </div>

            {/* What you'll get — preview */}
            <div className="px-6 py-3 border-t border-border-light flex flex-wrap gap-x-5 gap-y-1"
              style={{ background: "#FAFAF8" }}>
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider w-full mb-1">
                {t("Your report will include", "Votre rapport inclura")}
              </p>
              {[
                t("Annual leak estimate",     "Estimation des pertes annuelles"),
                t("7 diagnostic scores",      "7 scores diagnostiques"),
                t("EBITDA + EV impact",        "Impact BAIIA + valeur d'entreprise"),
                t("Risk matrix",              "Matrice des risques"),
                t("Recovery sequence",        "Séquence de récupération"),
                t("PDF export",              "Export PDF"),
                t("CPA briefing memo",        "Mémo pour comptable"),
              ].map(item => (
                <span key={item} className="text-[10px] text-ink-faint">
                  <span className="text-positive mr-1">✓</span>{item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Staleness warning ──────────────────────────────────────────── */}
        {isStale && hasReport && (
          <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4"
            style={{ background: "rgba(196,132,29,0.04)", border: "1px solid rgba(196,132,29,0.15)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C4841D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-[11px] font-semibold flex-1" style={{ color: "#C4841D" }}>
              {t("Analysis is", "Analyse effectuée il y a")} {daysStale} {t("days old — your financial position may have changed.", "jours — votre situation financière a peut-être changé.")}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={rerunDiagnostic} disabled={rerunning || isAnalyzing}
                className="h-6 px-3 text-[10px] font-bold text-white rounded-lg disabled:opacity-50 transition"
                style={{ background: "#C4841D" }}>
                {rerunning ? t("Starting…", "Démarrage…") : t("Re-run", "Relancer")}
              </button>
              <button onClick={() => router.push("/v2/diagnostic/intake")}
                className="h-6 px-2.5 text-[10px] font-semibold rounded-lg border transition"
                style={{ color: "#C4841D", borderColor: "rgba(196,132,29,0.3)" }}>
                {t("Update inputs →", "Mettre à jour →")}
              </button>
            </div>
          </div>
        )}

        {/* ── Next Best Action ───────────────────────────────────────────── */}
        {nba && (
          <div className="rounded-xl border mb-4 overflow-hidden" style={{ background: "#1B3A2D", borderColor: "rgba(255,255,255,0.06)" , opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.03s" }}>
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {t("Next Best Action", "Action prioritaire")}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(61,122,94,0.4)", color: "#a3d9b8" }}>
                      #{nba.rank ?? 1}
                    </span>
                  </div>
                  <p className="text-[15px] font-semibold text-white leading-snug">
                    {isFr ? (nba.action_fr || nba.action) : nba.action}
                  </p>
                  {(nba.why_first || nba.why_first_fr) && (
                    <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {isFr ? (nba.why_first_fr || nba.why_first) : nba.why_first}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {nba.ebitda_improvement > 0 && (
                    <div>
                      <p className="text-[22px] font-bold leading-none" style={{ color: "#6ee7a0" }}>
                        +{fmtM(nba.ebitda_improvement)}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {t("EBITDA", "BAIIA")}
                      </p>
                    </div>
                  )}
                  {nba.expected_result && !nba.ebitda_improvement && (
                    <p className="text-[10px] max-w-[120px] text-right leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {nba.expected_result}
                    </p>
                  )}
                </div>
              </div>

              {/* Money clock — leaked since last analysis */}
              {leakedToDate > 0 && (
                <div className="mt-3 pt-3 border-t flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {fmtM(leakedToDate)} {t("has leaked since your last analysis", "s'est échappé depuis votre dernière analyse")}
                    <span className="ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>({daysStale}d)</span>
                  </p>
                  <button onClick={() => router.push("/v2/diagnostic/intake")}
                    className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                    {t("Fix now →", "Corriger →")}
                  </button>
                </div>
              )}
            </div>

            {/* Step counter row */}
            {planSequence.length > 1 && (
              <div className="px-5 py-2.5 flex items-center gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}>
                <span className="text-[11px] mr-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {t("All steps", "Toutes les étapes")}
                </span>
                {planSequence.map((_: any, i: number) => (
                  <div key={i} className="flex-1 h-[3px] rounded-full"
                    style={{ background: i === 0 ? "#3D7A5E" : "rgba(255,255,255,0.1)", maxWidth: "40px" }} />
                ))}
                <button onClick={() => reportId && router.push(`/v2/diagnostic/${reportId}`)}
                  className="ml-auto text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {t("View all", "Voir tout")} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── KPI Row 1: Health | Annual Leak | EBITDA Impact | EV Impact ── */}
        {hasReport && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3" style={fade(0.05)}>

            {/* Health score */}
            <button onClick={() => router.push("/v2/diagnostic")}
              className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Health Score", "Score santé")}</div>
              {scores.overall > 0 ? (
                <>
                  <div className="flex items-end gap-1.5">
                    <span className="font-serif text-[36px] font-bold leading-none tracking-tight"
                      style={{ color: scores.overall >= 60 ? "#1B3A2D" : "#C4841D" }}>{scores.overall}</span>
                    <span className="text-xs text-ink-muted mb-1">/100</span>
                  </div>
                  <div className="mt-3 h-[3px] bg-bg-section rounded-full">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: scores.overall + "%", background: scores.overall >= 70 ? "#2D7A50" : scores.overall >= 40 ? "#C4841D" : "#B34040" }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-ink-faint">—</div>
                  <div className="text-[11px] text-ink-muted mt-1.5">{t("Run diagnostic →", "Lancer →")}</div>
                </>
              )}
            </button>

            {/* Annual leak */}
            <button onClick={() => router.push("/v2/leaks")}
              className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Annual Leak", "Fuite annuelle")}</div>
              <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-negative">
                {fmtM(totals.leaks)}
              </div>
              <div className="text-[11px] text-ink-muted mt-1.5">{findings.length} {t("findings", "constats")}</div>
            </button>

            {/* EBITDA Impact */}
            <button onClick={() => reportId && router.push(`/v2/diagnostic/${reportId}`)}
              className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">
                {t("EBITDA Impact", "Impact BAIIA")}
              </div>
              {hasEBITDA ? (
                <>
                  <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-positive">
                    +{fmtM(totals.ebitda_impact)}
                  </div>
                  <div className="text-[11px] text-ink-muted mt-1.5">{t("if all findings fixed", "si tout corrigé")}</div>
                </>
              ) : (
                <div className="text-[11px] text-ink-muted mt-1">{t("Run diagnostic →", "Lancer diagnostic →")}</div>
              )}
            </button>

            {/* Enterprise Value Impact */}
            <button onClick={() => reportId && router.push(`/v2/diagnostic/${reportId}`)}
              className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">
                {t("Enterprise Value", "Valeur d'entreprise")}
              </div>
              {hasEV ? (
                <>
                  <div className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: "#1B3A2D" }}>
                    +{fmtM(totals.enterprise_value_impact)}
                  </div>
                  <div className="text-[11px] text-ink-muted mt-1.5">
                    {(() => {
                      // Derive the actual multiple used from EV ÷ EBITDA impact
                      if (totals.ebitda_impact > 0 && totals.enterprise_value_impact > 0) {
                        const multiple = Math.round(totals.enterprise_value_impact / totals.ebitda_impact);
                        if (multiple >= 2 && multiple <= 20) {
                          return t(`at ${multiple}× EBITDA`, `à ${multiple}× BAIIA`);
                        }
                      }
                      return t("at market multiple", "au multiple du marché");
                    })()}
                  </div>
                </>
              ) : (
                <div className="text-[11px] text-ink-muted mt-1">{t("Requires diagnostic", "Diagnostic requis")}</div>
              )}
            </button>
          </div>
        )}

        {/* ── KPI Row 2: Exit | Bankability | Penalties | Programs ────────── */}
        {hasReport && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5" style={fade(0.07)}>

            {/* Exit Readiness */}
            <div className="bg-white rounded-xl p-5 border border-border-light"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Exit Readiness", "Prêt à vendre")}</div>
              {scores.exit_readiness > 0 ? (
                <>
                  <div className="flex items-end gap-1.5">
                    <span className="font-serif text-[36px] font-bold leading-none tracking-tight"
                      style={{ color: scores.exit_readiness >= 70 ? "#2D7A50" : scores.exit_readiness >= 40 ? "#C4841D" : "#B34040" }}>{scores.exit_readiness}</span>
                    <span className="text-xs text-ink-muted mb-1">/100</span>
                  </div>
                  <div className="mt-3 h-[3px] bg-bg-section rounded-full">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: scores.exit_readiness + "%", background: scores.exit_readiness >= 70 ? "#2D7A50" : scores.exit_readiness >= 40 ? "#C4841D" : "#B34040" }} />
                  </div>
                </>
              ) : (
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-ink-faint">—</div>
              )}
            </div>

            {/* Bankability */}
            <div className="bg-white rounded-xl p-5 border border-border-light"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">BANKABILITY</div>
              {scores.bankability > 0 ? (
                <>
                  <div className="flex items-end gap-1.5">
                    <span className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: "#0369a1" }}>{scores.bankability}</span>
                    <span className="text-xs text-ink-muted mb-1">/100</span>
                  </div>
                  <div className="mt-3 h-[3px] bg-bg-section rounded-full">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: scores.bankability + "%", background: "#0ea5e9" }} />
                  </div>
                </>
              ) : (
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-ink-faint">—</div>
              )}
            </div>

            {/* Penalty Exposure */}
            <button onClick={() => router.push("/v2/obligations")}
              className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Penalty Exposure", "Pénalités à risque")}</div>
              <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-negative">
                {fmtM(totals.penalties || penaltyExposure)}
              </div>
              <div className="text-[11px] text-ink-muted mt-1.5">
                {overdue > 0 ? `${overdue} ${t("overdue", "en retard")}` : t("all compliant", "tout conforme")}
              </div>
            </button>

            {/* Programs */}
            <button onClick={() => router.push("/v2/programs")}
              className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Grant Programs", "Subventions")}</div>
              <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-positive">
                {fmtM(totals.programs)}
              </div>
              <div className="text-[11px] text-ink-muted mt-1.5">{t("available", "disponible")}</div>
            </button>
          </div>
        )}

        {/* ── Savings anchor ──────────────────────────────────────────────── */}
        {(savingsAnchor || savingsAnchorFr) && (
          <div className="bg-white rounded-xl border border-border-light px-5 py-4 mb-5 text-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <p className="text-[15px] font-bold text-ink">{isFr ? (savingsAnchorFr || savingsAnchor) : (savingsAnchor || savingsAnchorFr)}</p>
            <div className="flex items-center justify-center gap-3 mt-1.5">
              {savingsAnchorConf === "exact" ? (
                <span className="text-[11px] font-medium border rounded-full px-2 py-0.5" style={{ color: "#2D7A50", borderColor: "rgba(45,122,80,0.25)", background: "rgba(45,122,80,0.04)" }}>
                  ✓ {profile.country === "US" ? "Based on your Form 1120-S and financial statements" : t("Based on your T2 and financial statements", "Basé sur votre T2 et états financiers")}
                </span>
              ) : (
                <span className="text-[11px] text-ink-faint border border-border-light rounded-full px-2 py-0.5">
                  {t("Based on estimates — upload financials for exact figures", "Basé sur estimations — téléversez vos états financiers")}
                </span>
              )}
              {reportId && (
                <button onClick={() => router.push(`/v2/diagnostic/${reportId}`)}
                  className="text-[10px] text-brand hover:underline">
                  {t("View full report →", "Voir le rapport complet →")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Daily Briefing ────────────────────────────────────────────── */}
        <DailyBriefing lang={lang} onAskAi={(prompt) => router.push(`/v2/chat?prompt=${encodeURIComponent(prompt)}`)} />

        {/* ── SR&ED Eligibility Banner ─────────────────────────────────────── */}
        {/* ── Main grid: Findings + Right column ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3 mb-5" style={fade(0.10)}>

          {/* Findings */}
          {findings.length > 0 && (() => {
              const crit = findings.filter((f:any)=>f.severity==="critical").length;
              const high = findings.filter((f:any)=>f.severity==="high").length;
              const med  = findings.filter((f:any)=>f.severity==="medium").length;
              return (<>
            <div className="bg-white rounded-xl border border-border-light overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{findings.length} {t("Findings","Constats")}</span>
                  {crit>0&&<span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{background:"rgba(179,64,64,0.08)",color:"#B34040"}}>{crit} {t("Critical","Critique")}</span>}
                  {high>0&&<span className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{background:"rgba(196,132,29,0.08)",color:"#C4841D"}}>{high} {t("High","Élevé")}</span>}
                  {med>0&&<span className="text-[11px] px-1.5 py-0.5 rounded" style={{background:"rgba(142,140,133,0.07)",color:"#8E8C85"}}>{med} {t("Med","Moy.")}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {reportId&&<button onClick={()=>typeof window !== "undefined" && window.open(`/api/v2/diagnostic/${reportId}/pdf?language=${lang}`,"_blank")} className="text-[11px] font-medium text-ink-faint hover:text-brand border border-border-light rounded px-2 py-0.5">↓ PDF</button>}
                  {reportId&&<button onClick={()=>router.push(`/v2/diagnostic/${reportId}`)} className="text-[11px] font-semibold text-brand hover:underline">{t("Full report →","Rapport complet →")}</button>}
                </div>
              </div>
              {/* ── Quick-win / Strategic filter tabs ── */}
              {(() => {
                const quickWins  = findings.filter((f:any) => ["medium","low"].includes(f.severity) || f.effort === "low" || (f.timeline && (f.timeline.toLowerCase().includes("week") || f.timeline.toLowerCase().includes("day") || f.timeline.toLowerCase().includes("semaine"))));
                const strategic  = findings.filter((f:any) => ["critical","high"].includes(f.severity) && !quickWins.includes(f));
                return (
                  <div className="px-4 py-2 border-b border-border-light flex items-center gap-1">
                    {[
                      { key:"all",      label: t(`All (${findings.length})`, `Tout (${findings.length})`), count: findings.length },
                      { key:"quick",    label: t(`Quick wins (${quickWins.length})`, `Rapides (${quickWins.length})`), count: quickWins.length },
                      { key:"strategic",label: t(`Strategic (${strategic.length})`, `Stratégiques (${strategic.length})`), count: strategic.length },
                    ].map(tab => (
                      <button key={tab.key}
                        onClick={() => setFindingsTab(tab.key as any)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors"
                        style={findingsTab === tab.key
                          ? { background:"#1B3A2D", color:"#fff" }
                          : { background:"transparent", color:"#8E8C85" }}>
                        {tab.label}
                      </button>
                    ))}
                    {findingsTab === "quick" && quickWins.length > 0 && (
                      <span className="ml-auto text-[11px] text-positive font-semibold">
                        {t("↑ Start here — low effort, immediate gain","↑ Commencez ici — effort faible, gain immédiat")}
                      </span>
                    )}
                  </div>
                );
              })()}
              <div className="divide-y divide-border-light">
                {(() => {
                  const visibleFindings = (findingsTab === "quick"
                    ? findings.filter((f:any) => ["medium","low"].includes(f.severity) || f.effort === "low" || (f.timeline && (f.timeline.toLowerCase().includes("week") || f.timeline.toLowerCase().includes("day") || f.timeline.toLowerCase().includes("semaine"))))
                    : findingsTab === "strategic"
                    ? findings.filter((f:any) => ["critical","high"].includes(f.severity))
                    : findings
                  );
                  const FREE_COUNT = 3;
                  const freeFindings   = visibleFindings.slice(0, FREE_COUNT);
                  const lockedFindings = visibleFindings.slice(FREE_COUNT);
                  const lockedValue    = lockedFindings.reduce((s: number, f: any) => s + ((f.impact_max || f.impact_min) ?? 0), 0);
                  return (<>
                    {freeFindings.map((f: any, i: number) => {
                      const sev = SEV[f.severity] || SEV.low;
                      return (
                        <div key={i} className="px-4 py-3 hover:bg-bg cursor-pointer group"
                          style={{ borderLeft: `3px solid ${sev.dot}` }}
                          onClick={() => reportId && router.push(`/v2/diagnostic/${reportId}`)}>
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-semibold text-ink truncate group-hover:text-brand transition-colors">
                                  {isFr ? (f.title_fr || f.title) : f.title}
                                </span>
                                <span className="font-serif text-[13px] font-bold text-negative ml-auto shrink-0">
                                  {fmtM((f.impact_max || f.impact_min) ?? 0)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-ink-faint">{f.category}</span>
                                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                                  style={{ background: sev.badge, color: sev.text }}>{f.severity}</span>
                                {f.timeline && <span className="text-[11px] text-ink-faint">{f.timeline}</span>}
                                {f.ebitda_improvement > 0 && (
                                  <span className="text-[11px] font-bold text-positive">+{fmtM(f.ebitda_improvement)} EBITDA</span>
                                )}
                                {f.enterprise_value_improvement > 0 && (
                                  <span className="text-[11px] font-semibold" style={{ color: "#1B3A2D" }}>+{fmtM(f.enterprise_value_improvement)} EV</span>
                                )}
                              </div>
                              {f.calculation_shown && (
                                <p className="text-[11px] text-ink-faint font-mono mt-1.5 bg-bg-section px-2 py-1 rounded leading-relaxed">
                                  {isFr ? (f.calculation_shown_fr || f.calculation_shown) : f.calculation_shown}
                                </p>
                              )}
                              {f.recommendation && (
                                <p className="text-[10px] font-medium mt-1.5 px-2 py-1 rounded"
                                  style={{ background: "rgba(27,58,45,0.04)", color: "#1B3A2D", borderLeft: "2px solid rgba(27,58,45,0.25)" }}>
                                  {isFr ? (f.recommendation_fr || f.recommendation) : f.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* ── Lock gate — findings 4+ ───────────────────────── */}
                    {lockedFindings.length > 0 && (
                      <div className="relative">
                        {/* Blurred preview rows */}
                        {lockedFindings.slice(0, 2).map((f: any, i: number) => {
                          const sev = SEV[f.severity] || SEV.low;
                          return (
                            <div key={i} className="px-4 py-3 select-none pointer-events-none"
                              style={{ borderLeft: `3px solid ${sev.dot}`, filter: "blur(4px)", opacity: 0.4 }}>
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-semibold text-ink flex-1">{isFr ? (f.title_fr || f.title) : f.title}</span>
                                <span className="font-serif text-[13px] font-bold text-negative">{fmtM((f.impact_max || f.impact_min) ?? 0)}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-ink-faint">{f.category}</span>
                                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: sev.badge, color: sev.text }}>{f.severity}</span>
                              </div>
                            </div>
                          );
                        })}
                        {/* Lock overlay */}
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.97) 40%)" }}>
                          <div className="text-center px-6 pt-8 pb-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3"
                              style={{ background: "rgba(27,58,45,0.08)" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                            </div>
                            <p className="text-[13px] font-bold text-ink mb-1">
                              {lockedFindings.length} {t("more findings locked", "constats supplémentaires verrouillés")}
                            </p>
                            {lockedValue > 0 && (
                              <p className="text-[11px] text-ink-muted mb-3">
                                {t("Additional", "Supplémentaire")} <span className="font-bold text-negative">{fmtM(lockedValue)}</span> {t("identified — recovered on contingency.", "identifié — récupéré à la performance.")}
                              </p>
                            )}
                            <p className="text-[11px] text-ink-muted mb-4">
                              {t("We find it. We recover it. You pay 12% of what we save you — nothing upfront.", "Nous trouvons. Nous récupérons. Vous payez 12% de ce que nous économisons — rien d'avance.")}
                            </p>
                            <a href={callHref} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold text-white rounded-lg transition hover:opacity-90"
                              style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 0112 2.18 2 2 0 0114.09 4v3.09a2 2 0 01-1.45 1.93l-1.37.46a16 16 0 006.29 6.29l.46-1.37a2 2 0 011.93-1.45z"/></svg>
                              {t("Book free strategy call →", "Réserver un appel stratégie gratuit →")}
                            </a>
                            <p className="text-[11px] text-ink-muted mt-2">{t("No credit card · No commitment · 30 min", "Sans carte · Sans engagement · 30 min")}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>);
                })()}
              </div>
            </div>
          </>
              );
            })()}

          {/* Right column */}
          <div className="space-y-3">

            {/* Score bars */}
            {hasReport && (
              <div className="bg-white rounded-xl border border-border-light p-4"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-3">{t("Score Breakdown", "Détail des scores")}</div>
                <div className="space-y-2">
                  {[
                    { label: t("Compliance", "Conformité"),   val: scores.compliance,     color: "#3b82f6" },
                    { label: t("Efficiency", "Efficacité"),   val: scores.efficiency,     color: "#2D7A50" },
                    { label: t("Optimization", "Optimisation"),val: scores.optimization,  color: "#1B3A2D" },
                    { label: t("Growth", "Croissance"),        val: scores.growth,         color: "#C4841D" },
                    { label: t("Bankability", "Bancabilité"), val: scores.bankability,    color: "#0369a1" },
                    { label: t("Exit Readiness", "Prêt à vendre"), val: scores.exit_readiness, color: "#1B3A2D" },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-ink-faint">{s.label}</span>
                        <span className="font-semibold" style={{ color: s.color }}>{s.val}</span>
                      </div>
                      <div className="h-[3px] bg-bg-section rounded-full">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: s.val + "%", background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exit readiness detail */}
            {exitReadiness && (
              <div className="bg-white rounded-xl border border-border-light p-4"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-3">{t("Exit Readiness Detail", "Détail — Prêt à vendre")}</div>
                {exitReadiness.value_killers?.map((vk: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 mb-1.5"
                    style={{ background: "rgba(179,64,64,0.04)", border: "1px solid rgba(179,64,64,0.10)" }}>
                    <span className="text-[11px] text-ink-muted flex-1">{vk.issue}</span>
                    <span className="text-[10px] text-negative font-bold shrink-0">-{fmtM(vk.valuation_discount ?? 0)}</span>
                  </div>
                ))}
                {exitReadiness.value_builders?.map((vb: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 mb-1.5"
                    style={{ background: "rgba(45,122,80,0.04)", border: "1px solid rgba(45,122,80,0.10)" }}>
                    <span className="text-[11px] text-ink-muted flex-1">{vb.strength}</span>
                    <span className="text-[10px] text-positive font-bold shrink-0">{vb.valuation_premium_label || (vb.valuation_premium_amount ? `+$${vb.valuation_premium_amount.toLocaleString()}` : "")}</span>
                  </div>
                ))}
                {exitReadiness.next_step && (
                  <p className="text-[10px] text-brand mt-2">{exitReadiness.next_step}</p>
                )}
              </div>
            )}

            {/* Deadlines */}
            {deadlines.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Deadlines", "Échéances")}</span>
                  <button onClick={() => router.push("/v2/obligations")}
                    className="text-[11px] font-semibold text-brand hover:underline">{t("All →", "Tout →")}</button>
                </div>
                <div className="divide-y divide-border-light">
                  {deadlines.slice(0, 5).map((d: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                        style={d.days_until <= 0
                          ? { background: "rgba(179,64,64,0.07)", color: "#B34040" }
                          : d.days_until <= 7
                          ? { background: "rgba(196,132,29,0.07)", color: "#C4841D" }
                          : { background: "rgba(142,140,133,0.07)", color: "#8E8C85" }}>
                        {d.days_until <= 0 ? t("LATE", "RETARD") : `${d.days_until}d`}
                      </span>
                      <span className="text-[11px] text-ink-muted flex-1 truncate">{d.title}</span>
                      {d.penalty_max > 0 && (
                        <span className="text-[10px] text-negative shrink-0">${(d.penalty_max ?? 0).toLocaleString()}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Executive summary (teaser — first sentence only) ────────────── */}
        {execSummary && (() => {
          const full = isFr ? (execSummaryFr || execSummary) : execSummary;
          const teaser = full.split(/[.!?]/)[0] + ".";
          return (
            <div className="bg-white rounded-xl border border-border-light px-5 py-4 mb-3"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">{t("Executive Summary", "Résumé exécutif")}</p>
              <p className="text-[12px] text-ink-muted leading-relaxed">{teaser}</p>
              <div className="mt-3 flex items-center gap-3 pt-3 border-t border-border-light">
                <div className="w-4 h-4 flex items-center justify-center shrink-0"
                  style={{ color: "#1B3A2D" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </div>
                <p className="text-[10px] text-ink-faint flex-1">{t("Full analysis, CPA briefing, and recovery sequence unlocked on your strategy call.", "Analyse complète, briefing CPA et séquence de récupération déverrouillés lors de votre appel stratégie.")}</p>
                <a href={callHref} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg text-white transition hover:opacity-90"
                  style={{ background: "#1B3A2D" }}>
                  {t("Book call →", "Réserver →")}
                </a>
              </div>
            </div>
          );
        })()}

        {/* ── Risk Matrix ─────────────────────────────────────────────────── */}
        {riskMatrix.length > 0 && (
          <div className="bg-white rounded-xl border border-border-light overflow-hidden mb-3"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Risk Matrix", "Matrice de risques")}</span>
              <span className="text-[11px] text-ink-faint">{riskMatrix.length} {t("risks identified", "risques identifiés")}</span>
            </div>
            <div className="divide-y divide-border-light">
              {riskMatrix.map((r: any, i: number) => {
                const rc = RISK_COLORS[r.risk_level] || RISK_COLORS.low;
                return (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-ink">{isFr ? (r.area_fr || r.area || r.risk) : (r.area || r.risk)}</span>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0"
                            style={{ background: rc.bg, color: rc.text }}>{r.risk_level}</span>
                        </div>
                        <p className="text-[10px] text-ink-faint mt-0.5">{isFr ? (r.current_status_fr || r.current_status) : r.current_status}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-ink-faint">L{r.likelihood} × I{r.impact}</div>
                        <div className="text-[10px] font-bold" style={{ color: rc.text }}>{(r.likelihood ?? 0) * (r.impact ?? 0)}</div>
                      </div>
                    </div>
                    {r.recommendation && (
                      <p className="text-[10px] text-brand mt-1">→ {isFr ? (r.recommendation_fr || r.recommendation) : r.recommendation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Book Strategy Call CTA — primary conversion action ── */}
        {hasReport && !entStatus?.engagement && (
          <a href={calendlyUrl}
            target="_blank" rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden mb-4 hover:shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
            <div className="px-5 py-5">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 0112 2.18 2 2 0 0114.09 4v3"/></svg>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{t("Next Step", "Prochaine étape")}</span>
              </div>
              <p className="text-[16px] font-bold text-white mb-1">{t("Book Your Free Strategy Call", "Réservez votre appel stratégie gratuit")}</p>
              <p className="text-[12px] text-white/70 mb-3">
                {t(`$${(totals.leaks ?? 0).toLocaleString()}/yr in recoverable leaks identified across ${findings.length} findings. Your dedicated recovery expert will walk through each one — 12% contingency, no cost if we don't find savings.`,
                   `${(totals.leaks ?? 0).toLocaleString()}$/an en fuites récupérables identifiées. Votre expert dédié examinera chaque constat — 12% à la performance, aucun frais si pas d'économies.`)}
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#1B3A2D] text-[12px] font-bold rounded-lg">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  {t("Book Free Call →", "Réserver →")}
                </span>
                <span className="text-[10px] text-white/50">{t("15 min · No commitment", "15 min · Sans engagement")}</span>
              </div>
            </div>
          </a>
        )}

        {/* ── Locked sections: CPA Briefing + Priority Sequence + Benchmarks ── */}
        {(briefing || planSequence.length > 0 || benchmarks.length > 0) && (() => {
          const lockedValue = findings.slice(3).reduce((s: number, f: any) => s + ((f.impact_max || f.impact_min) ?? 0), 0);

          // If in active engagement: show unlocked content
          if (entStatus?.engagement) {
            return (
              <div className="space-y-3 mb-4">
                {briefing && (
                  <div className="bg-white rounded-xl border border-[#E5E3DD] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">{t("CPA Briefing","Briefing CPA")}</p>
                    <p className="text-[12px] text-[#56554F] leading-relaxed whitespace-pre-wrap">{typeof briefing === "string" ? briefing : briefing.summary || briefing.text || JSON.stringify(briefing)}</p>
                  </div>
                )}
                {planSequence.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#E5E3DD] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">{t("Priority Recovery Sequence","Séquence de récupération prioritaire")}</p>
                    <div className="space-y-2">
                      {planSequence.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#1B3A2D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{s.step || i+1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-[#1A1A18] truncate">{s.action || s.title}</p>
                          </div>
                          {s.value > 0 && <span className="text-[11px] font-bold text-[#2D7A50] shrink-0">{fmtM(s.value)}/yr</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {benchmarks.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#E5E3DD] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">{t("Peer Benchmarks","Comparaisons aux pairs")}</p>
                    <div className="space-y-3">
                      {benchmarks.map((b: any, i: number) => {
                        const yours = parseFloat(b.yours || b.your_value) || 0;
                        const avg = parseFloat(b.industry_avg || b.average) || 0;
                        const aboveAvg = yours >= avg;
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-semibold text-[#1A1A18]">{b.metric || b.label}</span>
                              <span className={"text-[10px] font-bold " + (aboveAvg ? "text-[#2D7A50]" : "text-[#B34040]")}>{aboveAvg ? "▲ Above avg" : "▼ Below avg"}</span>
                            </div>
                            <div className="flex gap-4 text-[10px] text-[#8E8C85]">
                              <span>Yours: <b className="text-[#1A1A18]">{b.yours || b.your_value}</b></span>
                              <span>Avg: {b.industry_avg || b.average}</span>
                              <span>Top 25%: {b.top_quartile || b.best}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Not in engagement: show locked gate
          return (
            <div className="bg-white rounded-xl border overflow-hidden mb-3"
              style={{ borderColor: "rgba(27,58,45,0.15)", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              {/* Header */}
              <div className="px-5 py-4 border-b"
                style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{t("Locked", "Verrouillé")}</p>
                    </div>
                    <p className="text-[13px] font-bold text-white">
                      {t("CPA Briefing · Priority Sequence · Peer Benchmarks", "Briefing CPA · Séquence prioritaire · Benchmarks")}
                    </p>
                    {lockedValue > 0 && (
                      <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {fmtM(lockedValue)} {t("in additional findings behind this gate", "de constats supplémentaires derrière cette porte")}
                      </p>
                    )}
                  </div>
                  <a href={callHref} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 text-[11px] font-bold px-4 py-2 rounded-lg transition hover:opacity-90"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>
                    {t("Book free call →", "Réserver →")}
                  </a>
                </div>
              </div>
              {/* Preview items — blurred */}
              <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
                {[
                  { icon: "briefing", label: t("CPA / Board Briefing Memo", "Mémo Briefing CPA"), sub: profile.country === "US" ? "Entity optimization, tax exposure, talking points for your CPA" : t("RDTOH strategy, tax exposure, talking points for your accountant", "Stratégie IMRTD, exposition fiscale, points pour votre comptable") },
                  { icon: "seq", label: t("Priority Action Sequence", "Séquence d'actions prioritaires"), sub: t("Step-by-step recovery plan ranked by ROI and effort", "Plan de récupération étape par étape classé par ROI") },
                  { icon: "bench", label: t("Peer Benchmark Comparisons", "Comparaisons aux pairs sectoriels"), sub: t("How your margins, payroll ratio, and EBITDA compare to top quartile", "Comment vos marges, masse salariale et BAIIA se comparent aux meilleurs") },
                ].map((item, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-4" style={{ filter: "blur(0.5px)", opacity: 0.55 }}>
                    <span key={i} className="text-lg shrink-0">{item.icon}</span>
                    <div key={i} className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-ink">{item.label}</p>
                      <p className="text-[10px] text-ink-faint truncate">{item.sub}</p>
                    </div>
                    <div className="w-16 h-6 rounded bg-bg-section shrink-0" />
                  </div>
                ))}
              </div>
              {/* CTA footer */}
              <div className="px-5 py-4 flex flex-col sm:flex-row items-center gap-3"
                style={{ background: "#FAFAF8", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-ink">{t("We find it. We recover it. You pay nothing upfront.", "Nous trouvons. Nous récupérons. Vous ne payez rien d'avance.")}</p>
                  <p className="text-[10px] text-ink-faint mt-0.5">{t("12% contingency on confirmed savings — booked only after you approve each finding.", "12% à la performance sur les économies confirmées — facturé uniquement après approbation.")}</p>
                </div>
                <a href={callHref} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold text-white rounded-lg transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 0112 2.18 2 2 0 0114.09 4v3.09a2 2 0 01-1.45 1.93l-1.37.46a16 16 0 006.29 6.29l.46-1.37a2 2 0 011.93-1.45z"/></svg>
                  {t("Book free strategy call →", "Réserver un appel stratégie gratuit →")}
                </a>
              </div>
              <p className="text-center text-[11px] text-ink-faint pb-3">{t("No credit card · No commitment · 30 min call", "Sans carte · Sans engagement · Appel de 30 min")}</p>
            </div>
          );
        })()}

        {/* Next review trigger */}
        {nextReview && (
          <div className="flex items-center gap-3 bg-white border border-border-light rounded-xl px-5 py-3 mb-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <span className="text-ink-faint flex-shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
            <div>
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Next Review Recommended", "Prochaine révision recommandée")}</p>
              <p className="text-[12px] text-ink">{nextReview}</p>
            </div>
            <button onClick={() => router.push("/v2/diagnostic/intake")}
              className="ml-auto text-[10px] font-semibold text-brand hover:underline shrink-0">
              {t("New diagnostic →", "Nouveau diagnostic →")}
            </button>
          </div>
        )}

        {/* Empty state — prompt intake if no sections loaded */}
        {hasReport && !planSequence.length && !riskMatrix.length && !briefing && (
          <div className="bg-white rounded-xl border border-border-light px-5 py-6 mb-3 text-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <p className="text-[13px] font-semibold text-ink mb-1">{t("Complete your intake for the full analysis", "Complétez votre questionnaire pour l'analyse complète")}</p>
            <p className="text-[11px] text-ink-muted mb-3">{t("Upload financials and answer 5 more questions to unlock benchmarks, risk matrix, and board briefing.", "Téléversez vos états financiers pour débloquer les benchmarks, la matrice de risques et le briefing conseil.")}</p>
            <button onClick={() => router.push("/v2/diagnostic/intake")}
              className="text-[11px] font-semibold text-white rounded-lg px-4 py-2"
              style={{ background: "#1B3A2D" }}>
              {t("Complete intake →", "Compléter →")}
            </button>
          </div>
        )}


        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — ENGAGEMENT STATUS (progress bar through stages)
        ══════════════════════════════════════════════════════════════════ */}
        {entStatus && (entStatus.pipeline || entStatus.engagement) && (() => {
          const STAGES = [
            { key:"lead",              label:t("Lead","Prospect"),           labelFr:"Prospect" },
            { key:"contacted",         label:t("Contacted","Contacté"),      labelFr:"Contacté" },
            { key:"diagnostic_sent",   label:t("Diagnostic Sent","Diagnostic envoyé"), labelFr:"Diagnostic envoyé" },
            { key:"call_booked",       label:t("Call Booked","Appel réservé"), labelFr:"Appel réservé" },
            { key:"in_engagement",     label:t("Active Engagement","Engagement actif"), labelFr:"Engagement actif" },
            { key:"recovery_tracking", label:t("Recovery Tracking","Suivi récupération"), labelFr:"Suivi récupération" },
            { key:"completed",         label:t("Completed","Complété"),      labelFr:"Complété" },
          ];
          const currentStage = entStatus.pipeline?.stage || (entStatus.engagement ? "in_engagement" : "lead");
          const currentIdx   = STAGES.findIndex(s => s.key === currentStage);
          const pct          = Math.round(((currentIdx + 1) / STAGES.length) * 100);
          return (
            <div className="bg-white border border-border-light rounded-xl px-5 py-4 mb-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" , opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Engagement Status","Statut de l'engagement")}</p>
                  <p className="text-[13px] font-semibold text-ink mt-0.5">
                    {STAGES[currentIdx]?.label || t("In Progress","En cours")}
                    {entStatus.engagement?.targetCompletion && (
                      <span className="text-[10px] font-normal text-ink-faint ml-2">
                        · {t("Target","Cible")}: {new Date(entStatus.engagement.targetCompletion).toLocaleDateString(isFr?"fr-CA":"en-CA",{month:"short",year:"numeric"})}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: pct === 100 ? "rgba(45,122,80,0.1)" : "rgba(196,132,29,0.08)", color: pct === 100 ? "#2D7A50" : "#C4841D" }}>
                  {pct}%
                </span>
              </div>
              {/* Stage progress dots */}
              <div className="flex items-center gap-1 mb-2">
                {STAGES.map((s, i) => (
                  <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
                    <div key={i} className="w-full h-[3px] rounded-full" style={{ background: i <= currentIdx ? "#1B3A2D" : "#E5E3DD" }} />
                    {i === currentIdx && (
                      <div className="text-[10px] text-center font-semibold text-ink leading-tight hidden sm:block" style={{ color:"#1B3A2D" }}>
                        {isFr ? s.labelFr : s.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Mobile: just show current stage name */}
              <p className="text-[11px] text-ink-faint sm:hidden">
                {t("Step","Étape")} {currentIdx + 1}/{STAGES.length} — {isFr ? STAGES[currentIdx]?.labelFr : STAGES[currentIdx]?.label}
              </p>
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — ADVISOR / REP ASSIGNMENT
        ══════════════════════════════════════════════════════════════════ */}
        {entStatus?.rep && (
          <div className="bg-white border border-border-light rounded-xl px-5 py-4 mb-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" , opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s" }}>
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3">{t("Your Fruxal Advisor","Votre conseiller Fruxal")}</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0"
                style={{ background:"#1B3A2D" }}>
                {entStatus.rep.name?.charAt(0)?.toUpperCase() || "F"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-ink">{entStatus.rep.name}</p>
                <p className="text-[10px] text-ink-faint">{t("Senior Financial Advisor","Conseiller financier senior")} · Fruxal</p>
                {entStatus.rep.province && <p className="text-[11px] text-ink-faint/70">{entStatus.rep.province}</p>}
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {entStatus.rep.email && (
                  <div className="flex gap-2">
                  {calendlyUrl && (
                    <a href={calendlyUrl}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-bold h-7 px-3 rounded-lg border border-border-light text-ink hover:bg-bg-section transition flex items-center">
                      {t("Book Call","Réserver")}
                    </a>
                  )}
                  <a href={`mailto:${entStatus.rep.email}`}
                    className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-border-light text-ink hover:bg-bg-section transition text-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{display:"inline",marginRight:4}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{t("Email","Courriel")}
                  </a>
                  </div>
                )}
                {entStatus.rep.phone && (
                  <a href={`tel:${entStatus.rep.phone}`}
                    className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-border-light text-ink hover:bg-bg-section transition text-center">
                    <span className="inline-flex items-center gap-1.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 0112 2.18 2 2 0 0114.09 4v3.09a2 2 0 01-1.45 1.93l-1.37.46a16 16 0 006.29 6.29l.46-1.37a2 2 0 011.93-1.45z"/></svg> {t("Call","Appeler")}</span>
                  </a>
                )}
              </div>
            </div>
            {entStatus.rep.assignedAt && (
              <p className="text-[11px] text-ink-muted mt-2.5">
                {t("Assigned","Assigné")}: {new Date(entStatus.rep.assignedAt).toLocaleDateString(isFr?"fr-CA":"en-CA",{month:"long",day:"numeric",year:"numeric"})}
              </p>
            )}
          </div>
        )}
        {!entStatus?.rep && (
          <div className="bg-white border border-border-light rounded-xl px-5 py-4 mb-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" , opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s" }}>
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">{t("Your Fruxal Advisor","Votre conseiller Fruxal")}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-border-light flex items-center justify-center text-ink-faint shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              <div>
                <p className="text-[12px] text-ink">{t("Advisor assignment in progress","Assignation d'un conseiller en cours")}</p>
                <p className="text-[10px] text-ink-faint">{t("You'll be notified once a senior advisor is assigned to your file.","Vous serez notifié dès qu'un conseiller senior sera assigné à votre dossier.")}</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — DOCUMENT VAULT
        ══════════════════════════════════════════════════════════════════ */}
        {entStatusLoaded && (
          <div className="bg-white border border-border-light rounded-xl overflow-hidden mb-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" , opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s" }}>
            <button onClick={() => setDocExpanded(!docExpanded)}
              className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-bg-section/40 transition">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Document Vault","Coffre-fort documents")}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[13px] font-semibold text-ink">
                  {entStatus?.documents?.received ?? 0} / {entStatus?.documents?.total ?? 0} {t("received","reçus")}
                </p>
                  {(entStatus.documents?.total ?? 0) > 0 && (
                    <div className="flex-1 max-w-[120px] h-[4px] bg-bg-section rounded-full">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width:Math.round(((entStatus.documents?.received ?? 0)/(entStatus.documents?.total||1))*100) + "%", background:"#3D7A5E" }} />
                    </div>
                  )}
                  {(entStatus.documents?.pending ?? 0) > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background:"rgba(196,132,29,0.08)", color:"#C4841D" }}>
                      {entStatus.documents.pending} {t("pending","en attente")}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-ink-faint text-sm">{docExpanded ? "▲" : "▼"}</span>
            </button>
            {docExpanded && (
              <div className="px-5 pb-5 border-t border-border-light">
                {(entStatus.documents?.total ?? 0) === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-[12px] text-ink-faint">{t("No documents requested yet. Your advisor will populate this list once the engagement begins.","Aucun document demandé pour l'instant. Votre conseiller remplira cette liste au démarrage de l'engagement.")}</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {(entStatus.documents?.items || []).map((doc: any) => {
                      const isOk = doc.status === "received" || doc.status === "reviewed";
                      return (
                        <div key={doc.id} className="flex items-center gap-3 py-2 border-b border-border-light/60 last:border-0">
                          <span className="text-sm">{isOk ? (<span className="flex items-center justify-center w-5 h-5 rounded-full" style={{background:"rgba(45,122,80,0.1)",color:"#3D7A5E"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>) : (<span className="flex items-center justify-center w-5 h-5 rounded-full" style={{background:"rgba(142,140,133,0.08)",color:"#8E8C85"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-ink truncate">{doc.label || doc.document_type}</p>
                            {doc.notes && <p className="text-[11px] text-ink-faint truncate">{doc.notes}</p>}
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: isOk ? "rgba(45,122,80,0.08)" : "rgba(142,140,133,0.08)", color: isOk ? "#2D7A50" : "#8E8C85" }}>
                            {isFr ? (isOk ? "Reçu" : "En attente") : (isOk ? "Received" : "Pending")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-border-light">
                  <p className="text-[10px] text-ink-faint">{t("To submit documents, send them directly to your advisor or email","Pour soumettre des documents, envoyez-les directement à votre conseiller ou par courriel")} <a href="mailto:documents@fruxal.com" className="text-brand hover:underline">documents@fruxal.com</a></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — OUTREACH PIPELINE TRACKER
        ══════════════════════════════════════════════════════════════════ */}
        {entStatusLoaded && !entStatus?.pipeline && !entStatus?.engagement && (
          <div className="bg-white border border-border-light rounded-xl px-5 py-4 mb-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" , opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s" }}>
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">{t("Outreach Pipeline","Pipeline de prospection")}</p>
            <p className="text-[12px] text-ink mb-3">{t("Your file has not entered the active pipeline yet. Once your diagnostic is reviewed by our team, you'll be contacted to discuss an engagement.","Votre dossier n'est pas encore entré dans le pipeline actif. Une fois votre diagnostic examiné par notre équipe, vous serez contacté.")}</p>
            <button onClick={() => router.push("/v2/diagnostic/intake")}
              className="text-[11px] font-semibold text-white px-4 py-2 rounded-lg"
              style={{ background:"#1B3A2D" }}>
              {t("Run / Update Diagnostic →","Lancer / Mettre à jour le diagnostic →")}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            RECOVERY TIMELINE
        ══════════════════════════════════════════════════════════════════ */}
        {hasReport && (
          <div className="mb-4" style={fade(0.11)}>
            <RecoveryTimeline steps={buildTimelineSteps({
              prescanDate: lastRun || new Date().toISOString(),
              diagnosticDate: hasReport ? (lastRun || new Date().toISOString()) : undefined,
              repAssigned: !!entStatus?.rep,
              repName: entStatus?.rep?.name,
              engagementStarted: !!entStatus?.engagement,
              confirmedSavings: entStatus?.savings?.confirmed ?? 0,
              totalLeaks: findings.length,
            })} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ENTERPRISE INTELLIGENCE — Trends, Valuation, New Issues
        ══════════════════════════════════════════════════════════════════ */}
        {hasReport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4" style={fade(0.12)}>
            {/* Card 1: Health Score Trend */}
            <div className="bg-white rounded-xl border border-[#E5E3DD] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">{t("Health Score Trend","Tendance du pointage de santé")}</p>
              {trends.length > 1 ? (
                <div style={{ width: "100%", height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8E8C85" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#8E8C85" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E5E3DD" }} />
                      <Area type="monotone" dataKey="score" stroke="#2D7A50" fill="#2D7A50" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[140px]">
                  <p className="text-[11px] text-[#8E8C85] text-center">{t("Run more diagnostics to see your trend","Effectuez plus de diagnostics pour voir votre tendance")}</p>
                </div>
              )}
            </div>

            {/* Card 2: Recovery Velocity */}
            <div className="bg-white rounded-xl border border-[#E5E3DD] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">{t("Recovery Velocity","Vélocité de récupération")}</p>
              {trends.some((tr: any) => tr.recovered > 0) ? (
                <div style={{ width: "100%", height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8E8C85" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#8E8C85" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E5E3DD" }} formatter={(v: any) => [fmtM(Number(v)), t("Recovered","Récupéré")]} />
                      <Bar dataKey="recovered" fill="#2D7A50" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-[#8E8C85] text-right mt-1">
                    {t("Total recovered","Total récupéré")}: <span className="font-bold text-[#2D7A50]">{fmtM(trends.reduce((s: number, tr: any) => s + (tr.recovered || 0), 0))}</span>
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[140px]">
                  <p className="text-[11px] text-[#8E8C85] text-center">{t("Savings will appear here as your rep confirms recoveries","Les économies apparaîtront ici lorsque votre représentant confirmera les récupérations")}</p>
                </div>
              )}
            </div>

            {/* Card 3: Valuation Impact */}
            <div className="bg-white rounded-xl border border-[#E5E3DD] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">{t("Enterprise Value Impact","Impact sur la valeur d'entreprise")}</p>
              {totals.ebitda_impact > 0 ? (
                <div>
                  <p className="text-[11px] text-[#56554F] mb-2">{t("If you fix all identified leaks:","Si vous corrigez toutes les fuites identifiées :")}</p>
                  <p className="text-[13px] font-bold text-[#1A1A18] mb-3">
                    +{fmtM(totals.ebitda_impact)} {t("EBITDA/yr","BAIIA/an")} → +{fmtM(totals.ebitda_impact * 4)} {t("to","à")} {fmtM(totals.ebitda_impact * 6)} {t("enterprise value","valeur d'entreprise")}
                  </p>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-[#8E8C85]">
                        <th className="text-left font-semibold pb-1">{t("Multiple","Multiple")}</th>
                        <th className="text-right font-semibold pb-1">{t("Value Impact","Impact valeur")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#1A1A18]">
                      {[4, 5, 6].map(m => (
                        <tr key={m} className="border-t border-[#E5E3DD]/60">
                          <td className="py-1.5 font-medium">{m}×</td>
                          <td className="py-1.5 text-right font-bold text-[#2D7A50]">+{fmtM(totals.ebitda_impact * m)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[140px]">
                  <p className="text-[11px] text-[#8E8C85] text-center">{t("Run diagnostic to see valuation impact","Lancez un diagnostic pour voir l'impact sur la valeur")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — SAVINGS TRACKER
        ══════════════════════════════════════════════════════════════════ */}
        {entStatus?.engagement && (
          <div className="bg-white border border-border-light rounded-xl overflow-hidden mb-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" , opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.12s" }}>
            <button onClick={() => setSavingsExpanded(!savingsExpanded)}
              className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-bg-section/40 transition">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Savings Tracker","Suivi des économies")}</p>
                <div className="flex items-end gap-6 mt-1.5">
                  <div>
                    <p className="text-[22px] font-bold text-ink leading-none">{fmtM(entStatus.savings?.confirmed ?? 0)}</p>
                    <p className="text-[11px] text-ink-faint mt-0.5">{t("Confirmed savings","Économies confirmées")}</p>
                  </div>
                  {totals.savings > 0 && (
                    <div>
                      <p className="text-[15px] font-semibold text-ink-muted leading-none">{fmtM(totals.savings)}</p>
                      <p className="text-[11px] text-ink-faint mt-0.5">{t("Projected","Projeté")}</p>
                    </div>
                  )}
                  {(entStatus.savings?.confirmed ?? 0) > 0 && totals.savings > 0 && (
                    <div className="flex-1 max-w-[100px]">
                      <div className="h-[4px] bg-bg-section rounded-full">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width:Math.min(100,Math.round((entStatus.savings.confirmed/totals.savings)*100)) + "%", background:"#3D7A5E" }} />
                      </div>
                      <p className="text-[10px] text-ink-faint mt-0.5">
                        {Math.min(100,Math.round((entStatus.savings.confirmed/totals.savings)*100))}% {t("realized","réalisé")}
                      </p>
                    </div>
                  )}
                </div>
                {(entStatus.savings?.feeOwed ?? 0) > 0 && (
                  <p className="text-[11px] text-ink-muted mt-1.5">
                    {t("Contingency fee accrued","Honoraires à la performance accumulés")}:
                    <span className="font-semibold text-ink ml-1">{fmtM(entStatus.savings.feeOwed)}</span>
                    <span className="ml-1 text-ink-faint/70">({entStatus.savings.feePercentage}%)</span>
                  </p>
                )}
              </div>
              <span className="text-ink-faint text-sm mt-1 shrink-0">{savingsExpanded ? "▲" : "▼"}</span>
            </button>
            {savingsExpanded && (
              <div className="px-5 pb-5 border-t border-border-light">
                {(entStatus.savings?.findings?.length ?? 0) === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-[12px] text-ink-faint">{t("No savings confirmed yet. Your advisor will record findings as they are verified through your financial documents.","Aucune économie confirmée pour l'instant. Votre conseiller enregistrera les résultats au fur et à mesure de leur vérification.")}</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {entStatus.savings.findings.map((f: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-border-light/60 last:border-0">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{background:"rgba(45,122,80,0.08)",color:"#3D7A5E"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-ink truncate">{f.leak_name}</p>
                          <p className="text-[11px] text-ink-faint">{f.category}{f.confidence_note ? ` · ${f.confidence_note}` : ""}</p>
                        </div>
                        <p className="text-[13px] font-bold shrink-0 text-brand-accent">{fmtM(f.confirmed_amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* New Issues Alert */}
        {newIssues.length > 0 && (
          <div className="bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-xl px-5 py-4 mb-4 flex items-start gap-3" style={fade(0.13)}>
            <span className="shrink-0 mt-0.5 text-[#F59E0B]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#92400E] mb-1">
                {newIssues.length} {t("new issues detected this month","nouveaux problèmes détectés ce mois-ci")}
              </p>
              <div className="space-y-1.5">
                {newIssues.slice(0, 3).map((issue: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={"text-[9px] font-bold uppercase px-1.5 py-0.5 rounded " +
                      (issue.severity === "critical" ? "bg-[#FEE2E2] text-[#B91C1C]" :
                       issue.severity === "high" ? "bg-[#FEF3C7] text-[#92400E]" :
                       "bg-[#E5E3DD] text-[#56554F]")}>
                      {issue.severity || "new"}
                    </span>
                    <span className="text-[11px] text-[#1A1A18] truncate">{issue.title || issue.leak_name || issue.name}</span>
                    {(issue.impact_max || issue.impact_min || issue.amount) > 0 && (
                      <span className="text-[11px] font-bold text-[#B34040] shrink-0">{fmtM(issue.impact_max || issue.impact_min || issue.amount)}</span>
                    )}
                  </div>
                ))}
              </div>
              {newIssues.length > 3 && (
                <button onClick={() => router.push("/v2/leaks")} className="text-[11px] font-semibold text-[#92400E] hover:underline mt-2">
                  {t("View all","Voir tout")} →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            QBR — QUARTERLY BUSINESS REVIEW
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden mb-4" style={fade(0.13)}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-border-light/50">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "rgba(45,122,80,0.08)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              </span>
              <h3 className="text-[13px] font-bold text-ink">{t("Quarterly Business Review", "Revue trimestrielle")}</h3>
            </div>
            {qbr?.generated_at && (
              <span className="text-[10px] text-ink-faint">
                {new Date(qbr.generated_at).toLocaleDateString(isFr ? "fr-CA" : "en-CA", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
          <div className="px-5 py-4">
            {qbr ? (
              <>
                <p className="text-[12px] text-ink-secondary leading-relaxed">
                  {qbrExpanded
                    ? qbr.summary
                    : (qbr.summary || "").split("\n").slice(0, 2).join("\n").slice(0, 200) + ((qbr.summary || "").length > 200 ? "..." : "")}
                </p>
                {qbr.highlights?.length > 0 && qbrExpanded && (
                  <div className="mt-3 space-y-1.5">
                    {qbr.highlights.map((h: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-ink-muted">
                        <span className="text-brand mt-0.5">{">"}</span>
                        <span>{typeof h === "string" ? h : (h as any).text || JSON.stringify(h)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {qbr.next_review_date && qbrExpanded && (
                  <p className="text-[10px] text-ink-faint mt-3">
                    {t("Next review:", "Prochaine revue:")} {new Date(qbr.next_review_date + "T12:00:00").toLocaleDateString(isFr ? "fr-CA" : "en-CA", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
                <button onClick={() => setQbrExpanded(!qbrExpanded)}
                  className="text-[11px] font-semibold text-brand hover:underline mt-2">
                  {qbrExpanded ? t("Collapse", "Réduire") : t("View Full QBR", "Voir la revue complète")}
                </button>
              </>
            ) : (
              <p className="text-[12px] text-ink-faint">
                {t("Your first QBR will be available after your initial review call", "Votre première revue trimestrielle sera disponible après votre appel initial")}
              </p>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 — QUICK ACTIONS
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4" style={fade(0.14)}>
          {/* Book a call */}
          <a href={callHref}
            target="_blank" rel="noopener noreferrer"
            className="bg-white border border-border-light rounded-xl px-4 py-4 flex flex-col gap-2 hover:border-brand/30 hover:shadow-sm transition group">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg-section text-ink-muted group-hover:text-brand transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 0112 2.18 2 2 0 0114.09 4v3.09a2 2 0 01-1.45 1.93l-1.37.46a16 16 0 006.29 6.29l.46-1.37a2 2 0 011.93-1.45z"/></svg></span>
            <p className="text-[12px] font-bold text-ink">{t("Book a Call","Réserver un appel")}</p>
            <p className="text-[11px] text-ink-faint">{t("Schedule a strategy call","Planifiez un appel stratégie")}</p>
          </a>

          {/* Send to accountant */}
          <button onClick={() => setShowCpaModal(true)}
            disabled={!hasReport}
            className="bg-white border border-border-light rounded-xl px-4 py-4 flex flex-col gap-2 hover:border-brand/30 hover:shadow-sm transition group text-left disabled:opacity-40">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg-section text-ink-muted group-hover:text-brand transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <p className="text-[12px] font-semibold text-ink">{t("Send to Accountant","Envoyer au comptable")}</p>
            <p className="text-[11px] text-ink-faint">{t("Pre-written briefing email with findings","Courriel de synthèse pré-rédigé avec constats")}</p>
          </button>

          {/* Copy Share Link */}
          <button onClick={async () => {
            if (!businessId) return;
            try {
              const r = await fetch("/api/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId }),
              });
              const d = await r.json();
              if (d.url) {
                setShareUrl(d.url);
                await navigator.clipboard.writeText(d.url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 3000);
              }
            } catch {}
          }}
            disabled={!hasReport || !businessId}
            className="bg-white border border-border-light rounded-xl px-4 py-4 flex flex-col gap-2 hover:border-brand/30 hover:shadow-sm transition group text-left disabled:opacity-40">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg-section text-ink-muted group-hover:text-brand transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
            </span>
            <p className="text-[12px] font-semibold text-ink">{shareCopied ? t("Copied!","Copié!") : t("Copy Share Link","Copier le lien de partage")}</p>
            <p className="text-[11px] text-ink-faint">{t("Read-only link for your accountant or partner","Lien en lecture seule pour votre comptable ou partenaire")}</p>
          </button>

          {/* Download PDF */}
          <button onClick={() => reportId && window.open(`/api/v2/diagnostic/${reportId}/pdf?language=${lang}`, "_blank")}
            disabled={!reportId}
            className="bg-white border border-border-light rounded-xl px-4 py-4 flex flex-col gap-2 hover:border-brand/30 hover:shadow-sm transition group disabled:opacity-40 text-left">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg-section text-ink-muted group-hover:text-brand transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>
            <p className="text-[12px] font-semibold text-ink">{t("Download PDF","Télécharger PDF")}</p>
            <p className="text-[11px] text-ink-faint">{t("Board-ready diagnostic report","Rapport de diagnostic prêt pour le conseil")}</p>
          </button>

          {/* Request deeper audit */}
          <button onClick={rerunDiagnostic} disabled={rerunning || isAnalyzing}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border-light hover:border-brand/20 hover:bg-brand/[0.03] transition disabled:opacity-40">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg-section text-ink-muted group-hover:text-brand transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </span>
            <p className="text-[12px] font-semibold text-ink">{rerunning ? t("Starting…","Démarrage…") : t("Re-run Diagnostic","Relancer")}</p>
            <p className="text-[10px] text-ink-faint text-center">{t("Refresh with latest data","Actualiser avec données récentes")}</p>
          </button>
          <a href={`mailto:hello@fruxal.com?subject=${encodeURIComponent(t("Request a deeper audit","Demander un audit approfondi"))}&body=${encodeURIComponent(t("Hi, I'd like to request a deeper audit of my business.","Bonjour, je souhaite demander un audit approfondi de mon entreprise."))}`}
            className="bg-white border border-border-light rounded-xl px-4 py-4 flex flex-col gap-2 hover:border-brand/30 hover:shadow-sm transition group">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg-section text-ink-muted group-hover:text-brand transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <p className="text-[12px] font-semibold text-ink">{t("Request Deeper Audit","Audit approfondi")}</p>
            <p className="text-[11px] text-ink-faint">{t("QuickBooks, payroll, tax strategy deep dive","QuickBooks, paie, stratégie fiscale")}</p>
          </a>

          {/* Update intake */}
          <button onClick={() => router.push("/v2/diagnostic/intake")}
            className="bg-white border border-border-light rounded-xl px-4 py-4 flex flex-col gap-2 hover:border-brand/30 hover:shadow-sm transition group text-left">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg-section text-ink-muted group-hover:text-brand transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
            <p className="text-[12px] font-semibold text-ink">{t("Update Intake","Mettre à jour l'intake")}</p>
            <p className="text-[11px] text-ink-faint">{t("New fiscal year? Update your profile for a fresh diagnostic","Nouvel exercice? Mettez à jour votre profil")}</p>
          </button>

          {/* AI advisor chat */}
          <button onClick={() => router.push("/v2/chat")}
            className="border border-border-light rounded-xl px-4 py-4 flex flex-col gap-2 hover:shadow-sm transition group text-left"
            style={{ background:"linear-gradient(135deg,rgba(27,58,45,0.04),rgba(45,122,80,0.06))" }}>
            <span className="flex items-center justify-center w-9 h-9 rounded-xl text-ink-muted group-hover:text-brand transition-colors" style={{background:"rgba(27,58,45,0.06)"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 014 4v1h1a3 3 0 013 3v6a3 3 0 01-3 3H7a3 3 0 01-3-3V10a3 3 0 013-3h1V6a4 4 0 014-4z"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/><path d="M9 17s1 1 3 1 3-1 3-1"/></svg></span>
            <p className="text-[12px] font-semibold text-ink">{t("Ask AI Advisor","Demander à l'IA")}</p>
            <p className="text-[11px] text-ink-faint">{t("Drill into any finding with your AI financial advisor","Explorez chaque résultat avec votre conseiller IA")}</p>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 7 — ENTERPRISE AI TOOLS
        ══════════════════════════════════════════════════════════════════ */}
        <div className="mb-4" style={fade(0.16)}>
          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3">{t("AI-Powered Intelligence","Intelligence IA")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {/* Scenario Modeler */}
            <button onClick={async () => {
              setActiveAiTool(activeAiTool === "scenario" ? null : "scenario");
              if (!scenarioResult && !aiToolLoading) {
                setAiToolLoading("scenario");
                try {
                  const r = await fetch("/api/v2/scenario-model", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ scenario: "What happens if we fix all critical leaks?" }) });
                  const d = await r.json(); if (d.success || d.analysis) setScenarioResult(d.analysis || d.data || d);
                } catch {} finally { setAiToolLoading(null); }
              }
            }} className="bg-white border border-border-light rounded-xl p-4 text-left hover:border-brand/30 hover:shadow-sm transition group">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#2D7A50]/8 text-[#2D7A50]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 20h20"/><path d="M5 20V8l5 4 4-8 5 4v12"/></svg>
                </span>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-ink">{t("Scenario Modeler","Modélisateur de scénarios")}</p>
                  <p className="text-[10px] text-ink-faint">{t("What-if analysis on your leaks","Analyse hypothétique sur vos fuites")}</p>
                </div>
                {aiToolLoading === "scenario" && <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />}
              </div>
            </button>

            {/* Tax Calendar */}
            <button onClick={async () => {
              setActiveAiTool(activeAiTool === "tax" ? null : "tax");
              if (!taxCalendar && !aiToolLoading) {
                setAiToolLoading("tax");
                try {
                  const r = await fetch("/api/v2/tax-calendar");
                  const d = await r.json(); if (d.success || d.calendar) setTaxCalendar(d.calendar || d.data || d);
                } catch {} finally { setAiToolLoading(null); }
              }
            }} className="bg-white border border-border-light rounded-xl p-4 text-left hover:border-brand/30 hover:shadow-sm transition group">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#B34040]/8 text-[#B34040]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
                </span>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-ink">{t("Tax Calendar","Calendrier fiscal")}</p>
                  <p className="text-[10px] text-ink-faint">{t("12-month compliance timeline","Échéancier de conformité 12 mois")}</p>
                </div>
                {aiToolLoading === "tax" && <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />}
              </div>
            </button>

            {/* Anomaly Detection */}
            <button onClick={async () => {
              setActiveAiTool(activeAiTool === "anomaly" ? null : "anomaly");
              if (!anomalies && !aiToolLoading) {
                setAiToolLoading("anomaly");
                try {
                  const r = await fetch("/api/v2/anomaly-detect", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({}) });
                  const d = await r.json(); if (d.success || d.anomalies) setAnomalies(d.anomalies || d.data || d);
                } catch {} finally { setAiToolLoading(null); }
              }
            }} className="bg-white border border-border-light rounded-xl p-4 text-left hover:border-brand/30 hover:shadow-sm transition group">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#C4841D]/8 text-[#C4841D]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </span>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-ink">{t("Anomaly Detection","Détection d'anomalies")}</p>
                  <p className="text-[10px] text-ink-faint">{t("Find unusual patterns in your financials","Trouvez les anomalies dans vos finances")}</p>
                </div>
                {aiToolLoading === "anomaly" && <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />}
              </div>
            </button>

            {/* Industry Report */}
            <button onClick={async () => {
              setActiveAiTool(activeAiTool === "industry" ? null : "industry");
              if (!industryReport && !aiToolLoading) {
                setAiToolLoading("industry");
                try {
                  const r = await fetch("/api/v2/industry-report");
                  const d = await r.json(); if (d.success || d.report) setIndustryReport(d.report || d.data || d);
                } catch {} finally { setAiToolLoading(null); }
              }
            }} className="bg-white border border-border-light rounded-xl p-4 text-left hover:border-brand/30 hover:shadow-sm transition group">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0369a1]/8 text-[#0369a1]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </span>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-ink">{t("Industry Report","Rapport sectoriel")}</p>
                  <p className="text-[10px] text-ink-faint">{t("Board-ready industry benchmarking","Comparaison sectorielle pour le CA")}</p>
                </div>
                {aiToolLoading === "industry" && <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />}
              </div>
            </button>

            {/* Intelligence Engine */}
            <button onClick={async () => {
              setActiveAiTool(activeAiTool === "intelligence" ? null : "intelligence");
              if (!intelligence && !aiToolLoading) {
                setAiToolLoading("intelligence");
                try {
                  const r = await fetch("/api/v2/intelligence");
                  const d = await r.json(); if (d.success || d.insights) setIntelligence(d.insights || d.data || d);
                } catch {} finally { setAiToolLoading(null); }
              }
            }} className="bg-white border border-border-light rounded-xl p-4 text-left hover:border-brand/30 hover:shadow-sm transition group">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#7c3aed]/8 text-[#7c3aed]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2a4 4 0 014 4v1h1a3 3 0 013 3v6a3 3 0 01-3 3H7a3 3 0 01-3-3V10a3 3 0 013-3h1V6a4 4 0 014-4z"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/><path d="M9 17s1 1 3 1 3-1 3-1"/></svg>
                </span>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-ink">{t("Intelligence Engine","Moteur d'intelligence")}</p>
                  <p className="text-[10px] text-ink-faint">{t("Pattern discovery across your data","Découverte de patterns dans vos données")}</p>
                </div>
                {aiToolLoading === "intelligence" && <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />}
              </div>
            </button>
          </div>

          {/* AI Tool Results Panel */}
          {activeAiTool && (
            <div className="mt-3 bg-white border border-border-light rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-5 py-3 border-b border-border-light flex items-center justify-between">
                <p className="text-[12px] font-bold text-ink">
                  {activeAiTool === "scenario" && t("Scenario Analysis","Analyse de scénarios")}
                  {activeAiTool === "tax" && t("Tax Compliance Calendar","Calendrier de conformité fiscale")}
                  {activeAiTool === "anomaly" && t("Detected Anomalies","Anomalies détectées")}
                  {activeAiTool === "industry" && t("Industry Benchmarking Report","Rapport de comparaison sectorielle")}
                  {activeAiTool === "intelligence" && t("Intelligence Insights","Observations intelligentes")}
                </p>
                <button onClick={() => setActiveAiTool(null)} className="text-ink-faint hover:text-ink transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="px-5 py-4 max-h-[400px] overflow-y-auto">
                {aiToolLoading ? (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" />
                    <p className="text-[12px] text-ink-muted">{t("Analyzing your data with AI...","Analyse de vos données avec l'IA...")}</p>
                  </div>
                ) : (
                  <div className="text-[12px] text-ink-secondary leading-relaxed">
                    {activeAiTool === "scenario" && renderToolResult("scenario", scenarioResult)}
                    {activeAiTool === "tax" && renderToolResult("tax", taxCalendar)}
                    {activeAiTool === "anomaly" && renderToolResult("anomaly", anomalies)}
                    {activeAiTool === "industry" && renderToolResult("industry", industryReport)}
                    {activeAiTool === "intelligence" && renderToolResult("intelligence", intelligence)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            CPA / ACCOUNTANT EMAIL MODAL
        ══════════════════════════════════════════════════════════════════ */}
        {showCpaModal && (() => {
          const topFindings = findings.slice(0, 5);
          const reportUrl   = reportId ? `${typeof window !== "undefined" ? window.location.origin : ""}/v2/diagnostic/${reportId}` : "";
          const kpiLine     = [
            totals.leaks      > 0 ? `Annual revenue leak: ${fmtM(totals.leaks)}`           : null,
            totals.ebitda_impact > 0 ? `EBITDA impact if corrected: +${fmtM(totals.ebitda_impact)}` : null,
            totals.enterprise_value_impact > 0 ? `Enterprise value upside: +${fmtM(totals.enterprise_value_impact)}` : null,
            scores.exit_readiness > 0 ? `Exit readiness score: ${scores.exit_readiness}/100` : null,
          ].filter(Boolean).join("\n");

          const findingsText = topFindings.map((f: any, i: number) =>
            `${i+1}. ${f.title}${f.impact_max ? " — " + fmtM(f.impact_max) : ""}${f.recommendation ? "\n   → " + f.recommendation : ""}`
          ).join("\n");

          const briefingText = briefing?.key_findings?.length
            ? "\nCPA Notes:\n" + (briefing.key_findings || []).slice(0,3).map((kf: any) => `• ${kf}`).join("\n")
            : "";

          const emailSubject = isFr
            ? `Analyse financière — ${profile.industry || "Votre entreprise"} (Fruxal)`
            : `Financial diagnostic — ${profile.industry || "Your business"} (Fruxal)`;

          const emailBody = isFr ? `Bonjour,

Je vous transmets les résultats de notre analyse financière Fruxal pour examen.

${kpiLine}

Principaux constats :
${findingsText}${briefingText}

${reportUrl ? "Rapport complet : " + reportUrl : ""}

Ce rapport identifie des opportunités d'optimisation qui méritent votre attention en tant que comptable.

Cordialement` : `Hi,

Please find attached the results of our Fruxal financial diagnostic for your review.

${kpiLine}

Key findings:
${findingsText}${briefingText}

${reportUrl ? "Full report: " + reportUrl : ""}

This report identifies optimization opportunities that warrant your attention as our accountant.

Best regards`;

          const mailtoHref = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-light flex items-center justify-between shrink-0">
                  <div>
                    <p className="text-[13px] font-semibold text-ink">
                      {t("Send to Accountant / CPA", "Envoyer au comptable / CPA")}
                    </p>
                    <p className="text-[10px] text-ink-faint mt-0.5">
                      {t("Pre-written briefing email — edit before sending", "Courriel de synthèse pré-rédigé — modifiez avant d'envoyer")}
                    </p>
                  </div>
                  <button onClick={() => { setShowCpaModal(false); setCpaCopied(false); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-bg-section text-ink-faint transition">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Subject preview */}
                <div className="px-6 py-3 border-b border-border-light shrink-0" style={{ background: "#FAFAF8" }}>
                  <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">{t("Subject", "Objet")}</p>
                  <p className="text-[12px] text-ink">{emailSubject}</p>
                </div>

                {/* Email body preview */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2">{t("Body", "Corps du message")}</p>
                  <pre className="text-[11px] text-ink-muted leading-relaxed whitespace-pre-wrap font-sans">
                    {emailBody}
                  </pre>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-border-light flex items-center gap-3 shrink-0">
                  <a href={mailtoHref}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold text-white transition"
                    style={{ background: "#1B3A2D" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {t("Open in Mail", "Ouvrir dans Mail")}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`Subject: ${emailSubject}\n\n${emailBody}`)
                        .then(() => { setCpaCopied(true); setTimeout(() => setCpaCopied(false), 2500); })
                        .catch(() => {});
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold border border-border-light hover:bg-bg-section transition"
                    style={{ color: cpaCopied ? "#2D7A50" : "#56554F" }}>
                    {cpaCopied ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> {t("Copied!", "Copié!")}</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> {t("Copy text", "Copier le texte")}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Footer action */}
        <div className="text-center pb-8">
          <button onClick={() => router.push("/v2/diagnostic/intake")}
            className="text-[11px] text-ink-faint hover:text-brand underline">
            {t("Run new diagnostic →", "Nouveau diagnostic →")}
          </button>
        </div>

      </div>
      <Suspense fallback={null}><AiChatWidget position="floating" /></Suspense>
      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}