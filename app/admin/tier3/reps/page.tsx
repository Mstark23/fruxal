// =============================================================================
// app/admin/tier3/reps/page.tsx — Rep performance analytics
// =============================================================================
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

function fmt(n: number) { return n >= 1000000 ? "$" + (n/1000000).toFixed(1) + "M" : n >= 1000 ? "$" + Math.round(n/1000) + "K" : "$" + n.toLocaleString(); }
function pct(n: number) { return n + "%"; }
function days(n: number | null) { return n !== null ? n + "d" : "—"; }

const STAGE_COLOR: Record<string, string> = {
  active: "#2D7A50", inactive: "#B5B3AD",
};

export default function RepsAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", province: "", commissionRate: "12" });
  const [adding, setAdding] = useState(false);
  const [sendingLink, setSendingLink] = useState<string|null>(null);

  const loadAnalytics = () => {
    fetch("/api/admin/tier3/reps/analytics")
      .then(r => r.json())
      .then(d => { if (d.success) setAnalytics(d.analytics); else setError(d.error || "Failed to load"); })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAnalytics(); }, []);

  const addRep = async () => {
    if (!addForm.name.trim() || !addForm.email.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/tier3/reps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(),
          email: addForm.email.trim().toLowerCase(),
          phone: addForm.phone.trim() || null,
          province: addForm.province.trim() || null,
          commissionRate: Number(addForm.commissionRate) || 12,
        }),
      });
      const j = await res.json();
      if (j.success) {
        setShowAdd(false);
        setAddForm({ name: "", email: "", phone: "", province: "", commissionRate: "12" });
        loadAnalytics();
      } else {
        setError(j.error || "Failed to create rep");
      }
    } catch { setError("Network error"); }
    setAdding(false);
  };

  const sendPortalLink = async (repId: string, repEmail: string) => {
    setSendingLink(repId);
    try {
      const res = await fetch("/api/rep/auth/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repId }),
      });
      const j = await res.json();
      if (j.success) setError(null);
      else setError(j.error || "Failed to send link");
    } catch { setError("Network error"); }
    setSendingLink(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin"/>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-8 max-w-7xl mx-auto">
      <AdminNav />
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    </div>
  );

  const totalEarned  = analytics.reduce((s, r) => s + r.commissionsEarned, 0);
  const totalPending = analytics.reduce((s, r) => s + r.commissionsPending, 0);
  const avgConv      = analytics.length ? Math.round(analytics.reduce((s, r) => s + r.conversionRate, 0) / analytics.length) : 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[17px] font-bold text-[#1A1A18]">Rep Performance</h1>
            <p className="text-[11px] text-[#8E8C85] mt-0.5">{analytics.filter(r => r.status === "active").length} active reps</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAdd(true)}
              className="h-9 px-4 text-[12px] font-bold text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2A5A44] transition">
              + Add Rep
            </button>
            <AdminNav />
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Commissions Earned", value: fmt(totalEarned), sub: "all time" },
            { label: "Commissions Pending",      value: fmt(totalPending), sub: "to be paid" },
            { label: "Avg Conversion Rate",      value: pct(avgConv),     sub: "lead → engagement" },
          ].map(k => (
            <div key={k.label} className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider">{k.label}</p>
              <p className="text-[22px] font-bold text-[#1A1A18] mt-1">{k.value}</p>
              <p className="text-[10px] text-[#B5B3AD] mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Rep table */}
        <div className="bg-white border border-[#E5E3DD] rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E5E3DD] text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider">
                {["Rep","Province","Clients","Active","Conversion","Avg Close","Earned","Pending",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analytics.map((rep: any) => (
                <tr key={rep.id} className="border-b border-[#F0EFEB] hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                  onClick={() => setSelected(rep)}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#1A1A18]">{rep.name}</p>
                    <p className="text-[10px] text-[#8E8C85]">{rep.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[#56554F]">{rep.province || "—"}</td>
                  <td className="px-4 py-3 font-semibold">{rep.totalClients}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: rep.activeClients > 0 ? "#2D7A50" : "#B5B3AD" }}>{rep.activeClients}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-[#F0EFEB] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: pct(rep.conversionRate), background: rep.conversionRate >= 50 ? "#2D7A50" : rep.conversionRate >= 25 ? "#C4841D" : "#B34040" }} />
                      </div>
                      <span className="font-semibold text-[#1A1A18]">{pct(rep.conversionRate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#56554F]">{days(rep.avgDaysToClose)}</td>
                  <td className="px-4 py-3 font-semibold text-[#2D7A50]">{fmt(rep.commissionsEarned)}</td>
                  <td className="px-4 py-3 text-[#C4841D] font-semibold">{fmt(rep.commissionsPending)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: rep.status === "active" ? "rgba(45,122,80,0.08)" : "rgba(181,179,173,0.15)",
                                 color: STAGE_COLOR[rep.status] || "#8E8C85" }}>
                        {rep.status}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); sendPortalLink(rep.id, rep.email); }}
                        disabled={sendingLink === rep.id}
                        className="text-[9px] font-semibold text-[#1B3A2D] hover:underline disabled:opacity-40">
                        {sendingLink === rep.id ? "Sending..." : "Send Link"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Rep Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
            <div className="fixed inset-0" style={{ background: "rgba(26,26,24,0.3)" }} />
            <div className="relative bg-white rounded-2xl border border-[#E5E3DD] shadow-xl w-full max-w-md p-6 z-50" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-[#1A1A18]">Add New Rep</h3>
                <button onClick={() => setShowAdd(false)} className="text-[#B5B3AD] text-xl hover:text-[#1A1A18]">×</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Full Name *</label>
                  <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="John Smith" className="w-full mt-1 px-3 py-2 text-[13px] border border-[#E5E3DD] rounded-lg bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Email *</label>
                  <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="john@example.com" className="w-full mt-1 px-3 py-2 text-[13px] border border-[#E5E3DD] rounded-lg bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Phone</label>
                    <input value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="514-555-1234" className="w-full mt-1 px-3 py-2 text-[13px] border border-[#E5E3DD] rounded-lg bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Province / State</label>
                    <input value={addForm.province} onChange={e => setAddForm(p => ({ ...p, province: e.target.value }))}
                      placeholder="QC" maxLength={2} className="w-full mt-1 px-3 py-2 text-[13px] border border-[#E5E3DD] rounded-lg bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D] uppercase" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Commission Rate (%)</label>
                  <input type="number" value={addForm.commissionRate} onChange={e => setAddForm(p => ({ ...p, commissionRate: e.target.value }))}
                    min="1" max="50" className="w-full mt-1 px-3 py-2 text-[13px] border border-[#E5E3DD] rounded-lg bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D]" />
                  <p className="text-[10px] text-[#B5B3AD] mt-1">Percentage of the contingency fee the rep earns per recovery</p>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={addRep} disabled={adding || !addForm.name.trim() || !addForm.email.trim()}
                  className="flex-1 h-10 text-[13px] font-bold text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2A5A44] transition disabled:opacity-40">
                  {adding ? "Creating..." : "Create Rep"}
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-4 h-10 text-[13px] text-[#56554F] border border-[#E5E3DD] rounded-lg hover:bg-[#F0EFEB] transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail slide-over */}
        {selected && (
          <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setSelected(null)}>
            <div className="fixed inset-0" style={{ background: "rgba(26,26,24,0.25)" }} />
            <div className="relative w-[400px] h-full bg-white border-l border-[#EEECE8] shadow-xl overflow-y-auto z-50 p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[15px] font-bold text-[#1A1A18]">{selected.name}</h2>
                  <p className="text-[11px] text-[#8E8C85]">{selected.province} · {selected.commissionRate}% commission rate</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#B5B3AD] text-xl">×</button>
              </div>

              <div className="space-y-4">
                {[
                  ["Total Clients",     selected.totalClients],
                  ["Active Clients",    selected.activeClients],
                  ["Closed (Engaged)",  selected.closedClients],
                  ["Conversion Rate",   pct(selected.conversionRate)],
                  ["Avg Days to Close", days(selected.avgDaysToClose)],
                  ["Commissions Earned", fmt(selected.commissionsEarned)],
                  ["Commissions Pending", fmt(selected.commissionsPending)],
                ].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between border-b border-[#F0EFEB] pb-3">
                    <span className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider">{l}</span>
                    <span className="text-[13px] font-semibold text-[#1A1A18]">{v}</span>
                  </div>
                ))}
              </div>

              {selected.monthlyBreakdown?.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-3">Monthly Commissions</p>
                  <div className="space-y-2">
                    {selected.monthlyBreakdown.map((m: any) => (
                      <div key={m.month} className="flex items-center justify-between">
                        <span className="text-[11px] text-[#56554F]">{m.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 bg-[#F0EFEB] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1B3A2D] rounded-full"
                              style={{ width: `${Math.min(100, (m.earned / Math.max(1, ...selected.monthlyBreakdown.map((x: any) => x.earned))) * 100)}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-[#1A1A18]">{fmt(m.earned)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => router.push(`/admin/tier3/reps/${selected.id}`)}
                className="mt-6 w-full py-2.5 bg-[#1B3A2D] text-white text-[12px] font-semibold rounded-lg hover:bg-[#2A5A44] transition">
                View Full Rep Profile →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
