"use client";
// =============================================================================
// app/rep/scripts/page.tsx
// Rep script library — 8 scripts built on Jordan Belfort's Straight Line system.
// =============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Objection { trigger: string; response: string; }
interface Script {
  id: string; label: string; type: "call" | "email";
  context: string; tone: string; slpNotes: string; script: string; objections: Objection[];
}

const SCRIPTS: Script[] = [
  {
    id: "prescan_followup",
    label: "Prescan Follow-Up Call",
    type: "call",
    context: "Prospect ran the prescan, saw their leaks, hasn't booked yet.",
    tone: "Confident, warm, direct. You're not selling — you're following up on something they already told you they want. Speak like a peer, not a vendor.",
    slpNotes: "Goal: move from curious to call-booked. Primary 10: Rep trust. Their state says 'this is real' — confirm it with their specific prescan numbers, not generic claims.",
    script: `Hi [Name], this is [Your name] from Fruxal — I'm calling about the scan you ran on your business.

You showed up as leaking roughly [$ amount]/year. That number is based on your industry benchmarks and your revenue band — it's specific to you, not a generic estimate.

I wanted to reach out because a lot of business owners see that number and don't know what to do with it. That's exactly what I'm here for.

I'd like to get you on a 20-minute call where I walk you through exactly where the money is going and what the recovery path looks like. No cost, no obligation — and if we find you can get it back, we only take 12% of what we actually recover. Nothing until money is in your account.

Does [day] or [day] work for you?`,
    objections: [
      { trigger: "How do I know the numbers are real?", response: "Fair question. The numbers come from your revenue band and province matched against industry benchmarks — NRA, CFMA, CRA filings. It's a gap analysis, not a guess. On the call I'll show you exactly which benchmark you're running against and why your number is what it is." },
      { trigger: "I'm not interested / too busy", response: "I hear you. The only reason I called is [$ amount]/year is significant — I wouldn't reach out for a few hundred dollars. If the timing's bad, when would be better? I can make it 15 minutes." },
      { trigger: "What do you get out of this?", response: "We take 12% of confirmed savings only. If we recover $40,000 for you, our fee is $4,800. If we recover nothing, you pay nothing. Our incentive is completely aligned with yours — we only earn when you do." },
    ],
  },
  {
    id: "intake_review",
    label: "Intake Review Call",
    type: "call",
    context: "Prospect completed intake. Rep reviews findings, closes to signed agreement.",
    tone: "Clinical confidence. You've done the analysis, you know their situation better than they do. Be matter-of-fact about the numbers. The close should feel inevitable, not pushy.",
    slpNotes: "All Three 10s in play. Rep credibility (you did your homework), Fruxal credibility (specific methodology), Number credibility (you can explain every dollar). Close hard on the agreement — hesitation costs them money every day.",
    script: `[Name], I've gone through your intake and I want to walk you through what we found.

You're running [industry] in [province] at [revenue]. Based on the intake data, we identified [X] findings totalling approximately [$ amount]/year in recoverable savings.

The three biggest are: [Finding 1 — $X], [Finding 2 — $X], [Finding 3 — $X].

These aren't estimates pulled from thin air. [Finding 1] is based on [specific explanation]. I can show you the exact calculation.

From here: my team handles the execution. CRA correspondence, vendor negotiations, grant applications — all of it. You don't lift a finger. We send you a recovery agreement, you sign it, we start.

Our fee is 12% of confirmed recoveries. On [$ total], that's [fee]. You keep [net]. You pay nothing until money is confirmed.

Are you ready to move forward? I can send the agreement right now.`,
    objections: [
      { trigger: "12% feels like a lot", response: "Let me reframe it: on $50,000 recovered, our fee is $6,000 and you keep $44,000 you didn't have yesterday. The alternative is $0. The question isn't whether 12% is a lot — it's whether $44,000 in your account is worth $6,000." },
      { trigger: "I want to think about it", response: "I respect that. What I'd flag: [specific finding] has a CRA deadline in [timeframe]. What specifically do you need to think through? Let me address it now." },
      { trigger: "Can I do this myself?", response: "You can try. The CRA correspondence alone — knowing exactly which form, which box, what language — takes most accountants 6-8 hours if they've done it before. We do it every day. We handle the risk, not you." },
      { trigger: "I need to talk to my accountant first", response: "Absolutely. We actually send them a CPA briefing memo — every finding with the methodology. Most accountants appreciate having it done for them. Want me to send it to both of you so they can review it on your behalf?" },
    ],
  },
  {
    id: "enterprise_cold",
    label: "Enterprise Cold Outreach",
    type: "call",
    context: "Prospect has never heard of Fruxal. Revenue $1M+. Rep has industry data suggesting high leak potential.",
    tone: "Peer-to-peer. You're a financial specialist who found something specific about their industry — not a vendor pitching. Get to the number fast. Biggest mistake: staying too long in the opening.",
    slpNotes: "You have 30 seconds to be specific enough to earn 2 minutes. Lead with a number from their industry, not a pitch. Get to the ask by line 4.",
    script: `[Name], this is [Your name] — I run recovery engagements for Fruxal. I'll be brief.

We work with [industry] businesses in [province] and just finished an analysis of the sector. The median business in your revenue range is losing about [$ range]/year across three categories: [Category 1], [Category 2], [Category 3].

I'm calling because the numbers flagged your company and I wanted to find out if any of those gaps apply to you.

It takes me 20 minutes to run your numbers and tell you exactly where you sit. If there's nothing there, I'll tell you that. If there is, we only get paid when we recover it.

Is there 20 minutes this week to take a look?`,
    objections: [
      { trigger: "How did you get my number?", response: "We identify businesses in specific industries using revenue data and CRA filing patterns. Your company came up as a likely match for the gaps we're finding in [industry]. I'm calling with a specific hypothesis about your financials, not to sell a subscription." },
      { trigger: "We have an accountant / CFO", response: "Good — we work alongside them, not instead of them. We specialize in recovery work: SR&ED, CRA adjustments, payroll corrections, supplier renegotiations. Most accountants don't have capacity for this on top of compliance. We send them a full briefing so they're in the loop." },
      { trigger: "Send me something in writing", response: "I can, but what I'd send is a generic overview — not your numbers. The useful version requires 20 minutes with me to actually run your data. Can I send you a 2-pager on what we typically find in [industry] while we book time?" },
    ],
  },
  {
    id: "enterprise_email",
    label: "Enterprise Email Drip",
    type: "email",
    context: "3-email sequence for enterprise prospects. Day 1 / Day 5 / Day 12.",
    tone: "Short, confident, no fluff. Subject lines are specific numbers, not questions. Never 'I hope this finds you well.' Each email has one CTA — a specific call ask.",
    slpNotes: "Email can't transfer certainty the way a call can — it can only earn a call. Don't try to close in email. Every email ends with one specific ask.",
    script: `═══ EMAIL 1 — Day 1 ═══
Subject: $[X] finding in [industry] businesses — [Province]

[Name],

We just finished a sector analysis for [industry] businesses in [Province]. The average business in your revenue range is leaving $[range]/year uncaptured across three categories.

I'd like to show you where your business sits against that benchmark.

20-minute call. If there's nothing there, I'll tell you. If there is, we only get paid when we recover it — 12% of confirmed savings.

Are you free Tuesday or Wednesday this week?

[Your name] · Fruxal Recovery


═══ EMAIL 2 — Day 5 ═══
Subject: Re: $[X] finding in [industry] businesses

[Name],

Following up on my note from [day].

Most businesses we work with in [industry] didn't know these gaps existed — their accountants are focused on compliance, not recovery. That's the gap we fill.

If the timing is off, just let me know when's better. Otherwise I have [specific time] available this week.

[Your name]


═══ EMAIL 3 — Day 12 ═══
Subject: Closing the loop — [Company name]

[Name],

Last note from me on this.

If you're not interested, no problem — I won't follow up again.

If you're open to a 20-minute look at your numbers, I'm available [day]. The analysis is free. We only get paid if we find something worth recovering.

[Your name]`,
    objections: [],
  },
  {
    id: "noshow_reengagement",
    label: "No-Show Re-Engagement",
    type: "call",
    context: "Prospect booked a call, didn't show. Calling to reschedule.",
    tone: "Relaxed, zero guilt. Don't make them feel bad about missing it. Assume positive intent — something came up. Get back to the ask immediately.",
    slpNotes: "They already said yes once — they're still warm. Your job is to make rebooking frictionless. Don't over-explain or apologize. Two time options, let them pick.",
    script: `Hey [Name], it's [Your name] from Fruxal. We had time blocked earlier — I know things come up.

I've still got your analysis ready to go. All I need is 20 minutes.

I have [day/time] and [day/time] this week. Which one works?`,
    objections: [
      { trigger: "Sorry I forgot / something came up", response: "No worries at all. Life happens. I've still got everything pulled up — which of those two times works for you?" },
      { trigger: "I'm not sure I want to move forward", response: "Fair enough. Can I ask what shifted? When you booked, the numbers were compelling enough to put time aside — I want to understand what's changed so I can either address it or respect that it's not the right time." },
      { trigger: "Can you just send me the info?", response: "I can send a summary, but the honest answer is the useful information is in your specific numbers — not a PDF. The call is 20 minutes and you'll know exactly where you stand. That's worth more than anything I can put in an email." },
    ],
  },
  {
    id: "referral_inbound",
    label: "Referral Inbound",
    type: "call",
    context: "Prospect was referred by an existing client or partner. Expecting the call.",
    tone: "Warmer and faster than cold. You have credibility by proxy. Move quicker to the numbers — the Three 10s are partially pre-loaded by the referral.",
    slpNotes: "Lead with the referral immediately — strongest credibility signal. Then get specific about their situation fast. They're warm; don't slow down with small talk.",
    script: `Hi [Name], this is [Your name] from Fruxal. [Referrer name] suggested I reach out — I believe they mentioned me?

Great. [Referrer name] is a client of ours — we recovered [$ amount] for their business earlier this year. They thought you might be in a similar situation.

Here's how it works: I do a 20-minute analysis of your business — revenue, industry, province. I tell you exactly where the gaps are and how much is recoverable. If there's something worth going after, my team handles all the execution. CRA, vendors, grants. You pay 12% of what we confirm, nothing before.

Given you're in [industry] in [province], my initial read is the biggest opportunities are likely [area 1] and [area 2].

Does [day] work to look at your numbers?`,
    objections: [
      { trigger: "What did you do for [referrer]?", response: "I can't share specifics — client confidentiality — but I can tell you the category of recovery and approximate range if that helps. The type of situation we found for them is common in [industry]." },
      { trigger: "Is this the same thing they did?", response: "Same model, yes. Every business is different so the findings will be specific to you — but the process is identical. Analysis, agreement, execution, confirmation." },
    ],
  },
  {
    id: "accountant_partner",
    label: "Accountant Partner Outreach",
    type: "call",
    context: "Reaching out to accounting firms and bookkeepers to establish a referral relationship.",
    tone: "Peer-to-peer professional. You're offering to handle the recovery work they don't have capacity for, and paying them for the referral. Lead with their workload problem, not your product.",
    slpNotes: "This is a B2B partnership call. Their three concerns: (1) is this legitimate, (2) will it reflect well on me, (3) what do I get? Address all three before asking for anything.",
    script: `Hi [Name], my name is [Your name] — I'm with Fruxal, a financial recovery firm that works with Canadian SMBs.

I'll get to the point: we work alongside accountants, not around them. We identify financial leaks in small businesses — CRA overpayments, payroll misclassifications, SR&ED eligibility, supplier contract gaps — and execute the recovery on contingency. 12% of confirmed savings, nothing upfront.

The reason I'm calling is that most of your SMB clients probably have recoverable money on the table that you don't have capacity to go after — compliance work is already a full plate.

Here's what we offer: for every client you refer who signs an engagement, you earn [referral rate]% of our fee. You stay in the loop with a CPA briefing memo on every finding. And your client gets money back with no risk.

Can I walk you through how it works in 15 minutes?`,
    objections: [
      { trigger: "How do I know this is legitimate?", response: "Completely fair. We're a Canadian company operating on contingency — same model as a tax recovery specialist or legal contingency firm. We send you a full methodology memo on every engagement. You can review what we're doing before we do it. We've never had a CRA issue because our findings are well-sourced." },
      { trigger: "My clients trust me — I don't want to risk that", response: "That's exactly why we operate the way we do. Your name only goes on this if the finding is solid. We do the analysis first, show you the findings, and you decide whether to share with your client. You're in control of the referral, not us." },
      { trigger: "We do this kind of work already", response: "Some firms do, yes. If you're actively doing SR&ED claims, payroll audits, and grant applications for your SMB clients, this probably isn't a fit. But most practices I talk to are focused on compliance and year-end — the recovery work is a different specialization. If you're already doing it, we can still refer work to each other." },
    ],
  },
  {
    id: "post_recovery_referral",
    label: "Post-Recovery Referral Ask",
    type: "call",
    context: "Client just received confirmed savings. Asking for referrals at peak satisfaction.",
    tone: "Celebratory but brief. They're happy — don't oversell or drag it out. The ask should feel natural, not transactional. 30 seconds max.",
    slpNotes: "Highest-conversion moment in the entire funnel. The client just received real money because of you — all Three 10s are maxed. The referral ask is 30 seconds and comes right after confirming the recovery.",
    script: `[Name], I wanted to call personally to confirm — [$ amount] has been recovered and the fee of [fee amount] has been invoiced. You should see the net [net amount] within [timeframe].

That's real money back in your business.

I have one quick ask: do you know any other business owners who might be in a similar situation? Doesn't have to be the same industry — anyone running a Canadian business above $300K in revenue is likely leaving money on the table.

If you refer someone who signs an engagement, you get [referral credit/fee] as a thank-you. And they get the same service you got.

Who comes to mind?`,
    objections: [
      { trigger: "I'd have to think about who to refer", response: "Totally fair. No rush. If someone comes to mind in the next few weeks, send them directly to [booking link] or just email me their name and I'll reach out. I just wanted to ask while the experience was fresh." },
      { trigger: "I don't want to bother my contacts", response: "Understood. The only thing I'd say is — if a friend told you about getting $40,000 back that you didn't know was sitting there, would you want them to tell you? That's all you'd be doing. But I respect if it's not your style." },
    ],
  },
];

const TYPE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  call:  { label: "Call Script", color: "#1B3A2D", bg: "rgba(27,58,45,0.08)"   },
  email: { label: "Email Drip",  color: "#0369a1", bg: "rgba(3,105,161,0.08)"  },
};

export default function RepScriptsPage() {
  const router = useRouter();
  const [active, setActive] = useState<string>(SCRIPTS[0].id);
  const [tab, setTab] = useState<"script" | "objections">("script");
  const [copied, setCopied] = useState(false);

  const script = SCRIPTS.find(s => s.id === active)!;
  const ts = TYPE_STYLE[script.type];

  function copy() {
    navigator.clipboard?.writeText(script.script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/rep/dashboard")}
              className="text-[12px] font-semibold text-[#8E8C85] hover:text-[#1A1A18] transition">← Dashboard</button>
            <span className="text-[#E5E3DD]">|</span>
            <span className="text-[14px] font-bold text-[#1B3A2D]">Script Library</span>
          </div>
          <button onClick={() => router.push("/rep/training")}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-[#E5E3DD] text-[#1B3A2D] hover:bg-[#F0EFEB] transition">
            Drill Mode →
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-52 shrink-0">
          <p className="text-[9px] font-bold text-[#B5B3AD] uppercase tracking-wider mb-2 px-1">{SCRIPTS.length} Scripts</p>
          <div className="space-y-0.5">
            {SCRIPTS.map(s => {
              const st = TYPE_STYLE[s.type];
              const isActive = active === s.id;
              return (
                <button key={s.id} onClick={() => { setActive(s.id); setTab("script"); setCopied(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${isActive ? "bg-[#1B3A2D]" : "hover:bg-[#F0EFEB]"}`}>
                  <p className={`text-[12px] font-semibold leading-snug ${isActive ? "text-white" : "text-[#1A1A18]"}`}>{s.label}</p>
                  <span className="text-[9px] font-bold mt-0.5 inline-block px-1.5 py-0.5 rounded"
                    style={isActive
                      ? { background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }
                      : { background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 px-3 py-3 rounded-xl" style={{ background: "rgba(196,132,29,0.05)", border: "1px solid rgba(196,132,29,0.15)" }}>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: "#C4841D" }}>The Three 10s</p>
            {[{ n:"1", t:"The Rep", d:"They trust you" }, { n:"2", t:"Fruxal", d:"They trust the company" }, { n:"3", t:"The Numbers", d:"They believe the ROI" }].map(t => (
              <div key={t.n} className="flex items-start gap-1.5 mb-1.5">
                <span className="text-[11px] font-bold shrink-0 mt-0.5" style={{ color: "#C4841D" }}>{t.n}</span>
                <div>
                  <p className="text-[10px] font-semibold text-[#1A1A18] leading-tight">{t.t}</p>
                  <p className="text-[9px] text-[#8E8C85]">{t.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-[#E5E3DD] rounded-2xl p-5 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-[16px] font-bold text-[#1A1A18]">{script.label}</h1>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: ts.bg, color: ts.color }}>{ts.label}</span>
                </div>
                <p className="text-[12px] text-[#8E8C85]">{script.context}</p>
              </div>
              {script.objections.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-lg shrink-0 ml-4"
                  style={{ background: "rgba(179,64,64,0.06)", color: "#B34040" }}>
                  {script.objections.length} objection{script.objections.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="px-3 py-2.5 rounded-xl" style={{ background: "#FAFAF8", border: "1px solid #F0EFEB" }}>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#8E8C85] mb-1">Tone</p>
                <p className="text-[11px] text-[#3A3935] leading-relaxed">{script.tone}</p>
              </div>
              <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(196,132,29,0.04)", border: "1px solid rgba(196,132,29,0.12)" }}>
                <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#C4841D" }}>SLP Notes</p>
                <p className="text-[11px] text-[#3A3935] leading-relaxed">{script.slpNotes}</p>
              </div>
            </div>
          </div>

          {script.objections.length > 0 && (
            <div className="flex gap-1 mb-3">
              {(["script", "objections"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-1.5 text-[11px] font-semibold rounded-lg transition"
                  style={{ background: tab === t ? "#1B3A2D" : "white", color: tab === t ? "white" : "#8E8C85", border: tab === t ? "none" : "1px solid #E5E3DD" }}>
                  {t === "script" ? "Full Script" : `Objection Handlers (${script.objections.length})`}
                </button>
              ))}
            </div>
          )}

          {tab === "script" && (
            <div className="bg-white border border-[#E5E3DD] rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0EFEB]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8C85]">Script</span>
                <button onClick={copy} className="text-[11px] font-semibold transition" style={{ color: copied ? "#2D7A50" : "#1B3A2D" }}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <div className="px-6 py-5">
                <pre className="text-[13px] text-[#1A1A18] leading-[1.8] whitespace-pre-wrap font-sans">{script.script}</pre>
              </div>
            </div>
          )}

          {tab === "objections" && script.objections.length > 0 && (
            <div className="space-y-3">
              {script.objections.map((obj, i) => (
                <div key={i} className="bg-white border border-[#E5E3DD] rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div className="px-5 py-3 border-b border-[#F0EFEB]" style={{ background: "rgba(179,64,64,0.03)" }}>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: "rgba(179,64,64,0.08)", color: "#B34040" }}>Objection</span>
                      <p className="text-[12px] font-semibold text-[#1A1A18]">&ldquo;{obj.trigger}&rdquo;</p>
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(27,58,45,0.08)", color: "#1B3A2D" }}>Response</span>
                    <p className="text-[13px] text-[#1A1A18] leading-relaxed mt-2">{obj.response}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
