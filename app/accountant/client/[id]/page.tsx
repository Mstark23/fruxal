// =============================================================================
// app/accountant/client/[id]/page.tsx
// Client detail page — deep-dive into a single client's findings, documents,
// AI chat, and notes. The [id] param is the pipeline_id.
// =============================================================================
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtM(n: number) {
  return n >= 1_000_000
    ? "$" + (n / 1_000_000).toFixed(1) + "M"
    : n >= 1_000
    ? "$" + Math.round(n / 1_000) + "K"
    : "$" + n.toLocaleString();
}

const SEV: Record<string, { dot: string; bg: string; text: string }> = {
  critical: { dot: "#B34040", bg: "rgba(179,64,64,0.07)", text: "#B34040" },
  high: { dot: "#C4841D", bg: "rgba(196,132,29,0.07)", text: "#C4841D" },
  medium: { dot: "#0369a1", bg: "rgba(3,105,161,0.07)", text: "#0369a1" },
  low: { dot: "#8E8C85", bg: "rgba(142,140,133,0.07)", text: "#8E8C85" },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  queued: { label: "Queued", color: "#8E8C85", bg: "rgba(142,140,133,0.08)" },
  in_progress: { label: "In Progress", color: "#C4841D", bg: "rgba(196,132,29,0.08)" },
  submitted: { label: "Submitted", color: "#0369a1", bg: "rgba(3,105,161,0.08)" },
  confirmed: { label: "Confirmed", color: "#2D7A50", bg: "rgba(45,122,80,0.08)" },
};

type Tab = "findings" | "documents" | "chat" | "notes";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const pipelineId = params.id;

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("findings");

  // Documents
  const [docReq, setDocReq] = useState<{ label: string; notes: string } | null>(null);
  const [docSending, setDocSending] = useState(false);
  const [docSent, setDocSent] = useState(false);

  // AI Chat
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Notes
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // ── Load data ───────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/accountant/queue");
      const data = await res.json();
      if (!data?.success) return;

      const pbs = (data.playbooks || []).filter(
        (p: any) => p.pipeline_id === pipelineId
      );

      if (pbs.length === 0) return;

      // Build client info from the first playbook
      const first = pbs[0];
      setClient({
        company_name: first.company_name || first.tier3_pipeline?.company_name || "Client",
        contact_name: first.contact_name || first.tier3_pipeline?.contact_name || "",
        contact_email: first.tier3_pipeline?.contact_email || "",
        industry: first.profile?.industry || first.tier3_pipeline?.industry || "",
        province: first.profile?.province || "",
        annual_revenue: first.profile?.exact_annual_revenue || first.profile?.annual_revenue || 0,
        rep_name: first.rep_name || "",
      });

      setPlaybooks(pbs);

      // Initialize notes from the first playbook that has notes
      const withNotes = pbs.find((p: any) => p.notes);
      if (withNotes) setNotes(withNotes.notes);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [pipelineId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── AI Chat ─────────────────────────────────────────────────────────────
  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    const newMessages = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`/api/accountant/client/${pipelineId}/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: chatMessages.slice(-6),
        }),
      });
      const data = await res.json();
      if (data?.message || data?.success) {
        setChatMessages([
          ...newMessages,
          { role: "assistant", content: data.message || "No response." },
        ]);
      } else {
        setChatMessages([
          ...newMessages,
          { role: "assistant", content: "Error: " + (data?.error || "Unknown error") },
        ]);
      }
    } catch {
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  // ── Save notes ──────────────────────────────────────────────────────────
  async function saveNotes() {
    if (!playbooks.length) return;
    setNotesSaving(true);
    try {
      await fetch("/api/accountant/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playbook_id: playbooks[0].id,
          notes,
        }),
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch {
      // silent
    } finally {
      setNotesSaving(false);
    }
  }

  // ── Document request ────────────────────────────────────────────────────
  async function sendDocRequest() {
    if (!docReq || !playbooks.length) return;
    setDocSending(true);
    try {
      await fetch("/api/accountant/request-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playbook_id: playbooks[0].id,
          document_label: docReq.label,
          notes: docReq.notes,
        }),
      });
      setDocSent(true);
      setDocReq(null);
      setTimeout(() => setDocSent(false), 3000);
    } catch {
      // silent
    } finally {
      setDocSending(false);
    }
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#EEECE8] border-t-[#1B3A2D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] font-semibold text-[#1A1A18] mb-2">Client not found</p>
          <p className="text-[12px] text-[#8E8C85] mb-4">
            This pipeline may not be assigned to you.
          </p>
          <a
            href="/accountant/dashboard"
            className="text-[12px] font-semibold text-[#1B3A2D] hover:underline"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  // Aggregate stats
  const totalRecoverable = playbooks.reduce(
    (s, p) => s + (p.amount_recoverable || 0),
    0
  );
  const totalConfirmed = playbooks
    .filter((p) => p.status === "confirmed")
    .reduce((s, p) => s + (p.confirmed_amount || p.amount_recoverable || 0), 0);

  // Unique documents from all playbooks
  const allDocs: { label: string; status: string; playbook: string }[] = [];
  playbooks.forEach((pb) => {
    (pb.documents_needed || []).forEach((d: string) => {
      if (!allDocs.find((x) => x.label === d)) {
        allDocs.push({ label: d, status: "needed", playbook: pb.finding_title });
      }
    });
  });

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "findings", label: "Findings", count: playbooks.length },
    { key: "documents", label: "Documents", count: allDocs.length },
    { key: "chat", label: "AI Chat" },
    { key: "notes", label: "Notes" },
  ];

  const CHAT_STARTERS = [
    "What are the highest-value opportunities for this client?",
    "Are there any compliance risks I should address first?",
    "Summarize the extracted T2 data and flag discrepancies.",
    "What documents am I still missing?",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* ── Back button ───────────────────────────────────────────────────── */}
      <a
        href="/accountant/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#8E8C85] hover:text-[#1A1A18] transition mb-5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to dashboard
      </a>

      {/* ── Client header ─────────────────────────────────────────────────── */}
      <div
        className="bg-white border border-[#E5E3DD] rounded-xl px-5 sm:px-6 py-5 mb-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[18px] sm:text-[20px] font-bold text-[#1A1A18] mb-1">
              {client.company_name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#8E8C85]">
              {client.contact_name && (
                <span className="font-medium">{client.contact_name}</span>
              )}
              {client.industry && (
                <>
                  <span className="text-[#D4D2CC]">|</span>
                  <span>{client.industry}</span>
                </>
              )}
              {client.province && (
                <>
                  <span className="text-[#D4D2CC]">|</span>
                  <span>{client.province}</span>
                </>
              )}
              {client.rep_name && (
                <>
                  <span className="text-[#D4D2CC]">|</span>
                  <span>Rep: {client.rep_name}</span>
                </>
              )}
            </div>
          </div>

          {/* KPI summary */}
          <div className="flex gap-4 shrink-0">
            <div className="text-center sm:text-right">
              <div className="text-[18px] font-bold text-[#B34040]">
                {fmtM(totalRecoverable)}
              </div>
              <div className="text-[10px] text-[#8E8C85]">Recoverable</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-[18px] font-bold text-[#2D7A50]">
                {fmtM(totalConfirmed)}
              </div>
              <div className="text-[10px] text-[#8E8C85]">Confirmed</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-[18px] font-bold text-[#1A1A18]">
                {playbooks.length}
              </div>
              <div className="text-[10px] text-[#8E8C85]">Findings</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 text-[12px] font-semibold rounded-lg transition whitespace-nowrap"
            style={{
              background: tab === t.key ? "#1B3A2D" : "white",
              color: tab === t.key ? "white" : "#8E8C85",
              border: tab === t.key ? "none" : "1px solid #E5E3DD",
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: tab === t.key ? "rgba(255,255,255,0.2)" : "rgba(142,140,133,0.1)",
                  color: tab === t.key ? "white" : "#8E8C85",
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: Findings ─────────────────────────────────────────────────── */}
      {tab === "findings" && (
        <div className="space-y-2">
          {playbooks.length === 0 && (
            <div
              className="bg-white border border-[#E5E3DD] rounded-xl px-6 py-10 text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
            >
              <p className="text-[13px] font-semibold text-[#1A1A18]">
                No findings yet
              </p>
              <p className="text-[11px] text-[#8E8C85] mt-1">
                Findings will appear here once assigned.
              </p>
            </div>
          )}
          {playbooks.map((pb) => {
            const sev = SEV[pb.severity] || SEV.low;
            const sm = STATUS_META[pb.status] || STATUS_META.queued;
            return (
              <div
                key={pb.id}
                className="bg-white border border-[#E5E3DD] rounded-xl overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
              >
                <div className="px-5 py-4 flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                    style={{ background: sev.dot }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[13px] font-semibold text-[#1A1A18]">
                        {pb.finding_title}
                      </span>
                      {pb.quick_win && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: "rgba(45,122,80,0.08)",
                            color: "#2D7A50",
                          }}
                        >
                          Quick win
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#8E8C85] flex-wrap">
                      <span>{pb.category}</span>
                      {pb.estimated_hours && (
                        <>
                          <span>·</span>
                          <span>~{pb.estimated_hours}h</span>
                        </>
                      )}
                      <span>·</span>
                      <span
                        className="font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: sm.bg, color: sm.color }}
                      >
                        {sm.label}
                      </span>
                    </div>

                    {/* Execution steps preview */}
                    {pb.execution_steps?.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {pb.execution_steps.slice(0, 3).map((step: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold"
                              style={{
                                background: "rgba(27,58,45,0.08)",
                                color: "#1B3A2D",
                              }}
                            >
                              {i + 1}
                            </span>
                            <p className="text-[11px] text-[#56554F] leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                        {pb.execution_steps.length > 3 && (
                          <p className="text-[10px] text-[#B5B3AD] ml-6">
                            +{pb.execution_steps.length - 3} more steps
                          </p>
                        )}
                      </div>
                    )}

                    {/* CRA forms */}
                    {pb.cra_forms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pb.cra_forms.map((f: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(3,105,161,0.07)",
                              color: "#0369a1",
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-bold text-[#B34040]">
                      {fmtM(pb.amount_recoverable)}
                    </div>
                    {pb.confirmed_amount > 0 && (
                      <div className="text-[11px] font-semibold text-[#2D7A50]">
                        Confirmed: {fmtM(pb.confirmed_amount)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: Documents ────────────────────────────────────────────────── */}
      {tab === "documents" && (
        <div>
          {/* Request button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setDocReq({ label: "", notes: "" })}
              className="h-8 px-4 text-[11px] font-bold text-white rounded-lg transition hover:opacity-90"
              style={{ background: "#1B3A2D" }}
            >
              + Request Document
            </button>
          </div>

          {docSent && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-[12px] font-semibold"
              style={{
                background: "rgba(45,122,80,0.06)",
                border: "1px solid rgba(45,122,80,0.15)",
                color: "#2D7A50",
              }}
            >
              Document request sent to client.
            </div>
          )}

          {allDocs.length === 0 && !docSent && (
            <div
              className="bg-white border border-[#E5E3DD] rounded-xl px-6 py-10 text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
            >
              <p className="text-[13px] font-semibold text-[#1A1A18]">
                No documents listed
              </p>
              <p className="text-[11px] text-[#8E8C85] mt-1">
                Use the button above to request documents from the client.
              </p>
            </div>
          )}

          {allDocs.length > 0 && (
            <div className="space-y-2">
              {allDocs.map((doc, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-3 flex items-center gap-3"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                >
                  <div className="w-8 h-8 rounded-lg bg-[rgba(3,105,161,0.06)] flex items-center justify-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0369a1"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1A1A18] truncate">
                      {doc.label}
                    </p>
                    <p className="text-[11px] text-[#8E8C85] truncate">
                      For: {doc.playbook}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{
                      background:
                        doc.status === "received"
                          ? "rgba(45,122,80,0.08)"
                          : "rgba(196,132,29,0.08)",
                      color:
                        doc.status === "received" ? "#2D7A50" : "#C4841D",
                    }}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Document request modal */}
          {docReq && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
              }}
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <p className="text-[14px] font-bold text-[#1A1A18] mb-1">
                  Request a document
                </p>
                <p className="text-[12px] text-[#8E8C85] mb-4">
                  An email will be sent to the client automatically.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8E8C85] mb-1">
                      Document name *
                    </label>
                    <input
                      value={docReq.label}
                      onChange={(e) =>
                        setDocReq((prev) =>
                          prev ? { ...prev, label: e.target.value } : null
                        )
                      }
                      placeholder="e.g. T2 Corporate Return 2023"
                      className="w-full text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8E8C85] mb-1">
                      Additional notes
                    </label>
                    <textarea
                      value={docReq.notes}
                      onChange={(e) =>
                        setDocReq((prev) =>
                          prev ? { ...prev, notes: e.target.value } : null
                        )
                      }
                      rows={2}
                      placeholder="Any specific pages, year, format..."
                      className="w-full text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDocReq(null)}
                    className="flex-1 h-9 text-[12px] font-medium text-[#8E8C85] border border-[#E5E3DD] rounded-lg hover:bg-[#FAFAF8] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendDocRequest}
                    disabled={!docReq.label || docSending}
                    className="flex-1 h-9 text-[12px] font-bold text-white rounded-lg disabled:opacity-40 transition hover:opacity-90"
                    style={{ background: "#1B3A2D" }}
                  >
                    {docSending ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: AI Chat ──────────────────────────────────────────────────── */}
      {tab === "chat" && (
        <div
          className="bg-white border border-[#E5E3DD] rounded-xl overflow-hidden flex flex-col"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            height: "min(600px, calc(100vh - 340px))",
            minHeight: 400,
          }}
        >
          {/* Chat header */}
          <div className="px-5 py-3 border-b border-[#F0EFEB] flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(27,58,45,0.08)" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1B3A2D"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#1A1A18]">
                AI Tax Advisor
              </p>
              <p className="text-[10px] text-[#8E8C85]">
                {client.company_name} context loaded
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[13px] font-semibold text-[#1A1A18] mb-2">
                  Ask anything about this client
                </p>
                <p className="text-[11px] text-[#8E8C85] mb-5">
                  The AI has full context: findings, documents, financials.
                </p>
                <div className="flex flex-col gap-2 max-w-md mx-auto">
                  {CHAT_STARTERS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setChatInput(s);
                      }}
                      className="text-left text-[12px] text-[#56554F] px-4 py-2.5 rounded-lg border border-[#E5E3DD] hover:bg-[#FAFAF8] transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className="max-w-[80%] px-4 py-3 rounded-xl"
                  style={
                    msg.role === "user"
                      ? {
                          background: "#1B3A2D",
                          color: "white",
                        }
                      : {
                          background: "#FAFAF8",
                          border: "1px solid #F0EFEB",
                          color: "#1A1A18",
                        }
                  }
                >
                  <p className="text-[12px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-xl"
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #F0EFEB",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "#8E8C85", animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "#8E8C85", animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "#8E8C85", animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#F0EFEB] px-4 py-3">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChat();
                  }
                }}
                placeholder="Ask about findings, tax strategy, compliance..."
                className="flex-1 text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20"
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim() || chatLoading}
                className="h-[38px] px-4 text-[11px] font-bold text-white rounded-lg disabled:opacity-40 transition hover:opacity-90"
                style={{ background: "#1B3A2D" }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Notes ────────────────────────────────────────────────────── */}
      {tab === "notes" && (
        <div
          className="bg-white border border-[#E5E3DD] rounded-xl px-5 sm:px-6 py-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A18]">
                Client Notes
              </p>
              <p className="text-[11px] text-[#8E8C85] mt-0.5">
                Internal notes for your reference. Saved per finding.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {notesSaved && (
                <span className="text-[11px] font-semibold text-[#2D7A50]">
                  Saved
                </span>
              )}
              <button
                onClick={saveNotes}
                disabled={notesSaving}
                className="h-8 px-4 text-[11px] font-bold text-white rounded-lg disabled:opacity-50 transition hover:opacity-90"
                style={{ background: "#1B3A2D" }}
              >
                {notesSaving ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={12}
            placeholder="Progress notes, CRA reference numbers, blockers, follow-up items..."
            className="w-full text-[13px] leading-relaxed border border-[#E5E3DD] rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20"
            style={{ minHeight: 260 }}
          />
        </div>
      )}
    </div>
  );
}
