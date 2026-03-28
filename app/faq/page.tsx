"use client";
// =============================================================================
// app/faq/page.tsx — Public FAQ page (no auth required)
// =============================================================================

import { useState } from "react";

const SECTIONS = [
  {
    label: "Getting started",
    items: [
      {
        q: "What is Fruxal?",
        a: "Fruxal is a Canadian business recovery service for small and mid-size businesses. It finds invisible revenue leaks — money leaving your business through inefficiencies, missed deductions, or overpriced services — then assigns a recovery expert who handles everything on your behalf. You only pay when money is actually recovered.",
      },
      {
        q: "Who is Fruxal built for?",
        a: "Fruxal is built for Canadian businesses from solo operators to mid-market companies across 245+ industries. Whether you're a restaurant owner in Quebec, a contractor in Ontario, or a professional services firm in BC — Fruxal is designed for your situation, including province-specific tax rules and government programs.",
      },
      {
        q: "How do I get started?",
        a: "Start with the free prescan — it takes about 2 minutes and asks 5 questions about your revenue, industry, and province. You'll immediately see your top financial leaks with estimated dollar amounts. From there, create a free account and run your full intake to confirm exact numbers. If your case qualifies, a recovery expert is assigned to you.",
      },
      {
        q: "Do I need accounting software or financial documents to start?",
        a: "No. The prescan and standard diagnostic only need numbers you likely know off the top of your head — annual revenue, rough payroll, and province. You can optionally upload documents (T2, financial statements, bank statements) for a more precise analysis, but this is only available on the Enterprise tier and never required to start.",
      },
    ],
  },
  {
    label: "The diagnostic",
    items: [
      {
        q: "What is a diagnostic and how does it work?",
        a: "The diagnostic is a full AI-powered financial analysis of your business. You fill in an intake form (about 5 minutes) with your revenue, payroll, margins, and other financials. Fruxal's AI engine analyzes your data against 4,273+ leak detectors, industry benchmarks, and Canadian tax rules. It generates a health score out of 100, ranked findings with exact dollar amounts, a compliance risk matrix, and government grant matches. The analysis runs in about 60–90 seconds. Your assigned rep reviews these results with you on a call.",
      },
      {
        q: "What is the health score?",
        a: "Your health score (0–100) measures the overall financial efficiency of your business. Under 50: significant leaks need urgent attention. 50–69: moderate leaks, common for businesses that haven't had a formal review. 70+: well-run, with targeted opportunities. The score updates as your rep confirms recoveries and as your situation changes.",
      },
      {
        q: "How accurate are the dollar estimates?",
        a: "Dollar estimates are based on your actual inputs combined with industry benchmarks. They're estimates — not guarantees — because they depend on the completeness of your intake data. Findings show a range (e.g. $280–$420/month) to reflect this. The more accurately you fill in your financials, the more precise the numbers. Enterprise users who upload their T2, financial statements, or bank statements get verified figures rather than estimates.",
      },
      {
        q: "How often should I run a diagnostic?",
        a: "Monthly for most businesses. Fruxal compares each new diagnostic against your previous one and shows exactly what changed — your score, what was recovered, and what new issues appeared. After 28 days (60 days for solo operators, 21 days for enterprise), your dashboard will nudge you to rescan. The month-over-month comparison is one of the most valuable reports Fruxal produces.",
      },
    ],
  },
  {
    label: "Recovery service",
    items: [
      {
        q: "How does the recovery service work?",
        a: "Once your intake is complete, a Fruxal recovery expert is assigned to your file. They review your diagnostic findings, book a call with you to confirm priorities, then our accountant handles everything — CRA correspondence, vendor renegotiations, grant applications, and follow-through. You don't lift a finger. We take 12% of confirmed savings. If we recover nothing, you pay nothing.",
      },
      {
        q: "What is the Recovery Counter?",
        a: "The Recovery Counter shows the running total of confirmed savings recovered on your behalf — visible on your dashboard at all times. It updates as your rep confirms amounts. Fruxal tracks recovery milestones ($100, $500, $1,000, $5,000/month) and sends a notification at each one. The counter also appears in your monthly brief.",
      },
      {
        q: "What does my rep actually do?",
        a: "Your rep manages your entire recovery engagement. They contact CRA on your behalf, negotiate with vendors, apply for government grants, and track every dollar recovered. You'll receive updates as amounts are confirmed. For questions or check-ins, you can book a call directly through your rep's calendar link on your dashboard.",
      },
    ],
  },
  {
    label: "AI advisor & monthly brief",
    items: [
      {
        q: "What can the AI advisor do?",
        a: "The AI advisor is a financial chat assistant with full context about your business — diagnostic findings, recovery status, confirmed savings, health score, obligations, and financial ratios. It can answer questions like 'what does this leak mean?', 'how was this amount calculated?', 'what documents does my rep need?' — and it responds with specific details, not generic advice. For 'how to fix' questions, it will direct you to your rep, who handles execution. It is not a replacement for a CPA; it's a knowledgeable first layer that helps you understand your situation.",
      },
      {
        q: "What is the monthly brief?",
        a: "Once a month, Fruxal emails you a personalized brief written by AI specifically for your business. It covers what was recovered last month, upcoming tax or compliance deadlines, your rep's current focus, and government programs relevant to your situation. Quebec businesses receive bilingual content. You can unsubscribe from the brief at any time without affecting your account.",
      },
    ],
  },
  {
    label: "Solutions & recommendations",
    items: [
      {
        q: "How does Fruxal recommend tools and services?",
        a: "Fruxal matches each finding to the most relevant tool or service from a database of 33,000+ solutions, filtered by your industry, province, and business size. For example, a payment processing leak for a Quebec restaurant would surface Helcim (Canadian processor, 1–2% savings) and Moneris (French support). Your rep uses these matches when executing your recovery.",
      },
      {
        q: "Does Fruxal have affiliate relationships with recommended solutions?",
        a: "Some recommendations include affiliate relationships — meaning Fruxal may earn a commission if you sign up. We only recommend solutions we'd genuinely suggest based on your specific situation. The matching is based on your industry, province, and type of leak detected — not on commission rates. Commission data is never shown to users and does not influence ranking. A small disclosure note appears on the solutions browse page.",
      },
    ],
  },
  {
    label: "Grants & government programs",
    items: [
      {
        q: "Does Fruxal identify grants I might qualify for?",
        a: "Yes. Every diagnostic includes a government programs section that matches your business to federal and provincial grants, subsidies, and tax credits you may be eligible for. This includes programs like SR&ED (Scientific Research & Experimental Development tax credits), CDAP (Canada Digital Adoption Program), provincial hiring credits, export programs, and industry-specific funding. Fruxal shows the maximum funding amount and eligibility summary for each program.",
      },
      {
        q: "What is SR&ED and do I qualify?",
        a: "SR&ED (Scientific Research & Experimental Development) is Canada's largest R&D tax incentive — worth up to 35% of eligible expenditures for Canadian-controlled private corporations. It's far broader than most business owners realize: software development, process improvement, and problem-solving activities often qualify. Fruxal's Enterprise diagnostic specifically checks for SR&ED eligibility and flags it if your activities may qualify. You'll still need a qualified SR&ED consultant to file, but Fruxal will tell you if it's worth looking into.",
      },
      {
        q: "Are the government programs up to date?",
        a: "Fruxal's programs database is maintained and updated regularly. However, government programs change — eligibility criteria shift, funding runs out, and new programs launch. Fruxal flags programs that match your profile, but always verify current eligibility and deadlines directly with the program administrator or a qualified advisor before applying.",
      },
      {
        q: "Can Fruxal help me apply for grants?",
        a: "Yes — grant applications are part of the recovery service. If your diagnostic identifies a program you qualify for, your rep and accountant handle the application process. For businesses not yet in a recovery engagement, Fruxal identifies and explains which programs you likely qualify for so you understand what's available.",
      },
    ],
  },
  {
    label: "Pricing & tiers",
    items: [
      {
        q: "What does Fruxal cost?",
        a: "The prescan, health score, obligations tracker, AI advisor, and government programs directory are free forever — no credit card, no subscription. The recovery service is performance-based: we charge 12% of confirmed savings we find and recover for you. You pay nothing until money is in your account. If we find nothing, you pay nothing.",
      },
      {
        q: "What's included for free vs. paid?",
        a: "Free forever: prescan, financial health score, full leak report, AI advisor chat, obligations tracker, deadlines and compliance alerts, government programs directory, industry benchmarks, and monthly brief. The recovery service (assigned rep, CRA correspondence, grant applications, vendor renegotiation) operates on 12% contingency — no cost unless we recover money.",
      },
      {
        q: "Why is it free?",
        a: "All the diagnostic tools are free because they help businesses understand their situation — and some of those businesses qualify for our recovery service. When we recover money for a business at 12% contingency, that's how we sustain the free tools. Our interests are perfectly aligned with yours: we only make money when you do.",
      },
    ],
  },
  {
    label: "Billing & engagements",
    items: [
      {
        q: "How does billing work?",
        a: "All tools are free, no credit card required. If you qualify for a recovery engagement, you sign an agreement confirming the 12% contingency fee. When your rep confirms a saving — for example, a $15,000 SR&ED refund — you receive the money first, then we invoice our 12% fee ($1,800 in this example). You never pay before recovery. All amounts are in Canadian dollars.",
      },
      {
        q: "Can I end an engagement early?",
        a: "Yes. Recovery engagements run for 12 months and can be ended by either party. If you end early, you owe the 12% fee only on savings confirmed to that point — nothing for future work we haven't done. Your free tool access continues regardless.",
      },
      {
        q: "What happens to my data if I close my account?",
        a: "Your account data — diagnostics, recovery history, confirmed savings, and timeline — is retained for 90 days after account closure. After 90 days, your data is permanently deleted from our servers. If you reactivate within 90 days, your full history is restored exactly as it was. We don't sell your data.",
      },
      {
        q: "Can I get a refund?",
        a: "If you've been charged and feel there's an error or you're unsatisfied with the service, contact us at support@fruxal.com within 14 days of the charge and we'll review it. We handle refund requests case-by-case with the goal of making it right.",
      },
    ],
  },
  {
    label: "Privacy & security",
    items: [
      {
        q: "Is my financial data safe?",
        a: "Your data is stored in a Canadian-region PostgreSQL database with row-level security — your data is only accessible by you and your assigned rep. Financial data you enter is used only to generate your diagnostic and recovery plan, and is never shared or sold. Documents uploaded by Enterprise users are used only for your analysis. Fruxal does not display advertising and does not share user data with third parties for marketing purposes.",
      },
      {
        q: "Does Fruxal connect to my accounting software or bank?",
        a: "Not automatically. You enter your financials manually in the intake form. Enterprise users can upload PDF documents (T2 corporate returns, financial statements, GST/HST returns, T4 summaries, bank statements) and Fruxal's AI extracts and verifies the data. Direct accounting software integrations (QuickBooks, Xero) are on the roadmap but not yet available.",
      },
    ],
  },
  {
    label: "History & progress",
    items: [
      {
        q: "Can I see my progress over time?",
        a: "Yes. The Recovery page shows your full financial journey since joining: a score progression chart, a timeline of every prescan, diagnostic, confirmed recovery, and goal milestone grouped by month, and a stats bar showing total days on platform, savings recovered, and annualized impact. Each rescan generates an instant comparison showing score delta, new issues found, and your net financial position.",
      },
      {
        q: "What happens if my score goes down?",
        a: "A score drop is normal and informative. Scores can fall for three reasons: (1) a missed tax or compliance deadline applied a penalty, (2) time elapsed since your last diagnostic (the score decays slightly after 31 days to create urgency to rescan), or (3) a rescan found new issues. The score breakdown panel on your dashboard always shows exactly why it moved.",
      },
    ],
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "none", border: "none", textAlign: "left",
          padding: "1.1rem 0", display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: "12px", cursor: "pointer",
          fontSize: "15px", fontWeight: 500, color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
        }}>
        {q}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      {open && (
        <p style={{
          fontSize: "14px", lineHeight: 1.75, color: "var(--color-text-secondary)",
          paddingBottom: "1.1rem", fontFamily: "var(--font-sans)",
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const q = search.toLowerCase();

  const filtered = SECTIONS.map(s => ({
    ...s,
    items: s.items.filter(i =>
      !q || i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)
    ),
  })).filter(s => s.items.length > 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-background-tertiary, #f7f8fa)",
      fontFamily: "var(--font-sans)",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
        padding: "1.5rem 1.5rem 2rem",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <a href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "var(--color-text-secondary)",
            textDecoration: "none", marginBottom: "1.5rem",
          }}>
            ← Back to Fruxal
          </a>
          <h1 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>
            Frequently asked questions
          </h1>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
            Everything you need to know about Fruxal.
          </p>
          <input
            type="search"
            placeholder="Search questions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", maxWidth: 440, padding: "0.6rem 1rem",
              fontSize: 14, borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-secondary)",
              background: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-secondary)" }}>
            <p style={{ fontSize: 15 }}>No results for &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => setSearch("")}
              style={{
                marginTop: 12, background: "none", border: "none",
                fontSize: 13, color: "var(--color-text-secondary)",
                cursor: "pointer", textDecoration: "underline",
              }}>
              Clear search
            </button>
          </div>
        ) : filtered.map(section => (
          <div key={section.label} style={{ marginBottom: "2.5rem" }}>
            <p style={{
              fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--color-text-secondary)",
              marginBottom: "0.75rem", paddingBottom: "0.5rem",
              borderBottom: "0.5px solid var(--color-border-tertiary)",
            }}>
              {section.label}
            </p>
            {section.items.map(item => (
              <Item key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        ))}

        {/* Footer CTA */}
        <div style={{
          marginTop: "3rem", padding: "1.5rem",
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
            Still have questions?
          </p>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Email us at{" "}
            <a href="mailto:support@fruxal.com" style={{ color: "var(--color-text-info)" }}>
              support@fruxal.com
            </a>
            {" "}— we respond within one business day.
          </p>
          <a href="/"
            style={{
              display: "inline-block", padding: "0.6rem 1.5rem",
              background: "#1B3A2D", color: "white",
              borderRadius: "var(--border-radius-md)", fontSize: 14,
              fontWeight: 500, textDecoration: "none",
            }}>
            Start your free prescan →
          </a>
        </div>
      </div>
    </div>
  );
}
