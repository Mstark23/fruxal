// =============================================================================
// app/rep/customer/[id]/page.tsx — Rep Client Detail View
// =============================================================================
"use client";
import React, { useState, useEffect, useCallback } from "react";
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
  call_booked:       [{ label:"Send Agreement",       next:"agreement_out"    }],
  agreement_out:     [{ label:"Mark as Signed",       next:"signed"           }],
  signed:            [{ label:"Start Engagement",     next:"in_engagement"    }],
  engaged:           [{ label:"Move to Engagement",   next:"in_engagement"    }],
  in_engagement:     [{ label:"Recovery Tracking",    next:"recovery_tracking"}],
  recovery_tracking: [{ label:"Mark Fee Collected",   next:"fee_collected"    }],
  fee_collected:     [{ label:"Mark Completed",       next:"completed"        }],
  completed:         [],
};

type Tab = "overview" | "findings" | "documents" | "savings" | "debrief" | "outreach" | "messages";

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
  const [showDocReq, setShowDocReq] = useState(false);
  const [docReqType, setDocReqType] = useState("");
  const [docReqLabel, setDocReqLabel] = useState("");
  const [docReqNotes, setDocReqNotes] = useState("");
  const [docReqSending, setDocReqSending] = useState(false);
  const [callPrep, setCallPrep] = useState<any>(null);
  const [callPrepLoading, setCallPrepLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgText, setMsgText] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [debriefOutcome, setDebriefOutcome] = useState<"ready_to_sign"|"needs_time"|"not_interested"|"">("");
  const [debriefConcerns, setDebriefConcerns] = useState("");
  const [debriefNotes, setDebriefNotes] = useState("");
  const [debriefFindings, setDebriefFindings] = useState<string[]>([]);
  const [debriefSubmitting, setDebriefSubmitting] = useState(false);
  const [debriefDone, setDebriefDone] = useState(false);
  const [debriefResult, setDebriefResult] = useState<any>(null);
  const [repInfo, setRepInfo] = useState<any>(null);
  const [recommending, setRecommending] = useState<string|null>(null);
  const [recommendedSlugs, setRecommendedSlugs] = useState<Set<string>>(new Set());

  // Sales Scripts state
  type ScriptTab = "cold_outreach" | "post_prescan" | "review_call" | "objection_handling";
  const [showScripts, setShowScripts] = useState(false);
  const [scriptType, setScriptType] = useState<ScriptTab>("cold_outreach");
  const [scripts, setScripts] = useState<any>(null);
  const [scriptsLoading, setScriptsLoading] = useState(false);
  const [scriptsIndustryTag, setScriptsIndustryTag] = useState<string|null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number|null>(null);
  const [emailSentIdx, setEmailSentIdx] = useState<number|null>(null);
  const [emailSending, setEmailSending] = useState<number|null>(null);

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
    fetch("/api/rep/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.rep) setRepInfo(d.rep); })
      .catch(() => {});

    fetch(`/api/rep/customer/${diagId}/messages`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.messages) setMessages(d.messages); })
      .catch(() => {});

    fetch(`/api/rep/customer/${diagId}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.success) {
          setClient(d.client);
          setNoteText(d.client.pipeline?.notes || "");
          setFollowUp(d.client.pipeline?.followUpDate?.split("T")[0] || "");
          if (d.client.pipeline?.stage === "call_booked") setTab("debrief");
        } else {
          router.replace("/rep/dashboard");
        }
      })
      .finally(() => setLoading(false));
  }, [diagId]);

  useEffect(() => { load(); }, [load]);

  const sendBookingLink = async () => {
    if (!repInfo?.calendly_url || !client.pipeline?.contactEmail) return;
    setSaving(true);
    try {
      await fetch(`/api/rep/customer/${diagId}/note`, {
        credentials: "include", method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: `Booking link sent: ${repInfo.calendly_url}` }),
      });
      // Open email client with pre-filled booking invite
      const subject = encodeURIComponent(`Book your Fruxal recovery call — ${client.companyName}`);
      const body = encodeURIComponent(
        `Hi ${client.pipeline.contactName || "there"},

` +
        `I've been reviewing your Fruxal diagnostic results and I'd like to connect to walk through the findings.

` +
        `Use this link to book a time that works for you:
${repInfo.calendly_url}

` +
        `The call takes about 20 minutes. I'll walk you through exactly what we found and what recovery looks like.

` +
        `No cost unless we recover money — our fee is ${repInfo?.commission_rate || 12}% of confirmed savings.

` +
        `Looking forward to connecting,
${repInfo?.name || 'Your Fruxal rep'}`
      );
      window.open(`mailto:${client.pipeline.contactEmail}?subject=${subject}&body=${body}`);
    } finally { setSaving(false); }
  };

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

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    setMsgSending(true);
    try {
      const r = await fetch(`/api/rep/customer/${diagId}/messages`, {
        credentials: "include", method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msgText, authorName: repInfo?.name || "Rep" }),
      });
      const j = await r.json();
      if (j.success) {
        setMessages(prev => [...prev, j.message]);
        setMsgText("");
      }
    } finally { setMsgSending(false); }
  };

  const generateCallPrep = async () => {
    setCallPrepLoading(true);
    try {
      const r = await fetch(`/api/rep/customer/${diagId}/call-prep`, {
        credentials: "include", method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const j = await r.json();
      if (j.success) setCallPrep(j.callPrep);
    } finally { setCallPrepLoading(false); }
  };

  const fetchScripts = async (type: ScriptTab) => {
    setScriptsLoading(true);
    try {
      const r = await fetch(`/api/rep/customer/${diagId}/scripts?type=${type}`, {
        credentials: "include",
      });
      const j = await r.json();
      if (j.success) {
        setScripts(j.script || j.scripts);
        setScriptsIndustryTag(j.context?.industryMatch || j.industryTag || null);
      }
    } catch { /* ignore */ }
    setScriptsLoading(false);
  };

  const handleScriptTabChange = (type: ScriptTab) => {
    setScriptType(type);
    fetchScripts(type);
  };

  const copyScript = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const sendScriptEmail = async (subject: string, body: string, idx: number) => {
    if (!client?.pipeline?.contactEmail) { showToast("No contact email for this client"); return; }
    setEmailSending(idx);
    try {
      const r = await fetch(`/api/rep/customer/${diagId}/send-email`, {
        credentials: "include", method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const j = await r.json();
      if (j.success) {
        setEmailSentIdx(idx);
        setTimeout(() => setEmailSentIdx(null), 3000);
      } else {
        showToast("Failed: " + (j.error || "Unknown error"));
      }
    } catch { showToast("Failed to send email"); }
    setEmailSending(null);
  };

  // Helper: detect if a script key is an email template and resolve its subject
  const getEmailMeta = (key: string, scriptObj: any): { subject: string } | null => {
    const k = key.toLowerCase();
    if (k === "email_body" && scriptObj?.email_subject) return { subject: scriptObj.email_subject };
    if (k === "day1_email" && scriptObj?.email_subjects?.day1) return { subject: scriptObj.email_subjects.day1 };
    if (k === "day3_email" && scriptObj?.email_subjects?.day3) return { subject: scriptObj.email_subjects.day3 };
    if (k === "day7_email" && scriptObj?.email_subjects?.day7) return { subject: scriptObj.email_subjects.day7 };
    return null;
  };

  const requestDocument = async () => {
    if (!docReqType || !docReqLabel) return;
    setDocReqSending(true);
    try {
      const r = await fetch(`/api/rep/customer/${diagId}/request-document`, {
        credentials: "include", method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: docReqType, label: docReqLabel, notes: docReqNotes }),
      });
      const j = await r.json();
      if (j.success) {
        setShowDocReq(false); setDocReqType(""); setDocReqLabel(""); setDocReqNotes("");
        load();
      }
    } finally { setDocReqSending(false); }
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

  const recommendSolution = async (partnerSlug: string, findingId?: string, category?: string) => {
    setRecommending(partnerSlug);
    try {
      const r = await fetch(`/api/rep/customer/${diagId}/recommend`, {
        credentials: "include", method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner_slug: partnerSlug, finding_id: findingId, category }),
      });
      const j = await r.json();
      if (j.success) {
        // Store both slug and name so matching works on reload
        setRecommendedSlugs(prev => new Set([...prev, partnerSlug, j.recommendation.partner_name]));
        showToast(`Recommended ${j.recommendation.partner_name} — tracked link created`);
      } else {
        showToast("Error: " + (j.error || "Failed"));
      }
    } catch { showToast("Failed to recommend"); }
    setRecommending(null);
  };

  // Load existing recommendations on mount
  // NOTE: GET /recommend returns partner NAME (not slug) in the `partner` field.
  // We store both names and slugs so the UI can match either way.
  useEffect(() => {
    fetch(`/api/rep/customer/${diagId}/recommend`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.recommendations) {
          const known = new Set<string>();
          for (const rec of d.recommendations) {
            if (rec.partner) known.add(rec.partner); // name
            if (rec.partner_slug) known.add(rec.partner_slug); // slug (if returned)
          }
          setRecommendedSlugs(prev => new Set([...prev, ...known]));
        }
      })
      .catch(() => {});
  }, [diagId]);

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
    { key:"debrief",   label:"Post-Call Debrief" },
    { key:"findings",  label:`Findings (${(client.diagnostic?.findings||[]).length})` },
    { key:"documents", label:`Documents (${client.documents?.length ?? 0})`   },
    { key:"savings",   label:`Savings (${client.confirmedFindings?.length ?? 0})` },
    { key:"outreach",  label:"Outreach"  },
    { key:"messages",  label:"Messages"  },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1B3A2D] text-white text-[12px] font-semibold px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <button onClick={() => router.push("/rep/dashboard")}
              className="flex items-center gap-1.5 text-[11px] text-[#8E8C85] hover:text-[#1B3A2D] transition-colors min-h-[36px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              All Clients
            </button>
            <span className="text-[#E5E3DD]">/</span>
            <span className="text-[11px] text-[#1A1A18] font-medium truncate">{client.companyName}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[16px] sm:text-[18px] font-bold text-[#1A1A18]">{client.companyName}</h1>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full shrink-0"
                  style={{ background:"rgba(27,58,45,0.08)", color:"#1B3A2D" }}>
                  {stage.replace(/_/g," ").replace(/\b\w/g,(l: string) => l.toUpperCase())}
                </span>
              </div>
              <p className="text-[11px] text-[#8E8C85] mt-0.5">
                {client.industry} · {client.province} · {client.revenueBracket}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {nextSteps.map((s: any) => (
                <button key={s.next} onClick={() => advanceStage(s.next)} disabled={saving}
                  className="text-[10px] font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 transition min-h-[32px]"
                  style={{ background:"#1B3A2D" }}>
                  {s.label} →
                </button>
              ))}
            </div>
          </div>

          {/* Rep action buttons */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap scrollbar-hide">
            {repInfo?.calendly_url && client.pipeline?.contactEmail && (
              <button onClick={sendBookingLink} disabled={saving}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-[#1B3A2D] text-[#1B3A2D] hover:bg-[#F0FBF5] transition-colors disabled:opacity-40 whitespace-nowrap min-h-[36px]">
                Send Booking Link →
              </button>
            )}
            <button onClick={generateCallPrep} disabled={callPrepLoading}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-[#E5E3DD] text-[#56554F] hover:bg-[#F0EFEB] transition-colors disabled:opacity-40 whitespace-nowrap min-h-[36px]">
              {callPrepLoading ? "Generating..." : "Call Script"}
            </button>
            <button onClick={() => { setShowScripts(s => !s); if (!scripts) fetchScripts(scriptType); }}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-[#1B3A2D] text-[#1B3A2D] hover:bg-[#F0FBF5] transition-colors whitespace-nowrap min-h-[36px]">
              Sales Scripts
            </button>
            {client.engagement?.id && (
              <a href={`/api/rep/customer/${diagId}/agreement`} target="_blank" rel="noopener"
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-[#E5E3DD] text-[#56554F] hover:bg-[#F0EFEB] transition-colors whitespace-nowrap min-h-[36px] flex items-center">
                Agreement PDF
              </a>
            )}
          </div>

          <div className="flex gap-1 mt-4 border-b border-[#E5E3DD] -mb-px overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="text-[11px] font-semibold px-3 py-2 border-b-2 transition-colors whitespace-nowrap shrink-0"
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

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* ═══ SALES SCRIPTS PANEL ═══ */}
        {showScripts && (
          <div className="mb-6 bg-white border border-[#E5E3DD] rounded-xl overflow-hidden" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="px-5 py-3 border-b border-[#E5E3DD] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-bold text-[#1A1A18] uppercase tracking-wider">Sales Scripts</p>
                {scriptsIndustryTag && (
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color:"#1B3A2D", background:"rgba(27,58,45,0.08)" }}>
                    {scriptsIndustryTag}
                  </span>
                )}
              </div>
              <button onClick={() => setShowScripts(false)}
                className="text-[#8E8C85] hover:text-[#1A1A18] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Script type tabs */}
            <div className="flex border-b border-[#E5E3DD] overflow-x-auto scrollbar-hide">
              {([
                { key: "cold_outreach" as ScriptTab, label: "Cold Outreach" },
                { key: "post_prescan" as ScriptTab, label: "Post-Prescan" },
                { key: "review_call" as ScriptTab, label: "Review Call" },
                { key: "objection_handling" as ScriptTab, label: "Objections" },
              ]).map(st => (
                <button key={st.key} onClick={() => handleScriptTabChange(st.key)}
                  className="flex-1 text-[11px] font-semibold px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap min-w-fit"
                  style={{
                    borderColor: scriptType === st.key ? "#1B3A2D" : "transparent",
                    color: scriptType === st.key ? "#1B3A2D" : "#8E8C85",
                    background: scriptType === st.key ? "rgba(27,58,45,0.03)" : "transparent",
                  }}>
                  {st.label}
                </button>
              ))}
            </div>

            {/* Script content */}
            <div className="px-5 py-4">
              {scriptsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" />
                  <span className="ml-3 text-[11px] text-[#8E8C85]">Loading scripts...</span>
                </div>
              ) : scripts && Array.isArray(scripts) ? (
                <div className="space-y-4">
                  {scripts.map((section: any, idx: number) => (
                    <div key={idx} className="border border-[#F0EFEB] rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAFAF8]">
                        <p className="text-[11px] font-bold text-[#1A1A18]">{section.title}</p>
                        <button
                          onClick={() => copyScript(section.content, idx)}
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors"
                          style={{
                            color: copiedIdx === idx ? "#2D7A50" : "#1B3A2D",
                            background: copiedIdx === idx ? "rgba(45,122,80,0.08)" : "rgba(27,58,45,0.06)",
                          }}>
                          {copiedIdx === idx ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <pre className="px-4 py-3 text-[11px] text-[#56554F] whitespace-pre-wrap font-sans leading-relaxed bg-white">
                        {section.content}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : scripts && typeof scripts === "object" && !Array.isArray(scripts) ? (
                <div className="space-y-4">
                  {Object.entries(scripts).map(([key, value]: [string, any], idx: number) => {
                    const displayTitle = key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
                    const displayValue = typeof value === "string" ? value
                      : Array.isArray(value) ? value.map((v: any) =>
                          typeof v === "object" ? Object.entries(v).map(([k, val]) => `${k.replace(/_/g, " ")}: ${val}`).join("\n") : String(v)
                        ).join("\n\n")
                      : typeof value === "object" ? JSON.stringify(value, null, 2)
                      : String(value);
                    const emailMeta = getEmailMeta(key, scripts);
                    return (
                      <div key={key} className="border border-[#F0EFEB] rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAFAF8]">
                          <p className="text-[11px] font-bold text-[#1A1A18]">{displayTitle}</p>
                          <div className="flex items-center gap-1.5">
                            {emailMeta && client?.pipeline?.contactEmail && (
                              emailSentIdx === idx ? (
                                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md text-[#2D7A50] bg-[rgba(45,122,80,0.08)] transition-opacity">
                                  Sent &#10003;
                                </span>
                              ) : (
                                <button
                                  onClick={() => sendScriptEmail(emailMeta.subject, displayValue, idx)}
                                  disabled={emailSending === idx}
                                  className="text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                                  style={{ color:"white", background:"#1B3A2D" }}>
                                  {emailSending === idx ? "Sending..." : "Send Email"}
                                </button>
                              )
                            )}
                            <button
                              onClick={() => copyScript(displayValue, idx)}
                              className="text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors"
                              style={{
                                color: copiedIdx === idx ? "#2D7A50" : "#1B3A2D",
                                background: copiedIdx === idx ? "rgba(45,122,80,0.08)" : "rgba(27,58,45,0.06)",
                              }}>
                              {copiedIdx === idx ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                        <pre className="px-4 py-3 text-[11px] text-[#56554F] whitespace-pre-wrap font-sans leading-relaxed bg-white">
                          {displayValue}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-[#B5B3AD] text-center py-6">Click a script type tab above to load scripts.</p>
              )}
            </div>
          </div>
        )}

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
            {/* ═══ ACTIVITY TIMELINE ═══ */}
            <div className="bg-white border border-[#E5E3DD] rounded-xl px-5 py-4" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider mb-3">Activity Timeline</p>
              {(() => {
                const events: { date: string; type: string; label: string; color: string }[] = [];
                // Assignment
                if (client.pipeline?.updatedAt) {
                  events.push({ date: client.pipeline.updatedAt, type: "stage", label: `Stage: ${(client.pipeline.stage||"lead").replace(/_/g," ")}`, color: "#0369a1" });
                }
                // Documents
                for (const doc of (client.documents || [])) {
                  if (doc.received_at) events.push({ date: doc.received_at, type: "doc", label: `Document received: ${doc.label || doc.document_type}`, color: "#2D7A50" });
                  else if (doc.created_at) events.push({ date: doc.created_at, type: "doc", label: `Document requested: ${doc.label || doc.document_type}`, color: "#C4841D" });
                }
                // Confirmed findings
                for (const f of (client.confirmedFindings || [])) {
                  events.push({ date: f.confirmed_at || f.created_at || new Date().toISOString(), type: "saving", label: `Saving confirmed: ${f.leak_name} — $${(f.confirmed_amount??0).toLocaleString()}`, color: "#2D7A50" });
                }
                // Messages
                for (const m of messages) {
                  events.push({ date: m.created_at, type: "msg", label: `${m.author || m.role}: ${(m.text||"").slice(0,60)}${(m.text||"").length>60?"…":""}`, color: "#8E8C85" });
                }
                events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                if (events.length === 0) return <p className="text-[11px] text-[#B5B3AD] text-center py-3">No activity yet</p>;
                return (
                  <div className="space-y-2">
                    {events.slice(0, 12).map((e, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
                          {i < Math.min(events.length, 12) - 1 && <div className="w-px flex-1 min-h-[16px] bg-[#E5E3DD]" />}
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                          <p className="text-[11px] text-[#56554F] leading-snug">{e.label}</p>
                          <p className="text-[9px] text-[#B5B3AD]">{new Date(e.date).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
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

                      {/* Affiliate / tool recommendations — with tracked Recommend button */}
                      {f.affiliates && f.affiliates.length > 0 && (
                        <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(45,122,80,0.03)", border: "1px solid rgba(45,122,80,0.10)" }}>
                          <p className="text-[9px] font-bold text-[#8E8C85] uppercase tracking-wider mb-2">Solutions</p>
                          <div className="space-y-2">
                            {f.affiliates.map((a: any, ai: number) => {
                              const alreadyRecommended = recommendedSlugs.has(a.slug) || recommendedSlugs.has(a.name);
                              return (
                                <div key={ai} className="flex items-center gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-[#1A1A18]">{a.name}</p>
                                    {a.description && <p className="text-[10px] text-[#8E8C85] truncate">{a.description}</p>}
                                    {a.commission_type && (
                                      <p className="text-[9px] text-[#2D7A50]">
                                        {a.commission_type === "percentage" ? `${a.commission_value}% commission` : `$${a.commission_value} per referral`}
                                      </p>
                                    )}
                                  </div>
                                  {alreadyRecommended ? (
                                    <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                                      style={{ color: "#2D7A50", background: "rgba(45,122,80,0.08)" }}>
                                      Recommended
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); recommendSolution(a.slug, f.id, f.category); }}
                                      disabled={recommending === a.slug}
                                      className="text-[10px] font-semibold px-3 py-1.5 rounded-lg text-white shrink-0 disabled:opacity-40 transition hover:opacity-90"
                                      style={{ background: "#1B3A2D" }}>
                                      {recommending === a.slug ? "Sending…" : "Recommend →"}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
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
                  <button onClick={() => setShowDocReq(s => !s)}
                    className="text-[11px] font-semibold text-[#1B3A2D] hover:underline">
                    + Request Document
                  </button>
                </div>

                {showDocReq && (
                  <div className="bg-[#F9F8F6] border border-[#E5E3DD] rounded-xl p-4 mb-3 space-y-2">
                    <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Request a Document from Client</p>
                    <input placeholder="Document type (e.g. t2_returns)" value={docReqType}
                      onChange={e => setDocReqType(e.target.value)}
                      className="w-full text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#1B3A2D]" />
                    <input placeholder="Display name (e.g. T2 Corporate Returns – Last 3 Years)" value={docReqLabel}
                      onChange={e => setDocReqLabel(e.target.value)}
                      className="w-full text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#1B3A2D]" />
                    <input placeholder="Notes for client (optional)" value={docReqNotes}
                      onChange={e => setDocReqNotes(e.target.value)}
                      className="w-full text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#1B3A2D]" />
                    <div className="flex gap-2">
                      <button onClick={requestDocument} disabled={docReqSending || !docReqType || !docReqLabel}
                        className="text-[11px] font-semibold px-4 py-1.5 rounded-lg text-white disabled:opacity-40 transition"
                        style={{ background: "#1B3A2D" }}>
                        {docReqSending ? "Sending…" : "Send Request"}
                      </button>
                      <button onClick={() => setShowDocReq(false)}
                        className="text-[11px] font-semibold px-4 py-1.5 rounded-lg border border-[#E5E3DD] text-[#56554F]">
                        Cancel
                      </button>
                    </div>
                    <p className="text-[10px] text-[#B5B3AD]">Client receives an email with upload link.</p>
                  </div>
                )}
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
                        style={{ background: doc.status==="requested"?"rgba(196,132,29,0.08)": isOk?"rgba(45,122,80,0.08)":"rgba(142,140,133,0.08)", color: doc.status==="requested"?"#C4841D": isOk?"#2D7A50":"#8E8C85" }}>
                        {doc.status === "requested" ? "Requested" : isOk ? "Received" : "Pending"}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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


        {tab === "debrief" && (
          <div className="space-y-4">
            {debriefDone ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center py-8 gap-3 bg-white border border-[#E5E3DD] rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-[rgba(45,122,80,0.08)] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-[14px] font-semibold text-[#1A1A18]">Debrief saved</p>
                  <p className="text-[12px] text-[#8E8C85] text-center">
                    {debriefOutcome === "ready_to_sign" ? "Engagement email sent to client with signature link." : "Pipeline updated."}
                  </p>
                </div>

                {/* Next Actions */}
                {debriefResult?.nextActions?.length > 0 && (
                  <div className="bg-white border border-[#E5E3DD] rounded-xl p-5" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-bold text-[#8E8C85] uppercase tracking-wider">Suggested Next Steps</p>
                      {debriefResult.suggestedFollowUpDate && (
                        <span className="text-[10px] font-semibold text-[#C4841D] bg-[rgba(196,132,29,0.08)] px-2 py-0.5 rounded-full">
                          Follow up: {new Date(debriefResult.suggestedFollowUpDate + "T12:00:00").toLocaleDateString("en-CA", { weekday:"short", month:"short", day:"numeric" })}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 mb-4">
                      {debriefResult.nextActions.map((na: any, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-lg"
                          style={{ background: na.priority === "high" ? "rgba(179,64,64,0.04)" : na.priority === "medium" ? "rgba(196,132,29,0.04)" : "rgba(142,140,133,0.04)" }}>
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                            style={{ background: na.priority === "high" ? "#B34040" : na.priority === "medium" ? "#C4841D" : "#8E8C85" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-[#1A1A18]">{na.action}</p>
                            {na.automated && <span className="text-[9px] font-semibold text-[#2D7A50] bg-[rgba(45,122,80,0.08)] px-1.5 py-0.5 rounded mt-0.5 inline-block">Auto</span>}
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider shrink-0"
                            style={{ color: na.priority === "high" ? "#B34040" : na.priority === "medium" ? "#C4841D" : "#8E8C85" }}>
                            {na.priority}
                          </span>
                        </div>
                      ))}
                    </div>

                    {debriefResult.suggestedMessage && (
                      <div className="border border-[#F0EFEB] rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#FAFAF8]">
                          <p className="text-[10px] font-bold text-[#8E8C85] uppercase tracking-wider">Suggested Follow-Up Email</p>
                          <div className="flex items-center gap-1.5">
                            {client?.pipeline?.contactEmail && (
                              <button
                                onClick={() => sendScriptEmail(
                                  debriefOutcome === "ready_to_sign" ? "Quick recap from our call" :
                                  debriefOutcome === "needs_time" ? `Following up — ${client?.companyName || "your business"}` :
                                  `Thank you for your time — ${client?.companyName || ""}`,
                                  debriefResult.suggestedMessage,
                                  9000
                                )}
                                disabled={emailSending === 9000}
                                className="text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                                style={{ color:"white", background:"#1B3A2D" }}>
                                {emailSending === 9000 ? "Sending..." : emailSentIdx === 9000 ? "Sent!" : "Send Email"}
                              </button>
                            )}
                            <button onClick={() => { navigator.clipboard?.writeText(debriefResult.suggestedMessage); showToast("Copied to clipboard"); }}
                              className="text-[10px] font-semibold text-[#1B3A2D] px-2.5 py-1 rounded-md" style={{ background:"rgba(27,58,45,0.06)" }}>
                              Copy
                            </button>
                          </div>
                        </div>
                        <pre className="px-4 py-3 text-[11px] text-[#56554F] whitespace-pre-wrap font-sans leading-relaxed bg-white max-h-[200px] overflow-y-auto">
                          {debriefResult.suggestedMessage}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#E5E3DD] rounded-xl p-5" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                <p className="text-[11px] font-bold text-[#8E8C85] uppercase tracking-wider mb-4">Post-Call Debrief</p>

                <div className="mb-4">
                  <p className="text-[12px] font-semibold text-[#1A1A18] mb-2">How did the call go?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { val: "ready_to_sign", label: "Ready to sign", color: "#2D7A50", bg: "rgba(45,122,80,0.08)" },
                      { val: "needs_time",    label: "Needs time",    color: "#C4841D", bg: "rgba(196,132,29,0.08)" },
                      { val: "not_interested",label: "Not interested",color: "#B34040", bg: "rgba(179,64,64,0.08)" },
                    ] as const).map(opt => (
                      <button key={opt.val}
                        onClick={() => setDebriefOutcome(opt.val)}
                        className="py-2 px-3 rounded-lg text-[12px] font-semibold border transition"
                        style={{
                          background: debriefOutcome === opt.val ? opt.bg : "white",
                          color: debriefOutcome === opt.val ? opt.color : "#8E8C85",
                          borderColor: debriefOutcome === opt.val ? opt.color + "33" : "#E8E6E1",
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(client?.diagnostic?.findings || []).length > 0 && (
                  <div className="mb-4">
                    <p className="text-[12px] font-semibold text-[#1A1A18] mb-2">Which findings did they agree to pursue?</p>
                    <div className="space-y-1.5">
                      {(client.diagnostic.findings as any[]).slice(0, 8).map((f: any) => (
                        <label key={f.id} className="flex items-center gap-2.5 cursor-pointer">
                          <div
                            onClick={() => setDebriefFindings((prev: string[]) =>
                              prev.includes(f.id) ? prev.filter((x: string) => x !== f.id) : [...prev, f.id]
                            )}
                            className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition"
                            style={{
                              background: debriefFindings.includes(f.id) ? "#1B3A2D" : "white",
                              borderColor: debriefFindings.includes(f.id) ? "#1B3A2D" : "#E8E6E1",
                            }}>
                            {debriefFindings.includes(f.id) && (
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </div>
                          <span className="text-[12px] text-[#3A3935] flex-1">{f.title}</span>
                          <span className="text-[11px] font-semibold text-[#B34040] shrink-0">${((f.impact_max || f.impact_min || 0) as number).toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-[12px] font-semibold text-[#1A1A18] mb-1.5">Client concerns / objections</label>
                  <textarea value={debriefConcerns}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDebriefConcerns(e.target.value)}
                    rows={2} placeholder="Any hesitations, questions, pushback…"
                    className="w-full text-[12px] border border-[#E8E6E1] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20" />
                </div>
                <div className="mb-4">
                  <label className="block text-[12px] font-semibold text-[#1A1A18] mb-1.5">Internal notes</label>
                  <textarea value={debriefNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDebriefNotes(e.target.value)}
                    rows={2} placeholder="Anything the team should know…"
                    className="w-full text-[12px] border border-[#E8E6E1] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]/20" />
                </div>

                <button
                  onClick={async () => {
                    if (!debriefOutcome) return;
                    setDebriefSubmitting(true);
                    const debriefPipeId = (client?.pipeline?.id as string) || diagId;
                    const debriefRes = await fetch(`/api/rep/customer/${debriefPipeId}/debrief`, {
                      credentials: "include",
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        call_outcome:    debriefOutcome,
                        agreed_findings: debriefFindings,
                        client_concerns: debriefConcerns,
                        notes:           debriefNotes,
                      }),
                    });
                    const debriefJson = await debriefRes.json().catch(() => ({}));
                    if (debriefJson.nextActions) setDebriefResult(debriefJson);
                    setDebriefDone(true);
                    setDebriefSubmitting(false);
                  }}
                  disabled={!debriefOutcome || debriefSubmitting}
                  className="w-full py-3 rounded-xl text-[13px] font-bold text-white transition disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)" }}>
                  {debriefSubmitting ? "Saving…" : debriefOutcome === "ready_to_sign" ? "Save & Send Agreement Email →" : "Save Debrief →"}
                </button>
                {debriefOutcome === "ready_to_sign" && (
                  <p className="text-center text-[11px] text-[#8E8C85] mt-2">
                    Signature link will be emailed to {(client?.pipeline?.contactEmail as string) || "client"} automatically.
                  </p>
                )}
              </div>
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

        {tab === "messages" && (
          <div className="space-y-3">
            <div className="bg-white border border-[#E5E3DD] rounded-xl overflow-hidden" style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
              {messages.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[12px] text-[#8E8C85]">No messages yet. Start the conversation below.</p>
                </div>
              ) : (
                <div className="px-5 py-4 max-h-[400px] overflow-y-auto space-y-3">
                  {messages.map((m: any, i: number) => (
                    <div key={i} className={`flex ${m.role === "rep" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%] rounded-xl px-3.5 py-2.5"
                        style={{
                          background: m.role === "rep" ? "rgba(27,58,45,0.08)" : "#F0EFEB",
                        }}>
                        <p className="text-[9px] font-semibold mb-0.5" style={{ color: m.role === "rep" ? "#1B3A2D" : "#8E8C85" }}>
                          {m.author || (m.role === "rep" ? "You" : "Client")}
                        </p>
                        <p className="text-[12px] text-[#1A1A18] leading-relaxed">{m.text}</p>
                        <p className="text-[8px] text-[#B5B3AD] mt-1">{new Date(m.created_at).toLocaleDateString("en-CA", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-[#E5E3DD] px-4 py-3 flex gap-2">
                <input
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message…"
                  className="flex-1 text-[12px] border border-[#E5E3DD] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:border-[#1B3A2D]"
                />
                <button onClick={sendMessage} disabled={msgSending || !msgText.trim()}
                  className="px-4 py-2 text-[11px] font-semibold text-white rounded-lg disabled:opacity-40 transition"
                  style={{ background: "#1B3A2D" }}>
                  {msgSending ? "…" : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
