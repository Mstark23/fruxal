// =============================================================================
// src/app/v2/tour/page.tsx — POST-ONBOARDING TOUR
// =============================================================================
// The "aha moment" experience.
//
// Triggered after onboarding wizard completes. Shows the user:
//   Step 1: "Here's what we found" — animated counter of matched items
//   Step 2: Your obligations — top 5 with deadlines, penalty exposure
//   Step 3: Your money leaks — top 3 with dollar impact, severity
//   Step 4: Programs you qualify for — grants, credits, loans
//   Step 5: Your health score — animated ring + "what's next" CTA
//
// Design principles:
//   • Each step reveals ONE category of findings
//   • Staggered animations build anticipation
//   • Real data from their profile (province, industry, structure)
//   • Ends with clear next action (run full diagnostic or go to dashboard)
//   • Skip button always available (respect impatient users)
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourData {
  profile: {
    province: string;
    industry: string;
    structure: string;
    employee_count: number;
    annual_revenue: number;
  };
  obligations: {
    total: number;
    critical: number;
    high: number;
    next_deadline: string | null;
    next_deadline_label: string | null;
    penalty_exposure: number;
    top: { title: string; category: string; risk_level: string; frequency: string; agency: string; penalty_max: number }[];
  };
  leaks: {
    total: number;
    critical: number;
    range_min: number;
    range_max: number;
    top: { title: string; severity: string; category: string; impact_min: number; impact_max: number; solution_type: string }[];
  };
  programs: {
    total: number;
    government: number;
    top: { name: string; category: string; description: string }[];
  };
  health_score: number;
}

type Step = 0 | 1 | 2 | 3 | 4;

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVINCE_NAMES: Record<string, string> = {
  QC: "Quebec", ON: "Ontario", BC: "British Columbia", AB: "Alberta",
  SK: "Saskatchewan", MB: "Manitoba", NS: "Nova Scotia", NB: "New Brunswick",
  PE: "PEI", NL: "Newfoundland & Labrador", YT: "Yukon", NT: "Northwest Territories", NU: "Nunavut",
};

const RISK_COLORS: Record<string, { text: string; bg: string }> = {
  critical: { text: "text-red-400", bg: "bg-red-500/10" },
  high: { text: "text-orange-400", bg: "bg-orange-500/10" },
  medium: { text: "text-yellow-400", bg: "bg-yellow-500/10" },
  low: { text: "text-blue-400", bg: "bg-blue-500/10" },
};

const CATEGORY_ICONS: Record<string, string> = {
  tax: "", payroll: "", compliance: "", registration: "",
  permits: "", contract: "", insurance: "", operations: "",
  government_program: "",
};

// ═══════════════════════════════════════════════════════════════════════════════

export default function OnboardingTour() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countersDone, setCountersDone] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v2/tour/data");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completeTour = useCallback(async (finalStep: number) => {
    try {
      await fetch("/api/v2/tour/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: finalStep }),
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const next = useCallback(() => {
    if (step < 4) setStep((step + 1) as Step);
    else {
      completeTour(4);
      router.push("/v2/dashboard");
    }
  }, [step, router, completeTour]);

  const skip = () => {
    completeTour(step);
    router.push("/v2/dashboard");
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/20 text-xs">Analyzing your business profile...</p>
        </div>
      </div>
    );
  }

  const provinceName = PROVINCE_NAMES[data.profile.province] || data.profile.province;

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col">

      {/* ═══ HEADER ═══ */}
      <header className="px-4 pt-5 pb-3 max-w-lg mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
              i <= step ? "w-8 bg-emerald-500" : "w-4 bg-white/[0.06]"
            }`} />
          ))}
        </div>
        <button onClick={skip} className="text-white/15 text-[10px] hover:text-white/25 transition-colors">
          Skip tour →
        </button>
      </header>

      {/* ═══ CONTENT ═══ */}
      <div className="flex-1 flex flex-col px-4 max-w-lg mx-auto w-full">
        <div className="flex-1 flex flex-col justify-center py-6" key={step} style={{ animation: "fadeUp 0.4s ease-out" }}>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* STEP 0: "Here's what we found"                                */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl mx-auto mb-5">
                
              </div>
              <h1 className="text-white/80 text-xl font-bold mb-2">
                Here's what we found for your {provinceName} business
              </h1>
              <p className="text-white/25 text-xs mb-8">
                Based on your {data.profile.industry.replace(/_/g, " ")} business as a {data.profile.structure.replace(/_/g, " ")}
              </p>

              {/* Animated counters */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <CounterCard
                  target={data.obligations.total}
                  label="Obligations"
                  sub="apply to you"
                  color="amber"
                  delay={400}
                  onDone={() => {}}
                />
                <CounterCard
                  target={data.leaks.total}
                  label="Money Leaks"
                  sub="detected"
                  color="red"
                  delay={800}
                  onDone={() => {}}
                />
                <CounterCard
                  target={data.programs.total}
                  label="Programs"
                  sub="you qualify for"
                  color="emerald"
                  delay={1200}
                  onDone={() => setCountersDone(true)}
                />
              </div>

              {/* Summary stat */}
              <div className={`transition-all duration-700 ${countersDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl px-5 py-3 inline-block">
                  <p className="text-white/15 text-[9px] uppercase tracking-wider">Estimated Annual Leak</p>
                  <p className="text-red-400 text-xl font-black">
                    ${(data.leaks.range_min ?? 0).toLocaleString()} — ${(data.leaks.range_max ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* STEP 1: Obligations                                           */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4841D" strokeWidth="2" strokeLinecap="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg></div>
                <div>
                  <h2 className="text-white/70 text-base font-bold">Your Legal Obligations</h2>
                  <p className="text-white/20 text-[10px]">{data.obligations.total} obligations apply · {data.obligations.critical} critical</p>
                </div>
              </div>

              {/* Penalty exposure banner */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-amber-400/40 text-[9px] uppercase tracking-wider">Penalty Exposure</p>
                  <p className="text-amber-400 text-lg font-black">${(data.obligations.penalty_exposure ?? 0).toLocaleString()}</p>
                </div>
                {data.obligations.next_deadline && (
                  <div className="text-right">
                    <p className="text-amber-400/40 text-[9px] uppercase tracking-wider">Next Deadline</p>
                    <p className="text-amber-400/70 text-sm font-bold">{data.obligations.next_deadline}</p>
                    <p className="text-amber-400/30 text-[9px]">{data.obligations.next_deadline_label}</p>
                  </div>
                )}
              </div>

              {/* Top obligations */}
              <div className="space-y-2">
                {data.obligations.top.map((ob, i) => {
                  const rc = RISK_COLORS[ob.risk_level] || RISK_COLORS.medium;
                  return (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3"
                      style={{ animation: `fadeUp 0.3s ease-out ${i * 0.1}s both` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${rc.bg} ${rc.text}`}>
                          {ob.risk_level}
                        </span>
                        <span className="text-white/10 text-[9px]">{ob.category}</span>
                        <span className="text-white/10 text-[9px] ml-auto">{ob.frequency}</span>
                      </div>
                      <p className="text-white/50 text-xs font-medium">{ob.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-white/15 text-[9px]">{ob.agency}</span>
                        {ob.penalty_max > 0 && (
                          <span className="text-red-400/40 text-[9px]">Up to ${(ob.penalty_max ?? 0).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {data.obligations.total > data.obligations.top.length && (
                <p className="text-center text-white/10 text-[10px] mt-3">
                  +{data.obligations.total - data.obligations.top.length} more in your dashboard
                </p>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* STEP 2: Money Leaks                                           */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
                <div>
                  <h2 className="text-white/70 text-base font-bold">Money Leaks Detected</h2>
                  <p className="text-white/20 text-[10px]">{data.leaks.total} leaks found · {data.leaks.critical} critical</p>
                </div>
              </div>

              {/* Total exposure */}
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 mb-4 text-center">
                <p className="text-red-400/40 text-[9px] uppercase tracking-wider">You're Leaving on the Table</p>
                <p className="text-red-400 text-2xl font-black">
                  ${(data.leaks.range_min ?? 0).toLocaleString()} — ${(data.leaks.range_max ?? 0).toLocaleString()}/yr
                </p>
              </div>

              {/* Top leaks */}
              <div className="space-y-2">
                {data.leaks.top.map((leak, i) => {
                  const rc = RISK_COLORS[leak.severity] || RISK_COLORS.medium;
                  return (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3"
                      style={{ animation: `fadeUp 0.3s ease-out ${i * 0.12}s both` }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${rc.bg} ${rc.text}`}>
                          {leak.severity}
                        </span>
                        <span className="text-white/10 text-[9px]">{leak.category}</span>
                      </div>
                      <p className="text-white/50 text-xs font-medium mb-1">{leak.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-red-400/60 text-xs font-bold">
                          ${(leak.impact_min ?? 0).toLocaleString()} — ${(leak.impact_max ?? 0).toLocaleString()}/yr
                        </span>
                        <span className="text-white/10 text-[9px]">
                          {leak.solution_type === "free_fix" ? "Free fix" :
                           leak.solution_type === "government_program" ? "Gov program" :
                           leak.solution_type === "professional" ? "Professional" : "Solution"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {data.leaks.total > data.leaks.top.length && (
                <p className="text-center text-white/10 text-[10px] mt-3">
                  +{data.leaks.total - data.leaks.top.length} more — run full diagnostic for complete analysis
                </p>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* STEP 3: Programs                                              */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg></div>
                <div>
                  <h2 className="text-white/70 text-base font-bold">Programs You Qualify For</h2>
                  <p className="text-white/20 text-[10px]">{data.programs.total} programs · {data.programs.government} government</p>
                </div>
              </div>

              <div className="space-y-2">
                {data.programs.top.map((prog, i) => (
                  <div key={i} className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl px-4 py-3"
                    style={{ animation: `fadeUp 0.3s ease-out ${i * 0.1}s both` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400/60">
                        {prog.category}
                      </span>
                    </div>
                    <p className="text-emerald-400/70 text-xs font-semibold mb-0.5">{prog.name}</p>
                    <p className="text-white/15 text-[10px] leading-relaxed line-clamp-2">{prog.description}</p>
                  </div>
                ))}
              </div>

              {data.programs.total > data.programs.top.length && (
                <p className="text-center text-white/10 text-[10px] mt-3">
                  +{data.programs.total - data.programs.top.length} more grants, credits & loans available
                </p>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* STEP 4: Health Score + CTA                                    */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="text-center">
              <p className="text-white/15 text-[9px] uppercase tracking-widest mb-4">Your Business Health Score</p>

              {/* Animated score ring */}
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="7" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={data.health_score >= 70 ? "#10b981" : data.health_score >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={`${(data.health_score / 100) * 264} 264`}
                    className="transition-all duration-[2s] ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatedNumber target={data.health_score} duration={2000}
                    className={`text-4xl font-black ${
                      data.health_score >= 70 ? "text-emerald-400" :
                      data.health_score >= 40 ? "text-amber-400" : "text-red-400"
                    }`} />
                  <span className="text-[9px] text-white/15 uppercase tracking-wider mt-0.5">out of 100</span>
                </div>
              </div>

              <p className="text-white/25 text-xs mb-6 max-w-xs mx-auto">
                {data.health_score < 40 ? "Your business has significant gaps. Let's fix them together." :
                 data.health_score < 70 ? "Good foundation, but there's real money being left on the table." :
                 "Looking solid! A few optimizations could save you even more."}
              </p>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <MiniSummary icon="calendar" value={data.obligations.total} label="Obligations" color="amber" />
                <MiniSummary icon="leak" value={`$${Math.round(data.leaks.range_max / 1000)}K`} label="Leak Exposure" color="red" />
                <MiniSummary icon="programs" value={data.programs.total} label="Programs" color="emerald" />
              </div>

              {/* What's next */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 mb-4 text-left">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-2">What's Next</p>
                <div className="space-y-2">
                  <NextStep icon="diagnostic" label="Run Your Full Intake" desc="Get exact dollar amounts — your rep needs this to start" primary />
                  <NextStep icon="calendar" label="Review Your Deadlines" desc="See upcoming obligations on your calendar" />
                  <NextStep icon="search" label="See All Your Leaks" desc="Your rep will tackle the highest-value ones first" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ NAVIGATION ═══ */}
        <div className="pb-8 flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep((step - 1) as Step)}
              className="px-5 py-3 rounded-xl bg-white/[0.03] text-white/25 text-sm hover:bg-white/[0.05] transition-colors">
              ←
            </button>
          )}
          <button onClick={next}
            className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/15 transition-all active:scale-[0.98]">
            {step === 0 ? "Show Me My Obligations →" :
             step === 1 ? "Show Me My Leaks →" :
             step === 2 ? "Show Me My Programs →" :
             step === 3 ? "See My Health Score →" :
             "Go to Dashboard"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function CounterCard({ target, label, sub, color, delay, onDone }: {
  target: number; label: string; sub: string; color: string; delay: number; onDone: () => void;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 1200;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
        onDone();
      } else {
        setCount(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target, onDone]);

  const c = color === "amber" ? "text-amber-400 bg-amber-500/8 border-amber-500/10" :
            color === "red" ? "text-red-400 bg-red-500/8 border-red-500/10" :
            "text-emerald-400 bg-emerald-500/8 border-emerald-500/10";

  return (
    <div className={`${c} border rounded-xl p-3 text-center transition-all duration-300 ${started ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
      <p className="text-2xl font-black">{started ? count : "—"}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-[8px] opacity-40">{sub}</p>
    </div>
  );
}

function AnimatedNumber({ target, duration, className }: {
  target: number; duration: number; className: string;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setValue(target);
          clearInterval(interval);
        } else {
          setValue(Math.round(current));
        }
      }, duration / steps);
    }, 300);
    return () => clearTimeout(timer);
  }, [target, duration]);

  return <span className={className}>{value}</span>;
}

function MiniSummary({ icon, value, label, color }: {
  icon: string; value: string | number; label: string; color: string;
}) {
  const c = color === "amber" ? "text-amber-400/60 bg-amber-500/5" :
            color === "red" ? "text-red-400/60 bg-red-500/5" :
            "text-emerald-400/60 bg-emerald-500/5";
  return (
    <div className={`${c} rounded-lg p-2.5 text-center`}>
      <span className="text-sm">{icon}</span>
      <p className="text-sm font-black mt-0.5">{value}</p>
      <p className="text-[8px] opacity-50">{label}</p>
    </div>
  );
}

function NextStep({ icon, label, desc, primary }: {
  icon: string; label: string; desc: string; primary?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${primary ? "bg-emerald-500/5 border border-emerald-500/10" : ""}`}>
      <span className="text-base">{icon}</span>
      <div className="flex-1">
        <p className={`text-[11px] font-semibold ${primary ? "text-emerald-400/70" : "text-white/30"}`}>{label}</p>
        <p className="text-[9px] text-white/15">{desc}</p>
      </div>
      <span className="text-white/10 text-xs">→</span>
    </div>
  );
}
