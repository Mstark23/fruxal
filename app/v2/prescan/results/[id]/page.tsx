// =============================================================================
// src/app/v2/prescan/results/[id]/page.tsx
// =============================================================================
// THE CONVERSION PAGE.
//
// Design principles:
//   1. Drama — findings reveal one by one with staggered animation
//   2. Specificity — real dollar amounts, not vague promises
//   3. Trust — show 3 real findings for free (prove we know your business)
//   4. Urgency — blur the rest, show "X more findings hidden"
//   5. FOMO — "$14,200/yr you're leaving on the table"
//   6. Single CTA — "Unlock Full Diagnostic" repeated strategically
// =============================================================================

"use client";

const FEATURE_ICONS: Record<string, JSX.Element> = {
  search:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  dollar:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  plan:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  risk:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  benchmark: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/></svg>,
};

import { useLang } from "@/hooks/useLang";
import { LangToggle } from "@/components/ui/LangToggle";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeaserLeak {
  slug: string;
  title: string;
  title_fr: string;
  severity: string;
  impact_min: number;
  impact_max: number;
  category: string;
  solution_type: string;
}

interface Insight {
  type: string;
  title: string;
  title_fr: string;
  impact: string;
  severity: string;
}

interface PrescanResult {
  id: string;
  input_snapshot: {
    province: string;
    industry: string;
    structure: string;
    annual_revenue: number;
    employee_count: number;
    tier: string;
  };
  summary: {
    health_score: number;
    total_obligations: number;
    critical_obligations: number;
    high_obligations: number;
    total_penalty_exposure: number;
    total_leaks: number;
    critical_leaks: number;
    high_leaks: number;
    leak_range_min: number;
    leak_range_max: number;
    programs_count: number;
  };
  teaser_leaks: TeaserLeak[];
  hidden_leak_count: number;
  insights: Insight[];
  obligation_categories: string[];
  teaser_programs: { name: string; category: string }[];
  hidden_program_count: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string; label_en: string; label_fr: string }> = {
  critical: { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",    label_en: "Critical", label_fr: "Critique", label: "Critical" },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", label_en: "High",  label_fr: "Élevé",   label: "High" },
  medium:   { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label_en: "Medium", label_fr: "Moyen",  label: "Medium" },
  low:      { color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   label_en: "Low",    label_fr: "Faible",  label: "Low" },
};

const CATEGORY_LABELS: Record<string, string> = {
  tax: "Tax", payroll: "Payroll", compliance: "Compliance",
  operations: "Operations", insurance: "Insurance", government_program: "Programs",
  registration: "Registration", permits: "Permits", contract: "Contracts",
};

// ═══════════════════════════════════════════════════════════════════════════════

export default function PrescanResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { lang, setLang, t, isFR } = useLang();
  const [result, setResult] = useState<PrescanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealPhase, setRevealPhase] = useState(0); // 0=loading, 1=score, 2=leaks, 3=obligations, 4=programs, 5=cta
  const [captureEmail, setCaptureEmail] = useState(false);
  const [captureEmailVal, setCaptureEmailVal] = useState("");
  const [captureLoading, setCaptureLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v2/prescan/results/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setResult(json.data);
          // Staggered reveal for drama
          const _to = setTimeout(() => setRevealPhase(1), 300);   // Score ring
          return () => clearTimeout(_to);
          const _to2 = setTimeout(() => setRevealPhase(2), 1200);   // Findings
          return () => clearTimeout(_to);
          const _to3 = setTimeout(() => setRevealPhase(3), 2400);   // Obligations
          return () => clearTimeout(_to);
          const _to4 = setTimeout(() => setRevealPhase(4), 3200);   // Programs
          return () => clearTimeout(_to);
          const _to5 = setTimeout(() => setRevealPhase(5), 4000);   // CTA
          return () => clearTimeout(_to);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/30 text-sm animate-pulse">Running your scan against 4,200+ leak patterns…</p>
        </div>
      </div>
    );
  }

  const s = result.summary;
  const scoreColor = s.health_score >= 70 ? "emerald" : s.health_score >= 40 ? "amber" : "red";

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <div className="max-w-lg mx-auto px-4 pb-12">

        {/* ═══ HEADER ═══ */}
        <header className="pt-6 pb-4 text-center">
          <div className="flex justify-end mb-2"><LangToggle lang={lang} setLang={setLang} variant="light" /></div>
          <p className="text-white/15 text-[10px] uppercase tracking-widest mb-1">Your Free Scan Results</p>
          <h1 className="text-white/70 text-lg font-bold">
            Here's what we found in your {result.input_snapshot.province} {result.input_snapshot.industry.replace(/_/g, " ")} business
          </h1>
        </header>

        {/* ═══ HEALTH SCORE — THE HOOK ═══ */}
        <div className={`transition-all duration-700 ${revealPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex flex-col items-center py-6">
            <div className="relative w-32 h-32 mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke={scoreColor === "emerald" ? "#10b981" : scoreColor === "amber" ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(s.health_score / 100) * 264} 264`}
                  className="transition-all duration-[1.5s] ease-out"
                  style={{ strokeDasharray: revealPhase >= 1 ? (s.health_score / 100) * 264 + " 264" : "0 264" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${scoreColor === "emerald" ? "text-emerald-400" : scoreColor === "amber" ? "text-amber-400" : "text-red-400"}`}>
                  {revealPhase >= 1 ? s.health_score : "—"}
                </span>
                <span className="text-[9px] text-white/20 uppercase tracking-wider">Health Score</span>
              </div>
            </div>

            <p className="text-white/30 text-xs text-center max-w-xs">
              {s.health_score < 40 ? t(
                "Your business is in the red zone. You're likely losing a meaningful percentage of your revenue to leaks that aren't obvious from the inside. This is fixable — but the longer you wait, the more it costs.",
                "Votre entreprise est dans la zone rouge. Vous perdez probablement une part significative de vos revenus à cause de fuites non visibles. C'est réparable — mais plus vous attendez, plus ça coûte."
              ) : s.health_score < 70 ? t(
                "Your business is in reasonable shape, but there are gaps costing you more than you'd expect. Most of them are fixable without a complete overhaul — just a few targeted decisions.",
                "Votre entreprise se porte raisonnablement bien, mais des lacunes vous coûtent plus que prévu. La plupart sont corrigeables sans refonte complète — quelques décisions ciblées suffisent."
              ) : t(
                "Your foundations are solid. But 'good' isn't the same as 'optimized' — and what we found shows there's still real money being left on the table.",
                "Vos bases sont solides. Mais 'bien' n'est pas la même chose qu''optimisé' — et ce que nous avons trouvé montre qu'il y a encore de l'argent laissé sur la table."
              )}
            </p>
          </div>

          {/* ═══ THE NUMBER — Emotional punch ═══ */}
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 text-center mb-6">
            <p className="text-white/20 text-[10px] uppercase tracking-wider mb-1">You're likely losing this much every year</p>
            <p className="text-3xl font-black text-red-400">
              ${(s.leak_range_min ?? 0).toLocaleString()} — ${(s.leak_range_max ?? 0).toLocaleString()}
            </p>
            <p className="text-white/15 text-[10px] mt-1">Based on your revenue, industry, province, and patterns across thousands of Canadian businesses — not a generic estimate.</p>
          </div>
        </div>

        {/* ═══ INSIGHTS — Business-specific callouts ═══ */}
        {result.insights.length > 0 && revealPhase >= 2 && (
          <div className="space-y-2 mb-6">
            {result.insights.map((insight, i) => {
              const sev = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.medium;
              return (
                <div key={i} className={`${sev.bg} border rounded-xl px-4 py-3`}
                  style={{ animation: `fadeUp 0.4s ease-out ${i * 0.15}s both` }}>
                  <div className="flex items-start gap-2">
                    <span className={`text-[9px] font-bold uppercase ${sev.color} mt-0.5`}>{isFR ? sev.label_fr : sev.label_en}</span>
                    <div className="flex-1">
                      <p className="text-white/60 text-xs font-medium">{insight.title}</p>
                      <p className="text-white/25 text-[10px] mt-0.5">{insight.impact}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ FINDINGS — Show 5, gate the rest ═══ */}
        {revealPhase >= 2 && (() => {
          const VISIBLE = 5;
          const visible = result.teaser_leaks.slice(0, VISIBLE);
          const totalHidden = Math.max(0, s.total_leaks - visible.length);
          const hiddenValue = Math.round((s.leak_range_max - s.leak_range_min) * (totalHidden / Math.max(s.total_leaks, 1)));

          return (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider">Money Leaks Found</h2>
                <span className="text-red-400/60 text-[10px] font-bold">{s.total_leaks} detected</span>
              </div>

              <div className="space-y-2">
                {visible.map((leak, i) => {
                  const sev = SEVERITY_CONFIG[leak.severity] || SEVERITY_CONFIG.medium;
                  return (
                    <div key={leak.slug} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"
                      style={{ animation: `fadeUp 0.4s ease-out ${i * 0.2}s both` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${sev.bg} ${sev.color}`}>
                          {isFR ? sev.label_fr : sev.label_en}
                        </span>
                        <span className="text-white/15 text-[9px]">{CATEGORY_LABELS[leak.category] || leak.category}</span>
                      </div>
                      <h3 className="text-white/60 text-sm font-semibold mb-1">{isFR && leak.title_fr ? leak.title_fr : leak.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-red-400/70 text-xs font-bold">
                          ${(leak.impact_min ?? 0).toLocaleString()} — ${(leak.impact_max ?? 0).toLocaleString()}/yr
                        </span>
                        <span className="text-white/10 text-[9px]">
                          {leak.solution_type === "free_fix" ? t("🆓 Free fix", "🆓 Gratuit") :
                           leak.solution_type === "government_program" ? t("Gov program", "Programme gouvernemental") :
                           leak.solution_type === "professional" ? t("Professional", "Professionnel") : t("🔗 Solution available", "🔗 Solution disponible")}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* ═══ GATE — Blurred cards + signup CTA ═══ */}
                {totalHidden > 0 && (
                  <div className="relative mt-2">
                    {/* Blurred ghost cards */}
                    {[0, 1, 2].slice(0, Math.min(3, totalHidden)).map(n => (
                      <div key={n} className="bg-white/[0.015] border border-white/[0.03] rounded-xl p-4 mb-2"
                        style={{ filter: "blur(5px)", opacity: 0.35 - n * 0.08, pointerEvents: "none" }}>
                        <div className="flex gap-2 mb-2">
                          <span className="w-12 h-4 bg-white/5 rounded" />
                          <span className="w-20 h-4 bg-white/3 rounded" />
                        </div>
                        <div className="w-3/4 h-4 bg-white/4 rounded mb-2" />
                        <div className="w-1/3 h-4 bg-red-500/10 rounded" />
                      </div>
                    ))}

                    {/* Gradient fade */}
                    <div className="absolute inset-0 rounded-xl"
                      style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(10,14,20,0.7) 40%, rgba(10,14,20,0.97) 70%)" }} />

                    {/* CTA overlay */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 mb-2">
                        {totalHidden} more findings — ${(hiddenValue ?? 0).toLocaleString()}/yr still hidden
                      </div>
                      <p className="text-white/25 text-[10px] mb-3">
                        We'll fix these for you — no cost upfront. We only take 12% of what we actually recover.
                      </p>
                      <button onClick={() => router.push(`/register?from=prescan&prescanRunId=${params.id}`)}
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all">
                        Get a Free Recovery Call →
                      </button>
                      <p className="text-white/10 text-[9px] mt-1.5">No cost until we recover. We take 12% of what we get back.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ═══ OBLIGATIONS SECTION ═══ */}
        {revealPhase >= 3 && (
          <div className="mb-6" style={{ animation: "fadeUp 0.5s ease-out" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider">Legal Obligations</h2>
              <span className="text-amber-400/60 text-[10px] font-bold">{s.total_obligations} apply to you</span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5">
              {/* Penalty exposure */}
              <div className="text-center mb-4">
                <p className="text-white/15 text-[9px] uppercase tracking-wider">Total Penalty Exposure</p>
                <p className="text-2xl font-black text-amber-400">${(s.total_penalty_exposure ?? 0).toLocaleString()}</p>
              </div>

              {/* Risk breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-red-500/5 rounded-lg px-3 py-2 text-center">
                  <p className="text-red-400 text-lg font-black">{s.critical_obligations}</p>
                  <p className="text-red-400/40 text-[9px]">Critical</p>
                </div>
                <div className="bg-orange-500/5 rounded-lg px-3 py-2 text-center">
                  <p className="text-orange-400 text-lg font-black">{s.high_obligations}</p>
                  <p className="text-orange-400/40 text-[9px]">High</p>
                </div>
                <div className="bg-blue-500/5 rounded-lg px-3 py-2 text-center">
                  <p className="text-blue-400 text-lg font-black">{s.total_obligations - s.critical_obligations - s.high_obligations}</p>
                  <p className="text-blue-400/40 text-[9px]">Other</p>
                </div>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5">
                {result.obligation_categories.map(cat => (
                  <span key={cat} className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-white/20 text-[10px]">
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                ))}
              </div>

              {/* Blurred details hint */}
              <div className="mt-4 pt-3 border-t border-white/[0.04] text-center">
                <p className="text-white/15 text-[10px]">
                  Deadlines, forms, agencies & action steps — all in the full diagnostic
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PROGRAMS TEASER ═══ */}
        {revealPhase >= 4 && (
          <div className="mb-8" style={{ animation: "fadeUp 0.5s ease-out" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider">Programs You're Missing</h2>
              <span className="text-emerald-400/60 text-[10px] font-bold">{s.programs_count} available</span>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5">
              {result.teaser_programs.map((prog, i) => (
                <div key={i} className={`flex items-center gap-3 ${i > 0 ? "mt-3 pt-3 border-t border-emerald-500/5" : ""}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>
                  <div>
                    <p className="text-emerald-400/70 text-xs font-semibold">{prog.name}</p>
                    <p className="text-emerald-400/30 text-[10px]">{prog.category}</p>
                  </div>
                </div>
              ))}

              {result.hidden_program_count > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-500/5 text-center">
                  <p className="text-emerald-400/30 text-[10px]">
                    +{result.hidden_program_count} more grants, credits & loans available
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ THE CTA — Contingency recovery pitch ═══ */}
        {revealPhase >= 5 && (
          <div style={{ animation: "fadeUp 0.5s ease-out" }}>

            {/* How it works */}
            <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "linear-gradient(135deg, #0F2419 0%, #1B3A2D 100%)", border: "1px solid rgba(45,122,80,0.2)" }}>
              <div className="px-5 pt-5 pb-2">
                <p className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest mb-2">{isFR ? "Comment ça marche" : "How it works"}</p>
                <h3 className="text-white text-[16px] font-bold mb-4 leading-snug">
                  {isFR ? "Nous faisons tout le travail. Vous gardez 88%." : "We do all the work. You keep 88%."}
                </h3>
                <div className="space-y-2 mb-4">
                  {[
                    { n: "1", en: "We assign you a recovery expert", fr: "On vous assigne un expert en récupération" },
                    { n: "2", en: "Our accountant calls CRA and handles the claims", fr: "Notre comptable appelle l'ARC et gère les réclamations" },
                    { n: "3", en: "You pay nothing until money is recovered", fr: "Vous ne payez rien avant récupération" },
                    { n: "4", en: "We take 12% of what we get back. You keep the rest.", fr: "On prend 12% de ce qu'on récupère. Vous gardez le reste." },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-black text-emerald-400">{s.n}</span>
                      </div>
                      <span className="text-[12px] text-white/60 leading-tight">{isFR ? s.fr : s.en}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Math block */}
              {s.leak_range_min > 0 && (
                <div className="mx-4 mb-4 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-white/25 uppercase tracking-wider mb-0.5">{isFR ? "Fuite estimée" : "Estimated leak"}</p>
                      <p className="text-[16px] font-black text-red-400">${(s.leak_range_min ?? 0).toLocaleString()}/yr</p>
                    </div>
                    <div className="text-white/10 text-lg">→</div>
                    <div className="text-right">
                      <p className="text-[9px] text-white/25 uppercase tracking-wider mb-0.5">{isFR ? "Vous récupérez" : "You could recover"}</p>
                      <p className="text-[16px] font-black text-emerald-400">${Math.round((s.leak_range_min ?? 0) * 0.88).toLocaleString()}/yr</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-white/15 text-center mt-2">{isFR ? "après notre commission de 12%" : "after our 12% contingency fee"}</p>
                </div>
              )}
            </div>

            {/* CTA button */}
            {/* Quick email capture for anonymous users */}
            {!captureEmail && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3">
                <p className="text-white/50 text-[11px] text-center mb-2">
                  {isFR ? "Envoyez-vous ce rapport par courriel" : "Email yourself this report"}
                </p>
                <div className="flex gap-2">
                  <input type="email" placeholder="your@email.com" value={captureEmailVal}
                    onChange={e => setCaptureEmailVal(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-[12px] placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                  <button onClick={async () => {
                    if (!captureEmailVal.includes("@")) return;
                    setCaptureLoading(true);
                    try {
                      await fetch("/api/v2/prescan/email-capture", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: captureEmailVal, prescanResultId: params.id }),
                      });
                      setCaptureEmail(true);
                    } finally { setCaptureLoading(false); }
                  }} disabled={captureLoading || !captureEmailVal.includes("@")}
                    className="px-3 py-2 rounded-lg bg-emerald-500/80 text-white text-[11px] font-semibold disabled:opacity-40">
                    {captureLoading ? "…" : (isFR ? "Envoyer" : "Send")}
                  </button>
                </div>
                {captureEmail && <p className="text-emerald-400 text-[11px] text-center mt-2">✓ {isFR ? "Envoyé!" : "Sent!"}</p>}
              </div>
            )}
            <button onClick={() => router.push(`/register?from=prescan&prescanRunId=${params.id}`)}
              className="w-full py-4 rounded-2xl text-[#0F2419] font-bold text-base shadow-xl transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}>
              {isFR ? "Obtenir un appel de récupération gratuit →" : "Book a Free Recovery Call →"}
            </button>
            <p className="text-center text-white/15 text-[9px] mt-2">
              {isFR ? "Gratuit · Aucun frais avant récupération · On s'occupe de tout" : "Free · No cost until we recover · We handle everything"}
            </p>

            {/* Social proof */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-white/30 text-sm font-bold">4,273+</p>
                <p className="text-white/10 text-[9px]">leak detectors</p>
              </div>
              <div className="w-px h-6 bg-white/[0.04]" />
              <div className="text-center">
                <p className="text-white/30 text-sm font-bold">10</p>
                <p className="text-white/10 text-[9px]">provinces</p>
              </div>
              <div className="w-px h-6 bg-white/[0.04]" />
              <div className="text-center">
                <p className="text-white/30 text-sm font-bold">265+</p>
                <p className="text-white/10 text-[9px]">obligations tracked</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
