// =============================================================================
// app/accountant/dashboard/page.tsx
// Queue-based accountant dashboard. Works like a support ticket system.
// Accountant sees their assigned findings, picks one, executes it, marks done.
// =============================================================================
"use client";
import React, { useState, useEffect, useCallback } from "react";

function fmtM(n: number) {
  return n >= 1_000_000 ? "$" + (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000 ? "$" + Math.round(n / 1_000) + "K"
    : "$" + n.toLocaleString();
}

const SEV: Record<string, { dot: string; bg: string; text: string }> = {
  critical: { dot: "#B34040", bg: "rgba(179,64,64,0.07)",   text: "#B34040" },
  high:     { dot: "#C4841D", bg: "rgba(196,132,29,0.07)",  text: "#C4841D" },
  medium:   { dot: "#0369a1", bg: "rgba(3,105,161,0.07)",   text: "#0369a1" },
  low:      { dot: "#8E8C85", bg: "rgba(142,140,133,0.07)", text: "#8E8C85" },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  queued:      { label: "Queued",      color: "#8E8C85", bg: "rgba(142,140,133,0.08)" },
  in_progress: { label: "In Progress", color: "#C4841D", bg: "rgba(196,132,29,0.08)" },
  submitted:   { label: "Submitted",   color: "#0369a1", bg: "rgba(3,105,161,0.08)"  },
  confirmed:   { label: "Confirmed ✓", color: "#2D7A50", bg: "rgba(45,122,80,0.08)"  },
};

type StatusFilter = "all" | "queued" | "in_progress" | "submitted" | "confirmed";

export default function AccountantDashboard() {
  const [accountant, setAccountant] = useState<any>(null);
  const [playbooks,  setPlaybooks]  = useState<any[]>([]);
  const [summary,    setSummary]    = useState<any>({});
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<StatusFilter>("queued");
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [saving,     setSaving]     = useState<string | null>(null);
  const [confirmAmounts, setConfirmAmounts] = useState<Record<string, string>>({});
  const [notes,      setNotes]      = useState<Record<string, string>>({});
  const [copied,     setCopied]     = useState<string | null>(null);

  const load = useCallback(async () => {
    const [me, queue] = await Promise.all([
      fetch("/api/accountant/me").then(r => r.json()).catch(() => ({})),
      fetch("/api/accountant/queue").then(r => r.json()).catch(() => ({})),
    ]);
    if (me?.success)    setAccountant(me.accountant);
    if (queue?.success) { setPlaybooks(queue.playbooks || []); setSummary(queue.summary || {}); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(pbId: string, status: string, confirmedAmount?: number) {
    setSaving(pbId);
    await fetch("/api/accountant/queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playbook_id: pbId, status, notes: notes[pbId], confirmed_amount: confirmedAmount }),
    });
    await load();
    setSaving(null);
  }

  function copy(text: string, id: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2500);
    });
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );

  if (!accountant) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E8E6E1] rounded-2xl p-8 max-w-sm w-full text-center">
        <p className="font-semibold text-[#1A1A18] mb-2">Access required</p>
        <p className="text-sm text-[#8E8C85]">Ask your admin to set up your accountant account.</p>
      </div>
    </div>
  );

  const filtered = filter === "all" ? playbooks : playbooks.filter(p => p.status === filter);
  const quickWins = playbooks.filter(p => p.quick_win && p.status === "queued");

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* Top bar */}
      <div className="bg-white border-b border-[#E8E6E1]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[7px] bg-[#1B3A2D] flex items-center justify-center">
              <span className="text-white font-black text-[11px]">F</span>
            </div>
            <div>
              <span className="text-[14px] font-bold text-[#1A1A18]">{accountant.name}</span>
              <span className="ml-2 text-[11px] font-semibold text-[#8E8C85] uppercase tracking-wider">Accountant</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[16px] font-bold text-[#1A1A18]">{summary.queue || 0}</div>
              <div className="text-[10px] text-[#8E8C85]">In queue</div>
            </div>
            <div>
              <div className="text-[16px] font-bold text-[#2D7A50]">{fmtM(accountant.stats?.total_confirmed || 0)}</div>
              <div className="text-[10px] text-[#8E8C85]">Total confirmed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Queued",      val: summary.queued      || 0, color: "#8E8C85" },
            { label: "In Progress", val: summary.in_progress || 0, color: "#C4841D" },
            { label: "Submitted",   val: summary.submitted   || 0, color: "#0369a1" },
            { label: "Confirmed",   val: summary.confirmed   || 0, color: "#2D7A50" },
          ].map(kpi => (
            <div key={kpi.label}
              onClick={() => setFilter(kpi.label.toLowerCase().replace(" ", "_") as StatusFilter)}
              className="bg-white border border-[#E8E6E1] rounded-xl px-4 py-3 cursor-pointer hover:shadow-sm transition"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", borderColor: filter === kpi.label.toLowerCase().replace(" ", "_") ? kpi.color + "44" : undefined }}>
              <div className="text-[24px] font-bold" style={{ color: kpi.color }}>{kpi.val}</div>
              <div className="text-[11px] text-[#8E8C85] mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Quick wins banner */}
        {quickWins.length > 0 && filter !== "confirmed" && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
            style={{ background: "rgba(45,122,80,0.05)", border: "1px solid rgba(45,122,80,0.15)" }}>
            <span className="text-[16px]">⚡</span>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-[#1B3A2D]">
                {quickWins.length} quick win{quickWins.length !== 1 ? "s" : ""} — action these first
              </p>
              <p className="text-[11px] text-[#56554F]">Low effort, high impact. Can be done this week.</p>
            </div>
            <button onClick={() => setFilter("queued")}
              className="text-[11px] font-bold text-[#1B3A2D] hover:underline">View →</button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4">
          {(["all","queued","in_progress","submitted","confirmed"] as StatusFilter[]).map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-lg transition"
              style={{
                background: filter === f ? "#1B3A2D" : "white",
                color:      filter === f ? "white"   : "#8E8C85",
                border:     filter === f ? "none"    : "1px solid #E8E6E1",
              }}>
              {f === "all" ? `All (${playbooks.length})` : f.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="bg-white border border-[#E8E6E1] rounded-xl px-6 py-10 text-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <p className="text-[13px] font-semibold text-[#1A1A18] mb-1">
              {filter === "queued" ? "Queue is empty" : `No ${filter.replace("_"," ")} items`}
            </p>
            <p className="text-[11px] text-[#8E8C85]">
              {filter === "queued" ? "No new findings assigned yet. Check back soon." : "Switch to another tab to see items."}
            </p>
          </div>
        )}

        {/* Playbook cards */}
        <div className="space-y-2">
          {filtered.map((pb: any) => {
            const sev     = SEV[pb.severity]    || SEV.low;
            const sm      = STATUS_META[pb.status] || STATUS_META.queued;
            const isOpen  = expanded === pb.id;
            const confVal = confirmAmounts[pb.id] ?? "";

            return (
              <div key={pb.id} className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

                {/* Header row */}
                <div className="px-5 py-4 flex items-start gap-3">
                  {/* Severity dot */}
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: sev.dot }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[13px] font-semibold text-[#1A1A18]">{pb.finding_title}</span>
                      {pb.quick_win && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(45,122,80,0.08)", color: "#2D7A50" }}>⚡</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#8E8C85] flex-wrap">
                      <span className="font-semibold">{pb.company_name}</span>
                      <span>·</span>
                      <span>{pb.category}</span>
                      {pb.estimated_hours && <><span>·</span><span>~{pb.estimated_hours}h</span></>}
                      <span>·</span>
                      <span className="font-semibold" style={{ color: sm.color }}>{sm.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[14px] font-bold text-[#B34040]">{fmtM(pb.amount_recoverable)}</div>
                      {pb.confirmed_amount > 0 && (
                        <div className="text-[11px] font-semibold text-[#2D7A50]">✓ {fmtM(pb.confirmed_amount)}</div>
                      )}
                    </div>
                    <button onClick={() => setExpanded(isOpen ? null : pb.id)}
                      className="text-[12px] text-[#B5B3AD] px-1 hover:text-[#1B3A2D] transition">
                      {isOpen ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* Quick action buttons — always visible */}
                {!isOpen && pb.status === "queued" && (
                  <div className="px-5 pb-3 flex gap-2">
                    <button onClick={() => updateStatus(pb.id, "in_progress")}
                      disabled={saving === pb.id}
                      className="h-7 px-3 text-[11px] font-bold text-white rounded-lg disabled:opacity-50 transition hover:opacity-90"
                      style={{ background: "#C4841D" }}>
                      {saving === pb.id ? "…" : "Start →"}
                    </button>
                    <button onClick={() => setExpanded(pb.id)}
                      className="h-7 px-3 text-[11px] font-medium text-[#8E8C85] border border-[#E8E6E1] rounded-lg hover:bg-[#FAFAF8] transition">
                      See steps
                    </button>
                  </div>
                )}

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-[#F0EFEB] px-5 py-4 space-y-4">

                    {/* Client context */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                      style={{ background: "#FAFAF8", border: "1px solid #F0EFEB" }}>
                      <div className="flex-1">
                        <span className="text-[12px] font-semibold text-[#1A1A18]">{pb.company_name}</span>
                        {pb.contact_name && <span className="text-[11px] text-[#8E8C85] ml-2">· {pb.contact_name}</span>}
                      </div>
                      {pb.rep_name && <span className="text-[11px] text-[#8E8C85]">Rep: {pb.rep_name}</span>}
                    </div>

                    {/* Execution steps */}
                    {pb.execution_steps?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">Steps</p>
                        <div className="space-y-2">
                          {pb.execution_steps.map((step: string, i: number) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
                                style={{ background: "rgba(27,58,45,0.08)", color: "#1B3A2D" }}>{i + 1}</span>
                              <p className="text-[12px] text-[#3A3935] leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {/* Documents */}
                      {pb.documents_needed?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Documents Needed</p>
                          {pb.documents_needed.map((d: string, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-[12px] text-[#3A3935] mb-1">
                              <div className="w-1 h-1 rounded-full bg-[#C5C2BB]" />
                              {d}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* CRA forms */}
                      {pb.cra_forms?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">CRA Forms</p>
                          <div className="flex flex-wrap gap-1">
                            {pb.cra_forms.map((f: string, i: number) => (
                              <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(3,105,161,0.07)", color: "#0369a1" }}>{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Draft template */}
                    {pb.draft_template && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Draft Template</p>
                          <button onClick={() => copy(pb.draft_template, pb.id)}
                            className="text-[11px] font-semibold transition"
                            style={{ color: copied === pb.id ? "#2D7A50" : "#1B3A2D" }}>
                            {copied === pb.id ? "✓ Copied" : "Copy"}
                          </button>
                        </div>
                        <div className="bg-[#FAFAF8] border border-[#E8E6E1] rounded-xl px-4 py-3 max-h-44 overflow-y-auto">
                          <pre className="text-[11px] text-[#3A3935] whitespace-pre-wrap font-sans leading-relaxed">
                            {pb.draft_template}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Notes</label>
                      <textarea
                        value={notes[pb.id] ?? (pb.notes || "")}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setNotes(prev => ({ ...prev, [pb.id]: e.target.value }))}
                        rows={2}
                        placeholder="Progress, blockers, CRA reference numbers…"
                        className="w-full text-[12px] border border-[#E8E6E1] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#F0EFEB]">
                      {pb.status === "queued" && (
                        <button onClick={() => updateStatus(pb.id, "in_progress")}
                          disabled={saving === pb.id}
                          className="h-8 px-4 text-[11px] font-bold text-white rounded-lg disabled:opacity-50 transition"
                          style={{ background: "#C4841D" }}>
                          {saving === pb.id ? "Saving…" : "Start Working →"}
                        </button>
                      )}
                      {pb.status === "in_progress" && (
                        <button onClick={() => updateStatus(pb.id, "submitted")}
                          disabled={saving === pb.id}
                          className="h-8 px-4 text-[11px] font-bold text-white rounded-lg disabled:opacity-50 transition"
                          style={{ background: "#0369a1" }}>
                          {saving === pb.id ? "Saving…" : "Mark Submitted →"}
                        </button>
                      )}
                      {(pb.status === "in_progress" || pb.status === "submitted") && (
                        <div className="flex items-center gap-2">
                          <input type="number" value={confVal}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setConfirmAmounts(prev => ({ ...prev, [pb.id]: e.target.value }))}
                            placeholder="Confirmed $"
                            className="h-8 w-28 text-[12px] border border-[#E8E6E1] rounded-lg px-2.5 focus:outline-none" />
                          <button
                            onClick={() => {
                              const amt = parseFloat(confVal);
                              if (!isNaN(amt)) updateStatus(pb.id, "confirmed", amt);
                            }}
                            disabled={saving === pb.id || !confVal}
                            className="h-8 px-4 text-[11px] font-bold text-white rounded-lg disabled:opacity-50 transition"
                            style={{ background: "#2D7A50" }}>
                            Confirm ✓
                          </button>
                        </div>
                      )}
                      {pb.status !== "queued" && (
                        <button
                          onClick={() => updateStatus(pb.id, pb.status)}
                          disabled={saving === pb.id}
                          className="h-8 px-3 text-[11px] font-medium text-[#8E8C85] border border-[#E8E6E1] rounded-lg hover:bg-[#F8F7F5] transition">
                          Save notes
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer confirmed total */}
        {summary.confirmed > 0 && (
          <div className="mt-5 px-5 py-4 bg-white border border-[#E8E6E1] rounded-xl flex items-center justify-between"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div>
              <p className="text-[11px] text-[#8E8C85] uppercase font-bold tracking-wider">Your confirmed recovery</p>
              <p className="text-[13px] text-[#56554F] mt-0.5">{summary.confirmed} finding{summary.confirmed !== 1 ? "s" : ""} completed</p>
            </div>
            <div className="text-right">
              <div className="font-serif text-[22px] font-bold text-[#2D7A50]">{fmtM(summary.total_confirmed || 0)}</div>
              <div className="text-[11px] text-[#8E8C85]">Fruxal fee: {fmtM(Math.round((summary.total_confirmed || 0) * 0.12))}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
