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
        a: "Fruxal is a Canadian financial diagnostic platform for small and mid-size businesses. It surfaces invisible revenue leaks — money leaving your business through inefficiencies, missed deductions, or overpriced services — and gives you a step-by-step plan to recover it. Think of it as a financial health check that keeps running in the background every month.",
      },
      {
        q: "Who is Fruxal built for?",
        a: "Fruxal is built for Canadian businesses from solo operators to mid-market companies across 245+ industries. Whether you're a restaurant owner in Quebec, a contractor in Ontario, or a professional services firm in BC — Fruxal is designed for your situation, including province-specific tax rules and government programs.",
      },
      {
        q: "How do I get started?",
        a: "Start with the free prescan — it takes about 2 minutes and asks 5 questions about your revenue, industry, and province. You'll immediately see your top financial leaks and an estimated dollar impact. From there, create a free account and run your first full diagnostic to get a health score, ranked findings, and a 90-day action plan.",
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
        a: "The diagnostic is a full AI-powered financial analysis of your business. You fill in an intake form (about 5 minutes) with your revenue, payroll, margins, and other financials. Fruxal's AI engine analyzes your data against 4,273+ leak detectors, industry benchmarks, and Canadian tax rules. It generates a health score out of 100, ranked findings with dollar amounts, a compliance risk matrix, government grant matches, and a prioritized action plan. The analysis runs in about 60–90 seconds.",
      },
      {
        q: "What is the health score?",
        a: "Your health score (0–100) measures the overall financial efficiency of your business. Under 50: significant leaks need urgent attention. 50–69: moderate leaks, common for businesses that haven't had a formal review. 70+: well-run, with targeted opportunities. The score updates in real time as you complete fixes — completing a high-value task adds points immediately. It also decays slightly if you go more than 30 days without a rescan, creating urgency to keep your data current.",
      },
      {
        q: "How accurate are the dollar estimates?",
        a: "Dollar estimates are based on your actual inputs combined with industry benchmarks. They're estimates — not guarantees — because they depend on the completeness of your intake data. Findings show a range (e.g. $280–$420/month) to reflect this. The more accurately you fill in your financials, the more precise the numbers. Enterprise users who upload their T2, financial statements, or bank statements get verified figures rather than estimates.",
      },
      {
        q: "How often should I run a diagnostic?",
        a: "Monthly for most businesses. Fruxal compares each new diagnostic against your previous one and shows exactly what changed — your score, what you fixed, and what new issues appeared. After 28 days (60 days for solo operators, 21 days for enterprise), your dashboard will nudge you to rescan. The month-over-month comparison is one of the most valuable reports Fruxal produces.",
      },
    ],
  },
  {
    label: "Tasks & recovery",
    items: [
      {
        q: "What are tasks and how do I use them?",
        a: "After your diagnostic, Fruxal generates a prioritized task list — specific actions to fix each leak. Each task shows what to do, why it matters, how long it takes, how hard it is, and how much you'll recover per month. When you mark a task done, your recovery counter updates immediately, your health score rises, and your 90-day goal tracks the progress. Tasks are sorted by impact vs. effort so the highest-value, easiest fixes come first.",
      },
      {
        q: "What is the Recovery Counter?",
        a: "The Recovery Counter is the running total of monthly savings you've confirmed by completing tasks — shown on every dashboard. It grows each time you mark a task done. Fruxal tracks recovery milestones ($100, $500, $1,000, $5,000/month) and sends a celebration email at each one. The counter also appears in your monthly brief so you can see your cumulative impact over time.",
      },
      {
        q: "What are 90-day goals?",
        a: "After each diagnostic, Fruxal's AI suggests a specific, measurable 90-day goal — for example 'Recover $680/month by June 30.' You can accept it, adjust the amount or date, or set your own. The goal pins to your dashboard with a progress bar that updates as you complete tasks. If you're falling behind pace, Fruxal shows you the single easiest fix that would get you back on track. Goal completion triggers a celebration and an immediate suggestion for your next challenge.",
      },
    ],
  },
  {
    label: "AI advisor & monthly brief",
    items: [
      {
        q: "What can the AI advisor do?",
        a: "The AI advisor is a financial chat assistant with full context about your business — diagnostic findings, open tasks, completed fixes, recovery total, health score, active goal, obligations, break-even position, and financial ratios. It can answer questions like 'am I on track for my goal?', 'which fix should I do next?', 'how do I fix my payment processing fees?' — and it responds with specific tool names and dollar amounts, not generic advice. It is not a replacement for a CPA; it's a knowledgeable first layer that helps you understand your situation and take action.",
      },
      {
        q: "What is the monthly brief?",
        a: "Once a month, Fruxal emails you a personalized brief written by AI specifically for your business. It covers what you recovered last month, your goal progress, upcoming tax or compliance deadlines, your top open task, and a specific tool recommendation by name. Quebec businesses receive bilingual content. You can unsubscribe from the brief at any time without affecting your account.",
      },
    ],
  },
  {
    label: "Solutions & recommendations",
    items: [
      {
        q: "How does Fruxal recommend tools and services?",
        a: "Fruxal matches each finding or task to the most relevant tool or service from a database of 33,000+ solutions, filtered by your industry, province, and business size. For example, a payment processing leak for a Quebec restaurant would surface Helcim (Canadian processor, 1–2% savings) and Moneris (French support). You can also browse the full solutions library at /v2/solutions, filtered by category, free/paid, and Canadian-only.",
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
        a: "Fruxal identifies and explains which programs you likely qualify for, but does not submit applications on your behalf. For programs like SR&ED, CDAP, or provincial grants, you'll typically need to apply through the relevant government portal or work with a qualified consultant. Fruxal's role is to make sure you know these opportunities exist and understand what's required — most businesses miss programs they easily qualify for simply because they didn't know to look.",
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
    label: "Billing & cancellation",
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
        q: "What happens to my data if I cancel?",
        a: "Your account data — diagnostics, task history, recovery totals, and timeline — is retained for 90 days after cancellation. After 90 days, your data is permanently deleted from our servers. If you reactivate within 90 days, your full history is restored exactly as it was. We don't sell your data before, during, or after your subscription.",
      },
      {
        q: "Can I get a refund?",
        a: "If you've been charged and feel there's an error or you're unsatisfied with the service, contact us at support@fruxal.com within 14 days of the charge and we'll review it. We handle refund requests case-by-case with the goal of making it right. We don't offer automatic refunds for renewals that were already processed, but we're reasonable — just reach out.",
      },
      {
        q: "Do you offer discounts for annual billing or nonprofits?",
        a: "Annual billing and discounts for non-profits, Indigenous-owned businesses, and early-stage startups are available — contact us to discuss. We're a Canadian company and we want to make Fruxal accessible to businesses that need it most.",
      },
    ],
  },
  {
    label: "Privacy & security",
    items: [
      {
        q: "Is my financial data safe?",
        a: "Your data is stored in a Canadian-region PostgreSQL database with row-level security — your data is only accessible by you. Financial data you enter is used only to generate your diagnostic and is never shared or sold. Documents uploaded by Enterprise users are used only for your analysis. Fruxal does not display advertising and does not share user data with third parties for marketing purposes.",
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
        a: "Yes. The History page shows your full financial journey since joining: a score progression chart, a timeline of every prescan, diagnostic, completed task, and goal milestone grouped by month, and a stats bar showing total days on platform, savings recovered, and annualized impact. Each rescan generates an instant comparison showing score delta, what you fixed, new issues found, and your net financial position.",
      },
      {
        q: "What happens if my score goes down?",
        a: "A score drop is normal and informative. Scores can fall for three reasons: (1) a missed tax or compliance deadline applied a penalty, (2) time elapsed since your last diagnostic (the score decays slightly after 31 days to create urgency to rescan), or (3) a rescan found new issues. The score breakdown panel on your dashboard always shows exactly why it moved and what to do about it.",
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
