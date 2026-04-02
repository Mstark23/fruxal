"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SCRIPTS = [
  {
    id: "first_contact",
    title: "First Contact Call",
    desc: "New lead assigned — first outreach within 24 hours",
    script: `Hi [NAME], this is [REP] from Fruxal. I'm reaching out because your business scan flagged some things worth looking at.

I'm not selling anything — Fruxal works on contingency, meaning we only get paid if we actually recover money for you. No upfront cost.

Your scan showed about [LEAK_AMOUNT] in potential annual savings across [FINDING_COUNT] areas. The biggest one is [TOP_FINDING] at roughly [TOP_AMOUNT] per year.

I'd love to walk you through the findings in a quick 15-minute call. What I usually do is pull up your report, explain what each item means in plain language, and you decide if any of it is worth pursuing.

Would [SUGGEST_TIME] work for a quick call?`,
  },
  {
    id: "follow_up",
    title: "Follow-Up (No Response)",
    desc: "Lead hasn't responded to first contact — 3-5 day follow-up",
    script: `Hi [NAME], [REP] again from Fruxal. I reached out a few days ago about the financial scan you completed.

Quick reminder — your scan found [LEAK_AMOUNT]/year in potential recovery, and the top item alone ([TOP_FINDING]) is worth about [TOP_AMOUNT].

I know you're busy, so I'll keep this simple: I can walk through the findings in 10 minutes. If nothing looks real to you, we shake hands and move on. No pressure, no commitment.

Here's my booking link if it's easier: [CALENDLY_URL]

Either way, the report isn't going anywhere — it's yours whenever you're ready.`,
  },
  {
    id: "post_diagnostic",
    title: "Post-Diagnostic Review",
    desc: "Full diagnostic completed — walking client through findings",
    script: `Hi [NAME], great to connect. I've reviewed your full diagnostic and I want to walk you through the key findings.

Your Financial Health Score came in at [SCORE]/100, which puts you in the [BAND] range for [INDUSTRY] businesses in [PROVINCE].

The diagnostic found [FINDING_COUNT] areas where you're leaving money on the table, totaling about [LEAK_AMOUNT] per year. Let me start with the three biggest:

1. [FINDING_1] — [AMOUNT_1]/year
   This means [PLAIN_EXPLANATION_1]

2. [FINDING_2] — [AMOUNT_2]/year
   This means [PLAIN_EXPLANATION_2]

3. [FINDING_3] — [AMOUNT_3]/year
   This means [PLAIN_EXPLANATION_3]

Here's how Fruxal works: we handle all the recovery work — vendor renegotiations, tax filings, program applications. You don't pay anything unless we actually recover money. Our fee is [FEE_RATE]% of confirmed savings, meaning you keep [KEEP_RATE]%.

Which of these three stands out to you as the most impactful?`,
  },
  {
    id: "objection_fee",
    title: "Objection: Fee Too High",
    desc: "Client pushes back on the contingency fee percentage",
    script: `I completely understand the concern about the fee. Let me put it in perspective with your actual numbers:

Your diagnostic found [LEAK_AMOUNT]/year in recoverable savings. At our [FEE_RATE]% contingency fee, you'd keep [KEEP_AMOUNT] and we'd earn [FEE_AMOUNT].

But here's the key — without Fruxal, that [LEAK_AMOUNT] stays on the table. It's not a question of paying us [FEE_RATE]% versus keeping 100%. It's paying [FEE_RATE]% versus losing the full amount.

And remember: you pay nothing upfront. If we don't find real, confirmed savings, you owe us zero. We take all the risk.

Most of our clients tell us after the first recovery that the fee felt like nothing compared to the money they got back. Would you like me to start with the highest-confidence finding first so you can see a real result quickly?`,
  },
  {
    id: "objection_accountant",
    title: "Objection: My Accountant Handles This",
    desc: "Client says their accountant already covers everything",
    script: `That's great that you have an accountant — and to be clear, we're not trying to replace them. What we do is different.

Your accountant focuses on compliance — making sure your books are right and your taxes are filed on time. That's essential work.

What we focus on is optimization — things like: Are you on the best processing rate for your volume? Is your insurance competitive? Are there government programs you qualify for that nobody applied for? Is your corporate structure still the most tax-efficient?

In fact, [FINDING_COUNT] of the items we found in your diagnostic are things that fall outside a typical accountant's scope: [TOP_CATEGORIES].

We actually work WITH your accountant on the tax-related items. They execute the filings — we identify what's been missed and do the legwork to recover it.

Would it help if I showed you the specific findings that your accountant would normally not flag?`,
  },
  {
    id: "closing",
    title: "Closing — Ready to Sign",
    desc: "Client is ready — walking through the agreement",
    script: `Great, I'm glad the findings resonated. Let me walk you through how we get started.

I'll send you our Contingency Engagement Agreement. It's straightforward:

1. Scope — We'll work on the [SCOPE_COUNT] categories we discussed: [CATEGORIES]
2. Fee — [FEE_RATE]% of confirmed savings only. If we recover nothing, you pay nothing.
3. Timeline — Most clients see their first confirmed recovery within 30-60 days.
4. Documents — I'll need [DOC_LIST] to get started. You can upload them through your dashboard.
5. Cancellation — Either side can cancel with 5 days' notice. You keep everything recovered to that point.

I'll email the agreement now. You can review it and sign digitally — takes about 2 minutes.

Once signed, I'll get started on [TOP_FINDING] first since that's the highest-value item. Any questions before I send it over?`,
  },
];

export default function RepScriptsPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyScript = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[17px] font-bold text-[#1B3A2D]">Call Scripts</h1>
            <p className="text-[11px] text-[#8E8C85] mt-0.5">Ready-to-use scripts for every stage of the pipeline</p>
          </div>
          <button onClick={() => router.push("/rep/dashboard")}
            className="text-[11px] font-semibold text-[#1B3A2D] hover:underline">
            Dashboard →
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-6 space-y-3">
        <p className="text-[12px] text-[#8E8C85] mb-4">
          Replace [BRACKETS] with client-specific data. For personalized scripts with real numbers, use the "Call Script" button in any client file.
        </p>

        {SCRIPTS.map((s) => (
          <div key={s.id} className="bg-white border border-[#E5E3DD] rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <button
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#FAFAF8] transition">
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A18]">{s.title}</p>
                <p className="text-[11px] text-[#8E8C85] mt-0.5">{s.desc}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8C85" strokeWidth="2" strokeLinecap="round"
                style={{ transform: expanded === s.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {expanded === s.id && (
              <div className="px-5 pb-5 border-t border-[#F0EFEB]">
                <div className="flex justify-end mb-2 pt-3">
                  <button onClick={() => copyScript(s.id, s.script)}
                    className="text-[10px] font-semibold text-[#1B3A2D] hover:underline">
                    {copied === s.id ? "Copied!" : "Copy script →"}
                  </button>
                </div>
                <pre className="text-[13px] text-[#56554F] whitespace-pre-wrap font-sans leading-relaxed bg-[#FAFAF8] border border-[#F0EFEB] rounded-lg p-4">
                  {s.script}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
