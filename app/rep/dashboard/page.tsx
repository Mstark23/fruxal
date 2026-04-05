"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const fmtM = (n: number) =>
  n >= 1_000_000 ? `$${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n/1_000)}K` : `$${n.toLocaleString()}`;

const STAGE_LABEL: Record<string, { label: string; color: string; bg: string; order: number }> = {
  lead:              { label:"Lead",           color:"#8E8C85", bg:"rgba(142,140,133,0.08)", order:0 },
  contacted:         { label:"Contacted",       color:"#0369a1", bg:"rgba(3,105,161,0.07)",  order:1 },
  diagnostic_sent:   { label:"Diagnostic Sent", color:"#7C3AED", bg:"rgba(124,58,237,0.07)", order:2 },
  call_booked:       { label:"Call Booked",     color:"#C4841D", bg:"rgba(196,132,29,0.08)", order:3 },
  engaged:           { label:"Engaged",         color:"#1B3A2D", bg:"rgba(27,58,45,0.08)",   order:4 },
  in_engagement:     { label:"Active",          color:"#2D7A50", bg:"rgba(45,122,80,0.08)",  order:4 },
  agreement_out:     { label:"Agreement Out",   color:"#7C3AED", bg:"rgba(124,58,237,0.07)", order:3 },
  signed:            { label:"Signed",          color:"#2D7A50", bg:"rgba(45,122,80,0.08)",  order:4 },
  recovery_tracking: { label:"Recovery",        color:"#3D7A5E", bg:"rgba(61,122,94,0.08)",  order:5 },
  fee_collected:     { label:"Fee Collected",   color:"#2D7A50", bg:"rgba(45,122,80,0.08)",  order:6 },
  completed:         { label:"Completed",       color:"#B5B3AD", bg:"rgba(181,179,173,0.08)", order:7 },
};

type SortKey = "newest" | "leak_desc" | "follow_up" | "stage";

export default function RepDashboard() {
  const router = useRouter();
  const [rep,     setRep]     = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");
  const [sort,    setSort]    = useState<SortKey>("newest");
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

  const filtered = useMemo(() => {
    const base = clients.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.companyName?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q);
      const matchFilter =
        filter === "active"   ? !!c.engagement :
        filter === "pipeline" ? (!c.engagement && !!c.pipeline) :
        filter === "followup" ? (c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate) <= new Date(Date.now()+3*86400000)) :
      filter === "atrisk" ? (() => { const d = c.pipeline?.updatedAt ? Math.floor((Date.now()-new Date(c.pipeline.updatedAt).getTime())/86400000) : 0; return d >= 7 && !["completed","fee_collected","lost"].includes(c.pipeline?.stage||""); })() : true;
      return matchSearch && matchFilter;
    });
    // Sort
    return base.sort((a, b) => {
      if (sort === "leak_desc") return (b.annualLeak ?? 0) - (a.annualLeak ?? 0);
      if (sort === "follow_up") {
        const af = a.pipeline?.followUpDate ? new Date(a.pipeline.followUpDate).getTime() : Infinity;
        const bf = b.pipeline?.followUpDate ? new Date(b.pipeline.followUpDate).getTime() : Infinity;
        return af - bf;
      }
      if (sort === "stage") {
        return (STAGE_LABEL[a.pipeline?.stage||"lead"]?.order ?? 0) - (STAGE_LABEL[b.pipeline?.stage||"lead"]?.order ?? 0);
      }
      return new Date(b.assignedAt||0).getTime() - new Date(a.assignedAt||0).getTime();
    });
  }, [clients, search, filter, sort]);

  const activeCount   = clients.filter(c => c.engagement).length;
  const followUpCount = clients.filter(c => c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate) <= new Date(Date.now()+3*86400000)).length;
  const isNewRep = clients.length === 0 && !loading;
  const [industryOpen, setIndustryOpen] = useState(false);

  const industryStats = useMemo(() => {
    const SIGNED_STAGES = new Set(["signed","in_engagement","recovery_tracking","fee_collected","completed"]);
    const map = new Map<string, { total: number; signed: number; leakSum: number }>();
    for (const c of clients) {
      const ind = c.industry || "Other";
      if (!map.has(ind)) map.set(ind, { total: 0, signed: 0, leakSum: 0 });
      const entry = map.get(ind)!;
      entry.total++;
      if (SIGNED_STAGES.has(c.pipeline?.stage || "")) {
        entry.signed++;
        entry.leakSum += c.annualLeak ?? 0;
      }
    }
    return Array.from(map.entries())
      .map(([name, d]) => ({
        name,
        total: d.total,
        signed: d.signed,
        rate: d.total > 0 ? Math.round((d.signed / d.total) * 100) : 0,
        avgDeal: d.signed > 0 ? Math.round(d.leakSum / d.signed) : 0,
      }))
      .sort((a, b) => b.rate - a.rate || b.signed - a.signed);
  }, [clients]);

  // Today's Actions — urgent items the rep should handle right now
  const todayActions = useMemo(() => {
    const actions: { type: string; label: string; sub: string; color: string; clientId: string }[] = [];
    const now = Date.now();
    for (const c of clients) {
      const id = c.pipelineId || c.diagnosticId;
      // Overdue follow-ups
      if (c.pipeline?.followUpDate) {
        const fuDate = new Date(c.pipeline.followUpDate).getTime();
        if (fuDate <= now) {
          actions.push({ type:"overdue", label:`Overdue: ${c.companyName}`, sub:`Follow-up was ${new Date(c.pipeline.followUpDate).toLocaleDateString("en-CA",{month:"short",day:"numeric"})}`, color:"#B34040", clientId:id });
        } else if (fuDate <= now + 86400000) {
          actions.push({ type:"today", label:`Follow up today: ${c.companyName}`, sub:`Scheduled for today`, color:"#C4841D", clientId:id });
        }
      }
      // New leads untouched >2 days
      if ((c.pipeline?.stage === "lead") && c.assignedAt && (now - new Date(c.assignedAt).getTime()) > 86400000 * 2) {
        actions.push({ type:"stale", label:`New lead waiting: ${c.companyName}`, sub:`Assigned ${Math.floor((now - new Date(c.assignedAt).getTime())/86400000)}d ago — no contact yet`, color:"#C4841D", clientId:id });
      }
      // Calls booked (need prep)
      if (c.pipeline?.stage === "call_booked") {
        actions.push({ type:"call", label:`Call booked: ${c.companyName}`, sub:`Prepare call script before dialing`, color:"#0369a1", clientId:id });
      }
      // New assignment (< 24h)
      if (c.assignedAt && (now - new Date(c.assignedAt).getTime()) < 86400000 && c.pipeline?.stage === "lead") {
        actions.push({ type:"new", label:`New client: ${c.companyName}`, sub:`Just assigned — make first contact`, color:"#2D7A50", clientId:id });
      }
    }
    // Priority: overdue > today > stale > call > new
    const priority: Record<string,number> = { overdue:0, today:1, stale:2, call:3, new:4 };
    return actions.sort((a,b) => (priority[a.type]??5) - (priority[b.type]??5));
  }, [clients]);

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-[15px] sm:text-[17px] font-bold text-[#1B3A2D] tracking-tight shrink-0">Fruxal</span>
            <span className="text-[10px] font-semibold text-[#8E8C85] uppercase tracking-wider bg-[#F0EFEB] px-2 py-0.5 rounded-full shrink-0">Rep Portal</span>
            <div className="hidden sm:flex items-center gap-1 ml-2">
              <button onClick={() => router.push("/rep/commissions")}
                className="text-[11px] font-semibold px-3 py-1 rounded-lg hover:bg-[#F0EFEB] transition"
                style={{ color: "#1B3A2D" }}>
                Commissions
              </button>
              <button onClick={() => router.push("/rep/training/learn")}
                className="text-[11px] font-semibold px-3 py-1 rounded-lg hover:bg-[#F0EFEB] transition"
                style={{ color: "#1B3A2D" }}>
                Learn
              </button>
              <button onClick={() => router.push("/rep/training/playbook")}
                className="text-[11px] font-semibold px-3 py-1 rounded-lg hover:bg-[#F0EFEB] transition"
                style={{ color: "#1B3A2D" }}>
                Playbook
              </button>
              <button onClick={() => router.push("/rep/training")}
                className="text-[11px] font-semibold px-3 py-1 rounded-lg hover:bg-[#F0EFEB] transition"
                style={{ color: "#1B3A2D" }}>
                Drill
              </button>
              <button onClick={() => router.push("/rep/scripts")}
                className="text-[11px] font-semibold px-3 py-1 rounded-lg hover:bg-[#F0EFEB] transition"
                style={{ color: "#1B3A2D" }}>
                Scripts
              </button>
            </div>
          </div>
          {rep && (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-semibold text-[#1A1A18]">{rep.name}</p>
                <p className="text-[10px] text-[#8E8C85]">{rep.province || "—"} · {rep.commission_rate ?? 12}% contingency</p>
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

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Mobile greeting — visible only on small screens where sidebar is hidden */}
        {rep && (
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <div>
              <p className="text-[15px] font-bold text-[#1A1A18]">Hey {rep.name?.split(" ")[0]}</p>
              <p className="text-[11px] text-[#8E8C85]">{rep.province || "—"} · {rep.commission_rate ?? 12}% contingency</p>
            </div>
            {rep.calendly_url ? (
              <a href={rep.calendly_url} target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-semibold text-[#2D7A50] bg-[rgba(45,122,80,0.08)] px-3 py-1.5 rounded-lg">
                Booking link
              </a>
            ) : (
              <button onClick={() => { setCalendlyInput(""); setShowCalendlyEdit(true); }}
                className="text-[10px] font-semibold text-[#C4841D] bg-[rgba(196,132,29,0.08)] px-3 py-1.5 rounded-lg">
                + Calendly
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
          {[
            { label:"Clients",          value:clients.length,                            sub:"assigned"    },
            { label:"Active",           value:activeCount,                               sub:"engagements" },
            { label:"Commissions Paid", value:fmtM(rep?.stats?.commissions_paid||0),    sub:"earned"      },
            { label:"Pending",          value:fmtM(rep?.stats?.commissions_pending ?? 0), sub:"to collect"  },
            { label:"Conversion",      value: clients.length > 0 ? `${Math.round((activeCount / clients.length) * 100)}%` : "—", sub:"engaged rate" },
            { label:"Pipeline Value",   value:fmtM(clients.filter((c:any) => c.engagement).reduce((s:number,c:any) => s+(c.annualLeak??0)*((rep?.commission_rate??12)/100),0)), sub:"if all close" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E5E3DD] rounded-xl px-4 py-3" style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">{s.label}</p>
              <p className="text-[20px] font-bold text-[#1A1A18] mt-0.5">{s.value}</p>
              <p className="text-[9px] text-[#B5B3AD]">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ═══ TODAY'S ACTIONS ═══ */}
        {todayActions.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">Today&apos;s Actions</p>
            <div className="space-y-1.5">
              {todayActions.slice(0, 6).map((a, i) => (
                <button key={i} onClick={() => router.push(`/rep/customer/${a.clientId}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-[#E5E3DD] hover:border-[#1B3A2D]/30 hover:shadow-sm transition-all text-left group"
                  style={{ boxShadow:"0 1px 2px rgba(0,0,0,0.02)" }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#1A1A18] truncate group-hover:text-[#1B3A2D]">{a.label}</p>
                    <p className="text-[10px] text-[#8E8C85]">{a.sub}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#1B3A2D] shrink-0 opacity-0 group-hover:opacity-100 transition">Open →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ INDUSTRY PERFORMANCE ═══ */}
        {industryStats.length > 1 && (
          <div className="mb-5">
            <button onClick={() => setIndustryOpen(o => !o)}
              className="flex items-center gap-2 text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2 hover:text-[#56554F] transition-colors">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ transform: industryOpen ? "rotate(90deg)" : "rotate(0deg)", transition:"transform 0.15s" }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              Industry Performance
            </button>
            {industryOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {industryStats.map(ind => (
                  <div key={ind.name} className="bg-white border border-[#E5E3DD] rounded-xl px-4 py-3" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[11px] font-semibold text-[#1A1A18] truncate">{ind.name}</p>
                      <span className="text-[10px] font-bold shrink-0 ml-2"
                        style={{ color: ind.rate >= 50 ? "#2D7A50" : ind.rate >= 25 ? "#C4841D" : "#8E8C85" }}>
                        {ind.rate}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F0EFEB] rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(ind.rate, 3)}%`, background: ind.rate >= 50 ? "#2D7A50" : ind.rate >= 25 ? "#C4841D" : "#B5B3AD" }} />
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-[#8E8C85]">
                      <span>{ind.total} client{ind.total !== 1 ? "s" : ""}</span>
                      <span>{ind.signed} signed</span>
                      {ind.avgDeal > 0 && <span className="ml-auto font-semibold text-[#56554F]">Avg {fmtM(ind.avgDeal)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ MY STATS ═══ */}
        {/* Stats section removed — available at /v2/stats */}

        {/* ═══ CALENDLY SETUP BANNER ═══ */}
        {!rep?.calendly_url && !showCalendlyEdit && (
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-xl mb-5"
            style={{ background: "rgba(196,132,29,0.04)", border: "1px solid rgba(196,132,29,0.15)" }}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(196,132,29,0.1)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4841D" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#1A1A18]">Add your Calendly link</p>
                <p className="text-[10px] text-[#8E8C85] mt-0.5">Clients will see a booking CTA on their dashboard.</p>
              </div>
            </div>
            <button
              onClick={() => { setCalendlyInput(""); setShowCalendlyEdit(true); }}
              className="shrink-0 h-9 px-4 text-[11px] font-bold text-white rounded-lg transition hover:opacity-90 w-full sm:w-auto"
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
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap scrollbar-hide">
            {[
              { key:"all",      label:`All (${clients.length})`       },
              { key:"active",   label:`Active (${activeCount})`       },
              { key:"pipeline", label:"Pipeline"                      },
              { key:"followup", label:`Follow-up (${followUpCount})`, urgent:followUpCount>0 },
              { key:"atrisk",   label:`At Risk (${clients.filter(c => { const d = c.pipeline?.updatedAt ? Math.floor((Date.now()-new Date(c.pipeline.updatedAt).getTime())/86400000) : 0; return d >= 7 && !["completed","fee_collected","lost"].includes(c.pipeline?.stage||""); }).length})`, urgent:true },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0 min-h-[32px]"
                style={{ background:filter===f.key?"#1B3A2D":"white", color:filter===f.key?"white":(f.urgent?"#C4841D":"#56554F"), borderColor:filter===f.key?"#1B3A2D":(f.urgent?"rgba(196,132,29,0.3)":"#E5E3DD") }}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
              className="text-[10px] font-semibold border border-[#E5E3DD] rounded-lg px-2 py-1.5 bg-white text-[#56554F] focus:outline-none focus:border-[#1B3A2D] cursor-pointer min-h-[36px] shrink-0">
              <option value="newest">Newest first</option>
              <option value="leak_desc">Biggest leak</option>
              <option value="follow_up">Follow-up date</option>
              <option value="stage">Pipeline stage</option>
            </select>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients…"
              className="text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[#1B3A2D] w-full sm:w-48 min-h-[36px]"/>
          </div>
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
              // Risk indicators
              const daysSinceUpdate = c.pipeline?.updatedAt ? Math.floor((Date.now() - new Date(c.pipeline.updatedAt).getTime()) / 86400000) : null;
              const daysSinceAssign = c.assignedAt ? Math.floor((Date.now() - new Date(c.assignedAt).getTime()) / 86400000) : 0;
              const isStalled = daysSinceUpdate !== null && daysSinceUpdate >= 14 && !["completed","fee_collected","lost"].includes(c.pipeline?.stage||"");
              const isGoingCold = daysSinceUpdate !== null && daysSinceUpdate >= 7 && daysSinceUpdate < 14;
              const isOverdueFollowUp = c.pipeline?.followUpDate && new Date(c.pipeline.followUpDate).getTime() < Date.now();

              // Progress bar
              const confirmed = c.engagement?.confirmedSavings || 0;
              const potential = c.annualLeak ?? 0;
              const progressPct = potential > 0 ? Math.min(100, Math.round((confirmed / potential) * 100)) : 0;

              // AI summary line
              const topLeakHint = c.findingsCount > 0 ? `${c.findingsCount} findings` : "No scan yet";
              const lastContactDays = daysSinceUpdate ?? daysSinceAssign;
              const summaryLine = `${c.industry || "Business"}, ${fmtM(c.annualLeak ?? 0)} leak, ${topLeakHint}, last activity ${lastContactDays}d ago`;

              return (
                <div key={c.pipelineId || c.diagnosticId}
                  onClick={() => router.push(`/rep/customer/${c.pipelineId || c.diagnosticId}`)}
                  className="bg-white border rounded-xl p-4 text-left hover:shadow-md transition-all group relative cursor-pointer active:scale-[0.99]"
                  style={{boxShadow:"0 1px 3px rgba(0,0,0,0.03)", borderColor: isStalled ? "rgba(179,64,64,0.3)" : isGoingCold ? "rgba(196,132,29,0.25)" : "#E5E3DD"}}>

                  {/* Risk badge */}
                  {isStalled && <div className="absolute -top-2 right-3 text-[8px] font-black px-2 py-0.5 rounded-full bg-[#B34040] text-white uppercase tracking-wider">Stalled {daysSinceUpdate}d</div>}
                  {!isStalled && isGoingCold && <div className="absolute -top-2 right-3 text-[8px] font-black px-2 py-0.5 rounded-full bg-[#C4841D] text-white uppercase tracking-wider">Going cold</div>}
                  {isOverdueFollowUp && !isStalled && <div className="absolute -top-2 left-3 text-[8px] font-black px-2 py-0.5 rounded-full bg-[#B34040] text-white uppercase tracking-wider">Overdue</div>}

                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A1A18] truncate group-hover:text-[#1B3A2D]">{c.companyName}</p>
                      <p className="text-[10px] text-[#8E8C85] mt-0.5 line-clamp-2 sm:line-clamp-1">{summaryLine}</p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0" style={{color:stage.color,background:stage.bg}}>{stage.label}</span>{isNew && <span className="text-[9px] font-black px-1.5 py-0.5 rounded ml-1" style={{background:"rgba(45,122,80,0.15)",color:"#2D7A50"}}>NEW</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-[#F0EFEB] rounded-lg px-2.5 py-2">
                      <p className="text-[9px] text-[#8E8C85] uppercase font-semibold">Annual Leak</p>
                      <p className="text-[13px] font-bold text-[#1A1A18]">{fmtM(c.annualLeak ?? 0)}</p>
                    </div>
                    <div className="bg-[#F0EFEB] rounded-lg px-2.5 py-2">
                      <p className="text-[9px] text-[#8E8C85] uppercase font-semibold">Findings</p>
                      <p className="text-[13px] font-bold text-[#1A1A18]">{c.findingsCount}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {c.engagement && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-semibold text-[#2D7A50] uppercase">Recovery: {fmtM(confirmed)}</span>
                        <span className="text-[9px] text-[#8E8C85]">{progressPct}% of {fmtM(potential)}</span>
                      </div>
                      <div className="h-1.5 bg-[#F0EFEB] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: progressPct >= 50 ? "#2D7A50" : progressPct >= 20 ? "#C4841D" : "#E5E3DD" }} />
                      </div>
                    </div>
                  )}

                  {!c.engagement && c.pipeline?.stage === "call_booked" && (
                    <div className="border-t border-[#F0EFEB] pt-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C4841D] animate-pulse"/>
                      <span className="text-[9px] font-semibold text-[#C4841D] uppercase">Call Booked</span>
                    </div>
                  )}

                  {hasFollowUp && <div className="mt-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#C4841D]"/><p className="text-[9px] font-semibold text-[#C4841D]">{daysUntil!==null&&daysUntil<=0?"Overdue":`Follow-up in ${daysUntil}d`}</p></div>}

                  {/* Quick actions */}
                  <div className="mt-3 pt-2 border-t border-[#F0EFEB] flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {c.pipeline?.contactEmail && (
                        <a href={`mailto:${c.pipeline.contactEmail}?subject=${encodeURIComponent(`Following up — ${c.companyName}`)}`}
                          onClick={e => e.stopPropagation()}
                          className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg bg-[#F0EFEB] flex items-center justify-center hover:bg-[#E5E3DD] transition" title="Email">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#56554F" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>
                        </a>
                      )}
                      {c.pipeline?.contactPhone && (
                        <a href={`tel:${c.pipeline.contactPhone}`}
                          onClick={e => e.stopPropagation()}
                          className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg bg-[#F0EFEB] flex items-center justify-center hover:bg-[#E5E3DD] transition" title="Call">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#56554F" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.09 5.18 2 2 0 015.11 3h3a2 2 0 012 1.72c.13.81.36 1.6.68 2.35a2 2 0 01-.45 2.11L8.09 11.5a16 16 0 006.41 6.41l2.32-2.32a2 2 0 012.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0122 16.92z"/></svg>
                        </a>
                      )}
                      {rep?.calendly_url && (
                        <a href={rep.calendly_url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg bg-[#F0EFEB] flex items-center justify-center hover:bg-[#E5E3DD] transition" title="Book call">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#56554F" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </a>
                      )}
                    </div>
                    <button onClick={() => router.push(`/rep/customer/${c.pipelineId || c.diagnosticId}`)}
                      className="text-[10px] font-semibold text-[#1B3A2D] group-hover:underline">Open →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
