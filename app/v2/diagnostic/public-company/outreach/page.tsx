"use client";
// =============================================================================
// app/v2/diagnostic/public-company/outreach/page.tsx
// Fruxal brand color system — matches enterprise dashboard.
// =============================================================================

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Tone = "peer" | "ceo" | "warm" | "activist";
type Tab  = "initial" | "linkedin" | "followup";

interface EmailResult {
  subject_line:          string;
  subject_line_b:        string;
  email_body:            string;
  linkedin_message:      string;
  follow_up_subject:     string;
  follow_up_body:        string;
  key_hook:              string;
  ps_line:               string;
  personalization_notes: string;
}

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value:"peer",     label:"CFO → CFO",    desc:"Analytical, peer-level"       },
  { value:"ceo",      label:"CEO Focus",    desc:"Shareholder value, exit lens"  },
  { value:"warm",     label:"Warm Intro",   desc:"Helpful advisor, no agenda"    },
  { value:"activist", label:"Activist",     desc:"Vs peer benchmarks, board-ready" },
];

function WordCount({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const color = words > 160 ? "text-negative" : words > 130 ? "text-caution" : "text-positive";
  return <span className={`text-[10px] font-mono ${color}`}>{words}w</span>;
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  function copy() { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }
  return (
    <button onClick={copy}
      className="text-[11px] text-ink-faint hover:text-brand transition-colors flex items-center gap-1">
      {done ? (
        <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
      ) : label}
    </button>
  );
}

export default function OutreachPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const reportId     = searchParams.get("reportId");

  const [tone,          setTone]          = useState<Tone>("peer");
  const [senderName,    setSenderName]    = useState("");
  const [senderTitle,   setSenderTitle]   = useState("");
  const [senderCompany, setSenderCompany] = useState("Fruxal");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [result,        setResult]        = useState<EmailResult | null>(null);
  const [meta,          setMeta]          = useState<any>(null);
  const [activeTab,     setActiveTab]     = useState<Tab>("initial");
  const [altSubject,    setAltSubject]    = useState(false);

  useEffect(() => {
    if (!reportId) router.push("/v2/diagnostic/public-company");
  }, [reportId, router]);

  async function generate() {
    if (!reportId) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch("/api/v2/diagnostic/public-company/outreach", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ reportId, tone, senderName, senderTitle, senderCompany }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      setResult(data.email);
      setMeta(data.meta);
      setActiveTab("initial");
      setAltSubject(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const currentSubject = activeTab === "followup"
    ? result?.follow_up_subject
    : altSubject ? result?.subject_line_b : result?.subject_line;

  const currentBody = activeTab === "initial"  ? result?.email_body
    : activeTab === "linkedin" ? result?.linkedin_message
    : result?.follow_up_body;

  const INP = "w-full bg-white border border-border rounded-lg px-3 py-2.5 text-[13px] text-ink placeholder-ink-faint/60 focus:outline-none focus:border-brand/40 transition";

  return (
    <div className="bg-bg min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-border-light bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="text-ink-faint hover:text-ink text-[13px] transition">← Back</button>
            <span className="text-border">|</span>
            <span className="text-ink-secondary text-[13px]">CFO Outreach Generator</span>
          </div>
          {meta && (
            <div className="flex items-center gap-2">
              {meta.ticker && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(27,58,45,0.07)", color: "#1B3A2D", border: "1px solid rgba(27,58,45,0.15)" }}>
                  {meta.ticker}
                </span>
              )}
              {meta.revenue_formatted && (
                <span className="text-[10px] text-ink-faint">{meta.revenue_formatted} rev</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">

        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Generate Outreach Email</h1>
          <p className="text-[13px] text-ink-secondary mt-1">
            Sentence 1 = the dollar number. 150 words max. Starts with money.
          </p>
        </div>

        {/* ── Config ───────────────────────────────────────────────────────── */}
        <div className="bg-white border border-border-light rounded-xl p-5 space-y-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

          {/* Tone */}
          <div>
            <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-2">Tone</p>
            <div className="grid grid-cols-4 gap-2">
              {TONES.map(t => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                    tone === t.value
                      ? "border-brand/30 bg-brand/5"
                      : "border-border-light hover:border-border bg-white"}`}>
                  <div className={`text-[12px] font-semibold ${tone === t.value ? "text-brand" : "text-ink-secondary"}`}>
                    {t.label}
                  </div>
                  <div className="text-[10px] text-ink-faint mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sender */}
          <div>
            <p className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider mb-2">
              Sender <span className="text-ink-faint/50 normal-case font-normal">(optional)</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Name",    val:senderName,    set:setSenderName,    ph:"Jane Smith"        },
                { label:"Title",   val:senderTitle,   set:setSenderTitle,   ph:"Financial Analyst" },
                { label:"Company", val:senderCompany, set:setSenderCompany, ph:"Fruxal"            },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider block mb-1">{f.label}</label>
                  <input className={INP} value={f.val}
                    onChange={e => f.set(e.target.value)} placeholder={f.ph} />
                </div>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 text-white"
            style={{ background: loading ? "rgba(27,58,45,0.35)" : "#1B3A2D", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>Generating…</>
            ) : result ? "Regenerate →" : "Generate Outreach Email →"}
          </button>

          {error && (
            <div className="text-negative text-[12px] bg-negative/5 border border-negative/15 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {result && (
          <div className="space-y-4">

            {/* Key hook */}
            {result.key_hook && (
              <div className="flex items-start gap-3 rounded-xl px-5 py-4"
                style={{ background: "rgba(27,58,45,0.04)", border: "1px solid rgba(27,58,45,0.12)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <div>
                  <p className="text-[9px] font-semibold text-positive uppercase tracking-wider mb-1">Lead Hook</p>
                  <p className="text-[13px] text-ink font-medium">{result.key_hook}</p>
                </div>
              </div>
            )}

            {/* Email card */}
            <div className="bg-white border border-border-light rounded-xl overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>

              {/* Tabs */}
              <div className="flex border-b border-border-light">
                {([
                  { key:"initial",  label:"Initial Email"    },
                  { key:"linkedin", label:"LinkedIn DM"      },
                  { key:"followup", label:"Day 5 Follow-up"  },
                ] as { key: Tab; label: string }[]).map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`px-5 py-3 text-[12px] font-semibold border-b-2 transition-colors ${
                      activeTab === t.key
                        ? "text-brand border-brand"
                        : "text-ink-faint border-transparent hover:text-ink-secondary"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-4">

                {/* Subject */}
                {activeTab !== "linkedin" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider">Subject</span>
                        {activeTab === "initial" && result.subject_line_b && (
                          <button onClick={() => setAltSubject(!altSubject)}
                            className="text-[9px] text-ink-faint hover:text-brand border border-border px-1.5 py-0.5 rounded transition">
                            {altSubject ? "← A" : "B →"}
                          </button>
                        )}
                      </div>
                      <CopyButton text={currentSubject || ""} />
                    </div>
                    <div className="bg-bg-section border border-border-light rounded-lg px-4 py-2.5 text-[13px] text-ink font-medium">
                      {currentSubject}
                    </div>
                  </div>
                )}

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold text-ink-faint uppercase tracking-wider">
                        {activeTab === "linkedin" ? "Message" : "Body"}
                      </span>
                      <WordCount text={currentBody || ""} />
                    </div>
                    <CopyButton text={currentBody || ""} />
                  </div>
                  <div className="bg-bg-section border border-border-light rounded-lg px-4 py-4 text-[13px] text-ink-secondary leading-relaxed whitespace-pre-wrap">
                    {currentBody}
                  </div>
                </div>

                {/* P.S. */}
                {activeTab === "initial" && result.ps_line && (
                  <div className="flex items-start gap-3 bg-bg-section border border-border-light rounded-lg px-4 py-3">
                    <span className="text-[9px] font-bold text-ink-faint uppercase tracking-wider mt-0.5 shrink-0">P.S.</span>
                    <p className="text-[12px] text-ink-secondary italic flex-1">{result.ps_line}</p>
                    <CopyButton text={`P.S. ${result.ps_line}`} />
                  </div>
                )}

                {activeTab !== "linkedin" && (
                  <div className="flex justify-end">
                    <CopyButton text={`Subject: ${currentSubject}\n\n${currentBody}`} label="Copy Subject + Body" />
                  </div>
                )}
              </div>
            </div>

            {/* Before you send */}
            {result.personalization_notes && (
              <div className="rounded-xl px-5 py-4"
                style={{ background:"rgba(166,139,43,0.04)", border:"1px solid rgba(166,139,43,0.15)" }}>
                <p className="text-[9px] font-semibold text-caution uppercase tracking-wider mb-2">Before You Send</p>
                <p className="text-[12px] text-ink-secondary leading-relaxed">{result.personalization_notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={generate}
                className="flex-1 py-2.5 rounded-lg border border-border hover:border-brand/30 text-[12px] text-ink-secondary hover:text-ink transition">
                Regenerate
              </button>
              <button onClick={() => router.push("/v2/diagnostic/public-company")}
                className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-brand transition"
                style={{ background:"rgba(27,58,45,0.06)", border:"1px solid rgba(27,58,45,0.15)" }}>
                Run Another Diagnostic →
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
