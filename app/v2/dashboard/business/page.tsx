"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCelebration } from "@/hooks/useCelebration";

function SevBadge({ sev }: { sev: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    critical: { bg: "rgba(179,64,64,0.08)",   color: "#B34040", label: "Critical" },
    high:     { bg: "rgba(196,132,29,0.08)",  color: "#C4841D", label: "High"     },
    medium:   { bg: "rgba(142,140,133,0.10)", color: "#56554F", label: "Medium"   },
    low:      { bg: "rgba(142,140,133,0.06)", color: "#8E8C85", label: "Low"      },
  };
  const s = map[sev] || map.medium;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

interface Leak { slug: string; title: string; title_fr?: string; severity: string; category: string; description: string; description_fr?: string; impact_min: number; impact_max: number; confidence: number | null; affiliates?: Array<{ name: string; url: string }>; }
interface CostItem { category: string; pct_of_revenue: number; benchmark_pct: number; status: string }
interface Deadline { title: string; days_until: number; penalty_max?: number }
interface ActionItem { id: string; leak_title: string; fix_description: string; estimated_value: number; status: string }
interface ActionStats { total_recovered: number; actions_completed: number }

export default function BusinessDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { progress } = useCelebration();
  const [loading, setLoading]   = useState(true);
  const [lang, setLang]         = useState<"en" | "fr">("en");
  const [mounted, setMounted]   = useState(false);
  const [score, setScore]                       = useState(0);
  const [totalLeak, setTotalLeak]               = useState(0);
  const [leaks, setLeaks]                       = useState<Leak[]>([]);
  const [profile, setProfile]                   = useState({ province: "QC", industry: "Small Business", structure: "", business_name: "" });
  const [overdue, setOverdue]                   = useState(0);
  const [penaltyExposure, setPenaltyExposure]   = useState(0);
  const [obligationsTotal, setObligationsTotal] = useState(0);
  const [programsAvailable, setProgramsAvailable] = useState(0);
  const [deadlines, setDeadlines]               = useState<Deadline[]>([]);
  const [leaksFixed, setLeaksFixed]             = useState(0);
  const [totalSavings, setTotalSavings]         = useState(0);
  const [costBreakdown, setCostBreakdown]       = useState<CostItem[]>([]);
  const [actionStats, setActionStats]           = useState<ActionStats | null>(null);
  const [inProgressActions, setInProgressActions] = useState<ActionItem[]>([]);
  const [thisWeekActions, setThisWeekActions]   = useState<ActionItem[]>([]);
  const [completedActions, setCompletedActions] = useState<ActionItem[]>([]);
  const [reportId, setReportId]                 = useState<string | null>(null);
  const [bankabilityScore, setBankabilityScore] = useState(0);
  const [diagFindings, setDiagFindings]         = useState<any[]>([]);
  const [briefing, setBriefing]                 = useState<any>(null);
  const [diagBenchmarks, setDiagBenchmarks]     = useState<any[]>([]);
  const [planSequence, setPlanSequence]         = useState<any[]>([]);
  const [diagPrograms, setDiagPrograms]         = useState<Array<{ slug: string; name: string; value: number }>>([]);
  const [qbConnected, setQbConnected]           = useState(false);
  const [plaidConnected, setPlaidConnected]     = useState(false);
  const [stripeConnected, setStripeConnected]   = useState(false);
  const [dataScore, setDataScore]               = useState(0);
  const [diagTopFinding, setDiagTopFinding]     = useState<string>("");
  const [totalPotentialSavings, setTotalPotentialSavings] = useState(0);
  const [savingsAnchor, setSavingsAnchor]       = useState<string>("");
  const [execSummary, setExecSummary]           = useState<string>("");

  const t    = useCallback((en: string, fr: string) => lang === "fr" ? fr : en, [lang]);
  const isFR = lang === "fr";

  useEffect(() => {
    // Immediately mark this user as business tier so nav and tier router never redirect to solo
    try { localStorage.setItem("fruxal_tier", "business"); } catch {}
    try { sessionStorage.setItem("fruxal_session_tier", "business"); } catch {}
    try { const s = sessionStorage.getItem("lg_prescan_lang"); if (s === "en" || s === "fr") setLang(s); } catch {}

    const params    = new URLSearchParams(window.location.search);
    const rid       = params.get("prescanRunId");
    const isPreview = params.get("preview") === "1";
    const v2Url     = rid ? "/api/v2/dashboard?prescanRunId=" + rid : "/api/v2/dashboard";

    const v2P = fetch(v2Url).then(r => r.json()).then(json => {
      if (!json.success || !json.data) return;
      const d = json.data;
      // Only redirect based on PAID tier - never on recommended_plan.
      // recommended_plan reflects revenue and will say "enterprise" for $5M+ users
      // who are on the business plan. That is correct - they stay here.
      const detectedTier = (d.tier || "free").toLowerCase();
      if (!isPreview) {
        if (detectedTier === "enterprise" || detectedTier === "corp") {
          router.replace("/v2/dashboard/enterprise"); return;
        }
        try { localStorage.setItem("fruxal_tier", "business"); } catch {}
      }
      setProfile(d.profile || { province: "QC", industry: "Small Business", structure: "", business_name: "" });
      setObligationsTotal(d.obligations?.total || 0);
      setOverdue(d.obligations?.overdue || 0);
      setPenaltyExposure(d.obligations?.penalty_exposure || 0);
      setDeadlines(d.obligations?.upcoming_deadlines || []);
      setProgramsAvailable(d.programs?.available || 0);
      setLeaksFixed(d.leaks?.fixed || 0);
      setTotalSavings(d.leaks?.total_savings || 0);
      if (d.leaks?.top_unfixed?.length > 0) {
        setScore(d.health_score || 0);
        setTotalLeak(d.total_leak_estimate || 0);
        const sev = (s: any) => { if (typeof s === "string" && ["critical","high","medium","low"].includes(s)) return s; const n = Number(s); return isNaN(n) ? "medium" : n >= 80 ? "critical" : n >= 60 ? "high" : n >= 30 ? "medium" : "low"; };
        setLeaks(d.leaks.top_unfixed.map((l: any) => ({ slug: l.slug, title: l.title, title_fr: l.title_fr, severity: sev(l.severity), category: l.category || "General", description: l.description || "", description_fr: l.description_fr, impact_min: l.impact_min || 0, impact_max: l.impact_max || l.impact_min || 0, confidence: l.confidence, affiliates: l.affiliates || [] })));
      }
    }).catch(() => {});

    // v3/dashboard needs businessId — we load it from v2P first, then fetch v3
    // For immediate load, try with empty (gets prescan data), re-fetch after biz load
    fetch("/api/v3/dashboard").then(r => r.json()).then(json => {
      if (json.snapshot?.cost_breakdown?.length) setCostBreakdown(json.snapshot.cost_breakdown);
    }).catch(() => {});
    const v3P = Promise.resolve();

    const diagP = fetch("/api/v2/diagnostic/latest").then(r => r.json()).then(json => {
      if (!json.success || !json.data) return;
      const r = json.data;
      setReportId(json.report_id || null);
      const ds = r.scores?.overall ?? r.overall_score ?? 0;
      if (ds > 0) setScore(ds);
      const dl = r.total_annual_leaks || r.totals?.annual_leaks || 0;
      if (dl > 0) setTotalLeak(dl);
      setBankabilityScore(r.scores?.bankability ?? r.bankability_score ?? 0);
      if (r.findings?.length > 0) setDiagFindings(r.findings);
      setBriefing(r.accountant_briefing || (typeof r.cpa_briefing === "string" && r.cpa_briefing ? { summary: r.cpa_briefing, cra_forms_relevant: [], estimated_tax_exposure: 0, questions_to_ask: [] } : null));
      setDiagBenchmarks((r.benchmark_comparisons || []).slice(0, 4));
      if (r.action_plan?.optimal_sequence?.length) setPlanSequence(r.action_plan.optimal_sequence);
      if (r.savings_anchor?.headline) setSavingsAnchor(r.savings_anchor.headline);
      if (r.executive_summary) setExecSummary(isFR ? (r.executive_summary_fr || r.executive_summary) : r.executive_summary);
      if (r.findings?.length > 0) {
        const top = r.findings.find((f: any) => f.severity === "critical") || r.findings[0];
        if (top) setDiagTopFinding(isFR ? (top.title_fr || top.title) : top.title);
        const slugs: string[] = [];
        r.findings.forEach((f: any) => { (f.program_slugs || []).forEach((s: string) => { if (!slugs.includes(s)) slugs.push(s); }); });
        if (slugs.length > 0) {
          fetch("/api/v2/affiliates?type=government&limit=50").then(res => res.json()).then(aff => {
            const matched = (aff.affiliates || []).filter((a: any) => slugs.includes(a.slug)).map((a: any) => ({ slug: a.slug, name: isFR ? (a.name_fr || a.name) : a.name, value: a.annual_value_max || a.annual_value_min || 0 }));
            if (matched.length > 0) setDiagPrograms(matched);
          }).catch(() => {});
        }
      }
      const aiS = r.total_potential_savings || r.totals?.potential_savings || 0;
      if (aiS > 0) setTotalPotentialSavings(aiS);
    }).catch(() => {});

    // integration status (non-blocking)
    Promise.all([
      fetch("/api/quickbooks/status").then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/plaid/status").then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/stripe-connect/status").then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([qb, plaid, stripe]) => {
      const qbOk     = !!(qb?.connected     && qb?.status     !== "error");
      const plaidOk  = !!(plaid?.connected  && plaid?.status  !== "error");
      const stripeOk = !!(stripe?.connected && stripe?.status !== "error");
      setQbConnected(qbOk);
      setPlaidConnected(plaidOk);
      setStripeConnected(stripeOk);
      let score = 20;
      if (qbOk)     score += 40;
      if (plaidOk)  score += 25;
      if (stripeOk) score += 15;
      setDataScore(Math.min(100, score));
    }).catch(() => {});

    const actP = user?.id ? fetch("/api/v2/actions?userId=" + user.id).then(r => r.json()).then(json => {
      if (json.stats) setActionStats(json.stats);
      if (json.actions) { setThisWeekActions(json.actions.this_week || []); setInProgressActions(json.actions.in_progress || []); setCompletedActions(json.actions.completed || []); }
    }).catch(() => {}) : Promise.resolve();

    Promise.all([v2P, v3P, diagP, actP]).finally(() => { setLoading(false); requestAnimationFrame(() => setMounted(true)); });
  }, [user?.id, lang]);

  const recovered   = actionStats?.total_recovered || totalSavings || 0;
  const recovTarget = totalPotentialSavings > 0 ? totalPotentialSavings : totalLeak;
  const recovPct    = recovTarget > 0 ? Math.min(100, Math.round((recovered / recovTarget) * 100)) : 0;
  const streak      = (progress as any)?.streak || null;
  const displayLeaks = diagFindings.length > 0 ? diagFindings : leaks;
  const allActions  = [...inProgressActions, ...thisWeekActions];
  const isNewUser   = !loading && !authLoading && totalLeak === 0 && diagFindings.length === 0 && leaks.length === 0;
  const _h          = new Date().getHours();
  const greeting    = _h < 12 ? t("Good morning", "Bonjour") : _h < 18 ? t("Good afternoon", "Bon apres-midi") : t("Good evening", "Bonsoir");
  const fi          = (d: number) => ({ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease " + d + "s, transform 0.5s ease " + d + "s" });

  if (loading || authLoading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-8 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex items-start justify-between" style={fi(0)}>
          <div>
            <p className="text-[13px] text-ink-faint mb-1">{greeting}{user?.name ? ", " + user.name.split(" ")[0] : ""}</p>
            <h1 className="font-serif text-[28px] font-normal text-ink tracking-tight leading-none">
              {profile.business_name || profile.industry}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-ink-faint">{profile.industry} / {profile.province}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(27,58,45,0.08)", color: "#1B3A2D" }}>Business</span>
              {streak && streak.current > 1 && <span className="text-[10px] text-ink-faint">{streak.current} day streak</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="h-7 px-3 text-[11px] font-semibold text-ink-muted bg-white border border-border-light rounded-lg hover:bg-bg-section transition">
              {lang === "fr" ? "EN" : "FR"}
            </button>
            <button onClick={() => reportId ? router.push("/v2/diagnostic/" + reportId) : router.push("/v2/diagnostic")} className="h-7 px-3 text-[11px] font-semibold text-white rounded-lg transition" style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)" }}>
              {reportId ? t("Full Report", "Rapport complet") : t("Run Diagnostic", "Lancer diagnostic")}
            </button>
          </div>
        </div>

        {/* OVERDUE ALERT */}
        {overdue > 0 && (
          <button onClick={() => router.push("/v2/obligations")} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-left hover:opacity-90 transition" style={{ background: "rgba(179,64,64,0.04)", border: "1px solid rgba(179,64,64,0.15)" }}>
            <div className="w-2 h-2 rounded-full bg-negative animate-pulse shrink-0" />
            <div className="flex-1">
              <span className="text-[13px] font-semibold text-negative">{overdue} overdue obligation{overdue > 1 ? "s" : ""}</span>
              <span className="text-[12px] ml-2" style={{ color: "rgba(179,64,64,0.7)" }}>/ ${penaltyExposure.toLocaleString()} penalty exposure</span>
            </div>
            <span className="text-[12px] font-semibold text-negative shrink-0">Resolve</span>
          </button>
        )}

        {/* HERO */}
        {isNewUser ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "linear-gradient(135deg, #0d1f17 0%, #1B3A2D 60%, #24513e 100%)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease 0.08s, transform 0.5s ease 0.08s" }}>
            <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>{t("Welcome to Fruxal Business", "Bienvenue sur Fruxal Business")}</p>
            <p className="font-serif text-[32px] font-normal text-white mb-4">{t("Your financial diagnostic is ready.", "Votre diagnostic financier est pret.")}</p>
            <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>{t("3 steps to your first AI financial diagnostic.", "3 etapes pour votre premier diagnostic financier IA.")}</p>

            {/* 3-step flow */}
            <div className="w-full max-w-lg grid grid-cols-3 gap-3 mb-6 text-left">
              {[
                { num: "1", title: t("Connect your data", "Connectez vos donnees"), desc: t("QuickBooks, bank, or Stripe for accurate numbers", "QuickBooks, banque ou Stripe pour des chiffres precis"), done: dataScore > 20, action: () => router.push("/v2/integrations"), cta: t("Connect", "Connecter") },
                { num: "2", title: t("Fill your intake form", "Remplissez le formulaire"), desc: t("5 min - revenue, payroll, activities", "5 min - revenus, paie, activites"), done: false, action: () => router.push("/v2/diagnostic/intake"), cta: t("Start intake", "Commencer") },
                { num: "3", title: t("Run the AI diagnostic", "Lancez le diagnostic IA"), desc: t("Claude finds every leak and program", "Claude trouve chaque fuite et programme"), done: false, action: () => router.push("/v2/diagnostic/intake"), cta: t("Run", "Lancer") },
              ].map((step, i) => (
                <button key={i} onClick={step.action} className="bg-white/10 hover:bg-white/15 rounded-xl p-4 text-left transition border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: step.done ? "#4ade80" : "rgba(255,255,255,0.2)", color: step.done ? "#0d1f17" : "white" }}>{step.done ? "+" : step.num}</span>
                    <span className="text-[11px] font-bold text-white">{step.title}</span>
                  </div>
                  <p className="text-[10px] mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>{step.desc}</p>
                  <span className="text-[10px] font-bold text-brand">{step.cta} &gt;</span>
                </button>
              ))}
            </div>

            <button onClick={() => router.push("/v2/diagnostic/intake")} className="px-8 py-3.5 text-[14px] font-bold text-brand bg-white rounded-xl hover:opacity-90 transition">{t("Start Diagnostic Now", "Lancer le diagnostic maintenant")}</button>
          </div>
        ) : (totalLeak > 0 || savingsAnchor) ? (
          <div className="rounded-2xl p-6 lg:p-8" style={{ background: "linear-gradient(135deg, #0d1f17 0%, #1B3A2D 60%, #24513e 100%)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease 0.08s, transform 0.5s ease 0.08s" }}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>{t("Annual revenue at risk", "Revenus annuels a risque")}</p>
                <div className="font-serif text-[52px] lg:text-[64px] font-normal leading-none tracking-tight text-white mb-3">${totalLeak.toLocaleString()}</div>
                {execSummary ? <p className="text-[13px] leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.6)" }}>{execSummary}</p>
                  : savingsAnchor ? <p className="text-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{savingsAnchor}</p>
                  : null}
              </div>
              <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{t("Recovered", "Recupere")}</div>
                  <div className="font-serif text-[32px] font-normal leading-none" style={{ color: recovered > 0 ? "#4ade80" : "rgba(255,255,255,0.3)" }}>${recovered.toLocaleString()}</div>
                  {leaksFixed > 0 && <div className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{leaksFixed} {t("leaks fixed", "fuites corrigees")}</div>}
                </div>
                <div className="w-full lg:w-48">
                  <div className="flex items-center justify-between text-[10px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <span>{t("recovery progress", "progression")}</span>
                    <span className="font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>{recovPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: Math.max(recovPct, 1) + "%", background: "linear-gradient(90deg, #2D7A50, #4ade80)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* KPI ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={fi(0.12)}>
          {[
            { label: t("Health Score","Score sante"),  value: score > 0 ? score+"" : "--",              sub: score > 0 ? "/100" : t("run diagnostic","lancer"),                                   color: score >= 70 ? "#2D7A50" : score >= 40 ? "#C4841D" : "#B34040", bar: score,           click: () => router.push("/v2/diagnostic") },
            { label: t("Findings","Constats"),          value: displayLeaks.length+"",                   sub: t("leaks detected","fuites detectees"),                                                color: "#B34040",                                                       bar: 0,               click: () => router.push("/v2/leaks") },
            { label: "Obligations",                     value: obligationsTotal+"",                      sub: overdue > 0 ? overdue+" "+t("overdue","en retard") : t("all clear","tout bon"),       color: overdue > 0 ? "#B34040" : "#2D7A50",                            bar: 0,               click: () => router.push("/v2/obligations") },
            { label: "Bankability",                     value: bankabilityScore > 0 ? bankabilityScore+"" : "--", sub: bankabilityScore > 0 ? "/100" : t("run diagnostic","lancer"),               color: "#0369a1",                                                       bar: bankabilityScore, click: () => reportId ? router.push("/v2/diagnostic/"+reportId) : router.push("/v2/diagnostic") },
          ].map((kpi, i) => (
            <button key={i} onClick={kpi.click} className="bg-white rounded-xl p-5 border border-border-light text-left hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all">
              <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{kpi.label}</div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-[34px] font-normal leading-none" style={{ color: kpi.color }}>{kpi.value}</span>
                {kpi.sub && <span className="text-[11px] text-ink-faint">{kpi.sub}</span>}
              </div>
              {kpi.bar > 0 && <div className="mt-3 h-[3px] bg-bg-section rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: kpi.bar+"%", background: kpi.color }} /></div>}
            </button>
          ))}
        </div>

        {/* FINDINGS + ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5" style={fi(0.16)}>
          <div className="bg-white rounded-xl border border-border-light overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-ink">{t("Revenue Leaks","Fuites de revenus")}</h2>
                <p className="text-[11px] text-ink-faint mt-0.5">{t("Ranked by annual impact","Classe par impact annuel")}</p>
              </div>
              <button onClick={() => router.push("/v2/leaks")} className="text-[11px] font-semibold text-brand hover:underline">{t("View all","Tout voir")}</button>
            </div>
            {displayLeaks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-[13px] text-ink-muted mb-4">{t("No leaks detected yet.","Aucune fuite detectee.")}</p>
                <button onClick={() => router.push("/v2/diagnostic/intake")} className="px-5 py-2.5 text-[12px] font-semibold text-white rounded-xl transition" style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)" }}>{t("Run your first diagnostic","Lancer votre premier diagnostic")}</button>
              </div>
            ) : (
              <div>
                {displayLeaks.slice(0, 5).map((f: any, i: number) => {
                  const amount = f.annual_leak || f.potential_savings || f.impact_max || f.impact_min || 0;
                  const title  = isFR ? (f.title_fr || f.title) : f.title;
                  const desc   = isFR ? (f.description_fr || f.description) : f.description;
                  return (
                    <div key={i} onClick={() => router.push("/v2/leaks")} className="px-6 py-4 border-b border-border-light last:border-0 hover:bg-bg transition-colors cursor-pointer" style={{ borderLeft: "3px solid " + (f.severity === "critical" ? "#B34040" : f.severity === "high" ? "#C4841D" : "#E8E6E1") }}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <SevBadge sev={f.severity} />
                          <span className="text-[13px] font-semibold text-ink leading-snug">{title}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-serif text-[18px] font-normal text-negative leading-none">${(amount || 0).toLocaleString()}</div>
                          <div className="text-[10px] text-ink-faint mt-0.5">/{t("yr","an")}</div>
                        </div>
                      </div>
                      {f.calculation_shown
                        ? <div className="ml-[68px] px-3 py-2 rounded-lg" style={{ background: "rgba(27,58,45,0.03)", border: "1px solid rgba(27,58,45,0.07)" }}><code className="text-[10px] text-ink-muted">{f.calculation_shown}</code></div>
                        : desc ? <p className="ml-[68px] text-[11px] text-ink-faint leading-relaxed mt-1 line-clamp-1">{desc}</p> : null}
                    </div>
                  );
                })}
                <div className="px-6 py-3 bg-bg-section flex items-center justify-between">
                  <span className="text-[11px] text-ink-muted">{t("Total annual leaks","Total fuites annuelles")}</span>
                  <span className="font-serif text-[16px] font-normal text-negative">${totalLeak.toLocaleString()}/{t("yr","an")}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <div className="px-5 py-4 border-b border-border-light">
                <h2 className="text-[14px] font-semibold text-ink">{t("This Week","Cette semaine")}</h2>
                <p className="text-[11px] text-ink-faint mt-0.5">{t("Your highest-value actions","Actions a plus forte valeur")}</p>
              </div>
              {allActions.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[12px] text-ink-muted mb-4">{t("Actions appear after your first diagnostic.","Actions disponibles apres le premier diagnostic.")}</p>
                  <button onClick={() => router.push("/v2/diagnostic")} className="px-4 py-2 text-[11px] font-semibold text-white rounded-lg transition" style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)" }}>{t("Run Diagnostic","Lancer diagnostic")}</button>
                </div>
              ) : (
                <div>
                  {allActions.slice(0, 4).map((a, i) => (
                    <div key={a.id} className="px-5 py-3.5 flex items-center gap-3 border-b border-border-light last:border-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold" style={{ background: a.status === "in_progress" ? "rgba(196,132,29,0.1)" : "rgba(27,58,45,0.06)", color: a.status === "in_progress" ? "#C4841D" : "#1B3A2D" }}>
                        {a.status === "in_progress" ? "+" : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-ink leading-snug truncate">{a.leak_title}</div>
                        {a.fix_description && <div className="text-[10px] text-ink-faint mt-0.5 truncate">{a.fix_description}</div>}
                      </div>
                      <div className="font-serif text-[14px] text-positive shrink-0">+${(a.estimated_value || 0).toLocaleString()}</div>
                    </div>
                  ))}
                  {completedActions.length > 0 && (
                    <div className="px-5 py-2.5 bg-bg-section flex items-center justify-between">
                      <span className="text-[10px] text-ink-muted">{completedActions.length} {t("completed","completes")}</span>
                      <span className="text-[11px] font-semibold text-positive">+${recovered.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {planSequence.length > 0 && (
              <div className="bg-white rounded-xl border border-border-light overflow-hidden">
                <div className="px-5 py-4 border-b border-border-light">
                  <h2 className="text-[14px] font-semibold text-ink">{t("Priority Sequence","Sequence prioritaire")}</h2>
                </div>
                {planSequence.slice(0, 3).map((s: any, i: number) => (
                  <div key={i} className="px-5 py-3 flex items-start gap-3 border-b border-border-light last:border-0">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ background: "rgba(27,58,45,0.08)", color: "#1B3A2D" }}>{s.step || i+1}</span>
                    <p className="flex-1 text-[12px] font-medium text-ink">{s.action}</p>
                    <span className="text-[11px] font-semibold text-positive shrink-0">${(s.value || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-ink">{t("Deadlines","Echeances")}</h2>
                <button onClick={() => router.push("/v2/obligations")} className="text-[11px] font-semibold text-brand hover:underline">{t("All","Tout")}</button>
              </div>
              {deadlines.length === 0
                ? <div className="px-5 py-5 text-[12px] text-ink-faint text-center">{t("No upcoming deadlines.","Aucune echeance a venir.")}</div>
                : deadlines.slice(0, 3).map((dl, i) => (
                    <div key={i} onClick={() => router.push("/v2/obligations")} className="px-5 py-3 flex items-center gap-3 border-b border-border-light last:border-0 hover:bg-bg transition cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-ink truncate">{dl.title}</div>
                        {(dl.penalty_max || 0) > 0 && <div className="text-[10px] text-ink-faint mt-0.5">${(dl.penalty_max || 0).toLocaleString()} penalty</div>}
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0" style={{ background: dl.days_until <= 3 ? "#B34040" : dl.days_until <= 7 ? "rgba(179,64,64,0.08)" : "#F0EFEB", color: dl.days_until <= 3 ? "white" : dl.days_until <= 7 ? "#B34040" : "#8E8C85" }}>
                        {dl.days_until}{t("d","j")}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* CPA BRIEFING + BENCHMARKS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={fi(0.2)}>
          <div className="bg-white rounded-xl border border-border-light overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-ink">{t("Accountant Briefing","Briefing comptable")}</h2>
                <p className="text-[11px] text-ink-faint mt-0.5">{t("Share with your CPA","A partager avec votre comptable")}</p>
              </div>
              {briefing && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(6,182,212,0.08)", color: "#0e7490" }}>Ready</span>}
            </div>
            {briefing ? (
              <div className="px-6 py-5 space-y-4">
                <p className="text-[13px] text-ink-secondary leading-relaxed">{briefing.summary}</p>
                {briefing.cra_forms_relevant?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {briefing.cra_forms_relevant.map((form: string, i: number) => (
                      <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#0e7490" }}>{form}</span>
                    ))}
                  </div>
                )}
                {(briefing.estimated_tax_exposure || 0) > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(196,132,29,0.04)", border: "1px solid rgba(196,132,29,0.10)" }}>
                    <span className="text-[12px] text-ink-muted">{t("Tax Exposure","Exposition fiscale")}</span>
                    <span className="font-serif text-[20px] font-normal" style={{ color: "#C4841D" }}>${(briefing.estimated_tax_exposure || 0).toLocaleString()}</span>
                  </div>
                )}
                {briefing.questions_to_ask?.slice(0, 3).map((q: string, i: number) => (
                  <p key={i} className="text-[11px] text-ink-secondary italic pl-3 border-l-2 border-border leading-relaxed">"{q}"</p>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-[13px] text-ink-muted mb-4">{t("Run a diagnostic to generate your CPA briefing.","Lancez un diagnostic pour obtenir votre briefing CPA.")}</p>
                <button onClick={() => router.push("/v2/diagnostic")} className="px-5 py-2.5 text-[12px] font-semibold text-white rounded-xl transition" style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)" }}>{t("Run Diagnostic","Lancer diagnostic")}</button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-ink">{t("vs. Industry","vs. Industrie")}</h2>
                  <p className="text-[11px] text-ink-faint mt-0.5">{t("How you compare","Votre position")}</p>
                </div>
              </div>
              {diagBenchmarks.length > 0 ? (
                <div>
                  {diagBenchmarks.map((b, i) => (
                    <div key={i} className="px-6 py-3.5 border-b border-border-light last:border-0">
                      <p className="text-[11px] font-semibold text-ink-muted mb-2">{isFR ? (b.metric_fr || b.metric) : b.metric}</p>
                      <div className="grid grid-cols-3 text-center gap-2">
                        {[
                          { val: b.your_value || b.business_value, label: t("You","Vous"), color: "#1A1A18" },
                          { val: b.industry_avg,                   label: t("Avg","Moy."), color: "#0369a1" },
                          { val: b.top_quartile || b.top_performer, label: "Top 25%",      color: "#2D7A50" },
                        ].map((col, ci) => (
                          <div key={ci}>
                            <div className="text-[13px] font-semibold" style={{ color: col.color }}>{col.val || "--"}</div>
                            <div className="text-[9px] text-ink-faint mt-0.5">{col.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : costBreakdown.length > 0 ? (
                <div className="px-6 py-4 space-y-2">
                  {costBreakdown.slice(0, 4).map((c, i) => {
                    const over = c.pct_of_revenue > c.benchmark_pct * 1.05;
                    const w = Math.min(100, (c.pct_of_revenue / Math.max(c.benchmark_pct * 1.5, 1)) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-ink-secondary font-medium">{c.category}</span>
                          <div className="flex items-center gap-2">
                            <span className={"font-bold " + (over ? "text-negative" : "text-positive")}>{c.pct_of_revenue.toFixed(1)}%</span>
                            <span className="text-ink-faint">vs {c.benchmark_pct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-bg-section rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: w + "%", background: over ? "#B34040" : "#2D7A50" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-[12px] text-ink-muted mb-3">{t("Connect QuickBooks or run a diagnostic.","Connectez QuickBooks ou lancez un diagnostic.")}</p>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => router.push("/v2/diagnostic")} className="px-4 py-2 text-[11px] font-semibold text-white rounded-lg" style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)" }}>{t("Diagnostic","Diagnostic")}</button>
                    <button onClick={() => router.push("/v2/integrations")} className="px-4 py-2 text-[11px] font-semibold text-brand border border-brand/20 rounded-lg hover:bg-brand/5 transition">QuickBooks</button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-border-light overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-ink">{t("Government Programs","Programmes gouvernementaux")}</h2>
                <button onClick={() => router.push("/v2/programs")} className="text-[11px] font-semibold text-brand hover:underline">{t("All","Tout")}</button>
              </div>
              {diagPrograms.length > 0 ? (
                <div>
                  {diagPrograms.slice(0, 3).map((p, i) => (
                    <div key={i} className="px-6 py-3 flex items-center justify-between border-b border-border-light last:border-0">
                      <span className="text-[12px] font-medium text-ink flex-1 truncate mr-4">{isFR ? (p.name_fr || p.name) : p.name}</span>
                      {p.value > 0 && <span className="text-[12px] font-semibold text-positive shrink-0">${(p.value || 0).toLocaleString()}</span>}
                    </div>
                  ))}
                  {diagPrograms.length > 3 && (
                    <button onClick={() => router.push("/v2/programs")} className="w-full px-6 py-3 text-[11px] font-semibold text-brand hover:bg-bg transition text-left">
                      +{diagPrograms.length - 3} {t("more programs","autres programmes")}
                    </button>
                  )}
                </div>
              ) : (
                <div className="px-6 py-4 flex items-center gap-3">
                  <span className="font-serif text-[32px] font-normal text-positive leading-none">{programsAvailable}</span>
                  <span className="text-[12px] text-ink-faint">{t("programs available for you","programmes disponibles")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONNECTIONS */}
        <div className="bg-white rounded-xl border border-border-light overflow-hidden mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-semibold text-ink">{t("Data Connections", "Connexions de donnees")}</h2>
              <p className="text-[10px] text-ink-faint mt-0.5">{t("Connect real data for more accurate diagnostics", "Connectez vos donnees pour des diagnostics plus precis")}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-[6px] w-24 bg-bg-section rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: dataScore + "%", background: dataScore >= 60 ? "#2D7A50" : dataScore >= 35 ? "#C4841D" : "#B34040" }} />
              </div>
              <span className="text-[11px] font-bold text-ink">{dataScore}%</span>
            </div>
          </div>

          <div className="divide-y divide-border-light">

            {/* QuickBooks */}
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(43,162,81,0.08)", border: "1px solid rgba(43,162,81,0.15)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2BA251" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-ink">QuickBooks</span>
                  {qbConnected
                    ? <span className="text-[9px] font-bold text-positive bg-positive/8 px-2 py-0.5 rounded-full">{t("Connected", "Connecte")}</span>
                    : <span className="text-[9px] font-bold text-ink-faint bg-bg-section px-2 py-0.5 rounded-full">{t("Not connected", "Non connecte")}</span>}
                </div>
                <p className="text-[10px] text-ink-faint mt-0.5">{qbConnected ? t("Revenue, payroll, P&L synced", "Revenus, paie, P&L synchronises") : t("Pulls revenue, payroll, gross margin, net income", "Importe revenus, paie, marge brute, revenu net")}</p>
              </div>
              {qbConnected
                ? <button onClick={() => router.push("/v2/integrations")} className="text-[11px] font-semibold text-ink-faint hover:text-brand transition px-3 py-1.5 rounded-lg border border-border-light">{t("Manage", "Gerer")}</button>
                : <button onClick={() => router.push("/v2/integrations")} className="text-[11px] font-bold text-white px-3 py-1.5 rounded-lg transition" style={{ background: "#2BA251" }}>{t("Connect", "Connecter")}</button>}
            </div>

            {/* Bank - Plaid */}
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(27,58,45,0.06)", border: "1px solid rgba(27,58,45,0.10)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-ink">{t("Bank Account", "Compte bancaire")}</span>
                  {plaidConnected
                    ? <span className="text-[9px] font-bold text-positive bg-positive/8 px-2 py-0.5 rounded-full">{t("Connected", "Connecte")}</span>
                    : <span className="text-[9px] font-bold text-ink-faint bg-bg-section px-2 py-0.5 rounded-full">{t("Not connected", "Non connecte")}</span>}
                </div>
                <p className="text-[10px] text-ink-faint mt-0.5">{plaidConnected ? t("Cash flow and transactions synced", "Flux de tresorerie et transactions synchronises") : t("Pulls cash flow, recurring expenses, bank balance", "Importe flux de tresorerie, depenses recurrentes, solde")}</p>
              </div>
              {plaidConnected
                ? <button onClick={() => router.push("/v2/integrations")} className="text-[11px] font-semibold text-ink-faint hover:text-brand transition px-3 py-1.5 rounded-lg border border-border-light">{t("Manage", "Gerer")}</button>
                : <button onClick={() => router.push("/v2/integrations")} className="text-[11px] font-bold text-brand px-3 py-1.5 rounded-lg border border-brand/20 hover:bg-brand/5 transition">{t("Connect", "Connecter")}</button>}
            </div>

            {/* Stripe */}
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(99,91,255,0.06)", border: "1px solid rgba(99,91,255,0.12)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#635BFF" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-ink">Stripe</span>
                  {stripeConnected
                    ? <span className="text-[9px] font-bold text-positive bg-positive/8 px-2 py-0.5 rounded-full">{t("Connected", "Connecte")}</span>
                    : <span className="text-[9px] font-bold text-ink-faint bg-bg-section px-2 py-0.5 rounded-full">{t("Not connected", "Non connecte")}</span>}
                </div>
                <p className="text-[10px] text-ink-faint mt-0.5">{stripeConnected ? t("MRR, ARR, churn rate synced", "MRR, ARR, taux de churn synchronises") : t("Pulls MRR, ARR, refund rate, customer count", "Importe MRR, ARR, taux de remboursement, clients")}</p>
              </div>
              {stripeConnected
                ? <button onClick={() => router.push("/v2/integrations")} className="text-[11px] font-semibold text-ink-faint hover:text-brand transition px-3 py-1.5 rounded-lg border border-border-light">{t("Manage", "Gerer")}</button>
                : <a href="/api/stripe-connect/connect" className="text-[11px] font-bold text-white px-3 py-1.5 rounded-lg transition" style={{ background: "#635BFF" }}>{t("Connect", "Connecter")}</a>}
            </div>

          </div>
        </div>

        {/* ADVISOR + AI CHAT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={fi(0.24)}>
          <a href={process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL || "https://cal.com/fruxal/advisor"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white rounded-xl border border-brand/15 px-6 py-5 hover:shadow-[0_4px_20px_rgba(27,58,45,0.08)] transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(27,58,45,0.06)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.128.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0122 16.92z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink group-hover:text-brand transition-colors">{t("Book your advisor call","Reserver votre appel conseiller")}</div>
              <div className="text-[11px] text-ink-faint mt-0.5 truncate">{diagTopFinding ? t("Discuss: "+diagTopFinding,"Discuter: "+diagTopFinding) : t("Monthly 30-min session included","Session mensuelle de 30 min incluse")}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B5B3AD" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>

          <button onClick={() => router.push("/v2/chat")} className="flex items-center gap-4 bg-white rounded-xl border border-brand/15 px-6 py-5 text-left hover:shadow-[0_4px_20px_rgba(27,58,45,0.08)] transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(27,58,45,0.06)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink group-hover:text-brand transition-colors">{t("Ask Fruxal AI","Demander a Fruxal IA")}</div>
              <div className="text-[11px] text-ink-faint mt-0.5">{t("Get answers about your finances","Posez vos questions financieres")}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B5B3AD" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

      </div>
    </div>
  );
}
