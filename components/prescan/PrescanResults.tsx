// =============================================================================
// src/components/prescan/PrescanResults.tsx
// =============================================================================
// Drop-in replacement for the results panel in your prescan page.
//
// Shows:
//   1. Health score gauge
//   2. Money at stake (penalties + leaks + programs)
//   3. Top action items (urgent first)
//   4. Obligations tab (what you MUST do)
//   5. Leaks tab (what you're losing)
//   6. Programs tab (free money available)
//   7. Conversion CTA with urgency
//
// Usage in prescan/page.tsx:
//   import { PrescanResults } from "@/components/prescan/PrescanResults";
//   ...
//   {showResults && analysis && (
//     <PrescanResults
//       report={intelligenceReport}  // from usePrescan() hook
//       onCTA={handleFixMyLeaks}
//       language={province === "QC" ? "fr" : "en"}
//     />
//   )}
// =============================================================================

"use client";

import { useState, useEffect, useRef } from "react";
import type { IntelligenceReport, ActionItem } from "@/types/intelligence";

interface Props {
  report: IntelligenceReport;
  onCTA: () => void;
  language?: "fr" | "en";
  className?: string;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1500, prefix = "$" }: { value: number; duration?: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(Math.round(value * eased));
      if (elapsed < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{prefix}{(Number(display) || 0).toLocaleString()}</>;
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 100, label }: { score: number; size?: number; label: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const _st = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 300);
    return () => clearTimeout(_st);
  }, [score, circumference]);

  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-black text-white">{score}</span>
        <span className="text-[9px] text-white/40 uppercase tracking-wider">/100</span>
      </div>
      <span className="text-[10px] text-white/40 mt-1">{label}</span>
    </div>
  );
}

// ─── Tab system ───────────────────────────────────────────────────────────────
type Tab = "actions" | "obligations" | "leaks" | "programs";

const TAB_CONFIG = {
  en: {
    actions: "🎯 Priority Actions",
    obligations: "📋 Obligations",
    leaks: "💸 Leaks Found",
    programs: "🏛️ Programs",
  },
  fr: {
    actions: "🎯 Actions prioritaires",
    obligations: "📋 Obligations",
    leaks: "💸 Fuites détectées",
    programs: "🏛️ Programmes",
  },
};

// ─── Labels ───────────────────────────────────────────────────────────────────
const LABELS = {
  en: {
    healthScore: "Business Health",
    penaltyExposure: "Penalty Exposure",
    leakImpact: "Revenue Leaking",
    programFunding: "Programs Available",
    totalAtStake: "Total At Stake",
    perYear: "/year",
    perMonth: "/month",
    cta: "Get Your Full Fix Plan →",
    ctaSub: "Free scan complete · Full diagnostic from",
    urgentBadge: "URGENT",
    highBadge: "HIGH",
    opportunityBadge: "OPPORTUNITY",
    criticalBadge: "CRITICAL",
    riskLevel: "Risk",
    penalty: "Penalty",
    frequency: "Frequency",
    agency: "Agency",
    impact: "Impact",
    severity: "Severity",
    type: "Type",
    maxFunding: "Up to",
    viewAll: "View all",
    matched: "matched to your business",
    noItems: "None found for your profile",
    obligations: "obligations to track",
    leaks: "potential leaks",
    programs: "government programs",
  },
  fr: {
    healthScore: "Santé d'entreprise",
    penaltyExposure: "Exposition aux pénalités",
    leakImpact: "Revenus qui fuient",
    programFunding: "Programmes disponibles",
    totalAtStake: "Total en jeu",
    perYear: "/an",
    perMonth: "/mois",
    cta: "Obtenez votre plan complet →",
    ctaSub: "Scan gratuit complété · Diagnostic complet à partir de",
    urgentBadge: "URGENT",
    highBadge: "ÉLEVÉ",
    opportunityBadge: "OPPORTUNITÉ",
    criticalBadge: "CRITIQUE",
    riskLevel: "Risque",
    penalty: "Pénalité",
    frequency: "Fréquence",
    agency: "Agence",
    impact: "Impact",
    severity: "Sévérité",
    type: "Type",
    maxFunding: "Jusqu'à",
    viewAll: "Voir tout",
    matched: "correspondant à votre entreprise",
    noItems: "Aucun trouvé pour votre profil",
    obligations: "obligations à suivre",
    leaks: "fuites potentielles",
    programs: "programmes gouvernementaux",
  },
};

// ─── Priority / severity colors ───────────────────────────────────────────────
function priorityStyle(p: string) {
  switch (p) {
    case "urgent": case "critical": return { bg: "bg-red-500/12", border: "border-red-500/25", text: "text-red-400", dot: "bg-red-500" };
    case "high": return { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", dot: "bg-orange-500" };
    case "opportunity": return { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-500" };
    default: return { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", dot: "bg-blue-500" };
  }
}

function riskStyle(r: string) {
  switch (r) {
    case "critical": return { bg: "bg-red-500/15", text: "text-red-400", label: "CRITICAL" };
    case "high": return { bg: "bg-orange-500/12", text: "text-orange-400", label: "HIGH" };
    case "medium": return { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "MEDIUM" };
    case "low": return { bg: "bg-blue-500/10", text: "text-blue-400", label: "LOW" };
    default: return { bg: "bg-white/5", text: "text-white/40", label: "INFO" };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function PrescanResults({ report, onCTA, language = "en", className = "" }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("actions");
  const [showAllActions, setShowAllActions] = useState(false);
  const L = LABELS[language] || LABELS.en;
  const T = TAB_CONFIG[language] || TAB_CONFIG.en;
  const resultsRef = useRef<HTMLDivElement>(null);

  // Scroll into view on mount
  useEffect(() => {
    const _to = setTimeout(() => {
    return () => clearTimeout(_to);
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }, []);

  const { scores, summary, money, top_actions, cta, profile } = report;
  const obligations = (report as any).report_data?.obligations || (report as any).obligations || [];
  const leaks = (report as any).report_data?.leaks || (report as any).leaks || [];
  const programs = (report as any).report_data?.programs || (report as any).programs || [];

  const price = profile?.tier === "SOLO" ? "9" : profile?.tier === "SMALL" ? "29" : "79";

  return (
    <div ref={resultsRef} className={`w-full max-w-2xl mx-auto ${className}`} style={{ animation: "fadeUp 0.6s ease-out" }}>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HEADER — Score + Headline */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-b from-white/[0.04] to-transparent rounded-2xl border border-white/[0.06] p-6 mb-4">
        <div className="flex items-center gap-6">
          {/* Score ring */}
          <div className="relative shrink-0">
            <ScoreRing score={scores.overall} size={100} label={L.healthScore} />
          </div>

          {/* Headline */}
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-sm leading-relaxed">{summary.headline}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <MiniStat
                count={summary.total_obligations}
                label={L.obligations}
                color="text-blue-400"
              />
              <MiniStat
                count={summary.total_leaks}
                label={L.leaks}
                color="text-orange-400"
              />
              <MiniStat
                count={summary.total_programs}
                label={L.programs}
                color="text-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MONEY CARDS — 3 key numbers */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <MoneyCard
          label={L.penaltyExposure}
          value={money.penalty_exposure?.max ?? 0}
          color="red"
        />
        <MoneyCard
          label={L.leakImpact}
          value={money.leak_impact?.max ?? 0}
          suffix={L.perYear}
          color="orange"
        />
        <MoneyCard
          label={L.programFunding}
          value={money.program_funding?.available ?? 0}
          color="emerald"
          isPositive
        />
      </div>

      {/* Total at stake bar */}
      <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border border-red-500/15 rounded-xl px-5 py-3 mb-4 flex items-center justify-between">
        <span className="text-xs text-white/50 uppercase tracking-wider font-medium">{L.totalAtStake}</span>
        <span className="text-xl font-black text-red-400">
          <AnimatedNumber value={money.total_at_stake?.max ?? 0} />
          <span className="text-xs text-red-400/60 ml-1">{L.perYear}</span>
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TABS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
        {(["actions", "obligations", "leaks", "programs"] as Tab[]).map((tab) => {
          const count = tab === "actions" ? top_actions?.length : tab === "obligations" ? obligations.length : tab === "leaks" ? leaks.length : programs.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-white/10 text-white border border-white/10"
                  : "bg-white/[0.03] text-white/40 border border-transparent hover:bg-white/[0.06] hover:text-white/60"
              }`}
            >
              {T[tab]}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? "bg-white/15 text-white" : "bg-white/5 text-white/30"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB CONTENT */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-hidden mb-4">

        {/* ── Actions Tab ──────────────────────────────────────────────── */}
        {activeTab === "actions" && (
          <div className="divide-y divide-white/[0.04]">
            {(top_actions || []).length === 0 ? (
              <EmptyState text={L.noItems} />
            ) : (
              <>
                {(showAllActions ? top_actions : top_actions?.slice(0, 5))?.map((item: ActionItem, i: number) => {
                  const ps = priorityStyle(item.priority);
                  return (
                    <div key={i} className="px-4 py-3 flex items-start gap-3" style={{ animation: `fadeUp 0.4s ease-out ${i * 0.08}s both` }}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ps.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${ps.bg} ${ps.text}`}>
                            {item.priority === "urgent" ? L.urgentBadge : item.priority === "high" ? L.highBadge : L.opportunityBadge}
                          </span>
                          <span className="text-[10px] text-white/25">{item.type}</span>
                        </div>
                        <p className="text-sm text-white/80 font-medium">{item.title}</p>
                        {(item.penalty_max || item.impact_max || item.max_funding) && (
                          <p className="text-xs text-white/30 mt-0.5">
                            {item.penalty_max ? `${L.penalty}: $${(Number(item.penalty_max) || 0).toLocaleString()}` : ""}
                            {item.impact_max ? `${L.impact}: $${(Number(item.impact_max) || 0).toLocaleString()}${L.perYear}` : ""}
                            {item.max_funding ? `${L.maxFunding} $${(Number(item.max_funding) || 0).toLocaleString()}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(top_actions?.length ?? 0) > 5 && !showAllActions && (
                  <button onClick={() => setShowAllActions(true)} className="w-full py-2.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    {L.viewAll} ({top_actions.length})
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Obligations Tab ──────────────────────────────────────────── */}
        {activeTab === "obligations" && (
          <div className="divide-y divide-white/[0.04]">
            {obligations.length === 0 ? (
              <EmptyState text={L.noItems} />
            ) : (
              obligations.slice(0, 10).map((ob: any, i: number) => {
                const rs = riskStyle(ob.risk_level);
                return (
                  <div key={i} className="px-4 py-3" style={{ animation: `fadeUp 0.3s ease-out ${i * 0.05}s both` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${rs.bg} ${rs.text}`}>
                            {rs.label}
                          </span>
                          <span className="text-[10px] text-white/20">{ob.category}</span>
                          {ob.frequency && <span className="text-[10px] text-white/15">· {ob.frequency}</span>}
                        </div>
                        <p className="text-sm text-white/80 font-medium">{ob.title}</p>
                        {ob.deadline && <p className="text-xs text-white/30 mt-0.5">📅 {ob.deadline}</p>}
                        {ob.agency && <p className="text-[10px] text-white/20 mt-0.5">{ob.agency}</p>}
                      </div>
                      {(ob.penalty_max > 0) && (
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-red-400">${Number(ob.penalty_max).toLocaleString()}</div>
                          <div className="text-[9px] text-white/20">{L.penalty}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {obligations.length > 10 && (
              <div className="px-4 py-2.5 text-center text-xs text-white/25">
                +{obligations.length - 10} more · {L.viewAll} in dashboard
              </div>
            )}
          </div>
        )}

        {/* ── Leaks Tab ────────────────────────────────────────────────── */}
        {activeTab === "leaks" && (
          <div className="divide-y divide-white/[0.04]">
            {leaks.length === 0 ? (
              <EmptyState text={L.noItems} />
            ) : (
              leaks.slice(0, 10).map((lk: any, i: number) => {
                const rs = riskStyle(lk.severity);
                return (
                  <div key={i} className="px-4 py-3" style={{ animation: `fadeUp 0.3s ease-out ${i * 0.05}s both` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${rs.bg} ${rs.text}`}>
                            {rs.label}
                          </span>
                          <span className="text-[10px] text-white/20">{lk.category}</span>
                        </div>
                        <p className="text-sm text-white/80 font-medium">{lk.title}</p>
                        {lk.question && (
                          <p className="text-xs text-white/30 mt-1 italic">"{lk.question}"</p>
                        )}
                        {lk.solution_type && (
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15">
                            {lk.solution_type === "government_program" ? "🏛️" : lk.solution_type === "affiliate" ? "🔗" : "🔧"} {lk.solution_type.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-orange-400">
                          ${Number((lk.impact_max || lk.annual_impact_max) ?? 0).toLocaleString()}
                        </div>
                        <div className="text-[9px] text-white/20">{L.perYear}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Programs Tab ──────────────────────────────────────────────── */}
        {activeTab === "programs" && (
          <div className="divide-y divide-white/[0.04]">
            {programs.length === 0 ? (
              <EmptyState text={L.noItems} />
            ) : (
              programs.slice(0, 10).map((pg: any, i: number) => {
                const typeEmoji = pg.type === "tax_credit" ? "💰" : pg.type === "grant" ? "🎁" : pg.type === "loan" ? "🏦" : pg.type === "subsidy" ? "💵" : pg.type === "training" ? "📚" : "🏛️";
                return (
                  <div key={i} className="px-4 py-3" style={{ animation: `fadeUp 0.3s ease-out ${i * 0.05}s both` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                            {typeEmoji} {pg.type?.replace("_", " ") || "program"}
                          </span>
                          {pg.level && <span className="text-[10px] text-white/20">{pg.level}</span>}
                        </div>
                        <p className="text-sm text-white/80 font-medium">{pg.name}</p>
                        <p className="text-xs text-white/35 mt-0.5 line-clamp-2">{pg.description}</p>
                        {pg.eligibility && (
                          <p className="text-[10px] text-white/20 mt-1">✓ {pg.eligibility}</p>
                        )}
                      </div>
                      {pg.max_funding > 0 && (
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-white/30">{L.maxFunding}</div>
                          <div className="text-sm font-bold text-emerald-400">${Number(pg.max_funding).toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CTA — Conversion block */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="sticky bottom-0 bg-[#0d1117]/95 backdrop-blur-md pt-3 pb-4 -mx-1 px-1 z-10">
        {/* Urgency bar */}
        {cta?.urgency_text && (
          <div className={`text-center text-xs mb-2 py-1.5 rounded-lg ${
            cta.urgency === "critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            cta.urgency === "high" ? "bg-orange-500/10 text-orange-400 border border-orange-500/15" :
            "bg-yellow-500/8 text-yellow-400 border border-yellow-400/15"
          }`}>
            ⚠️ {cta.urgency_text}
          </div>
        )}

        <button
          onClick={onCTA}
          className="w-full py-4 rounded-xl font-bold text-white text-base bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
        >
          {cta?.text || L.cta}
        </button>
        <p className="text-center text-[10px] text-white/20 mt-2">
          {L.ctaSub} ${price}{language === "fr" ? "/mois" : "/mo"}
        </p>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniStat({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg font-black ${color}`}>{count}</span>
      <span className="text-[10px] text-white/30">{label}</span>
    </div>
  );
}

function MoneyCard({ label, value, suffix, color, isPositive }: {
  label: string; value: number; suffix?: string; color: string; isPositive?: boolean;
}) {
  const colorMap: Record<string, string> = {
    red: "from-red-500/10 to-red-500/5 border-red-500/15 text-red-400",
    orange: "from-orange-500/10 to-orange-500/5 border-orange-500/15 text-orange-400",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/15 text-emerald-400",
  };
  const c = colorMap[color] || colorMap.orange;

  return (
    <div className={`bg-gradient-to-b ${c.split(" text-")[0]} border rounded-xl px-3 py-3 text-center`}>
      <div className="text-[10px] text-white/35 mb-1 truncate">{label}</div>
      <div className={`text-sm font-black ${c.split(" ").pop()}`}>
        {isPositive && value > 0 ? "+" : ""}<AnimatedNumber value={value} duration={1200} />
      </div>
      {suffix && <div className="text-[9px] text-white/20">{suffix}</div>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-xs text-white/20">{text}</p>
    </div>
  );
}
