// =============================================================================
// FRUXAL DASHBOARD — BUSINESS TIER
// Base: same structure/layout/features as the original unified dashboard.
// Added: diagnostic layer → bankability_score (5th KPI), calculation_shown
//        on findings, accountant_briefing card, benchmark_comparisons.
// =============================================================================

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCelebration } from "@/hooks/useCelebration";

function Ring({ pct, size = 44, sw = 4, color = "#2D7A50" }: { pct: number; size?: number; sw?: number; color?: string }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EFEB" strokeWidth={sw} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 1s ease" }} /></svg>;
}

function LockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C5C2BB" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}

interface Leak { slug: string; title: string; title_fr?: string; severity: string; category: string; description: string; description_fr?: string; impact_min: number; impact_max: number; confidence: number | null; affiliates?: Array<{ name: string; url: string }> }

interface Deadline { title: string; days_until: number; penalty_max?: number }
interface ActionStats { total_recovered: number; actions_completed: number }
interface ActionItem { id: string; leak_title: string; fix_description: string; estimated_value: number; status: string }
const SEV_DOT: Record<string, string> = { critical: "#B34040", high: "#C4841D", medium: "#8E8C85", low: "#C5C2BB" };

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
  const [profile, setProfile] = useState({ province: "QC", industry: "Small Business", structure: "" });
  const [overdue, setOverdue] = useState(0);
  const [penaltyExposure, setPenaltyExposure] = useState(0);
  const [obligationsTotal, setObligationsTotal] = useState(0);
  const [programsAvailable, setProgramsAvailable] = useState(0);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [leaksFixed, setLeaksFixed] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [actionStats, setActionStats] = useState<ActionStats | null>(null);
  const [inProgressActions, setInProgressActions] = useState<ActionItem[]>([]);
  const [thisWeekActions, setThisWeekActions] = useState<ActionItem[]>([]);
  const [completedActions, setCompletedActions] = useState<ActionItem[]>([]);

  // — diagnostic additions —
  const [reportId, setReportId] = useState<string | null>(null);
  const [bankabilityScore, setBankabilityScore] = useState(0);
  const [diagFindings, setDiagFindings] = useState<any[]>([]);
  const [briefing, setBriefing] = useState<any>(null);
  const [diagBenchmarks, setDiagBenchmarks] = useState<any[]>([]);
  const [planSequence, setPlanSequence] = useState<any[]>([]);

  // — paywall state —
  const [isPaid, setIsPaid] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const upgradeUrl = "/v2/checkout?plan=business";
  const upgradePrice = "$149";

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
      // Paid = has an active business-level subscription
      setIsPaid(detectedTier === "business" || detectedTier === "growth" || detectedTier === "team" || detectedTier === "corp");
      setProfile(d.profile || { province: "QC", industry: "Small Business", structure: "" });
      setObligationsTotal(d.obligations?.total ?? 0);
      setOverdue(d.obligations?.overdue ?? 0);
      setPenaltyExposure(d.obligations?.penalty_exposure ?? 0);
      setDeadlines(d.obligations?.upcoming_deadlines || []);
      setProgramsAvailable(d.programs?.available ?? 0);
      setLeaksFixed(d.leaks?.fixed ?? 0);
      setTotalSavings(d.leaks?.total_savings ?? 0);
      if (d.leaks?.top_unfixed?.length > 0) {
        setScore(d.health_score || 50);
        setTotalLeak(d.total_leak_estimate ?? 0);
        const sev = (s: any) => { if (typeof s === "string" && ["critical","high","medium","low"].includes(s)) return s; const n = Number(s); return isNaN(n) ? "medium" : n >= 80 ? "critical" : n >= 60 ? "high" : n >= 30 ? "medium" : "low"; };
        setLeaks(d.leaks.top_unfixed.map((l: any) => ({ slug: l.slug, title: l.title, title_fr: l.title_fr, severity: sev(l.severity), category: l.category || "Général", description: l.description || "", description_fr: l.description_fr, impact_min: l.impact_min ?? 0, impact_max: l.impact_max || l.impact_min ?? 0, confidence: l.confidence, affiliates: l.affiliates || [] })));
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
              value: a.estimated_savings || a.value ?? 0,
            })));
          }
        }
      } catch { /* non-fatal */ }
    };

    const diagP = loadDiag();

    const actP = user?.id ? fetch("/api/v2/actions").then(r => r.json()).then(json => {
      if (json.stats) setActionStats(json.stats);
      if (json.actions) { setThisWeekActions(json.actions.this_week || []); setInProgressActions(json.actions.in_progress || []); setCompletedActions(json.actions.completed || []); }
    }).catch(() => {}) : Promise.resolve();

    Promise.all([v2P, diagP, actP]).finally(() => {
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

  const recovered = actionStats?.total_recovered || totalSavings ?? 0;
  const recovPct = totalLeak > 0 ? Math.min(100, Math.round((recovered / totalLeak) * 100)) : 0;
  const streak = (progress as any)?.streak;
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? t("Good morning", "Bonjour") : h < 18 ? t("Good afternoon", "Bon après-midi") : t("Good evening", "Bonsoir"); })();
  const fade = (d = 0) => ({ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: `all 0.45s cubic-bezier(0.16,1,0.3,1) ${d}s` } as React.CSSProperties);
  const allActions = [...inProgressActions, ...thisWeekActions];
  const displayLeaks = diagFindings.length > 0 ? diagFindings.slice(0, isPaid ? 6 : 3) : leaks.slice(0, isPaid ? 6 : 3);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" /></div>
  );

  if (!loading && leaks.length === 0 && diagFindings.length === 0 && !totalLeak && !isAnalyzing) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(27,58,45,0.06)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <p className="font-serif text-xl text-ink mb-2">{t("No diagnostic yet", "Aucun diagnostic")}</p>
        <p className="text-sm text-ink-muted mb-6">{t("Run your first diagnostic to see your full financial picture — health score, detected leaks, and a CPA briefing.", "Lancez votre premier diagnostic pour voir votre tableau financier complet.")}</p>
        <button onClick={() => router.push("/v2/diagnostic")} className="px-6 py-2.5 text-sm font-semibold text-white bg-brand rounded-lg hover:opacity-90 transition">
          {t("Run diagnostic →", "Lancer le diagnostic →")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-bg min-h-screen">
      <div className="px-6 lg:px-8 py-5 max-w-[1100px]">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-5" style={fade(0)}>
          <div>
            <h1 className="text-[15px] font-semibold text-ink">{greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-ink-faint">{profile.industry} · {profile.province}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(27,58,45,0.10)", color: "#1B3A2D" }}>Business</span>
              {streak && streak.current > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-[2px]">{streak.week_map?.map((a: boolean, i: number) => <div key={i} className={`w-[4px] h-[4px] rounded-[1px] ${a ? "bg-positive" : "bg-border"}`} />)}</div>
                  <span className="text-[9px] text-ink-faint">{streak.current}{t("d", "j")}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="h-6 px-2.5 text-[9px] font-bold text-ink-muted bg-white border border-border-light rounded-md hover:bg-bg-section transition">{lang === "fr" ? "EN" : "FR"}</button>
            {reportId && <button onClick={() => router.push(`/v2/diagnostic/${reportId}`)} className="h-6 px-2.5 text-[9px] font-bold text-brand bg-brand/5 border border-brand/15 rounded-md hover:bg-brand/10 transition">{t("Full Report →", "Rapport →")}</button>}
          </div>
        </div>

        {/* ANALYZING BANNER */}
        {isAnalyzing && (
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
            style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)", ...fade(0.01) }}>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-white">{t("Business diagnostic in progress…", "Diagnostic business en cours…")}</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>{t("This takes 30–60 seconds. Page will refresh automatically.", "Cela prend 30 à 60 secondes. La page se rafraîchira automatiquement.")}</p>
            </div>
          </div>
        )}

        {/* UPGRADE BANNER — unpaid users only */}
        {!isPaid && totalLeak > 0 && (
          <div className="rounded-xl mb-5 p-4 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: "linear-gradient(135deg, #1B3A2D, #2A5A44)", ...fade(0.03) }}>
            <div>
              <p className="text-[13px] font-bold text-white mb-1">
                {isFR ? `Votre entreprise perd $${totalLeak.toLocaleString()}/an` : `Your business is leaking $${totalLeak.toLocaleString()}/year`}
              </p>
              <p className="text-[11px] text-white/60">
                {t("Unlock full calculation math, CPA briefing, priority sequence and benchmarks.", "Débloquez les calculs complets, briefing CPA, séquence prioritaire et benchmarks.")}
              </p>
            </div>
            <button onClick={() => router.push(upgradeUrl)}
              className="px-4 py-2 text-[12px] font-bold text-brand bg-white rounded-lg hover:opacity-90 transition flex-shrink-0">
              Business {upgradePrice}/{t("mo", "mois")}
            </button>
          </div>
        )}

        {/* PAID NO-DIAGNOSTIC NUDGE — paid user has prescan data but hasn't run the full diagnostic yet */}
        {isPaid && diagFindings.length === 0 && leaks.length > 0 && !isAnalyzing && (
          <div className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl mb-4"
            style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.12)", ...fade(0.02) }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(27,58,45,0.08)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-ink">{t("You're seeing prescan estimates", "Vous voyez des estimations du prescan")}</p>
              <p className="text-[10px] text-ink-faint mt-0.5">{t("Run your Business diagnostic to get exact dollar amounts, calculation math, CPA briefing and benchmarks.", "Lancez votre diagnostic Business pour obtenir des montants exacts, calculs, briefing CPA et benchmarks.")}</p>
            </div>
            <button onClick={() => router.push("/v2/diagnostic")}
              className="shrink-0 h-8 px-4 text-[11px] font-bold text-white rounded-lg transition hover:opacity-90"
              style={{ background: "#1B3A2D" }}>
              {t("Run diagnostic →", "Lancer →")}
            </button>
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
          <button onClick={() => router.push("/v2/diagnostic")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{t("Health Score", "Score santé")}</div>
            {score > 0 ? (
              <>
                <div className="flex items-end gap-1.5">
                  <span className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: score >= 60 ? "#1B3A2D" : "#C4841D" }}>{score}</span>
                  <span className="text-xs text-ink-faint mb-1">/100</span>
                </div>
                <div className="mt-3 h-[3px] bg-bg-section rounded-full"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: score >= 70 ? "#2D7A50" : score >= 40 ? "#C4841D" : "#B34040" }} /></div>
              </>
            ) : (
              <>
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-ink-faint">—</div>
                <div className="text-[10px] text-ink-faint mt-1.5">{t("Run diagnostic →", "Lancer →")}</div>
              </>
            )}
          </button>

          <button onClick={() => router.push("/v2/leaks")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{t("Annual Leak", "Fuite annuelle")}</div>
            <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-negative">${(totalLeak ?? 0).toLocaleString()}</div>
            <div className="text-[10px] text-ink-faint mt-1.5">
              {displayLeaks.length} {t("findings", "constats")}
              {!isPaid && (diagFindings.length > 3 || leaks.length > 3) && (
                <span className="ml-1 text-negative font-semibold">
                  +{(diagFindings.length || leaks.length) - 3} {t("locked", "verrouillés")}
                </span>
              )}
            </div>
          </button>

          <div className="bg-white rounded-xl p-5 border border-border-light" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{t("Recovered", "Récupéré")}</div>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-positive">${(recovered ?? 0).toLocaleString()}</div>
                <div className="text-[10px] text-ink-faint mt-1.5">{leaksFixed} {t("fixed", "corrigés")}</div>
              </div>
              <div className="relative mt-1"><Ring pct={recovPct / 100} /><div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-bold text-positive">{recovPct}%</span></div></div>
            </div>
          </div>

          <button onClick={() => router.push("/v2/obligations")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">OBLIGATIONS</div>
            <div className="flex items-end gap-2">
              <span className="font-serif text-[36px] font-bold leading-none tracking-tight">{obligationsTotal}</span>
              {overdue > 0 && <span className="text-[10px] font-bold text-negative mb-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(179,64,64,0.05)" }}>{overdue} {t("late", "retard")}</span>}
            </div>
          </button>

          {/* ── DIAGNOSTIC ADDITION: Bankability KPI ── */}
          <button onClick={() => reportId ? router.push(`/v2/diagnostic/${reportId}`) : router.push("/v2/diagnostic")}
            className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">BANKABILITY ★</div>
            {bankabilityScore > 0 ? (
              <>
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: "#0369a1" }}>{bankabilityScore}</div>
                <div className="mt-3 h-[3px] bg-bg-section rounded-full"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${bankabilityScore}%`, background: "#0ea5e9" }} /></div>
              </>
            ) : (
              <div className="text-[11px] text-ink-faint mt-1">{t("Run diagnostic →", "Lancer diagnostic →")}</div>
            )}
          </button>
        </div>

        {/* MAIN 3-COL */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-3" style={fade(0.1)}>

          {/* COL 1: LEAKS — with diagnostic math blocks */}
          <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Detected Leaks", "Fuites détectées")}</span>
              <button onClick={() => router.push("/v2/leaks")} className="text-[9px] font-semibold text-brand hover:underline">{t("View all →", "Tout voir →")}</button>
            </div>

            {diagFindings.length > 0 ? (
              // Diagnostic view: show findings with calculation math
              <>
                {diagFindings.slice(0, isPaid ? 6 : 3).map((f: any, i: number) => (
                  <div key={i} onClick={() => isPaid && router.push("/v2/leaks")} className={`px-4 py-3 border-b border-border-light last:border-0 group ${isPaid ? "hover:bg-surface-hover cursor-pointer" : ""}`}
                    style={{ borderLeft: `3px solid ${SEV_DOT[f.severity] || "#C5C2BB"}`, background: f.severity === "critical" ? "rgba(179,64,64,0.02)" : "transparent" }}>
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-[6px] h-[6px] rounded-full shrink-0 mt-1.5" style={{ background: SEV_DOT[f.severity] || "#8E8C85" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-semibold text-ink truncate ${isPaid ? "group-hover:text-brand transition-colors" : ""}`}>{isFR ? (f.title_fr || f.title) : f.title}</span>
                          <span className="font-serif text-[13px] font-bold text-negative ml-auto shrink-0">${(f.impact_max || f.impact_min).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-ink-faint">{f.category}</span>
                          {(f.cost_of_inaction_90_days ?? 0) > 0 && <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(196,132,29,0.06)", color: "#C4841D" }}>⏱ 90d: ${f.cost_of_inaction_90_days.toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                    {/* Calculation math — visible only for paid users */}
                    {isPaid && f.calculation_shown && (
                      <div className="ml-[14px] mt-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(27,58,45,0.03)", border: "1px solid rgba(27,58,45,0.06)" }}>
                        <code className="text-[9px] text-ink-muted leading-relaxed">{f.calculation_shown}</code>
                      </div>
                    )}
                  </div>
                ))}
                {/* Lock gate for unpaid users */}
                {!isPaid && diagFindings.length > 3 && (() => {
                  const locked = diagFindings.slice(3);
                  const lockedVal = locked.reduce((s: number, f: any) => s + (f.impact_max || f.impact_min ?? 0), 0);
                  return (
                    <div className="relative">
                      {locked.slice(0, 2).map((f: any, i: number) => (
                        <div key={i} className="px-4 py-3 border-b border-border-light select-none pointer-events-none"
                          style={{ borderLeft: `3px solid ${SEV_DOT[f.severity] || "#C5C2BB"}`, filter: "blur(4px)", opacity: 0.35 }}>
                          <div className="flex items-center gap-2">
                            <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: SEV_DOT[f.severity] || "#8E8C85" }} />
                            <span className="text-[12px] font-semibold text-ink flex-1">{isFR ? (f.title_fr || f.title) : f.title}</span>
                            <span className="font-serif text-[13px] font-bold text-negative">${(f.impact_max || f.impact_min).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-end justify-center pb-3"
                        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.95) 45%)" }}>
                        <div className="text-center px-4 pt-6">
                          <p className="text-[12px] font-bold text-ink mb-0.5">
                            {locked.length} {t("more findings locked", "constats supplémentaires verrouillés")}
                          </p>
                          {lockedVal > 0 && (
                            <p className="text-[10px] text-ink-faint mb-3">
                              {t("Additional", "Supplémentaire")} <span className="font-bold text-negative">${(lockedVal ?? 0).toLocaleString()}</span> {t("in recoverable savings", "en économies récupérables")}
                            </p>
                          )}
                          <button onClick={() => router.push(upgradeUrl)}
                            className="text-[11px] font-bold text-white px-4 py-2 rounded-lg transition hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
                            {t(`Unlock Business ${upgradePrice}/mo →`, `Débloquer Business ${upgradePrice}/mois →`)}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                <div className="px-4 py-2.5 bg-bg flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-ink-muted">Total</span>
                  <span className="font-serif text-[14px] font-bold text-negative">${(totalLeak ?? 0).toLocaleString()}/{t("yr", "an")}</span>
                </div>
              </>
            ) : (
              // Fallback: original leak list (free/prescan data)
              <>
                {leaks.slice(0, isPaid ? 6 : 3).map((l, i) => (
                  <div key={i} onClick={() => isPaid && router.push("/v2/leaks")} className={`px-4 py-2.5 flex items-center gap-3 border-b border-border-light last:border-0 transition-colors ${isPaid ? "hover:bg-surface-hover cursor-pointer group" : ""}`}>
                    <div key={i} className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: SEV_DOT[l.severity] || "#8E8C85" }} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[12px] font-semibold text-ink truncate ${isPaid ? "group-hover:text-brand transition-colors" : ""}`}>{isFR ? (l.title_fr || l.title) : l.title}</div>
                      <span className="text-[9px] text-ink-faint">{l.category}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max || l.impact_min).toLocaleString()}</div>
                      <div className="text-[7px] text-ink-faint">/{t("yr", "an")}</div>
                    </div>
                  </div>
                ))}
                {!isPaid && leaks.length > 3 && (
                  <div className="px-4 py-4 text-center border-t border-border-light">
                    <p className="text-[11px] text-ink-muted mb-2.5">{leaks.length - 3} {t("more leaks hidden", "fuites supplémentaires cachées")}</p>
                    <button onClick={() => router.push(upgradeUrl)} className="text-[11px] font-bold text-white bg-brand px-4 py-2 rounded-lg hover:opacity-90 transition">
                      {t(`Unlock Business ${upgradePrice}/mo`, `Débloquer Business ${upgradePrice}/mois`)}
                    </button>
                  </div>
                )}
                <div className="px-4 py-2.5 bg-bg flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-ink-muted">Total</span>
                  <span className="font-serif text-[14px] font-bold text-negative">${(totalLeak ?? 0).toLocaleString()}/{t("yr", "an")}</span>
                </div>
              </>
            )}
          </div>

          {/* COL 2: RECOVERY PLAN + CPA BRIEFING + BENCHMARKS */}
          <div className="flex flex-col gap-3">

            {/* Recovery Plan */}
            <div className="bg-white rounded-xl border border-border-light overflow-hidden flex-1" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-3 border-b border-border-light">
                <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Recovery Plan", "Plan de récupération")}</span>
              </div>
              {!isPaid ? (
                <div className="px-4 py-8 text-center">
                  <LockIcon />
                  <p className="text-[11px] text-ink-muted mt-2 mb-3">{t("Your personalized fix plan unlocks with Business.", "Votre plan de correction se débloque avec Business.")}</p>
                  <button onClick={() => router.push(upgradeUrl)} className="text-[11px] font-bold text-brand border border-brand/20 px-3 py-1.5 rounded-lg hover:bg-brand/5 transition">
                    {t(`Unlock ${upgradePrice}/mo`, `Débloquer ${upgradePrice}/mois`)}
                  </button>
                </div>
              ) : allActions.length === 0 ? (
                <div className="px-4 py-6 text-center text-[11px] text-ink-muted">{t("Actions appear after your first diagnostic.", "Les actions apparaissent après votre diagnostic.")}</div>
              ) : allActions.slice(0, 4).map((a, i) => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3 border-b border-border-light last:border-0">
                  <div key={i} className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0" style={{ border: `2px solid ${a.status === "in_progress" ? "#C4841D" : "#E8E6E1"}` }}>
                    {a.status === "in_progress" ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#C4841D" }} /> : <span className="text-[9px] font-bold text-ink-faint">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-ink truncate">{a.leak_title}</div>
                    {a.fix_description && <div className="text-[9px] text-ink-faint truncate mt-0.5">{a.fix_description}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-serif text-[13px] font-bold text-positive">+${(a.estimated_value ?? 0).toLocaleString()}</div>
                    <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: a.status === "in_progress" ? "#C4841D" : "#8E8C85", background: a.status === "in_progress" ? "rgba(196,132,29,0.06)" : "#F0EFEB" }}>{a.status === "in_progress" ? t("Active", "En cours") : t("To do", "À faire")}</span>
                  </div>
                </div>
              ))}
              {completedActions.length > 0 && (
                <div className="px-4 py-2.5 bg-bg flex justify-between items-center">
                  <span className="text-[10px] text-ink-muted">{completedActions.length} {t("completed", "terminées")}</span>
                  <span className="text-[10px] font-bold text-positive">+${(recovered ?? 0).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* ── DIAGNOSTIC ADDITION: CPA Briefing (paid only) ── */}
            {isPaid && briefing && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
                  <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Accountant Briefing", "Briefing comptable")}</span>
                  <span className="text-[9px] text-ink-faint">{t("Share with CPA", "Partagez avec votre comptable")}</span>
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
                          <span className="text-brand text-[9px] font-bold mt-0.5 shrink-0">→</span>
                          <p className="text-[10px] text-ink-secondary">
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
                        <span key={i} className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#0e7490" }}>{form}</span>
                      ))}
                    </div>
                  )}
                  {/* Tax exposure — AI returns string 'tax_exposures', old schema had numeric 'estimated_tax_exposure' */}
                  {(briefing.tax_exposures || briefing.estimated_tax_exposure > 0) && (
                    <div className="px-3 py-2 rounded-lg mb-3" style={{ background: "rgba(196,132,29,0.04)", border: "1px solid rgba(196,132,29,0.10)" }}>
                      <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-1">{t("Tax Exposure", "Exposition fiscale")}</p>
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
                    <p key={i} className="text-[10px] text-ink-secondary italic mb-1 pl-2 border-l-2 border-border-light">"{q}"</p>
                  ))}
                </div>
              </div>
            )}

            {/* ── DIAGNOSTIC ADDITION: Priority sequence (paid only) ── */}
            {isPaid && planSequence.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light">
                  <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("What To Do First", "Quoi faire en premier")}</span>
                </div>
                {planSequence.slice(0, 4).map((s: any, i: number) => (
                  <div key={i} className="px-4 py-2.5 flex items-start gap-3 border-b border-border-light last:border-0">
                    <span className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.08)", color: "#1B3A2D" }}>{s.step ?? i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-ink-secondary">{isFR ? (s.action_fr || s.action || "") : (s.action || "")}</p>
                      {s.unlocks?.length > 0 && <p className="text-[9px] text-ink-faint mt-0.5">{t("Unlocks:", "Débloque:")} {s.unlocks.join(", ")}</p>}
                      {(s.why_first || s.description) && <p className="text-[9px] text-ink-faint mt-0.5 italic">{isFR ? (s.why_first_fr || s.why_first || s.description) : (s.why_first || s.description)}</p>}
                    </div>
                    {(s.value ?? s.estimated_savings ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-positive shrink-0">${(s.value ?? s.estimated_savings ?? 0).toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── DIAGNOSTIC benchmarks OR existing cost breakdown (paid only) + upgrade CTA ── */}
            {!isPaid ? (
              <div className="bg-white rounded-xl border border-border-light p-5 text-center"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(27,58,45,0.06)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </div>
                <p className="text-[12px] font-bold text-ink mb-1">
                  {t("CPA Briefing · Priority Sequence · Benchmarks", "Briefing CPA · Séquence · Benchmarks")}
                </p>
                <p className="text-[10px] text-ink-faint mb-4">
                  {t("Full calculation math, accountant talking points, and peer comparisons included.", "Math de calcul, points pour comptable et comparaisons aux pairs inclus.")}
                </p>
                <button onClick={() => router.push(upgradeUrl)}
                  className="text-[11px] font-bold text-white px-5 py-2.5 rounded-lg transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
                  {t(`Unlock Business ${upgradePrice}/mo →`, `Débloquer Business ${upgradePrice}/mois →`)}
                </button>
                <p className="text-[9px] text-ink-faint mt-2">{t("Cancel anytime", "Annulez en tout temps")}</p>
              </div>
            ) : diagBenchmarks.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
                  <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Costs vs Industry", "Coûts vs industrie")}</span>
                  <div className="flex items-center gap-3 text-[8px] text-ink-faint">
                    <span>{t("You", "Vous")}</span><span>{t("Avg", "Moy.")}</span><span>Top 25%</span>
                  </div>
                </div>
                {diagBenchmarks.map((b, i) => (
                    <div key={i} className="px-4 py-2 border-b border-border-light last:border-0">
                      <p key={i} className="text-[10px] font-semibold text-ink-secondary mb-1.5">{isFR ? (b.metric_name_fr || b.metric_fr || b.metric_name || b.metric || "") : (b.metric_name || b.metric || "")}</p>
                      <div className="grid grid-cols-3 text-center">
                        <div><div className="text-[12px] font-bold text-ink-secondary">{b.your_value}</div><div className="text-[7px] text-ink-faint">{t("You", "Vous")}</div></div>
                        <div><div className="text-[12px] font-bold" style={{ color: "#0369a1" }}>{b.industry_avg}</div><div className="text-[7px] text-ink-faint">{t("Avg", "Moy.")}</div></div>
                        <div><div className="text-[12px] font-bold text-positive">{b.top_quartile}</div><div className="text-[7px] text-ink-faint">Top 25%</div></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* COL 3: SIDEBAR (identical to original) */}
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-2.5 border-b border-border-light flex justify-between items-center">
                <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Deadlines", "Échéances")}</span>
                <button onClick={() => router.push("/v2/obligations")} className="text-[9px] font-semibold text-brand hover:underline">{t("All →", "Tout →")}</button>
              </div>
              {deadlines.length === 0 ? (
                <div className="px-4 py-4 text-[11px] text-ink-faint text-center">{t("None upcoming", "Aucune échéance")}</div>
              ) : deadlines.slice(0, 4).map((dl, i) => (
                <div key={i} onClick={() => router.push("/v2/obligations")} className="px-4 py-2.5 flex items-center justify-between border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer">
                  <div key={i} className="flex-1 min-w-0 mr-2">
                    <div className="text-[11px] font-medium text-ink truncate">{dl.title}</div>
                    {(dl.penalty_max ?? 0) > 0 && <div className="text-[8px] text-ink-faint mt-0.5">${dl.penalty_max!.toLocaleString()}</div>}
                  </div>
                  <div className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-md shrink-0" style={{ background: dl.days_until <= 3 ? "#B34040" : dl.days_until <= 7 ? "rgba(179,64,64,0.06)" : "#F0EFEB", color: dl.days_until <= 3 ? "white" : dl.days_until <= 7 ? "#B34040" : "#8E8C85" }}>{dl.days_until}{t("d", "j")}</div>
                </div>
              ))}
            </div>

            <button onClick={() => router.push("/v2/programs")} className="w-full bg-white rounded-xl border border-border-light p-4 text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-2">{t("Government Programs", "Programmes gouvernementaux")}</div>
              <div className="flex items-end gap-2">
                <span className="font-serif text-[28px] font-bold leading-none tracking-tight text-positive">{programsAvailable}</span>
                <span className="text-[10px] text-ink-faint mb-0.5">{t("available for you", "disponibles pour vous")}</span>
              </div>
            </button>

            <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-3">{t("Recovery", "Récupération")}</div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-bg-section rounded-full overflow-hidden"><div className="h-full rounded-full bg-positive transition-all duration-700" style={{ width: `${Math.max(recovPct, 1)}%` }} /></div>
                <span className="text-[12px] font-bold text-ink tabular-nums">{recovPct}%</span>
              </div>
              <div className="flex justify-between text-[9px] text-ink-faint">
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
                  <div className="text-[9px] text-ink-faint">{isPaid ? t("Monthly 30-min included", "Session 30 min mensuelle incluse") : t("Free 30-min strategy call", "Appel stratégie gratuit de 30 min")}</div>
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
                  <div className="text-[9px] text-ink-faint">{t("Get answers about your finances", "Posez vos questions financières")}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}