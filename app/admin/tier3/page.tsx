"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

interface PipelineEntry {
  pipelineId:string|null; diagnosticId:string|null; reportId:string|null;
  companyName:string; industry:string; province:string; revenueBracket:string;
  estimatedLow:number; estimatedHigh:number; highConfidenceCount:number; confirmedSavings?:number;
  stage:string; notes:string|null; followUpDate:string|null;
  lostReason:string|null; daysInStage:number; createdAt:string; updatedAt:string;
  agreementStatus:string|null; source?:string;
  contactEmail?:string|null; contactPhone?:string|null;
}
interface Stats { totalPipelineValue:number; activeEngagements:number; feesCollectedThisMonth:number; conversionRate:number; byStage:Record<string,{count:number;value:number}> }

const STAGES = ["lead","contacted","called","call_booked","diagnostic_sent","agreement_out","signed","in_engagement","recovery_tracking","fee_collected","completed","lost"];
const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  hot:  { bg: "rgba(179,64,64,0.1)",   text: "#B34040", label: "HOT"  },
  warm: { bg: "rgba(196,132,29,0.1)",  text: "#C4841D", label: "WARM" },
  cold: { bg: "rgba(142,140,133,0.1)", text: "#8E8C85", label: "COLD" },
};
const STAGE_LABELS: Record<string,string> = {
  lead:"New Lead", contacted:"Contacted", called:"Called", call_booked:"Call Booked",
  diagnostic_sent:"Diagnostic Sent",
  agreement_out:"Agreement Out", signed:"Signed", in_engagement:"In Engagement",
  fee_collected:"Fee Collected", lost:"Lost"
};

function fmt(n:number) { return n >= 1000000 ? "$"+(n/1000000).toFixed(1)+"M" : n >= 1000 ? "$"+Math.round(n/1000)+"K" : "$"+n.toLocaleString(); }

function valueColor(n:number) {
  if (n > 200000) return "#2D7A50";
  if (n > 100000) return "#A68B2B";
  return "#8E8C85";
}

export default function AdminTier3Page() {
  const router = useRouter();
  const [entries, setEntries] = useState<PipelineEntry[]>([]);
  const [stats, setStats]     = useState<Stats|null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState<"kanban"|"table">("kanban");
  const [sortByScore, setSortByScore] = useState(false);
  const [drawerRepId, setDrawerRepId]   = useState("");
  const [toast,     setToast]     = useState("");
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<PipelineEntry|null>(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [reps, setReps]       = useState<{id:string;name:string}[]>([]);
  const debounce              = useRef<NodeJS.Timeout|null>(null);

  const FUNNEL_STAGES = [
    "lead","contacted","called","diagnostic_sent",
    "agreement_out","signed","in_engagement","fee_collected"
  ];

  const load = useCallback(async (q = search) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: "100", ...(q ? { search: q } : {}) });
      const r = await fetch(`/api/admin/tier3/pipeline?${p}`);
      const j = await r.json();
      if (j.success) { setEntries(j.entries); setStats(j.stats); }
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    fetch("/api/admin/tier3/reps").then(r => r.json()).then(d => {
      if (d.reps) setReps((d.reps as any[]).filter(r => r.status === "active").map(r => ({ id:r.id, name:r.name })));
    }).catch(() => {});
  }, []);

  const assignRep = async (pipelineId: string, userId: string, repId: string) => {
    if (!repId || !pipelineId) return;
    await fetch("/api/admin/assign-rep", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, repId }),
    });
    load();
  };

  const onSearch = (v:string) => {
    setSearch(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(v), 300);
  };

  const patch = async (id:string, body:object) => {
    setSaving(true);
    await fetch(`/api/admin/tier3/pipeline/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 1500);
    load();
  };

  const startEngagement = async (entry: PipelineEntry) => {
    if (!entry.pipelineId) return;
    setSaving(true);
    const feePercent = prompt("Fee percentage for this engagement? (default: 12)", "12");
    if (feePercent === null) { setSaving(false); return; }
    await fetch(`/api/admin/tier3/pipeline/${entry.pipelineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "in_engagement", feePercentage: Number(feePercent) || 12 }),
    });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 1500);
    setSelected(null);
    load();
  };

  // Creates a pipeline row for unlinked v2 diagnostic_reports entries
  const addToPipeline = async (entry: PipelineEntry) => {
    if (!entry.reportId) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/tier3/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: entry.reportId, stage: "lead" }),
      });
      const json = await res.json();
      if (json.success) {
        // Update selected with new pipelineId so slide-over refreshes correctly
        setSelected(prev => prev ? { ...prev, pipelineId: json.id, stage: "lead" } : prev);
        load();
      }
    } catch { /* non-fatal */ }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-6">
          <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">ADMIN</p>
          <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">Tier 3 Pipeline</h1>
        </div>

        <AdminNav />
        {toast && (
          <div className="mb-3 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer"
            style={{ background: "rgba(45,122,80,0.08)", color: "#2D7A50" }}
            onClick={() => setToast("")}>
            {toast}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label:"Total Pipeline Value",      val:fmt(stats.totalPipelineValue),          green:true },
              { label:"Active Engagements",        val:String(stats.activeEngagements),        green:false },
              { label:"Fees Collected This Month", val:fmt(stats.feesCollectedThisMonth),      green:false },
              { label:"Conversion Rate",           val:stats.conversionRate.toFixed(1)+"%",    green:false },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#EEECE8] rounded-xl p-5" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
                <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-3">{s.label}</p>
                <p className={`font-serif text-2xl font-bold leading-none ${s.green ? "text-[#2D7A50]" : "text-[#1A1A18]"}`}>{s.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search company…"
            className="px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] placeholder-[#B5B3AD] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] w-56" />
          <div className="flex rounded-lg overflow-hidden border border-[#E8E6E1]">
            {(["kanban","table"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium transition ${view===v ? "bg-[#1B3A2D] text-white" : "bg-white text-[#56554F] hover:bg-[#F8F7F5]"}`}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban */}
        {view === "kanban" && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-max">
              {STAGES.map(stage => {
                const cards = entries.filter(e => e.stage === stage);
                const stageVal = cards.reduce((a,c) => a + c.estimatedHigh, 0);
                return (
                  <div key={stage} className="w-[220px] bg-[#F0EFEB] border border-[#EEECE8] rounded-xl p-3 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#56554F]">{STAGE_LABELS[stage]}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{background:"#F0EFEB",color:"#8E8C85"}}>{cards.length}</span>
                        {stageVal > 0 && <span className="text-[9px] font-bold text-[#2D7A50]">{fmt(stageVal)}</span>}
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      {cards.map(c => (
                        <div key={c.pipelineId} onClick={() => setSelected(c)}
                          className="bg-white border border-[#EEECE8] rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow">
                          <p className="text-sm font-semibold text-[#1A1A18] truncate">{c.companyName}</p>
                          <p className="text-xs font-bold mt-0.5" style={{color:valueColor(c.estimatedHigh)}}>
                            {c.confirmedSavings && c.confirmedSavings > 0
                              ? <span style={{color:"#2D7A50"}}>✓ {fmt(c.confirmedSavings)}</span>
                              : <>{fmt(c.estimatedLow)} – {fmt(c.estimatedHigh)}</>
                            }
                          </p>
                          <p className="text-[10px] text-[#B5B3AD] mt-1 truncate">{c.industry} · {c.province}{c.country ? ` (${c.country})` : ""}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[9px] text-[#B5B3AD]">Day {c.daysInStage}</span>
                            <div className="w-2 h-2 rounded-full" style={{
                              background: c.highConfidenceCount >= 3 ? "#2D7A50" : c.highConfidenceCount >= 1 ? "#A68B2B" : "#B5B3AD"
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table */}
        {view === "table" && (
          <div className="bg-white border border-[#EEECE8] rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_80px_100px_120px_80px_80px_70px] px-4 py-2.5 bg-[#FAFAF8] border-b border-[#EEECE8]">
              {["Company","Industry","Province","Revenue","Est. Value","High Conf","Stage","Days"].map(h => (
                <span key={h} className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {entries.map(e => (
              <div key={e.pipelineId} onClick={() => setSelected(e)}
                className="grid grid-cols-[1fr_100px_80px_100px_120px_80px_80px_70px] px-4 py-3 border-b border-[#EEECE8] last:border-0 hover:bg-[#F8F7F5] transition-colors items-center cursor-pointer">
                <span className="text-sm font-semibold text-[#1A1A18] truncate">{e.companyName}</span>
                <span className="text-xs text-[#56554F] truncate">{e.industry}</span>
                <span className="text-xs text-[#8E8C85]">{e.province}{e.country ? ` (${e.country})` : ""}</span>
                <span className="text-xs text-[#8E8C85]">{e.revenueBracket}</span>
                <span className="text-xs font-bold" style={{color:valueColor(e.estimatedHigh)}}>{fmt(e.estimatedLow)}–{fmt(e.estimatedHigh)}</span>
                <span className="text-xs text-[#1A1A18] font-medium text-center">{e.highConfidenceCount}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{background:"rgba(27,58,45,0.06)",color:"#1B3A2D"}}>{STAGE_LABELS[e.stage]}</span>
                <span className="text-xs text-[#B5B3AD]">{e.daysInStage}d</span>{(e.stage === "agreement_out" || e.stage === "diagnostic_sent") && e.daysInStage > 7 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded ml-1" style={{background:"rgba(179,64,64,0.12)",color:"#B34040"}}>STALLED</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setSelected(null)}>
          <div className="fixed inset-0" style={{background:"rgba(26,26,24,0.25)"}} />
          <div className="relative w-[480px] h-full bg-white border-l border-[#EEECE8] shadow-xl overflow-y-auto z-50" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#EEECE8] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1A1A18]">{selected.companyName}</h2>
                {selected.source === "v2" || selected.source === "v2_unlinked" ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1B3A2D]/10 text-[#1B3A2D]">v2 enterprise</span>
                ) : null}
              </div>
              <button onClick={() => setSelected(null)} className="text-[#B5B3AD] hover:text-[#56554F] text-xl">×</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Industry",selected.industry],["Region",`${selected.province || "—"}${selected.country ? ` (${selected.country})` : ""}`],
                  ["Revenue",selected.revenueBracket],["Days in Stage",String(selected.daysInStage)+"d"],
                  ...(selected.contactEmail ? [["Email", selected.contactEmail]] : []),
                  ...(selected.contactPhone ? [["Phone", selected.contactPhone]] : []),
                ].map(([l,v]) => (
                  <div key={l} className="bg-[#FAFAF8] rounded-lg p-3">
                    <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">{l}</p>
                    <p className="text-sm font-medium text-[#1A1A18]">{v}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">Estimated Value</p>
                {selected.confirmedSavings && selected.confirmedSavings > 0 ? (
                  <div>
                    <p className="font-serif text-2xl font-bold text-[#2D7A50]">
                      ✓ {fmt(selected.confirmedSavings)}
                    </p>
                    <p className="text-[11px] text-[#8E8C85]">confirmed · Fruxal fee: {fmt(Math.round(selected.confirmedSavings * 0.12))}</p>
                  </div>
                ) : (
                  <p className="font-serif text-2xl font-bold" style={{color:valueColor(selected.estimatedHigh)}}>
                    {fmt(selected.estimatedLow)} – {fmt(selected.estimatedHigh)}
                  </p>
                )}
                <p className="text-xs text-[#B5B3AD] mt-0.5">{selected.highConfidenceCount} high-confidence leaks</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2">Stage</p>
                {selected.pipelineId ? (
                  <select value={selected.stage} onChange={e => { const s = {...selected, stage:e.target.value}; setSelected(s); patch(selected.pipelineId!, {stage:e.target.value}); }}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]">
                    {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                  </select>
                ) : (
                  <div className="bg-[#FAFAF8] border border-dashed border-[#EEECE8] rounded-lg p-3 text-center">
                    <p className="text-xs text-[#8E8C85] mb-2">This diagnostic isn&apos;t in the pipeline yet.</p>
                    <button onClick={() => addToPipeline(selected)} disabled={saving}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50 transition"
                      style={{background:"linear-gradient(135deg,#1B3A2D,#2D7A50)"}}>
                      {saving ? "Adding…" : "Add to Pipeline →"}
                    </button>
                  </div>
                )}
              </div>

              {selected.stage === "lost" && (
                <div>
                  <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2">Lost Reason</p>
                  <input defaultValue={selected.lostReason || ""} onBlur={e => selected.pipelineId && patch(selected.pipelineId, {lostReason:e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
                </div>
              )}

              {reps.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2">Assign Recovery Rep</p>
                  <div className="flex gap-2">
                    <select value={drawerRepId} onChange={e => setDrawerRepId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]">
                      <option value="">Select rep…</option>
                      {reps.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <button
                      onClick={() => { if (drawerRepId && selected?.pipelineId && (selected as any).userId) assignRep(selected.pipelineId, (selected as any).userId, drawerRepId); setDrawerRepId(""); }}
                      disabled={!drawerRepId || saving}
                      className="px-4 py-2 bg-[#1B3A2D] text-white text-xs font-semibold rounded-lg hover:bg-[#2A5A44] transition disabled:opacity-40">
                      Assign
                    </button>
                  </div>
                  <p className="text-[10px] text-[#B5B3AD] mt-1">Fires rep + client emails immediately.</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">Notes</p>
                  {saved && <span className="text-[10px] text-[#2D7A50] font-medium">Saved ✓</span>}
                </div>
                <textarea defaultValue={selected.notes || ""} onBlur={e => selected.pipelineId && patch(selected.pipelineId, {notes:e.target.value})} rows={4}
                  className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] resize-none" />
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2">Follow-up Date</p>
                <input type="date" defaultValue={selected.followUpDate || ""} onChange={e => selected.pipelineId && patch(selected.pipelineId, {followUpDate:e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]" />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {!selected.diagnosticId && selected.pipelineId && (
                  <button onClick={() => router.push(`/admin/tier3/diagnostic?pipelineId=${selected.pipelineId}`)}
                    className="w-full py-2.5 bg-[#1B3A2D] text-white text-sm font-bold rounded-lg hover:bg-[#2A5A44] transition">
                    Start Diagnostic →
                  </button>
                )}
                {selected.diagnosticId && <button onClick={() => router.push(`/admin/tier3/${selected.diagnosticId}`)}
                  className="text-sm font-semibold text-[#1B3A2D] hover:underline text-left">View Diagnostic →</button>}
                {selected.diagnosticId && <a href={`/api/tier3/diagnostic/${selected.diagnosticId}/pdf`} target="_blank" rel="noreferrer"
                  className="text-sm font-semibold text-[#1B3A2D] hover:underline">Download PDF →</a>}
                {selected.agreementStatus && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-[#8E8C85]">Agreement:</p>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                      style={{background:"rgba(45,122,80,0.08)",color:"#2D7A50"}}>{selected.agreementStatus}</span>
                  </div>
                )}
                {selected.stage === "fee_collected" && !(selected as any).invoiceSent && (
                  <button
                    onClick={async () => {
                      const res = await fetch(`/api/admin/tier3/pipeline/${selected.pipelineId || selected.diagnosticId}/invoice`, { method: "POST" }).then(r => r.json());
                      if (res.success) setToast(`Invoice sent — $${res.fee_amount?.toLocaleString()}`);
                      else alert(res.error || "Failed");
                    }}
                    className="w-full py-2 rounded-lg text-[12px] font-bold text-white transition hover:opacity-90"
                    style={{ background: "#1B3A2D" }}>
                    Send Invoice →
                  </button>
                )}
                {(selected.stage === "signed" || selected.agreementStatus === "signed") && !["in_engagement","fee_collected"].includes(selected.stage) && (
                  <button
                    onClick={() => startEngagement(selected)}
                    disabled={saving}
                    className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition disabled:opacity-50 mt-2"
                    style={{background:"linear-gradient(135deg,#1B3A2D,#2D7A50)"}}>
                    {saving ? "Starting…" : "⚡ Start Engagement →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
