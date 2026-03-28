"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtM = (n: number) =>
  n >= 1_000_000 ? `$${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n/1_000)}K` : `$${n.toLocaleString()}`;

const STAGE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  lead:              { label:"Lead",           color:"#8E8C85", bg:"rgba(142,140,133,0.08)" },
  contacted:         { label:"Contacted",       color:"#0369a1", bg:"rgba(3,105,161,0.07)"  },
  diagnostic_sent:   { label:"Diagnostic Sent", color:"#7C3AED", bg:"rgba(124,58,237,0.07)" },
  call_booked:       { label:"Call Booked",     color:"#C4841D", bg:"rgba(196,132,29,0.08)" },
  agreement_out:     { label:"Agreement Sent",  color:"#7C3AED", bg:"rgba(124,58,237,0.07)" },
  signed:            { label:"Signed ✓",        color:"#1B3A2D", bg:"rgba(27,58,45,0.08)"   },
  engaged:           { label:"Engaged",         color:"#1B3A2D", bg:"rgba(27,58,45,0.08)"   },
  in_engagement:     { label:"Active",          color:"#2D7A50", bg:"rgba(45,122,80,0.08)"  },
  recovery_tracking: { label:"Recovery",        color:"#3D7A5E", bg:"rgba(61,122,94,0.08)"  },
  completed:         { label:"Completed",       color:"#B5B3AD", bg:"rgba(181,179,173,0.08)" },
};

export default function RepDashboard() {
  const router = useRouter();
  const [rep,     setRep]     = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("needs_action");
  const [showCalendlyEdit, setShowCalendlyEdit] = useState(false);
  const [calendlyInput, setCalendlyInput] = useState("");
  const [savingCalendly, setSavingCalendly] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/rep/me").then(r => r.json()).catch(() => ({})),
      fetch("/api/rep/pipeline").then(r => r.json()).catch(() => ({})),
    ]).then(([meData, plData]) => {
      if (meData?.success) setRep(meData.rep);
      if (plData?.success) setClients(plData.clients || []);
    }).finally(() => setLoading(false));
  }, []);

  const saveCalendly = async () => {
    if (!calendlyInput.trim()) return;
    setSavingCalendly(true);
    try {
      const res = await fetch("/api/rep/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendly_url: calendlyInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setRep((prev: any) => ({ ...prev, calendly_url: calendlyInput.trim() }));
        setShowCalendlyEdit(false);
      }
    } catch { /* non-fatal */ }
    setSavingCalendly(false);
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.companyName?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q);
    const needsAction =
      // No debrief after call
      c.pipeline?.stage === "call_booked" ||
      // Agreement sent but not signed > 3 days
      (c.pipeline?.stage === "agreement_out") ||
      // New lead not yet contacted
      (c.pipeline?.stage === "lead" && c.assignedAt && (Date.now() - new Date(c.assignedAt).getTime()) < 86400000 * 3) ||
      // Follow-up overdue
      (c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate) <= new Date());
    const matchFilter =
      filter === "needs_action" ? needsAction :
      filter === "active"   ? !!c.engagement :
      filter === "pipeline" ? (!c.engagement && !!c.pipeline) :
      filter === "followup" ? (c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate) <= new Date(Date.now()+3*86400000)) : true;
    return matchSearch && matchFilter;
  });
  const needsActionCount = clients.filter(c =>
    c.pipeline?.stage === "call_booked" ||
    c.pipeline?.stage === "agreement_out" ||
    (c.pipeline?.stage === "lead" && c.assignedAt && (Date.now() - new Date(c.assignedAt).getTime()) < 86400000 * 3) ||
    (c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate) <= new Date())
  ).length;

  const activeCount   = clients.filter(c => c.engagement).length;
  const followUpCount = clients.filter(c => c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate) <= new Date(Date.now()+3*86400000)).length;
  const isNewRep = clients.length === 0 && !loading;

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[17px] font-bold text-[#1B3A2D] tracking-tight">Fruxal</span>
            <span className="text-[10px] font-semibold text-[#8E8C85] uppercase tracking-wider bg-[#F0EFEB] px-2 py-0.5 rounded-full">Rep Portal</span>
          </div>
          {rep && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-semibold text-[#1A1A18]">{rep.name}</p>
                <p className="text-[10px] text-[#8E8C85]">{rep.province} · {rep.commission_rate ?? 12}% contingency</p>
                {rep.calendly_url && (
                  <a href={rep.calendly_url} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] text-[#2D7A50] font-semibold hover:underline mt-0.5 block truncate max-w-[180px]">
                    Your booking link
                  </a>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1B3A2D] flex items-center justify-center text-white text-[12px] font-bold">
                {rep.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label:"Clients",          value:clients.length,                            sub:"assigned"    },
            { label:"Active",           value:activeCount,                               sub:"engagements" },
            { label:"Commissions Paid", value:fmtM(rep?.stats?.commissions_paid||0),    sub:"earned"      },
            { label:"Pending",          value:fmtM(rep?.stats?.commissions_pending ?? 0), sub:"to collect"  },
            { label:"Pipeline Value",   value:fmtM(clients.filter((c:any) => c.engagement).reduce((s:number,c:any) => s+(c.annualLeak??0)*((rep?.commission_rate||20)/100),0)), sub:"if all close" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E5E3DD] rounded-xl px-4 py-3" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">{s.label}</p>
              <p className="text-[20px] font-bold text-[#1A1A18] mt-0.5">{s.value}</p>
              <p className="text-[9px] text-[#B5B3AD]">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ═══ CALENDLY SETUP BANNER ═══ */}
        {!rep?.calendly_url && !showCalendlyEdit && (
          <div className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl mb-5"
            style={{ background: "rgba(196,132,29,0.04)", border: "1px solid rgba(196,132,29,0.15)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(196,132,29,0.1)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4841D" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#1A1A18]">Add your Calendly link</p>
              <p className="text-[10px] text-[#8E8C85] mt-0.5">Clients assigned to you will see a booking CTA on their dashboard. Without it, they'll see a placeholder.</p>
            </div>
            <button
              onClick={() => { setCalendlyInput(""); setShowCalendlyEdit(true); }}
              className="shrink-0 h-8 px-4 text-[11px] font-bold text-white rounded-lg transition hover:opacity-90"
              style={{ background: "#C4841D" }}>
              Add Link
            </button>
          </div>
        )}

        {rep?.calendly_url && !showCalendlyEdit && (
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
            style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.12)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span className="text-[11px] text-[#56554F] flex-1 truncate">{rep.calendly_url}</span>
            <button
              onClick={() => { setCalendlyInput(rep.calendly_url || ""); setShowCalendlyEdit(true); }}
              className="text-[10px] font-semibold text-[#2D7A50] hover:underline shrink-0">
              Edit
            </button>
          </div>
        )}

        {showCalendlyEdit && (
          <div className="w-full px-4 py-4 rounded-xl mb-5" style={{ background: "#FAFAF8", border: "1px solid #E5E3DD" }}>
            <p className="text-[11px] font-bold text-[#56554F] uppercase tracking-wider mb-2">Your Calendly Link</p>
            <p className="text-[10px] text-[#8E8C85] mb-3">Clients assigned to you will see a "Book a call" button linking here. Use a link for your Fruxal recovery call type.</p>
            <input
              type="url"
              value={calendlyInput}
              onChange={e => setCalendlyInput(e.target.value)}
              placeholder="https://calendly.com/yourname/fruxal-recovery"
              className="w-full border border-[#E5E3DD] rounded-lg px-3 py-2 text-[12px] text-[#1A1A18] focus:border-[#2D7A50] outline-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={saveCalendly}
                disabled={savingCalendly || !calendlyInput.trim()}
                className="flex-1 h-8 text-[11px] font-bold text-white rounded-lg transition disabled:opacity-40"
                style={{ background: "#1B3A2D" }}>
                {savingCalendly ? "Saving…" : "Save Calendly Link"}
              </button>
              <button
                onClick={() => setShowCalendlyEdit(false)}
                className="px-4 h-8 text-[11px] text-[#8E8C85] border border-[#E5E3DD] rounded-lg hover:bg-[#F5F4F0] transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex gap-2 flex-wrap">
            {[
              { key:"all",      label:`All (${clients.length})`       },
              { key:"active",   label:`Active (${activeCount})`       },
              { key:"pipeline", label:"Pipeline"                      },
              { key:"followup", label:`Follow-up (${followUpCount})`, urgent:followUpCount>0 },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all"
                style={{ background:filter===f.key?"#1B3A2D":"white", color:filter===f.key?"white":(f.urgent?"#C4841D":"#56554F"), borderColor:filter===f.key?"#1B3A2D":(f.urgent?"rgba(196,132,29,0.3)":"#E5E3DD") }}>
                {f.label}
              </button>
            ))}
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients…"
            className="sm:ml-auto text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[#1B3A2D] w-full sm:w-48"/>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[13px] text-[#8E8C85]">{search ? "No clients match." : "No clients assigned yet."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c: any) => {
              const stage = STAGE_LABEL[c.pipeline?.stage||"lead"] || STAGE_LABEL["lead"];
              const hasFollowUp = c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate) <= new Date(Date.now()+3*86400000);
              const daysUntil = c.pipeline?.followUpDate ? Math.ceil((new Date(c.pipeline.followUpDate).getTime()-Date.now())/86400000) : null;
              const isNew = (c.pipeline?.stage === "lead" || c.pipeline?.stage === "contacted") && c.assignedAt && (Date.now() - new Date(c.assignedAt).getTime()) < 86400000 * 2;
              return (
                <button key={c.pipelineId || c.diagnosticId}
                  onClick={() => router.push(`/rep/customer/${c.pipelineId || c.diagnosticId}`)}
                  className="bg-white border border-[#E5E3DD] rounded-xl p-4 text-left hover:border-[#1B3A2D]/30 hover:shadow-md transition-all group"
                  style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A1A18] truncate group-hover:text-[#1B3A2D]">{c.companyName}</p>
                      <p className="text-[10px] text-[#8E8C85] mt-0.5">{c.industry} · {c.province}</p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0" style={{color:stage.color,background:stage.bg}}>{stage.label}</span>{isNew && <span className="text-[9px] font-black px-1.5 py-0.5 rounded ml-1" style={{background:"rgba(45,122,80,0.15)",color:"#2D7A50"}}>NEW</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-[#F0EFEB] rounded-lg px-2.5 py-2">
                      <p className="text-[9px] text-[#8E8C85] uppercase font-semibold">Annual Leak</p>
                      <p className="text-[13px] font-bold text-[#1A1A18]">{fmtM(c.annualLeak)}</p>
                    </div>
                    <div className="bg-[#F0EFEB] rounded-lg px-2.5 py-2">
                      <p className="text-[9px] text-[#8E8C85] uppercase font-semibold">Findings</p>
                      <p className="text-[13px] font-bold text-[#1A1A18]">{c.findingsCount}</p>
                    </div>
                  </div>
                  {c.engagement && <div className="border-t border-[#F0EFEB] pt-2 flex items-center justify-between"><span className="text-[9px] font-semibold text-[#2D7A50] uppercase">Active Engagement</span><span className="text-[9px] text-[#8E8C85]">{c.engagement.feePercentage}% fee</span></div>}
                  {c.pipeline?.stage === "call_booked" && (
                    <div className="border-t border-[#F0EFEB] pt-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C4841D] animate-pulse"/>
                      <span className="text-[9px] font-semibold text-[#C4841D] uppercase">Call Booked</span>
                    </div>
                  )}
                  {!c.engagement && c.pipeline?.stage !== "call_booked" && rep?.calendly_url && (
                    <div className="border-t border-[#F0EFEB] pt-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E5E3DD]"/>
                      <span className="text-[9px] text-[#B5B3AD]">Awaiting booking</span>
                    </div>
                  )}
                  {hasFollowUp && <div className="mt-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#C4841D]"/><p className="text-[9px] font-semibold text-[#C4841D]">{daysUntil!==null&&daysUntil<=0?"Overdue":`Follow-up in ${daysUntil}d`}</p></div>}
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[9px] text-[#B5B3AD]">{new Date(c.assignedAt).toLocaleDateString("en-CA",{month:"short",day:"numeric"})}</p>
                    <span className="text-[10px] font-semibold text-[#1B3A2D] group-hover:underline">Open →</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
