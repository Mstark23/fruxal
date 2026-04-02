"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// =============================================================================
// REP PLAYBOOK — Every Contact Scenario
// =============================================================================

type Scenario = {
  id: string;
  title: string;
  icon: string;
  color: string;
  desc: string;
  sections: { label: string; content: string }[];
};

const SCENARIOS: Scenario[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 1: COLD OUTREACH — They've never heard of Fruxal
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "cold",
    title: "Cold Outreach",
    icon: "🧊",
    color: "#0369a1",
    desc: "Prospect never heard of Fruxal. No prescan, no signup. You have industry data suggesting they're a fit.",
    sections: [
      {
        label: "Before the Call — Research",
        content: `YOU NEED 3 THINGS BEFORE CALLING:

1. THEIR INDUSTRY — What do they do? (restaurant, contractor, IT services, etc.)
2. THEIR APPROXIMATE REVENUE — Check their website, Google, LinkedIn company size
3. ONE INDUSTRY-SPECIFIC LEAK — The ONE thing most businesses in their industry overpay on:
   - Restaurants: processing fees (2.9% vs 2.2% median)
   - Contractors: insurance premiums (not requoted in 2+ years)
   - Professional services: corporate structure (sole prop vs corp tax gap)
   - Retail: inventory shrinkage + processing
   - Trucking: fuel card programs + CCA on fleet

YOU DON'T NEED their exact numbers. You need ONE credible data point that gets them curious.`,
      },
      {
        label: "The Cold Open — First 10 Seconds",
        content: `"Hi [NAME], this is [YOUR NAME] from Fruxal? [up-tone] I work with [INDUSTRY] businesses in [PROVINCE] and I had a quick question — got 30 seconds?" [Reasonable Man tone]

IF THEY SAY YES:
"Great — we've been working with a lot of [INDUSTRY] businesses lately and finding that most are overpaying on [ONE SPECIFIC THING] by 15-25%. I'm curious — when's the last time you looked at your [processing rates / insurance / corporate structure]?"

IF THEY SAY "WHAT DO YOU WANT?":
"Fair enough — in a nutshell, we find money businesses are losing and recover it. No upfront cost. I'm calling because [INDUSTRY] businesses in [PROVINCE] tend to have [SPECIFIC LEAK]. Worth a 2-minute conversation?" [Absolute Certainty tone]

IF THEY SAY "NOT INTERESTED":
"Totally understand. Quick question before I go — are you paying more than 2.3% on card processing? Because if you are, you're leaving money on the table and I can prove it in 60 seconds." [Scarcity tone — this is your Hail Mary]

KEY SLP PRINCIPLES:
- First 4 seconds: Enthusiastic, Sharp as a Tack, Force to be Reckoned With
- Ask a QUESTION, don't make a pitch — questions create engagement
- Use their INDUSTRY to show you're not a generic cold caller
- "Got 30 seconds?" is a Reasonable Man minimizer`,
      },
      {
        label: "If They Engage — The Transition to a Scan",
        content: `Once they're talking, your goal is to get them to run the free scan:

"Here's what I'd suggest — we have a free 3-minute business scan that compares your setup against [INDUSTRY] benchmarks. It'll tell you exactly where you stand on processing, insurance, tax structure, all of it.

No account needed, no commitment. Takes literally 3 minutes. If it finds nothing, we shake hands and move on. If it finds something, I'll walk you through it.

Want me to send you the link?"

SEND THEM: fruxal.ca?industry=[THEIR_INDUSTRY] (or fruxal.com for US)
OR: "I can stay on the line and walk you through it right now — takes 3 minutes."

WHY THE SCAN IS YOUR BEST TOOL:
- It's free (removes all risk)
- It's quick (3 minutes, not an hour meeting)
- It gives you REAL NUMBERS to work with on the follow-up call
- It moves them from "cold prospect" to "warm lead with data"`,
      },
      {
        label: "Cold Email (When You Can't Get Them on Phone)",
        content: `SUBJECT: Quick question about your [PROCESSING FEES / INSURANCE / TAX STRUCTURE]

Hi [NAME],

I work with [INDUSTRY] businesses in [PROVINCE]. Most are overpaying on [SPECIFIC THING] by 15-25% without knowing it.

Quick question: when's the last time you compared your [PROCESSING RATES / INSURANCE PREMIUMS]?

We run a free 3-minute scan that shows you exactly where you stand vs industry benchmarks. No cost, no account, no strings.

If it finds nothing — great, you're optimized. If it finds something — I'll walk you through it in 15 minutes.

Here's the link: [PRESCAN URL]

Or reply "interested" and I'll call you.

[YOUR NAME]
Fruxal · We find the money. You keep 88%.

KEY: The subject line must be specific and relevant to their industry. Generic subjects get deleted.`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 2: REFERRAL INTRODUCTION
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "referral",
    title: "Referral Introduction",
    icon: "🤝",
    color: "#2D7A50",
    desc: "Someone referred them. You have a warm intro — this is your highest conversion scenario.",
    sections: [
      {
        label: "The Referral Call — Opening",
        content: `"Hi [NAME], this is [YOUR NAME] from Fruxal? [up-tone] [REFERRER NAME] suggested I reach out — they mentioned you might benefit from what we do. Got a couple of minutes?" [I Really Want to Know tone]

WHY THIS IS YOUR BEST SCENARIO:
- 10 #1 (You) starts higher — the referrer already vouched for you
- 10 #2 (Fruxal) starts higher — they heard a real success story
- You just need to build 10 #3 (The Numbers) with their specific data

IMMEDIATELY AFTER THEY SAY YES:
"[REFERRER] and I worked together on recovering some money their business was losing — ended up finding about $[REFERRER AMOUNT] they didn't know about. They mentioned your business might have some similar things going on, especially around [INDUSTRY-SPECIFIC AREA].

Have you ever had anyone look at your [processing fees / insurance / tax structure] specifically?"`,
      },
      {
        label: "Using the Referrer's Story",
        content: `THE REFERRER'S RESULTS ARE YOUR STRONGEST WEAPON.

"When we worked with [REFERRER], we found [AMOUNT] in [CATEGORY]. The biggest surprise was [SPECIFIC FINDING] — they had no idea they were overpaying by that much. Took us about [TIMELINE] to confirm the recovery."

THEN BRIDGE TO THEM:
"Your business is similar in [industry/size/structure], which is why [REFERRER] thought of you. Would you be open to a quick scan? It's free, takes 3 minutes, and worst case you find out you're already optimized."

SLP TECHNIQUE:
This is social proof + presupposing. You're not asking "would you like to try this?" You're saying "someone you trust already did this and it worked."

NEVER:
- Share specific dollar amounts from the referrer without their permission
- Exaggerate the referrer's results
- Name the referrer if they didn't give permission to be named`,
      },
      {
        label: "Referral Email Template",
        content: `SUBJECT: [REFERRER NAME] suggested I reach out

Hi [NAME],

[REFERRER NAME] and I have been working together on recovering some money their business was losing — and they thought you might benefit from the same thing.

We specialize in finding hidden financial leaks in [INDUSTRY] businesses — processing fees, insurance, tax structure, government programs. Most businesses are losing $8K-$15K/year without knowing it.

[REFERRER] suggested I send you our free business scan: [LINK]

Takes 3 minutes. No cost, no commitment. If it finds something, I'll walk you through it. If not, no harm done.

Would love to connect if you're open to it.

[YOUR NAME]
Fruxal

P.S. — [REFERRER] said to say hi.

WHY THE P.S. WORKS: People always read the P.S. It re-anchors the referral relationship and adds warmth.`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 3: INBOUND SIGNUP — No prescan done
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "inbound",
    title: "Inbound Signup (No Prescan)",
    icon: "📥",
    color: "#7C3AED",
    desc: "They created an account (Google or email) but never ran the prescan or diagnostic.",
    sections: [
      {
        label: "Why They Signed Up But Didn't Scan",
        content: `COMMON REASONS:
1. Got distracted — opened account, phone rang, forgot
2. Unsure — wanted to see the dashboard first before committing data
3. Privacy concern — not ready to share business info yet
4. Confusion — didn't understand what to do next

YOUR JOB: Get them to run the prescan. Without data, you have nothing to work with.`,
      },
      {
        label: "The Inbound Call — Opening",
        content: `"Hi [NAME], this is [YOUR NAME] from Fruxal? [up-tone] I saw you created an account recently — welcome aboard! [Enthusiastic] I wanted to make sure everything's set up for you. Have you had a chance to run the business scan yet?" [I Really Want to Know tone]

IF THEY HAVEN'T:
"No worries at all — it takes about 3 minutes. I can actually walk you through it right now if you have a sec. I'll stay on the line while you answer the questions, and then I can show you what it finds in real-time."

IF THEY HAVE BUT DIDN'T FINISH:
"Totally fine — that happens. Want to finish it now? I'll guide you through it. We're about [X] questions away and then I can show you your results immediately."

IF THEY SAY "I WAS JUST LOOKING":
"Makes total sense. Quick question though — what made you sign up in the first place? Was there something specific you were curious about?" [I Really Want to Know tone]
→ Whatever they say IS their pain point. Use it.

SLP KEY: You're building 10 #1 (You) here. You're helpful, not pushy. You called to help, not to sell.`,
      },
      {
        label: "Walking Them Through the Prescan Live",
        content: `THIS IS YOUR HIGHEST-VALUE MOVE WITH INBOUND LEADS.

"Let me send you the link right now — fruxal.ca — and I'll stay on the phone while you do it. First question will be about your industry..."

WHILE THEY ANSWER:
- Stay engaged: "Great, got it" after each answer
- Add context: "The reason we ask about processing is because [INDUSTRY] businesses typically overpay by..."
- Build anticipation: "Once you finish this part, the scan runs against 4,000+ benchmarks for [INDUSTRY] businesses in [PROVINCE]"

WHEN RESULTS APPEAR:
"Okay, you should see your results now. What does the total say?"
→ Let THEM read the number out loud. This creates ownership of the data.

"Right — so $[AMOUNT] is what the scan is estimating based on your answers. Want me to walk you through the top finding?"

YOU NOW HAVE DATA. Transition to the review call flow (Playbook Stage 04).`,
      },
      {
        label: "Inbound Email — Get Them to Scan",
        content: `SUBJECT: Your Fruxal account is ready — just need 3 minutes

Hi [NAME],

Welcome to Fruxal! I saw you created an account but haven't run the business scan yet.

The scan is the foundation of everything we do — it compares your business against industry benchmarks and flags where you might be overpaying.

It takes about 3 minutes: [PRESCAN LINK]

Once you've done it, I'll personally review your results and walk you through anything we find. If it comes back clean — great, you're optimized.

Want me to call you and walk through it together? Sometimes it's easier with a guide.

Reply with a good time and I'll call you.

[YOUR NAME]
Fruxal`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 4: POST-PRESCAN — They ran the scan
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "post-prescan",
    title: "Post-Prescan Lead",
    icon: "📊",
    color: "#C4841D",
    desc: "They completed the prescan. You have their data — total leak, findings, industry, province. This is your bread and butter.",
    sections: [
      {
        label: "The First Call — Within 24 Hours",
        content: `THE 24-HOUR RULE: Contact within 24 hours. Non-negotiable. 3x conversion rate.

OPEN YOUR CLIENT FILE → Read total leak, top 3 findings, industry, province.
CLICK "CALL SCRIPT" → AI generates personalized opening with their numbers.

OPENING:
"Hi [NAME], this is [YOUR NAME] from Fruxal? [up-tone] I'm calling because your business scan flagged some things worth looking at. Got a minute?" [Reasonable Man]

THE HOOK:
"Your scan found about [TOTAL] a year in potential savings across [NUMBER] areas. The biggest one is [TOP FINDING] at roughly [TOP AMOUNT] per year. I'd love to walk you through what we found in a quick 15-minute call."

THE ASK:
"Would [TOMORROW] at [TIME] work?" → Always offer a specific time.`,
      },
      {
        label: "Follow-Up Sequence (If No Response)",
        content: `DAY 1: Call + voicemail + email
DAY 3: Email — single finding angle
   SUBJECT: Quick question about your [CATEGORY]
   "When's the last time you compared your [processing rates]? Your scan shows you're paying $[X] more than similar businesses."

DAY 5: Second call (different time of day)

DAY 7: Email — cost of waiting
   SUBJECT: $[MONTHLY LEAK] — that's what this month cost
   "Since your scan, roughly $[MONTHLY] has leaked. The scan is here when you're ready."

DAY 10: Breakup email
   SUBJECT: Should I close your file?
   "I don't want to be a pest. If now isn't the right time, no worries. Your results are saved."
   → THIS EMAIL gets the highest response rate.

DAY 14: Stop active outreach. Move to nurture.

RULES:
- Max 3 calls. Max 4 emails. Space 2-3 days apart.
- Never more than one contact per day.`,
      },
      {
        label: "The Review Call — Minute by Minute",
        content: `MINUTE 0-2: RAPPORT
"Thanks for making time. Before I jump in — how's business?" [I Really Want to Know]
→ Let them talk 30-60 seconds. Listen. You're qualifying.

MINUTE 2-10: FINDINGS
"Your Health Score is [SCORE]/100. We found [NUMBER] areas totaling [TOTAL]/year."
For each top finding:
1. Name it
2. Plain language explanation
3. Show the math
4. "Does that make sense?" [micro-agreement]

MINUTE 10-12: THE ASK
"We handle all the recovery. You do nothing. Our fee: 12% of confirmed savings.
So [TOTAL] recovered = you keep [88%]. We recover nothing = you pay nothing.
Which finding stands out to you?"

MINUTE 12-15: OBJECTIONS + CLOSE
→ Identify which of the Three 10s is weak. Loop. Close.
→ "Want me to send the agreement? Takes 2 minutes." [Presupposing]`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 5: REACTIVATION — Cold/Dead Lead
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "reactivation",
    title: "Reactivation (Cold Lead)",
    icon: "🔄",
    color: "#B34040",
    desc: "Old lead that went cold — did prescan weeks/months ago, never converted. You're bringing them back.",
    sections: [
      {
        label: "Why Leads Go Cold + How to Revive Them",
        content: `WHY THEY WENT COLD:
1. Life got busy — not that they weren't interested
2. Bad timing — cash tight, other priorities
3. Didn't trust the numbers — certainty wasn't transferred
4. Follow-up stopped — YOUR fault, not theirs

THE REACTIVATION ADVANTAGE:
- They already have data in the system
- They already showed interest once
- Their leaks have gotten BIGGER (more months of loss)

CALCULATE THE COST OF DELAY:
Original total leak: $[X]/year
Months since prescan: [N]
Money lost since: $[X ÷ 12 × N]
→ THIS is your opening hook.`,
      },
      {
        label: "The Reactivation Call",
        content: `"Hi [NAME], this is [YOUR NAME] from Fruxal? [up-tone] We connected a while back about your business scan — I wanted to circle back with an update." [I Care tone]

THE UPDATE HOOK:
"I was reviewing your file and realized it's been [N] months since your scan. Based on what we found, that's roughly $[MONTHS × MONTHLY LEAK] that's leaked since we last talked. The findings haven't changed — if anything, some may have gotten worse with rate increases."

THEN:
"I know timing wasn't right before. Is now a better time to take a look? I can walk through the updated numbers in 10 minutes."

IF THEY'RE HESITANT:
"Totally fine — no pressure. But the insurance requote alone takes zero effort on your end and usually saves $2-5K. Can I at least start that one?" [Lower the action threshold with a small first step]

IF THEY SAY "I FORGOT ABOUT THIS":
"That's actually really common — life gets busy. The good news is your scan is still here and the data is still valid. Want me to pull up the top finding right now?"`,
      },
      {
        label: "Reactivation Email",
        content: `SUBJECT: $[AMOUNT LOST SINCE SCAN] — since we last talked

Hi [NAME],

It's been [N] months since your Fruxal scan found $[TOTAL]/year in potential savings. That means roughly $[LOST SINCE] has leaked since we last connected.

Your results are still here. The findings are still valid. And the money is still leaving.

If now is a better time, I'd love to walk through it again — takes 15 minutes.

[CALENDLY LINK]

No hard feelings if the timing still isn't right. But the leak doesn't pause.

[YOUR NAME]
Fruxal

WHY: The dollar amount lost since the scan creates a visceral "ouch" moment. They can't unhear it.`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 6: ENTERPRISE / CFO OUTREACH ($1M+)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "enterprise",
    title: "Enterprise / CFO Outreach",
    icon: "🏢",
    color: "#1B3A2D",
    desc: "$1M+ revenue businesses. Different language, different decision-maker, different timeline.",
    sections: [
      {
        label: "How Enterprise is Different",
        content: `ENTERPRISE PROSPECTS ARE DIFFERENT:

1. DECISION MAKER is a CFO/Owner/CEO — not a manager
2. LANGUAGE must be sophisticated — no "quick scan", no "got a minute?"
3. TIMELINE is longer — weeks, not days
4. STAKES are higher — $50K-$200K+ in potential recovery
5. THEY HAVE AN ACCOUNTANT — definitely. Your differentiation must be sharp.
6. THEY'VE BEEN SOLD TO — by every consultant, advisor, and vendor. They're immune to pitches.

YOUR APPROACH: Act like a peer, not a salesperson. You're a financial intelligence firm, not a lead gen company. Speak their language.`,
      },
      {
        label: "The Enterprise Opening",
        content: `"[NAME], [YOUR NAME] from Fruxal. [No up-tone — flat, confident, peer-to-peer] We're a financial recovery firm that works on contingency with mid-market businesses. I'll be brief."

THE HOOK — CHOOSE ONE:
If you know their industry:
"We've been working with [INDUSTRY] companies in the [REVENUE RANGE] bracket and consistently finding $50-150K in recoverable savings — mostly in tax structure, vendor contracts, and unclaimed programs. I'm curious whether anyone's done a forensic-level review of your cost base recently."

If they're public or you have data:
"I was looking at your business and noticed a couple of signals that suggest you might have some material tax structure inefficiencies. Specifically around [owner comp mix / passive income / SR&ED eligibility / entity structure]. Worth a conversation?"

SLP NOTES:
- No Reasonable Man tone — these people see through casual
- Use Absolute Certainty — you've seen this pattern before
- "I'll be brief" = respect for their time = instant credibility
- "forensic-level review" = positions you as serious, not a scan tool`,
      },
      {
        label: "Enterprise Email Template",
        content: `SUBJECT: [COMPANY NAME] — financial structure review

[NAME],

Fruxal is a contingency-based financial recovery firm. We work with [INDUSTRY] businesses in the $1-10M range to identify and recover savings across tax structure, vendor contracts, insurance, and government programs.

We consistently find $50-150K in recoverable savings for businesses at your stage. Our fee: 12% of confirmed recovery only. No retainer, no upfront cost, no engagement unless we find something material.

Three areas where we typically find the most for [INDUSTRY] companies:
1. [SPECIFIC AREA 1 — e.g., "SR&ED eligibility on your R&D activities"]
2. [SPECIFIC AREA 2 — e.g., "Owner compensation structure optimization"]
3. [SPECIFIC AREA 3 — e.g., "Commercial insurance competitiveness"]

Would a 20-minute call make sense to see if there's a fit?

[YOUR NAME]
Fruxal Financial Recovery
[PHONE] · [CALENDLY]

KEY DIFFERENCES FROM SMB EMAIL:
- No "free scan" language — sounds cheap
- "20-minute call" not "15-minute" — enterprise expects more substance
- Three specific areas — shows you've done homework
- "Material" savings — enterprise language
- "Contingency-based" up front — removes the "here we go, another fee" reaction`,
      },
      {
        label: "The Enterprise Review Meeting",
        content: `Enterprise calls are 30-45 minutes, not 15. Structure:

MINUTE 0-5: POSITIONING
"Thanks for making time. Let me tell you how we work, and then I'll show you what we've found in a preliminary analysis — and you can tell me if any of it resonates."

Explain the model:
- "We work on contingency. 12% of confirmed savings. If we find nothing, you pay nothing."
- "We work alongside your accountant, not instead of them. We handle optimization, they handle compliance."
- "Everything we find is backed by specific calculations, not estimates."

MINUTE 5-20: FINDINGS PRESENTATION
Present as a "preliminary analysis" not a "scan." Walk through top findings WITH the math.

For enterprise, add:
- Industry benchmarking context ("Companies at your revenue level in [INDUSTRY] typically...")
- Compliance exposure ("Based on your structure, your penalty exposure on [OBLIGATION] is approximately...")
- Strategic recommendations ("If you're planning an exit in the next 3-5 years, the LCGE/QSBS planning alone could be worth...")

MINUTE 20-30: DISCUSSION
"What resonates? What doesn't? What would you need to see to feel confident moving forward?"
→ Let THEM talk. Enterprise buyers need to process out loud.

MINUTE 30-35: NEXT STEPS
"Here's what I'd suggest: we formalize an engagement agreement, I request specific documents from your team, and within 60 days you'll have confirmed recovery numbers. Sound reasonable?"`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO 7: NO-SHOW — They booked but didn't show up
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "no-show",
    title: "No-Show Recovery",
    icon: "👻",
    color: "#8E8C85",
    desc: "They booked a call and didn't show up. They feel guilty. Handle with grace and you'll rebook 60% of them.",
    sections: [
      {
        label: "The No-Show Call (Same Day)",
        content: `Call them 15-30 minutes after the missed time:

"Hey [NAME], it's [YOUR NAME] from Fruxal. We had a call booked for [TIME] — no worries at all if something came up. [I Care tone] Things happen. Want to reschedule for later this week?"

KEY RULES:
- NO guilt-tripping. No "I was waiting for you." No passive aggression.
- LIGHT and easy. They already feel bad — don't make it worse.
- OFFER to reschedule immediately — don't wait for them to suggest it.
- If voicemail: "Hey [NAME], I think we missed each other — totally fine. Here's my calendar link to rebook whenever works: [CALENDLY]. Talk soon."

SLP: This is ALL about 10 #1 (You). You're showing grace under frustration. This builds massive trust. Many no-shows become your best clients because you handled it so well.`,
      },
      {
        label: "No-Show Email (If No Answer on Phone)",
        content: `SUBJECT: No worries — let's reschedule

Hi [NAME],

I think we missed each other for our call today — no worries at all, I know things come up.

Here's my calendar to rebook whenever works: [CALENDLY LINK]

Your scan results ($[TOTAL]/year in potential savings) are still here whenever you're ready.

[YOUR NAME]

WHY SHORT: They feel guilty. A long email makes them feel worse and less likely to respond. Short + graceful = high rebook rate.`,
      },
    ],
  },
];

export default function RepPlaybookPage() {
  const router = useRouter();
  const [activeScenario, setActiveScenario] = useState("cold");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const scenario = SCENARIOS.find(s => s.id === activeScenario)!;

  return (
    <div className="min-h-screen" style={{ background: "#0F1A14", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ borderBottom: "1px solid rgba(45,122,80,0.2)", background: "rgba(27,58,45,0.4)" }}>
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/rep/dashboard")}
              className="text-[12px] font-semibold hover:text-white transition"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              ← Dashboard
            </button>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
            <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#C4841D" }}>
              Contact Playbook
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/rep/training/learn")}
              className="px-3 py-1.5 text-[11px] font-bold rounded-lg transition"
              style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
              SLP Training
            </button>
            <button onClick={() => router.push("/rep/training")}
              className="px-3 py-1.5 text-[11px] font-bold rounded-lg transition"
              style={{ background: "rgba(45,122,80,0.15)", color: "#2D7A50", border: "1px solid rgba(45,122,80,0.3)" }}>
              Drill →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-8">
        <h1 className="text-[24px] font-bold text-white mb-2">Contact Playbook</h1>
        <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
          Every scenario you'll face — exactly what to say, when, and how. Pick your situation.
        </p>

        {/* Scenario selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => { setActiveScenario(s.id); setExpandedItem(null); }}
              className="text-left p-3 rounded-xl transition-all"
              style={{
                background: activeScenario === s.id ? s.color + "22" : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeScenario === s.id ? s.color + "66" : "rgba(255,255,255,0.08)"}`,
              }}>
              <span className="text-[18px]">{s.icon}</span>
              <p className="text-[12px] font-bold mt-1" style={{ color: activeScenario === s.id ? s.color : "rgba(255,255,255,0.6)" }}>{s.title}</p>
              <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: "rgba(255,255,255,0.3)" }}>{s.desc}</p>
            </button>
          ))}
        </div>

        {/* Scenario header */}
        <div className="mb-6 p-5 rounded-xl" style={{ background: scenario.color + "15", border: `1px solid ${scenario.color}33` }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[28px]">{scenario.icon}</span>
            <h2 className="text-[18px] font-bold text-white">{scenario.title}</h2>
          </div>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>{scenario.desc}</p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {scenario.sections.map((item, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-black w-6 text-center" style={{ color: scenario.color }}>{i + 1}</span>
                  <span className="text-[14px] font-semibold text-white">{item.label}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: expandedItem === item.label ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedItem === item.label && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <pre className="text-[13px] leading-[1.8] whitespace-pre-wrap pt-4 font-sans"
                    style={{ color: "rgba(255,255,255,0.7)" }}>
                    {item.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
