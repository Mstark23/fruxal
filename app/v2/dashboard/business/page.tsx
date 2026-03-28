// =============================================================================
// FRUXAL DASHBOARD — BUSINESS TIER
// Base: same structure/layout/features as the original unified dashboard.
// Added: diagnostic layer → bankability_score (5th KPI), calculation_shown
//        on findings, accountant_briefing card, benchmark_comparisons.
// =============================================================================

"use client";
import React, { useState, useEffect, useCallback } from "react";
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

  // — diagnostic additions —
  const [reportId, setReportId] = useState<string | null>(null);
  const [bankabilityScore, setBankabilityScore] = useState(0);
  const [diagFindings, setDiagFindings] = useState<any[]>([]);
  const [briefing, setBriefing] = useState<any>(null);
  const [diagBenchmarks, setDiagBenchmarks] = useState<any[]>([]);

  // T2 is free — affiliates are the revenue, not subscriptions
  const [isPaid, setIsPaid] = useState(true); // always true
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assignedRep, setAssignedRep] = useState<{ name: string; calendly_url: string | null; contingency_rate: number; pipeline_stage: string | null } | null>(null);
  const upgradeUrl = "/enterprise"; // upsell to enterprise (T3) only
  const upgradePrice = "";

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
      if (d.assigned_rep) setAssignedRep(d.assigned_rep);
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
        const diagLeak = r.totals?.annual_leaks ?? r.total_annual_leaks ?? 0;
        if (diagLeak > 0) setTotalLeak(diagLeak);
        setBankabilityScore(r.scores?.bankability ?? r.bankability_score ?? 0);
        if (r.findings?.length > 0) setDiagFindings(r.findings);
        setBriefing(r.accountant_briefing || r.cpa_briefing || null);
        setDiagBenchmarks((r.benchmark_comparisons || []).slice(0, 5));

      } catch { /* non-fatal */ }
    };

    const diagP = loadDiag();



    const actP = user?.id ? fetch("/api/v2/actions").then(r => r.json()).then(json => {
      if (json.stats) setActionStats(json.stats);

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

  const recovered = (actionStats?.total_recovered || totalSavings) ?? 0;
  const recovPct = totalLeak > 0 ? Math.min(100, Math.round((recovered / totalLeak) * 100)) : 0;
  const streak = (progress as any)?.streak;
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? t("Good morning", "Bonjour") : h < 18 ? t("Good afternoon", "Bon après-midi") : t("Good evening", "Bonsoir"); })();
  const fade = (d = 0) => ({ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: `all 0.45s cubic-bezier(0.16,1,0.3,1) ${d}s` } as React.CSSProperties);
  const displayLeaks = diagFindings.length > 0 ? diagFindings.slice(0, 6) : leaks.slice(0, 6);

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
            <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="h-6 px-2.5 text-[11px] font-bold text-ink-muted bg-white border border-border-light rounded-md hover:bg-bg-section transition">{lang === "fr" ? "EN" : "FR"}</button>
            {reportId && <button onClick={() => router.push(`/v2/diagnostic/${reportId}`)} className="h-6 px-2.5 text-[11px] font-bold text-brand bg-brand/5 border border-brand/15 rounded-md hover:bg-brand/10 transition">{t("Full Report →", "Rapport →")}</button>}
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

        {/* ═══ AGREEMENT SENT BANNER ═══ */}
        {assignedRep && assignedRep.pipeline_stage === "agreement_out" && (
          <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-4" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1) 0.04s" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-ink">{t("Your engagement agreement has been sent", "Votre contrat d'engagement a été envoyé")}</p>
              <p className="text-[10px] text-ink-faint mt-0.5">{t("Check your email and sign to begin your recovery.", "Vérifiez vos courriels et signez pour commencer votre récupération.")}</p>
            </div>
          </div>
        )}

        {/* ═══ SIGNED BANNER ═══ */}
        {assignedRep && assignedRep.pipeline_stage === "signed" && (
          <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-4" style={{ background: "rgba(27,58,45,0.06)", border: "1px solid rgba(27,58,45,0.2)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1) 0.04s" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-positive" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-ink">{t("Agreement signed — engagement starting", "Contrat signé — engagement en cours")}</p>
              <p className="text-[10px] text-ink-faint mt-0.5">{t(`${assignedRep.name} will be in touch within 1 business day to begin the recovery work.`, `${assignedRep.name} vous contactera dans un jour ouvrable pour commencer la récupération.`)}</p>
            </div>
          </div>
        )}

        {/* ═══ RECOVERY COMPLETE BANNER ═══ */}
        {assignedRep && (assignedRep.pipeline_stage === "fee_collected" || assignedRep.pipeline_stage === "completed") && (
          <div className="w-full rounded-2xl mb-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0A1F12 0%, #1B3A2D 100%)", border: "1px solid rgba(45,122,80,0.3)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s" }}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">{t("Recovery Complete", "Récupération terminée")}</span>
                  </div>
                  <h3 className="text-[17px] font-bold text-white leading-snug">
                    {t("Your recovery is done.", "Votre récupération est terminée.")}
                    {recovered > 0 && <><br /><span className="text-emerald-400">{t(`$${recovered.toLocaleString()} recovered.`, `${recovered.toLocaleString()}$ récupérés.`)}</span></>}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-[15px] font-bold text-emerald-300">
                  {assignedRep.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{t("Total confirmed", "Total confirmé")}</div>
                  <div className="text-[18px] font-black text-emerald-400">${recovered.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{t("Fruxal fee (12%)", "Honoraires Fruxal (12%)")}</div>
                  <div className="text-[15px] font-bold text-white/60">${Math.round(recovered * 0.12).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{t("You kept", "Vous avez gardé")}</div>
                  <div className="text-[18px] font-black text-white">${Math.round(recovered * 0.88).toLocaleString()}</div>
                </div>
              </div>
              <p className="text-[11px] text-white/30 text-center mt-3">{t("Thank you for working with Fruxal.", "Merci de votre confiance envers Fruxal.")}</p>
            </div>
          </div>
        )}

        {/* ═══ REP BOOKING BANNER ═══ */}
        {assignedRep && assignedRep.pipeline_stage !== "completed" && assignedRep.pipeline_stage !== "in_engagement" && assignedRep.pipeline_stage !== "recovery_tracking" && assignedRep.pipeline_stage !== "agreement_out" && assignedRep.pipeline_stage !== "signed" && assignedRep.pipeline_stage !== "fee_collected" && assignedRep.pipeline_stage !== "completed" && (
          <div className="w-full rounded-2xl mb-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2419 0%, #1B3A2D 60%, #1F4A36 100%)", border: "1px solid rgba(45,122,80,0.25)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s" }}>
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
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { n: "1", text: t("Book a free call with your rep", "Réservez un appel gratuit") },
                  { n: "2", text: t("We handle all the work & CRA calls", "On s'occupe de tout") },
                  { n: "3", text: t(`You keep ${100 - (assignedRep.contingency_rate ?? 12)}% of what we recover`, `Vous gardez ${100 - (assignedRep.contingency_rate ?? 12)}% de ce qu'on récupère`) },
                ].map(step => (
                  <div key={step.n} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-[10px] font-black text-emerald-400 mb-1">STEP {step.n}</div>
                    <div className="text-[11px] text-white/70 leading-tight">{step.text}</div>
                  </div>
                ))}
              </div>
              {totalLeak > 0 && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{t("Your annual leak", "Fuite annuelle")}</div>
                    <div className="text-[18px] font-black text-red-400">${totalLeak.toLocaleString()}/yr</div>
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
          <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-4" style={{ background: "rgba(27,58,45,0.06)", border: "1px solid rgba(27,58,45,0.15)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1) 0.04s" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
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

        {/* KPI CARDS — 5 on business (adds Bankability) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5" style={fade(0.04)}>
          <div className="bg-white rounded-xl p-5 border border-border-light" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Health Score", "Score santé")}</div>
            {score > 0 ? (
              <>
                <div className="flex items-end gap-1.5">
                  <span className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: score >= 60 ? "#1B3A2D" : "#C4841D" }}>{score}</span>
                  <span className="text-xs text-ink-muted mb-1">/100</span>
                </div>
                <div className="mt-3 h-[3px] bg-bg-section rounded-full"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: score >= 70 ? "#2D7A50" : score >= 40 ? "#C4841D" : "#B34040" }} /></div>
              </>
            ) : (
              <>
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-ink-faint">—</div>
                <div className="text-[11px] text-ink-muted mt-1.5">{t("Pending analysis", "Analyse en attente")}</div>
              </>
            )}
          </div>

          <button onClick={() => router.push("/v2/leaks")} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Annual Leak", "Fuite annuelle")}</div>
            <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-negative">${(totalLeak ?? 0).toLocaleString()}</div>
            <div className="text-[11px] text-ink-muted mt-1.5">
              {displayLeaks.length} {t("findings", "constats")}
              {!isPaid && (diagFindings.length > 3 || leaks.length > 3) && (
                <span className="ml-1 text-negative font-semibold">
                  +{(diagFindings.length || leaks.length) - 3} {t("locked", "verrouillés")}
                </span>
              )}
            </div>
          </button>

          <div className="bg-white rounded-xl p-5 border border-border-light" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">{t("Recovered", "Récupéré")}</div>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-positive">${(recovered ?? 0).toLocaleString()}</div>
                <div className="text-[11px] text-ink-muted mt-1.5">{leaksFixed} {t("fixed", "corrigés")}</div>
              </div>
              <div className="relative mt-1"><Ring pct={recovPct / 100} /><div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-bold text-positive">{recovPct}%</span></div></div>
            </div>
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

        {/* MAIN 3-COL */}


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
                {diagFindings.slice(0, isPaid ? 6 : 3).map((f: any, i: number) => (
                  <div key={i} onClick={() => isPaid && router.push("/v2/leaks")} className={`px-4 py-3 border-b border-border-light last:border-0 group ${isPaid ? "hover:bg-surface-hover cursor-pointer" : ""}`}
                    style={{ borderLeft: `3px solid ${SEV_DOT[f.severity] || "#C5C2BB"}`, background: f.severity === "critical" ? "rgba(179,64,64,0.02)" : "transparent" }}>
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-[6px] h-[6px] rounded-full shrink-0 mt-1.5" style={{ background: SEV_DOT[f.severity] || "#8E8C85" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-semibold text-ink truncate ${isPaid ? "group-hover:text-brand transition-colors" : ""}`}>{isFR ? (f.title_fr || f.title) : f.title}</span>
                          <span className="font-serif text-[13px] font-bold text-negative ml-auto shrink-0">${(f.impact_max ?? f.impact_min ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-ink-faint">{f.category}</span>
                          {(f.cost_of_inaction_90_days ?? 0) > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(196,132,29,0.06)", color: "#C4841D" }}>⏱ 90d: ${f.cost_of_inaction_90_days.toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                    {/* Calculation math — visible only for paid users */}
                    {isPaid && f.calculation_shown && (
                      <div className="ml-[14px] mt-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(27,58,45,0.03)", border: "1px solid rgba(27,58,45,0.06)" }}>
                        <code className="text-[11px] text-ink-muted leading-relaxed">{f.calculation_shown}</code>
                      </div>
                    )}
                  </div>
                ))}
                {/* Lock gate for unpaid users */}
                {!isPaid && diagFindings.length > 3 && (() => {
                  const locked = diagFindings.slice(3);
                  const lockedVal = locked.reduce((s: number, f: any) => s + ((f.impact_max || f.impact_min) ?? 0), 0);
                  return (
                    <div className="relative">
                      {locked.slice(0, 2).map((f: any, i: number) => (
                        <div key={i} className="px-4 py-3 border-b border-border-light select-none pointer-events-none"
                          style={{ borderLeft: `3px solid ${SEV_DOT[f.severity] || "#C5C2BB"}`, filter: "blur(4px)", opacity: 0.35 }}>
                          <div className="flex items-center gap-2">
                            <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: SEV_DOT[f.severity] || "#8E8C85" }} />
                            <span className="text-[12px] font-semibold text-ink flex-1">{isFR ? (f.title_fr || f.title) : f.title}</span>
                            <span className="font-serif text-[13px] font-bold text-negative">${(f.impact_max ?? f.impact_min ?? 0).toLocaleString()}</span>
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
                            <p className="text-[11px] text-ink-muted mb-3">
                              {t("Additional", "Supplémentaire")} <span className="font-bold text-negative">${(lockedVal ?? 0).toLocaleString()}</span> {t("in recoverable savings", "en économies récupérables")}
                            </p>
                          )}
                          <button onClick={() => router.push(upgradeUrl)}
                            className="text-[11px] font-bold text-white px-4 py-2 rounded-lg transition hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2A5A44 100%)" }}>
                            {t("Scale up with Enterprise →", "Passer à l'entreprise →")}
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
                {!isPaid && leaks.length > 3 && (
                  <div className="px-4 py-4 text-center border-t border-border-light">
                    <p className="text-[11px] text-ink-muted mb-2.5">{leaks.length - 3} {t("more leaks hidden", "fuites supplémentaires cachées")}</p>
                    <button onClick={() => router.push(upgradeUrl)} className="text-[11px] font-bold text-white bg-brand px-4 py-2 rounded-lg hover:opacity-90 transition">
                      {t("Scale up with Enterprise", "Passer à l'entreprise")}
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

          {/* COL 2: REP STATUS + CPA BRIEFING + BENCHMARKS */}
          <div className="flex flex-col gap-3">

            {/* Stage-aware rep section */}
            {assignedRep && (assignedRep.pipeline_stage === "in_engagement" || assignedRep.pipeline_stage === "recovery_tracking") ? (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Recovery in Progress", "Récupération en cours")}</span>
                </div>
                <div className="px-4 py-4">
                  <p className="text-[13px] font-semibold text-ink mb-1">{t(`${assignedRep.name} is working on your file`, `${assignedRep.name} travaille sur votre dossier`)}</p>
                  <p className="text-[11px] text-ink-muted mb-4">{t("Our accountant is handling the CRA calls, vendor negotiations, and grant applications. You'll be notified as amounts are confirmed.", "Notre comptable s'occupe des appels à l'ARC, des négociations fournisseurs et des demandes de subventions. Vous serez notifié.")}</p>
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
            ) : assignedRep && assignedRep.pipeline_stage === "call_booked" ? (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-positive" />
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Call Confirmed", "Appel confirmé")}</span>
                </div>
                <div className="px-4 py-4">
                  <p className="text-[13px] font-semibold text-ink mb-3">{t(`Your call with ${assignedRep.name} is booked.`, `Votre appel avec ${assignedRep.name} est réservé.`)}</p>
                  <p className="text-[11px] text-ink-muted mb-3">{t("To make the most of your call, have these ready:", "Pour tirer le meilleur parti de votre appel, préparez :")}</p>
                  <div className="space-y-2">
                    {[
                      t("Last 2 years of financial statements", "2 dernières années d'états financiers"),
                      t("Recent bank & credit card statements", "Relevés bancaires et cartes de crédit récents"),
                      t("List of your main recurring expenses", "Liste de vos principales dépenses récurrentes"),
                      t("Any CRA correspondence", "Toute correspondance avec l'ARC"),
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.07)" }}>
                          <span className="text-[9px] font-bold text-brand">{i + 1}</span>
                        </div>
                        <span className="text-[11px] text-ink-secondary leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                  {assignedRep.calendly_url && (
                    <a href={assignedRep.calendly_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 mt-4 rounded-xl text-[12px] font-semibold text-brand border border-brand/20 hover:bg-brand/5 transition">
                      {t("Manage Booking →", "Gérer la réservation →")}
                    </a>
                  )}
                </div>
              </div>
            ) : assignedRep ? (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Your Next Step", "Votre prochaine étape")}</span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {[
                    { n: "1", en: "Book a free call with your assigned rep", fr: "Réservez un appel gratuit avec votre rep" },
                    { n: "2", en: "We review your full diagnostic together", fr: "Nous examinons votre diagnostic ensemble" },
                    { n: "3", en: "Our accountant contacts CRA & vendors", fr: "Notre comptable contacte l'ARC et les fournisseurs" },
                    { n: "4", en: "We invoice 12% of what we actually recover", fr: "Nous facturons 12% de ce que nous récupérons" },
                  ].map(step => (
                    <div key={step.n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.07)" }}>
                        <span className="text-[9px] font-bold text-brand">{step.n}</span>
                      </div>
                      <span className="text-[12px] text-ink-secondary leading-tight">{isFR ? step.fr : step.en}</span>
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
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("What Happens Next", "Ce qui se passe ensuite")}</span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {[
                    { n: "1", en: "A recovery expert is being assigned to your file", fr: "Un expert en récupération est assigné à votre dossier" },
                    { n: "2", en: "They'll book a free call to review your leaks", fr: "Ils réserveront un appel gratuit pour examiner vos fuites" },
                    { n: "3", en: "Our accountant contacts CRA, vendors & grant programs", fr: "Notre comptable contacte l'ARC, les fournisseurs et les programmes de subventions" },
                    { n: "4", en: "We invoice 12% of confirmed savings — nothing upfront", fr: "Nous facturons 12% des économies confirmées — rien d'avance" },
                  ].map(step => (
                    <div key={step.n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.07)" }}>
                        <span className="text-[9px] font-bold text-brand">{step.n}</span>
                      </div>
                      <span className="text-[12px] text-ink-secondary leading-tight">{isFR ? step.fr : step.en}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.10)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                    <p className="text-[11px] text-ink-secondary">{t("A Fruxal advisor will be in touch within 1 business day.", "Un conseiller Fruxal vous contactera dans un jour ouvrable.")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recovery scoreboard */}
            {recovered > 0 && (
              <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3">{t("Recovery Scoreboard", "Tableau de récupération")}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]"><span className="text-ink-secondary">{t("Total identified", "Total identifié")}</span><span className="font-semibold text-negative">${(totalLeak ?? 0).toLocaleString()}/yr</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-ink-secondary">{t("Recovered so far", "Récupéré jusqu'ici")}</span><span className="font-semibold text-positive">+${recovered.toLocaleString()}</span></div>
                  <div className="h-px bg-border-light" />
                  <div className="flex justify-between text-[12px]"><span className="text-ink-secondary">{t("Still available", "Encore disponible")}</span><span className="font-semibold text-ink">${Math.max(0, (totalLeak ?? 0) - recovered).toLocaleString()}/yr</span></div>
                </div>
                <div className="mt-3 h-[4px] bg-bg-section rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-positive transition-all duration-1000" style={{ width: recovPct + "%" }} />
                </div>
                <p className="text-[10px] text-ink-faint mt-1.5 text-right">{recovPct}% {t("recovered", "récupéré")}</p>
              </div>
            )}

            {/* ── DIAGNOSTIC ADDITION: CPA Briefing (paid only) ── */}
            {isPaid && briefing && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Accountant Briefing", "Briefing comptable")}</span>
                  <span className="text-[11px] text-ink-faint">{t("What our team will handle", "Ce que notre équipe prendra en charge")}</span>
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



            {/* ── DIAGNOSTIC benchmarks ── */}
            {isPaid && diagBenchmarks.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{t("Costs vs Industry", "Coûts vs industrie")}</span>
                  <div className="flex items-center gap-3 text-[10px] text-ink-faint">
                    <span>{t("You", "Vous")}</span><span>{t("Avg", "Moy.")}</span><span>Top 25%</span>
                  </div>
                </div>
                {diagBenchmarks.map((b, i) => (
                    <div key={i} className="px-4 py-2 border-b border-border-light last:border-0">
                      <p key={i} className="text-[10px] font-semibold text-ink-secondary mb-1.5">{isFR ? (b.metric_name_fr || b.metric_fr || b.metric_name || b.metric || "") : (b.metric_name || b.metric || "")}</p>
                      <div key={i} className="grid grid-cols-3 text-center">
                        <div><div className="text-[12px] font-bold text-ink-secondary">{b.your_value}</div><div className="text-[10px] text-ink-faint">{t("You", "Vous")}</div></div>
                        <div><div className="text-[12px] font-bold" style={{ color: "#0369a1" }}>{b.industry_avg}</div><div className="text-[10px] text-ink-faint">{t("Avg", "Moy.")}</div></div>
                        <div><div className="text-[12px] font-bold text-positive">{b.top_quartile}</div><div className="text-[10px] text-ink-faint">Top 25%</div></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* COL 3: SIDEBAR */}
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
          </div>
        </div>



      </div>
    </div>
  );
}