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
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/rep/me").then(r => r.json()).catch(() => ({})),
      fetch("/api/rep/pipeline").then(r => r.json()),
    ]).then(([meData, plData]) => {
      if (meData?.success) setRep(meData.rep);
      if (plData?.success) setClients(plData.clients || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.companyName?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q);
    const matchFilter =
      filter === "active"   ? !!c.engagement :
      filter === "pipeline" ? (!c.engagement && !!c.pipeline) :
      filter === "followup" ? (c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate) <= new Date(Date.now()+3*86400000)) : true;
    return matchSearch && matchFilter;
  });

  const activeCount   = clients.filter(c => c.engagement).length;
  const followUpCount = clients.filter(c => c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate) <= new Date(Date.now()+3*86400000)).length;

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
                <p className="text-[10px] text-[#8E8C85]">{rep.province} · {rep.commission_rate}% commission</p>
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
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E5E3DD] rounded-xl px-4 py-3" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">{s.label}</p>
              <p className="text-[20px] font-bold text-[#1A1A18] mt-0.5">{s.value}</p>
              <p className="text-[9px] text-[#B5B3AD]">{s.sub}</p>
            </div>
          ))}
        </div>

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
              return (
                <button key={c.diagnosticId}
                  onClick={() => router.push(`/rep/customer/${c.diagnosticId}`)}
                  className="bg-white border border-[#E5E3DD] rounded-xl p-4 text-left hover:border-[#1B3A2D]/30 hover:shadow-md transition-all group"
                  style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A1A18] truncate group-hover:text-[#1B3A2D]">{c.companyName}</p>
                      <p className="text-[10px] text-[#8E8C85] mt-0.5">{c.industry} · {c.province}</p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0" style={{color:stage.color,background:stage.bg}}>{stage.label}</span>
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
