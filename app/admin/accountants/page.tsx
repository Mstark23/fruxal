// =============================================================================
// app/admin/accountants/page.tsx
// Admin workload view: all accountants, their queues, unassigned findings.
// Admin can assign findings to accountants from here.
// =============================================================================
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

function fmtM(n: number) {
  return n >= 1_000_000 ? "$" + (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000 ? "$" + Math.round(n / 1_000) + "K"
    : "$" + n.toLocaleString();
}

const SEV: Record<string, string> = {
  critical: "#B34040", high: "#C4841D", medium: "#0369a1", low: "#8E8C85",
};

export default function AdminAccountantsPage() {
  const [data,        setData]        = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState<string[]>([]);
  const [assigning,   setAssigning]   = useState(false);
  const [filterAcct,  setFilterAcct]  = useState<string>("all");
  const [tab,         setTab]         = useState<"workload"|"add">("workload");
  const [newName,     setNewName]     = useState("");
  const [newEmail,    setNewEmail]    = useState("");
  const [newProvince, setNewProvince] = useState("");
  const [addSaving,   setAddSaving]   = useState(false);
  const [addDone,     setAddDone]     = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState("");
  const [sendingLink, setSendingLink] = useState<string | null>(null);
  const [linkSent,    setLinkSent]    = useState<string | null>(null);

  async function sendLink(accountantId: string) {
    setSendingLink(accountantId);
    await fetch("/api/admin/accountants/send-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountant_id: accountantId }),
    });
    setLinkSent(accountantId);
    setSendingLink(null);
    setTimeout(() => setLinkSent(null), 3000);
  }

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/accountants/workload").then(r => r.json()).catch(() => ({}));
    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function assign(accountantId: string) {
    if (!selected.length) return;
    setAssigning(true);
    await fetch("/api/admin/accountants/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playbook_ids: selected, accountant_id: accountantId }),
    });
    setSelected([]);
    await load();
    setAssigning(false);
  }

  async function addAccountant() {
    if (!newName || !newEmail) return;
    setAddSaving(true);
    await fetch("/api/admin/accountants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, email: newEmail, province: newProvince }),
    });
    setAddDone(true);
    setAddSaving(false);
    setNewName(""); setNewEmail(""); setNewProvince("");
    await load();
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );

  const accountants: any[] = data?.accountants || [];
  const allPlaybooks: any[] = data?.playbooks || [];
  const summary             = data?.summary || {};
  const unassigned          = allPlaybooks.filter((p: any) => !p.assigned_to);
  const displayPlaybooks    = filterAcct === "all" ? allPlaybooks
    : filterAcct === "unassigned" ? unassigned
    : allPlaybooks.filter((p: any) => p.assigned_to === filterAcct);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdminNav />

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-[22px] font-bold text-[#1A1A18]">Accountants</h1>
          <div className="flex gap-2">
            <button onClick={async () => {
              setBackfilling(true);
              const res = await fetch("/api/admin/backfill-playbooks", { method: "POST" }).then(r => r.json());
              setBackfillMsg(res.message || (res.success ? "Done" : res.error));
              setBackfilling(false);
            }} disabled={backfilling}
              className="h-8 px-4 text-[12px] font-medium border border-[#E8E6E1] rounded-lg text-[#8E8C85] hover:bg-[#F8F7F5] transition disabled:opacity-50">
              {backfilling ? "Running…" : "Backfill playbooks"}
            </button>
            {backfillMsg && <span className="text-[11px] text-[#2D7A50]">{backfillMsg}</span>}
            {["workload","add"].map(t => (
              <button key={t} onClick={() => setTab(t as any)}
                className="h-8 px-4 text-[12px] font-semibold rounded-lg transition"
                style={{
                  background: tab === t ? "#1B3A2D" : "white",
                  color:      tab === t ? "white"   : "#8E8C85",
                  border:     tab === t ? "none"    : "1px solid #E8E6E1",
                }}>
                {t === "workload" ? "Workload" : "+ Add accountant"}
              </button>
            ))}
          </div>
        </div>

        {tab === "add" && (
          <div className="bg-white border border-[#E8E6E1] rounded-xl px-5 py-5 mb-6 max-w-md"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            {addDone && (
              <div className="flex items-center gap-2 mb-4 text-[#2D7A50]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-[12px] font-semibold">Accountant added. They can log in with a magic link.</span>
              </div>
            )}
            <p className="text-[11px] font-bold text-[#8E8C85] uppercase tracking-wider mb-4">New Accountant</p>
            <div className="space-y-3">
              {[
                { label: "Name", val: newName, set: setNewName, placeholder: "Jane Smith" },
                { label: "Email", val: newEmail, set: setNewEmail, placeholder: "jane@firm.com" },
                { label: "Province", val: newProvince, set: setNewProvince, placeholder: "QC" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[11px] font-semibold text-[#8E8C85] mb-1">{f.label}</label>
                  <input value={f.val} onChange={(e: React.ChangeEvent<HTMLInputElement>) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full text-[12px] border border-[#E8E6E1] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20" />
                </div>
              ))}
              <button onClick={addAccountant} disabled={!newName || !newEmail || addSaving}
                className="w-full py-2.5 rounded-lg text-[12px] font-bold text-white disabled:opacity-40 transition"
                style={{ background: "#1B3A2D" }}>
                {addSaving ? "Saving…" : "Add Accountant →"}
              </button>
            </div>
          </div>
        )}

        {tab === "workload" && (
          <>
            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Total findings",  val: fmtM(summary.total_value || 0),     sub: `${summary.total || 0} items` },
                { label: "Unassigned",      val: String(summary.unassigned || 0),     sub: "need assignment",  warn: (summary.unassigned || 0) > 0 },
                { label: "In progress",     val: String(summary.by_status?.in_progress || 0), sub: "being worked" },
                { label: "Confirmed",       val: fmtM(summary.confirmed_value || 0),  sub: `${summary.by_status?.confirmed || 0} findings` },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-[#E8E6E1] rounded-xl px-4 py-3"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", borderColor: kpi.warn ? "rgba(179,64,64,0.3)" : undefined }}>
                  <div className="text-[20px] font-bold" style={{ color: kpi.warn ? "#B34040" : "#1A1A18" }}>{kpi.val}</div>
                  <div className="text-[11px] text-[#8E8C85] mt-0.5">{kpi.label}</div>
                  <div className="text-[10px]" style={{ color: kpi.warn ? "#B34040" : "#B5B3AD" }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Accountant cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {accountants.map((a: any) => (
                <div key={a.id} className="bg-white border border-[#E8E6E1] rounded-xl px-4 py-4"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)", borderColor: filterAcct === a.id ? "rgba(27,58,45,0.3)" : undefined }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                      style={{ background: "#1B3A2D" }}>
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A1A18] truncate">{a.name}</p>
                      <p className="text-[11px] text-[#8E8C85]">{a.province || "—"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Queue", val: (a.stats?.queued || 0) + (a.stats?.in_progress || 0), color: "#C4841D" },
                      { label: "Done", val: a.stats?.confirmed || 0, color: "#2D7A50" },
                      { label: "Value", val: fmtM(a.stats?.confirmed_value || 0), color: "#1B3A2D" },
                    ].map(s => (
                      <div key={s.label} className="text-center px-2 py-1.5 rounded-lg"
                        style={{ background: "rgba(27,58,45,0.04)" }}>
                        <div className="text-[14px] font-bold" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-[9px] text-[#8E8C85] uppercase tracking-wider">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFilterAcct(filterAcct === a.id ? "all" : a.id)}
                      className="flex-1 h-7 text-[11px] font-medium rounded-lg border transition"
                      style={{
                        background: filterAcct === a.id ? "rgba(27,58,45,0.06)" : "white",
                        color: "#56554F", borderColor: "#E8E6E1",
                      }}>
                      {filterAcct === a.id ? "Clear filter" : "View queue"}
                    </button>
                    {selected.length > 0 ? (
                      <button onClick={() => assign(a.id)} disabled={assigning}
                        className="flex-1 h-7 text-[11px] font-bold text-white rounded-lg disabled:opacity-50 transition"
                        style={{ background: "#1B3A2D" }}>
                        Assign {selected.length} →
                      </button>
                    ) : (
                      <button onClick={() => sendLink(a.id)} disabled={sendingLink === a.id}
                        className="flex-1 h-7 text-[11px] font-medium rounded-lg border transition"
                        style={{
                          color: linkSent === a.id ? "#2D7A50" : "#56554F",
                          borderColor: linkSent === a.id ? "rgba(45,122,80,0.3)" : "#E8E6E1",
                          background: "white",
                        }}>
                        {linkSent === a.id ? "✓ Link sent" : sendingLink === a.id ? "Sending…" : "Send login link"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add accountant card */}
              <button onClick={() => setTab("add")}
                className="bg-white border border-dashed border-[#E8E6E1] rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-2 hover:border-[#1B3A2D]/30 hover:bg-[#1B3A2D]/[0.02] transition"
                style={{ minHeight: "140px" }}>
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#C5C2BB] flex items-center justify-center text-[#C5C2BB] text-[18px]">+</div>
                <span className="text-[12px] font-medium text-[#8E8C85]">Add accountant</span>
              </button>
            </div>

            {/* Playbook table */}
            <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="px-5 py-3 border-b border-[#F0EFEB] flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">
                  {filterAcct === "all" ? "All Findings" : filterAcct === "unassigned" ? "Unassigned" : "Filtered"}
                  &nbsp;({displayPlaybooks.length})
                </span>
                <button onClick={() => setFilterAcct("unassigned")}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition"
                  style={{
                    background: filterAcct === "unassigned" ? "rgba(179,64,64,0.08)" : "transparent",
                    color: filterAcct === "unassigned" ? "#B34040" : "#8E8C85",
                  }}>
                  Unassigned ({unassigned.length})
                </button>
                {selected.length > 0 && (
                  <span className="ml-auto text-[11px] font-bold text-[#1B3A2D]">
                    {selected.length} selected — click an accountant card to assign
                  </span>
                )}
              </div>

              <div className="divide-y divide-[#F0EFEB]">
                {displayPlaybooks.slice(0, 50).map((pb: any) => {
                  const isSelected = selected.includes(pb.id);
                  const assignedAcct = accountants.find((a: any) => a.id === pb.assigned_to);
                  return (
                    <div key={pb.id}
                      onClick={() => setSelected(prev => isSelected ? prev.filter(x => x !== pb.id) : [...prev, pb.id])}
                      className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-[#FAFAF8] transition"
                      style={{ background: isSelected ? "rgba(27,58,45,0.04)" : undefined }}>

                      {/* Checkbox */}
                      <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition"
                        style={{ background: isSelected ? "#1B3A2D" : "white", borderColor: isSelected ? "#1B3A2D" : "#E8E6E1" }}>
                        {isSelected && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>

                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: SEV[pb.severity] || "#8E8C85" }} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[#1A1A18] truncate">{pb.finding_title}</span>
                          {pb.quick_win && <span className="text-[10px] text-[#2D7A50]">⚡</span>}
                        </div>
                        <span className="text-[11px] text-[#8E8C85]">{pb.company_name} · {pb.category}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[12px] font-bold text-[#B34040]">{fmtM(pb.amount_recoverable)}</div>
                        <div className="text-[10px]" style={{ color: assignedAcct ? "#2D7A50" : "#B34040" }}>
                          {assignedAcct ? assignedAcct.name : "Unassigned"}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {displayPlaybooks.length === 0 && (
                  <div className="px-5 py-8 text-center text-[12px] text-[#8E8C85]">No findings in this view.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
