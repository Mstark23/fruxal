"use client";
// =============================================================================
// app/admin/enterprise/page.tsx — ENTERPRISE (PUBLIC COMPANY) DIAGNOSTIC
// Admin-only page to run a public company diagnostic manually,
// review the report, and trigger the CFO outreach email.
// =============================================================================

import { useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

const PROVINCES = ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"];
const TICKERS = [
  "RY.TO","TD.TO","BNS.TO","BMO.TO","CM.TO","MFC.TO","SLF.TO","GWO.TO","FFH.TO","BAM.TO",
  "SHOP.TO","CSU.TO","DSG.TO","ENGH.TO","CNR.TO","WCN.TO","TIH.TO","MG.TO","LNR.TO","L.TO",
  "ABX.TO","AEM.TO","K.TO","H.TO","NPI.TO","ATD.TO","MRU.TO","SAP.TO","DOL.TO","GIL.TO",
  "MTY.TO","DOO.TO","WSP.TO","SNC.TO","CAE.TO","IFC.TO","POW.TO","LB.TO","BCE.TO","BLX.TO",
  "INE.TO","CAS.TO","T.TO","TIXT.TO","WELL.TO","FM.TO","CS.TO","LUG.TO","IVN.TO","MX.TO",
  "WFG.TO","IFP.TO","CFP.TO","FTT.TO","PBH.TO","SU.TO","ENB.TO","TRP.TO","CNQ.TO","CVE.TO",
  "IMO.TO","PPL.TO","TVE.TO","CP.TO","STN.TO","ALA.TO","CU.TO","TA.TO","CPX.TO","CWB.TO",
  "NTR.TO","CCO.TO","IGM.TO","BYD.TO","NWC.TO","NFI.TO","EMA.TO","FTS.TO",
];

const SEV: Record<string,{bg:string;text:string}> = {
  critical: { bg:"bg-red-500/15",   text:"text-red-400"    },
  high:     { bg:"bg-orange-500/15",text:"text-orange-400" },
  medium:   { bg:"bg-yellow-500/15",text:"text-yellow-400" },
  low:      { bg:"bg-white/5",      text:"text-white/30"   },
};

function fmt(n:number){ return "$"+(n ?? 0).toLocaleString("en-CA"); }
function pct(n:number|null){ return n!==null ? n.toFixed(1)+"%" : "N/A"; }

export default function AdminEnterprisePage() {
  // ── Run diagnostic state ─────────────────────────────────────────────────
  const [ticker,    setTicker]    = useState("");
  const [customTicker, setCustomTicker] = useState("");
  const [language,  setLanguage]  = useState("en");
  const [running,   setRunning]   = useState(false);
  const [error,     setError]     = useState("");

  // ── Report state ──────────────────────────────────────────────────────────
  const [reportId,  setReportId]  = useState("");
  const [report,    setReport]    = useState<any>(null);

  // ── Outreach state ────────────────────────────────────────────────────────
  const [outreachOpen,    setOutreachOpen]    = useState(false);
  const [senderName,      setSenderName]      = useState("");
  const [senderTitle,     setSenderTitle]     = useState("");
  const [senderCompany,   setSenderCompany]   = useState("Fruxal");
  const [tone,            setTone]            = useState("peer");
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachEmail,   setOutreachEmail]   = useState<any>(null);
  const [outreachError,   setOutreachError]   = useState("");
  const [copied,          setCopied]          = useState(false);

  const effectiveTicker = customTicker.trim().toUpperCase() || ticker;

  async function runDiagnostic() {
    if (!effectiveTicker) { setError("Select or enter a ticker."); return; }
    setRunning(true); setError(""); setReport(null); setReportId(""); setOutreachEmail(null);
    try {
      const res = await fetch("/api/v2/diagnostic/public-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: effectiveTicker, language }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Unknown error");
      setReportId(data.reportId);
      setReport(data.result);
    } catch(e:any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  async function generateOutreach() {
    if (!reportId) return;
    setOutreachLoading(true); setOutreachError(""); setOutreachEmail(null);
    try {
      const res = await fetch("/api/v2/diagnostic/public-company/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, tone, senderName, senderTitle, senderCompany }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Unknown error");
      setOutreachEmail(data.email);
    } catch(e:any) {
      setOutreachError(e.message);
    } finally {
      setOutreachLoading(false);
    }
  }

  function copyEmail() {
    if (!outreachEmail) return;
    const text = `Subject: ${outreachEmail.subject}\n\n${outreachEmail.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const findings: any[] = report?.findings || [];
  const scores  = report?.scores  || {};
  const totals  = report?.totals  || {};

  return (
    <div className="min-h-screen bg-[#F7F5F2] font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <AdminNav />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#1A1A18]">Enterprise Diagnostic</h1>
          <p className="text-sm text-[#8E8C85] mt-0.5">Run a public company diagnostic manually using TSX financials.</p>
        </div>

        {/* Run Panel */}
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Ticker select */}
            <div>
              <label className="text-xs font-medium text-[#56554F] mb-1 block">TSX Ticker</label>
              <select
                value={ticker}
                onChange={e => { setTicker(e.target.value); setCustomTicker(""); }}
                className="w-full px-3 py-2.5 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              >
                <option value="">— Select ticker —</option>
                {TICKERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Custom ticker */}
            <div>
              <label className="text-xs font-medium text-[#56554F] mb-1 block">Or Enter Custom Ticker</label>
              <input
                value={customTicker}
                onChange={e => { setCustomTicker(e.target.value); setTicker(""); }}
                placeholder="e.g. NVDA, MSFT"
                className="w-full px-3 py-2.5 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
            {/* Language */}
            <div>
              <label className="text-xs font-medium text-[#56554F] mb-1 block">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <button
            onClick={runDiagnostic}
            disabled={running || !effectiveTicker}
            className="w-full py-2.5 bg-[#1B3A2D] text-white text-sm font-medium rounded-lg hover:bg-[#2D5A42] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {running ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Running diagnostic — this takes 30–60s…
              </span>
            ) : `Run Diagnostic${effectiveTicker ? ` — ${effectiveTicker}` : ""}`}
          </button>
        </div>

        {/* Report */}
        {report && (
          <div className="space-y-5">

            {/* Summary bar */}
            <div className="bg-[#1B3A2D] text-white rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-lg font-semibold">{report.company_name} <span className="text-white/40 text-sm font-normal">({report.ticker})</span></div>
                  <div className="text-white/50 text-xs mt-0.5">{report.fiscal_year} fiscal year · {findings.length} findings</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">{scores.overall ?? "—"}</div>
                  <div className="text-white/40 text-xs">Health Score</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {[
                  ["Annual Leaks",       totals.annual_leaks],
                  ["Potential Savings",  totals.potential_savings],
                  ["Programs Value",     totals.programs_value],
                  ["Penalty Exposure",   totals.penalty_exposure],
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/40 mb-1">{label}</div>
                    <div className="text-sm font-semibold text-emerald-300">{fmt(val as number)}</div>
                  </div>
                ))}
              </div>
              {report.executive_summary && (
                <p className="text-white/60 text-xs leading-relaxed border-t border-white/10 pt-3">{report.executive_summary}</p>
              )}
            </div>

            {/* Score pills */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(scores).filter(([k]) => k !== "overall").map(([k, v]) => (
                <div key={k} className="bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-[#8E8C85] capitalize">{k.replace("_"," ")}</span>
                  <span className="ml-2 font-semibold text-[#1A1A18]">{v as number}</span>
                </div>
              ))}
            </div>

            {/* Findings */}
            <div>
              <h2 className="text-sm font-semibold text-[#1A1A18] mb-3">Findings ({findings.length})</h2>
              <div className="space-y-3">
                {findings.map((f: any, i: number) => {
                  const st = SEV[f.severity] || SEV.low;
                  return (
                    <div key={i} className="bg-white border border-[#E8E6E1] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${st.bg} ${st.text}`}>{f.severity}</span>
                        <span className="text-[10px] text-[#B5B3AD] uppercase">{f.category}</span>
                        <span className="text-[10px] text-[#B5B3AD] ml-auto">#{f.priority}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#1A1A18] mb-1">{f.title}</h3>
                      <p className="text-xs text-[#56554F] mb-3 leading-relaxed">{f.description}</p>
                      <div className="flex items-center gap-4 text-[11px] mb-2">
                        <span className={`font-bold ${st.text}`}>💰 {fmt(f.impact_min)}–{fmt(f.impact_max)}/yr</span>
                        <span className="text-[#B5B3AD]">⏱ {f.timeline}</span>
                        <span className="text-[#B5B3AD]">📊 {f.difficulty}</span>
                      </div>
                      {f.recommendation && (
                        <div className="bg-[#F7F5F2] rounded-lg px-3 py-2 text-xs text-[#56554F]">
                          ✅ {f.recommendation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk matrix */}
            {report.risk_matrix?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#1A1A18] mb-3">Risk Matrix</h2>
                <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F7F5F2] border-b border-[#E8E6E1]">
                      <tr>
                        {["Area","Risk","Likelihood","Impact","Status","Recommendation"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[#8E8C85] font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EDE8]">
                      {report.risk_matrix.map((r:any, i:number) => (
                        <tr key={i} className="hover:bg-[#F7F5F2]">
                          <td className="px-3 py-2 font-medium text-[#1A1A18]">{r.area}</td>
                          <td className="px-3 py-2">
                            <span className={`uppercase font-bold text-[9px] px-1.5 py-0.5 rounded ${SEV[r.risk_level]?.bg} ${SEV[r.risk_level]?.text}`}>{r.risk_level}</span>
                          </td>
                          <td className="px-3 py-2 text-[#56554F]">{r.likelihood}</td>
                          <td className="px-3 py-2 text-[#56554F]">{r.impact}</td>
                          <td className="px-3 py-2 text-[#56554F] max-w-[160px]">{r.current_status}</td>
                          <td className="px-3 py-2 text-[#56554F] max-w-[200px]">{r.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Benchmarks */}
            {report.benchmark_comparisons?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#1A1A18] mb-3">Benchmarks</h2>
                <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F7F5F2] border-b border-[#E8E6E1]">
                      <tr>
                        {["Metric","Your Value","Industry Avg","Top Quartile","Gap","Recommendation"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[#8E8C85] font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EDE8]">
                      {report.benchmark_comparisons.map((b:any, i:number) => (
                        <tr key={i} className="hover:bg-[#F7F5F2]">
                          <td className="px-3 py-2 font-medium text-[#1A1A18]">{b.metric}</td>
                          <td className="px-3 py-2 text-[#1B3A2D] font-semibold">{b.your_value}</td>
                          <td className="px-3 py-2 text-[#56554F]">{b.industry_avg}</td>
                          <td className="px-3 py-2 text-[#56554F]">{b.top_quartile}</td>
                          <td className="px-3 py-2 text-orange-600 font-medium">{b.gap}</td>
                          <td className="px-3 py-2 text-[#56554F] max-w-[200px]">{b.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Plan */}
            {report.action_plan?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#1A1A18] mb-3">90-Day Action Plan</h2>
                <div className="space-y-2">
                  {report.action_plan.map((a:any, i:number) => (
                    <div key={i} className="bg-white border border-[#E8E6E1] rounded-xl p-4 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[#1B3A2D]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#1B3A2D]">{a.priority || i+1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[#1A1A18] mb-0.5">{a.title}</h3>
                        <p className="text-xs text-[#8E8C85] mb-2">{a.description}</p>
                        <div className="flex gap-3 text-[10px]">
                          <span className="text-[#1B3A2D] font-semibold">{fmt(a.estimated_savings)}</span>
                          <span className="text-[#B5B3AD]">{a.timeline}</span>
                          <span className="text-[#B5B3AD]">{a.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outreach Email Generator */}
            <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">
              <button
                onClick={() => setOutreachOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F7F5F2] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1B3A2D]/10 flex items-center justify-center">
                    <span className="text-sm">✉️</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[#1A1A18]">Generate CFO Outreach Email</div>
                    <div className="text-xs text-[#8E8C85]">Personalized cold email using the findings above</div>
                  </div>
                </div>
                <span className="text-[#8E8C85] text-lg">{outreachOpen ? "▲" : "▼"}</span>
              </button>

              {outreachOpen && (
                <div className="border-t border-[#E8E6E1] p-5">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-[#56554F] mb-1 block">Your Name</label>
                      <input value={senderName} onChange={e=>setSenderName(e.target.value)} placeholder="Jean Tremblay"
                        className="w-full px-3 py-2.5 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#56554F] mb-1 block">Your Title</label>
                      <input value={senderTitle} onChange={e=>setSenderTitle(e.target.value)} placeholder="Financial Advisor"
                        className="w-full px-3 py-2.5 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#56554F] mb-1 block">Tone</label>
                      <select value={tone} onChange={e=>setTone(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]">
                        <option value="peer">Peer advisory</option>
                        <option value="direct">Direct / urgent</option>
                        <option value="consultative">Consultative</option>
                      </select>
                    </div>
                  </div>

                  {outreachError && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{outreachError}</div>
                  )}

                  <button onClick={generateOutreach} disabled={outreachLoading}
                    className="w-full py-2.5 bg-[#1B3A2D] text-white text-sm font-medium rounded-lg hover:bg-[#2D5A42] disabled:opacity-40 transition-colors mb-4">
                    {outreachLoading ? "Generating…" : "Generate Email"}
                  </button>

                  {outreachEmail && (
                    <div>
                      <div className="bg-[#F7F5F2] rounded-lg p-4 mb-3">
                        <div className="text-xs font-semibold text-[#1B3A2D] mb-1">Subject</div>
                        <div className="text-sm text-[#1A1A18] mb-4">{outreachEmail.subject}</div>
                        <div className="text-xs font-semibold text-[#1B3A2D] mb-1">Body</div>
                        <pre className="text-xs text-[#56554F] whitespace-pre-wrap font-sans leading-relaxed">{outreachEmail.body}</pre>
                      </div>
                      <button onClick={copyEmail}
                        className="w-full py-2.5 border border-[#1B3A2D] text-[#1B3A2D] text-sm font-medium rounded-lg hover:bg-[#1B3A2D]/5 transition-colors">
                        {copied ? "✓ Copied to clipboard" : "Copy Email"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
