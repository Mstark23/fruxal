// =============================================================================
// app/admin/invoices/page.tsx
// Admin invoice management — see all pending fees, send invoices, mark paid.
// =============================================================================
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

function fmtM(n: number) {
  return n >= 1_000_000 ? "$" + (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000 ? "$" + Math.round(n / 1_000) + "K"
    : "$" + n.toLocaleString();
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending",  color: "#C4841D", bg: "rgba(196,132,29,0.08)"  },
  sent:     { label: "Sent",     color: "#0369a1", bg: "rgba(3,105,161,0.08)"   },
  paid:     { label: "Paid ✓",   color: "#2D7A50", bg: "rgba(45,122,80,0.08)"   },
  overdue:  { label: "Overdue",  color: "#B34040", bg: "rgba(179,64,64,0.08)"   },
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices]   = useState<any[]>([]);
  const [pipeline, setPipeline]   = useState<any[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [sending,  setSending]    = useState<string | null>(null);
  const [toast,    setToast]      = useState("");

  const load = useCallback(async () => {
    const [invRes, pipeRes] = await Promise.all([
      fetch("/api/admin/invoices").then(r => r.json()).catch(() => ({ invoices: [] })),
      fetch("/api/admin/tier3/pipeline?stage=fee_collected").then(r => r.json()).catch(() => ({ entries: [] })),
    ]);
    setInvoices(invRes.invoices || []);
    // Also show confirmed-savings clients who haven't been invoiced yet
    const invoicedIds = new Set((invRes.invoices || []).map((i: any) => i.pipeline_id));
    const uninvoiced = (pipeRes.entries || []).filter((e: any) =>
      !invoicedIds.has(e.pipelineId) && (e.confirmedSavings || 0) > 0
    );
    setPipeline(uninvoiced);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function sendInvoice(pipelineId: string) {
    setSending(pipelineId);
    const res = await fetch(`/api/admin/tier3/pipeline/${pipelineId}/invoice`, {
      method: "POST",
    }).then(r => r.json());
    if (res.success) {
      setToast(`Invoice sent — ${fmtM(res.fee_amount)} fee`);
      setTimeout(() => setToast(""), 4000);
    } else {
      setToast("Error: " + (res.error || "Unknown"));
      setTimeout(() => setToast(""), 4000);
    }
    await load();
    setSending(null);
  }

  async function markPaid(invoiceId: string) {
    await fetch(`/api/admin/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paid_at: new Date().toISOString() }),
    });
    await load();
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );

  const totalPending  = invoices.filter(i => i.status !== "paid").reduce((s: number, i: any) => s + (i.fee_amount || 0), 0);
  const totalCollected = invoices.filter(i => i.status === "paid").reduce((s: number, i: any) => s + (i.fee_amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <AdminNav />

        <div className="flex items-center justify-between mb-6 mt-2">
          <h1 className="font-serif text-[22px] font-bold text-[#1A1A18]">Fee Invoices</h1>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-4 px-4 py-3 rounded-xl text-[12px] font-semibold"
            style={{ background: toast.startsWith("Error") ? "rgba(179,64,64,0.08)" : "rgba(45,122,80,0.08)", color: toast.startsWith("Error") ? "#B34040" : "#2D7A50" }}>
            {toast}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Pending Collection", val: fmtM(totalPending),   color: "#C4841D" },
            { label: "Collected",          val: fmtM(totalCollected), color: "#2D7A50" },
            { label: "Ready to Invoice",   val: String(pipeline.length), color: pipeline.length > 0 ? "#B34040" : "#8E8C85" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white border border-[#E8E6E1] rounded-xl px-5 py-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="text-[22px] font-bold" style={{ color: kpi.color }}>{kpi.val}</div>
              <div className="text-[11px] text-[#8E8C85] mt-0.5 uppercase tracking-wider">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Ready to invoice */}
        {pipeline.length > 0 && (
          <div className="mb-6">
            <p className="text-[11px] font-bold text-[#B34040] uppercase tracking-wider mb-3">
              Ready to Invoice ({pipeline.length})
            </p>
            <div className="space-y-2">
              {pipeline.map((c: any) => (
                <div key={c.pipelineId} className="bg-white border border-[rgba(179,64,64,0.2)] rounded-xl px-5 py-4 flex items-center gap-4"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1A1A18]">{c.companyName}</p>
                    <p className="text-[11px] text-[#8E8C85]">{c.industry} · {c.province}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-[#2D7A50]">{fmtM(c.confirmedSavings)} recovered</p>
                    <p className="text-[11px] text-[#8E8C85]">Fee: {fmtM(Math.round(c.confirmedSavings * 0.12))}</p>
                  </div>
                  <button
                    onClick={() => sendInvoice(c.pipelineId)}
                    disabled={sending === c.pipelineId}
                    className="shrink-0 h-9 px-5 text-[12px] font-bold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
                    style={{ background: "#1B3A2D" }}>
                    {sending === c.pipelineId ? "Sending…" : "Send Invoice →"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice list */}
        <div>
          <p className="text-[11px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">
            All Invoices ({invoices.length})
          </p>
          {invoices.length === 0 && pipeline.length === 0 && (
            <div className="bg-white border border-[#E8E6E1] rounded-xl px-6 py-10 text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[13px] font-semibold text-[#1A1A18] mb-1">No invoices yet</p>
              <p className="text-[11px] text-[#8E8C85]">Invoices appear once confirmed savings are logged and sent.</p>
            </div>
          )}
          <div className="space-y-2">
            {invoices.map((inv: any) => {
              const sm = STATUS_META[inv.status] || STATUS_META.pending;
              return (
                <div key={inv.id} className="bg-white border border-[#E8E6E1] rounded-xl px-5 py-4 flex items-center gap-4"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[13px] font-semibold text-[#1A1A18]">{inv.company_name}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                    </div>
                    <p className="text-[11px] text-[#8E8C85]">
                      {inv.invoice_number} · Sent {inv.sent_at ? new Date(inv.sent_at).toLocaleDateString("en-CA") : "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-bold text-[#1A1A18]">{fmtM(inv.fee_amount)}</p>
                    <p className="text-[11px] text-[#8E8C85]">{fmtM(inv.confirmed_savings)} recovered</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {inv.payment_url && (
                      <a href={inv.payment_url} target="_blank" rel="noopener noreferrer"
                        className="h-8 px-3 text-[11px] font-medium border border-[#E8E6E1] rounded-lg hover:bg-[#F8F7F5] transition text-[#56554F] flex items-center">
                        View link
                      </a>
                    )}
                    {inv.status !== "paid" && (
                      <button onClick={() => markPaid(inv.id)}
                        className="h-8 px-3 text-[11px] font-bold rounded-lg transition hover:opacity-90 text-white"
                        style={{ background: "#2D7A50" }}>
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
