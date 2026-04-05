"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// =============================================================================
// REP TRAINING — Daily Structure
// =============================================================================

interface TimeBlock {
  time: string;
  label: string;
  color: string;
  icon: string;
  tasks: { title: string; detail: string }[];
}

const TIME_BLOCKS: TimeBlock[] = [
  {
    time: "9:00 - 11:00",
    label: "PROSPECTING",
    color: "#1B3A2D",
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    tasks: [
      {
        title: "9:00 - 9:15 — Check Dashboard",
        detail: "Review new assignments, overdue follow-ups, and stale leads. Prioritize your day before you pick up the phone.",
      },
      {
        title: "9:15 - 9:30 — Review Call Preps",
        detail: "For every booked call today, read the AI briefing. Know their revenue, industry, findings, and pain points BEFORE you dial.",
      },
      {
        title: "9:30 - 11:00 — Cold Outreach Block (15-20 calls)",
        detail: "Use industry-specific cold scripts (auto-filled from client data). Target: book 2-3 strategy calls per day. Log every call in the CRM — stage, notes, follow-up date. No exceptions.",
      },
    ],
  },
  {
    time: "11:00 - 12:00",
    label: "STRATEGY CALLS",
    color: "#2D7A50",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    tasks: [
      {
        title: "Review Diagnostic Reports",
        detail: "Before each call, study the diagnostic report. Know the top 3 findings, exact dollar amounts, and which finding is highest confidence.",
      },
      {
        title: "Use the 15-Minute Review Call Script",
        detail: "Follow the structured script: open with rapport, walk through findings, handle objections using Straight Line methodology (Three 10s, looping, tonal patterns).",
      },
      {
        title: "Post-Call Debrief",
        detail: "After each call: complete the post-call debrief form. Read the AI coaching feedback. Note what worked and what to improve for the next call.",
      },
    ],
  },
  {
    time: "1:00 - 3:00",
    label: "FOLLOW-UP & NURTURE",
    color: "#C4841D",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    tasks: [
      {
        title: "1:00 - 1:30 — Send Follow-Up Emails",
        detail: "Use pre-filled email templates. Personalize the top finding and dollar amount. Every prospect from today's calls gets a follow-up within 2 hours.",
      },
      {
        title: "1:30 - 2:30 — Active Engagement Clients",
        detail: "Check document requests, update pipeline stages, follow up on signed engagement letters. Keep the pipeline moving forward.",
      },
      {
        title: "2:30 - 3:00 — Reactivation Outreach",
        detail: "Contact cold leads from 30+ days ago. Use reactivation scripts. These are prospects who showed interest but went silent — many are still leaking money.",
      },
    ],
  },
  {
    time: "3:00 - 4:00",
    label: "TRAINING & IMPROVEMENT",
    color: "#6B5CE7",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    tasks: [
      {
        title: "3:00 - 3:30 — AI Drill Sessions",
        detail: "Run 2-3 drill sessions with different scenarios. Increase difficulty as you improve. Focus on your weakest objection type.",
      },
      {
        title: "3:30 - 4:00 — Review & Plan",
        detail: "Review your stats for the day. Update CRM so nothing is stale. Plan tomorrow's calls and prioritize your highest-value prospects.",
      },
    ],
  },
];

const DAILY_TARGETS = [
  { metric: "15-20", label: "Outbound Calls", color: "#1B3A2D" },
  { metric: "2-3", label: "Strategy Calls Booked", color: "#2D7A50" },
  { metric: "3+", label: "Follow-Up Emails", color: "#C4841D" },
  { metric: "1/wk", label: "Signed Engagement", color: "#6B5CE7" },
  { metric: "100%", label: "CRM Updated", color: "#1B3A2D" },
];

const WEEKLY_RHYTHM = [
  { day: "Monday", tasks: "Team standup, review pipeline, set weekly targets", color: "#1B3A2D" },
  { day: "Tue - Thu", tasks: "Full prospecting + call days (the core grind)", color: "#2D7A50" },
  { day: "Friday", tasks: "QBR prep, reactivation block, training drill marathon", color: "#C4841D" },
  { day: "End of Week", tasks: "Review stats, identify weakest metric, plan improvement", color: "#6B5CE7" },
];

const KEY_TOOLS = [
  { tool: "Dashboard \u2192 Today's Actions", desc: "Your daily task queue" },
  { tool: "Client Card \u2192 Call Script", desc: "AI-generated, pre-filled with client data" },
  { tool: "Client Card \u2192 Briefing", desc: "Pre-call cheat sheet with findings and pain points" },
  { tool: "Post-Call \u2192 Debrief + AI Coaching", desc: "Instant feedback after every call" },
  { tool: "Training \u2192 Drill", desc: "Practice objections before important calls" },
  { tool: "Scripts \u2192 Industry Scripts", desc: "Auto-filled scripts for every scenario" },
];

export default function RepTrainingDailyPage() {
  const router = useRouter();
  const [expandedBlock, setExpandedBlock] = useState<number | null>(0);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #E5E3DD", background: "white" }}>
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/rep/training")}
              className="text-[12px] font-semibold transition"
              style={{ color: "#999" }}>
              &larr; Training
            </button>
            <span style={{ color: "#E5E3DD" }}>|</span>
            <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#1B3A2D" }}>
              Daily Structure
            </span>
          </div>
          <button onClick={() => router.push("/rep/training/product")}
            className="px-4 py-2 text-[12px] font-bold rounded-lg transition"
            style={{ background: "rgba(27,58,45,0.06)", color: "#1B3A2D", border: "1px solid #E5E3DD" }}>
            Product Knowledge &rarr;
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-8">
        <h1 className="text-[24px] font-bold mb-2" style={{ color: "#1B3A2D" }}>
          The Rep's Daily Structure
        </h1>
        <p className="text-[13px] mb-8" style={{ color: "#888" }}>
          Follow this schedule every day. Consistency beats talent. The reps who hit targets are the ones who follow the structure.
        </p>

        {/* Daily Targets — KPI Badges */}
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#999" }}>
            Daily Targets
          </p>
          <div className="flex gap-3 flex-wrap">
            {DAILY_TARGETS.map((t, i) => (
              <div key={i} className="px-4 py-3 rounded-xl flex items-center gap-3"
                style={{ background: "white", border: "1px solid #E5E3DD", minWidth: "140px" }}>
                <span className="text-[20px] font-bold" style={{ color: t.color }}>{t.metric}</span>
                <span className="text-[11px] font-medium" style={{ color: "#666" }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#999" }}>
            Hour-by-Hour Schedule
          </p>
          <div className="space-y-4">
            {TIME_BLOCKS.map((block, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden"
                style={{ background: "white", border: "1px solid #E5E3DD" }}>
                {/* Block header */}
                <button
                  onClick={() => setExpandedBlock(expandedBlock === idx ? null : idx)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left transition"
                  style={{ background: expandedBlock === idx ? `${block.color}08` : "white" }}>
                  {/* Time pill */}
                  <div className="px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0"
                    style={{ background: `${block.color}12`, color: block.color, border: `1px solid ${block.color}30` }}>
                    {block.time}
                  </div>
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${block.color}10` }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke={block.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={block.icon} />
                    </svg>
                  </div>
                  {/* Label */}
                  <span className="text-[14px] font-bold flex-1" style={{ color: "#1B3A2D" }}>
                    {block.label}
                  </span>
                  {/* Chevron */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round"
                    style={{ transform: expandedBlock === idx ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Tasks */}
                {expandedBlock === idx && (
                  <div className="px-5 pb-5" style={{ borderTop: "1px solid #E5E3DD" }}>
                    <div className="pt-4 space-y-4">
                      {block.tasks.map((task, ti) => (
                        <div key={ti} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: block.color }} />
                          <div>
                            <p className="text-[13px] font-semibold mb-1" style={{ color: "#1B3A2D" }}>
                              {task.title}
                            </p>
                            <p className="text-[12px] leading-relaxed" style={{ color: "#666" }}>
                              {task.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Rhythm */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#999" }}>
            Weekly Rhythm
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WEEKLY_RHYTHM.map((w, i) => (
              <div key={i} className="px-5 py-4 rounded-xl"
                style={{ background: "white", border: "1px solid #E5E3DD" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: w.color }} />
                  <span className="text-[13px] font-bold" style={{ color: "#1B3A2D" }}>{w.day}</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "#666" }}>{w.tasks}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Tools */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#999" }}>
            Key Tools to Use Daily
          </p>
          <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #E5E3DD" }}>
            {KEY_TOOLS.map((t, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottom: i < KEY_TOOLS.length - 1 ? "1px solid #E5E3DD" : "none" }}>
                <span className="text-[13px] font-semibold" style={{ color: "#1B3A2D" }}>{t.tool}</span>
                <span className="text-[12px]" style={{ color: "#888" }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CRM reminder */}
        <div className="p-5 rounded-xl mb-8"
          style={{ background: "rgba(179,64,64,0.04)", border: "1px solid rgba(179,64,64,0.15)" }}>
          <p className="text-[12px] font-bold mb-1" style={{ color: "#B34040" }}>
            No stale leads older than 2 days.
          </p>
          <p className="text-[12px]" style={{ color: "#888" }}>
            Every lead in your pipeline must have a next action and a follow-up date. If it's been more than 2 days with no update, it's stale. Fix it before you log off.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="text-center">
          <p className="text-[12px] mb-4" style={{ color: "#999" }}>
            Follow the structure. Hit the targets. The rest takes care of itself.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/rep/training")}
              className="px-8 py-3.5 rounded-xl text-[14px] font-bold transition-all"
              style={{ background: "#1B3A2D", color: "white" }}>
              Start Drilling &rarr;
            </button>
            <button onClick={() => router.push("/rep/training/product")}
              className="px-8 py-3.5 rounded-xl text-[14px] font-bold transition-all"
              style={{ background: "white", color: "#1B3A2D", border: "1px solid #E5E3DD" }}>
              Product Knowledge &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
