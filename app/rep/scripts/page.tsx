"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// =============================================================================
// REP SCRIPTS — Ready-to-use scripts for every contact scenario
// =============================================================================

type ScriptCategory = {
  id: string;
  title: string;
  icon: string;
  color: string;
  scripts: { label: string; content: string }[];
};

const CATEGORIES: ScriptCategory[] = [
  {
    id: "cold",
    title: "Cold Outreach",
    icon: "🧊",
    color: "#0369a1",
    scripts: [
      {
        label: "Cold Call — Opening",
        content: `Hi [NAME], this is [YOUR NAME] from Fruxal? I work with [INDUSTRY] businesses in [PROVINCE] and I had a quick question — got 30 seconds?

[IF YES]
Great — we've been working with a lot of [INDUSTRY] businesses lately and finding that most are overpaying on [PROCESSING FEES / INSURANCE / TAX STRUCTURE] by 15-25%. I'm curious — when's the last time you looked at yours?

[IF "WHAT DO YOU WANT?"]
Fair enough — we find money businesses are losing and recover it. No upfront cost. [INDUSTRY] businesses in [PROVINCE] tend to have a gap in [SPECIFIC AREA]. Worth a 2-minute conversation?

[IF "NOT INTERESTED"]
Totally understand. Quick question before I go — are you paying more than 2.3% on card processing? Because if you are, I can show you the gap in 60 seconds.`,
      },
      {
        label: "Cold Call — Transition to Scan",
        content: `Here's what I'd suggest — we have a free 3-minute business scan that compares your setup against [INDUSTRY] benchmarks. Processing, insurance, tax structure, all of it.

No account needed, no commitment. Takes 3 minutes. If it finds nothing, we shake hands. If it finds something, I'll walk you through it.

Want me to send you the link? Or I can walk you through it right now while we're on the phone.`,
      },
      {
        label: "Cold Email",
        content: `SUBJECT: Quick question about your [PROCESSING FEES / INSURANCE]

Hi [NAME],

I work with [INDUSTRY] businesses in [PROVINCE]. Most are overpaying on [SPECIFIC THING] by 15-25% without knowing it.

Quick question: when's the last time you compared your [PROCESSING RATES / INSURANCE PREMIUMS]?

We run a free 3-minute scan that shows you exactly where you stand vs industry benchmarks. No cost, no account, no strings.

Here's the link: [PRESCAN URL]

Or reply "interested" and I'll call you.

[YOUR NAME]
Fruxal · We find the money. You keep 88%.`,
      },
      {
        label: "Cold Voicemail (15 sec max)",
        content: `Hi [NAME], this is [YOUR NAME] from Fruxal. I work with [INDUSTRY] businesses in [PROVINCE] — we're finding most are overpaying on [SPECIFIC AREA] by 15-25%. Worth a quick look. My number is [NUMBER]. Talk soon.`,
      },
    ],
  },
  {
    id: "referral",
    title: "Referral Introduction",
    icon: "🤝",
    color: "#2D7A50",
    scripts: [
      {
        label: "Referral Call — Opening",
        content: `Hi [NAME], this is [YOUR NAME] from Fruxal? [REFERRER NAME] suggested I reach out — they mentioned you might benefit from what we do. Got a couple of minutes?

[REFERRER] and I worked together on recovering some money their business was losing — ended up finding about [AMOUNT] they didn't know about.

They mentioned your business might have some similar things going on, especially around [INDUSTRY-SPECIFIC AREA].

Have you ever had anyone look at your [processing fees / insurance / tax structure] specifically?`,
      },
      {
        label: "Referral Email",
        content: `SUBJECT: [REFERRER NAME] suggested I reach out

Hi [NAME],

[REFERRER NAME] and I have been working together on recovering money their business was losing — and they thought you might benefit from the same thing.

We specialize in finding hidden financial leaks in [INDUSTRY] businesses — processing fees, insurance, tax structure, government programs.

[REFERRER] suggested I send you our free business scan: [PRESCAN URL]

Takes 3 minutes. No cost, no commitment. If it finds something, I'll walk you through it.

[YOUR NAME]
Fruxal

P.S. — [REFERRER] said to say hi.`,
      },
    ],
  },
  {
    id: "inbound",
    title: "Inbound (No Prescan)",
    icon: "📥",
    color: "#7C3AED",
    scripts: [
      {
        label: "Inbound Call — Get Them to Scan",
        content: `Hi [NAME], this is [YOUR NAME] from Fruxal? I saw you created an account recently — welcome aboard! I wanted to make sure everything's set up for you. Have you had a chance to run the business scan yet?

[IF NO]
No worries at all — it takes about 3 minutes. I can actually walk you through it right now if you have a sec. I'll stay on the line while you answer the questions, and then I can show you what it finds in real-time.

[IF "I WAS JUST LOOKING"]
Makes total sense. Quick question — what made you sign up in the first place? Was there something specific you were curious about?

[WHATEVER THEY SAY → That's their pain point. Use it.]
"That's exactly what we look at. The scan would tell you in 3 minutes whether you're optimized on that or not. Want to try it now while I'm on the phone?"`,
      },
      {
        label: "Inbound Email — Nudge to Scan",
        content: `SUBJECT: Your Fruxal account is ready — just need 3 minutes

Hi [NAME],

Welcome to Fruxal! I saw you created an account but haven't run the business scan yet.

The scan compares your business against industry benchmarks and flags where you might be overpaying. Takes about 3 minutes: [PRESCAN URL]

Once you've done it, I'll personally review your results and walk you through anything we find.

Want me to call you and walk through it together? Reply with a good time.

[YOUR NAME]
Fruxal`,
      },
    ],
  },
  {
    id: "post-prescan",
    title: "Post-Prescan Follow-Up",
    icon: "📊",
    color: "#C4841D",
    scripts: [
      {
        label: "First Call (Within 24 Hours)",
        content: `Hi [NAME], this is [YOUR NAME] from Fruxal? I'm calling because your business scan flagged some things worth looking at. Got a minute?

Your scan found about [TOTAL LEAK] a year in potential savings across [NUMBER] areas. The biggest one is [TOP FINDING] at roughly [TOP AMOUNT] per year.

I'd love to walk you through what we found in a quick 15-minute call. I pull up your report, explain each item in plain language, and you decide if any of it is worth pursuing. No cost, no commitment.

Would [TOMORROW] at [TIME] work for a quick call?`,
      },
      {
        label: "Voicemail After First Call",
        content: `Hi [NAME], this is [YOUR NAME] from Fruxal. Your business scan found [TOTAL LEAK] in potential annual savings — I'd love to walk you through it. No cost on your end. My number is [NUMBER] or book directly at [CALENDLY URL]. Talk soon.`,
      },
      {
        label: "Day 1 Email (After Voicemail)",
        content: `SUBJECT: $[TOTAL LEAK]/yr — your Fruxal scan results

Hi [NAME],

I just tried calling — your business scan flagged [TOTAL LEAK] in potential annual savings across [NUMBER] areas.

The biggest finding: [TOP FINDING] at roughly [TOP AMOUNT]/yr.

I'd love to walk you through the results in a quick 15-minute call.

No cost. No commitment. You only pay if we actually recover money.

Book a time here: [CALENDLY LINK]

Or just reply "yes" and I'll call you.

[YOUR NAME]
Fruxal`,
      },
      {
        label: "Day 3 Email — Single Finding Angle",
        content: `SUBJECT: Quick question about your [CATEGORY]

Hi [NAME],

I reached out a couple of days ago about your Fruxal scan.

Quick question: when's the last time you compared your [PROCESSING RATES / INSURANCE PREMIUMS]?

Your scan shows you're paying about [AMOUNT] more than similar businesses in [INDUSTRY]. That's [MONTHLY AMOUNT] a month leaving your account.

If you're curious, I can show you the exact comparison in 5 minutes.

[CALENDLY LINK]

[YOUR NAME]`,
      },
      {
        label: "Day 7 Email — Cost of Waiting",
        content: `SUBJECT: $[MONTHLY LEAK] — that's what this month cost

Hi [NAME],

Since your scan on [DATE], roughly $[MONTHLY LEAK] has leaked from your business. Not because you're doing anything wrong — just because nobody's looked.

The scan is still here whenever you're ready. 15 minutes.

[CALENDLY LINK]

The leak doesn't pause.

[YOUR NAME]`,
      },
      {
        label: "Day 10 — Breakup Email",
        content: `SUBJECT: Should I close your file?

Hi [NAME],

I've reached out a few times about the $[TOTAL LEAK] your scan found. I don't want to be a pest.

If now isn't the right time, no worries at all. Your results are saved and I'm here whenever you want to look at them.

[CALENDLY LINK]

Either way — hope business is going well.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: "review-call",
    title: "The Review Call",
    icon: "📞",
    color: "#1B3A2D",
    scripts: [
      {
        label: "Review Call — Full Script",
        content: `[MINUTE 0-2: RAPPORT]
"[NAME], great to connect. Thanks for making time. Before I jump in — how's business going?"
→ Let them talk 30-60 seconds. Listen.

[MINUTE 2-3: CONTEXT]
"Great. So let me show you what we found. Your Financial Health Score came in at [SCORE] out of 100, which puts you in the [BAND] range for [INDUSTRY] businesses in [PROVINCE]. We found [NUMBER] areas totaling about [TOTAL] a year."

[MINUTE 3-10: TOP 3 FINDINGS]
For each:
"The [biggest/next] one is [TITLE]. What this means is [PLAIN EXPLANATION]. Here's the math: [SHOW CALCULATION]. Does that make sense?"

[MINUTE 10-12: THE ASK]
"So here's how Fruxal works: we handle all the recovery — vendor calls, filings, applications. You do nothing.

Our fee is 12% of confirmed savings. So if we recover [TOTAL], you keep [88%] and we earn [12%]. If we recover nothing, you pay nothing. The risk is entirely on us.

Which of those findings stands out to you as the most impactful?"

[MINUTE 12-15: CLOSE]
"Want me to send the agreement over? Takes about 2 minutes to review and sign. Once that's done, I'll start on [TOP FINDING] first."`,
      },
      {
        label: "If They Say Yes — Next Steps",
        content: `"Great — I'll send the agreement right now. It's straightforward: the scope, the 12% fee, and the cancellation terms.

While you review that, I'll need a couple of documents to get started: [TOP 2 DOCS]. You can upload them through your dashboard.

Once signed, I'll start on [TOP FINDING] first — that's the quickest win. You should see a confirmed result within 30-60 days.

Any questions before I send it over?"`,
      },
      {
        label: "If They Need Time — The SLP Loop",
        content: `"Totally fair. I wouldn't want you to rush into anything. Can I ask — what specifically is on your mind? Is it the process, the fee, or whether the numbers are real?"

[IF FEE]
"Got it. So at 12%, on the [TOTAL] we found, you'd keep [88%]. Right now that money is just leaving. It's not 12% vs 0% — it's [88%] kept vs [TOTAL] lost."

[IF NUMBERS]
"Fair. Pick any one finding. I'll show you the exact math. If that one's wrong, forget everything else."

[IF PARTNER/SPOUSE]
"Of course. What would THEY need to hear? I'm happy to do a quick call with both of you."

[THEN LOWER THRESHOLD]
"What if I just start with the insurance requote? Zero commitment, zero risk, and you'll see a real result in 2 weeks."

[SET FOLLOW-UP]
"When should I check back? Thursday work?"`,
      },
    ],
  },
  {
    id: "objections",
    title: "Objection Scripts",
    icon: "🛡️",
    color: "#B34040",
    scripts: [
      {
        label: "\"12% is too much\"",
        content: `"I hear you. Here's how I think about it with YOUR numbers:

We found [TOTAL]. At 12%, you keep [88% AMOUNT]. That money is currently walking out the door.

It's not 12% vs 0%. It's keeping [88% AMOUNT] vs losing [TOTAL].

And remember — you pay nothing unless we actually recover it. If we find nothing, you owe zero. Name another service that works like that.

What if I start with just the [EASIEST FINDING]? You'll see a real result before deciding on the rest."`,
      },
      {
        label: "\"My accountant handles this\"",
        content: `"That's great — and we actually love working with accountants. Here's the difference:

Your accountant handles compliance — making sure taxes are filed correctly. That's essential.

We handle optimization — processing rates, insurance comparisons, vendor renegotiations, grant applications. Different skill set.

For example, we found [AMOUNT] in [PROCESSING/INSURANCE] savings. Did your accountant flag that? Those aren't accounting tasks.

We actually send our tax findings TO your accountant so they can file the amendments. Same team, different roles."`,
      },
      {
        label: "\"These numbers seem too high\"",
        content: `"I'd be skeptical too. So let's look at one finding together.

Your processing rate: [RATE]%. Industry median for your volume: [MEDIAN]%. On [VOLUME] in card sales, that's [AMOUNT] per year. That's not an estimate — that's math.

Every finding has the same kind of breakdown. Want me to walk through another one?

If any of them don't hold up, we don't pursue it. Simple as that."`,
      },
      {
        label: "\"I need to think about it\"",
        content: `"Totally fair. Can I ask — what specifically is on your mind? Is it the process, the fee, or whether the numbers are real?

[LISTEN — then address whichever of the Three 10s is weak]

Here's what I know: that [TOTAL] is leaking right now. Every month costs roughly [MONTHLY]. I'm not asking you to commit to everything — what if I just start with [EASIEST FINDING]? Zero risk, and you'll see a result in 2 weeks.

When should I check back? Thursday?"`,
      },
      {
        label: "\"I don't have time\"",
        content: `"That's exactly why this exists. You don't have time to requote insurance, renegotiate your processor, check grant eligibility — nobody does.

I do ALL of that. One call, 15 minutes. That's the only time I need from you. After that, I disappear and do the work. You hear from me when money hits your account.

15 minutes to potentially save [TOTAL] a year. Worth it?"`,
      },
      {
        label: "\"Send me an email\"",
        content: `"I can do that. But honestly? We both know what happens to emails.

You've got [TOTAL] leaking right now. What if I just pull up the top finding — takes 60 seconds — and you tell me if it's worth a proper call?

[IF THEY INSIST]
"No problem — I'll send it right now. Quick thing: was it the [FINDING A] or the [FINDING B] that caught your ear? I'll highlight that one so it's easy to find."`,
      },
      {
        label: "\"How are you different from consultants?\"",
        content: `"Two things:

First — every consultant charges upfront. $5K-$10K for a report full of recommendations you probably won't implement. We charge zero upfront. We don't give you a report — we do the work.

Second — we only get paid on results. 12% of money that's already in your account. If we recover nothing, we earn nothing.

Show me another service that takes that deal."`,
      },
    ],
  },
  {
    id: "reactivation",
    title: "Reactivation (Cold Lead)",
    icon: "🔄",
    color: "#8E8C85",
    scripts: [
      {
        label: "Reactivation Call",
        content: `"Hi [NAME], this is [YOUR NAME] from Fruxal? We connected a while back about your business scan — I wanted to circle back with an update.

I was reviewing your file and realized it's been [N] months since your scan. Based on what we found, that's roughly $[MONTHS × MONTHLY LEAK] that's leaked since we last talked.

I know timing wasn't right before. Is now a better time to take a look? I can walk through the updated numbers in 10 minutes.

[IF HESITANT]
Totally fine — no pressure. But the insurance requote alone takes zero effort and usually saves $2-5K. Can I at least start that one?"`,
      },
      {
        label: "Reactivation Email",
        content: `SUBJECT: $[AMOUNT LOST SINCE] — since we last talked

Hi [NAME],

It's been [N] months since your Fruxal scan found $[TOTAL]/year in potential savings. That means roughly $[LOST SINCE] has leaked since we last connected.

Your results are still here. The findings are still valid. And the money is still leaving.

If now is a better time, I'd love to walk through it again — 15 minutes.

[CALENDLY LINK]

No hard feelings if the timing still isn't right. But the leak doesn't pause.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: "no-show",
    title: "No-Show Recovery",
    icon: "👻",
    color: "#56554F",
    scripts: [
      {
        label: "No-Show Call (Same Day)",
        content: `"Hey [NAME], it's [YOUR NAME] from Fruxal. We had a call booked for [TIME] — no worries at all if something came up. Things happen. Want to reschedule for later this week?"

[IF VOICEMAIL]
"Hey [NAME], I think we missed each other — totally fine. Here's my calendar to rebook whenever works: [CALENDLY]. Talk soon."`,
      },
      {
        label: "No-Show Email",
        content: `SUBJECT: No worries — let's reschedule

Hi [NAME],

I think we missed each other for our call today — no worries at all, things come up.

Here's my calendar to rebook: [CALENDLY LINK]

Your scan results ($[TOTAL]/year) are still here whenever you're ready.

[YOUR NAME]`,
      },
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise / CFO",
    icon: "🏢",
    color: "#1B3A2D",
    scripts: [
      {
        label: "Enterprise Call — Opening",
        content: `"[NAME], [YOUR NAME] from Fruxal. We're a financial recovery firm that works on contingency with mid-market businesses. I'll be brief.

We've been working with [INDUSTRY] companies in the [REVENUE RANGE] bracket and consistently finding $50-150K in recoverable savings — mostly in tax structure, vendor contracts, and unclaimed programs.

I'm curious whether anyone's done a forensic-level review of your cost base recently."`,
      },
      {
        label: "Enterprise Email",
        content: `SUBJECT: [COMPANY] — financial structure review

[NAME],

Fruxal is a contingency-based financial recovery firm. We work with [INDUSTRY] businesses in the $1-10M range to identify and recover savings across tax structure, vendor contracts, insurance, and government programs.

We consistently find $50-150K for businesses at your stage. Our fee: 12% of confirmed recovery only. No retainer, no upfront cost.

Three areas where we typically find the most for [INDUSTRY] companies:
1. [SPECIFIC AREA 1]
2. [SPECIFIC AREA 2]
3. [SPECIFIC AREA 3]

Would a 20-minute call make sense?

[YOUR NAME]
Fruxal Financial Recovery
[PHONE] · [CALENDLY]`,
      },
    ],
  },
  {
    id: "post-close",
    title: "Post-Close & Referral",
    icon: "🎉",
    color: "#2D7A50",
    scripts: [
      {
        label: "First Recovery Confirmation Call",
        content: `"Hey [NAME], quick good news — we confirmed [AMOUNT] on the [FINDING NAME]. That's [AMOUNT] a year back in your pocket.

I'm moving on to [NEXT FINDING] now. Should have an update on that within [TIMELINE].

Any questions in the meantime?"`,
      },
      {
        label: "Monthly Update",
        content: `"Hi [NAME], quick update on your file:

[FINDING] is [in progress / confirmed / pending with CRA/vendor]. [Status detail].

Total recovered to date: [AMOUNT]. Still working on: [REMAINING ITEMS].

Anything you need from my end?"`,
      },
      {
        label: "Referral Ask (After First Recovery)",
        content: `"[NAME], now that you've seen how this works — do you know any other business owners who might be in the same situation you were?

I'm happy to run a free scan for anyone you think could benefit. They don't need to sign up for anything — just 3 minutes and they'll know where they stand.

No rush at all. If someone comes to mind, just send them fruxal.ca and I'll take care of the rest."`,
      },
      {
        label: "QBR Introduction Email",
        content: `SUBJECT: Your Q[X] Recovery Report — [COMPANY]

Hi [NAME],

Attached is your quarterly business review from Fruxal.

Highlights:
- Total recovered this quarter: $[AMOUNT]
- Recovery rate: [X]% of identified savings
- [NEW FINDING / UPCOMING PRIORITY]

Want to do a quick 10-minute call to walk through it? [CALENDLY]

[YOUR NAME]`,
      },
    ],
  },
];

export default function RepScriptsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("cold");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const category = CATEGORIES.find(c => c.id === activeCategory)!;

  const copyScript = (label: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[15px] sm:text-[17px] font-bold text-[#1B3A2D]">Scripts Library</h1>
            <p className="text-[11px] text-[#8E8C85] mt-0.5 hidden sm:block">Copy-paste scripts for every scenario. Replace [BRACKETS] with client data.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => router.push("/rep/training/playbook")}
              className="text-[11px] font-semibold text-[#8E8C85] hover:text-[#1B3A2D] transition hidden sm:block">Playbook</button>
            <button onClick={() => router.push("/rep/dashboard")}
              className="text-[11px] font-semibold text-[#1B3A2D] hover:underline min-h-[36px]">Dashboard →</button>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Category selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => { setActiveCategory(c.id); setExpanded(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 min-h-[36px]"
              style={{
                background: activeCategory === c.id ? c.color + "15" : "white",
                border: `1px solid ${activeCategory === c.id ? c.color + "40" : "#E5E3DD"}`,
                color: activeCategory === c.id ? c.color : "#56554F",
              }}>
              <span>{c.icon}</span> {c.title}
              <span className="text-[9px] opacity-50">({c.scripts.length})</span>
            </button>
          ))}
        </div>

        {/* Scripts */}
        <div className="space-y-3">
          {category.scripts.map((s) => (
            <div key={s.label} className="bg-white border border-[#E5E3DD] rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <button
                onClick={() => setExpanded(expanded === s.label ? null : s.label)}
                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between text-left hover:bg-[#FAFAF8] transition min-h-[48px]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: category.color }} />
                  <p className="text-[13px] sm:text-[14px] font-semibold text-[#1A1A18] truncate">{s.label}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8C85" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: expanded === s.label ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expanded === s.label && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-[#F0EFEB]">
                  <div className="flex justify-end mb-2 pt-3">
                    <button onClick={() => copyScript(s.label, s.content)}
                      className="text-[10px] font-semibold px-3 py-1.5 rounded-lg transition min-h-[32px]"
                      style={{ background: copied === s.label ? "rgba(45,122,80,0.1)" : "rgba(27,58,45,0.06)", color: copied === s.label ? "#2D7A50" : "#1B3A2D" }}>
                      {copied === s.label ? "Copied!" : "Copy →"}
                    </button>
                  </div>
                  <pre className="text-[12px] sm:text-[13px] text-[#56554F] whitespace-pre-wrap font-sans leading-relaxed bg-[#FAFAF8] border border-[#F0EFEB] rounded-lg p-3 sm:p-4">
                    {s.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-[#B5B3AD] mt-8">
          For personalized scripts with real client numbers, use the "Call Script" button in any client file.
        </p>
      </div>
    </div>
  );
}
