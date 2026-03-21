// =============================================================================
// /admin/tier3/reps — Rep Portal + Commission Tracker
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

function fmt(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + Math.round(n / 1_000) + "K";
  return "$" + (n ?? 0).toLocaleString();
}
function fmtRaw(n: number): string { return "$" + (n ?? 0).toLocaleString(); }

interface Rep {
  id: string; name: string; email: string; phone: string | null;
  province: string | null; status: string; commissionRate: number;
  notes: string | null; createdAt: string;
  activeDeals: number; totalEarned: number; totalPending: number; commissionsCount: number;
}

interface RepDetail {
  rep: any;
  assignments: Array<{ diagnostic_id: string; companyName: string; assigned_at: string; stage_at_assignment: string; notes: string }>;
  commissions: Array<{ id: string; companyName: string; confirmed_savings: number; fee_collected: number; commission_amount: number; commission_rate: number; status: string; paid_at: string | null }>;
  totals: { earned: number; pending: number };
}

export default function RepsPage() {
  const [reps, setReps] = useState<Rep[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // New rep form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newProv, setNewProv] = useState("");
  const [newRate, setNewRate] = useState(20);

  // Slide-over
  const [selectedRep, setSelectedRep] = useState<RepDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tier3/reps");
      const json = await res.json();
      if (json.success) { setReps(json.reps || []); setStats(json.stats || null); }
    } catch { /* non-fatal */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createRep = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/tier3/reps", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, phone: newPhone, province: newProv, commissionRate: newRate }),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false); setNewName(""); setNewEmail(""); setNewPhone(""); setNewProv(""); setNewRate(20);
        fetchData();
      }
    } catch { /* non-fatal */ }
    setCreating(false);
  };

  const openDetail = async (repId: string) => {
    setLoadingDetail(true);
    setSelectedRep(null);
    try {
      const res = await fetch(`/api/admin/tier3/reps/${repId}`);
      const json = await res.json();
      if (json.success) setSelectedRep(json);
    } catch { /* non-fatal */ }
    setLoadingDetail(false);
  };

  const markPaid = async (repId: string, commissionId: string) => {
    setMarkingPaid(commissionId);
    await fetch(`/api/admin/tier3/reps/${repId}?action=mark_paid`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionId }),
    });
    setMarkingPaid(null);
    openDetail(repId); // refresh
    fetchData();
  };

  const cardCls = "bg-[#FFFFFF] border border-[#EEECE8] rounded-xl p-5";
  const inputCls = "w-full bg-[#FAFAF8] border border-[#EEECE8] rounded-lg px-3 py-2 text-sm text-[#1A1A18] placeholder-[#1A1A18] focus:border-[#2D7A50] outline-none transition";

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdminNav />

        <div className="flex items-end justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A18] tracking-tight">Reps</h1>
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: "linear-gradient(135deg, #2D7A50, #2D7A50)", color: "#fff" }}>
            + Add Rep
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className={cardCls}>
              <div className="text-[10px] font-bold text-[#56554F] uppercase tracking-widest">Active Reps</div>
              <div className="text-2xl font-bold text-[#1A1A18] mt-1 tabular-nums">{stats.activeReps}</div>
            </div>
            <div className={cardCls}>
              <div className="text-[10px] font-bold text-[#56554F] uppercase tracking-widest">Total Paid</div>
              <div className="text-2xl font-bold text-[#2D7A50] mt-1 tabular-nums">{fmt(stats.totalPaid)}</div>
            </div>
            <div className={cardCls}>
              <div className="text-[10px] font-bold text-[#56554F] uppercase tracking-widest">Pending Commissions</div>
              <div className="text-2xl font-bold text-[#d97706] mt-1 tabular-nums">{fmt(stats.totalPending)}</div>
            </div>
            <div className={cardCls}>
              <div className="text-[10px] font-bold text-[#56554F] uppercase tracking-widest">Total Assignments</div>
              <div className="text-2xl font-bold text-[#1A1A18] mt-1 tabular-nums">{stats.totalAssignments}</div>
            </div>
          </div>
        )}

        {/* Rep Cards */}
        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-[#FFFFFF] rounded-xl animate-pulse border border-[#EEECE8]" />)}</div>
        ) : reps.length === 0 ? (
          <div className={`${cardCls} text-center py-12`}>
            <p className="text-sm text-[#8E8C85]">No reps yet. Add your first rep to start tracking commissions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reps.map((r) => (
              <div key={r.id} className={`${cardCls} hover:border-[#EEECE8] transition-all cursor-pointer`} onClick={() => openDetail(r.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EEECE8] flex items-center justify-center text-xs font-bold text-[#56554F]">
                      {r.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1A1A18]">{r.name}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${r.status === "active" ? "bg-[#1B3A2D]/12 text-[#2D7A50]" : "bg-[#EEECE8] text-[#56554F]"}`}>{r.status}</span>
                      </div>
                      <div className="text-[10px] text-[#1A1A18]">{r.email}{r.province ? ` · ${r.province}` : ""} · {r.commissionRate}% rate</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#1A1A18] tabular-nums">{r.activeDeals}</div>
                      <div className="text-[9px] text-[#1A1A18]">deals</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#2D7A50] tabular-nums">{fmtRaw(r.totalEarned)}</div>
                      <div className="text-[9px] text-[#1A1A18]">earned</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#d97706] tabular-nums">{fmtRaw(r.totalPending)}</div>
                      <div className="text-[9px] text-[#1A1A18]">pending</div>
                    </div>
                    <span className="text-[10px] text-[#2D7A50] font-semibold">View →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ ADD REP MODAL ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => !creating && setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#FAFAF8] border border-[#EEECE8] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#EEECE8]"><h3 className="text-sm font-bold text-[#1A1A18]">Add Rep</h3></div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-[#56554F] uppercase tracking-widest mb-1">Name *</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name" className={inputCls} /></div>
                <div><label className="block text-[10px] font-bold text-[#56554F] uppercase tracking-widest mb-1">Email *</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@example.com" className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-[10px] font-bold text-[#56554F] uppercase tracking-widest mb-1">Phone</label><input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} className={inputCls} /></div>
                <div><label className="block text-[10px] font-bold text-[#56554F] uppercase tracking-widest mb-1">Province</label>
                  <select value={newProv} onChange={e => setNewProv(e.target.value)} className={inputCls}>
                    <option value="">—</option>{["ON","QC","BC","AB","MB"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className="block text-[10px] font-bold text-[#56554F] uppercase tracking-widest mb-1">Commission %</label><input type="number" min={5} max={50} value={newRate} onChange={e => setNewRate(Number(e.target.value))} className={inputCls} /></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#EEECE8] flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-[#56554F]">Cancel</button>
              <button onClick={createRep} disabled={creating || !newName.trim() || !newEmail.trim()} className="px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-40" style={{ background: "linear-gradient(135deg, #2D7A50, #2D7A50)", color: "#fff" }}>
                {creating ? "Adding…" : "Add Rep"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ REP DETAIL SLIDE-OVER ═══ */}
      {(selectedRep || loadingDetail) && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => { setSelectedRep(null); setLoadingDetail(false); }}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-[480px] h-full bg-[#FAFAF8] border-l border-[#EEECE8] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#FAFAF8] border-b border-[#EEECE8] px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-sm font-bold text-[#1A1A18]">{selectedRep?.rep?.name || "Loading…"}</h3>
              <button onClick={() => { setSelectedRep(null); setLoadingDetail(false); }} className="w-7 h-7 rounded-lg bg-[#EEECE8] flex items-center justify-center text-[#56554F] hover:text-[#1A1A18] transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {loadingDetail && !selectedRep ? (
              <div className="flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-[#EEECE8] border-t-[#2D7A50] rounded-full animate-spin" /></div>
            ) : selectedRep && (
              <div className="px-6 py-5 space-y-6">
                {/* Profile */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {([
                    ["Email", selectedRep.rep.email],
                    ["Phone", selectedRep.rep.phone || "—"],
                    ["Province", selectedRep.rep.province || "—"],
                    ["Commission Rate", `${selectedRep.rep.commission_rate}%`],
                    ["Status", selectedRep.rep.status],
                    ["Joined", new Date(selectedRep.rep.created_at).toLocaleDateString("en-CA")],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[9px] font-bold text-[#1A1A18] uppercase tracking-wider">{k}</div>
                      <div className="text-[#B5B3AD] mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FFFFFF] border border-[#EEECE8] rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-[#2D7A50] tabular-nums">{fmtRaw(selectedRep.totals.earned)}</div>
                    <div className="text-[9px] text-[#1A1A18]">Total Earned</div>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#EEECE8] rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-[#d97706] tabular-nums">{fmtRaw(selectedRep.totals.pending)}</div>
                    <div className="text-[9px] text-[#1A1A18]">Pending</div>
                  </div>
                </div>

                {/* Assignments */}
                <div className="border-t border-[#EEECE8] pt-4">
                  <div className="text-[10px] font-bold text-[#56554F] uppercase tracking-widest mb-3">Assigned Deals ({selectedRep.assignments.length})</div>
                  {selectedRep.assignments.length === 0 ? (
                    <p className="text-xs text-[#1A1A18]">No assignments yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRep.assignments.map((a: any, i: number) => (
                        <div key={i} className="bg-[#F8F7F5] border border-[#EEECE8] rounded-lg p-3">
                          <div className="text-xs font-semibold text-[#1A1A18]">{a.companyName}</div>
                          <div className="text-[9px] text-[#1A1A18] mt-0.5">
                            Assigned {new Date(a.assigned_at).toLocaleDateString("en-CA")}
                            {a.stage_at_assignment ? ` · Stage: ${a.stage_at_assignment}` : ""}
                          </div>
                          {a.notes && <div className="text-[9px] text-[#56554F] italic mt-1">{a.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Commissions */}
                <div className="border-t border-[#EEECE8] pt-4">
                  <div className="text-[10px] font-bold text-[#56554F] uppercase tracking-widest mb-3">Commissions ({selectedRep.commissions.length})</div>
                  {selectedRep.commissions.length === 0 ? (
                    <p className="text-xs text-[#1A1A18]">No commissions recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRep.commissions.map((c: any) => (
                        <div key={c.id} className="bg-[#F8F7F5] border border-[#EEECE8] rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-[#1A1A18]">{c.companyName}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${c.status === "paid" ? "bg-[#1B3A2D]/12 text-[#2D7A50]" : "bg-[#d97706]/12 text-[#d97706]"}`}>
                              {c.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-[10px] text-[#56554F]">
                            <div>Savings: <span className="text-[#1A1A18]">{fmtRaw(c.confirmed_savings)}</span></div>
                            <div>Fee: <span className="text-[#1A1A18]">{fmtRaw(c.fee_collected)}</span></div>
                            <div>Commission: <span className="text-[#2D7A50] font-bold">{fmtRaw(c.commission_amount)}</span></div>
                          </div>
                          {c.status === "pending" && (
                            <button
                              onClick={() => markPaid(selectedRep!.rep.id, c.id)}
                              disabled={markingPaid === c.id}
                              className="mt-2 px-3 py-1.5 text-[10px] font-bold text-[#2D7A50] bg-[#1B3A2D]/10 rounded-lg hover:bg-[#1B3A2D]/20 transition disabled:opacity-50"
                            >
                              {markingPaid === c.id ? "Marking…" : "Mark as Paid"}
                            </button>
                          )}
                          {c.paid_at && <div className="text-[9px] text-[#1A1A18] mt-1">Paid {new Date(c.paid_at).toLocaleDateString("en-CA")}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
