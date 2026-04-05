"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// =============================================================================
// REP TRAINING — About Fruxal: Product Knowledge
// =============================================================================

const SECTIONS = [
  {
    id: "what-fruxal-does",
    title: "What Fruxal Does",
    items: [
      {
        label: "We're a financial leak detection and recovery platform for small businesses",
        content: `We use AI to scan a business and find every dollar leaving the business that shouldn't be.

Think of us as a financial X-ray — we scan, find the problems, and fix them.

The customer does NOTHING — our team handles everything. From identifying the leaks to renegotiating contracts to filing credits, we do the work. The business owner goes back to running their business.`,
      },
    ],
  },
  {
    id: "model",
    title: "How the Model Works",
    items: [
      {
        label: "100% Contingency — No Upfront Cost, No Risk",
        content: `No upfront cost, no monthly fees, no risk. Period.

We charge 12% of confirmed savings — only what we actually recover.

If we find nothing? The customer pays $0.

EXAMPLE:
We find $50K/yr in leaks
→ Our fee is $6K
→ Customer keeps $44K
→ They were losing $50K before, now they're saving $44K

"Would you rather keep losing $50K or pay $6K to save $44K?"`,
      },
    ],
  },
  {
    id: "journey",
    title: "The Customer Journey",
    items: [
      {
        label: "Step 1: Free Prescan",
        content: `5-minute AI chat. Instant results.

The prescan asks a few quick questions about the business — revenue, industry, structure — and shows estimated leaks immediately. No documents needed, no commitment. It's the hook that gets them in the door.`,
      },
      {
        label: "Step 2: Full Diagnostic",
        content: `Intake form + document upload. AI generates a detailed report with exact dollars.

This is where we go deep. The business provides documents (tax returns, insurance policies, processing statements) and our AI produces a comprehensive diagnostic report.`,
      },
      {
        label: "Step 3: Strategy Call",
        content: `Rep walks through findings. Customer signs the engagement letter.

This is the 15-minute call where the rep reviews the diagnostic, answers questions, handles objections, and closes. The engagement letter authorizes us to begin recovery work.`,
      },
      {
        label: "Step 4: Recovery",
        content: `Accountants + reps work the findings.

Renegotiate contracts, file tax credits, fix compliance issues, requote insurance, apply for grants. The customer does nothing — we handle every call, every form, every negotiation.`,
      },
      {
        label: "Step 5: Confirmed Savings",
        content: `Customer sees money in their account. Pays 12% of what was confirmed.

Only after savings are verified and real money is recovered or costs are reduced does the customer pay. No surprises, no hidden fees.`,
      },
    ],
  },
  {
    id: "report",
    title: "What the Diagnostic Report Contains",
    items: [
      {
        label: "Health Score",
        content: `0-100 across 6 dimensions:

• Compliance — Are they following all rules and filing requirements?
• Efficiency — Are operations lean or bloated?
• Optimization — Are they structured for maximum tax and cost efficiency?
• Growth — Are they positioned to scale?
• Bankability — Could they get financing if needed?
• Exit Readiness — Would the business pass due diligence?`,
      },
      {
        label: "Findings",
        content: `5-12 specific leaks, each with:

• Exact dollar amount (annual impact)
• Severity rating (critical, high, medium, low)
• Detailed recommendation for recovery
• Confidence level and supporting data

This is the core of the report — the money we're going to recover.`,
      },
      {
        label: "Executive Summary",
        content: `A CFO-level narrative of the business situation.

Written in plain English, this summary explains the overall financial health, the biggest risks, and the top opportunities. It's what business owners read first.`,
      },
      {
        label: "Risk Matrix",
        content: `Compliance risks mapped by likelihood and impact.

Shows which regulatory, tax, or filing issues could result in penalties or audits. Helps prioritize what to fix first.`,
      },
      {
        label: "CPA Briefing",
        content: `Talking points for accountant review.

A structured document the business owner can hand to their CPA to discuss tax-related findings. We work WITH accountants, not against them.`,
      },
      {
        label: "Recovery Sequence",
        content: `Priority-ranked action plan.

Findings ordered by ease of recovery and dollar impact. We start with the highest-confidence, highest-value items first.`,
      },
      {
        label: "Peer Benchmarks",
        content: `How they compare to industry average and top quartile.

Shows the business where they stand relative to similar businesses in their sector, revenue band, and region. Creates urgency when they see they're underperforming.`,
      },
    ],
  },
  {
    id: "leaks",
    title: "Types of Leaks We Find",
    items: [
      {
        label: "Tax Structure Optimization",
        content: `S-corp election, salary/dividend split, incorporation timing.

Many businesses are in the wrong entity structure. A sole proprietor doing $200K+ in profit could save $10-20K/yr by electing S-corp status. We identify these and facilitate the transition.`,
      },
      {
        label: "Government Programs Missed",
        content: `SR&ED/R&D credits, WOTC, Section 179, provincial grants.

Billions in government programs go unclaimed every year. Most businesses don't know they qualify. We check eligibility for every applicable program.`,
      },
      {
        label: "Compliance Exposure",
        content: `Late filings, missing registrations, penalty risk.

Compliance gaps cost money in penalties and increase audit risk. We identify every exposure and fix them before they become expensive.`,
      },
      {
        label: "Payroll Optimization",
        content: `Workers comp classification, CPP/FICA optimization, PEO analysis.

Misclassified workers comp codes alone can cost thousands per year. We review every payroll line item for optimization.`,
      },
      {
        label: "Insurance Overpayment",
        content: `Haven't shopped in 2+ years, wrong classification.

If a business hasn't requoted insurance in 2+ years, they're almost certainly overpaying. We requote through our network and find savings on average of 15-25%.`,
      },
      {
        label: "Vendor Contract Renegotiation",
        content: `Processing fees, rent, software bloat.

Credit card processing rates, SaaS subscriptions, lease terms — we renegotiate everything. Most businesses are paying above-market rates because nobody has time to shop.`,
      },
      {
        label: "Cash Leakage",
        content: `AR collection, banking fees, pricing erosion.

Slow accounts receivable, unnecessary bank fees, and prices that haven't been raised in years all drain cash. We identify and plug every leak.`,
      },
    ],
  },
  {
    id: "ideal-customer",
    title: "Who Our Ideal Customer Is",
    items: [
      {
        label: "Revenue Tiers",
        content: `$100K-$20M+ annual revenue — any tier.

• Solo: Freelancers, sole props, small shops ($0-$150K)
• Business: Growing companies with employees ($150K-$1M)
• Enterprise: Established businesses, CCPCs, multi-entity ($1M+)

Each tier has different leak profiles, but ALL have leaks. The diagnostic adapts to their size and complexity.`,
      },
      {
        label: "Industry & Lead Quality",
        content: `ANY industry — we have industry-specific benchmarks for 20+ sectors.

Construction, restaurants, tech, professional services, retail, healthcare, manufacturing — every industry has its own leak patterns and we know them all.

Businesses that haven't done a financial review in 12+ months are the best leads. The longer they've gone without a review, the more leaks have accumulated.`,
      },
    ],
  },
  {
    id: "competitive",
    title: "Competitive Advantage",
    items: [
      {
        label: "vs Accountant",
        content: `"Your accountant does taxes. We find what they miss — vendor contracts, insurance, compliance gaps, pricing. We go 10 layers deep."

Accountants handle compliance (backward-looking). We handle optimization (forward-looking). Different scope, complementary services. We actually work WITH their accountant.`,
      },
      {
        label: "vs Consultant",
        content: `"Consultants charge $5K-$50K upfront and take 6 weeks. We do it in 90 seconds and only charge on results."

Traditional consulting is expensive, slow, and risky for the client. Our model eliminates all three problems: it's free unless we deliver, instant, and we take the risk.`,
      },
      {
        label: "vs DIY",
        content: `"You could do this yourself in 100+ hours. Or we handle everything and you pay nothing unless we save you money."

Business owners don't have time to audit their own vendors, research tax credits, requote insurance, and renegotiate contracts. That's our entire job.`,
      },
    ],
  },
  {
    id: "faq",
    title: "Common Prospect Questions",
    items: [
      {
        label: "\"Is this really free?\"",
        content: `"Yes. We run on contingency. If we don't find savings, you pay nothing. Zero risk."

There is no catch. No hidden fees. No subscription that kicks in later. If we recover $0, they pay $0. The entire risk is on us.`,
      },
      {
        label: "\"How is 12% calculated?\"",
        content: `"Only on confirmed, verified savings. You approve each finding before we charge."

The customer has full visibility into every finding. They sign off on each recovery before any fee is calculated. No surprises.`,
      },
      {
        label: "\"Do you replace my accountant?\"",
        content: `"No. We work WITH your accountant. We find things they don't have time to look for."

We send tax-related findings to their CPA with a briefing document. We handle the non-accounting recoveries (insurance, vendors, contracts) directly.`,
      },
      {
        label: "\"How long does it take?\"",
        content: `"Prescan: 5 minutes. Full diagnostic: 24-48 hours. First recovery: typically 30-60 days."

The prescan is instant. The diagnostic takes 1-2 business days after documents are uploaded. Recovery timelines depend on the finding — insurance requotes are fast (2-3 weeks), tax amendments take longer (60-90 days).`,
      },
      {
        label: "\"What if I'm already well-managed?\"",
        content: `"Great businesses still leak 3-7% of revenue. We've never found zero."

Even the best-run businesses have inefficiencies. Rates change, programs launch, contracts expire, industries shift. Nobody can stay on top of everything — that's why we exist.`,
      },
    ],
  },
];

export default function RepTrainingProductPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("what-fruxal-does");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const section = SECTIONS.find(s => s.id === activeSection)!;

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
              About Fruxal
            </span>
          </div>
          <button onClick={() => router.push("/rep/training/learn")}
            className="px-4 py-2 text-[12px] font-bold rounded-lg transition"
            style={{ background: "rgba(27,58,45,0.06)", color: "#1B3A2D", border: "1px solid #E5E3DD" }}>
            SLP Training &rarr;
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-8">
        <h1 className="text-[24px] font-bold mb-2" style={{ color: "#1B3A2D" }}>
          Product Knowledge — Everything About Fruxal
        </h1>
        <p className="text-[13px] mb-8" style={{ color: "#888" }}>
          Know this inside and out. When a prospect asks anything, you should have the answer instantly.
        </p>

        {/* Section tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => { setActiveSection(s.id); setExpandedItem(null); }}
              className="px-4 py-2 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: activeSection === s.id ? "rgba(27,58,45,0.08)" : "white",
                border: `1px solid ${activeSection === s.id ? "#1B3A2D" : "#E5E3DD"}`,
                color: activeSection === s.id ? "#1B3A2D" : "#888",
              }}>
              {s.title}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-3">
          {section.items.map((item, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ background: "white", border: "1px solid #E5E3DD" }}>
              <button onClick={() => setExpandedItem(expandedItem === `${section.id}-${i}` ? null : `${section.id}-${i}`)}
                className="w-full px-5 py-4 text-left flex items-center justify-between transition"
                style={{ background: expandedItem === `${section.id}-${i}` ? "rgba(27,58,45,0.02)" : "white" }}>
                <span className="text-[14px] font-semibold" style={{ color: "#1B3A2D" }}>{item.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: expandedItem === `${section.id}-${i}` ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedItem === `${section.id}-${i}` && (
                <div className="px-5 pb-5" style={{ borderTop: "1px solid #E5E3DD" }}>
                  <pre className="text-[13px] leading-[1.8] whitespace-pre-wrap pt-4 font-sans"
                    style={{ color: "#555" }}>
                    {item.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <p className="text-[12px] mb-4" style={{ color: "#999" }}>
            Know the product cold. Then master the pitch.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/rep/training/learn")}
              className="px-8 py-3.5 rounded-xl text-[14px] font-bold transition-all"
              style={{ background: "#1B3A2D", color: "white" }}>
              Learn SLP System &rarr;
            </button>
            <button onClick={() => router.push("/rep/training")}
              className="px-8 py-3.5 rounded-xl text-[14px] font-bold transition-all"
              style={{ background: "white", color: "#1B3A2D", border: "1px solid #E5E3DD" }}>
              Practice Drill &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
