"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SECTIONS = [
  {
    title: "Getting Started",
    icon: "start",
    items: [
      { q: "How do I get started?", a: "Run the free prescan on the homepage — it takes about 2 minutes. You'll see your top leaks with estimated dollar amounts. Then create a free account, run your full intake, and a recovery expert gets assigned to your file." },
      { q: "What data do I need?", a: "For the prescan: just approximate annual revenue, your industry, and province. For the full intake (about 5 minutes): revenue, payroll, margins, and a few other financials. No accounting software required to start." },
      { q: "How accurate are the results?", a: "The prescan gives estimates based on industry benchmarks — typically within 10–20% of actual figures. The full intake produces more precise numbers. Enterprise users who upload T2 returns or financial statements get verified figures." },
    ],
  },
  {
    title: "Understanding Your Leaks",
    icon: "leak",
    items: [
      { q: "What is a 'leak'?", a: "A leak is any area where your business spends more than the industry benchmark for your type of business and province. For example, if restaurants typically pay 2.5% for payment processing and you're paying 3.2%, that 0.7% gap is a leak. We calculate the annual dollar impact of each one." },
      { q: "What do the severity levels mean?", a: "Urgent: Large leaks (usually >$10K/yr) — priority for your rep. High: Moderate leaks ($2K–$10K/yr) — next in the queue. Medium: Smaller leaks (<$2K/yr) — recovered after the bigger items. Your rep prioritizes by dollar impact." },
      { q: "What is the Health Score?", a: "A 0–100 score measuring how efficiently your business operates vs. industry standards. 70+ is well-run with targeted opportunities. 50–70 is moderate with real money to recover. Below 50 means significant leaks — typically the cases where our rep recovers the most." },
    ],
  },
  {
    title: "How Recovery Works",
    icon: "fix",
    items: [
      { q: "What happens after my intake?", a: "A Fruxal recovery expert reviews your findings and reaches out to book a call. On the call, you confirm priorities and sign a recovery agreement. Our accountant then handles everything — CRA correspondence, vendor renegotiations, grant applications. You don't need to do anything." },
      { q: "How does Fruxal get paid?", a: "We take 12% of confirmed savings we actually recover for you. Nothing until money is in your account. If we recover nothing, you pay nothing. All amounts are in Canadian dollars." },
      { q: "What does my rep actually handle?", a: "CRA calls and correspondence, vendor renegotiations, government grant applications, SR&ED claims, insurance reviews, payroll compliance corrections. Anything required to recover the money identified in your diagnostic." },
    ],
  },
  {
    title: "Account & Billing",
    icon: "billing",
    items: [
      { q: "What's free?", a: "Everything diagnostic: prescan, health score, full leak report with dollar amounts, AI advisor chat, obligations tracker, government programs directory, industry benchmarks, and monthly brief. All free, no credit card required." },
      { q: "How does billing work?", a: "When your rep confirms a recovery — for example a $15,000 SR&ED refund — you receive the money first, then we invoice 12% ($1,800 in this example). No upfront cost, no subscription, no retainer." },
      { q: "Can I end an engagement early?", a: "Yes. Recovery engagements run for 12 months and can be ended by either party. You owe the 12% fee only on savings confirmed to that point. Your free tool access continues regardless." },
    ],
  },
  {
    title: "AI Advisor",
    icon: "intel",
    items: [
      { q: "What can the AI advisor do?", a: "The AI advisor has full context about your business — diagnostic findings, recovery status, obligations, health score, and financial ratios. Ask it questions like 'What does this leak mean?', 'How was this amount calculated?', or 'What documents does my rep need?' For execution questions, it will direct you to your rep." },
      { q: "Is the AI advisor a replacement for my rep?", a: "No. The advisor helps you understand your situation — explaining findings, amounts, and obligations. Your rep and accountant handle all execution: CRA calls, vendor negotiations, grant applications. The advisor is a knowledgeable first layer, not a substitute for the recovery service." },
    ],
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = search
    ? SECTIONS.map(s => ({ ...s, items: s.items.filter(i => i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())) })).filter(s => s.items.length > 0)
    : SECTIONS;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-ink">Help Center</h1>
          <button onClick={() => router.push("/v2/dashboard")} className="text-sm text-ink-faint hover:text-ink">← Dashboard</button>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search help articles…"
          className="w-full px-4 py-3 bg-white border border-border-light rounded-xl text-sm mb-6 outline-none focus:border-brand transition"
        />

        <div className="space-y-6">
          {filtered.map(section => (
            <div key={section.title}>
              <h2 className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-3 pb-2 border-b border-border-light">{section.title}</h2>
              <div className="space-y-1">
                {section.items.map(item => (
                  <div key={item.q} className="bg-white border border-border-light rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenItem(openItem === item.q ? null : item.q)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-ink">{item.q}</span>
                      <svg className={`w-4 h-4 text-ink-faint shrink-0 transition-transform ${openItem === item.q ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {openItem === item.q && (
                      <div className="px-4 pb-4 text-[13px] text-ink-secondary leading-relaxed border-t border-border-light pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-white border border-border-light rounded-xl text-center">
          <p className="text-[13px] text-ink mb-1">Still have questions?</p>
          <a href="mailto:support@fruxal.com" className="text-[13px] text-brand font-semibold hover:underline">support@fruxal.com</a>
        </div>
      </div>
    </div>
  );
}
