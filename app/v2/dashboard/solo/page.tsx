// =============================================================================
// FRUXAL DASHBOARD - SOLO TIER
// =============================================================================
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCelebration } from "@/hooks/useCelebration";

function Ring({ pct, size = 44, sw = 4, color = "#2D7A50" }: { pct: number; size?: number; sw?: number; color?: string }) {
  const r = (size - sw) / 2, circ = 2 * Math.PI * r;
  return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EFEB" strokeWidth={sw} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" transform={"rotate(-90 " + (size/2) + " " + (size/2) + ")"} style={{ transition: "stroke-dashoffset 1s ease" }} /></svg>;
}
function LockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C5C2BB" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}

interface Leak { slug: string; title: string; title_fr?: string; severity: string; category: string; description: string; description_fr?: string; impact_min: number; impact_max: number; confidence: number | null; proof?: string; action?: string; action_fr?: string; affiliates?: Array<{ name: string; url: string }> }
interface Deadline { title: string; days_until: number; penalty_max?: number }
interface ActionStats { total_recovered: number; actions_completed: number; quickbooks_connected: boolean; bank_connected: boolean }
interface ActionItem { id: string; leak_title: string; fix_description: string; estimated_value: number; status: string }
interface TonightAction { title: string; steps: string[]; time_required: string; estimated_value: number; why_tonight: string }
const SEV_DOT: Record<string, string> = { critical: "#B34040", high: "#C4841D", medium: "#8E8C85", low: "#C5C2BB" };

export default function SoloDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { progress } = useCelebration();
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [mounted, setMounted] = useState(false);

  const [score, setScore] = useState(0);
  const [totalLeak, setTotalLeak] = useState(0);
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [tier, setTier] = useState("solo");
  const [recommendedPlan, setRecommendedPlan] = useState("solo");
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
  const [diagPrograms, setDiagPrograms] = useState<Array<{ slug: string; name: string; name_fr?: string; value: number }>>([]);
  const [tonightAction, setTonightAction] = useState<TonightAction | null>(null);
  const [northStar, setNorthStar] = useState<any>(null);
  const [ninetyDay, setNinetyDay] = useState<any>(null);
  const [strengths, setStrengths] = useState<any[]>([]);
  const [diagFindings, setDiagFindings] = useState<any[]>([]);

  const t = useCallback((en: string, fr: string) => lang === "fr" ? fr : en, [lang]);
  const isFR = lang === "fr";
  const isFree = tier === "free";
  const isPaid = !isFree;
  // Route to the right tier based on revenue qualification
  const upgradeTarget = recommendedPlan === "enterprise" ? "enterprise"
    : (recommendedPlan === "business") ? "business"
    : "solo";
  const upgradeUrl = upgradeTarget === "enterprise"
    ? "/v2/diagnostic/intake"   // enterprise → book call via intake form, no subscription
    : "/v2/checkout?plan=" + upgradeTarget;
  const upgradePrice = upgradeTarget === "business" ? "$149" : "$49";
  const upgradeName = upgradeTarget === "enterprise" ? "Enterprise"
    : upgradeTarget === "business" ? "Business" : "Solo";

  useEffect(() => {
    let redirected = false;
    try { const s = sessionStorage.getItem("lg_prescan_lang"); if (s === "en" || s === "fr") setLang(s); else if (navigator.language?.startsWith("fr")) setLang("fr"); } catch {}

    let prescanLoaded = false;
    try {
      const raw = sessionStorage.getItem("lg_prescan_result");
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.analysis?.leaks) {
          setScore(p.analysis.fhScore || 50);
          setTotalLeak(p.analysis.totalLeak || 0);
          const CAT_MAP: Record<string, string> = { processing_rate_high: "Paiements", rent_or_chair_high: "Immobilier", tax_optimization_gap: "Fiscalite", payroll_ratio_high: "Personnel", insurance_overpayment: "Assurance", fuel_vehicle_high: "Transport", software_bloat: "Operations", banking_fees_high: "Bancaire", inventory_cogs_high: "Inventaire", marketing_waste: "Marketing", cash_shrinkage: "Comptabilite", utilities_overspend: "Utilitaires", revenue_underpricing: "Revenus", accounting_gap: "Comptabilite", tax_credit_missed: "Fiscalite", compliance_gap: "Conformite" };
          const sev = (s: any) => typeof s === "string" ? s : Number(s) >= 80 ? "critical" : Number(s) >= 60 ? "high" : Number(s) >= 30 ? "medium" : "low";
          setLeaks(p.analysis.leaks.map((l: any) => ({ slug: l.type || l.slug || "unknown", title: l.title || "", title_fr: l.title_fr, severity: sev(l.severity), category: CAT_MAP[l.type] || l.category || "General", description: l.explanation || l.description || "", description_fr: l.explanation_fr, impact_min: l.amount || 0, impact_max: l.amount || 0, confidence: l.confidence || null, proof: l.proof, action: l.action, action_fr: l.action_fr, affiliates: l.affiliates || [] })));
          prescanLoaded = true;
        }
      }
    } catch {}

    const params = new URLSearchParams(window.location.search);
    const rid = params.get("prescanRunId");
    const v2Url = rid ? "/api/v2/dashboard?prescanRunId=" + rid : "/api/v2/dashboard";

    const v2P = fetch(v2Url).then(r => r.json()).then(json => {
      if (!json.success || !json.data) return;
      const d = json.data;
      const detectedTier = (d.tier || "free").toLowerCase();
      const detectedPlan = (d.recommended_plan || "").toLowerCase();
      if (detectedTier === "enterprise" || detectedTier === "corp") { redirected = true; router.replace("/v2/dashboard/enterprise"); return; }
      if (detectedTier === "business" || detectedTier === "growth" || detectedTier === "team") { redirected = true; router.replace("/v2/dashboard/business"); return; }
      if (detectedPlan === "enterprise") { redirected = true; router.replace("/v2/dashboard/enterprise"); return; }
      if (detectedPlan === "business") { redirected = true; router.replace("/v2/dashboard/business"); return; }
      setTier(detectedTier);
      if (d.recommended_plan) setRecommendedPlan(d.recommended_plan);
      setProfile(d.profile || { province: "QC", industry: "Small Business", structure: "" });
      setObligationsTotal(d.obligations?.total || 0);
      setOverdue(d.obligations?.overdue || 0);
      setPenaltyExposure(d.obligations?.penalty_exposure || 0);
      setDeadlines(d.obligations?.upcoming_deadlines || []);
      setProgramsAvailable(d.programs?.available || 0);
      setLeaksFixed(d.leaks?.fixed || 0);
      setTotalSavings(d.leaks?.total_savings || 0);
      if (!prescanLoaded && d.leaks?.top_unfixed?.length > 0) {
        setScore(d.health_score || 50);
        setTotalLeak(d.total_leak_estimate || 0);
        const sev = (s: any) => { if (typeof s === "string" && ["critical","high","medium","low"].includes(s)) return s; const n = Number(s); return isNaN(n) ? "medium" : n >= 80 ? "critical" : n >= 60 ? "high" : n >= 30 ? "medium" : "low"; };
        setLeaks(d.leaks.top_unfixed.map((l: any) => ({ slug: l.slug, title: l.title, title_fr: l.title_fr, severity: sev(l.severity), category: l.category || "General", description: l.description || "", description_fr: l.description_fr, impact_min: l.impact_min || 0, impact_max: l.impact_max || l.impact_min || 0, confidence: l.confidence, proof: l.proof, action: l.action, action_fr: l.action_fr, affiliates: l.affiliates || [] })));
      }
    }).catch(() => {});

    const diagP = fetch("/api/v2/diagnostic/latest").then(r => r.json()).then(json => {
      if (redirected || !json.success) return;
      if (json.status === "analyzing" || json.data?.status === "analyzing") {
        // Show analyzing banner — don't set any report data yet
        try { sessionStorage.setItem("fruxal_analyzing", "1"); } catch {}
        return;
      }
      if (!json.data) return;
      const r = json.data;
      const diagScore = r.scores?.overall ?? r.overall_score ?? 0;
      if (diagScore > 0) setScore(diagScore);
      const diagLeak = r.total_annual_leaks || r.totals?.annual_leaks || 0;
      if (diagLeak > 0) setTotalLeak(diagLeak);
      // Handle both {tonight_action:...} object and flat array format
      if (r.action_plan) {
        if (!Array.isArray(r.action_plan)) setTonightAction(r.action_plan.tonight_action || null);
      }
      setNorthStar(r.north_star_metric || null);
      setNinetyDay(r.ninety_day_success || null);
      setStrengths(r.strengths || []);
      if (r.findings?.length > 0) {
        setDiagFindings(r.findings);
        const slugs: string[] = [];
        r.findings.forEach((f: any) => { (f.program_slugs || []).forEach((s: string) => { if (!slugs.includes(s)) slugs.push(s); }); });
        if (slugs.length > 0) {
          fetch("/api/v2/affiliates?type=government&limit=50").then(res => res.json()).then(aff => {
            const matched = (aff.affiliates || aff.data || []).filter((a: any) => slugs.includes(a.slug)).map((a: any) => ({ slug: a.slug, name: a.name, name_fr: a.name_fr, value: a.annual_value_max || a.annual_value_min || 0 }));
            if (matched.length > 0) setDiagPrograms(matched);
          }).catch(() => {});
        }
        if (r.programs?.length > 0) {
          const progs = r.programs.slice(0, 5).map((p: any) => ({ slug: p.slug, name: p.name, name_fr: p.name_fr, value: p.max_amount || 0 }));
          setDiagPrograms(prev => prev.length > 0 ? prev : progs);
        }
      }
    }).catch(() => {});

    const actP = user?.id ? fetch("/api/v2/actions").then(r => r.json()).then(json => {
      if (json.stats) setActionStats(json.stats);
      if (json.actions) { setThisWeekActions(json.actions.this_week || []); setInProgressActions(json.actions.in_progress || []); setCompletedActions(json.actions.completed || []); }
    }).catch(() => {}) : Promise.resolve();

    Promise.all([v2P, diagP, actP]).finally(() => { setLoading(false); requestAnimationFrame(() => setMounted(true)); });
  }, [user?.id]);

  const recovered = actionStats?.total_recovered || totalSavings || 0;
  const recovPct = totalLeak > 0 ? Math.min(100, Math.round((recovered / totalLeak) * 100)) : 0;
  const streak = (progress as any)?.streak;
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? t("Good morning", "Bonjour") : h < 18 ? t("Good afternoon", "Bon apres-midi") : t("Good evening", "Bonsoir"); })();

  // fade must be declared before early returns so it is not between returns
  function fadeDelay(d: number) {
    return { opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1) " + d + "s" };
  }

  const allActions = [...inProgressActions, ...thisWeekActions];
  const allLeaks = diagFindings.length > 0
    ? diagFindings.map((f: any) => ({ slug: f.id || f.slug || "f", title: f.title, title_fr: f.title_fr, severity: f.severity, category: f.category, description: isFR ? (f.description_fr || f.description) : f.description, description_fr: f.description_fr, impact_min: f.annual_leak || f.impact_min || 0, impact_max: f.potential_savings || f.impact_max || f.annual_leak || 0, confidence: null, action: isFR ? (f.action_items_fr?.[0] || f.action_items?.[0]) : f.action_items?.[0], action_fr: f.action_items_fr?.[0], affiliates: [] }))
    : leaks;
  const displayLeaks = allLeaks.slice(0, isPaid ? 6 : 4); // free: 1 visible + 3 blurred; paid: all 6

  if (loading || authLoading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" /></div>
  );

  if (leaks.length === 0 && diagFindings.length === 0 && !totalLeak) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-xs">
        <p className="font-serif text-xl text-ink mb-2">{isPaid ? t("No diagnostic yet", "Aucun diagnostic") : t("No analysis yet", "Aucune analyse")}</p>
        <p className="text-sm text-ink-muted mb-6">
          {isPaid
            ? t("Run your diagnostic to get your health score, detected leaks, and a personalised fix plan.", "Lancez votre diagnostic pour obtenir votre score santé et un plan de correction personnalisé.")
            : t("Run your free prescan to get started.", "Lancez votre prescan gratuit pour commencer.")}
        </p>
        <button onClick={() => router.push(isPaid ? "/v2/diagnostic" : "/")} className="px-6 py-2.5 text-sm font-semibold text-white bg-brand rounded-lg">
          {isPaid ? t("Run diagnostic →", "Lancer le diagnostic →") : t("Start", "Lancer")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-bg min-h-screen">
      <div className="px-6 lg:px-8 py-5 max-w-[1100px]">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-5" style={fadeDelay(0)}>
          <div>
            <h1 className="text-[15px] font-semibold text-ink">{greeting}{user?.name ? ", " + user.name.split(" ")[0] : ""}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-ink-faint">{profile.industry} - {profile.province}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: isFree ? "#F0EFEB" : "rgba(45,122,80,0.08)", color: isFree ? "#8E8C85" : "#1B3A2D" }}>
                {isFree ? t("Free", "Gratuit") : "Solo"}
              </span>
              {streak && streak.current > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-[2px]">{streak.week_map?.map((a: boolean, i: number) => <div key={i} className={"w-[4px] h-[4px] rounded-[1px] " + (a ? "bg-positive" : "bg-border")} />)}</div>
                  <span className="text-[9px] text-ink-faint">{streak.current}j</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="h-6 px-2.5 text-[9px] font-bold text-ink-muted bg-white border border-border-light rounded-md hover:bg-bg-section transition">{lang === "fr" ? "EN" : "FR"}</button>
        </div>

        {/* OVERDUE ALERT */}
        {isPaid && overdue > 0 && (
          <button onClick={() => router.push("/v2/obligations")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-left" style={{ background: "rgba(179,64,64,0.03)", border: "1px solid rgba(179,64,64,0.1)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1) 0.02s" }}>
            <div className="w-[6px] h-[6px] rounded-full bg-negative animate-pulse" />
            <span className="text-[11px] font-semibold text-negative flex-1">{overdue} {t("overdue obligation", "obligation en retard")}{overdue > 1 ? "s" : ""} - ${penaltyExposure.toLocaleString()} {t("at risk", "a risque")}</span>
            <span className="text-[10px] font-semibold text-negative">{t("Resolve", "Resoudre")}</span>
          </button>
        )}

        {/* FREE UPGRADE BANNER */}
        {isFree && totalLeak > 0 && (
          <div className="rounded-xl mb-5 p-4 flex items-center justify-between gap-4 flex-wrap" style={{ background: "linear-gradient(135deg, #1B3A2D, #2A5A44)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1) 0.03s" }}>
            <div>
              <p className="text-[13px] font-bold text-white mb-1">
                {isFR ? "Votre entreprise perd " + totalLeak.toLocaleString() + " $/an" : "Your business is leaking $" + totalLeak.toLocaleString() + "/year"}
              </p>
              <p className="text-[11px] text-white/60">
                {recommendedPlan === "enterprise"
                  ? t("Your revenue qualifies for Enterprise — we recover savings on contingency.", "Vos revenus vous qualifient pour Enterprise — nous récupérons à la performance.")
                  : recommendedPlan === "business"
                  ? t("Based on your revenue, you qualify for Business.", "Selon vos revenus, vous etes admissible au plan Business.")
                  : t("Unlock the full report, fix steps and alerts.", "Debloquez le rapport complet et les corrections.")}
              </p>
            </div>
            <button onClick={() => router.push(upgradeUrl)} className="px-4 py-2 text-[12px] font-bold text-brand bg-white rounded-lg hover:opacity-90 transition flex-shrink-0">
              {upgradeTarget === "enterprise"
                ? t("Book strategy call →", "Réserver un appel →")
                : `${upgradeName} ${upgradePrice}/${t("mo", "mois")}`}
            </button>
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5" style={fadeDelay(0.04)}>
          <button onClick={() => isPaid ? router.push("/v2/diagnostic") : router.push(upgradeUrl)} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all group" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{t("Health Score", "Score sante")}</div>
            <div className="flex items-end gap-1.5">
              <span className="font-serif text-[36px] font-bold leading-none tracking-tight" style={{ color: score >= 60 ? "#1B3A2D" : "#C4841D" }}>{score}</span>
              <span className="text-xs text-ink-faint mb-1">/100</span>
            </div>
            <div className="mt-3 h-[3px] bg-bg-section rounded-full"><div className="h-full rounded-full transition-all duration-1000" style={{ width: score + "%", background: score >= 70 ? "#2D7A50" : score >= 40 ? "#C4841D" : "#B34040" }} /></div>
          </button>

          <button onClick={() => isPaid ? router.push("/v2/leaks") : router.push(upgradeUrl)} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{t("Annual Leak", "Fuite annuelle")}</div>
            <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-negative">${totalLeak.toLocaleString()}</div>
            <div className="text-[10px] text-ink-faint mt-1.5">
              {isPaid ? displayLeaks.length : 1} {t("leaks detected", "fuites detectees")}
              {!isPaid && allLeaks.length > 1 && (
                <span className="ml-1 text-negative font-semibold">+{allLeaks.length - 1} {t("locked", "verrouillés")}</span>
              )}
            </div>
          </button>

          <div className="bg-white rounded-xl p-5 border border-border-light" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{t("Recovered", "Recupere")}</div>
            {isPaid ? (
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-serif text-[36px] font-bold leading-none tracking-tight text-positive">${recovered.toLocaleString()}</div>
                  <div className="text-[10px] text-ink-faint mt-1.5">{leaksFixed} {t("fixed", "corriges")}</div>
                </div>
                <div className="relative mt-1"><Ring pct={recovPct / 100} /><div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-bold text-positive">{recovPct}%</span></div></div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1"><LockIcon /><span className="text-[11px] text-ink-faint">{t("Upgrade to track", "Mettre a niveau")}</span></div>
            )}
          </div>

          <button onClick={() => isPaid ? router.push("/v2/obligations") : router.push(upgradeUrl)} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-3">OBLIGATIONS</div>
            {isPaid ? (
              <div className="flex items-end gap-2">
                <span className="font-serif text-[36px] font-bold leading-none tracking-tight">{obligationsTotal}</span>
                {overdue > 0 && <span className="text-[10px] font-bold text-negative mb-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(179,64,64,0.05)" }}>{overdue} {t("late", "retard")}</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1"><LockIcon /><span className="text-[11px] text-ink-faint">{t("Upgrade to see", "Mettre a niveau")}</span></div>
            )}
          </button>
        </div>

        {/* MAIN 3-COL */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-3" style={fadeDelay(0.1)}>

          {/* COL 1: LEAKS */}
          <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="px-4 py-3 border-b border-border-light flex justify-between items-center">
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Detected Leaks", "Fuites detectees")}</span>
              {isPaid && <button onClick={() => router.push("/v2/leaks")} className="text-[9px] font-semibold text-brand hover:underline">{t("View all", "Tout voir")}</button>}
            </div>

            {isFree ? (
              <>
                {displayLeaks.slice(0, 1).map((l, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border-light" style={{ background: "rgba(179,64,64,0.015)" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-[7px] h-[7px] rounded-full shrink-0 mt-1.5" style={{ background: "#B34040" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold text-white bg-negative px-1.5 py-0.5 rounded">#1</span>
                          <span className="text-[12px] font-semibold text-ink">{isFR ? (l.title_fr || l.title) : l.title}</span>
                        </div>
                        <div className="text-[10px] text-ink-faint mb-2">{l.category}</div>
                        {(isFR ? (l.action_fr || l.action) : l.action) && (
                          <div className="p-2 rounded-lg text-[10px] text-ink-secondary mb-2" style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.06)" }}>
                            <span className="font-semibold text-brand">{t("Fix: ", "Correction : ")}</span>{isFR ? (l.action_fr || l.action) : l.action}
                          </div>
                        )}
                        {l.affiliates && l.affiliates.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {l.affiliates.slice(0, 3).map((a, ai) => (
                              <a key={ai} href={a.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-brand border border-brand/20 px-2 py-0.5 rounded-full hover:bg-brand/5 transition">{a.name}</a>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max || l.impact_min).toLocaleString()}</div>
                        <div className="text-[7px] text-ink-faint">/{t("yr", "an")}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="relative">
                  {displayLeaks.slice(1, 4).map((l, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center gap-3 border-b border-border-light" style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }}>
                      <div className="w-[7px] h-[7px] rounded-full shrink-0 bg-border" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-ink truncate">{isFR ? (l.title_fr || l.title) : l.title}</div>
                        <div className="text-[9px] text-ink-faint">{l.category}</div>
                      </div>
                      <div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max || l.impact_min).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                {allLeaks.length > 1 && (
                  <div className="px-4 py-4 text-center border-t border-border-light">
                    <p className="text-[11px] font-semibold text-ink-muted mb-2.5">
                      {allLeaks.length - 1} {t("more leaks hidden", "fuites supplementaires cachees")}
                    </p>
                    <button onClick={() => router.push(upgradeUrl)} className="text-[11px] font-bold text-white bg-brand px-4 py-2 rounded-lg hover:opacity-90 transition">
                      {t("Unlock " + upgradeName + " " + upgradePrice + "/mo", "Debloquer " + upgradeName + " " + upgradePrice + "/mois")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {displayLeaks.slice(0, 6).map((l, i) => (
                  <div key={i} onClick={() => router.push("/v2/leaks")} className="px-4 py-2.5 flex items-center gap-3 border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors cursor-pointer group" style={{ background: l.severity === "critical" ? "rgba(179,64,64,0.02)" : "transparent" }}>
                    <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: SEV_DOT[l.severity] || "#8E8C85" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-ink truncate group-hover:text-brand transition-colors">{isFR ? (l.title_fr || l.title) : l.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-ink-faint">{l.category}</span>
                        {l.confidence && (<div className="flex items-center gap-1"><div className="w-5 h-[3px] bg-bg-section rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: l.confidence + "%", background: l.confidence >= 70 ? "#2D7A50" : "#C4841D" }} /></div><span className="text-[8px] text-ink-faint">{Math.round(l.confidence)}%</span></div>)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-serif text-[14px] font-bold text-negative">${(l.impact_max || l.impact_min).toLocaleString()}</div>
                      <div className="text-[7px] text-ink-faint">/{t("yr", "an")}</div>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2.5 bg-bg flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-ink-muted">Total</span>
                  <span className="font-serif text-[14px] font-bold text-negative">${totalLeak.toLocaleString()}/{t("yr", "an")}</span>
                </div>
              </>
            )}
          </div>

          {/* COL 2: ACTION + RECOVERY + NORTH STAR + 90-DAY + STRENGTHS */}
          <div className="flex flex-col gap-3">

            {isPaid && tonightAction && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light flex items-center gap-2">
                  <span className="text-[14px]">&#x1F319;</span>
                  <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Do This Tonight", "A faire ce soir")}</span>
                  <span className="text-[9px] text-ink-faint ml-auto">{tonightAction.time_required}</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[13px] font-semibold text-ink mb-3">{tonightAction.title}</p>
                  <ol className="space-y-2">
                    {(tonightAction.steps || []).map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[11px] text-ink-secondary">
                        <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.08)", color: "#1B3A2D" }}>{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light">
                    <span className="text-[10px] text-ink-faint italic">{tonightAction.why_tonight}</span>
                    <span className="text-[11px] font-bold text-positive">~${tonightAction.estimated_value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border-light overflow-hidden flex-1" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-3 border-b border-border-light">
                <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Recovery Plan", "Plan de recuperation")}</span>
              </div>
              {!isPaid ? (
                <div className="px-4 py-8 text-center">
                  <LockIcon />
                  <p className="text-[11px] text-ink-muted mt-2 mb-3">{t("Your personalized fix plan is locked.", "Votre plan de correction est verrouille.")}</p>
                  <button onClick={() => router.push(upgradeUrl)} className="text-[11px] font-bold text-brand border border-brand/20 px-3 py-1.5 rounded-lg hover:bg-brand/5 transition">
                    {t("Unlock for " + upgradePrice + "/mo", "Debloquer pour " + upgradePrice + "/mois")}
                  </button>
                </div>
              ) : allActions.length === 0 ? (
                <div className="px-4 py-6 text-center text-[11px] text-ink-muted">{t("Actions appear after your first diagnostic.", "Les actions apparaissent apres votre diagnostic.")}</div>
              ) : allActions.slice(0, 4).map((a, i) => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3 border-b border-border-light last:border-0">
                  <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0" style={{ border: "2px solid " + (a.status === "in_progress" ? "#C4841D" : "#E8E6E1") }}>
                    {a.status === "in_progress" ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#C4841D" }} /> : <span className="text-[9px] font-bold text-ink-faint">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-ink truncate">{a.leak_title}</div>
                    {a.fix_description && <div className="text-[9px] text-ink-faint truncate mt-0.5">{a.fix_description}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-serif text-[13px] font-bold text-positive">+${a.estimated_value.toLocaleString()}</div>
                    <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: a.status === "in_progress" ? "#C4841D" : "#8E8C85", background: a.status === "in_progress" ? "rgba(196,132,29,0.06)" : "#F0EFEB" }}>{a.status === "in_progress" ? t("Active", "En cours") : t("To do", "A faire")}</span>
                  </div>
                </div>
              ))}
              {completedActions.length > 0 && (
                <div className="px-4 py-2.5 bg-bg flex justify-between items-center">
                  <span className="text-[10px] text-ink-muted">{completedActions.length} {t("completed", "terminees")}</span>
                  <span className="text-[10px] font-bold text-positive">+${recovered.toLocaleString()}</span>
                </div>
              )}
            </div>

            {isPaid && northStar && (
              <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider mb-2">{t("Your North Star", "Votre etoile polaire")}</p>
                <p className="text-[13px] font-semibold text-ink mb-2">{northStar.metric}</p>
                <div className="flex items-center gap-2 text-[11px] mb-2">
                  <span className="text-ink-faint">{northStar.current_value}</span>
                  <span className="text-ink-faint/40">-&gt;</span>
                  <span className="font-semibold text-positive">{northStar.target_value}</span>
                </div>
                <p className="text-[10px] text-ink-faint">{northStar.how_to_track_it}</p>
              </div>
            )}

            {isPaid && ninetyDay && (
              <div className="rounded-xl p-4" style={{ background: "rgba(45,122,80,0.04)", border: "1px solid rgba(45,122,80,0.10)" }}>
                <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: "rgba(45,122,80,0.7)" }}>{t("90-Day Goal", "Objectif 90 jours")}</p>
                <p className="text-[11px] text-ink-secondary leading-relaxed mb-2">{ninetyDay.success_statement}</p>
                <div className="space-y-1">
                  {(ninetyDay.key_milestones || []).slice(0, 4).map((m: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-ink-faint">
                      <span className="text-positive mt-0.5">+</span>{m}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isPaid && strengths.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="px-4 py-3 border-b border-border-light">
                  <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("What You Are Doing Well", "Ce que vous faites bien")}</span>
                </div>
                {strengths.slice(0, 2).map((s, i) => (
                  <div key={i} className="px-4 py-2.5 border-b border-border-light last:border-0">
                    <p className="text-[11px] font-semibold text-positive mb-0.5">+ {s.title}</p>
                    <p className="text-[10px] text-ink-faint">{s.description}</p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => router.push(upgradeUrl)} className="w-full bg-white rounded-xl border border-border-light p-4 text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-ink mb-0.5">
                    {upgradeTarget === "enterprise"
                      ? t("Book a free strategy call", "Réserver un appel stratégie gratuit")
                      : t("Upgrade to " + upgradeName, "Passer a " + upgradeName)}
                  </p>
                  <p className="text-[9px] text-ink-faint">
                    {upgradeTarget === "enterprise"
                      ? t("We recover savings on contingency — $0 upfront", "Récupération à la performance — $0 d'avance")
                      : t("Full diagnostic - Fix steps - Alerts", "Diagnostic complet - Etapes - Alertes")}
                  </p>
                </div>
                <span className="text-[12px] font-bold text-brand">
                  {upgradeTarget === "enterprise" ? t("Free →", "Gratuit →") : `${upgradePrice}/${t("mo", "mois")}`}
                </span>
              </div>
            </button>
          </div>

          {/* COL 3: SIDEBAR */}
          <div className="flex flex-col gap-3">

            {/* Deadlines */}
            <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-2.5 border-b border-border-light flex justify-between items-center">
                <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Deadlines", "Echeances")}</span>
                {isPaid && <button onClick={() => router.push("/v2/obligations")} className="text-[9px] font-semibold text-brand hover:underline">{t("All", "Tout")}</button>}
              </div>
              {!isPaid ? (
                <div className="px-4 py-4 text-center flex flex-col items-center gap-1.5"><LockIcon /><p className="text-[10px] text-ink-faint">{t("Upgrade to see deadlines", "Mettre a niveau")}</p></div>
              ) : deadlines.length === 0 ? (
                <div className="px-4 py-4 text-[11px] text-ink-faint text-center">{t("None upcoming", "Aucune echeance")}</div>
              ) : deadlines.slice(0, 4).map((dl, i) => (
                <div key={i} onClick={() => router.push("/v2/obligations")} className="px-4 py-2.5 flex items-center justify-between border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="text-[11px] font-medium text-ink truncate">{dl.title}</div>
                    {(dl.penalty_max || 0) > 0 && <div className="text-[8px] text-ink-faint mt-0.5">${dl.penalty_max!.toLocaleString()}</div>}
                  </div>
                  <div className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-md shrink-0" style={{ background: dl.days_until <= 3 ? "#B34040" : dl.days_until <= 7 ? "rgba(179,64,64,0.06)" : "#F0EFEB", color: dl.days_until <= 3 ? "white" : dl.days_until <= 7 ? "#B34040" : "#8E8C85" }}>{dl.days_until}{t("d", "j")}</div>
                </div>
              ))}
            </div>

            {/* Programs */}
            <div className="bg-white rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-4 py-2.5 border-b border-border-light flex justify-between items-center">
                <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{t("Government Programs", "Programmes gouvernementaux")}</span>
                {isPaid && <button onClick={() => router.push("/v2/programs")} className="text-[9px] font-semibold text-brand hover:underline">{t("All", "Tout")}</button>}
              </div>
              {!isPaid ? (
                <div className="px-4 py-4 text-center flex flex-col items-center gap-1.5"><LockIcon /><p className="text-[10px] text-ink-faint">{t("Unlock to see programs", "Mettre a niveau")}</p></div>
              ) : diagPrograms.length > 0 ? (
                <>
                  {diagPrograms.slice(0, 3).map((p, i) => (
                    <div key={i} className="px-4 py-2.5 border-b border-border-light last:border-0">
                      <div className="text-[11px] font-semibold text-ink truncate">{isFR ? (p.name_fr || p.name) : p.name}</div>
                      {p.value > 0 && <div className="text-[10px] text-positive font-semibold mt-0.5">{t("up to", "jusqu a")} ${p.value.toLocaleString()}</div>}
                    </div>
                  ))}
                  {diagPrograms.length > 3 && (
                    <button onClick={() => router.push("/v2/programs")} className="w-full px-4 py-2.5 text-[10px] font-semibold text-brand hover:bg-bg transition text-left">
                      +{diagPrograms.length - 3} {t("more programs", "autres programmes")}
                    </button>
                  )}
                </>
              ) : (
                <div className="px-4 py-4 text-center">
                  <span className="font-serif text-[28px] font-bold leading-none tracking-tight text-positive">{programsAvailable || "?"}</span>
                  <p className="text-[10px] text-ink-faint mt-1">{t("Run diagnostic for matched programs", "Lancez le diagnostic pour vos programmes")}</p>
                </div>
              )}
            </div>

            {/* Recovery bar */}
            {isPaid && (
              <div className="bg-white rounded-xl border border-border-light p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-3">{t("Recovery", "Recuperation")}</div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 bg-bg-section rounded-full overflow-hidden"><div className="h-full rounded-full bg-positive transition-all duration-700" style={{ width: Math.max(recovPct, 1) + "%" }} /></div>
                  <span className="text-[12px] font-bold text-ink tabular-nums">{recovPct}%</span>
                </div>
                <div className="flex justify-between text-[9px] text-ink-faint">
                  <span>${recovered.toLocaleString()} {t("recovered", "recupere")}</span>
                  <span>${totalLeak.toLocaleString()} total</span>
                </div>
              </div>
            )}

            {/* AI Chat */}
            <button onClick={() => isPaid ? router.push("/v2/chat") : router.push(upgradeUrl)} className="w-full bg-white rounded-xl border border-brand/15 p-4 text-left hover:shadow-[0_4px_16px_rgba(27,58,45,0.08)] transition-all" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-ink">{t("Ask Fruxal AI", "Demander a Fruxal IA")}</div>
                  <div className="text-[9px] text-ink-faint">{!isPaid ? t("Upgrade to unlock", "Mettre a niveau") : t("Get answers about your finances", "Posez vos questions financieres")}</div>
                </div>
                {!isPaid && <div className="ml-auto"><LockIcon /></div>}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
