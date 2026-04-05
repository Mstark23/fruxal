// =============================================================================
// FRUXAL DASHBOARD — BUSINESS TIER
// Base: same structure/layout/features as the original unified dashboard.
// Added: diagnostic layer → bankability_score (5th KPI), calculation_shown
//        on findings, accountant_briefing card, benchmark_comparisons.
// =============================================================================

"use client";
import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
const AiChatWidget = lazy(() => import("@/components/v2/AiChatWidget"));
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCelebration } from "@/hooks/useCelebration";
import { RecoveryCounter } from "@/components/v2/RecoveryCounter";
import RecoveryTimeline, { buildTimelineSteps } from "@/components/v2/RecoveryTimeline";
import StreakTracker from "@/components/celebrations/StreakTracker";
import MilestoneCards, { MILESTONE_DEFINITIONS } from "@/components/celebrations/MilestoneCards";
import SavingsCounter from "@/components/celebrations/SavingsCounter";
import { LiveScoreRing, ScoreSparkline, ScoreBreakdown, ScoreRingAddons } from "@/components/v2/LiveScoreRing";

function Ring({ pct, size = 44, sw = 4, color = "#2D7A50" }: { pct: number; size?: number; sw?: number; color?: string }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EFEB" strokeWidth={sw} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 1s ease" }} /></svg>;
}

function LockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C5C2BB" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}

interface Leak { slug: string; title: string; title_fr?: string; severity: string; category: string; description: string; description_fr?: string; impact_min: number; impact_max: number; confidence: number | null; affiliates?: Array<{ name: string; url: string }> }

interface Deadline { title: string; days_until: number; penalty_max?: number }
const SEV_DOT: Record<string, string> = { critical: "#B34040", high: "#C4841D", medium: "#0369a1", low: "#8E8C85" };

export default function BusinessDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { progress } = useCelebration();
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [mounted, setMounted] = useState(false);

  // — existing dashboard state —
  const [score, setScore] = useState(0);
  const [totalLeak, setTotalLeak] = useState(0);
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [profile, setProfile] = useState(() => {
    let cookieCountry = "";
    try { cookieCountry = document.cookie.match(/fruxal_country=(\w+)/)?.[1] || ""; } catch {}
    return { province: "", country: cookieCountry, industry: "Small Business", structure: "" };
  });
  const [overdue, setOverdue] = useState(0);
  const [penaltyExposure, setPenaltyExposure] = useState(0);
  const [obligationsTotal, setObligationsTotal] = useState(0);
  const [programsAvailable, setProgramsAvailable] = useState(0);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [leaksFixed, setLeaksFixed] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [assignedRep, setAssignedRep] = useState<{ name: string; calendly_url: string | null; contingency_rate: number; pipeline_stage: string | null } | null>(null);
  const [integrations, setIntegrations] = useState<{ quickbooks: boolean; plaid: boolean }>({ quickbooks: false, plaid: false });
  const [connectDismissed, setConnectDismissed] = useState(false);

  const [reportId, setReportId] = useState<string | null>(null);
  const [dashboardBusinessId, setDashboardBusinessId] = useState<string>("");
  const [diagTasks, setDiagTasks] = useState<any[]>([]);
  const [taskSavingsAvail, setTaskSavingsAvail] = useState(0);
  const [taskSavingsRecov, setTaskSavingsRecov] = useState(0);
  const [bankabilityScore, setBankabilityScore] = useState(0);
  const [diagFindings, setDiagFindings] = useState<any[]>([]);
  const [briefing, setBriefing] = useState<any>(null);
  const [diagBenchmarks, setDiagBenchmarks] = useState<any[]>([]);
  const [planSequence, setPlanSequence] = useState<any[]>([]);

  // T2 is free — affiliates are the revenue, not subscriptions
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scoreExpanded, setScoreExpanded] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<{ compliance: number; efficiency: number; optimization: number; growth: number } | null>(null);

  const t = useCallback((en: string, fr: string) => lang === "fr" ? fr : en, [lang]);
  const isFR = lang === "fr";

  useEffect(() => {
    try { const s = sessionStorage.getItem("lg_prescan_lang"); if (s === "en" || s === "fr") setLang(s); } catch { /* non-fatal */ }

    const params = new URLSearchParams(window.location.search);
    const rid = params.get("prescanRunId");
    const isPreview = params.get("preview") === "1";
    const v2Url = rid ? `/api/v2/dashboard?prescanRunId=${rid}` : "/api/v2/dashboard";

    const v2P = fetch(v2Url).then(r => r.json()).catch(() => ({})).then(json => {
      if (!json.success || !json.data) return;
      const d = json.data;
      const detectedTier = (d.tier || "business").toLowerCase();
      // redirect if wrong tier — skip in preview mode
      if (!isPreview) {
        if (detectedTier === "free" || detectedTier === "solo" || detectedTier === "pro") { router.replace("/v2/dashboard/solo"); return; }
        if (detectedTier === "enterprise") { router.replace("/v2/dashboard/enterprise"); return; }
      }
      setProfile(d.profile || { province: "", country: "", industry: "Small Business", structure: "" });
      setObligationsTotal(d.obligations?.total ?? 0);
      setOverdue(d.obligations?.overdue ?? 0);
      setPenaltyExposure(d.obligations?.penalty_exposure ?? 0);
      setDeadlines(d.obligations?.upcoming_deadlines || []);
      setProgramsAvailable(d.programs?.available ?? 0);
      setLeaksFixed(d.leaks?.fixed ?? 0);
      setTotalSavings(d.leaks?.total_savings ?? 0);
      if (d.assigned_rep) setAssignedRep(d.assigned_rep);
      if (d.integrations) setIntegrations(d.integrations);
      if (d.leaks?.top_unfixed?.length > 0) {
        setScore(d.health_score || 50);
        setTotalLeak(d.total_leak_estimate ?? 0);
        const sev = (s: any) => { if (typeof s === "string" && ["critical","high","medium","low"].includes(s)) return s; const n = Number(s); return isNaN(n) ? "medium" : n >= 80 ? "critical" : n >= 60 ? "high" : n >= 30 ? "medium" : "low"; };
        setLeaks(d.leaks.top_unfixed.map((l: any) => ({ slug: l.slug, title: l.title, title_fr: l.title_fr, severity: sev(l.severity), category: l.category || "Général", description: l.description || "", description_fr: l.description_fr, impact_min: l.impact_min ?? 0, impact_max: (l.impact_max || l.impact_min) ?? 0, confidence: l.confidence, affiliates: l.affiliates || [] })));
      }
    }).catch(() => {});

    // — diagnostic layer —
    let analyzePoll: ReturnType<typeof setInterval> | null = null;

    let isAnalyzingNow = false; // sync flag for finally() to read

    const loadDiag = async () => {
      try {
        const json = await fetch("/api/v2/diagnostic/latest").then(r => r.json());
        // MUST check status BEFORE checking data — analyzing returns data:null
        if (json.status === "analyzing" || json.data?.status === "analyzing") {
          setIsAnalyzing(true);
          isAnalyzingNow = true;
          return;
        }
        if (!json.success || !json.data) return;
        const r = json.data;
        setIsAnalyzing(false);
        setReportId(json.report_id || null);
        const diagScore = r.scores?.overall ?? r.overall_score ?? 0;
        if (diagScore > 0) setScore(diagScore);
        // Extract score breakdown components if available
        const bd = {
          compliance:   r.scores?.compliance   ?? r.compliance_score   ?? 0,
          efficiency:   r.scores?.efficiency   ?? r.efficiency_score   ?? 0,
          optimization: r.scores?.optimization ?? r.optimization_score ?? 0,
          growth:       r.scores?.growth       ?? r.growth_score       ?? 0,
        };
        if (bd.compliance || bd.efficiency || bd.optimization || bd.growth) setScoreBreakdown(bd);
        const diagLeak = r.totals?.annual_leaks ?? r.total_annual_leaks ?? 0;
        if (diagLeak > 0) setTotalLeak(diagLeak);
        setBankabilityScore(r.scores?.bankability ?? r.bankability_score ?? 0);
        if (r.findings?.length > 0) setDiagFindings(r.findings);
        setBriefing(r.accountant_briefing || r.cpa_briefing || null);
        setDiagBenchmarks((r.benchmark_comparisons || []).slice(0, 5));
        if (r.action_plan) {
          if (!Array.isArray(r.action_plan) && r.action_plan.optimal_sequence) {
            setPlanSequence(r.action_plan.optimal_sequence.slice(0, 4));
          } else if (Array.isArray(r.action_plan)) {
            setPlanSequence(r.action_plan.slice(0, 4).map((a: any, i: number) => ({
              step: a.priority || i + 1,
              action: a.title || a.action || "",
              value: (a.estimated_savings || a.value) ?? 0,
            })));
          }
        }
      } catch { /* non-fatal */ }
    };

    const diagP = loadDiag();

    const taskP = (async () => {
      try {
        const dash = await fetch("/api/v2/dashboard").then(r => r.ok ? r.json() : null).catch(() => null);
        const bid = dash?.data?.businessId;
        if (bid) setDashboardBusinessId(bid);
      } catch { /* non-fatal */ }
    })();

    Promise.all([v2P, diagP, taskP]).finally(() => {
      setLoading(false);
      requestAnimationFrame(() => setMounted(true));
      // Gap 1 fix: only start poll when actually analyzing — not on every page load
      if (isAnalyzingNow) {
        analyzePoll = setInterval(async () => {
          try {
            const json = await fetch("/api/v2/diagnostic/latest").then(r => r.json());
            if (json.status === "analyzing" || json.data?.status === "analyzing") return;
            clearInterval(analyzePoll!);
            await loadDiag();
          } catch { /* non-fatal */ }
        }, 4000);
      }
    });

    return () => { if (analyzePoll) clearInterval(analyzePoll); };
  }, [user?.id]);

  const recovered = totalSavings ?? 0;
  const recovPct = totalLeak > 0 ? Math.min(100, Math.round((recovered / totalLeak) * 100)) : 0;
  const streak = (progress as any)?.streak;
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? t("Good morning", "Bonjour") : h < 18 ? t("Good afternoon", "Bon après-midi") : t("Good evening", "Bonsoir"); })();
  const fade = (d = 0) => ({ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: `all 0.45s cubic-bezier(0.16,1,0.3,1) ${d}s` } as React.CSSProperties);
  const displayLeaks = diagFindings.length > 0 ? diagFindings.slice(0, 6) : leaks.slice(0, 6);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center"><div className="relative w-10 h-10"><div className="absolute inset-0 rounded-[10px] border-2 border-[#1B3A2D]/20 border-t-[#1B3A2D] animate-spin" style={{ animationDuration: "1.2s" }} /><div className="absolute inset-0 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2.2" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg></div></div></div>
  );

  if (!loading && leaks.length === 0 && diagFindings.length === 0 && !totalLeak && !isAnalyzing) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(27,58,45,0.06)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <p className="font-serif text-xl text-ink mb-2">{t("Let's find your leaks", "Trouvons vos fuites")}</p>
        <p className="text-sm text-ink-muted mb-6">{profile.country === "US"
                ? "Answer a few questions about your business and get your financial health score, detected leaks, CPA briefing, and recovery plan — takes about 5 minutes."
                : t("Answer a few questions about your business and get your financial health score, detected leaks, accountant briefing, and recovery plan — takes about 5 minutes.", "Répondez à quelques questions sur votre entreprise et obtenez votre score de santé, fuites détectées, briefing comptable et plan de récupération — environ 5 minutes.")}</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push("/v2/diagnostic")} className="px-6 py-2.5 text-sm font-semibold text-white bg-brand rounded-lg hover:opacity-90 transition">
            {t("Run diagnostic →", "Lancer le diagnostic →")}
          </button>
          <button onClick={() => router.push("/")} className="px-6 py-2 text-[13px] font-semibold text-ink-muted bg-white border border-border-light rounded-lg hover:bg-bg-section transition">
            {t("Or try the free prescan first →", "Ou essayer le préscan gratuit →")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-bg min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-[1100px]">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-5" style={fade(0)}>
          <div>
            <h1 className="text-[15px] font-semibold text-ink">{greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-ink-faint">{profile.industry} · {profile.province}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(27,58,45,0.10)", color: "#1B3A2D" }}>Business</span>
              {streak && streak.current > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-[2px]">{streak.week_map?.map((a: boolean, i: number) => <div key={i} className={`w-[4px] h-[4px] rounded-[1px] ${a ? "bg-positive" : "bg-border"}`} />)}</div>
                  <span className="text-[11px] text-ink-faint">{streak.current}{t("d", "j")}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile.country !== "US" && (
              <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="h-6 px-2.5 text-[11px] font-bold text-ink-muted bg-white border border-border-light rounded-md hover:bg-bg-section transition">{lang === "fr" ? "EN" : "FR"}</button>
            )}
            {reportId && <button onClick={() => router.push(`/v2/diagnostic/${reportId}`)} className="h-6 px-2.5 text-[11px] font-bold text-brand bg-brand/5 border border-brand/15 rounded-md hover:bg-brand/10 transition">{t("Full Report →", "Rapport →")}</button>}
          </div>
        </div>

        {/* CONNECT DATA BANNER */}
        {!connectDismissed && !integrations.quickbooks && !integrations.plaid && !loading && (
          <div className="w-full rounded-xl mb-4 border border-[#0A85EA]/20 bg-[#0A85EA]/[0.03] px-4 py-3.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#0A85EA]/10 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A85EA" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-ink">{t("Connect your financial data", "Connectez vos données financières")}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">{t("Link QuickBooks or your bank account for real numbers instead of estimates.", "Liez QuickBooks ou votre compte bancaire pour des montants réels.")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-12 sm:ml-0">
                <button onClick={() => window.open("/api/quickbooks/connect", "_blank")}
                  className="h-8 px-3.5 text-[11px] font-bold text-white bg-[#2CA01C] rounded-lg hover:opacity-90 transition">QuickBooks</button>
                <button onClick={() => window.open("/v2/integrations", "_blank")}
                  className="h-8 px-3.5 text-[11px] font-bold text-[#0A85EA] bg-[#0A85EA]/10 border border-[#0A85EA]/20 rounded-lg hover:bg-[#0A85EA]/15 transition">{t("Bank", "Banque")}</button>
                <button onClick={() => setConnectDismissed(true)}
                  className="w-6 h-6 flex items-center justify-center text-ink-faint hover:text-ink-muted transition">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANALYZING BANNER */}
        {isAnalyzing && (
          <div className="w-full rounded-xl mb-4 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)", ...fade(0.01) }}>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-white">{t("Business diagnostic in progress…", "Diagnostic business en cours…")}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>{t("Analyzing your business against 4,273 leak patterns…", "Analyse de votre entreprise avec 4 273 détecteurs de fuites…")}</p>
              </div>
            </div>
            <div className="px-4 pb-3">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full animate-pulse" style={{ width: "65%", transition: "width 2s ease" }} />
              </div>
            </div>
          </div>
        )}



        {/* ═══ INTAKE GATE — dominant when no real diagnostic yet ═══ */}
        {!isAnalyzing && diagFindings.length === 0 && leaks.length > 0 && (
          <div className="w-full rounded-2xl mb-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2419 0%, #1B3A2D 60%, #1F4A36 100%)", border: "1px solid rgba(45,122,80,0.25)", ...fade(0.02) }}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">
                      {t("Estimates Only — Real Numbers Waiting", "Estimations seulement — vrais chiffres disponibles")}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-white leading-snug">
                    {t("Your leaks are real.", "Vos fuites sont réelles.")}
                    <br />
                    {t("Run the intake to confirm exact amounts.", "Lancez l'analyse pour confirmer les montants exacts.")}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                {[
                  { n: "1", text: t("Complete the 5-min intake form", "Remplissez le formulaire de 5 min") },
                  { n: "2", text: profile.country === "US" ? "Get exact dollar amounts + CPA briefing" : t("Get exact dollar amounts + accountant briefing", "Montants exacts + briefing comptable") },
                  { n: "3", text: t("Your rep gets the full picture to recover it", "Votre rep récupère le tout pour vous") },
                ].map(s => (
                  <div key={s.n} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-[10px] font-black text-amber-400 mb-1">{t("STEP", "ÉTAPE")} {s.n}</div>
                    <div className="text-[11px] text-white/70 leading-tight">{s.text}</div>
                  </div>
                ))}
              </div>
              {totalLeak > 0 && (
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <p className="text-[12px] text-white/60 flex-1">
                    {t("Estimated leak based on prescan:", "Fuite estimée selon le préscan :")}
                    <span className="font-black ml-1.5" style={{ color: "#B34040" }}>${totalLeak.toLocaleString()}/yr</span>
                    <span className="text-white/30 text-[11px] ml-1.5">{t("— confirm with intake", "— confirmer avec l'analyse")}</span>
                  </p>
                </div>
              )}
              <button onClick={() => router.push("/v2/diagnostic")}
                className="w-full py-3 rounded-xl text-center text-[13px] font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0F2419" }}>
                {t("Run My Full Intake Now →", "Lancer mon analyse complète →")}
              </button>
              <p className="text-center text-[10px] text-white/20 mt-2">
                {t("Takes ~5 min · Your rep is waiting for these numbers", "~5 min · Votre rep attend ces chiffres")}
              </p>
            </div>
          </div>
        )}

        {/* ═══ REP BOOKING BANNER — only after intake done ═══ */}
        {diagFindings.length > 0 && assignedRep && assignedRep.pipeline_stage !== "completed" && assignedRep.pipeline_stage !== "in_engagement" && assignedRep.pipeline_stage !== "recovery_tracking" && (
          <div className="w-full rounded-2xl mb-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2419 0%, #1B3A2D 60%, #1F4A36 100%)", border: "1px solid rgba(45,122,80,0.25)", ...fade(0.05) }}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">
                      {t("Recovery Expert Assigned", "Expert en récupération assigné")}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-white leading-snug">
                    {t("We found your leaks.", "Nous avons trouvé vos fuites.")}
                    <br />
                    {t("We'll fix them for you.", "Nous allons les corriger pour vous.")}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-[15px] font-bold text-emerald-300">
                  {assignedRep.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                {[
                  { n: "1", text: t("Book a free call with your rep", "Réservez un appel gratuit") },
                  { n: "2", text: profile.country === "US" ? "We handle all the work & IRS filings" : t("We handle all the work & CRA calls", "On s'occupe de tout") },
                  { n: "3", text: t(`You keep ${100 - (assignedRep.contingency_rate ?? 12)}% of what we recover`, `Vous gardez ${100 - (assignedRep.contingency_rate ?? 12)}% de ce qu'on récupère`) },
                ].map(s => (
                  <div key={s.n} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-[10px] font-black text-emerald-400 mb-1">{t("STEP", "ÉTAPE")} {s.n}</div>
                    <div className="text-[11px] text-white/70 leading-tight">{s.text}</div>
                  </div>
                ))}
              </div>
              {totalLeak > 0 && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{t("Your estimated annual leak", "Fuite annuelle estimée")}</div>
                    <div className="text-[18px] font-black" style={{ color: "#B34040" }}>${totalLeak.toLocaleString()}/yr</div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  <div className="text-right">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{t("You keep", "Vous gardez")}</div>
                    <div className="text-[18px] font-black text-emerald-400">${Math.round(totalLeak * (1 - (assignedRep.contingency_rate ?? 12) / 100)).toLocaleString()}/yr</div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                {assignedRep.calendly_url ? (
                  <a href={assignedRep.calendly_url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl text-center text-[13px] font-bold text-[#0F2419] transition-all hover:opacity-90 hover:-translate-y-px"
                    style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}>
                    {t(`Book a Free Call with ${assignedRep.name} →`, `Réserver un appel gratuit avec ${assignedRep.name} →`)}
                  </a>
                ) : (
                  <button className="flex-1 py-3 rounded-xl text-center text-[13px] font-bold text-white/40 cursor-not-allowed"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} disabled>
                    {t("Your rep will reach out shortly", "Votre rep vous contactera sous peu")}
                  </button>
                )}
                <div className="flex items-center justify-center gap-1 text-[10px] text-white/20 sm:w-auto">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  {t(`No cost until you recover. We take ${assignedRep.contingency_rate ?? 12}%.`, `Aucun frais avant récupération. On prend ${assignedRep.contingency_rate ?? 12}%.`)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ACTIVE ENGAGEMENT BANNER ═══ */}
        {assignedRep && (assignedRep.pipeline_stage === "in_engagement" || assignedRep.pipeline_stage === "recovery_tracking") && (
          <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-4" style={{ background: "rgba(27,58,45,0.06)", border: "1px solid rgba(27,58,45,0.15)", ...fade(0.04) }}>
            <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-[12px] font-bold text-brand">
              {assignedRep.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-ink">{t(`${assignedRep.name} is working on your recovery`, `${assignedRep.name} travaille sur votre récupération`)}</p>
              <p className="text-[10px] text-ink-faint mt-0.5">{t("We'll notify you as amounts are confirmed and recovered.", "Nous vous informerons au fur et à mesure des récupérations.")}</p>
            </div>
            {assignedRep.calendly_url && (
              <a href={assignedRep.calendly_url} target="_blank" rel="noopener noreferrer"
                className="shrink-0 h-8 px-3 text-[11px] font-bold text-brand border border-brand/20 rounded-lg hover:bg-brand/5 transition">
                {t("Check in →", "Suivi →")}
              </a>
            )}
          </div>
        )}

        {/* OVERDUE ALERT */}
        {overdue > 0 && (
          <button onClick={() => router.push("/v2/obligations")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-left" style={{ background: "rgba(179,64,64,0.03)", border: "1px solid rgba(179,64,64,0.1)", ...fade(0.02) }}>
            <div className="w-[6px] h-[6px] rounded-full bg-negative animate-pulse" />
            <span className="text-[11px] font-semibold text-negative flex-1">{overdue} {t("overdue obligation", "obligation en retard")}{overdue > 1 ? "s" : ""} · ${penaltyExposure.toLocaleString()} {t("at risk", "à risque")}</span>
            <span className="text-[10px] font-semibold text-negative">{t("Resolve →", "Résoudre →")}</span>
          </button>
        )}

        {/* KPI CARDS — 5 on business (adds Bankability) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5" style={fade(0.04)}>
          <div className="bg-white rounded-xl border border-border-light text-left transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <button onClick={() => setScoreExpanded(prev => !prev)} className="w-full p-5 text-left">
              <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Health Score", "Score santé")}</div>
              {score > 0 ? (
                <>
                  <div className="flex items-end gap-1.5">
                    <span className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: score >= 60 ? "#1B3A2D" : "#C4841D" }}>{score}</span>
                    <span className="text-xs text-ink-muted mb-1">/100</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8E8C85" strokeWidth="2.5" strokeLinecap="round" className="mb-1.5 ml-auto" style={{ transform: scoreExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  <div className="mt-3 h-[3px] bg-bg-section rounded-full"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: score >= 70 ? "#2D7A50" : score >= 40 ? "#C4841D" : "#B34040" }} /></div>
                  {dashboardBusinessId && (
                    <ScoreRingAddons businessId={dashboardBusinessId} lang={lang} />
                  )}
                </>
              ) : (
                <>
                  <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-ink-faint">—</div>
                  <div className="text-[11px] text-ink-muted mt-1.5">{t("Run diagnostic →", "Lancer →")}</div>
                </>
              )}
            </button>
            {scoreExpanded && (
              <div className="px-5 pb-4 pt-0 border-t border-border-light/50">
                <div className="text-[11px] font-semibold text-ink-muted mt-3 mb-2">{t("Your score is calculated from:", "Votre score est calculé à partir de :")}</div>
                {scoreBreakdown ? (
                  <div className="space-y-1.5">
                    {([
                      { key: "compliance", en: "Compliance", fr: "Conformité" },
                      { key: "efficiency", en: "Efficiency", fr: "Efficacité" },
                      { key: "optimization", en: "Optimization", fr: "Optimisation" },
                      { key: "growth", en: "Growth", fr: "Croissance" },
                    ] as const).map(c => {
                      const val = scoreBreakdown[c.key];
                      return (
                        <div key={c.key} className="flex items-center gap-2">
                          <span className="text-[11px] text-ink-muted w-24">{t(c.en, c.fr)}</span>
                          <div className="flex-1 h-[3px] bg-bg-section rounded-full">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: val + "%", background: val >= 70 ? "#2D7A50" : val >= 40 ? "#C4841D" : "#B34040" }} />
                          </div>
                          <span className="text-[10px] font-bold text-ink-muted w-6 text-right">{val || "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-ink-muted">{t("Run a diagnostic to see your score breakdown", "Lancez un diagnostic pour voir le détail de votre score")}</p>
                )}
                <button onClick={() => router.push("/v2/diagnostic")} className="mt-3 text-[11px] font-semibold text-brand hover:underline">
                  {t("View full report →", "Voir le rapport complet →")}
                </button>
              </div>
            )}
          </div>

          <button onClick={() => router.push("/v2/leaks")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Annual Leak", "Fuite annuelle")}</div>
            <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-negative">${(totalLeak ?? 0).toLocaleString()}</div>
            <div className="text-[11px] text-ink-muted mt-1.5">
              {displayLeaks.length} {t("findings", "constats")}
            </div>
          </button>

          <div className="bg-white rounded-xl p-5 border border-border-light" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Recovered", "Récupéré")}</div>
            {recovered > 0 || leaksFixed > 0 ? (
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-positive">${(recovered ?? 0).toLocaleString()}</div>
                  <div className="text-[11px] text-ink-muted mt-1.5">{leaksFixed} {t("fixed", "corrigés")}</div>
                </div>
                <div className="relative mt-1"><Ring pct={recovPct / 100} /><div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-bold text-positive">{recovPct}%</span></div></div>
              </div>
            ) : (
              <div>
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-ink-faint">—</div>
                <div className="text-[11px] text-ink-muted mt-1.5">{t("Pending recovery", "En attente de récupération")}</div>
              </div>
            )}
          </div>

          <button onClick={() => router.push("/v2/obligations")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">OBLIGATIONS</div>
            <div className="flex items-end gap-2">
              <span className="font-serif text-[36px] font-bold leading-none tracking-tight">{obligationsTotal}</span>
              {overdue > 0 && <span className="text-[10px] font-bold text-negative mb-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(179,64,64,0.05)" }}>{overdue} {t("late", "retard")}</span>}
            </div>
          </button>

          {/* ── DIAGNOSTIC ADDITION: Bankability KPI ── */}
          <button onClick={() => reportId ? router.push(`/v2/diagnostic/${reportId}`) : router.push("/v2/diagnostic")}
            className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">BANKABILITY ★</div>
            {bankabilityScore > 0 ? (
              <>
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: "#0369a1" }}>{bankabilityScore}</div>
                <div className="mt-3 h-[3px] bg-bg-section rounded-full"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${bankabilityScore}%`, background: "#0ea5e9" }} /></div>
              </>
            ) : (
              <div className="text-[11px] text-ink-muted mt-1">{t("Run diagnostic →", "Lancer diagnostic →")}</div>
            )}
          </button>
        </div>

        {/* Rerun diagnostic button */}
        {diagFindings.length > 0 && !isAnalyzing && (
          <div className="flex items-center gap-3 mb-4" style={fade(0.06)}>
            <button onClick={() => router.push("/v2/diagnostic")}
              className="h-8 px-4 text-[11px] font-bold text-brand border border-brand/20 rounded-lg hover:bg-brand/5 transition">
              {t("Rerun Diagnostic →", "Relancer le diagnostic →")}
            </button>
            <span className="text-[10px] text-ink-faint">{t("Updated data = more accurate findings", "Données mises à jour = résultats plus précis")}</span>
          </div>
        )}

        {/* MAIN 3-COL */}

        {/* ── RECOVERY COUNTER ────────────────────────────────────────── */}
        {dashboardBusinessId && (
          <div className="mb-4" style={fade(0.07)}>
            <RecoveryCounter businessId={dashboardBusinessId} mode="hero" lang={lang} />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-3" style={fade(0.1)}>

          {/* COL 1: LEAKS — with diagnostic math blocks */}
          <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Detected Leaks", "Fuites détectées")}</span>
              <button onClick={() => router.push("/v2/leaks")} className="text-[11px] font-semibold text-brand hover:underline">{t("View all →", "Tout voir →")}</button>
            </div>

            {diagFindings.length > 0 ? (
              // Diagnostic view: show findings with calculation math
              <>
                {diagFindings.slice(0, 6).map((f: any, i: number) => {
                  const costMonth = Math.round((f.impact_max ?? f.impact_min ?? 0) / 12);
                  return (
                  <div key={i} className={"px-4 py-3 border-b border-border-light last:border-0"}
                    style={{ borderLeft: `3px solid ${SEV_DOT[f.severity] || "#C5C2BB"}`, background: f.severity === "critical" ? "rgba(179,64,64,0.02)" : "transparent" }}>
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-[6px] h-[6px] rounded-full shrink-0 mt-1.5" style={{ background: SEV_DOT[f.severity] || "#8E8C85" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-ink truncate">{isFR ? (f.title_fr || f.title) : f.title}</span>
                          <span className="font-serif text-[13px] font-bold text-negative ml-auto shrink-0">${(f.impact_max ?? f.impact_min ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                            style={{ background: f.severity === "critical" ? "rgba(179,64,64,0.08)" : f.severity === "high" ? "rgba(196,132,29,0.08)" : f.severity === "medium" ? "rgba(3,105,161,0.08)" : "rgba(142,140,133,0.08)", color: SEV_DOT[f.severity] || "#8E8C85" }}>
                            {f.severity}
                          </span>
                          <span className="text-[10px] text-ink-faint">{f.category}</span>
                          {costMonth > 100 && <span className="text-[10px] font-semibold text-amber-600">⏱ ${t(`$${costMonth.toLocaleString()}/mo lost`, `${costMonth.toLocaleString()} $/mois perdu`)}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Root cause — customer context */}
                    {f.root_cause && (
                      <div className="ml-[14px] mt-1.5 text-[11px] text-ink-muted">
                        <span className="font-semibold text-ink-secondary">{t("Why: ", "Pourquoi : ")}</span>
                        {isFR ? (f.root_cause_fr || f.root_cause) : f.root_cause}
                      </div>
                    )}

                    {/* Calculation math */}
                    {f.calculation_shown && (
                      <div className="ml-[14px] mt-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(27,58,45,0.03)", border: "1px solid rgba(27,58,45,0.06)" }}>
                        <code className="text-[11px] text-ink-muted leading-relaxed">{isFR ? (f.calculation_shown_fr || f.calculation_shown) : f.calculation_shown}</code>
                      </div>
                    )}

                    {/* Compliance risk for critical findings */}
                    {f.compliance_risk && f.severity === "critical" && (
                      <div className="ml-[14px] mt-1.5 px-2.5 py-1.5 rounded-lg text-[10px]" style={{ background: "rgba(179,64,64,0.04)", border: "1px solid rgba(179,64,64,0.08)" }}>
                        <span className="font-semibold text-negative">{t("Risk: ", "Risque : ")}</span>
                        <span className="text-negative/80">{f.compliance_risk}</span>
                      </div>
                    )}

                    {/* Cascade bonus */}
                    {f.cascade_unlocks && (
                      <div className="ml-[14px] mt-1.5 text-[10px] text-positive">
                        <span className="font-semibold">{t("Fixing this also unlocks: ", "Corriger ceci débloque aussi : ")}</span>{f.cascade_unlocks}
                      </div>
                    )}
                  </div>
                  );
                })}
                {/* Lock gate for unpaid users */}
                <div className="px-4 py-2.5 bg-bg flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-ink-muted">Total</span>
                  <span className="font-serif text-[14px] font-bold text-negative">${(totalLeak ?? 0).toLocaleString()}/{t("yr", "an")}</span>
                </div>
              </>
            ) : (
              // Fallback: original leak list (free/prescan data)
              <>
                {leaks.slice(0, 6).map((l, i) => (
                  <div key={i} onClick={() => router.push("/v2/leaks")} className={"px-4 py-2.5 flex items-center gap-3 border-b border-border-light last:border-0 transition-colors hover:bg-surface-hover cursor-pointer group"}>
                    <div key={i} className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: SEV_DOT[l.severity] || "#8E8C85" }} />
                    <div key={i} className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-ink truncate">{isFR ? (l.title_fr || l.title) : l.title}</div>
                      <span className="text-[11px] text-ink-faint">{l.category}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max ?? l.impact_min ?? 0).toLocaleString()}</div>
                      <div className="text-[10px] text-ink-faint">/{t("yr", "an")}</div>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2.5 bg-bg flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-ink-muted">Total</span>
                  <span className="font-serif text-[14px] font-bold text-negative">${(totalLeak ?? 0).toLocaleString()}/{t("yr", "an")}</span>
                </div>
              </>
            )}
          </div>

          {/* COL 2: BOOK CALL CTA + REP STATUS + CPA BRIEFING + BENCHMARKS */}
          <div className="flex flex-col gap-3">

            {/* Book a Strategy Call CTA */}
            {totalLeak > 0 && !assignedRep && (
              <a href={process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/fruxal/strategy"}
                target="_blank" rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden hover:shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
                <div className="px-5 py-5">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 0112 2.18 2 2 0 0114.09 4v3"/></svg>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{t("Next Step", "Prochaine étape")}</span>
                  </div>
                  <p className="text-[16px] font-bold text-white mb-1">{t("Book Your Free Strategy Call", "Réservez votre appel stratégie gratuit")}</p>
                  <p className="text-[12px] text-white/70 mb-3">
                    {t(`$${(totalLeak ?? 0).toLocaleString()}/yr in leaks identified. A recovery expert will review each finding with you — 12% contingency, no cost if we don't find savings.`,
                       `${(totalLeak ?? 0).toLocaleString()}$/an en fuites identifiées. Un expert examinera chaque constat — 12% à la performance, aucun frais si pas d'économies.`)}
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#1B3A2D] text-[12px] font-bold rounded-lg">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                    {t("Book Free Call →", "Réserver →")}
                  </span>
                </div>
              </a>
            )}

            {/* Rep stage-aware card */}
            {diagFindings.length === 0 ? (
              /* No intake yet — show what the rep needs */
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("What Happens Next", "Ce qui se passe ensuite")}</span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {[
                    { n: "1", en: "Complete the intake — your rep needs real numbers", fr: "Complétez l'analyse — votre rep a besoin des vrais chiffres" },
                    { n: "2", en: "Rep reviews full diagnostic on the call", fr: "Le rep examine le diagnostic complet lors de l'appel" },
                    { n: "3", en: profile.country === "US" ? "Our CPA contacts the IRS & vendors" : "Our accountant contacts CRA & vendors", fr: "Notre comptable contacte l'ARC et les fournisseurs" },
                    { n: "4", en: "We invoice 12% of what we actually recover", fr: "Nous facturons 12% de ce que nous récupérons" },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: s.n === "1" ? "rgba(245,158,11,0.12)" : "rgba(27,58,45,0.07)" }}>
                        <span className="text-[9px] font-bold" style={{ color: s.n === "1" ? "#d97706" : "#1B3A2D" }}>{s.n}</span>
                      </div>
                      <span className="text-[12px] text-ink-secondary leading-tight" style={{ fontWeight: s.n === "1" ? 600 : 400 }}>{isFR ? s.fr : s.en}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <button onClick={() => router.push("/v2/diagnostic")}
                    className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-[13px] font-bold text-[#0F2419] transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                    {t("Run My Full Intake →", "Lancer mon analyse →")}
                  </button>
                  <p className="text-center text-[10px] text-ink-faint mt-2">{t("~5 min · Your rep is waiting", "~5 min · Votre rep attend")}</p>
                </div>
              </div>
            ) : assignedRep && (assignedRep.pipeline_stage === "in_engagement" || assignedRep.pipeline_stage === "recovery_tracking") ? (
              /* Rep actively working */
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Recovery in Progress", "Récupération en cours")}</span>
                </div>
                <div className="px-4 py-4">
                  <p className="text-[13px] font-semibold text-ink mb-1">
                    {t(`${assignedRep.name} is working on your file`, `${assignedRep.name} travaille sur votre dossier`)}
                  </p>
                  <p className="text-[11px] text-ink-muted mb-4">
                    {profile.country === "US" ? "Our CPA is handling the IRS filings, vendor negotiations, and federal program applications. You'll be notified as amounts are confirmed." : t("Our accountant is handling the CRA calls, vendor negotiations, and grant applications. You'll be notified as amounts are confirmed.", "Notre comptable s'occupe des appels à l'ARC, des négociations fournisseurs et des demandes de subventions.")}
                  </p>
                  {recovered > 0 && (
                    <div className="p-3 rounded-xl mb-3" style={{ background: "rgba(45,122,80,0.04)", border: "1px solid rgba(45,122,80,0.10)" }}>
                      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">{t("Recovered So Far", "Récupéré jusqu'à présent")}</p>
                      <p className="font-serif text-[24px] font-bold text-positive">${recovered.toLocaleString()}</p>
                    </div>
                  )}
                  {assignedRep.calendly_url && (
                    <a href={assignedRep.calendly_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[12px] font-semibold text-brand border border-brand/20 hover:bg-brand/5 transition">
                      {t("Check In with Your Rep →", "Faire le point avec votre rep →")}
                    </a>
                  )}
                </div>
              </div>
            ) : assignedRep ? (
              /* Intake done, rep assigned, not yet engaged — show booking steps */
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("What Happens Next", "Ce qui se passe ensuite")}</span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {[
                    { n: "1", en: "Book a free call with your assigned rep", fr: "Réservez un appel gratuit avec votre rep" },
                    { n: "2", en: "We review your full diagnostic together", fr: "Nous examinons votre diagnostic ensemble" },
                    { n: "3", en: profile.country === "US" ? "Our CPA contacts the IRS & vendors" : "Our accountant contacts CRA & vendors", fr: "Notre comptable contacte l'ARC et les fournisseurs" },
                    { n: "4", en: "We invoice 12% of what we actually recover", fr: "Nous facturons 12% de ce que nous récupérons" },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.07)" }}>
                        <span className="text-[9px] font-bold text-brand">{s.n}</span>
                      </div>
                      <span className="text-[12px] text-ink-secondary leading-tight">{isFR ? s.fr : s.en}</span>
                    </div>
                  ))}
                </div>
                {assignedRep.calendly_url && (
                  <div className="px-4 pb-4">
                    <a href={assignedRep.calendly_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-[13px] font-bold text-white transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)" }}>
                      {t(`Book a Call with ${assignedRep.name} →`, `Réserver un appel avec ${assignedRep.name} →`)}
                    </a>
                    <p className="text-center text-[10px] text-ink-faint mt-2">{t("No cost until we recover. We take 12%.", "Aucun frais avant récupération. On prend 12%.")}</p>
                  </div>
                )}
              </div>
            ) : (
              /* No rep yet — explain the process */
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("How Recovery Works", "Comment fonctionne la récupération")}</span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {[
                    { n: "1", en: "A recovery expert reviews your diagnostic", fr: "Un expert examine votre diagnostic" },
                    { n: "2", en: "They contact you to book a strategy call", fr: "Il vous contacte pour un appel stratégie" },
                    { n: "3", en: profile.country === "US" ? "Our CPA handles the IRS & vendors" : "Our accountant handles CRA & vendors", fr: "Notre comptable gère l'ARC et les fournisseurs" },
                    { n: "4", en: "You pay 12% only on confirmed savings", fr: "Vous payez 12% uniquement sur les économies confirmées" },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.07)" }}>
                        <span className="text-[9px] font-bold text-brand">{s.n}</span>
                      </div>
                      <span className="text-[12px] text-ink-secondary leading-tight">{isFR ? s.fr : s.en}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[11px] text-ink-faint" style={{ background: "rgba(27,58,45,0.03)", border: "1px solid rgba(27,58,45,0.08)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                    {t("A rep will be assigned shortly", "Un rep sera assigné sous peu")}
                  </div>
                </div>
              </div>
            )}

            {/* ── DIAGNOSTIC ADDITION: CPA Briefing (paid only) ── */}
            {briefing && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Accountant Briefing", "Briefing comptable")}</span>
                  <span className="text-[11px] text-ink-faint">{t("Share with CPA", "Partagez avec votre comptable")}</span>
                </div>
                <div className="px-4 py-3">
                  {/* intro / summary — AI uses 'intro', old schema used 'summary' */}
                  {(briefing.intro || briefing.summary) && (
                    <p className="text-[11px] text-ink-secondary leading-relaxed mb-3">
                      {isFR ? (briefing.intro_fr || briefing.intro || briefing.summary) : (briefing.intro || briefing.summary)}
                    </p>
                  )}
                  {/* talking points */}
                  {briefing.talking_points?.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {briefing.talking_points.slice(0, 3).map((tp: any, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-brand text-[11px] font-bold mt-0.5 shrink-0">→</span>
                          <p className="text-[11px] text-ink-secondary">
                            {isFR ? (typeof tp === "string" ? tp : (tp.point_fr || tp.point)) : (typeof tp === "string" ? tp : tp.point)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* CRA forms — AI uses 'forms_to_discuss', old schema used 'cra_forms_relevant' */}
                  {(briefing.forms_to_discuss?.length > 0 || briefing.cra_forms_relevant?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(briefing.forms_to_discuss || briefing.cra_forms_relevant || []).map((form: string, i: number) => (
                        <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#0e7490" }}>{form}</span>
                      ))}
                    </div>
                  )}
                  {/* Tax exposure — AI returns string 'tax_exposures', old schema had numeric 'estimated_tax_exposure' */}
                  {(briefing.tax_exposures || briefing.estimated_tax_exposure > 0) && (
                    <div className="px-3 py-2 rounded-lg mb-3" style={{ background: "rgba(196,132,29,0.04)", border: "1px solid rgba(196,132,29,0.10)" }}>
                      <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1">{t("Tax Exposure", "Exposition fiscale")}</p>
                      {briefing.tax_exposures ? (
                        <p className="text-[11px] font-medium" style={{ color: "#C4841D" }}>
                          {isFR ? (briefing.tax_exposures_fr || briefing.tax_exposures) : briefing.tax_exposures}
                        </p>
                      ) : (
                        <p className="font-serif text-[16px] font-bold" style={{ color: "#C4841D" }}>${(briefing.estimated_tax_exposure ?? 0).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                  {/* Questions to ask accountant */}
                  {briefing.questions_to_ask?.slice(0, 3).map((q: string, i: number) => (
                    <p key={i} className="text-[11px] text-ink-secondary italic mb-1 pl-2 border-l-2 border-border-light">"{q}"</p>
                  ))}
                </div>
              </div>
            )}

            {/* ── DIAGNOSTIC ADDITION: Priority sequence (paid only) ── */}
            {planSequence.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("What To Do First", "Quoi faire en premier")}</span>
                </div>
                {planSequence.slice(0, 4).map((s: any, i: number) => (
                  <div key={i} className="px-4 py-2.5 flex items-start gap-3 border-b border-border-light last:border-0">
                    <span className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.08)", color: "#1B3A2D" }}>{s.step ?? i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-ink-secondary">{isFR ? (s.action_fr || s.action || "") : (s.action || "")}</p>
                      {s.unlocks?.length > 0 && <p className="text-[11px] text-ink-faint mt-0.5">{t("Unlocks:", "Débloque:")} {s.unlocks.join(", ")}</p>}
                      {(s.why_first || s.description) && <p className="text-[11px] text-ink-faint mt-0.5 italic">{isFR ? (s.why_first_fr || s.why_first || s.description) : (s.why_first || s.description)}</p>}
                    </div>
                    {(s.value ?? s.estimated_savings ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-positive shrink-0">${(s.value ?? s.estimated_savings ?? 0).toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Benchmarks ── */}
            {diagBenchmarks.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Costs vs Industry", "Coûts vs industrie")}</span>
                  <div className="flex items-center gap-3 text-[10px] text-ink-faint">
                    <span>{t("You", "Vous")}</span><span>{t("Avg", "Moy.")}</span><span>Top 25%</span>
                  </div>
                </div>
                {diagBenchmarks.map((b, i) => {
                    const yours = parseFloat(String(b.your_value).replace(/[^0-9.\-]/g, ""));
                    const avg = parseFloat(String(b.industry_avg).replace(/[^0-9.\-]/g, ""));
                    const isAbove = !isNaN(yours) && !isNaN(avg) ? yours >= avg : null;
                    return (
                    <div key={i} className="px-4 py-2.5 border-b border-border-light last:border-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-semibold text-ink-secondary">{isFR ? (b.metric_name_fr || b.metric_fr || b.metric_name || b.metric || "") : (b.metric_name || b.metric || "")}</p>
                        {isAbove !== null && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: isAbove ? "rgba(45,122,80,0.08)" : "rgba(179,64,64,0.08)", color: isAbove ? "#2D7A50" : "#B34040" }}>
                            {isAbove ? t("Above avg", "Au-dessus") : t("Below avg", "En-dessous")}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 text-center">
                        <div><div className="text-[12px] font-bold" style={{ color: isAbove === null ? "#3D3D3A" : isAbove ? "#2D7A50" : "#B34040" }}>{b.your_value}</div><div className="text-[10px] text-ink-faint">{t("You", "Vous")}</div></div>
                        <div><div className="text-[12px] font-bold" style={{ color: "#0369a1" }}>{b.industry_avg}</div><div className="text-[10px] text-ink-faint">{t("Avg", "Moy.")}</div></div>
                        <div><div className="text-[12px] font-bold text-positive">{b.top_quartile}</div><div className="text-[10px] text-ink-faint">Top 25%</div></div>
                      </div>
                    </div>
                    );
                  })
                }
              </div>
            )}
          </div>

          {/* COL 3: SIDEBAR (identical to original) */}
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-2.5 border-b border-border-light flex justify-between items-center">
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Deadlines", "Échéances")}</span>
                <button onClick={() => router.push("/v2/obligations")} className="text-[11px] font-semibold text-brand hover:underline">{t("All →", "Tout →")}</button>
              </div>
              {deadlines.length === 0 ? (
                <div className="px-4 py-4 text-[11px] text-ink-faint text-center">{t("None upcoming", "Aucune échéance")}</div>
              ) : deadlines.slice(0, 4).map((dl, i) => (
                <div key={i} onClick={() => router.push("/v2/obligations")} className="px-4 py-2.5 flex items-center justify-between border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer">
                  <div key={i} className="flex-1 min-w-0 mr-2">
                    <div key={i} className="text-[11px] font-medium text-ink truncate">{dl.title}</div>
                    {(dl.penalty_max ?? 0) > 0 && <div className="text-[10px] text-ink-faint mt-0.5">${dl.penalty_max!.toLocaleString()}</div>}
                  </div>
                  <div className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-md shrink-0" style={{ background: dl.days_until <= 3 ? "#B34040" : dl.days_until <= 7 ? "rgba(179,64,64,0.06)" : "#F0EFEB", color: dl.days_until <= 3 ? "white" : dl.days_until <= 7 ? "#B34040" : "#8E8C85" }}>{dl.days_until}{t("d", "j")}</div>
                </div>
              ))}
            </div>

            <button onClick={() => router.push("/v2/programs")} className="w-full bg-white rounded-xl border border-border-light p-4 text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">{t("Government Programs", "Programmes gouvernementaux")}</div>
              <div className="flex items-end gap-2">
                <span className="font-serif text-[28px] font-bold leading-none tracking-tight text-positive">{programsAvailable}</span>
                <span className="text-[10px] text-ink-faint mb-0.5">{t("available for you", "disponibles pour vous")}</span>
              </div>
            </button>

            {/* Recovery Timeline */}
            {(assignedRep || totalSavings > 0) && (
              <RecoveryTimeline steps={buildTimelineSteps({
                prescanDate: new Date().toISOString(),
                diagnosticDate: diagFindings.length > 0 ? new Date().toISOString() : undefined,
                repAssigned: !!assignedRep,
                repName: assignedRep?.name,
                engagementStarted: assignedRep?.pipeline_stage === "in_engagement" || assignedRep?.pipeline_stage === "fee_collected",
                confirmedSavings: totalSavings,
                totalLeaks: leaks.length || diagFindings.length,
              })} />
            )}

            <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3">{t("Recovery", "Récupération")}</div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-bg-section rounded-full overflow-hidden"><div className="h-full rounded-full bg-positive transition-all duration-700" style={{ width: `${Math.max(recovPct, 1)}%` }} /></div>
                <span className="text-[12px] font-bold text-ink tabular-nums">{recovPct}%</span>
              </div>
              <div className="flex justify-between text-[11px] text-ink-faint">
                <span>${(recovered ?? 0).toLocaleString()} {t("recovered", "récupéré")}</span>
                <span>${(totalLeak ?? 0).toLocaleString()} total</span>
              </div>
            </div>

            <a href={process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/fruxal/advisor"} target="_blank" rel="noopener noreferrer" className="w-full bg-white rounded-xl border border-brand/15 p-4 text-left hover:shadow-[0_4px_16px_rgba(27,58,45,0.08)] transition-all block" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.128.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0122 16.92z"/></svg>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-ink">{t("Book advisor call", "Réserver un appel")}</div>
                  <div className="text-[11px] text-ink-faint">{t("Monthly 30-min included", "Session 30 min mensuelle incluse")}</div>
                </div>
              </div>
            </a>

            <button onClick={() => router.push("/v2/chat")} className="w-full bg-white rounded-xl border border-brand/15 p-4 text-left hover:shadow-[0_4px_16px_rgba(27,58,45,0.08)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-ink">{t("Ask Fruxal AI", "Demander à Fruxal IA")}</div>
                  <div className="text-[11px] text-ink-faint">{t("Get answers about your finances", "Posez vos questions financières")}</div>
                </div>
              </div>
            </button>

            {/* Gamification: Savings Counter */}
            {totalSavings > 0 && (
              <SavingsCounter total={totalSavings} leaksFixed={leaksFixed} totalLeaks={leaks.length || diagFindings.length || 1} />
            )}

            {/* Gamification: Streak Tracker */}
            {streak && streak.current > 0 && (
              <StreakTracker current={streak.current} longest={streak.longest || streak.current} todayActive={streak.today_active ?? true} weekMap={streak.week_map || []} />
            )}

            {/* Gamification: Milestones */}
            {progress && (
              <MilestoneCards
                earned={(progress as any).milestones?.filter((m: any) => m.earned_at) || []}
                nextUp={(() => {
                  const earnedIds = ((progress as any).milestones || []).filter((m: any) => m.earned_at).map((m: any) => m.id);
                  const next = MILESTONE_DEFINITIONS.find(d => !earnedIds.includes(d.id));
                  return next ? { id: next.id, icon: next.icon, label: next.label, description: next.description } : null;
                })()}
                totalAvailable={MILESTONE_DEFINITIONS.length}
              />
            )}
          </div>
        </div>

      </div>
      <Suspense fallback={null}><AiChatWidget position="floating" /></Suspense>
    </div>
  );
}