// =============================================================================
// app/admin/tier3/[id]/execution/page.tsx
// Rep execution dashboard — one playbook card per finding.
// Shows exact steps, documents needed, draft template, status tracking.
// =============================================================================
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  queued:      { label: "Queued",      color: "#8E8C85", bg: "rgba(142,140,133,0.08)" },
  in_progress: { label: "In Progress", color: "#C4841D", bg: "rgba(196,132,29,0.08)" },
  submitted:   { label: "Submitted",   color: "#0369a1", bg: "rgba(3,105,161,0.08)"  },
  confirmed:   { label: "Confirmed ✓", color: "#2D7A50", bg: "rgba(45,122,80,0.08)"  },
  closed:      { label: "Closed",      color: "#C5C2BB", bg: "rgba(197,194,187,0.08)"},
};

const SEV_DOT: Record<string, string> = {
  critical: "#B34040", high: "#C4841D", medium: "#8E8C85", low: "#C5C2BB",
};

const WHO_BADGE: Record<string, string> = {
  accountant: "👤 Accountant",
  rep:        "📞 Rep",
  client:     "🏢 Client",
};

function fmtM(n: number) {
  return n >= 1_000_000 ? "$" + (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000 ? "$" + Math.round(n / 1_000) + "K"
    : "$" + n.toLocaleString();
}

export default function ExecutionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData]             = useState<any>(null);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [copied, setCopied]         = useState<string | null>(null);
  const [saving, setSaving]         = useState<string | null>(null);
  const [confirmAmounts, setConfirmAmounts] = useState<Record<string, string>>({});
  const [notes, setNotes]           = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/tier3/pipeline/${id}/execution`).then(r => r.json());
    setData(res);
    if (res.generating) setGenerating(true);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Poll while generating
  useEffect(() => {
    if (!generating) return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/admin/tier3/pipeline/${id}/execution`).then(r => r.json());
      if (!res.generating && res.playbooks?.length > 0) {
        setData(res);
        setGenerating(false);
        clearInterval(t);
      }
    }, 5000);
    return () => clearInterval(t);
  }, [generating, id]);

  async function updateStatus(playbookId: string, status: string, confirmedAmount?: number, noteText?: string) {
    setSaving(playbookId);
    await fetch(`/api/admin/tier3/pipeline/${id}/execution`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playbook_id:      playbookId,
        status,
        notes:            noteText ?? notes[playbookId],
        confirmed_amount: confirmedAmount,
      }),
    });
    await load();
    setSaving(null);
  }

  function copyDraft(text: string, id: string) {
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

  const playbooks: any[] = data?.playbooks || [];
  const summary          = data?.summary   || {};

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back + header */}
        <button onClick={() => router.push(`/admin/tier3/${id}`)}
          className="mb-5 flex items-center gap-1.5 text-[12px] font-medium text-[#8E8C85] hover:text-[#1B3A2D] transition">
          ← {data?.company_name || "Client"}
        </button>

        <AdminNav />

        <div className="flex items-start justify-between gap-4 mt-5 mb-6">
          <div>
            <h1 className="font-serif text-[22px] font-bold text-[#1A1A18]">
              Execution Playbook
            </h1>
            <p className="text-[12px] text-[#8E8C85] mt-1">
              {data?.company_name} · {playbooks.length} findings · {fmtM(summary.total_recoverable || 0)} recoverable
            </p>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {summary.quick_wins > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(45,122,80,0.08)", color: "#2D7A50" }}>
                ⚡ {summary.quick_wins} quick win{summary.quick_wins !== 1 ? "s" : ""}
              </span>
            )}
            {Object.entries(summary.by_status || {}).filter(([, v]) => (v as number) > 0).map(([k, v]) => (
              <span key={k} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: STATUS_META[k]?.bg, color: STATUS_META[k]?.color }}>
                {STATUS_META[k]?.label}: {v as number}
              </span>
            ))}
          </div>
        </div>

        {/* Generating state */}
        {generating && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
            style={{ background: "linear-gradient(135deg, #1B3A2D, #2A5A44)" }}>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            <div>
              <p className="text-[12px] font-semibold text-white">Generating execution playbooks…</p>
              <p className="text-[11px] text-white/60">Claude is writing step-by-step instructions and draft templates for each finding. Takes ~30 seconds.</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!generating && playbooks.length === 0 && (
          <div className="bg-white border border-[#E8E6E1] rounded-xl px-6 py-10 text-center">
            <p className="text-[13px] font-semibold text-[#1A1A18] mb-1">No playbooks yet</p>
            <p className="text-[11px] text-[#8E8C85]">{data?.message || "Run the diagnostic first to generate execution playbooks."}</p>
          </div>
        )}

        {/* Playbook cards */}
        <div className="space-y-3">
          {playbooks.map((pb: any) => {
            const isExpanded = expanded === pb.id;
            const sm = STATUS_META[pb.status] || STATUS_META.queued;
            const confirmedInput = confirmAmounts[pb.id] ?? "";

            return (
              <div key={pb.id} className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

                {/* Card header */}
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                    style={{ background: SEV_DOT[pb.severity] || "#8E8C85" }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[13px] font-semibold text-[#1A1A18]">{pb.finding_title}</span>
                      {pb.quick_win && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(45,122,80,0.08)", color: "#2D7A50" }}>⚡ Quick Win</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-[11px] text-[#8E8C85]">
                      <span>{pb.category}</span>
                      {pb.estimated_hours && <span>~{pb.estimated_hours}h</span>}
                      <span className="font-semibold" style={{ color: sm.color }}
                        >{sm.label}</span>
                      <span className="font-semibold" style={{ color: "#8E8C85" }}
                        >{WHO_BADGE[pb.who_executes] || pb.who_executes}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-serif text-[15px] font-bold text-[#B34040]">{fmtM(pb.amount_recoverable)}</div>
                      {pb.confirmed_amount > 0 && (
                        <div className="text-[11px] font-semibold text-[#2D7A50]">✓ {fmtM(pb.confirmed_amount)}</div>
                      )}
                    </div>
                    <button onClick={() => setExpanded(isExpanded ? null : pb.id)}
                      className="text-[12px] text-[#8E8C85] hover:text-[#1B3A2D] px-2 py-1 rounded transition">
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-[#F0EFEB] px-5 py-4 space-y-5">

                    {/* Execution steps */}
                    {pb.execution_steps?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">Execution Steps</p>
                        <div className="space-y-2">
                          {pb.execution_steps.map((step: string, i: number) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
                                style={{ background: "rgba(27,58,45,0.08)", color: "#1B3A2D" }}>{i + 1}</span>
                              <p className="text-[12px] text-[#3A3935] leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Documents needed */}
                      {pb.documents_needed?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">Documents Needed from Client</p>
                          <div className="space-y-1">
                            {pb.documents_needed.map((doc: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-[12px] text-[#3A3935]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C5C2BB] shrink-0" />
                                {doc}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CRA forms */}
                      {pb.cra_forms?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">CRA / Revenu Québec Forms</p>
                          <div className="flex flex-wrap gap-1.5">
                            {pb.cra_forms.map((form: string, i: number) => (
                              <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(3,105,161,0.07)", color: "#0369a1", border: "1px solid rgba(3,105,161,0.15)" }}>
                                {form}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Draft template */}
                    {pb.draft_template && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Draft Template</p>
                          <button
                            onClick={() => copyDraft(pb.draft_template, pb.id)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition"
                            style={{
                              color: copied === pb.id ? "#2D7A50" : "#56554F",
                              borderColor: copied === pb.id ? "rgba(45,122,80,0.3)" : "#E8E6E1",
                            }}>
                            {copied === pb.id ? "✓ Copied" : "Copy"}
                          </button>
                        </div>
                        <div className="bg-[#FAFAF8] border border-[#E8E6E1] rounded-xl px-4 py-3 max-h-48 overflow-y-auto">
                          <pre className="text-[11px] text-[#3A3935] whitespace-pre-wrap leading-relaxed font-sans">
                            {pb.draft_template}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Notes</p>
                      <textarea
                        value={notes[pb.id] ?? (pb.notes || "")}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes((prev: Record<string,string>) => ({ ...prev, [pb.id]: e.target.value }))}
                        rows={2}
                        placeholder="Add notes about progress, client responses, blockers…"
                        className="w-full text-[12px] text-[#1A1A18] border border-[#E8E6E1] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20"
                      />
                    </div>

                    {/* Status actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#F0EFEB]">
                      {pb.status === "queued" && (
                        <button onClick={() => updateStatus(pb.id, "in_progress")}
                          disabled={saving === pb.id}
                          className="h-8 px-4 text-[11px] font-bold text-white rounded-lg disabled:opacity-50 transition hover:opacity-90"
                          style={{ background: "#C4841D" }}>
                          {saving === pb.id ? "Saving…" : "Start →"}
                        </button>
                      )}
                      {pb.status === "in_progress" && (
                        <button onClick={() => updateStatus(pb.id, "submitted")}
                          disabled={saving === pb.id}
                          className="h-8 px-4 text-[11px] font-bold text-white rounded-lg disabled:opacity-50 transition hover:opacity-90"
                          style={{ background: "#0369a1" }}>
                          {saving === pb.id ? "Saving…" : "Mark Submitted →"}
                        </button>
                      )}
                      {(pb.status === "submitted" || pb.status === "in_progress") && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={confirmedInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmAmounts((prev: Record<string,string>) => ({ ...prev, [pb.id]: e.target.value }))}
                            placeholder="Confirmed $"
                            className="h-8 w-28 text-[12px] border border-[#E8E6E1] rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-[#2D7A50]/30"
                          />
                          <button
                            onClick={() => {
                              const amt = parseFloat(confirmedInput);
                              if (!isNaN(amt)) updateStatus(pb.id, "confirmed", amt, notes[pb.id]);
                            }}
                            disabled={saving === pb.id || !confirmedInput}
                            className="h-8 px-4 text-[11px] font-bold text-white rounded-lg disabled:opacity-50 transition hover:opacity-90"
                            style={{ background: "#2D7A50" }}>
                            {saving === pb.id ? "Saving…" : "Confirm Recovery ✓"}
                          </button>
                        </div>
                      )}
                      {pb.status !== "queued" && (
                        <button
                          onClick={() => updateStatus(pb.id, pb.status, undefined, notes[pb.id])}
                          disabled={saving === pb.id}
                          className="h-8 px-3 text-[11px] font-medium text-[#8E8C85] border border-[#E8E6E1] rounded-lg hover:bg-[#F8F7F5] transition">
                          Save notes
                        </button>
                      )}
                      {pb.status === "confirmed" && (
                        <span className="text-[11px] font-semibold text-[#2D7A50]">
                          ✓ {fmtM(pb.confirmed_amount || pb.amount_recoverable)} recovered
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer total */}
        {playbooks.length > 0 && (
          <div className="mt-5 px-5 py-4 bg-white border border-[#E8E6E1] rounded-xl flex items-center justify-between"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Recovery Summary</p>
              <p className="text-[13px] font-semibold text-[#1A1A18] mt-0.5">
                {summary.by_status?.confirmed || 0} of {playbooks.length} findings confirmed
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#8E8C85]">Confirmed</div>
              <div className="font-serif text-[20px] font-bold text-[#2D7A50]">
                {fmtM(summary.confirmed || 0)}
              </div>
              <div className="text-[11px] text-[#8E8C85]">of {fmtM(summary.total_recoverable || 0)} identified</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
