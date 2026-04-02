"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// =============================================================================
// REP TRAINING — Learn the Business Before You Drill
// =============================================================================
// This is the foundation. Reps study this BEFORE touching the drill tool.
// Covers: what Fruxal does, how to explain it in 10 seconds, 30 seconds,
// 2 minutes, and every objection with warm/resistant/hostile responses.
// =============================================================================

const SECTIONS = [
  {
    id: "elevator",
    title: "How to Explain Fruxal",
    items: [
      {
        label: "The 10-Second Pitch",
        content: `"We find money your business is losing without knowing it — overpaying on processing, insurance, taxes — and we recover it for you. You don't pay anything unless we actually get money back."

That's it. Don't say "AI", don't say "diagnostic", don't say "contingency model". Say: we find money, we recover it, you pay nothing unless it works.`,
      },
      {
        label: "The 30-Second Pitch",
        content: `"Most businesses are overpaying somewhere — processing fees, insurance premiums, missed tax credits, vendor contracts that haven't been renegotiated in years. The problem is, nobody looks. Your accountant does compliance. Your bank doesn't care. And you're too busy running the business.

That's where we come in. We run a financial scan, find exactly where the money is going, and handle all the recovery work — vendor calls, CRA filings, grant applications. You pay nothing upfront. Our fee is 12% of what we actually recover. If we find nothing, you owe us zero."`,
      },
      {
        label: "The 2-Minute Full Explanation",
        content: `"Here's the problem we solve: the average Canadian small business is losing $8,000 to $15,000 a year to things they don't even know about. Not fraud — just inefficiency. Your payment processor charges 2.9% when the industry average is 2.3%. Your insurance hasn't been requoted in 3 years. There's a government grant you qualify for that nobody applied for. Your corporate structure isn't tax-optimized.

These aren't obvious things. Your accountant is focused on filing your taxes correctly — that's their job. We focus on a different question: is your business set up to keep the maximum amount of money?

Here's how it works: We start with a quick scan — takes about 3 minutes, just a few questions about your business. The scan compares your setup against industry benchmarks and flags where you're overpaying.

Then I review the results with you on a 15-minute call. I'll show you exactly what we found, in plain language, with dollar amounts.

If you want to move forward, we handle everything — vendor renegotiations, government applications, CRA correspondence, insurance requoting. You do nothing except run your business.

Our fee: 12% of confirmed savings. If we recover $10,000 for you, you keep $8,800 and we earn $1,200. If we recover nothing, you pay nothing. The risk is entirely on us."`,
      },
    ],
  },
  {
    id: "know",
    title: "What You Must Know Cold",
    items: [
      {
        label: "The 5 Things Fruxal Finds",
        content: `1. PROCESSING FEES — Most businesses pay 2.5-2.9% on card transactions. Industry best is 1.5-2.0%. On $300K in card volume, that's $1,500-$2,700/year.

2. INSURANCE OVERPAYMENT — If you haven't requoted in 2+ years, you're overpaying 15-25%. We get competitive quotes without you lifting a finger.

3. TAX OPTIMIZATION — Missed deductions, wrong corporate structure, unclaimed CCA/depreciation, SR&ED credits nobody filed for. This is usually the biggest one.

4. GOVERNMENT PROGRAMS — CDAP, Canada Job Grant, NRC IRAP, provincial credits. Most businesses qualify for 2-3 programs they've never applied to.

5. VENDOR CONTRACTS — Telecom, SaaS subscriptions, rent at renewal. Anything that hasn't been renegotiated in 2+ years is probably overpriced.`,
      },
      {
        label: "The Fee Model — How to Explain It",
        content: `WHAT TO SAY:
"Our fee is 12% of confirmed savings. Confirmed means the money is real — it's either in your account, deducted from a bill, or approved by CRA. We don't charge on estimates."

THE MATH (memorize this):
- We find $10,000 → You keep $8,800, we earn $1,200
- We find $25,000 → You keep $22,000, we earn $3,000
- We find $50,000 → You keep $44,000, we earn $6,000
- We find $0 → You pay $0

KEY PHRASES:
- "You pay nothing until money is confirmed in your account"
- "The risk is entirely on us, not you"
- "It's not 12% vs 0% — it's keeping 88% vs losing 100%"
- "If we can't find anything, you owe us nothing"

NEVER SAY:
- "Commission" (say "fee" or "recovery fee")
- "Upfront" anything
- "Contract" (say "agreement")
- "We charge" (say "our fee is" or "we earn")`,
      },
      {
        label: "What We Do vs What an Accountant Does",
        content: `ACCOUNTANT = Compliance (backward-looking)
- Files your taxes correctly
- Keeps your books
- Makes sure you're not breaking rules
- Works with what you give them

FRUXAL = Optimization (forward-looking)
- Finds money you didn't know you were losing
- Renegotiates your vendor contracts
- Applies for grants and programs
- Restructures to minimize tax
- Compares your costs to industry benchmarks

KEY LINE: "Your accountant makes sure your taxes are right. We make sure your business is set up to keep the most money."

WE WORK WITH THEIR ACCOUNTANT, NOT AGAINST:
- "We actually send our findings to your accountant — they execute the tax filings, we identify what was missed"
- "Think of us as the detection layer, your accountant is the execution layer"`,
      },
      {
        label: "The Recovery Process — Step by Step",
        content: `1. SCAN (3 min) — Customer answers questions online. We compare to benchmarks.
2. CALL (15 min) — You walk through findings with them. Plain language, real numbers.
3. AGREEMENT — They sign. No upfront cost. 12% contingency only.
4. WE WORK — You + our accountant handle all recovery:
   - Call vendors to renegotiate
   - File amended tax returns
   - Apply for government programs
   - Requote insurance
5. CONFIRMED — Money lands in their account. They pay our fee.
6. ONGOING — Monthly monitoring catches new leaks as they appear.

TIMELINE: First confirmed recovery usually within 30-60 days.
CUSTOMER EFFORT: One 15-minute call. That's it.`,
      },
    ],
  },
  {
    id: "objections",
    title: "Every Objection — Warm / Resistant / Hostile",
    items: [
      {
        label: "\"I need to think about it\"",
        content: `WARM PROSPECT:
"Totally understandable. While you're thinking about it — what specifically is on your mind? I want to make sure I've answered everything."

RESISTANT PROSPECT:
"I respect that. Can I ask you one thing though? The $43K we found — that's leaking right now, today. Every month you wait is roughly $3,600 that just... disappears. What if I start with just the insurance requote? It's the easiest one and there's literally zero risk."

HOSTILE PROSPECT:
"Look, I get it. You don't know me, you don't know Fruxal, and $43K sounds like a big number. I'm not asking you to believe me — I'm asking you to let me prove it. One finding. The insurance one. If I can't save you money on that, I'll never call you again. What do you have to lose?"`,
      },
      {
        label: "\"12% is too much\"",
        content: `WARM PROSPECT:
"I hear you. Here's how I think about it: we found $25K. At 12%, you keep $22,000 that's currently walking out the door. Without us, that $25K stays lost. So it's really $22K kept vs $0 kept."

RESISTANT PROSPECT:
"Fair concern. Let me ask you this — if I told you there was $22,000 sitting on the ground outside your office, but it costs $3,000 to pick it up... would you leave it there? That's exactly what this is. And if I can't find the $25K, you pay me nothing."

HOSTILE PROSPECT:
"Tell me what you think is fair. Because right now you're losing $25K a year — you're paying 100% to nobody. I'm offering to recover $22K of that. If my fee was 5%, I'd need to charge you upfront because I can't sustain the business. At 12% contingency, I take all the risk and you get a free look. Name another service that works like that."`,
      },
      {
        label: "\"My accountant already does this\"",
        content: `WARM PROSPECT:
"Great — I actually love working with accountants. Here's the thing: your accountant focuses on compliance. We focus on optimization. For example, we found $4,800 in processing fee savings and $8,200 in insurance overpayment — those aren't things accountants typically review."

RESISTANT PROSPECT:
"With respect — and I mean this genuinely — your accountant is great at what they do. But did they flag your processing rate? Did they requote your insurance? Did they check if you qualify for the Canada Job Grant? Those aren't accounting tasks. That's what we do. And we actually send them our tax findings so they can file the amendments."

HOSTILE PROSPECT:
"Then why did our scan find $43K your accountant missed? I'm not saying they're bad — they're doing their job, which is filing your taxes. Our job is finding money. Different skill set. If your accountant had already found this $43K, I wouldn't be calling you."`,
      },
      {
        label: "\"These numbers seem too high / I don't believe it\"",
        content: `WARM PROSPECT:
"Good question. Let me show you one example in detail: your card processing rate is 2.8%. The industry median for your volume is 2.2%. On your $350K in card sales, that's $2,100 per year. That's not an estimate — that's math. Every finding has the same kind of breakdown."

RESISTANT PROSPECT:
"I'd be skeptical too if someone called me with a big number. So forget the total — let's look at one finding. Your processing. You're on Square at 2.9%. Businesses your size negotiate 2.1-2.3%. That alone is $2,400/year. Want me to walk through the insurance one too? Each one stands on its own."

HOSTILE PROSPECT:
"Fine — don't believe the total. Pick any one finding and I'll show you the exact math. The processing rate — I can verify that in 30 seconds with your statement. If I'm wrong on that one, hang up and block my number. But if I'm right... then maybe the other five findings are worth looking at too."`,
      },
      {
        label: "\"I don't have time for this\"",
        content: `WARM PROSPECT:
"Totally get it. The good news — you don't do anything. I handle everything. The only thing I need from you is one 15-minute call where I walk through the findings. After that, you go back to running your business."

RESISTANT PROSPECT:
"That's exactly why this exists. You don't have time to requote insurance, renegotiate your processor, check if you qualify for grants — nobody does. I do all of that. One call, 15 minutes. Then I disappear and do the work. You hear from me when money hits your account."

HOSTILE PROSPECT:
"You don't have time — and that's exactly why you're losing $43K a year. Nobody has time to audit their own vendors. That's my job. I need 15 minutes of your time, one time. After that you literally do nothing. If 15 minutes isn't worth $43K to you, then I respect that."`,
      },
      {
        label: "\"Send me an email / I'll look at it later\"",
        content: `WARM PROSPECT:
"Absolutely, I'll send the report right now. Quick question before I do — is it the processing finding or the tax one that caught your eye? I'll highlight that one so it's easy to find."

RESISTANT PROSPECT:
"I can do that. But honestly? Emails get buried. You've got a $43K leak happening right now. What if instead of an email, I just pull up the top finding right now — takes 60 seconds — and you tell me if it's worth a proper call?"

HOSTILE PROSPECT:
"I could send you an email, but we both know what happens to emails. It goes in a folder and you lose another $3,600 this month. I'm not trying to sell you anything — I'm trying to show you one number. Sixty seconds. If it's not interesting, I'm gone."`,
      },
      {
        label: "\"How are you different from every other consultant?\"",
        content: `WARM PROSPECT:
"Two things make us different: we work on contingency — you pay nothing unless we actually recover money. And we don't give you a report and say 'good luck' — we do the recovery work ourselves."

RESISTANT PROSPECT:
"Most consultants charge you $5K-$10K upfront for a report full of recommendations you'll never implement. We charge zero upfront. We don't give you recommendations — we do the work. If we recover nothing, you pay nothing. Show me another consultant who takes that deal."

HOSTILE PROSPECT:
"Every consultant charges upfront. We don't. Every consultant gives you a PDF and walks away. We renegotiate your vendors, file your tax amendments, and apply for your grants. You pay 12% of money that's already in your account. If I can't deliver, I earn zero. That's how we're different."`,
      },
    ],
  },
];

export default function RepTrainingLearnPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("elevator");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const section = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className="min-h-screen" style={{ background: "#0F1A14", fontFamily: "system-ui, -apple-system, sans-serif" }}>
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
              Learn First
            </span>
          </div>
          <button onClick={() => router.push("/rep/training")}
            className="px-4 py-2 text-[12px] font-bold rounded-lg transition"
            style={{ background: "rgba(45,122,80,0.15)", color: "#2D7A50", border: "1px solid rgba(45,122,80,0.3)" }}>
            Go to Drill →
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-8">
        <h1 className="text-[24px] font-bold text-white mb-2">Learn the Business</h1>
        <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
          Study this before you drill. Know these answers cold and you'll score 8+ every time.
        </p>

        {/* Section tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => { setActiveSection(s.id); setExpandedItem(null); }}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all"
              style={{
                background: activeSection === s.id ? "rgba(45,122,80,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeSection === s.id ? "rgba(45,122,80,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: activeSection === s.id ? "#2D7A50" : "rgba(255,255,255,0.4)",
              }}>
              {s.title}
            </button>
          ))}
        </div>

        {/* Items */}
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

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            Once you know these answers cold, go practice against Claude.
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
