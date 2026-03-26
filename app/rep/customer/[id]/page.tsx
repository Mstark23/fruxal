// =============================================================================
// app/rep/customer/[id]/page.tsx — Rep Client Detail View
// =============================================================================
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

const fmtM = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${Math.round(n / 1_000)}K`
  : `$${(n ?? 0).toLocaleString()}`;

const SEV: Record<string, { dot: string; text: string; bg: string }> = {
  critical: { dot:"#B34040", text:"#B34040", bg:"rgba(179,64,64,0.07)"  },
  high:     { dot:"#C4841D", text:"#C4841D", bg:"rgba(196,132,29,0.07)" },
  medium:   { dot:"#0369a1", text:"#0369a1", bg:"rgba(3,105,161,0.07)"  },
  low:      { dot:"#8E8C85", text:"#8E8C85", bg:"rgba(142,140,133,0.07)"},
};

const STAGE_NEXT: Record<string, { label: string; next: string }[]> = {
  lead:              [{ label:"Mark as Contacted",    next:"contacted"        }],
  contacted:         [{ label:"Send Diagnostic",      next:"diagnostic_sent"  }, { label:"Book a Call",      next:"call_booked"      }],
  diagnostic_sent:   [{ label:"Call Booked",          next:"call_booked"      }],
  call_booked:       [{ label:"Start Engagement",     next:"in_engagement"    }],
  engaged:           [{ label:"Move to Engagement",   next:"in_engagement"    }],
  in_engagement:     [{ label:"Recovery Tracking",    next:"recovery_tracking"}],
  recovery_tracking: [{ label:"Mark Completed",       next:"completed"        }],
  completed:         [],
};

type Tab = "overview" | "findings" | "documents" | "savings" | "outreach";

export default function RepCustomerPage() {
  const router = useRouter();
  const { id: diagId } = useParams() as { id: string };

  const [client,  setClient]  = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<Tab>("overview");
  const [saving,  setSaving]  = useState(false);
  const [noteText,setNoteText]= useState("");
  const [followUp,setFollowUp]= useState("");
  const [newFinding, setNewFinding] = useState({ leakName:"", category:"", confirmedAmount:"", estimatedLow:"", estimatedHigh:"", confidenceNote:"" });
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [toast, setToast] = useState<string|null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  async function sendClientAccess() {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const r = await fetch(`/api/rep/customer/${diagId}/invite`, {
        credentials: "include", method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientEmail: inviteEmail, clientName: inviteName }),
      });
      const json = await r.json();
      if (json.success) {
        showToast("Access link sent to " + inviteEmail);
        setShowInvite(false);
        setInviteEmail(""); setInviteName("");
      } else {
        showToast("Error: " + (json.error || "Failed to send"));
      }
    } catch { showToast("Failed to send invite"); }
    setInviting(false);
  }

  const load = useCallback(() => {
    fetch(`/api/rep/customer/${diagId}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.success) {
          setClient(d.client);
          setNoteText(d.client.pipeline?.notes || "");
          setFollowUp(d.client.pipeline?.followUpDate?.split("T")[0] || "");
        } else {
          router.replace("/rep/dashboard");
        }
      })
      .finally(() => setLoading(false));
  }, [diagId]);

  useEffect(() => { load(); }, [load]);

  const advanceStage = async (next: string) => {
    setSaving(true);
    const r = await fetch(`/api/rep/customer/${diagId}/stage`, {
      credentials: "include", method: "PATCH", headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ stage: next }),
    });
    setSaving(false);
    if (r.ok) { showToast("Stage updated"); load(); }
    else { const e = await r.json(); showToast(e.error || "Failed"); }
  };

  const saveNote = async () => {
    setSaving(true);
    await fetch(`/api/rep/customer/${diagId}/note`, {
      credentials: "include", method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ note: noteText, followUpDate: followUp || null }),
    });
    setSaving(false);
    showToast("Note saved");
    load();
  };

  const toggleDocument = async (docId: string, current: string) => {
    const next = (current === "received" || current === "reviewed") ? "pending" : "received";
    await fetch(`/api/rep/customer/${diagId}/document`, {
      credentials: "include", method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ documentId: docId, status: next }),
    });
    load();
  };

  const addFinding = async () => {
    if (!newFinding.leakName || !newFinding.confirmedAmount) return;
    setSaving(true);
    const r = await fetch(`/api/rep/customer/${diagId}/finding`, {
      credentials: "include", method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        leakName:       newFinding.leakName,
        category:       newFinding.category,
        confirmedAmount:Number(newFinding.confirmedAmount),
        estimatedLow:   Number(newFinding.estimatedLow) || 0,
        estimatedHigh:  Number(newFinding.estimatedHigh) || 0,
        confidenceNote: newFinding.confidenceNote,
      }),
    });
    setSaving(false);
    if (r.ok) {
      showToast("Finding logged");
      setNewFinding({ leakName:"", category:"", confirmedAmount:"", estimatedLow:"", estimatedHigh:"", confidenceNote:"" });
      setShowFindingForm(false);
      load();
    }
  };

  const deleteFinding = async (findingId: string) => {
    await fetch(`/api/rep/customer/${diagId}/finding`, {
      credentials: "include", method:"DELETE", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ findingId }),
    });
    showToast("Finding removed");
    load();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" />
    </div>
  );

  if (!client) return null;

  const scores  = client.diagnostic?.scores  || {};
  const totals  = client.diagnostic?.totals  || {};
  const stage   = client.pipeline?.stage     || "lead";
  const nextSteps = STAGE_NEXT[stage] || [];

  const TABS: { key: Tab; label: string }[] = [
    { key:"overview",  label:"Overview"  },
    { key:"findings",  label:`Findings (${(client.diagnostic?.findings||[]).length})` },
    { key:"documents", label:`Documents (${client.documents?.length ?? 0})`   },
    { key:"savings",   label:`Savings (${client.confirmedFindings?.length ?? 0})` },
    { key:"outreach",  label:"Outreach"  },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1B3A2D] text-white text-[12px] font-semibold px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[1100px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.push("/rep/dashboard")}
              className="flex items-center gap-1.5 text-[11px] text-[#8E8C85] hover:text-[#1B3A2D] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              All Clients
            </button>
            <span className="text-[#E5E3DD]">/</span>
            <span className="text-[11px] text-[#1A1A18] font-medium">{client.companyName}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[18px] font-bold text-[#1A1A18]">{client.companyName}</h1>
              <p className="text-[11px] text-[#8E8C85] mt-0.5">
                {client.industry} · {client.province} · {client.revenueBracket}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                style={{ background:"rgba(27,58,45,0.08)", color:"#1B3A2D" }}>
                {stage.replace(/_/g," ").replace(/\b\w/g,(l: string) => l.toUpperCase())}
              </span>
              {nextSteps.map((s: any) => (
                <button key={s.next} onClick={() => advanceStage(s.next)} disabled={saving}
                  className="text-[10px] font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 transition"
                  style={{ background:"#1B3A2D" }}>
                  {s.label} →
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1 mt-4 border-b border-[#E5E3DD] -mb-px">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="text-[11px] font-semibold px-3 py-2 border-b-2 transition-colors"
                style={{
                  borderColor: tab === t.key ? "#1B3A2D" : "transparent",
                  color:       tab === t.key ? "#1B3A2D" : "#8E8C85",
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-6">

        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:"Health Score",      val:scores.overall ? `${scores.overall}/100` : "—" },
                { label:"Annual Leak",       val:fmtM(totals.annual_leaks ?? 0)                    },
                { label:"Potential Savings", val:fmtM(totals.potential_savings ?? 0)               },
                { label:"My Commission",     val:fmtM(client.savings?.myCommission ?? 0)           },
              ].map(k => (
                <div key={k.label} className="bg-white border border-[#E5E3DD] rounded-xl px-4 py-3" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                  <p className="text-[9px] font-bold text-[#8E8C85] uppercase tracking-wider">{k.label}</p>
                  <p className="text-[18px] font-bold text-[#1A1A18] mt-1">{k.val}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Diagnostic Scores</p>
              <div className="space-y-2.5">
                {[
                  ["Compliance",    scores.compliance    ],
                  ["Efficiency",    scores.efficiency    ],
                  ["Optimization",  scores.optimization  ],
                  ["Growth",        scores.growth        ],
                  ["Bankability",   scores.bankability   ],
                  ["Exit Readiness",scores.exit_readiness],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex items-center gap-3">
                    <span className="text-[10px] text-[#56554F] w-28 shrink-0">{label}</span>
                    <div className="flex-1 h-[5px] bg-[#F0EFEB] rounded-full">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width:val ?? 0 + "%", background:(val ?? 0)>=70?"#2D7A50":(val ?? 0)>=50?"#C4841D":"#B34040" }} />
                    </div>
                    <span className="text-[10px] font-semibold text-[#1A1A18] w-8 text-right">{val ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {client.diagnostic?.execSummary && (
              <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">Executive Summary</p>
                <p className="text-[12px] text-[#56554F] leading-relaxed">{client.diagnostic.execSummary}</p>
              </div>
            )}

            <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Contact & Notes</p>
              {client.pipeline?.contactName && (
                <div className="grid grid-cols-2 gap-3 mb-4 text-[11px]">
                  <div><span className="text-[#8E8C85]">Contact: </span><span className="font-medium text-[#1A1A18]">{client.pipeline.contactName}</span></div>
                  {client.pipeline.contactEmail && <div><a href={`mailto:${client.pipeline.contactEmail}`} className="text-[#1B3A2D] hover:underline">{client.pipeline.contactEmail}</a></div>}
                  {client.pipeline.contactPhone && <div><a href={`tel:${client.pipeline.contactPhone}`} className="text-[#56554F]">{client.pipeline.contactPhone}</a></div>}
                  {client.pipeline.annualRevenue && <div><span className="text-[#8E8C85]">Revenue: </span><span className="font-medium">${Number(client.pipeline.annualRevenue).toLocaleString()}</span></div>}
                </div>
              )}
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3}
                placeholder="Add notes about this client..."
                className="w-full text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 bg-[#FAFAF8] text-[#1A1A18] placeholder-[#B5B3AD] focus:outline-none focus:border-[#1B3A2D] resize-none mb-2" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-[#8E8C85]">Follow-up date</label>
                  <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)}
                    className="text-[11px] border border-[#E5E3DD] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#1B3A2D]" />
                </div>
                <button onClick={saveNote} disabled={saving}
                  className="ml-auto text-[11px] font-semibold px-4 py-1.5 rounded-lg text-white disabled:opacity-50"
                  style={{ background:"#1B3A2D" }}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "findings" && (
          <div className="space-y-3">
            {(client.diagnostic?.findings || []).map((f: any, i: number) => {
              const sev = SEV[f.severity] || SEV["medium"];
              return (
                <div key={i} className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background:sev.dot }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-[#1A1A18]">{f.title}</p>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ color:sev.text, background:sev.bg }}>
                          {(f.severity||"").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8E8C85] mt-0.5">{f.category}</p>
                      {f.description && <p className="text-[11px] text-[#56554F] mt-1.5 leading-relaxed">{f.description}</p>}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[11px] font-semibold text-[#B34040]">
                          {fmtM(f.impact_min??0)} – {fmtM(f.impact_max??0)}/yr
                        </span>
                        {f.timeline && <span className="text-[9px] text-[#8E8C85]">Timeline: {f.timeline}</span>}
                      </div>
                      {f.recommendation && (
                        <p className="text-[10px] text-[#56554F] mt-1.5 italic">{f.recommendation}</p>
                      )}

                      {/* Solution steps — rep-only */}
                      {f.action_items && f.action_items.length > 0 && (
                        <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.10)" }}>
                          <p className="text-[9px] font-bold text-[#2D7A50] uppercase tracking-wider mb-2">Fix Steps</p>
                          <div className="space-y-1.5">
                            {f.action_items.map((step: string, si: number) => (
                              <div key={si} className="flex gap-2">
                                <span className="text-[9px] font-bold text-[#2D7A50] mt-0.5 shrink-0">{si + 1}.</span>
                                <span className="text-[11px] text-[#56554F] leading-snug">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Affiliate / tool recommendations */}
                      {f.affiliates && f.affiliates.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[9px] font-bold text-[#8E8C85] uppercase tracking-wider mb-1.5">Recommended Tools</p>
                          <div className="flex flex-wrap gap-1.5">
                            {f.affiliates.map((a: any, ai: number) => (
                              <a key={ai} href={a.url} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition hover:opacity-80"
                                style={{ color: "#1B3A2D", borderColor: "rgba(27,58,45,0.2)", background: "rgba(27,58,45,0.04)" }}>
                                {a.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "documents" && (
          <div className="space-y-3">
            {!client.engagement ? (
              <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-8 text-center" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[13px] font-semibold text-[#1A1A18] mb-1">No Active Engagement</p>
                <p className="text-[11px] text-[#8E8C85]">Document checklist will appear once an engagement is created by admin.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-[#56554F]">
                    <span className="font-semibold text-[#2D7A50]">{client.engagement.docsReceived}</span> of {client.engagement.docsTotal} received
                  </p>
                </div>
                {(client.documents || []).map((doc: any) => {
                  const isOk = doc.status === "received" || doc.status === "reviewed";
                  return (
                    <div key={doc.id} className="bg-white border border-[#E5E3DD] rounded-xl px-4 py-3 flex items-center gap-3" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                      <button onClick={() => toggleDocument(doc.id, doc.status)}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                        style={{ borderColor:isOk?"#2D7A50":"#E5E3DD", background:isOk?"rgba(45,122,80,0.08)":"white" }}>
                        {isOk && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#1A1A18]">{doc.label || doc.document_type}</p>
                        {doc.received_at && <p className="text-[9px] text-[#8E8C85]">Received {new Date(doc.received_at).toLocaleDateString("en-CA",{month:"short",day:"numeric"})}</p>}
                        {doc.notes && <p className="text-[9px] text-[#B5B3AD] italic">{doc.notes}</p>}
                      </div>
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background:isOk?"rgba(45,122,80,0.08)":"rgba(142,140,133,0.08)", color:isOk?"#2D7A50":"#8E8C85" }}>
                        {isOk ? "Received" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {tab === "savings" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Confirmed Savings",  val:fmtM(client.savings?.confirmed ?? 0)   },
                { label:`Fee (${client.savings?.feePercentage||12}%)`, val:fmtM(client.savings?.feeOwed ?? 0) },
                { label:"My Commission",      val:fmtM(client.savings?.myCommission ?? 0) },
              ].map(k => (
                <div key={k.label} className="bg-white border border-[#E5E3DD] rounded-xl px-4 py-3" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                  <p className="text-[9px] font-bold text-[#8E8C85] uppercase tracking-wider">{k.label}</p>
                  <p className="text-[18px] font-bold text-[#1A1A18] mt-1">{k.val}</p>
                </div>
              ))}
            </div>

            {(client.confirmedFindings||[]).map((f: any) => (
              <div key={f.id} className="bg-white border border-[#E5E3DD] rounded-xl px-4 py-3 flex items-center gap-3" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#1A1A18]">{f.leak_name}</p>
                  <p className="text-[9px] text-[#8E8C85]">{f.category}{f.confidence_note ? ` · ${f.confidence_note}` : ""}</p>
                </div>
                <p className="text-[14px] font-bold shrink-0" style={{ color:"#2D7A50" }}>{fmtM(f.confirmed_amount)}</p>
                <button onClick={() => deleteFinding(f.id)} className="text-[#B5B3AD] hover:text-[#B34040] transition-colors ml-1 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            ))}

            {!client.engagement ? (
              <p className="text-[11px] text-[#8E8C85] text-center py-4">No active engagement — savings tracking starts once engagement is created.</p>
            ) : (
              <>
                {showFindingForm ? (
                  <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4 space-y-3" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                    <p className="text-[11px] font-bold text-[#1A1A18]">Log Confirmed Saving</p>
                    <input placeholder="Finding name (e.g. Payroll Tax Mismatch)" value={newFinding.leakName}
                      onChange={e => setNewFinding(p=>({...p,leakName:e.target.value}))}
                      className="w-full text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D]" />
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Category (e.g. Tax)" value={newFinding.category}
                        onChange={e => setNewFinding(p=>({...p,category:e.target.value}))}
                        className="text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D]" />
                      <input placeholder="Confirmed amount ($)" type="number" value={newFinding.confirmedAmount}
                        onChange={e => setNewFinding(p=>({...p,confirmedAmount:e.target.value}))}
                        className="text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D]" />
                    </div>
                    <input placeholder="Confidence note (optional)" value={newFinding.confidenceNote}
                      onChange={e => setNewFinding(p=>({...p,confidenceNote:e.target.value}))}
                      className="w-full text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D]" />
                    <div className="flex gap-2">
                      <button onClick={addFinding} disabled={saving || !newFinding.leakName || !newFinding.confirmedAmount}
                        className="text-[11px] font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-40"
                        style={{ background:"#1B3A2D" }}>
                        {saving ? "Saving…" : "Log Finding"}
                      </button>
                      <button onClick={() => setShowFindingForm(false)} className="text-[11px] text-[#8E8C85] px-3 py-2 hover:text-[#1A1A18]">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowFindingForm(true)}
                    className="w-full bg-white border border-dashed border-[#1B3A2D]/30 rounded-xl px-5 py-3 text-[11px] font-semibold text-[#1B3A2D] hover:bg-[#F0EFEB] transition-colors">
                    + Log Confirmed Saving
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {tab === "outreach" && (
          <div className="space-y-4">
            {client.diagnostic?.outreachEmail ? (
              <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">AI-Generated Outreach Email</p>
                  <button onClick={() => navigator.clipboard?.writeText(client.diagnostic.outreachEmail)}
                    className="text-[10px] font-semibold text-[#1B3A2D] hover:underline">
                    Copy →
                  </button>
                </div>
                <pre className="text-[11px] text-[#56554F] whitespace-pre-wrap font-sans leading-relaxed border border-[#F0EFEB] rounded-lg p-4 bg-[#FAFAF8]">
                  {client.diagnostic.outreachEmail}
                </pre>
                {client.pipeline?.contactEmail && (
                  <a href={`mailto:${client.pipeline.contactEmail}?subject=${encodeURIComponent(`Financial opportunity for ${client.companyName}`)}&body=${encodeURIComponent(client.diagnostic.outreachEmail)}`}
                    className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-white px-4 py-2 rounded-lg"
                    style={{ background:"#1B3A2D" }}>
                    Open in Email →
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-8 text-center" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[12px] text-[#8E8C85]">No outreach email generated for this diagnostic yet.</p>
              </div>
            )}

            {(client.pipeline?.contactEmail || client.pipeline?.contactPhone) && (
              <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Quick Contact</p>
                <div className="flex gap-3">
                  {client.pipeline.contactEmail && (
                    <a href={`mailto:${client.pipeline.contactEmail}`}
                      className="text-[11px] font-semibold px-4 py-2 rounded-lg border border-[#E5E3DD] text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors">
                      Email Contact
                    </a>
                  )}
                  {client.pipeline.contactPhone && (
                    <a href={`tel:${client.pipeline.contactPhone}`}
                      className="text-[11px] font-semibold px-4 py-2 rounded-lg border border-[#E5E3DD] text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors">
                      Call {client.pipeline.contactPhone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
