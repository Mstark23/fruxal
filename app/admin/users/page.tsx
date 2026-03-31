"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

interface User {
  id: string; email: string; name: string; plan: "free"|"paid";
  province: string; country: string|null; industry: string; businessName: string;
  createdAt: string; lastActiveAt: string; prescanCount: number;
  diagnosticCount: number; healthScore: number|null; stripeCustomerId: string|null;
}
interface Stats { totalUsers:number; paidUsers:number; freeUsers:number; newThisWeek:number; newThisMonth:number }
interface Pagination { page:number; limit:number; total:number; totalPages:number }

function scoreColor(s: number|null) {
  if (s === null) return "#B5B3AD";
  if (s >= 70) return "#2D7A50";
  if (s >= 40) return "#A68B2B";
  return "#B34040";
}
function initials(name: string) { return name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) || "?"; }
function relDate(iso: string) {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today"; if (d === 1) return "Yesterday"; return `${d}d ago`;
}

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<User[]>([]);
  const [stats, setStats]           = useState<Stats|null>(null);
  const [pagination, setPagination] = useState<Pagination|null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [plan, setPlan]             = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sort, setSort]             = useState("newest");
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState<User|null>(null);
  const [note, setNote]             = useState("");
  const [reps, setReps]             = useState<{id:string;name:string;email:string}[]>([]);
  const [assigningRep, setAssigningRep] = useState(false);
  const [selectedRepId, setSelectedRepId] = useState("");
  const debounce                    = useRef<NodeJS.Timeout|null>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50", plan, sort, ...(q !== undefined ? { search: q } : search ? { search } : {}) });
      const r = await fetch(`/api/admin/users?${params}`);
      const j = await r.json();
      if (j.success) {
        let filtered = j.users;
        if (countryFilter !== "all") filtered = filtered.filter((u: User) => u.country === countryFilter);
        setUsers(filtered); setStats(j.stats); setPagination(j.pagination);
      }
      else setError(j.error || "Failed");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, [page, plan, sort, search, countryFilter]);

  useEffect(() => { load(); }, [page, plan, sort, countryFilter]);

  const onSearch = (v: string) => {
    setSearch(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); load(v); }, 300);
  };

  const patchUser = async (id: string, body: object) => {
    await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    load();
  };

  const assignRep = async (userId: string, repId: string) => {
    if (!repId) return;
    setAssigningRep(true);
    try {
      const res = await fetch("/api/admin/assign-rep", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, repId }),
      });
      const j = await res.json();
      if (j.success) setSelectedRepId("");
      else alert("Error: " + (j.error || "Failed"));
    } catch { alert("Failed"); }
    setAssigningRep(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">ADMIN</p>
          <h1 className="font-serif text-2xl font-bold text-[#1A1A18]">User Management</h1>
        </div>

        <AdminNav />

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Total",          val: stats.totalUsers },
              { label: "Paid",           val: stats.paidUsers,    green: true },
              { label: "Free",           val: stats.freeUsers },
              { label: "New This Week",  val: stats.newThisWeek },
              { label: "New This Month", val: stats.newThisMonth },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#EEECE8] rounded-xl p-4 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`font-serif text-xl font-bold ${(s as any).green ? "text-[#2D7A50]" : "text-[#1A1A18]"}`}>{s.val.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search name or email…"
            className="px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] placeholder-[#B5B3AD] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] w-64" />
          {[
            { val: plan, set: (v:string)=>{setPlan(v);setPage(1);}, opts: [["all","All Plans"],["paid","Paid"],["free","Free"]] },
            { val: countryFilter, set: (v:string)=>{setCountryFilter(v);setPage(1);}, opts: [["all","All Countries"],["US","US Only"],["CA","Canada Only"]] },
            { val: sort, set: (v:string)=>{setSort(v);setPage(1);}, opts: [["newest","Newest"],["oldest","Oldest"],["last_active","Last Active"],["health_score","Health Score"]] },
          ].map((sel, i) => (
            <select key={i} value={sel.val} onChange={e => sel.set(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]">
              {sel.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        {error && <div className="bg-white border border-[#B34040]/20 rounded-xl p-3 text-[#B34040] text-sm mb-4">{error}</div>}

        {/* Table */}
        <div className="bg-white border border-[#EEECE8] rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="grid grid-cols-[1fr_70px_110px_60px_55px_65px_80px_55px_80px] px-4 py-2.5 bg-[#FAFAF8] border-b border-[#EEECE8]">
            {["User","Plan","Business","Region","Scans","Diags","Health","Joined","Actions"].map(h => (
              <span key={h} className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {loading ? (
            Array.from({length:8}).map((_,i) => (
              <div key={i} className="grid grid-cols-[1fr_70px_110px_60px_55px_65px_80px_55px_80px] px-4 py-3 border-b border-[#EEECE8] animate-pulse">
                <div className="flex items-center gap-2"><div className="w-7 h-7 bg-[#F0EFEB] rounded-full" /><div className="h-3 bg-[#F0EFEB] rounded w-32" /></div>
                {Array.from({length:8}).map((_,j) => <div key={j} className="h-3 bg-[#F0EFEB] rounded w-12 self-center" />)}
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="px-4 py-12 text-center text-[#B5B3AD] text-sm">No users match your filters</div>
          ) : users.map(u => (
            <div key={u.id} className="grid grid-cols-[1fr_70px_110px_60px_55px_65px_80px_55px_80px] px-4 py-3 border-b border-[#EEECE8] last:border-0 hover:bg-[#F8F7F5] transition-colors items-center">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#1B3A2D] flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white">{initials(u.name)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1A1A18] truncate">{u.name || "—"}</p>
                  <p className="text-[10px] text-[#B5B3AD] truncate">{u.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded self-center"
                style={{ background: u.plan==="paid" ? "rgba(45,122,80,0.08)" : "#F0EFEB", color: u.plan==="paid" ? "#2D7A50" : "#8E8C85" }}>
                {u.plan.toUpperCase()}
              </span>
              <span className="text-xs text-[#56554F] truncate">{u.businessName || "—"}</span>
              <span className="text-xs text-[#8E8C85]">{u.province || "—"} <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: u.country === "US" ? "#EFF6FF" : "#F0FDF4", color: u.country === "US" ? "#2563EB" : "#16A34A" }}>{u.country || ""}</span></span>
              <span className="text-xs text-[#1A1A18] font-medium text-center">{u.prescanCount}</span>
              <span className="text-xs text-[#1A1A18] font-medium text-center">{u.diagnosticCount}</span>
              <span className="text-xs font-bold" style={{ color: scoreColor(u.healthScore) }}>
                {u.healthScore !== null ? u.healthScore : "—"}
              </span>
              <span className="text-[10px] text-[#B5B3AD]">{relDate(u.createdAt)}</span>
              <button onClick={() => { setSelected(u); setNote(""); }} className="text-xs font-semibold text-[#1B3A2D] hover:underline">View</button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8E8C85]">
              {(pagination.page-1)*pagination.limit+1}–{Math.min(pagination.page*pagination.limit,pagination.total)} of {pagination.total} users
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={pagination.page<=1}
                className="px-3 py-1.5 bg-white border border-[#E8E6E1] text-[#56554F] text-sm rounded-lg hover:bg-[#F8F7F5] disabled:opacity-40 transition">Previous</button>
              <span className="px-3 py-1.5 text-sm text-[#56554F]">Page {pagination.page} of {pagination.totalPages}</span>
              <button onClick={() => setPage(p => p+1)} disabled={pagination.page>=pagination.totalPages}
                className="px-3 py-1.5 bg-white border border-[#E8E6E1] text-[#56554F] text-sm rounded-lg hover:bg-[#F8F7F5] disabled:opacity-40 transition">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setSelected(null)}>
          <div className="fixed inset-0" style={{ background: "rgba(26,26,24,0.25)" }} />
          <div className="relative w-[480px] h-full bg-white border-l border-[#EEECE8] shadow-xl overflow-y-auto z-50" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#EEECE8] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1B3A2D] flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{initials(selected.name)}</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A18]">{selected.name || selected.email}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: selected.plan==="paid" ? "rgba(45,122,80,0.08)" : "#F0EFEB", color: selected.plan==="paid" ? "#2D7A50" : "#8E8C85" }}>
                    {selected.plan.toUpperCase()}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#B5B3AD] hover:text-[#56554F] text-xl">×</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {[
                ["Email",       selected.email],
                ["Business",    selected.businessName || "—"],
                ["Province",    selected.province || "—"],
                ["Industry",    selected.industry || "—"],
                ["Joined",      relDate(selected.createdAt)],
                ["Last Active", relDate(selected.lastActiveAt)],
                ["Prescans",    String(selected.prescanCount)],
                ["Diagnostics", String(selected.diagnosticCount)],
              ].map(([l,v]) => (
                <div key={l} className="flex justify-between items-center border-b border-[#EEECE8] pb-3 last:border-0">
                  <span className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">{l}</span>
                  <span className="text-sm text-[#1A1A18] font-medium">{v}</span>
                </div>
              ))}

              {selected.healthScore !== null && (
                <div className="flex justify-between items-center border-b border-[#EEECE8] pb-3">
                  <span className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">Health Score</span>
                  <span className="text-sm font-bold" style={{ color: scoreColor(selected.healthScore) }}>{selected.healthScore}/100</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {selected.plan === "free" ? (
                  <button onClick={() => patchUser(selected.id, { action: "upgrade" })}
                    className="flex-1 py-2 bg-[#1B3A2D] text-white text-sm font-semibold rounded-lg hover:bg-[#2A5A44] transition">
                    Upgrade to Paid
                  </button>
                ) : (
                  <button onClick={() => patchUser(selected.id, { action: "downgrade" })}
                    className="flex-1 py-2 bg-white border border-[#E8E6E1] text-[#56554F] text-sm font-medium rounded-lg hover:bg-[#F8F7F5] transition">
                    Downgrade to Free
                  </button>
                )}
              </div>

              {reps.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2">Assign Recovery Rep</p>
                  <div className="flex gap-2">
                    <select value={selectedRepId} onChange={e => setSelectedRepId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]">
                      <option value="">Select rep…</option>
                      {reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <button onClick={() => assignRep(selected.id, selectedRepId)} disabled={!selectedRepId || assigningRep}
                      className="px-4 py-2 bg-[#1B3A2D] text-white text-xs font-semibold rounded-lg hover:bg-[#2A5A44] transition disabled:opacity-40">
                      {assigningRep ? "…" : "Assign"}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#B5B3AD] mt-1.5">Creates pipeline entry + notifies rep & client by email.</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2">Admin Note</p>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add a note…"
                  className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#1A1A18] placeholder-[#B5B3AD] focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] resize-none" />
                <button onClick={() => { patchUser(selected.id, { note }); setNote(""); }}
                  className="mt-2 px-4 py-1.5 bg-[#1B3A2D] text-white text-xs font-semibold rounded-lg hover:bg-[#2A5A44] transition">
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
