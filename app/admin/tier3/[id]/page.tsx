"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

const CAT_COLORS: Record<string,{bg:string;color:string}> = {
  tax_structure:        {bg:"rgba(27,58,45,0.08)",   color:"#1B3A2D"},
  vendor_procurement:   {bg:"rgba(45,122,80,0.08)",  color:"#2D7A50"},
  payroll_hr:           {bg:"rgba(196,132,29,0.08)", color:"#C4841D"},
  banking_treasury:     {bg:"rgba(37,99,235,0.08)",  color:"#2563EB"},
  insurance:            {bg:"rgba(139,92,246,0.08)", color:"#7C3AED"},
  saas_technology:      {bg:"rgba(6,182,212,0.08)",  color:"#0891B2"},
  compliance_penalties: {bg:"rgba(179,64,64,0.08)",  color:"#B34040"},
};
const CONF_COLORS: Record<string,{bg:string;color:string}> = {
  HIGH:        {bg:"rgba(45,122,80,0.08)",  color:"#2D7A50"},
  MEDIUM:      {bg:"rgba(166,139,43,0.08)", color:"#A68B2B"},
  SPECULATIVE: {bg:"rgba(179,64,64,0.08)",  color:"#B34040"},
};
function fmt(n:number) { return n >= 1000 ? "$"+Math.round(n/1000)+"K" : "$"+n; }

export default function AdminTier3DetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [error, setError] = useState<string | null>(null);
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/tier3/pipeline/${id}`)
      .then(r => r.json())
      .then(j => { if (j.success) setData(j); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
    {error && <div className="text-red-400 p-4">{error}</div>}
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
    </>
  );
  if (!data) return (
    <>
    {error && <div className="text-red-400 p-4">{error}</div>}
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-8 max-w-7xl mx-auto">
      <AdminNav />
      <p className="text-sm text-[#8E8C85]">Entry not found.</p>
    </div>
    </>
  );

  const entry    = data.entry || {};
  const result   = data.diagnostic?.result || {};
  const topLeaks = result.topLeaks || [];

  return (
    <>
    {error && <div className="text-red-400 p-4">{error}</div>}
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => router.back()}
            className="px-3 py-1.5 bg-white border border-[#E8E6E1] text-[#56554F] text-sm font-medium rounded-lg hover:bg-[#F8F7F5] transition">
            ← Pipeline
          </button>
          <button onClick={() => router.push(`/admin/tier3/${id}/execution`)}
            className="px-3 py-1.5 bg-white border border-[#1B3A2D]/20 text-[#1B3A2D] text-sm font-bold rounded-lg hover:bg-[#1B3A2D]/5 transition flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            Execution Playbook
          </button>
          <button onClick={() => router.push(`/admin/tier3/${id}/accountant`)}
            className="px-3 py-1.5 bg-white border border-[#E8E6E1] text-[#56554F] text-sm font-medium rounded-lg hover:bg-[#F8F7F5] transition flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
            Accountant Brief
          </button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">{entry.companyName}</h1>
          <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{background:"rgba(27,58,45,0.06)",color:"#1B3A2D"}}>{entry.stage}</span>
        </div>
        <p className="text-sm text-[#8E8C85] mb-6">{entry.industry} · {entry.province} · {entry.revenueBracket}</p>

        <AdminNav />

        {result.summary?.executiveSummary && (
          <div className="bg-[#1B3A2D] rounded-xl p-5 mb-6">
            <p className="text-[10px] font-bold text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-2">Executive Summary</p>
            <p className="text-sm text-white leading-relaxed">{result.summary.executiveSummary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* Left — Leaks */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">Full Leak Breakdown</h2>
            {topLeaks.length === 0 ? (
              <div className="bg-white border border-[#EEECE8] rounded-xl p-6 text-center text-[#B5B3AD] text-sm">No leaks in diagnostic</div>
            ) : topLeaks.map((leak:any, i:number) => {
              const cat  = CAT_COLORS[leak.category] || {bg:"#F0EFEB",color:"#8E8C85"};
              const conf = CONF_COLORS[leak.confidence] || {bg:"#F0EFEB",color:"#8E8C85"};
              return (
                <div key={i} className="bg-white border border-[#EEECE8] rounded-xl p-4" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-2xl font-bold text-[#1B3A2D] shrink-0">#{i+1}</span>
                      <div>
                        <p className="font-semibold text-[#1A1A18] text-sm">{leak.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={cat}>{leak.category?.replace(/_/g," ")}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={conf}>{leak.confidence}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-serif text-lg font-bold text-[#1A1A18]">{fmt(leak.estimatedLow)} – {fmt(leak.estimatedHigh)}</p>
                      <p className="text-[10px] text-[#B5B3AD]">/year</p>
                    </div>
                  </div>
                  {leak.confidenceReason && <p className="text-xs text-[#8E8C85] italic mt-2">{leak.confidenceReason}</p>}
                  {leak.dataNeeded?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#EEECE8]">
                      <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">Data Needed</p>
                      <ul className="space-y-0.5">
                        {leak.dataNeeded.map((d:string,j:number) => (
                          <li key={j} className="text-xs text-[#56554F] flex gap-1.5"><span className="text-[#B5B3AD]">·</span>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {leak.recoveryTimeline && <p className="text-[10px] text-[#B5B3AD] mt-1.5">Timeline: {leak.recoveryTimeline}</p>}
                </div>
              );
            })}
          </div>

          {/* Right — Pipeline details */}
          <div className="space-y-4">
            <div className="bg-white border border-[#EEECE8] rounded-xl p-5" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
              <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-4">Pipeline Details</p>
              <div className="space-y-3">
                {[
                  ["Stage",       entry.stage],
                  ["Days in Stage",String(entry.daysInStage)+"d"],
                  ["Follow-up",   entry.followUpDate || "—"],
                  ["Agreement",   entry.agreementStatus || "None"],
                ].map(([l,v]) => (
                  <div key={l} className="flex justify-between border-b border-[#EEECE8] pb-2 last:border-0">
                    <span className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">{l}</span>
                    <span className="text-sm font-medium text-[#1A1A18]">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {entry.notes && (
              <div className="bg-white border border-[#EEECE8] rounded-xl p-5" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
                <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-[#56554F] leading-relaxed">{entry.notes}</p>
              </div>
            )}

            <div className="bg-white border border-[#EEECE8] rounded-xl p-5" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
              <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-3">Summary</p>
              <p className="font-serif text-2xl font-bold text-[#2D7A50]">{fmt(entry.estimatedLow)} – {fmt(entry.estimatedHigh)}</p>
              <p className="text-xs text-[#B5B3AD] mt-0.5">{entry.highConfidenceCount} high-confidence leaks</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => router.push(`/tier3/diagnostic/${entry.diagnosticId}`)}
                  className="flex-1 py-2 bg-[#1B3A2D] text-white text-sm font-semibold rounded-lg hover:bg-[#2A5A44] transition">
                  View Diagnostic
                </button>
                <a href={`/api/tier3/diagnostic/${entry.diagnosticId}/pdf`} target="_blank" rel="noreferrer"
                  className="flex-1 py-2 text-center bg-white border border-[#E8E6E1] text-[#56554F] text-sm font-medium rounded-lg hover:bg-[#F8F7F5] transition">
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
