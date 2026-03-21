"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

interface Engagement {
  id:string; companyName:string; status:string; startedAt:string;
  targetCompletion:string|null; feePercentage:number; documentsTotal:number;
  documentsReceived:number; confirmedSavings:number; feeOwed:number;
  estimatedLow:number; estimatedHigh:number;
}
interface Stats { activeCount:number; totalConfirmedSavings:number; totalFeesOwed:number; avgDocumentProgress:number }

function fmt(n:number) { return n>=1000000?"$"+(n/1000000).toFixed(1)+"M":n>=1000?"$"+Math.round(n/1000)+"K":"$"+n.toLocaleString(); }
function relDate(iso:string) {
  if(!iso) return "—";
  const d = Math.floor((Date.now()-new Date(iso).getTime())/86400000);
  return d===0?"Today":d===1?"Yesterday":`${d}d ago`;
}
const STATUS_STYLE: Record<string,{bg:string;color:string}> = {
  active:    {bg:"rgba(45,122,80,0.08)",  color:"#2D7A50"},
  completed: {bg:"rgba(27,58,45,0.08)",   color:"#1B3A2D"},
  paused:    {bg:"rgba(166,139,43,0.08)", color:"#A68B2B"},
  cancelled: {bg:"rgba(179,64,64,0.08)",  color:"#B34040"},
};

export default function EngagementsPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [stats, setStats]             = useState<Stats|null>(null);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState({ diagnosticId:"", feePercentage:12, targetCompletion:"" });
  const [creating, setCreating]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/tier3/engagements");
      const j = await r.json();
      if (j.success) { setEngagements(j.engagements); setStats(j.stats); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.diagnosticId.trim()) return;
    setCreating(true);
    try {
      const r = await fetch("/api/admin/tier3/engagements", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)
      });
      const j = await r.json();
      if (j.success) { setShowModal(false); setForm({diagnosticId:"",feePercentage:12,targetCompletion:""}); load(); }
    } finally { setCreating(false); }
  };

  return (
    <>
    {error && <div className="text-red-400 p-4">{error}</div>}
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">ADMIN</p>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">Engagements</h1>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#1B3A2D] text-white text-sm font-semibold rounded-lg hover:bg-[#2A5A44] transition">
            + New Engagement
          </button>
        </div>

        <AdminNav />

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {label:"Active Engagements",      val:String(stats.activeCount),             green:false},
              {label:"Total Confirmed Savings",  val:fmt(stats.totalConfirmedSavings),      green:true},
              {label:"Total Fees Owed",          val:fmt(stats.totalFeesOwed),              caution:true},
              {label:"Avg Doc Progress",         val:Math.round(stats.avgDocumentProgress)+"%", green:false},
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#EEECE8] rounded-xl p-5" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
                <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-3">{s.label}</p>
                <p className={`font-serif text-2xl font-bold leading-none ${s.green?"text-[#2D7A50]":(s as any).caution?"text-[#A68B2B]":"text-[#1A1A18]"}`}>{s.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" /></div>
        ) : engagements.length === 0 ? (
          <div className="bg-white border border-[#EEECE8] rounded-xl p-12 text-center" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
            <p className="text-[#8E8C85] text-sm mb-1">No active engagements.</p>
            <p className="text-[#B5B3AD] text-xs">Start one from the Tier 3 Pipeline when a company reaches the Signed stage.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {engagements.map(eng => {
              const docPct = eng.documentsTotal > 0 ? Math.round((eng.documentsReceived/eng.documentsTotal)*100) : 0;
              const st = STATUS_STYLE[eng.status] || STATUS_STYLE.active;
              return (
                <div key={eng.id} className="bg-white border border-[#EEECE8] rounded-xl p-5 hover:shadow-md transition-shadow" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-serif text-lg font-bold text-[#1A1A18]">{eng.companyName}</h3>
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold" style={st}>{eng.status.toUpperCase()}</span>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-[#56554F] mb-1">
                          <span>Documents received</span>
                          <span className="font-medium">{eng.documentsReceived} / {eng.documentsTotal}</span>
                        </div>
                        <div className="h-2 bg-[#F0EFEB] rounded-full">
                          <div className="h-full bg-[#1B3A2D] rounded-full transition-all" style={{width:docPct + "%"}} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div>
                          <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-0.5">Confirmed Savings</p>
                          <p className="font-serif text-xl font-bold text-[#2D7A50]">{fmt(eng.confirmedSavings)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-0.5">Fee Owed</p>
                          <p className="font-semibold text-[#A68B2B]">{fmt(eng.feeOwed)} <span className="text-[10px] text-[#B5B3AD]">({eng.feePercentage}%)</span></p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-0.5">Estimate</p>
                          <p className="text-sm text-[#8E8C85]">{fmt(eng.estimatedLow)} – {fmt(eng.estimatedHigh)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-0.5">Target</p>
                          <p className="text-sm text-[#8E8C85]">{eng.targetCompletion || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-0.5">Started</p>
                          <p className="text-sm text-[#8E8C85]">{relDate(eng.startedAt)}</p>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => router.push(`/admin/tier3/engagements/${eng.id}`)}
                      className="px-4 py-2 bg-[#1B3A2D] text-white text-sm font-semibold rounded-lg hover:bg-[#2A5A44] transition shrink-0">
                      Open →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Engagement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="fixed inset-0" style={{background:"rgba(26,26,24,0.35)"}} />
          <div className="relative bg-white rounded-2xl border border-[#EEECE8] shadow-xl p-6 w-full max-w-md z-50" onClick={e => e.stopPropagation()}>
            <h2 className="font-serif text-lg font-bold text-[#1A1A18] mb-1">New Engagement</h2>
            <p className="text-xs text-[#B5B3AD] mb-4">Find the diagnostic ID in the Tier 3 Pipeline page.</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider block mb-1">Diagnostic ID</label>
                <input value={form.diagnosticId} onChange={e => setForm(f=>({...f,diagnosticId:e.target.value}))} placeholder="uuid…"
                  className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] placeholder-[#B5B3AD] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider block mb-1">Fee Percentage</label>
                <input type="number" min={8} max={20} value={form.feePercentage} onChange={e => setForm(f=>({...f,feePercentage:Number(e.target.value)}))}
                  className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider block mb-1">Target Completion</label>
                <input type="date" value={form.targetCompletion} onChange={e => setForm(f=>({...f,targetCompletion:e.target.value}))}
                  className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-white border border-[#E8E6E1] text-[#56554F] text-sm font-medium rounded-lg hover:bg-[#F8F7F5] transition">
                Cancel
              </button>
              <button onClick={create} disabled={creating || !form.diagnosticId.trim()}
                className="flex-1 py-2 bg-[#1B3A2D] text-white text-sm font-semibold rounded-lg hover:bg-[#2A5A44] transition disabled:opacity-50">
                {creating ? "Creating…" : "Create Engagement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
}
