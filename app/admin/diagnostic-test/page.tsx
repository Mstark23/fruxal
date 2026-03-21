// =============================================================================
// /admin/diagnostic-test — Test the paid diagnostic engine with any profile
// Simulates a real paid user without needing Stripe or onboarding
// =============================================================================
"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

const PROVINCES = ["QC","ON","BC","AB","MB","NS","NB","SK","NL","PE"];
const STRUCTURES = ["sole_proprietor","corporation","partnership"];
const INDUSTRIES = [
  "construction","retail","restaurant","healthcare","legal_services",
  "accounting_firms","marketing_agencies","IT_services","real_estate",
  "manufacturing","logistics_trucking","dental_clinics","staffing_agencies",
  "e_commerce","hospitality","HVAC_trades","property_management",
];

const inputCls = "w-full px-3 py-2.5 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]";
const CAT_COLORS: Record<string,string> = {
  tax: "#1B3A2D", payroll: "#C4841D", compliance: "#B34040",
  operations: "#2563EB", insurance: "#7C3AED", contract: "#0891B2",
  subscription: "#6B7280", growth: "#2D7A50",
};

export default function DiagnosticTestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"findings"|"plan"|"risk"|"benchmarks">("findings");

  // Profile fields
  const [businessName, setBusinessName] = useState("Acme Construction Inc.");
  const [industry, setIndustry] = useState("construction");
  const [province, setProvince] = useState("QC");
  const [structure, setStructure] = useState("corporation");
  const [monthlyRevenue, setMonthlyRevenue] = useState("25000");
  const [employees, setEmployees] = useState("8");
  const [hasAccountant, setHasAccountant] = useState(false);
  const [hasPayroll, setHasPayroll] = useState(true);
  const [handlesData, setHandlesData] = useState(false);
  const [doesConstruction, setDoesConstruction] = useState(true);
  const [doesRD, setDoesRD] = useState(false);
  const [handlesFood, setHandlesFood] = useState(false);
  const [sellsAlcohol, setSellsAlcohol] = useState(false);
  const [language, setLanguage] = useState<"en"|"fr">("en");

  const runTest = useCallback(async () => {
    setError("");
    setRunning(true);
    setResult(null);
    try {
      setIsLoading(true);
    const res = await fetch("/api/admin/diagnostic-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName, industry, province, structure,
          monthlyRevenue: Number(monthlyRevenue),
          employees: Number(employees),
          hasAccountant, hasPayroll, handlesData,
          doesConstruction, doesRD, handlesFood, sellsAlcohol,
          language,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Test failed");
      setResult(json.report);
      setActiveTab("findings");
    setIsLoading(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }, [businessName, industry, province, structure, monthlyRevenue, employees, hasAccountant, hasPayroll, handlesData, doesConstruction, doesRD, handlesFood, sellsAlcohol, language]);

  const fmt = (n: number) => n >= 1000 ? "$" + Math.round(n / 1000) + "K" : "$" + n;
  const sevColor = (s: string) => s === "critical" ? "#B34040" : s === "high" ? "#C4841D" : s === "medium" ? "#2563EB" : "#6B7280";

  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">ADMIN</p>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">Diagnostic Engine Tester</h1>
          </div>
          <span className="text-[10px] px-2 py-1 bg-[#1B3A2D] text-white rounded font-bold">ADMIN ONLY</span>
        </div>
        <p className="text-sm text-[#8E8C85] mb-6">Simulate any business profile and see exactly what a paid user gets. No Stripe needed.</p>
        <AdminNav />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

          {/* LEFT — Profile form */}
          <div className="space-y-4">
            <div className="bg-white border border-[#EEECE8] rounded-xl p-5">
              <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-4">Business Profile</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1">Business Name</label>
                  <input className={inputCls} value={businessName} onChange={e => setBusinessName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1">Industry</label>
                  <select className={inputCls} value={industry} onChange={e => setIndustry(e.target.value)}>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i.replace(/_/g," ")}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1">Province</label>
                    <select className={inputCls} value={province} onChange={e => setProvince(e.target.value)}>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1">Structure</label>
                    <select className={inputCls} value={structure} onChange={e => setStructure(e.target.value)}>
                      {STRUCTURES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1">Monthly Revenue ($)</label>
                    <input className={inputCls} type="number" value={monthlyRevenue} onChange={e => setMonthlyRevenue(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1">Employees</label>
                    <input className={inputCls} type="number" value={employees} onChange={e => setEmployees(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1">Report Language</label>
                  <select className={inputCls} value={language} onChange={e => setLanguage(e.target.value as "en"|"fr")}>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#EEECE8] rounded-xl p-5">
              <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-3">Business Flags</p>
              <div className="space-y-2">
                {[
                  ["Has accountant/bookkeeper", hasAccountant, setHasAccountant],
                  ["Has payroll", hasPayroll, setHasPayroll],
                  ["Handles customer data", handlesData, setHandlesData],
                  ["Does construction/trades", doesConstruction, setDoesConstruction],
                  ["Does R&D", doesRD, setDoesRD],
                  ["Handles food", handlesFood, setHandlesFood],
                  ["Sells alcohol", sellsAlcohol, setSellsAlcohol],
                ].map(([label, val, setter]: any) => (
                  <div key={label as string} className="flex items-center gap-2">
                    <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)} className="w-4 h-4 accent-[#1B3A2D]" id={label as string} />
                    <label htmlFor={label as string} className="text-sm text-[#1A1A18]">{label as string}</label>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-[#B34040] font-medium p-3 bg-red-50 rounded-lg">{error}</p>}

            <button
              onClick={runTest}
              disabled={running}
              className="w-full py-3.5 bg-[#1B3A2D] text-white text-sm font-bold rounded-xl hover:bg-[#2A5A44] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {running ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running AI Diagnostic…</>
              ) : "Run Test Diagnostic →"}
            </button>
          </div>

          {/* RIGHT — Results */}
          <div>
            {!result && !running && (
              <div className="bg-white border border-[#EEECE8] rounded-xl p-10 text-center">
                <p className="text-3xl mb-3">🔍</p>
                <p className="font-semibold text-[#1A1A18] mb-1">Configure a business profile</p>
                <p className="text-sm text-[#8E8C85]">Hit Run to see exactly what a paid user will receive — full findings, action plan, risk matrix, and benchmarks.</p>
              </div>
            )}

            {running && (
              <div className="bg-white border border-[#EEECE8] rounded-xl p-10 text-center">
                <div className="w-8 h-8 border-2 border-[#E8E6E1] border-t-[#1B3A2D] rounded-full animate-spin mx-auto mb-4" />
                <p className="font-semibold text-[#1A1A18]">Claude is analysing {businessName}…</p>
                <p className="text-sm text-[#8E8C85] mt-1">Checking 7 leak categories, obligations, programs, benchmarks</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Score cards */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    ["Overall", result.overall_score],
                    ["Compliance", result.compliance_score],
                    ["Efficiency", result.efficiency_score],
                    ["Optimization", result.optimization_score],
                    ["Growth", result.growth_score],
                  ].map(([l, v]: any) => (
                    <div key={l} className="bg-white border border-[#EEECE8] rounded-xl p-3 text-center">
                      <p className="font-serif text-2xl font-bold" style={{ color: v >= 70 ? "#2D7A50" : v >= 50 ? "#C4841D" : "#B34040" }}>{v}</p>
                      <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mt-1">{l}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Total Leaks", fmt(result.total_annual_leaks ?? 0)],
                    ["Potential Savings", fmt(result.total_potential_savings ?? 0)],
                    ["Penalty Exposure", fmt(result.total_penalty_exposure ?? 0)],
                  ].map(([l, v]: any) => (
                    <div key={l} className="bg-white border border-[#EEECE8] rounded-xl p-4">
                      <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">{l}</p>
                      <p className="font-serif text-xl font-bold text-[#1A1A18]">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Executive summary */}
                {result.executive_summary && (
                  <div className="bg-[#1B3A2D] rounded-xl p-5">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Executive Summary</p>
                    <p className="text-sm text-white leading-relaxed">{result.executive_summary}</p>
                  </div>
                )}

                {/* Tabs */}
                <div className="bg-white border border-[#EEECE8] rounded-xl overflow-hidden">
                  <div className="flex border-b border-[#EEECE8]">
                    {(["findings","plan","risk","benchmarks"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition ${activeTab === tab ? "bg-[#F0EFEB] text-[#1B3A2D] border-b-2 border-[#1B3A2D]" : "text-[#8E8C85] hover:bg-[#FAFAF8]"}`}>
                        {tab === "findings" ? `Findings (${result.findings?.length ?? 0})` : tab === "plan" ? "Action Plan" : tab === "risk" ? "Risk Matrix" : "Benchmarks"}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                    {activeTab === "findings" && (result.findings||[]).map((f: any, i: number) => (
                      <div key={i} className="border border-[#EEECE8] rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold text-white" style={{ background: sevColor(f.severity) }}>{f.severity?.toUpperCase()}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#F0EFEB] text-[#56554F]">{f.category}</span>
                            </div>
                            <p className="text-sm font-bold text-[#1A1A18]">{f.title}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-serif text-base font-bold text-[#1A1A18]">{fmt(f.impact_min)} – {fmt(f.impact_max)}</p>
                            <p className="text-[9px] text-[#B5B3AD]">/year</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#56554F] leading-relaxed mb-2">{f.description}</p>
                        <div className="bg-[#F0EFEB] rounded-lg p-3">
                          <p className="text-[9px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1">Recommendation</p>
                          <p className="text-xs text-[#1A1A18]">{f.recommendation}</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[9px] px-2 py-0.5 bg-[#F0EFEB] rounded text-[#56554F] font-medium">{f.timeline}</span>
                          <span className="text-[9px] px-2 py-0.5 bg-[#F0EFEB] rounded text-[#56554F] font-medium">{f.difficulty}</span>
                          <span className="text-[9px] px-2 py-0.5 bg-[#F0EFEB] rounded text-[#56554F] font-medium">{f.solution_type}</span>
                        </div>
                      </div>
                    ))}

                    {activeTab === "plan" && (result.action_plan||[]).map((a: any, i: number) => (
                      <div key={i} className="border border-[#EEECE8] rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#1B3A2D] text-white text-[11px] font-bold flex items-center justify-center shrink-0">{a.priority}</span>
                            <div>
                              <p className="text-sm font-bold text-[#1A1A18]">{a.title}</p>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-[9px] px-2 py-0.5 bg-[#F0EFEB] rounded text-[#56554F]">{a.timeline}</span>
                                <span className="text-[9px] px-2 py-0.5 bg-[#F0EFEB] rounded text-[#56554F]">{a.category}</span>
                              </div>
                            </div>
                          </div>
                          {a.estimated_savings > 0 && <p className="font-serif text-base font-bold text-[#2D7A50] shrink-0">{fmt(a.estimated_savings)}</p>}
                        </div>
                        <p className="text-xs text-[#56554F] leading-relaxed">{a.description}</p>
                      </div>
                    ))}

                    {activeTab === "risk" && (result.risk_matrix||[]).map((r: any, i: number) => (
                      <div key={i} className="border border-[#EEECE8] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-[#1A1A18]">{r.area}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded font-bold text-white" style={{ background: sevColor(r.risk_level) }}>{r.risk_level?.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-[#56554F] mb-2">{r.current_status}</p>
                        <p className="text-xs text-[#1B3A2D] font-medium">{r.recommendation}</p>
                      </div>
                    ))}

                    {activeTab === "benchmarks" && (result.benchmark_comparisons||[]).map((b: any, i: number) => (
                      <div key={i} className="border border-[#EEECE8] rounded-xl p-4">
                        <p className="text-sm font-bold text-[#1A1A18] mb-2">{b.metric}</p>
                        <div className="grid grid-cols-3 gap-3 mb-2">
                          {[["Your Est.", b.your_value],["Industry Avg", b.industry_avg],["Top 25%", b.top_quartile]].map(([l,v]: any) => (
                            <div key={l} className="bg-[#F0EFEB] rounded-lg p-2 text-center">
                              <p className="text-[9px] text-[#8E8C85] font-bold uppercase">{l}</p>
                              <p className="text-sm font-bold text-[#1A1A18] mt-0.5">{v}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-[#56554F]">{b.gap}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
