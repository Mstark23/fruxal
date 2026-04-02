"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// =============================================================================
// REP TRAINING — Straight Line Persuasion System for Fruxal
// =============================================================================
// Based on Jordan Belfort's Straight Line Persuasion methodology.
// Adapted for Fruxal's recovery model: contingency, no upfront cost, 12% fee.
// =============================================================================

const SECTIONS = [
  {
    id: "straight-line",
    title: "The Straight Line System",
    items: [
      {
        label: "The Straight Line — Core Concept",
        content: `Every sale is a straight line. Open at one end, closed at the other.

YOUR JOB: Keep the conversation on the line — moving toward the close.

The prospect will try to take you OFF the line — tangents, stalls, objections, stories. Your job is to answer them and redirect BACK to the line.

Between the line's boundaries, you do two things simultaneously:
1. Build massive rapport (through tonality and body language)
2. Gather intelligence (through qualifying questions)

The line ends at "The Promised Land" — the close. But you can only get there when the prospect hits a 10 on all Three Tenets.`,
      },
      {
        label: "The Three 10s — What You MUST Transfer",
        content: `Every prospect is rating you 1-10 on three things. You MUST get all three to a 10 (or close) before they'll buy.

THE THREE 10s:

1. CERTAINTY ABOUT YOU (The Rep)
   "Do I trust this person? Are they sharp? Do they care about me?"
   → You build this in the first 4 seconds: enthusiastic, sharp as a tack, force to be reckoned with
   → Then deepen it with genuine interest and expertise

2. CERTAINTY ABOUT FRUXAL (The Company)
   "Is this company legit? Will they actually deliver?"
   → Contingency model is your weapon: "We don't get paid unless YOU get paid"
   → Zero upfront cost removes all risk from the prospect

3. CERTAINTY ABOUT THE NUMBERS (The Product)
   "Are these leak amounts real? Can they actually recover this money?"
   → Walk through ONE finding with exact math
   → Show the calculation, not just the conclusion
   → "Your processing rate is 2.8%. Industry median is 2.2%. On your volume, that's $2,400/yr. That's math, not an estimate."

WHEN ALL THREE ARE AT 10: The prospect's Action Threshold is met and they close themselves.

KEY INSIGHT: When a prospect objects, they're telling you which of the Three 10s is below threshold. Your job is to identify WHICH one and loop back to raise it.`,
      },
      {
        label: "The Action Threshold — Why People Don't Buy",
        content: `Every person has an ACTION THRESHOLD — the level of certainty they need before they'll say yes.

LOW threshold = Easy close (impulsive, trusting, pain is high)
HIGH threshold = Hard close (analytical, skeptical, burned before)

YOUR JOB IS NOT TO OVERCOME THE THRESHOLD.
YOUR JOB IS TO LOWER IT.

How to lower the Action Threshold:
1. Remove risk → "You pay nothing unless we recover money"
2. Make it easy → "One 15-minute call. We do all the work."
3. Create urgency → "Every month you wait costs $3,600"
4. Offer a small first step → "Let me start with just the insurance requote"
5. Use social proof → "We've recovered $X for businesses like yours"

FRUXAL'S ADVANTAGE: Our contingency model is the ultimate threshold-lowerer. The prospect literally cannot lose money. This is your most powerful tool.`,
      },
      {
        label: "Looping — The Art of Going Backward",
        content: `When a prospect objects, NEVER answer and move forward. Instead: LOOP BACKWARD.

THE LOOP:
1. Acknowledge the objection (don't fight it)
2. Deflect with empathy ("I totally understand that")
3. Loop BACK to one of the Three 10s that needs strengthening
4. Build more certainty on that 10
5. Ask for the close again

EXAMPLE — Prospect says "I need to think about it":
1. "I totally hear you, and I wouldn't want you to rush into anything." (Acknowledge)
2. "Can I ask — what specifically is on your mind?" (Identify which 10 is weak)
3. They say: "I'm not sure the numbers are real" (It's 10 #3 — The Numbers)
4. Loop back: "Totally fair. Let me show you one finding in detail..." (Rebuild certainty on #3)
5. "...so does it make sense to at least start with that one?" (Close again)

NEVER LOOP MORE THAN 3 TIMES on the same objection. After 3 loops, the prospect is genuinely not ready — schedule a follow-up and move on.

REMEMBER: Every objection is just the prospect telling you which 10 needs work.`,
      },
    ],
  },
  {
    id: "first-4-seconds",
    title: "The First 4 Seconds",
    items: [
      {
        label: "The 4-Second Rule — First Impression",
        content: `In the first 4 seconds of every call, the prospect decides three things about you:

1. Are you ENTHUSIASTIC? (Do you believe in what you're selling?)
2. Are you SHARP AS A TACK? (Are you competent and professional?)
3. Are you A FORCE TO BE RECKONED WITH? (Are you worth my time?)

If you fail ANY of these in the first 4 seconds, you're fighting uphill for the rest of the call.

FOR FRUXAL REPS — Your opening:

"Hi [NAME], this is [YOUR NAME] from Fruxal? [Up-tone — declarative as question] I'm calling because your business scan flagged some things worth looking at? [Reasonable man tone] Got a minute?" [Casual, no big deal]

WHY THIS WORKS:
- "Fruxal?" with up-tone → triggers memory search, micro-agreement
- "flagged some things" → creates curiosity without overselling
- "Got a minute?" → Reasonable Man tone, implies it's no big deal
- The whole thing takes 4 seconds and establishes all three qualities`,
      },
      {
        label: "8 Tonal Patterns You Must Master",
        content: `Tonality is the most important thing you can learn. The same words with different tonality create completely different outcomes.

1. SCARCITY
   Lower your voice to create urgency. Like sharing a secret.
   USE: "Between you and me, the insurance one alone is usually worth $3-5K..."

2. REASONABLE MAN
   Imply it's no big deal. Casual, light.
   USE: "Got a minute?" "Does that sound fair enough?" "Sound good?"

3. ABSOLUTE CERTAINTY
   Hard, definitive. You are 100% sure.
   USE: "I can tell you right now, your processing rate is above market."

4. "I CARE" PATTERN
   Empathy and sympathy. Match their emotion first.
   USE: "I totally understand that." "That makes complete sense."

5. QUESTION AS DECLARATIVE
   Raise tone at end of a statement — infers agreement.
   USE: "Hi, this is [NAME] from Fruxal?" → Triggers micro-agreement

6. PRESUPPOSING
   Future-pace past the obvious. Not even a question.
   USE: "When we recover the insurance savings..." (not "if")

7. "I REALLY WANT TO KNOW"
   Full engagement. Show genuine interest.
   USE: "What's the biggest frustration in your business right now?"

8. SERIES OF UP-TONES
   String micro-agreements together.
   USE: "This is [NAME]? From Fruxal? We ran your business scan?" → Three micro-agreements in a row`,
      },
    ],
  },
  {
    id: "qualifying",
    title: "Qualifying & Intelligence",
    items: [
      {
        label: "The Art of Qualifying — Ask the Right Questions",
        content: `Before you can sell, you need to QUALIFY. You need intelligence.

3 RULES OF QUALIFYING:

1. IDENTIFY THE "WHY"
   Every prospect has a logical and emotional reason behind their decisions.
   Logical: "I want to save money"
   Emotional: "I'm tired of feeling like I'm being taken advantage of"
   → The EMOTIONAL why is 10x more powerful. Find it.

2. MEMORIZE YOUR QUESTIONS IN ORDER
   General → Specific. Don't jump to the close.
   For Fruxal reps:
   - "How long have you been running this business?"
   - "What's your biggest cost headache right now?"
   - "When's the last time you requoted your insurance?"
   - "Do you know your exact processing rate?"
   - "Has anyone ever reviewed your corporate structure for tax efficiency?"

3. ASK PERMISSION TO ASK QUESTIONS
   "Just a couple of quick questions so I don't waste your time."
   "Let me ask you two things so I can tell you exactly what we found."
   → This positions you as professional and respectful of their time.

THE PAYOFF: By the time you present findings, you already know their pain points. You don't guess — you connect your findings to THEIR specific frustrations.`,
      },
      {
        label: "Gathering Intelligence — What to Listen For",
        content: `While qualifying, listen for buying signals and pain signals:

PAIN SIGNALS (means they need you):
- "My accountant is expensive and I'm not sure what I'm getting"
- "I know we're overpaying on some things but I don't have time to look"
- "Revenue is good but I never seem to have cash"
- "I haven't reviewed our insurance/contracts in years"

BUYING SIGNALS (means they're ready to move):
- "How does the process work?"
- "What would you need from me?"
- "How long does the recovery take?"
- "What have you found for similar businesses?"

WHEN YOU HEAR THESE: Don't stop and celebrate. Keep moving down the straight line. These signals mean you're on track — don't get derailed by explaining the whole process too early.

RED FLAGS (means they're not closeable today):
- "I need to check with my partner/spouse" → Loop: "What would THEY need to hear?"
- "I don't believe in these things" → Hard loop on #3 (The Numbers)
- "Can you call me next month?" → Loop: "What changes next month?"`,
      },
    ],
  },
  {
    id: "fruxal-pitch",
    title: "The Fruxal Pitch",
    items: [
      {
        label: "The 10-Second Pitch",
        content: `MEMORIZE THIS:

"We find money your business is losing and recover it for you. You pay nothing unless we actually get money back."

That's it. 10 seconds. If they're interested, they'll ask questions — and now YOU'RE on the straight line.

NEVER SAY in the first 10 seconds:
- "AI" or "artificial intelligence"
- "Diagnostic" or "algorithm"
- "Contingency model"
- "12%"
- Anything technical

WHY: The first 10 seconds are about THEM, not about you. "We find money you're losing" is about THEM. "Our AI-powered diagnostic engine" is about YOU.`,
      },
      {
        label: "The 30-Second Pitch (Use This Most)",
        content: `"Most businesses are overpaying somewhere — processing fees, insurance premiums, missed tax credits. The problem is, nobody's looking. Your accountant does compliance. Your bank doesn't care. And you're too busy running the business.

That's where we come in. We run a scan, find where the money's going, and handle the recovery. You pay nothing upfront. We earn 12% of what we actually recover."

KEY TONALITY:
- "Most businesses" → Presupposing (matter of fact)
- "nobody's looking" → I Care (you're not alone)
- "Your accountant does compliance" → Absolute Certainty
- "You pay nothing upfront" → Scarcity (lean in, like a secret)
- "12% of what we actually recover" → Reasonable Man (no big deal)`,
      },
      {
        label: "The Fee — How to Make 12% Sound Like Nothing",
        content: `THE REFRAME (memorize this):

"It's not 12% vs 0%. It's keeping 88% vs losing 100%."

THE MATH (have these ready):
- $10K recovered → You keep $8,800, we earn $1,200
- $25K recovered → You keep $22,000, we earn $3,000
- $50K recovered → You keep $44,000, we earn $6,000
- $0 recovered → You pay $0

THE MONEY-ON-THE-GROUND ANALOGY:
"If there was $22,000 sitting on the ground outside your office, but it cost $3,000 to pick it up... would you leave it there?"

THE RISK REVERSAL:
"We take all the risk. If we find nothing, we earn nothing. Name another service that works like that."

WORDS TO USE: "fee" "recovery fee" "we earn"
WORDS TO NEVER USE: "commission" "charge" "cost" "price"`,
      },
      {
        label: "Fruxal vs Accountant — The Differentiation",
        content: `NEVER ATTACK THEIR ACCOUNTANT. EVER.

Instead, differentiate SCOPE:

ACCOUNTANT = COMPLIANCE (backward-looking)
- Files taxes correctly
- Keeps books clean
- Makes sure you follow rules

FRUXAL = OPTIMIZATION (forward-looking)
- Finds money you didn't know you were losing
- Renegotiates vendor contracts
- Applies for grants and programs
- Restructures for tax efficiency

THE LINE:
"Your accountant makes sure your taxes are right. We make sure your business keeps the most money."

WHEN THEY PUSH HARDER:
"We actually work WITH your accountant. We identify what was missed, they execute the filings. Different skill set, same team."

THE KILLER QUESTION:
"Did your accountant flag your processing rate? Requote your insurance? Check if you qualify for the Canada Job Grant?"
(The answer is always no — accountants don't do these things.)`,
      },
    ],
  },
  {
    id: "objections",
    title: "Objection Handling (Warm/Resistant/Hostile)",
    items: [
      {
        label: "\"I need to think about it\"",
        content: `This is NEVER the real objection. It's a stall. Loop to find the real one.

WARM:
"Totally fair. While you think it over — what specifically is on your mind? Is it the process, the fee, or whether the numbers are real? Because if it's any of those, I can answer it right now." [I Care tone → then loop to whichever 10 is weak]

RESISTANT:
"I respect that. Here's what I know though — that $43K? It's leaking right now. Every month you think about it costs roughly $3,600. What if I just start with the insurance requote? It's the easiest one, zero risk, and you'll see a real result in 2 weeks." [Scarcity tone → lower action threshold with small first step]

HOSTILE:
"Look — you don't know me, you don't know Fruxal, and these numbers seem too good. I get it. I'm not asking you to trust me. I'm asking you to let me prove ONE thing. The insurance finding. If I'm wrong, block my number. But if I'm right... the other five findings are worth a conversation." [Absolute Certainty tone → challenge to prove, not to trust]`,
      },
      {
        label: "\"12% is too much\"",
        content: `They're objecting to 10 #3 (The Numbers). Loop back with the reframe.

WARM:
"I hear you — 12% is a number. Here's how I think about it with YOUR numbers: we found $25K. At 12%, you keep $22,000 that right now is just... gone. Without us, that $25K stays lost. So it's really $22K kept vs $0 kept." [Reasonable Man tone]

RESISTANT:
"Fair. Let me ask you this — if there was $22,000 on the ground outside your office, but it cost $3,000 to pick it up... would you leave it there? That's exactly what this is. And here's the thing — if I CAN'T find the $25K, you pay me zero." [Presupposing tone → future pacing the recovery]

HOSTILE:
"Tell me what you think is fair. Because right now you're paying 100% of that $25K to nobody. I'm offering to get $22K of it back. At 5% I'd have to charge upfront because I can't sustain my business. At 12% contingency, I take all the risk. Name. Another. Service. That. Works. Like. That." [Series of absolute certainty punches]`,
      },
      {
        label: "\"My accountant already handles this\"",
        content: `They're at a low 10 on #2 (Fruxal) — they don't see why we exist.

WARM:
"That's great — and honestly we love working with accountants. Here's the difference: they handle compliance. We handle optimization. For example, we found $4,800 in processing savings and $8,200 in insurance overpayment — those aren't accounting tasks." [I Care tone → specific examples]

RESISTANT:
"With genuine respect — did your accountant flag your processing rate? Requote your insurance? Check the Canada Job Grant? Those aren't their job. We actually send our tax findings TO your accountant so they can file the amendments. Different skill set, same team." [Sharp as a tack tone → specific questions they can't say yes to]

HOSTILE:
"Then why did we find $43K they didn't? I'm not attacking them — they do their job, which is filing taxes correctly. Our job is finding money. If your accountant already found this $43K, I wouldn't be calling." [Absolute Certainty → the math speaks for itself]`,
      },
      {
        label: "\"These numbers seem too high / don't believe it\"",
        content: `This is 10 #3 (The Numbers) at rock bottom. You need PROOF, not persuasion.

WARM:
"Good question — let me show you one example. Your card processing rate is 2.8%. The industry median for your volume is 2.2%. On $350K in card sales, that's $2,100/year. That's not an estimate — that's math. Every finding has the same kind of breakdown." [Absolute Certainty tone → show the calculation]

RESISTANT:
"I'd be skeptical too. So forget the total — pick ANY finding. The processing one. I can verify your rate in 30 seconds with your statement. If that one number is wrong, forget everything else. But if it's right..." [Reasonable Man → challenge them to disprove one]

HOSTILE:
"Pick any finding. Any one. I'll show you the exact math with your exact numbers. If I'm wrong on that ONE thing — hang up, block me, never hear from me again. But if I'm right about that one... then the other five are worth 15 minutes of your time." [Scarcity + Absolute Certainty → bet everything on one finding]`,
      },
      {
        label: "\"I don't have time for this\"",
        content: `This is really 10 #1 (You) — they don't think you're worth their time.

WARM:
"Totally get it — you're running a business. Good news: you do nothing. I handle everything. The only thing I need is one 15-minute call where I walk through what we found. After that, you go back to work." [I Care → Reasonable Man tone]

RESISTANT:
"That's exactly why this exists. You don't have time to requote insurance, renegotiate your processor, check grant eligibility — nobody does. I do ALL of that. One call, 15 minutes. Then I disappear and do the work. You hear from me when money hits your account." [Presupposing tone → it's already happening]

HOSTILE:
"You don't have time — and that's exactly why you're losing $43K a year. Nobody has time to audit their own vendors. That's my entire job. I need 15 minutes of your time, one time. If 15 minutes isn't worth $43K, I respect that — but it's worth asking yourself why." [Absolute Certainty → direct challenge]`,
      },
      {
        label: "\"Send me an email / I'll look at it later\"",
        content: `This is a classic deflection — they're taking you OFF the straight line.

WARM:
"Absolutely — I'll send it right now. Quick thing before I do: was it the processing finding or the tax one that caught your eye? I'll make sure to highlight that one." [Reasonable Man → redirect to a specific finding]

RESISTANT:
"I can do that. But honestly? We both know what happens to emails. You've got $43K leaking right now. What if I just pull up the top finding — takes 60 seconds — and you tell me if it's worth a proper call?" [I Really Want to Know tone → lower the ask]

HOSTILE:
"I could email you. But here's what happens: it goes in a folder, and you lose another $3,600 this month. I'm not selling anything — I'm trying to show you one number. Sixty seconds. If it's not worth your time, I'm gone forever." [Scarcity → absolute certainty → time pressure]`,
      },
    ],
  },
  {
    id: "power-language",
    title: "Power Language & Closing",
    items: [
      {
        label: "Power Words — Minimizers, Justifiers, Reframers",
        content: `These small words have massive persuasive power:

MINIMIZERS (make things seem smaller):
- "just" → "Just a couple of quick questions"
- "only" → "It only takes 15 minutes"
- "simply" → "You simply sign the agreement"
- USE: When describing what the prospect needs to DO

JUSTIFIERS (give reason without being pushy):
- "so that" → "I'll send the agreement so that we can get started"
- "because" → "I'm calling because your scan flagged something"
- "the reason" → "The reason I ask is..."
- USE: When asking for something or explaining why

REFRAMERS (change the frame of reference):
- "It's not X, it's Y" → "It's not a cost, it's a recovery"
- "The question isn't... it's..." → "The question isn't whether to pay 12%, it's whether to keep losing $25K"
- "Think of it this way" → "Think of it this way: you're already paying 100% to nobody"
- USE: When handling fee objections or skepticism

PRESUPPOSING LANGUAGE (assumes the sale):
- "When we start..." not "If you decide..."
- "Once we recover..." not "If we find anything..."
- "Your rep will handle..." not "Someone might look at..."
- USE: After the first successful loop, switch to presupposing language`,
      },
      {
        label: "Closing — The Ask",
        content: `Never ask "Would you like to proceed?" That's weak.

STRONG CLOSES FOR FRUXAL:

THE EASY START:
"Here's what I suggest — let me start with just the [EASIEST FINDING]. Zero risk, and you'll see a real result in 2-3 weeks. If it works, we tackle the rest. Sound fair enough?" [Reasonable Man tone]

THE ASSUMPTIVE CLOSE:
"Great — I'll send the agreement over now. It takes about 2 minutes to review and sign. Once that's done, I'll start on the [TOP FINDING] first since that's the highest value. Any questions before I send it?" [Presupposing tone — it's already happening]

THE CONTINGENCY CLOSE:
"You pay nothing. We take all the risk. If we recover nothing, you owe us zero. The only way you lose is by not letting us look. Does it make sense to at least start?" [Scarcity + Absolute Certainty]

THE TIMELINE CLOSE:
"Every month we wait costs you roughly $[MONTHLY LEAK]. If I start today, your first confirmed recovery is usually within 30-60 days. Want me to get the ball rolling?" [Urgency without pressure]

AFTER THE CLOSE — SHUT UP:
Ask for the close and then BE SILENT. The next person who speaks loses. Let them process. Don't fill the silence with more selling.`,
      },
      {
        label: "Customers for Life — After the Close",
        content: `The sale is just the beginning. Customers for life are built AFTER the close.

FROM THE SLP SYSTEM:
- It's much easier to sell to someone who already bought from you
- Customers for life refer others who benefit from your service
- NEVER use this system to manipulate — only sell to people who SHOULD buy

FOR FRUXAL REPS:
1. First recovery confirmation → Call them personally, celebrate the win
2. Monthly updates → Even if brief: "Here's where we are on your file"
3. Quarterly QBR → Show the numbers: recovered, in progress, new findings
4. Referral ask → ONLY after first confirmed recovery: "Know anyone else losing money like you were?"

REMEMBER: Not everyone is closeable. Treat non-buyers with courtesy. The small thing that tips the scale might happen weeks later — and they'll remember how you treated them.`,
      },
    ],
  },
];

export default function RepTrainingLearnPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("straight-line");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const section = SECTIONS.find(s => s.id === activeSection)!;

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
            <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#2D7A50" }}>
              Straight Line Training
            </span>
          </div>
          <button onClick={() => router.push("/rep/training")}
            className="px-4 py-2 text-[12px] font-bold rounded-lg transition"
            style={{ background: "rgba(45,122,80,0.15)", color: "#2D7A50", border: "1px solid rgba(45,122,80,0.3)" }}>
            Practice Drill →
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-8">
        <h1 className="text-[24px] font-bold text-white mb-2">Straight Line Persuasion for Fruxal</h1>
        <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
          Master the system. Know these cold. Then drill until you score 8+ every time.
        </p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => { setActiveSection(s.id); setExpandedItem(null); }}
              className="px-4 py-2 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: activeSection === s.id ? "rgba(45,122,80,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeSection === s.id ? "rgba(45,122,80,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: activeSection === s.id ? "#2D7A50" : "rgba(255,255,255,0.4)",
              }}>
              {s.title}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {section.items.map((item, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition">
                <span className="text-[14px] font-semibold text-white">{item.label}</span>
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

        <div className="mt-10 text-center">
          <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            Study until you can recite the Three 10s, the 8 tonal patterns, and the fee reframe without thinking.
          </p>
          <button onClick={() => router.push("/rep/training")}
            className="px-8 py-3.5 rounded-xl text-[14px] font-bold transition-all"
            style={{ background: "linear-gradient(135deg, #1B3A2D, #2D7A50)", color: "white" }}>
            Start Drilling →
          </button>
        </div>
      </div>
    </div>
  );
}
