"use client";
// =============================================================================
// app/v2/breakeven/page.tsx
// Break-Even Intelligence — 4 sections:
//   1. Current position (safety margin + cost breakdown)
//   2. Decision modeller (instant numbers + Claude narrative)
//   3. Seasonal calendar (if data available)
//   4. Setup form (when no data yet)
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  calculateBreakEven,
  calculateSafetyMargin,
  modelDecision,
  safetyLabel,
  validateCostInputs,
  type DecisionInput,
} from "@/lib/ai/break-even-calculator";

function fmt(n: number) { return "$" + Math.round(n ?? 0).toLocaleString(); }
function pct(n: number) { return Math.round(Math.abs(n ?? 0) * 10) / 10 + "%"; }

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type SafetyStatus = "comfortable" | "thin" | "below";

function StatusDot({ status }: { status: SafetyStatus }) {
  const colors = { comfortable: "#2D7A50", thin: "#C4841D", below: "#B34040" };
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: colors[status] }} />;
}

// ── Setup form ────────────────────────────────────────────────────────────────
interface CostFormData {
  rent: string; salaries: string; software: string; insurance: string; loanPayments: string; fixedOther: string;
  labour: string; materials: string; processing: string; varOther: string;
  revenue: string;
}

const EMPTY_FORM: CostFormData = {
  rent: "", salaries: "", software: "", insurance: "", loanPayments: "", fixedOther: "",
  labour: "", materials: "", processing: "", varOther: "",
  revenue: "",
};

function SetupForm({ businessId, onSaved }: { businessId: string; onSaved: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CostFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = (v: string) => Math.max(0, Number(v) || 0);

  const fixedTotal = n(form.rent) + n(form.salaries) + n(form.software) + n(form.insurance) + n(form.loanPayments) + n(form.fixedOther);
  const varTotal = n(form.labour) + n(form.materials) + n(form.processing) + n(form.varOther);
  const previewBE = fixedTotal > 0 || varTotal > 0
    ? calculateBreakEven(fixedTotal, varTotal) : null;

  async function save() {
    const rev = n(form.revenue);
    const validation = validateCostInputs(fixedTotal, varTotal, rev);
    if (!validation.valid) { setError(validation.error || "Invalid inputs"); return; }

    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/v2/breakeven", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          fixedCosts: { rent: n(form.rent), salaries: n(form.salaries), software: n(form.software), insurance: n(form.insurance), loanPayments: n(form.loanPayments), other: n(form.fixedOther) },
          variablePcts: { labour: n(form.labour), materials: n(form.materials), processing: n(form.processing), other: n(form.varOther) },
          currentRevenue: rev,
          dataSource: "manual",
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      onSaved(json.data);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  const inp = (key: keyof CostFormData, label: string, hint?: string) => (
    <div key={key}>
      <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[9px] text-ink-faint mb-1">{hint}</p>}
      <div className="flex items-center border border-border-light rounded-lg overflow-hidden bg-white">
        <span className="px-3 text-[12px] text-ink-faint bg-bg border-r border-border-light">$</span>
        <input
          type="number" min="0" value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="flex-1 px-3 py-2 text-[12px] text-ink bg-transparent focus:outline-none"
          placeholder="0"
        />
      </div>
    </div>
  );

  const pctInp = (key: keyof CostFormData, label: string) => (
    <div key={key}>
      <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{label}</label>
      <div className="flex items-center border border-border-light rounded-lg overflow-hidden bg-white">
        <input
          type="number" min="0" max="99" value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="flex-1 px-3 py-2 text-[12px] text-ink bg-transparent focus:outline-none"
          placeholder="0"
        />
        <span className="px-3 text-[12px] text-ink-faint bg-bg border-l border-border-light">%</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-border-light p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <h2 className="text-[16px] font-black text-ink mb-1">Calculate your break-even point</h2>
      <p className="text-[11px] text-ink-faint mb-5">2 minutes · This is the most important number in your business.</p>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${step >= s ? "text-white" : "text-ink-faint bg-bg-section"}`}
              style={{ background: step >= s ? "#1B3A2D" : undefined }}>
              {s}
            </div>
            {s < 3 && <div className={`h-px w-8 transition-colors ${step > s ? "bg-brand" : "bg-border-light"}`} />}
          </div>
        ))}
        <span className="text-[10px] text-ink-faint ml-1">
          {step === 1 ? "Fixed costs" : step === 2 ? "Variable costs" : "Revenue"}
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-[12px] font-semibold text-ink mb-3">What are your monthly fixed costs?</p>
          <p className="text-[10px] text-ink-faint -mt-2 mb-3">Fixed costs stay the same regardless of how much you sell.</p>
          <div className="grid grid-cols-2 gap-3">
            {inp("rent", "Rent / Office")}
            {inp("salaries", "Salaries (total)")}
            {inp("software", "Software / Tools")}
            {inp("insurance", "Insurance")}
            {inp("loanPayments", "Loan payments")}
            {inp("fixedOther", "Other fixed")}
          </div>
          {fixedTotal > 0 && <p className="text-[11px] font-semibold text-ink mt-2">Total fixed: {fmt(fixedTotal)}/mo</p>}
          <button onClick={() => setStep(2)} disabled={fixedTotal === 0}
            className="w-full mt-2 py-2.5 text-[12px] font-bold text-white rounded-lg disabled:opacity-40 transition hover:opacity-90"
            style={{ background: "#1B3A2D" }}>
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-[12px] font-semibold text-ink mb-1">What % of revenue goes to variable costs?</p>
          <p className="text-[10px] text-ink-faint mb-3">Variable costs change with revenue — the more you make, the more you spend on these.</p>
          <div className="grid grid-cols-2 gap-3">
            {pctInp("labour", "Labour / contractors")}
            {pctInp("materials", "Materials / inventory")}
            {pctInp("processing", "Payment processing")}
            {pctInp("varOther", "Other variable")}
          </div>
          {varTotal > 0 && <p className="text-[11px] font-semibold text-ink mt-2">Total variable: {Math.round(varTotal)}% of revenue</p>}
          {varTotal >= 95 && <p className="text-[10px] text-negative">Variable costs above 95% make break-even unreliable — please review your inputs.</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 text-[12px] font-semibold text-ink-muted border border-border-light rounded-lg hover:bg-bg-section transition">← Back</button>
            <button onClick={() => setStep(3)} disabled={varTotal >= 95}
              className="flex-1 py-2.5 text-[12px] font-bold text-white rounded-lg disabled:opacity-40 transition hover:opacity-90"
              style={{ background: "#1B3A2D" }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="text-[12px] font-semibold text-ink mb-3">What is your current monthly revenue?</p>
          <div className="flex items-center border border-border-light rounded-lg overflow-hidden bg-white">
            <span className="px-3 text-[12px] text-ink-faint bg-bg border-r border-border-light">$</span>
            <input type="number" min="0" value={form.revenue}
              onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))}
              className="flex-1 px-3 py-3 text-[14px] text-ink bg-transparent focus:outline-none"
              placeholder="e.g. 45000"
            />
            <span className="px-3 text-[11px] text-ink-faint bg-bg border-l border-border-light">/mo</span>
          </div>
          {previewBE !== null && previewBE !== Infinity && (
            <div className="px-4 py-3 rounded-lg" style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.10)" }}>
              <p className="text-[10px] text-ink-faint">Estimated break-even</p>
              <p className="text-[20px] font-black" style={{ color: "#1B3A2D" }}>{fmt(previewBE)}/mo</p>
            </div>
          )}
          {error && <p className="text-[11px] text-negative">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 py-2.5 text-[12px] font-semibold text-ink-muted border border-border-light rounded-lg hover:bg-bg-section transition">← Back</button>
            <button onClick={save} disabled={saving || !form.revenue}
              className="flex-1 py-2.5 text-[12px] font-bold text-white rounded-lg disabled:opacity-40 transition hover:opacity-90"
              style={{ background: "#1B3A2D" }}>
              {saving ? "Calculating…" : "Calculate my break-even →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Decision modeller ─────────────────────────────────────────────────────────
const PRESET_SCENARIOS = [
  { type: "hire" as const, label: "Hire someone", icon: "👤", prompt: "Annual salary ($)" },
  { type: "lease" as const, label: "Sign a lease", icon: "🏢", prompt: "Monthly rent ($)" },
  { type: "price_increase" as const, label: "Raise prices 10%", icon: "📈", prompt: null },
  { type: "lose_client" as const, label: "Lose top client", icon: "⚠️", prompt: "Monthly revenue lost ($)" },
  { type: "custom" as const, label: "Custom scenario", icon: "⚙️", prompt: "Monthly fixed cost change ($)" },
];

function DecisionModeller({ businessId, breakEvenData }: { businessId: string; breakEvenData: any }) {
  const [active, setActive] = useState<typeof PRESET_SCENARIOS[0] | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [result, setResult] = useState<any>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  const fixedTotal = (breakEvenData.fixed_rent ?? 0) + (breakEvenData.fixed_salaries ?? 0) + (breakEvenData.fixed_software ?? 0) + (breakEvenData.fixed_insurance ?? 0) + (breakEvenData.fixed_loan_payments ?? 0) + (breakEvenData.fixed_other ?? 0);
  const varTotal = (breakEvenData.variable_labour_pct ?? 0) + (breakEvenData.variable_materials_pct ?? 0) + (breakEvenData.variable_processing_pct ?? 0) + (breakEvenData.variable_other_pct ?? 0);
  const rev = breakEvenData.current_revenue ?? 0;

  function buildDecision(scenario: typeof PRESET_SCENARIOS[0], val: number): DecisionInput {
    switch (scenario.type) {
      case "hire":         return { type: "hire", fixedCostChange: Math.round(val / 12), variablePctChange: 0, revenueChange: 0, label: `Hire someone at $${(val ?? 0).toLocaleString()}/year` };
      case "lease":        return { type: "lease", fixedCostChange: val, variablePctChange: 0, revenueChange: 0, label: `Sign a lease at $${(val ?? 0).toLocaleString()}/month` };
      case "price_increase": return { type: "price_increase", fixedCostChange: 0, variablePctChange: 0, revenueChange: Math.round(rev * 0.1), label: "Raise prices 10%" };
      case "lose_client":  return { type: "lose_client", fixedCostChange: 0, variablePctChange: 0, revenueChange: -val, label: `Lose $${(val ?? 0).toLocaleString()}/month client` };
      default:             return { type: "custom", fixedCostChange: val, variablePctChange: 0, revenueChange: 0, label: `Custom: +$${(val ?? 0).toLocaleString()}/month fixed` };
    }
  }

  async function runScenario() {
    if (!active) return;
    const val = active.prompt ? Math.max(0, Number(inputVal) || 0) : 0;
    const decision = buildDecision(active, val);

    // Instant client-side calculation
    const instant = modelDecision(fixedTotal, varTotal, rev, decision);
    const currentBE = calculateBreakEven(fixedTotal, varTotal);
    const currentSM = calculateSafetyMargin(rev, currentBE);

    setResult({
      before: { breakEven: Math.round(currentBE), revenue: rev, safetyMargin: currentSM, safetyLabel: safetyLabel(currentSM.percentage) },
      after: { breakEven: instant.newBreakEven, revenue: instant.newRevenue, safetyMargin: instant.newSafetyMargin, safetyLabel: safetyLabel(instant.newSafetyMargin.percentage), breakEvenDelta: instant.breakEvenDelta },
      narrative: null,
      decision,
    });

    // Fetch Claude narrative asynchronously
    setNarrativeLoading(true);
    fetch("/api/v2/breakeven/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, decision }),
    }).then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.narrative) setResult((prev: any) => ({ ...prev, narrative: data.narrative })); })
      .catch(() => {})
      .finally(() => setNarrativeLoading(false));
  }

  const safetyColors = { comfortable: "#2D7A50", thin: "#C4841D", below: "#B34040" };

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold text-ink">Model a decision</h3>
      <div className="flex flex-wrap gap-2">
        {PRESET_SCENARIOS.map(s => (
          <button key={s.type} onClick={() => { setActive(s); setResult(null); setInputVal(""); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-lg border transition-all ${active?.type === s.type ? "border-brand text-brand bg-brand/5" : "border-border-light text-ink-muted bg-white hover:border-brand/30"}`}
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {active && (
        <div className="bg-white rounded-xl border border-border-light p-4 space-y-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          {active.prompt && (
            <div>
              <label className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">{active.prompt}</label>
              <div className="flex items-center border border-border-light rounded-lg overflow-hidden mt-1">
                <span className="px-3 text-[12px] text-ink-faint bg-bg border-r border-border-light">$</span>
                <input type="number" min="0" value={inputVal} onChange={e => setInputVal(e.target.value)}
                  className="flex-1 px-3 py-2 text-[13px] text-ink bg-transparent focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          )}
          <button onClick={runScenario}
            className="w-full py-2.5 text-[12px] font-bold text-white rounded-lg hover:opacity-90 transition"
            style={{ background: "#1B3A2D" }}>
            Model this scenario →
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-border-light overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="grid grid-cols-2 divide-x divide-border-light">
            {/* Before */}
            <div className="p-4">
              <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider mb-2">Before</p>
              <p className="text-[11px] text-ink-muted mb-1">Break-even</p>
              <p className="text-[18px] font-black text-ink">{fmt(result.before.breakEven)}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <StatusDot status={result.before.safetyLabel} />
                <span className="text-[11px] font-semibold" style={{ color: safetyColors[result.before.safetyLabel as SafetyStatus] }}>
                  {fmt(result.before.safetyMargin.amount)} ({pct(result.before.safetyMargin.percentage)})
                </span>
              </div>
            </div>
            {/* After */}
            <div className="p-4">
              <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider mb-2">After</p>
              <p className="text-[11px] text-ink-muted mb-1">Break-even</p>
              <p className="text-[18px] font-black text-ink">
                {fmt(result.after.breakEven)}
                <span className="text-[11px] font-normal text-ink-faint ml-1">
                  ({result.after.breakEvenDelta >= 0 ? "+" : ""}{fmt(result.after.breakEvenDelta)})
                </span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <StatusDot status={result.after.safetyLabel} />
                <span className="text-[11px] font-semibold" style={{ color: safetyColors[result.after.safetyLabel as SafetyStatus] }}>
                  {fmt(result.after.safetyMargin.amount)} ({result.after.safetyMargin.percentage < 0 ? "" : ""}{pct(result.after.safetyMargin.percentage)})
                  {result.after.safetyLabel === "below" ? " ❌" : result.after.safetyLabel === "comfortable" ? " ✅" : " ⚠️"}
                </span>
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div className="px-4 py-3 border-t border-border-light bg-bg">
            {narrativeLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                <p className="text-[10px] text-ink-faint">Analysing scenario…</p>
              </div>
            ) : result.narrative ? (
              <p className="text-[12px] text-ink leading-relaxed">{result.narrative}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BreakEvenPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [breakEvenData, setBreakEvenData] = useState<any>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [businessId, setBusinessId] = useState<string>("");
  const [editMode, setEditMode] = useState(false);

  const load = useCallback(async () => {
    try {
      const dash = await fetch("/api/v2/dashboard").then(r => r.ok ? r.json() : null).catch(() => null);
      const bid = dash?.data?.businessId;
      if (!bid) return;
      setBusinessId(bid);

      const be = await fetch(`/api/v2/breakeven?businessId=${bid}`).then(r => r.ok ? r.json() : null).catch(() => null);
      if (be?.data) {
        setBreakEvenData(be.data);
        setSetupRequired(false);
      } else {
        setSetupRequired(true);
      }
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  if (loading || authLoading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" /></div>;
  }

  const be = breakEvenData;
  const breakEvenRevenue = be?.break_even_revenue ?? 0;
  const currentRevenue = be?.current_revenue ?? 0;
  const safetyAmount = be?.safety_margin ?? 0;
  const safetyPct = be?.safety_margin_pct ?? 0;
  const status = safetyLabel(safetyPct);
  const varTotal = be ? ((be.variable_labour_pct ?? 0) + (be.variable_materials_pct ?? 0) + (be.variable_processing_pct ?? 0) + (be.variable_other_pct ?? 0)) : 0;
  const fixedTotal = be ? ((be.fixed_rent ?? 0) + (be.fixed_salaries ?? 0) + (be.fixed_software ?? 0) + (be.fixed_insurance ?? 0) + (be.fixed_loan_payments ?? 0) + (be.fixed_other ?? 0)) : 0;

  const safetyColors = { comfortable: "#2D7A50", thin: "#C4841D", below: "#B34040" };
  const safetyBg = { comfortable: "rgba(45,122,80,0.06)", thin: "rgba(196,132,29,0.06)", below: "rgba(179,64,64,0.06)" };

  return (
    <div className="bg-bg min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Header */}
        <div>
          <button onClick={() => router.back()} className="text-[10px] text-ink-faint hover:text-ink mb-2 flex items-center gap-1">
            ← Dashboard
          </button>
          <h1 className="text-[22px] font-black text-ink leading-none">Break-Even Intelligence</h1>
          {be && <p className="text-[11px] text-ink-faint mt-1">Based on your {be.data_source === "diagnostic" ? "diagnostic data" : be.data_source === "manual" ? "manually entered costs" : "accounting sync"}</p>}
        </div>

        {/* Setup required */}
        {(setupRequired || editMode) && (
          <SetupForm businessId={businessId} onSaved={data => { setBreakEvenData(data); setSetupRequired(false); setEditMode(false); }} />
        )}

        {/* Section 1 — Current position */}
        {be && !setupRequired && !editMode && (
          <>
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: safetyColors[status] + "40", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1">Monthly Break-Even</p>
                  <p className="text-[32px] font-black text-ink leading-none">{fmt(breakEvenRevenue)}</p>
                  <p className="text-[11px] text-ink-faint mt-1">Current revenue: {fmt(currentRevenue)}/month</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1">Safety Margin</p>
                  <p className="text-[24px] font-black" style={{ color: safetyColors[status] }}>
                    {safetyAmount >= 0 ? "+" : ""}{fmt(safetyAmount)}
                  </p>
                  <p className="text-[11px] font-semibold" style={{ color: safetyColors[status] }}>
                    {pct(safetyPct)} · {status}
                  </p>
                </div>
              </div>

              {/* Safety bar */}
              <div className="mt-4">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0EFEB" }}>
                  {currentRevenue > 0 && (
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, Math.max(0, (breakEvenRevenue / currentRevenue) * 100))}%`, background: safetyColors[status] }} />
                  )}
                </div>
                <div className="flex justify-between text-[8px] text-ink-faint mt-1">
                  <span>$0</span>
                  <span>Break-even {fmt(breakEvenRevenue)}</span>
                  <span>Revenue {fmt(currentRevenue)}</span>
                </div>
              </div>

              {/* Risk note */}
              {safetyPct < 20 && safetyPct >= 0 && (
                <div className="mt-3 px-3 py-2 rounded-lg text-[11px]" style={{ background: safetyBg[status], color: safetyColors[status] }}>
                  ⚠️ A {pct(safetyPct)} revenue drop would put you at break-even. That&apos;s not much cushion.
                </div>
              )}
              {safetyPct < 0 && (
                <div className="mt-3 px-3 py-2 rounded-lg text-[11px]" style={{ background: safetyBg.below, color: safetyColors.below }}>
                  ❌ You&apos;re currently {fmt(Math.abs(safetyAmount))} below break-even. Immediate action required.
                </div>
              )}
            </div>

            {/* Cost breakdown */}
            <div className="border-t border-border-light px-5 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Cost Structure</p>
                <button onClick={() => setEditMode(true)} className="text-[10px] font-semibold text-brand hover:underline">Edit costs →</button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-ink-muted">Fixed costs</span><span className="font-bold text-ink">{fmt(fixedTotal)}/mo</span></div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F0EFEB" }}>
                    <div className="h-full rounded-full" style={{ width: currentRevenue > 0 ? `${Math.min(100, (fixedTotal / currentRevenue) * 100)}%` : "0%", background: "#1B3A2D" }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-ink-muted">Variable costs</span><span className="font-bold text-ink">{Math.round(varTotal)}% of revenue</span></div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F0EFEB" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, varTotal)}%`, background: "#C4841D" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Decision modeller */}
          <div className="bg-white rounded-xl border border-border-light p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <DecisionModeller businessId={businessId} breakEvenData={be} />
          </div>

          {/* Section 3 — Seasonal placeholder */}
          <div className="bg-white rounded-xl border border-border-light p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <h3 className="text-[13px] font-bold text-ink mb-1">Seasonal Break-Even Calendar</h3>
            <p className="text-[11px] text-ink-faint">Complete 3+ months of diagnostics to see which months you&apos;re likely to fall below break-even and how much to reserve.</p>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mt-4">
              {MONTHS_SHORT.map(m => (
                <div key={m} className="text-center">
                  <div className="h-8 rounded-md mb-1" style={{ background: "#F0EFEB" }} />
                  <p className="text-[8px] text-ink-faint">{m}</p>
                </div>
              ))}
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
