"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

const DOC_STATUS_ORDER = ["pending","requested","received","reviewed"];
const DOC_STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  pending:   {bg:"#F0EFEB",                  color:"#8E8C85"},
  requested: {bg:"rgba(27,58,45,0.08)",      color:"#1B3A2D"},
  received:  {bg:"rgba(166,139,43,0.08)",    color:"#A68B2B"},
  reviewed:  {bg:"rgba(45,122,80,0.08)",     color:"#2D7A50"},
};
const CAT_COLORS: Record<string,{bg:string;color:string}> = {
  tax_structure:        {bg:"rgba(27,58,45,0.08)",   color:"#1B3A2D"},
  vendor_procurement:   {bg:"rgba(45,122,80,0.08)",  color:"#2D7A50"},
  payroll_hr:           {bg:"rgba(196,132,29,0.08)", color:"#C4841D"},
  banking_treasury:     {bg:"rgba(37,99,235,0.08)",  color:"#2563EB"},
  insurance:            {bg:"rgba(139,92,246,0.08)", color:"#7C3AED"},
  saas_technology:      {bg:"rgba(6,182,212,0.08)",  color:"#0891B2"},
  compliance_penalties: {bg:"rgba(179,64,64,0.08)",  color:"#B34040"},
};
function fmt(n:number) { return n>=1000000?"$"+(n/1000000).toFixed(1)+"M":n>=1000?"$"+Math.round(n/1000)+"K":"$"+n.toLocaleString(); }

interface Doc { id:string; document_type:string; label:string; status:string; notes:string|null; category?:string }
interface Finding { id:string; leak_id:string; leak_name:string; category:string; estimated_low:number; estimated_high:number; confirmed_amount:number; confidence_note:string|null }
interface Engagement { id:string; companyName:string; status:string; feePercentage:number; targetCompletion:string|null; notes:string|null; documents:Doc[]; findings:Finding[]; confirmedSavings:number; feeOwed:number; diagnostic?:any }

export default function EngagementDetailPage() {
  const router  = useRouter();
  const params  = useParams();
  const id      = params?.id as string;
  const [eng, setEng]             = useState<Engagement|null>(null);
  const [loading, setLoading]     = useState(true);
  const [cyclingDoc, setCyclingDoc] = useState<string|null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [addForm, setAddForm]     = useState({ leakId:"", leakName:"", category:"", estimatedLow:0, estimatedHigh:0, confirmedAmount:0, confidenceNote:"" });

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const r = await fetch(`/api/admin/tier3/engagements/${id}`);
      const j = await r.json();
      if (j.success) setEng(j.engagement);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const cycleDoc = async (doc: Doc) => {
    setCyclingDoc(doc.id);
    const next = DOC_STATUS_ORDER[(DOC_STATUS_ORDER.indexOf(doc.status)+1) % DOC_STATUS_ORDER.length];
    await fetch(`/api/admin/tier3/engagements/${id}?action=update_document`, {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({documentId:doc.id, status:next})
    });
    setCyclingDoc(null);
    load();
  };

  const addFinding = async () => {
    if (!addForm.leakName || !addForm.confirmedAmount) return;
    await fetch(`/api/admin/tier3/engagements/${id}?action=add_finding`, {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(addForm)
    });
    setShowAdd(false); setAddForm({leakId:"",leakName:"",category:"",estimatedLow:0,estimatedHigh:0,confirmedAmount:0,confidenceNote:""});
    load();
  };

  const deleteFinding = async (findingId:string) => {
    await fetch(`/api/admin/tier3/engagements/${id}?action=delete_finding`, {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({findingId})
    });
    load();
  };

  if (loading) return <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" /></div>;
  if (!eng)    return <div className="min-h-screen bg-[#FAFAF8] px-6 py-8 max-w-7xl mx-auto"><AdminNav /><p className="text-[#8E8C85] text-sm">Engagement not found.</p></div>;

  // Group docs by category
  const docGroups: Record<string,Doc[]> = {};
  (eng.documents || []).forEach(d => {
    const cat = d.category || d.document_type?.split("_")[0] || "general";
    if (!docGroups[cat]) docGroups[cat] = [];
    docGroups[cat].push(d);
  });

  const totalDocs = eng.documents?.length || 0;
  const receivedDocs = eng.documents?.filter(d => d.status==="received"||d.status==="reviewed").length || 0;
  const topLeaks = eng.diagnostic?.result?.topLeaks || [];
  const savings = eng.confirmedSavings || 0;
  const feeOwed = savings * (eng.feePercentage/100);
  const estMid  = eng.diagnostic?.result ? ((eng.diagnostic.result.estimatedLow||0)+(eng.diagnostic.result.estimatedHigh||0))/2 : 0;
  const pctOfMid = estMid > 0 ? Math.round((savings/estMid)*100) : null;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => router.push("/admin/tier3/engagements")}
          className="mb-4 px-3 py-1.5 bg-white border border-[#E8E6E1] text-[#56554F] text-sm font-medium rounded-lg hover:bg-[#F8F7F5] transition">
          ← Engagements
        </button>

        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">{eng.companyName}</h1>
          <span className="text-[9px] px-2 py-0.5 rounded font-bold" style={{background:"rgba(45,122,80,0.08)",color:"#2D7A50"}}>{eng.status.toUpperCase()}</span>
        </div>
        <p className="text-sm text-[#8E8C85] mb-6">{eng.feePercentage}% fee · {eng.targetCompletion ? `Target: ${eng.targetCompletion}` : "No target set"}</p>

        <AdminNav />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

          {/* LEFT — Document Checklist */}
          <div className="bg-white border border-[#EEECE8] rounded-xl shadow-sm overflow-hidden" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
            <div className="px-5 py-4 border-b border-[#EEECE8] flex items-center justify-between">
              <h2 className="font-semibold text-[#1A1A18]">Document Checklist</h2>
              <span className="text-sm text-[#8E8C85]">{receivedDocs} of {totalDocs} received</span>
            </div>

            {Object.entries(docGroups).map(([cat, docs]) => {
              const recv = docs.filter(d => d.status==="received"||d.status==="reviewed").length;
              return (
                <div key={cat}>
                  <div className="px-5 py-2.5 bg-[#FAFAF8] border-b border-[#EEECE8] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#56554F] capitalize">{cat.replace(/_/g," ")}</span>
                    <span className="text-[10px] text-[#B5B3AD]">{recv}/{docs.length}</span>
                  </div>
                  {docs.map(doc => {
                    const st = DOC_STATUS_STYLE[doc.status] || DOC_STATUS_STYLE.pending;
                    return (
                      <div key={doc.id} className="px-5 py-3 border-b border-[#EEECE8] last:border-0 hover:bg-[#F8F7F5] transition-colors flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1A1A18]">{doc.label}</p>
                          {doc.notes && <p className="text-[10px] text-[#B5B3AD] italic mt-0.5">{doc.notes}</p>}
                        </div>
                        <button onClick={() => cycleDoc(doc)} disabled={cyclingDoc===doc.id}
                          className="text-[10px] px-2.5 py-1 rounded font-bold shrink-0 transition-opacity hover:opacity-70"
                          style={st}>
                          {cyclingDoc===doc.id ? "…" : doc.status}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* RIGHT — Findings + Fee Calc */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#EEECE8] rounded-xl shadow-sm overflow-hidden" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
              <div className="px-5 py-4 border-b border-[#EEECE8] flex items-center justify-between">
                <h2 className="font-semibold text-[#1A1A18]">Confirmed Findings</h2>
                <button onClick={() => setShowAdd(s => !s)}
                  className="px-3 py-1.5 bg-[#1B3A2D] text-white text-xs font-semibold rounded-lg hover:bg-[#2A5A44] transition">
                  + Add Finding
                </button>
              </div>

              {/* Add form */}
              {showAdd && (
                <div className="mx-4 my-3 bg-[#FAFAF8] border border-[#EEECE8] rounded-lg p-4 space-y-3">
                  {topLeaks.length > 0 ? (
                    <div>
                      <label className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider block mb-1">Leak</label>
                      <select onChange={e => {
                        const lk = topLeaks.find((l:any) => l.id===e.target.value);
                        if (lk) setAddForm(f=>({...f,leakId:lk.id,leakName:lk.name,category:lk.category,estimatedLow:lk.estimatedLow||0,estimatedHigh:lk.estimatedHigh||0}));
                      }} className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]">
                        <option value="">Select a leak…</option>
                        {topLeaks.map((l:any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider block mb-1">Leak Name</label>
                      <input value={addForm.leakName} onChange={e => setAddForm(f=>({...f,leakName:e.target.value}))}
                        className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider block mb-1">Est. Low ($)</label>
                      <input type="number" value={addForm.estimatedLow} onChange={e => setAddForm(f=>({...f,estimatedLow:Number(e.target.value)}))}
                        className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider block mb-1">Est. High ($)</label>
                      <input type="number" value={addForm.estimatedHigh} onChange={e => setAddForm(f=>({...f,estimatedHigh:Number(e.target.value)}))}
                        className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider block mb-1">Confirmed Amount ($)</label>
                    <input type="number" value={addForm.confirmedAmount} onChange={e => setAddForm(f=>({...f,confirmedAmount:Number(e.target.value)}))}
                      className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider block mb-1">Confidence Note</label>
                    <input value={addForm.confidenceNote} onChange={e => setAddForm(f=>({...f,confidenceNote:e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addFinding} className="flex-1 py-1.5 bg-[#1B3A2D] text-white text-xs font-semibold rounded-lg hover:bg-[#2A5A44] transition">Save</button>
                    <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 bg-white border border-[#E8E6E1] text-[#56554F] text-xs rounded-lg hover:bg-[#F8F7F5] transition">Cancel</button>
                  </div>
                </div>
              )}

              {/* Findings */}
              <div className="divide-y divide-[#EEECE8]">
                {(eng.findings||[]).length === 0 ? (
                  <p className="px-5 py-6 text-center text-[#B5B3AD] text-sm">No findings confirmed yet.</p>
                ) : (eng.findings||[]).map(f => {
                  const mid  = (f.estimated_low + f.estimated_high) / 2;
                  const good = f.confirmed_amount >= mid * 0.8;
                  const low  = f.confirmed_amount < f.estimated_low * 0.5;
                  const cc   = low ? "#B34040" : good ? "#2D7A50" : "#A68B2B";
                  const cat  = CAT_COLORS[f.category] || {bg:"#F0EFEB",color:"#8E8C85"};
                  return (
                    <div key={f.id} className="px-5 py-3 relative">
                      <button onClick={() => deleteFinding(f.id)} className="absolute top-3 right-4 text-[#B5B3AD] hover:text-[#B34040] text-sm transition-colors">×</button>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-[#1A1A18] pr-4">{f.leak_name}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={cat}>{f.category?.replace(/_/g," ")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#B5B3AD]">Est. {fmt(f.estimated_low)} – {fmt(f.estimated_high)}</span>
                        <span className="font-bold" style={{color:cc}}>Confirmed {fmt(f.confirmed_amount)}</span>
                      </div>
                      {f.confidence_note && <p className="text-[10px] text-[#8E8C85] italic mt-0.5">{f.confidence_note}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fee Calculator */}
            <div className="bg-[#FAFAF8] border border-[#EEECE8] rounded-xl p-5" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
              <h2 className="font-semibold text-[#1A1A18] mb-4">Fee Calculator</h2>
              <div className="space-y-2.5 mb-4">
                {[
                  ["Total Confirmed Savings", fmt(savings)],
                  ["Fee Percentage",          eng.feePercentage+"%"],
                ].map(([l,v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-sm text-[#8E8C85]">{l}</span>
                    <span className="text-sm font-medium text-[#1A1A18]">{v}</span>
                  </div>
                ))}
                <div className="h-px bg-[#E8E6E1] my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#56554F]">Fee Owed</span>
                  <span className="font-serif text-2xl font-bold text-[#1B3A2D]">{fmt(feeOwed)}</span>
                </div>
              </div>

              {pctOfMid !== null && (
                <p className="text-xs text-[#8E8C85] mb-4">
                  Estimated midpoint: {fmt(estMid)} · Confirmed {" "}
                  <span style={{color: pctOfMid >= 100 ? "#2D7A50" : pctOfMid >= 50 ? "#A68B2B" : "#B34040", fontWeight:600}}>
                    {pctOfMid}%
                  </span>{" "}of estimate.
                </p>
              )}

              <button onClick={() => alert("Invoice generation coming in Session 10")}
                className="w-full py-2.5 bg-[#1B3A2D] text-white text-sm font-semibold rounded-lg hover:bg-[#2A5A44] transition">
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
