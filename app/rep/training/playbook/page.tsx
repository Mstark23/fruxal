"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// =============================================================================
// REP PLAYBOOK — The Complete Customer Contact System
// =============================================================================
// Step-by-step guide: from lead assignment to fee collection.
// Every stage has: what to do, when to do it, exactly what to say,
// which SLP techniques to use, and what to avoid.
// =============================================================================

const STAGES = [
  {
    id: "stage-1",
    stage: "01",
    title: "Lead Assigned — First 30 Minutes",
    color: "#2D7A50",
    timing: "Within 30 minutes of assignment",
    goal: "Review the file + prepare your opening",
    sections: [
      {
        label: "What You Do First (Before Calling)",
        content: `1. OPEN THE CLIENT FILE → Click the client in your dashboard
2. READ THE DIAGNOSTIC — Look at:
   - Total annual leak (the headline number)
   - Top 3 findings by dollar amount
   - Their industry + province
   - Their revenue bracket
3. CLICK "CALL SCRIPT" → The AI generates a personalized opening using their real numbers
4. PICK YOUR LEAD FINDING — Choose the single most impressive finding to lead with:
   - Highest dollar amount
   - Easiest to explain
   - Most concrete (processing rate > "tax optimization gap")

EXAMPLE: "$87K total leak. Top finding: processing fees $4,800/yr — their rate is 2.8%, median is 2.2%. Restaurant in Montreal, ~$1.2M revenue."

You now know more about their finances than they do. That's your advantage.`,
      },
      {
        label: "The 24-Hour Rule",
        content: `CRITICAL: Contact within 24 hours of assignment. This is non-negotiable.

WHY: Clients who hear from you within 24 hours book at 3x the rate of those who wait 3+ days.

The prescan is fresh in their mind. They saw their leaks. They're curious. Every hour that passes, that curiosity fades.

IF YOU CAN'T CALL: Send the booking link email immediately (use the "Send Booking Link" button in the client file). Then call within 24 hours.`,
      },
    ],
  },
  {
    id: "stage-2",
    stage: "02",
    title: "The First Call — Making Contact",
    color: "#0369a1",
    timing: "Within 24 hours of assignment",
    goal: "Get them to agree to a 15-minute review call",
    sections: [
      {
        label: "The Opening (First 4 Seconds)",
        content: `EXACTLY WHAT TO SAY:

"Hi [NAME], this is [YOUR NAME] from Fruxal? [up-tone] I'm calling because your business scan flagged some things worth looking at. Got a minute?" [Reasonable Man tone]

WHY EACH WORD MATTERS:
- "from Fruxal?" → Up-tone on declarative, triggers micro-agreement
- "your business scan" → Reminds them they initiated this
- "flagged some things" → Curiosity, not overselling
- "Got a minute?" → Reasonable Man, implies it's quick

WHAT THEY'LL SAY:
- "Yeah, what is it?" → GOOD. Move to the pitch.
- "I'm busy" → "Totally understand. When's a better time today? I just need 2 minutes." [I Care tone]
- "Who?" → "Fruxal — you ran a business scan on our site recently? It found some savings worth looking at." [Question as declarative]
- Voicemail → Leave a 15-second message (see voicemail script below)`,
      },
      {
        label: "The 30-Second Hook (After They Say Yes)",
        content: `"Your scan found about [TOTAL LEAK] a year in potential savings across [NUMBER] areas. The biggest one is [TOP FINDING NAME] at roughly [TOP AMOUNT] per year.

I'd love to walk you through what we found in a quick 15-minute call. I pull up your report, explain each item in plain language, and you decide if any of it is worth pursuing. No cost, no commitment."

SLP TECHNIQUES USED:
- Lead with THEIR number (10 #3 — The Numbers)
- Specific finding name + amount (builds certainty)
- "15-minute call" → Minimizer (makes it seem small)
- "You decide" → Removes pressure (lowers Action Threshold)
- "No cost, no commitment" → Risk removal

THEN ASK:
"Would [TOMORROW/DAY] at [TIME] work for a quick call?"
→ Always offer a specific time. Never say "when works for you?"
→ Specific = easy to say yes. Open-ended = easy to defer.`,
      },
      {
        label: "Voicemail Script (15 Seconds Max)",
        content: `"Hi [NAME], this is [YOUR NAME] from Fruxal. Your business scan found [TOTAL LEAK] in potential annual savings — I'd love to walk you through it. No cost on your end. My number is [NUMBER] or you can book directly at [CALENDLY URL]. Talk soon."

RULES:
- 15 seconds MAX. Longer voicemails get deleted.
- Say the dollar amount. It's the hook.
- Leave your number AND the booking link.
- Sound enthusiastic but not salesy.
- ONE voicemail only. Follow up by email next.`,
      },
      {
        label: "Follow-Up Email (Send Immediately After Voicemail)",
        content: `SUBJECT: $[TOTAL LEAK]/yr — your Fruxal scan results

Hi [NAME],

I just tried calling — your business scan flagged [TOTAL LEAK] in potential annual savings across [NUMBER] areas.

The biggest finding: [TOP FINDING] at roughly [TOP AMOUNT]/yr.

I'd love to walk you through the results in a quick 15-minute call. I pull up your report, explain each item, and you decide what's worth pursuing.

No cost. No commitment. You only pay if we actually recover money.

Book a time here: [CALENDLY LINK]

Or just reply "yes" and I'll call you.

[YOUR NAME]
Fruxal Recovery Team

WHY THIS EMAIL WORKS:
- Subject line has the dollar amount (they'll open it)
- First line = reason for calling (context)
- One specific finding (proof it's real)
- "15-minute call" minimizer
- "You decide" = no pressure
- Three ways to respond: book, reply, or call back`,
      },
    ],
  },
  {
    id: "stage-3",
    stage: "03",
    title: "Follow-Up Sequence — No Response",
    color: "#C4841D",
    timing: "Day 2 to Day 14",
    goal: "Re-engage without being pushy",
    sections: [
      {
        label: "The Follow-Up Timeline",
        content: `DAY 1: Call + voicemail + email (done in Stage 02)
DAY 3: Second email (different angle)
DAY 5: Second call attempt (different time of day)
DAY 7: Third email (urgency angle)
DAY 10: Final call + final email
DAY 14: Move to "nurture" — stop active outreach

NEVER: Call more than 3 times. It feels like harassment.
NEVER: Send more than 4 emails. You're not a spammer.
ALWAYS: Space contacts 2-3 days apart minimum.`,
      },
      {
        label: "Day 3 Email — The Single Finding",
        content: `SUBJECT: Quick question about your [TOP FINDING CATEGORY]

Hi [NAME],

I reached out a couple of days ago about your Fruxal scan.

Quick question: when's the last time you compared your [PROCESSING RATES / INSURANCE PREMIUMS / etc.]?

The reason I ask — your scan shows you're paying about [AMOUNT] more than similar businesses in [INDUSTRY]. That's [MONTHLY AMOUNT] a month that doesn't need to leave your account.

If you're curious, I can show you the exact comparison in 5 minutes. No pitch, just the numbers.

[CALENDLY LINK]

[YOUR NAME]

WHY: This email focuses on ONE finding instead of the total. More specific = more believable. The question format creates curiosity.`,
      },
      {
        label: "Day 7 Email — The Cost of Waiting",
        content: `SUBJECT: $[MONTHLY LEAK] — that's what this month cost

Hi [NAME],

Since your scan on [DATE], roughly $[MONTHLY LEAK] has leaked from your business. Not because you're doing anything wrong — just because nobody's looked.

The scan is still here whenever you're ready. I can walk you through it in 15 minutes.

[CALENDLY LINK]

No rush. But the leak doesn't pause.

[YOUR NAME]

WHY: This uses the Scarcity tonal pattern in written form. The dollar amount per month makes the cost of inaction tangible. Short = respectful of their time.`,
      },
      {
        label: "Day 10 — The Breakup Message",
        content: `SUBJECT: Should I close your file?

Hi [NAME],

I've reached out a few times about the $[TOTAL LEAK] your scan found. I don't want to be a pest.

If now isn't the right time, no worries at all. Your results are saved and I'm here whenever you want to look at them.

If you do want to see the breakdown, here's my calendar: [LINK]

Either way — I hope business is going well.

[YOUR NAME]

WHY: The "breakup" email gets the highest response rate of any follow-up. "Should I close your file?" creates a small fear of loss. The respectful tone builds 10 #1 (You). Many people respond to this one who ignored the others.`,
      },
    ],
  },
  {
    id: "stage-4",
    stage: "04",
    title: "The Review Call — Presenting Findings",
    color: "#7C3AED",
    timing: "When they book a call",
    goal: "Walk through findings → get agreement to proceed",
    sections: [
      {
        label: "Pre-Call Preparation (10 minutes before)",
        content: `1. OPEN THEIR CLIENT FILE in your dashboard
2. CLICK "CALL SCRIPT" → AI generates personalized talking points
3. REVIEW TOP 3 FINDINGS — know the dollar amounts cold
4. CHECK THEIR INDUSTRY — have 1-2 industry-specific examples ready
5. CHECK DOCUMENTS TAB — know what you'll need from them
6. HAVE THE FEE MATH READY:
   - Total leak: $[X]
   - At 12%: they keep $[X × 0.88], we earn $[X × 0.12]
   - Monthly cost of doing nothing: $[X ÷ 12]

MINDSET: You are a doctor delivering a diagnosis, not a salesperson pitching a product. You're showing them what's wrong and offering to fix it. That's it.`,
      },
      {
        label: "The Call Structure (15-20 minutes)",
        content: `MINUTE 0-2: RAPPORT + CONTEXT
"[NAME], great to connect. Thanks for making time. [I Care tone] Before I jump in — how's business going? [I Really Want to Know tone]"
→ Let them talk for 30-60 seconds. Listen. You're qualifying AND building rapport.

"Great. So let me show you what we found. Your Financial Health Score came in at [SCORE] out of 100, which puts you in the [BAND] range for [INDUSTRY] businesses in [PROVINCE]. We found [NUMBER] areas totaling about [TOTAL] a year."

MINUTE 2-10: WALK THROUGH TOP 3 FINDINGS
For each finding:
1. Name it: "The biggest one is [TITLE]"
2. Explain in plain language: "What this means is..."
3. Show the math: "Your rate is X. The median is Y. On your volume, that's $Z."
4. Pause: "Does that make sense?" [Get a micro-agreement]

MINUTE 10-12: THE ASK
"So here's how Fruxal works: we handle all the recovery — vendor calls, filings, applications. You do nothing.

Our fee is 12% of confirmed savings. So if we recover [TOTAL], you keep [88%] and we earn [12%]. If we recover nothing, you pay nothing. [Reasonable Man tone] The risk is entirely on us.

Which of those findings stands out to you as the most impactful?"

MINUTE 12-15: HANDLE OBJECTIONS + CLOSE
→ Whatever they say, you now know which 10 is weak. Loop.
→ Close with: "Want me to send the agreement over? Takes 2 minutes to review." [Presupposing tone]`,
      },
      {
        label: "If They Say Yes",
        content: `1. "Great — I'll send the agreement right now. It's straightforward: the scope, the 12% fee, and the cancellation terms."
2. CLICK "Send Agreement" in the client file → auto-generates + emails
3. "While you review that, I'll need a couple of documents to get started: [TOP 2 DOCUMENTS]. You can upload them through your dashboard."
4. "Once signed, I'll start on [TOP FINDING] first — that's the quickest win. You should see a confirmed result within 30-60 days."
5. SET FOLLOW-UP DATE → 24 hours if agreement not signed yet
6. SUBMIT DEBRIEF → Fill in call outcome, agreed findings, next steps`,
      },
      {
        label: "If They Say 'Let Me Think About It'",
        content: `DON'T PANIC. This is the most common response. Use the SLP loop:

STEP 1 — ACKNOWLEDGE:
"Totally fair. I wouldn't want you to rush into anything." [I Care tone]

STEP 2 — IDENTIFY WHICH 10 IS WEAK:
"Can I ask — what specifically is on your mind? Is it the process, the fee, or whether these numbers are real?"

STEP 3 — LOOP BACK:
They say "the fee" → Loop to 10 #3 (The Numbers):
"Got it. So at 12%, on the $43K we found, you'd keep $37,840. Right now that $43K is just leaving. It's not 12% vs 0% — it's $37,840 kept vs $43,000 lost."

They say "the numbers" → Loop to 10 #3 with proof:
"Fair. Let me do this — pick any one finding. I'll show you the exact math. If that one's wrong, forget everything else."

They say "I need to talk to my partner" → Loop to 10 #1 (You):
"Of course. What would THEY need to hear to feel comfortable? I'm happy to do a quick call with both of you."

STEP 4 — LOWER THE THRESHOLD:
"What if I just start with the insurance requote? Zero commitment, zero risk, and you'll see a real result in 2 weeks."

STEP 5 — SET THE FOLLOW-UP:
"When should I check back? Thursday?" → Always get a specific date.`,
      },
    ],
  },
  {
    id: "stage-5",
    stage: "05",
    title: "Agreement Signed — Starting Recovery",
    color: "#1B3A2D",
    timing: "Immediately after signature",
    goal: "Get documents + start first recovery",
    sections: [
      {
        label: "First 24 Hours After Signing",
        content: `1. REQUEST DOCUMENTS → Click "Request Document" in the Documents tab:
   - T2 / Form 1120 (last 2 years)
   - Most recent bank statement
   - Insurance policy declarations
   - Processing statement
   → Client gets an email with upload link

2. UPDATE PIPELINE STAGE → Move to "In Engagement"

3. SEND CONFIRMATION EMAIL:
"[NAME], welcome aboard. I've sent the document requests — once I have those, I'll start on [TOP FINDING] immediately. You should see the first confirmed result within 30-60 days. If you have any questions, I'm a text/call away."

4. ADD NOTE TO FILE: "Agreement signed [DATE]. Starting with [TOP FINDING]. Docs requested."

5. NOTIFY ACCOUNTANT (if assigned): The accountant sees the file automatically.`,
      },
      {
        label: "The First Recovery — Make It Count",
        content: `Your first confirmed recovery sets the tone for the entire relationship.

PICK THE EASIEST WIN FIRST:
- Insurance requote → Almost always saves money, takes 1-2 weeks
- Processing rate negotiation → Quantifiable, fast
- Missed deduction → If you have the T2, accountant can spot it quickly

DO NOT start with the hardest finding. Start with the one most likely to succeed.

WHEN CONFIRMED:
1. Log it in the Savings tab: amount, category, confidence note
2. Client gets an automatic email: "$X recovered — [FINDING NAME]"
3. CALL THEM PERSONALLY:
   "Hey [NAME], quick good news — we confirmed $[AMOUNT] on the insurance requote. That's $[AMOUNT] a year back in your pocket. I'm moving on to [NEXT FINDING] now."

WHY THIS MATTERS:
This call transforms the relationship. You're no longer "the Fruxal guy." You're "the person who just saved me $4,800." Trust on all Three 10s goes to maximum.`,
      },
    ],
  },
  {
    id: "stage-6",
    stage: "06",
    title: "Ongoing Recovery — Keeping Momentum",
    color: "#3D7A5E",
    timing: "Monthly throughout engagement",
    goal: "Maximize total recovery + build referral relationship",
    sections: [
      {
        label: "Monthly Touchpoints",
        content: `EVERY MONTH — DO THESE:

1. CHECK ANOMALY ALERTS → Any new cost spikes from their connected data?
2. LOG CONFIRMED SAVINGS → As each recovery is confirmed
3. UPDATE THE CLIENT (even if brief):
   - "Quick update on your file: [FINDING] is in progress with [VENDOR/CRA]. Should have confirmation by [DATE]."
   - Even "no news" is news: "Still waiting on CRA — normal timeline is 8-12 weeks. You're at week 6."

4. CHECK FOR NEW LEAKS → If they connected QuickBooks/Plaid, the system detects new anomalies automatically

NEVER go silent for more than 2 weeks. Silence = "they forgot about me."`,
      },
      {
        label: "Quarterly Business Review (QBR)",
        content: `EVERY 90 DAYS — Generate a QBR:

1. Click "Generate QBR" in the client file (AI creates the full report)
2. Review it — make sure numbers are accurate
3. Email or present it on a call

THE QBR COVERS:
- Recovery progress (what was found, recovered, in progress)
- Health score trend (improving or declining)
- New issues detected this quarter
- Upcoming priorities for next quarter
- Recommended next steps

WHY: The QBR makes you look like a $5,000/quarter consultant. The client shares it with their partner/board. It creates referral conversations: "My Fruxal rep sends me this every quarter."`,
      },
      {
        label: "The Referral Ask — Timing Is Everything",
        content: `WHEN TO ASK: Only AFTER the first confirmed recovery. Never before.

THE ASK:
"[NAME], now that you've seen how this works — do you know any other business owners who might be losing money the same way you were? I'm happy to run a free scan for anyone you think could benefit."

WHY AFTER FIRST RECOVERY:
- Before recovery: "Trust me, it works" → weak
- After recovery: "You've seen it work" → powerful
- They have proof. They have a story. They become your best salesperson.

DON'T PUSH: If they say "let me think about it," say "No rush at all. If someone comes to mind, just send them fruxal.ca and I'll take care of the rest." Then move on.

REFERRAL INCENTIVE: Not needed. The value of the service IS the incentive. Paying for referrals cheapens the relationship.`,
      },
    ],
  },
];

export default function RepPlaybookPage() {
  const router = useRouter();
  const [activeStage, setActiveStage] = useState("stage-1");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const stage = STAGES.find(s => s.id === activeStage)!;

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
        <h1 className="text-[24px] font-bold text-white mb-2">The Customer Contact Playbook</h1>
        <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
          Every stage of the pipeline — exactly what to do, when to do it, and what to say. Follow this system and you close.
        </p>

        {/* Stage timeline */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {STAGES.map((s, i) => (
            <button key={s.id} onClick={() => { setActiveStage(s.id); setExpandedItem(null); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-semibold transition-all shrink-0"
              style={{
                background: activeStage === s.id ? s.color + "22" : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeStage === s.id ? s.color + "66" : "rgba(255,255,255,0.08)"}`,
                color: activeStage === s.id ? s.color : "rgba(255,255,255,0.35)",
              }}>
              <span className="text-[10px] font-black opacity-50">{s.stage}</span>
              {s.title.split(" — ")[0]}
            </button>
          ))}
        </div>

        {/* Stage header */}
        <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[32px] font-black" style={{ color: stage.color }}>{stage.stage}</span>
            <div>
              <h2 className="text-[18px] font-bold text-white">{stage.title}</h2>
              <div className="flex gap-4 mt-1">
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Timing: <span className="text-white font-semibold">{stage.timing}</span>
                </span>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Goal: <span style={{ color: stage.color }} className="font-semibold">{stage.goal}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {stage.sections.map((item, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black w-6 text-center" style={{ color: stage.color }}>{i + 1}</span>
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

        {/* Next stage navigation */}
        <div className="flex gap-3 mt-8">
          {STAGES.findIndex(s => s.id === activeStage) > 0 && (
            <button onClick={() => { const idx = STAGES.findIndex(s => s.id === activeStage); setActiveStage(STAGES[idx - 1].id); setExpandedItem(null); window.scrollTo(0, 0); }}
              className="flex-1 py-3 rounded-xl text-[13px] font-bold transition"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              ← Previous Stage
            </button>
          )}
          {STAGES.findIndex(s => s.id === activeStage) < STAGES.length - 1 && (
            <button onClick={() => { const idx = STAGES.findIndex(s => s.id === activeStage); setActiveStage(STAGES[idx + 1].id); setExpandedItem(null); window.scrollTo(0, 0); }}
              className="flex-1 py-3 rounded-xl text-[13px] font-bold transition"
              style={{ background: STAGES[STAGES.findIndex(s => s.id === activeStage) + 1].color + "22", color: STAGES[STAGES.findIndex(s => s.id === activeStage) + 1].color, border: `1px solid ${STAGES[STAGES.findIndex(s => s.id === activeStage) + 1].color}44` }}>
              Next: {STAGES[STAGES.findIndex(s => s.id === activeStage) + 1].title.split(" — ")[0]} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
