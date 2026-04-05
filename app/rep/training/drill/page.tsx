"use client";
// =============================================================================
// app/rep/training/page.tsx
// AI objection drill tool — rep practices Straight Line Persuasion vs Claude
// Scenarios: prescan call, intake call, cold outreach, no-show, post-diagnostic
// Claude plays the prospect. After each rep response: SLP score + coaching note.
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "prospect" | "rep" | "coach";
  content: string;
  score?: number; // 1-10 Straight Line score on rep's last message
  coaching?: string;
  betterResponse?: string | null; // What the rep SHOULD have said (shown when score <= 7)
}

interface Scenario {
  id: string;
  label: string;
  description: string;
  prospectPersona: string;
  openingLine: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "prescan_call",
    label: "Prescan Follow-Up",
    description: "Prospect did the prescan, saw their leaks, hasn't booked yet.",
    prospectPersona: "Quebec restaurant owner, 45, skeptical of 'consultants'. Revenue ~$1.2M. Saw $87K in leaks on prescan. Hasn't responded to email.",
    openingLine: "Hello?",
  },
  {
    id: "intake_call",
    label: "Intake Review Call",
    description: "Prospect completed intake. Rep reviews findings, closes to signed agreement.",
    prospectPersona: "Ontario contractor, 38, busy, direct. Revenue ~$600K. Diagnostic shows $43K in leaks — mostly payroll misclassification and insurance overcharge. Has mild objection to 12% fee.",
    openingLine: "Okay I got your message. Make it quick — I've got a crew waiting.",
  },
  {
    id: "cold_outreach",
    label: "Cold Outreach Call",
    description: "Prospect never heard of Fruxal. Rep has their industry data suggesting high leak potential.",
    prospectPersona: "BC professional services firm, CFO-type, 50, protective of time. Revenue ~$2M. No prior contact with Fruxal.",
    openingLine: "I don't know who you are, but you've got 30 seconds.",
  },
  {
    id: "no_show",
    label: "No-Show Re-Engagement",
    description: "Prospect booked a call, didn't show. Rep is reaching out to reschedule.",
    prospectPersona: "Alberta retailer, 42, embarrassed about missing call, slightly defensive. Saw $62K in leaks. Life got busy.",
    openingLine: "Yeah, sorry about that. Things came up.",
  },
  {
    id: "post_diagnostic",
    label: "Post-Diagnostic Pushback",
    description: "Prospect reviewed the diagnostic report. Now pushing back on fee or ROI.",
    prospectPersona: "Montreal tech agency, 35, analytical, wants proof. Revenue ~$1.8M. Diagnostic found $118K in leaks — SR&ED + payroll. Objects: 'These numbers seem high, how do I know you can actually recover this?'",
    openingLine: "I looked at the report. Some of this seems optimistic.",
  },
];

const DIFFICULTY = [
  { id: "warm", label: "Warm", color: "#2D7A50", desc: "Prospect is open, minor friction" },
  { id: "resistant", label: "Resistant", color: "#C4841D", desc: "Classic objections, needs convincing" },
  { id: "hostile", label: "Hostile", color: "#B34040", desc: "Full pushback — tests every inch" },
];

export default function RepTrainingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"select" | "drill" | "summary">("select");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [difficulty, setDifficulty] = useState("resistant");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startDrill() {
    if (!scenario) return;
    setPhase("drill");
    setMessages([]);
    setTurn(0);
    setScores([]);
    setSessionStarted(false);

    // Get opening line from prospect
    setLoading(true);
    try {
      const res = await fetch("/api/rep/training/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "open",
          scenario: scenario.id,
          difficulty,
          persona: scenario.prospectPersona,
          openingLine: scenario.openingLine,
        }),
      });
      const data = await res.json();
      setMessages([{ role: "prospect", content: data.prospectMessage }]);
      setSessionStarted(true);
    } catch {
      setMessages([{ role: "prospect", content: scenario.openingLine }]);
      setSessionStarted(true);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function sendResponse() {
    if (!input.trim() || loading || !scenario) return;
    const repText = input.trim();
    setInput("");
    setLoading(true);

    const newMessages: Message[] = [...messages, { role: "rep", content: repText }];
    setMessages(newMessages);
    setTurn(t => t + 1);

    try {
      const res = await fetch("/api/rep/training/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "respond",
          scenario: scenario.id,
          difficulty,
          persona: scenario.prospectPersona,
          history: newMessages.filter(m => m.role !== "coach").map(m => ({
            role: m.role === "rep" ? "rep" : "prospect",
            content: m.content,
          })),
          repResponse: repText,
          turn: turn + 1,
        }),
      });
      const data = await res.json();

      const withCoach: Message[] = [
        ...newMessages,
        { role: "coach", content: data.coaching, score: data.score, betterResponse: data.betterResponse || null },
        ...(data.closed ? [] : [{ role: "prospect" as const, content: data.prospectResponse }]),
      ];
      setMessages(withCoach);
      setScores(s => [...s, data.score]);

      if (data.closed || turn + 1 >= 8) {
        setTimeout(() => setPhase("summary"), 1200);
      }
    } catch {
      setMessages(m => [...m, { role: "prospect", content: "[Connection error — try again]" }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const scoreColor = (s: number) =>
    s >= 8 ? "#2D7A50" : s >= 6 ? "#C4841D" : "#B34040";

  const scoreLabel = (s: number) =>
    s >= 9 ? "Elite" : s >= 8 ? "Strong" : s >= 7 ? "Good" : s >= 6 ? "Developing" : s >= 4 ? "Weak" : "Off track";

  return (
    <div className="min-h-screen" style={{ background: "#0F1A14", fontFamily: "'DM Mono', 'Fira Code', monospace" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(45,122,80,0.2)", background: "rgba(27,58,45,0.4)" }}>
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/rep/dashboard")}
              className="text-[12px] font-semibold hover:text-white transition"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              ← Dashboard
            </button>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
            <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#2D7A50" }}>
              Objection Drill
            </span>
            <button onClick={() => router.push("/rep/training/learn")}
              className="text-[12px] font-semibold hover:text-white transition hidden sm:block"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              Learn First →
            </button>
            <button onClick={() => router.push("/rep/training/product")}
              className="text-[12px] font-semibold hover:text-white transition hidden sm:block"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              Product →
            </button>
            <button onClick={() => router.push("/rep/training/daily")}
              className="text-[12px] font-semibold hover:text-white transition hidden sm:block"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              Daily Structure →
            </button>
            <button onClick={() => router.push("/rep/scripts")}
              className="text-[12px] font-semibold hover:text-white transition hidden sm:block"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              Scripts →
            </button>
          </div>
          {phase === "drill" && scenario && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                {scenario.label}
              </span>
              {scores.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded"
                  style={{ background: "rgba(45,122,80,0.15)", color: "#2D7A50" }}>
                  avg {avgScore}/10
                </span>
              )}
              <button onClick={() => setPhase("select")}
                className="text-[10px] text-red-400/60 hover:text-red-400 transition font-semibold">
                End Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* === SCENARIO SELECT === */}
      {phase === "select" && (
        <div className="max-w-[900px] mx-auto px-6 py-10">
          <div className="mb-10">
            <h1 className="text-[28px] font-bold text-white mb-2 leading-tight">
              Pick your scenario.<br />
              <span style={{ color: "#2D7A50" }}>Win the deal.</span>
            </h1>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Claude plays the prospect. You close. Every exchange scored on the Straight Line system.
            </p>
          </div>

          {/* Learn first banner */}
          <div className="p-4 rounded-xl mb-8 flex items-center gap-4 cursor-pointer hover:opacity-90 transition"
            onClick={() => router.push("/rep/training/learn")}
            style={{ background: "rgba(45,122,80,0.08)", border: "1px solid rgba(45,122,80,0.2)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(45,122,80,0.15)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-white">New here? Learn the business first</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                Study the pitches, fee model, and objection responses before drilling. Takes 10 minutes.
              </p>
            </div>
            <span className="text-[11px] font-bold shrink-0" style={{ color: "#2D7A50" }}>Learn →</span>
          </div>

          {/* Product Knowledge banner */}
          <div className="p-4 rounded-xl mb-3 flex items-center gap-4 cursor-pointer hover:opacity-90 transition"
            onClick={() => router.push("/rep/training/product")}
            style={{ background: "rgba(45,122,80,0.08)", border: "1px solid rgba(45,122,80,0.2)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(45,122,80,0.15)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D7A50" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-white">Know the product inside and out</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                What Fruxal does, how the model works, leak types, competitive advantage, and common questions.
              </p>
            </div>
            <span className="text-[11px] font-bold shrink-0" style={{ color: "#2D7A50" }}>Product →</span>
          </div>

          {/* Daily Structure banner */}
          <div className="p-4 rounded-xl mb-8 flex items-center gap-4 cursor-pointer hover:opacity-90 transition"
            onClick={() => router.push("/rep/training/daily")}
            style={{ background: "rgba(196,132,29,0.06)", border: "1px solid rgba(196,132,29,0.15)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(196,132,29,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4841D" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-white">Follow the daily structure</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                Hour-by-hour schedule, daily targets, weekly rhythm, and key tools to use every day.
              </p>
            </div>
            <span className="text-[11px] font-bold shrink-0" style={{ color: "#C4841D" }}>Daily →</span>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              Difficulty
            </p>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTY.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all"
                  style={{
                    background: difficulty === d.id ? d.color + "22" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${difficulty === d.id ? d.color : "rgba(255,255,255,0.08)"}`,
                    color: difficulty === d.id ? d.color : "rgba(255,255,255,0.4)",
                  }}>
                  {d.label}
                  <span className="ml-2 text-[10px] opacity-60">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setScenario(s === scenario ? null : s)}
                className="text-left p-5 rounded-xl transition-all group"
                style={{
                  background: scenario?.id === s.id ? "rgba(45,122,80,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${scenario?.id === s.id ? "rgba(45,122,80,0.4)" : "rgba(255,255,255,0.07)"}`,
                }}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[13px] font-bold text-white">{s.label}</span>
                  {scenario?.id === s.id && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: "rgba(45,122,80,0.2)", color: "#2D7A50" }}>
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{s.description}</p>
                <div className="text-[10px] italic" style={{ color: "rgba(255,255,255,0.25)" }}>
                  &ldquo;{s.openingLine}&rdquo;
                </div>
              </button>
            ))}
          </div>

          {/* Straight Line reminder */}
          <div className="p-4 rounded-xl mb-8"
            style={{ background: "rgba(196,132,29,0.06)", border: "1px solid rgba(196,132,29,0.15)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#C4841D" }}>
              The Three 10s — Straight Line Benchmark
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { n: "1", label: "Rep", desc: "They trust you personally" },
                { n: "2", label: "Fruxal", desc: "They trust the company" },
                { n: "3", label: "The Numbers", desc: "They believe the recovery is real" },
              ].map(t => (
                <div key={t.n}>
                  <div className="text-[18px] font-bold mb-0.5" style={{ color: "#C4841D" }}>{t.n}</div>
                  <div className="text-[11px] font-semibold text-white">{t.label}</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TRAINING GUIDE — what to say for each objection */}
          <div className="p-5 rounded-xl mb-8"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-4"
              style={{ color: "rgba(255,255,255,0.3)" }}>
              Straight Line Playbook — How to Handle Every Situation
            </p>
            <div className="space-y-4">
              {[
                {
                  objection: "\"I need to think about it\"",
                  wrong: "Okay, take your time. I'll follow up next week.",
                  right: "Totally fair. Can I ask — what specifically are you thinking about? Is it the fee, the process, or whether the numbers are real? Because if it's [X], I can address that right now.",
                  principle: "Identify the real objection behind the stall. Never accept a vague delay.",
                },
                {
                  objection: "\"12% is too much\"",
                  wrong: "Well, that's our standard rate. It's pretty competitive.",
                  right: "I get it — 12% sounds like a number. But let's look at YOUR numbers: we found $43K in leaks. You keep $37,840 — money that's currently walking out the door. The alternative isn't paying us 0% — it's losing the full $43K. We take all the risk.",
                  principle: "Reframe: it's not 12% vs 0%, it's 88% kept vs 100% lost. Use their actual dollar amount.",
                },
                {
                  objection: "\"My accountant handles this\"",
                  wrong: "We're better than accountants because we use AI.",
                  right: "That's great — and we work WITH your accountant. What we do is different: they handle compliance, we handle optimization. For example, your diagnostic found $8K in insurance overpayment and $12K in processing fees — those aren't things an accountant typically reviews.",
                  principle: "Never attack their accountant. Differentiate scope, then cite specific findings outside accounting scope.",
                },
                {
                  objection: "\"These numbers seem high\"",
                  wrong: "Our AI is very accurate. Trust the system.",
                  right: "Fair question. Let me show you how we got there. Your processing rate is 2.9% — the industry median is 2.3%. On your $400K card volume, that's $2,400/year. That's not an estimate — that's math. Each finding has the same breakdown.",
                  principle: "Show the calculation, not the conclusion. Walk through one finding in detail to build credibility for all.",
                },
                {
                  objection: "\"I don't have time for this\"",
                  wrong: "It only takes a few minutes of your time each week.",
                  right: "That's exactly why we exist. You do nothing. We handle every call to CRA, every vendor renegotiation, every application. The only thing you do is show up for one 15-minute call where I walk you through what we found. After that, we do the work.",
                  principle: "Remove the effort objection completely. Emphasize that you do ALL the work.",
                },
                {
                  objection: "\"How do I know you can actually recover this?\"",
                  wrong: "We have a great track record with lots of clients.",
                  right: "Two things: First, you pay nothing until money is confirmed in your account — so the risk is entirely on us. Second, let me start with the highest-confidence finding: your insurance hasn't been re-quoted in 3 years. That alone is almost always recoverable. Can I start there?",
                  principle: "Lead with zero-risk, then offer to prove it with the easiest win first.",
                },
              ].map((item, i) => (
                <div key={i} className="pb-4" style={{ borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <p className="text-[12px] font-bold text-white mb-2">{item.objection}</p>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(179,64,64,0.1)", border: "1px solid rgba(179,64,64,0.15)" }}>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#B34040" }}>Wrong</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{item.wrong}</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(45,122,80,0.1)", border: "1px solid rgba(45,122,80,0.15)" }}>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#2D7A50" }}>Right</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{item.right}</p>
                    </div>
                  </div>
                  <p className="text-[10px] italic" style={{ color: "rgba(196,132,29,0.7)" }}>{item.principle}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={startDrill} disabled={!scenario}
            className="w-full py-4 rounded-xl text-[14px] font-bold transition-all disabled:opacity-30"
            style={{
              background: scenario ? "linear-gradient(135deg, #1B3A2D, #2D7A50)" : "rgba(255,255,255,0.05)",
              color: "white",
              border: scenario ? "none" : "1px solid rgba(255,255,255,0.1)",
            }}>
            {scenario ? `Start Drill — ${scenario.label} (${difficulty})` : "Select a scenario to start"}
          </button>
        </div>
      )}

      {/* === DRILL === */}
      {phase === "drill" && (
        <div className="max-w-[900px] mx-auto px-6 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 65px)" }}>

          {/* Prospect info bar */}
          {scenario && (
            <div className="mb-4 px-4 py-2.5 rounded-lg text-[11px]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="font-bold text-white">{scenario.label}</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }} className="mx-2">·</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{scenario.prospectPersona}</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-3 mb-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
            {messages.map((m, i) => (
              <div key={i}>
                {m.role === "prospect" && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                      style={{ background: "rgba(179,64,64,0.2)", color: "#B34040", border: "1px solid rgba(179,64,64,0.3)" }}>
                      P
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: "rgba(179,64,64,0.6)" }}>Prospect</div>
                      <div className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                )}

                {m.role === "rep" && (
                  <div className="flex items-start gap-3 justify-end">
                    <div className="max-w-[70%]">
                      <div className="text-right text-[10px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: "rgba(45,122,80,0.6)" }}>You</div>
                      <div className="px-4 py-3 rounded-xl text-[13px] leading-relaxed text-white"
                        style={{ background: "rgba(45,122,80,0.15)", border: "1px solid rgba(45,122,80,0.2)" }}>
                        {m.content}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                      style={{ background: "rgba(45,122,80,0.2)", color: "#2D7A50", border: "1px solid rgba(45,122,80,0.3)" }}>
                      R
                    </div>
                  </div>
                )}

                {m.role === "coach" && m.score !== undefined && (
                  <div className="mx-0 px-4 py-3 rounded-lg"
                    style={{ background: "rgba(196,132,29,0.07)", border: "1px solid rgba(196,132,29,0.15)" }}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#C4841D" }}>
                        Coach
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[16px] font-bold" style={{ color: scoreColor(m.score) }}>
                          {m.score}
                        </span>
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>/10</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: scoreColor(m.score) + "22", color: scoreColor(m.score) }}>
                          {scoreLabel(m.score)}
                        </span>
                      </div>
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {m.content}
                    </p>
                    {m.betterResponse && (
                      <div className="mt-3 px-3 py-2.5 rounded-lg"
                        style={{ background: "rgba(45,122,80,0.1)", border: "1px solid rgba(45,122,80,0.2)" }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#2D7A50" }}>
                          What you should have said:
                        </p>
                        <p className="text-[12px] leading-relaxed italic" style={{ color: "rgba(255,255,255,0.8)" }}>
                          &ldquo;{m.betterResponse}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.3)", animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {sessionStarted && (
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendResponse(); } }}
                placeholder="Your response… (Enter to send, Shift+Enter for new line)"
                rows={2}
                className="flex-1 px-4 py-3 rounded-xl text-[13px] resize-none focus:outline-none transition"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontFamily: "inherit",
                }}
              />
              <button onClick={sendResponse} disabled={loading || !input.trim()}
                className="px-5 py-3 rounded-xl text-[12px] font-bold transition-all disabled:opacity-30"
                style={{ background: "#1B3A2D", color: "#2D7A50", border: "1px solid rgba(45,122,80,0.3)" }}>
                Send
              </button>
            </div>
          )}

          <p className="text-center text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.15)" }}>
            Turn {turn} · {8 - turn} remaining · Coach scores every rep response
          </p>
        </div>
      )}

      {/* === SUMMARY === */}
      {phase === "summary" && (
        <div className="max-w-[700px] mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <div className="text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: "rgba(255,255,255,0.3)" }}>Session Complete</div>
            <div className="text-[64px] font-bold leading-none mb-2"
              style={{ color: scoreColor(avgScore) }}>
              {avgScore}
            </div>
            <div className="text-[14px] font-semibold text-white mb-1">{scoreLabel(avgScore)} Performance</div>
            <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              {scores.length} exchanges · avg score {avgScore}/10
            </div>
          </div>

          {/* Score breakdown */}
          <div className="mb-8 space-y-2">
            {scores.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] w-12 text-right" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Turn {i + 1}
                </span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s * 10}%`, background: scoreColor(s) }} />
                </div>
                <span className="text-[11px] font-bold w-8" style={{ color: scoreColor(s) }}>{s}</span>
              </div>
            ))}
          </div>

          {/* SLP breakdown */}
          <div className="p-5 rounded-xl mb-8"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-4"
              style={{ color: "rgba(255,255,255,0.3)" }}>
              Score Meaning
            </p>
            <div className="space-y-2">
              {[
                { range: "9–10", label: "Elite", note: "Straight Line mastery — certainty transferred, objection dissolved", color: "#2D7A50" },
                { range: "7–8",  label: "Strong", note: "Good rapport + logic, minor threshold gaps", color: "#4A9A6A" },
                { range: "5–6",  label: "Developing", note: "Reasonable but not compelling — certainty not transferred", color: "#C4841D" },
                { range: "1–4",  label: "Off track", note: "Prospect's negative emotions rising — need course correction", color: "#B34040" },
              ].map(r => (
                <div key={r.range} className="flex items-start gap-3">
                  <span className="text-[11px] font-bold w-10 shrink-0" style={{ color: r.color }}>{r.range}</span>
                  <span className="text-[11px] font-bold w-20 shrink-0" style={{ color: r.color }}>{r.label}</span>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{r.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setPhase("select"); setScenario(null); setMessages([]); setScores([]); }}
              className="flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-all"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
              New Scenario
            </button>
            <button onClick={() => { setPhase("drill"); startDrill(); }}
              className="flex-1 py-3.5 rounded-xl text-[13px] font-bold transition-all"
              style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)", color: "white" }}>
              Retry Same Scenario
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
