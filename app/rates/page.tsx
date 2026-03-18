"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";

// ─── Tier badge colors ──────────────────────────────────────────────────────
const TIER_BADGE: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Verified Rate", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  2: { label: "Market Range", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  3: { label: "Get Quotes", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
};

const STATUS_ICON: Record<string, string> = {
  good: "✅", okay: "🟡", overpaying: "🔴", high: "🔴", way_above: "🚨",
  review: "🟡", needs_kwh: "📝", needs_more_info: "📝",
  no_province: "⚙️", no_data: "📍", check_required: "🔍",
};

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  good: { text: "Good Rate", color: "bg-green-100 text-green-700" },
  okay: { text: "Could Improve", color: "bg-yellow-100 text-yellow-700" },
  overpaying: { text: "Overpaying", color: "bg-red-100 text-red-700" },
  high: { text: "Above Average", color: "bg-red-100 text-red-700" },
  check_required: { text: "Needs Quotes", color: "bg-amber-100 text-amber-700" },
  needs_kwh: { text: "Enter kWh", color: "bg-blue-100 text-blue-700" },
  no_province: { text: "Set Province", color: "bg-gray-100 text-gray-600" },
  no_data: { text: "No Data", color: "bg-gray-100 text-gray-600" },
  review: { text: "Worth Reviewing", color: "bg-yellow-100 text-yellow-700" },
};

export default function RatesPage() {
  const [region, setRegion] = useState("CA");
  const [province, setProvince] = useState("");
  const [industry, setIndustry] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");

  // Tier 1 inputs
  const [elecBill, setElecBill] = useState("");
  const [elecKwh, setElecKwh] = useState("");
  const [procRate, setProcRate] = useState("");
  const [procMonthly, setProcMonthly] = useState("");
  const [procVolume, setProcVolume] = useState("");
  const [payrollCost, setPayrollCost] = useState("");

  // Tier 2 inputs
  const [rentMonthly, setRentMonthly] = useState("");
  const [rentSqft, setRentSqft] = useState("");
  const [rentCity, setRentCity] = useState("");
  const [bookCost, setBookCost] = useState("");
  const [swCost, setSwCost] = useState("");

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Pre-fill from user profile
  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d.business?.region) setRegion(d.business.region);
      if (d.business?.province) setProvince(d.business.province);
      if (d.business?.industry) setIndustry(d.business.industry);
    }).catch(() => {});
  }, []);

  const cp = region === "CA" ? "CA$" : region === "UK" ? "£" : region === "AU" ? "A$" : "$";
  const fmt = (n: number) => n >= 1000 ? `${cp}${(n/1000).toFixed(1)}K` : `${cp}${n}`;

  const filledCount = [elecBill || elecKwh, procRate || procMonthly, payrollCost, rentMonthly, bookCost, swCost].filter(Boolean).length;

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rate-check", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region, province, industry, monthlyRevenue: parseFloat(monthlyRevenue) || 20000, employeeCount: parseInt(employeeCount) || 5,
          electricity_bill: parseFloat(elecBill) || undefined,
          electricity_kwh: parseFloat(elecKwh) || undefined,
          processing_rate: parseFloat(procRate) || undefined,
          processing_monthly: parseFloat(procMonthly) || undefined,
          processing_volume: parseFloat(procVolume) || undefined,
          payroll_cost: parseFloat(payrollCost) || undefined,
          rent_monthly: parseFloat(rentMonthly) || undefined,
          rent_sqft: parseFloat(rentSqft) || undefined,
          rent_city: rentCity || undefined,
          bookkeeping_cost: parseFloat(bookCost) || undefined,
          software_cost: parseFloat(swCost) || undefined,
        }),
      });
      const data = await res.json();
      setResults(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <span className="text-3xl">💸</span>
          <div>
            <h1 className="text-xl font-black text-gray-900">Rate Checker</h1>
            <p className="text-sm text-gray-500">
              Enter what you actually pay. We&apos;ll compare to{" "}
              <span className="font-semibold text-green-700">published rates</span> where they exist
              and tell you honestly where we can&apos;t.
            </p>
          </div>
        </div>

        {/* Data Quality Legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-[10px] px-2 py-1 rounded-full border bg-green-50 border-green-200 text-green-700 font-bold">🟢 Verified — exact published rates</span>
          <span className="text-[10px] px-2 py-1 rounded-full border bg-blue-50 border-blue-200 text-blue-700 font-bold">🔵 Market Range — sourced averages</span>
          <span className="text-[10px] px-2 py-1 rounded-full border bg-amber-50 border-amber-200 text-amber-700 font-bold">🟡 Get Quotes — we can&apos;t verify, you need to check</span>
        </div>

        {!results ? (
          <div className="space-y-6">
            {/* Business Context */}
            <div className="bg-gray-50 rounded-xl p-4 border">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Business</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Province</label>
                  <select value={province} onChange={e => setProvince(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select province</option>
                    {[["ON","Ontario"],["QC","Quebec"],["BC","British Columbia"],["AB","Alberta"],["SK","Saskatchewan"],["MB","Manitoba"],["NB","New Brunswick"],["NS","Nova Scotia"],["PE","PEI"],["NL","Newfoundland"],["NT","NWT"],["YT","Yukon"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Employees</label>
                  <input type="number" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} placeholder="5"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* TIER 1: Exact Data */}
            <div className="border-2 border-green-200 rounded-xl overflow-hidden">
              <div className="bg-green-50 px-4 py-2 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">TIER 1</span>
                <span className="text-xs font-bold text-green-800">We have exact published rates for these</span>
              </div>
              <div className="p-4 space-y-4">
                {/* Electricity */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-0.5">⚡ Electricity</label>
                  <p className="text-[11px] text-gray-400 mb-2">We know the exact ¢/kWh for your province</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={elecBill} onChange={e => setElecBill(e.target.value)} placeholder="Monthly bill $"
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                    <input type="number" value={elecKwh} onChange={e => setElecKwh(e.target.value)} placeholder="kWh usage (from bill)"
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                {/* Payment Processing */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-0.5">💳 Payment Processing</label>
                  <p className="text-[11px] text-gray-400 mb-2">Helcim 1.8%, Stripe 2.9%, Square 2.65% — all published</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" step="0.1" value={procRate} onChange={e => setProcRate(e.target.value)} placeholder="Effective %"
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                    <input type="number" value={procMonthly} onChange={e => setProcMonthly(e.target.value)} placeholder="Fees $/mo"
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                    <input type="number" value={procVolume} onChange={e => setProcVolume(e.target.value)} placeholder="Volume $/mo"
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                {/* Payroll */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-0.5">👥 Payroll Service</label>
                  <p className="text-[11px] text-gray-400 mb-2">Wave $20+$6/emp, Humi $8/emp, Knit $49+$5/emp — published</p>
                  <input type="number" value={payrollCost} onChange={e => setPayrollCost(e.target.value)} placeholder="What you pay your payroll provider $/mo"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
            </div>

            {/* TIER 2: Market Ranges */}
            <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
              <div className="bg-blue-50 px-4 py-2 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">TIER 2</span>
                <span className="text-xs font-bold text-blue-800">Market ranges — sourced data, not exact</span>
              </div>
              <div className="p-4 space-y-4">
                {/* Rent */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-0.5">🏢 Rent / Lease</label>
                  <p className="text-[11px] text-gray-400 mb-2">We have $/sq ft data by city from CBRE & Colliers reports</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" value={rentMonthly} onChange={e => setRentMonthly(e.target.value)} placeholder="Rent $/mo"
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                    <input type="number" value={rentSqft} onChange={e => setRentSqft(e.target.value)} placeholder="Square feet"
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                    <input type="text" value={rentCity} onChange={e => setRentCity(e.target.value)} placeholder="City (e.g. Laval)"
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                {/* Bookkeeping */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-0.5">📒 Bookkeeping / Accountant</label>
                  <p className="text-[11px] text-gray-400 mb-2">Published SaaS pricing + CPA Canada fee survey averages</p>
                  <input type="number" value={bookCost} onChange={e => setBookCost(e.target.value)} placeholder="Monthly bookkeeping/accountant $/mo"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                {/* Software */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-0.5">💻 Software & Subscriptions</label>
                  <p className="text-[11px] text-gray-400 mb-2">Industry avg: $125/employee/mo (SaaS Trends Report 2024)</p>
                  <input type="number" value={swCost} onChange={e => setSwCost(e.target.value)} placeholder="All software combined $/mo"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button onClick={submit} disabled={loading || filledCount === 0}
              className="w-full py-4 bg-gray-900 text-white font-black text-base rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition shadow-lg">
              {loading ? "Comparing..." : `Check ${filledCount} Rate${filledCount !== 1 ? "s" : ""} →`}
            </button>
            <p className="text-[10px] text-gray-400 text-center">Fill in any categories you want checked. Skip what you don&apos;t know.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gray-900 text-white rounded-xl p-5">
              <h2 className="text-lg font-black mb-3">Your Results</h2>
              <div className="space-y-2">
                {results.summary.verified.high > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-bold">VERIFIED</span>
                    <span className="text-sm font-bold text-green-300">
                      {fmt(results.summary.verified.low)} – {fmt(results.summary.verified.high)}/yr savings
                    </span>
                    <span className="text-xs text-white/40">based on published rates</span>
                  </div>
                )}
                {results.summary.estimated.high > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">ESTIMATED</span>
                    <span className="text-sm font-bold text-blue-300">
                      {fmt(results.summary.estimated.low)} – {fmt(results.summary.estimated.high)}/yr possible
                    </span>
                    <span className="text-xs text-white/40">based on market averages</span>
                  </div>
                )}
                {results.summary.needsQuotes > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">UNVERIFIED</span>
                    <span className="text-xs text-white/50">{results.summary.needsQuotes} categories need real quotes to check</span>
                  </div>
                )}
              </div>
            </div>

            {/* Results Cards */}
            {results.results.map((r: any) => {
              const tier = TIER_BADGE[r.tier];
              const status = STATUS_LABEL[r.status] || STATUS_LABEL.check_required;
              const isOpen = expanded === r.key;

              return (
                <div key={r.key} className={`border rounded-xl overflow-hidden transition-all ${
                  r.status === "overpaying" || r.status === "high" ? "border-red-200 bg-red-50/30" :
                  r.status === "good" ? "border-green-200 bg-green-50/30" :
                  r.status === "check_required" ? "border-amber-200 bg-amber-50/30" :
                  "border-gray-200 bg-white"
                }`}>
                  {/* Card Header */}
                  <button onClick={() => setExpanded(isOpen ? null : r.key)} className="w-full px-4 py-3 flex items-center gap-3 text-left">
                    <span className="text-xl">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-gray-900">{r.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${tier.bg} ${tier.color}`}>{tier.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${status.color}`}>
                          {STATUS_ICON[r.status]} {status.text}
                        </span>
                      </div>
                      {r.yourValue && <div className="text-xs text-gray-500">You pay: <span className="font-semibold text-gray-700">{r.yourValue}</span>
                        {r.benchmark && <span className="text-gray-400"> · Benchmark: {r.benchmark}</span>}</div>}
                    </div>
                    {(r.savingsHigh && r.savingsHigh > 0) ? (
                      <span className="text-sm font-black text-red-600 shrink-0">Save {fmt(r.savingsHigh)}/yr</span>
                    ) : r.tier === 3 ? (
                      <span className="text-xs text-amber-600 font-bold shrink-0">Check →</span>
                    ) : null}
                    <span className="text-gray-300 shrink-0">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {/* Expanded Content */}
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      {/* Source */}
                      {r.source && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          📎 Source: {r.source}
                        </div>
                      )}

                      {/* Detail */}
                      {r.detail && (
                        <div className="bg-white rounded-lg p-3 border text-sm text-gray-700">{r.detail}</div>
                      )}

                      {/* Note */}
                      {r.note && (
                        <div className="text-xs text-gray-500 italic">{r.note}</div>
                      )}

                      {/* Rent comparison bars */}
                      {r.comparison && (
                        <div className="bg-white rounded-xl p-4 border space-y-2">
                          <div className="text-xs font-bold text-gray-600 mb-2">$/sq ft/year — {r.comparison.type} in {r.comparison.city}</div>
                          {[
                            { label: "You", val: r.comparison.yours, color: r.status === "good" ? "bg-green-500" : r.status === "okay" ? "bg-yellow-500" : "bg-red-500" },
                            { label: "Low", val: r.comparison.low, color: "bg-green-300" },
                            { label: "Avg", val: r.comparison.mid, color: "bg-blue-300" },
                            { label: "High", val: r.comparison.high, color: "bg-gray-400" },
                          ].map(b => (
                            <div key={b.label} className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-500 w-10 shrink-0">{b.label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                                <div className={`h-full rounded-full flex items-center justify-end px-2 ${b.color}`}
                                  style={{ width: Math.min(100, (b.val / Math.max(r.comparison.high * 1.3, r.comparison.yours * 1.1)) * 100) + "%" }}>
                                  <span className="text-[10px] font-bold text-white">${b.val}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Alternatives (Tier 1 & 2) */}
                      {r.alternatives && r.alternatives.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Compare Options (published pricing)</h4>
                          <div className="space-y-1.5">
                            {r.alternatives.map((a: any, i: number) => (
                              <div key={i} className={`bg-white rounded-lg p-3 flex items-center gap-3 border ${a.highlight ? "border-green-300 bg-green-50/50" : ""}`}>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                                  a.type === "FREE" ? "bg-green-100 text-green-700" : a.type === "AFFILIATE" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                                }`}>{a.type === "FREE" ? "FREE" : a.type === "AFFILIATE" ? "PAID" : "INFO"}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-900">{a.name}</div>
                                  <div className="text-[11px] text-gray-500">{a.cost || a.rate || a.savings}</div>
                                  {a.note && <div className="text-[10px] text-gray-400 mt-0.5">{a.note}</div>}
                                  {a.src && <div className="text-[9px] text-gray-300">Source: {a.src}</div>}
                                </div>
                                {a.highlight && a.savings && <span className="text-[10px] font-bold text-green-700 shrink-0">{a.savings}</span>}
                                {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer"
                                  className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 shrink-0">View →</a>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Connectors (Tier 3) */}
                      {r.connectors && (
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Where to get real quotes</h4>
                          <div className="space-y-1.5">
                            {r.connectors.map((c: any, i: number) => (
                              <div key={i} className="bg-white rounded-lg p-3 flex items-center gap-3 border">
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                                  <div className="text-[11px] text-gray-500">{c.note}</div>
                                </div>
                                {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer"
                                  className="text-[11px] px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 shrink-0">Get Quote →</a>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Tips (Tier 3) */}
                      {r.quickTips && (
                        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                          <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-1.5">Quick Wins (free)</h4>
                          <ul className="space-y-1">
                            {r.quickTips.map((t: string, i: number) => (
                              <li key={i} className="text-xs text-blue-800 flex items-start gap-1.5">
                                <span className="text-blue-400 mt-0.5">→</span> {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tips */}
                      {r.tips && (
                        <div className="bg-green-50/50 rounded-lg p-3 border border-green-100">
                          <h4 className="text-[10px] font-bold text-green-600 uppercase mb-1.5">Tips</h4>
                          <ul className="space-y-1">
                            {r.tips.map((t: string, i: number) => (
                              <li key={i} className="text-xs text-green-800 flex items-start gap-1.5">
                                <span className="text-green-400 mt-0.5">→</span> {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {r.tip && !r.tips && (
                        <div className="bg-green-50/50 rounded-lg p-3 border border-green-100">
                          <p className="text-xs text-green-800">{r.tip}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {r.actions && (
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Action Items</h4>
                          <ul className="space-y-1">
                            {r.actions.map((a: string, i: number) => (
                              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                <span className="text-gray-400 font-bold">{i+1}.</span> {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Search Links (rent) */}
                      {r.searchLinks && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          <span className="text-[10px] text-gray-400 font-bold">Search real listings:</span>
                          {r.searchLinks.map((l: any, i: number) => (
                            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                              className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100">{l.name} →</a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Edit / Print */}
            <div className="flex gap-3 pt-4">
              <button onClick={() => setResults(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition text-sm">
                ← Edit Numbers
              </button>
              <button onClick={() => window.print()} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition text-sm">
                🖨️ Print
              </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center pt-2">
              Tier 1 savings are based on exact published rates. Tier 2 savings are estimates based on market averages. Tier 3 categories require real quotes to verify.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
