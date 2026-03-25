"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SECTIONS = [
  {
    title: "Getting Started",
    icon: "🚀",
    items: [
      { q: "How do I run my first scan?", a: "Click 'Find My Leaks' on the homepage, pick your industry, answer 5 simple questions about your business (revenue, costs, rates), and we'll analyze 303 data points against real industry benchmarks. Takes about 30 seconds." },
      { q: "What data do I need?", a: "For the quick scan: just approximate annual revenue and a few cost percentages. For better accuracy, you can connect QuickBooks, upload a CSV, or link your bank. The more data you provide, the more precise the leak detection." },
      { q: "How accurate are the results?", a: "We use real benchmarks from NRA, CFMA, MGMA, and other standards bodies. Results are directionally accurate — typically within 10-20% of actual values. Connecting QuickBooks or uploading real data improves accuracy to 90%+." },
    ],
  },
  {
    title: "Understanding Your Leaks",
    icon: "💧",
    items: [
      { q: "What is a 'leak'?", a: "A leak is any area where your business spends more than the industry benchmark. For example, if restaurants typically pay 2.5% for credit card processing and you're paying 3.2%, that gap is a leak. We calculate the annual dollar impact of each gap." },
      { q: "What do the severity levels mean?", a: "🔴 Urgent: Large leaks (usually >$10K/yr) that need immediate attention. 🟡 Important: Moderate leaks ($2K-$10K/yr) worth addressing soon. 🔵 Minor: Smaller leaks (<$2K/yr) to fix when you have time." },
      { q: "What is the Health Score?", a: "A 0-100 score that measures how efficiently your business operates vs. industry standards. 80+ is excellent, 50-80 is average, below 50 means significant optimization opportunity." },
    ],
  },
  {
    title: "Fixing Leaks",
    icon: "🔧",
    items: [
      { q: "How do I fix a leak?", a: "Click 'Fix' on any leak to see recommended actions and vetted partner services. Some fixes are simple (renegotiate a rate), others connect you with a specialist (switch payment processors, get new insurance quotes)." },
      { q: "Who are the affiliate partners?", a: "We maintain a database of 200+ vetted service providers across categories like payment processing, insurance, payroll, marketing, and more. Each partner is matched to specific leak types they can solve." },
      { q: "Do I pay anything to fix a leak?", a: "Using Fruxal to identify and track leaks is free (3 leaks) or $49/mo (all leaks). The partner services themselves have their own pricing, which is always shown upfront. We never charge hidden fees." },
    ],
  },
  {
    title: "Account & Billing",
    icon: "💳",
    items: [
      { q: "What's included in the free plan?", a: "1 scan, 3 leaks visible with full details, health score, basic insights. Enough to see the value before upgrading." },
      { q: "What does Pro ($49/mo) include?", a: "All leaks visible, fix recommendations with affiliate partners, AI intelligence engine, unlimited scans, reports & exports, email notifications." },
      { q: "Can I cancel anytime?", a: "Yes. Go to Settings → Billing → Manage Subscription. Cancel in one click. 30-day money-back guarantee on all paid plans." },
    ],
  },
  {
    title: "Intelligence Engine",
    icon: "📊",
    items: [
      { q: "What is the Intelligence Engine?", a: "A 3-tier AI system. Tier 1 (free): automatic pattern detection that runs on every scan. Tier 2 (weekly): batch analysis across all businesses to find market-wide trends. Tier 3 (on-demand): deep AI analysis of your specific business using Claude." },
      { q: "How does the AI chat work?", a: "The chat button in the dashboard opens a conversation with Claude AI that has access to all your leak data. Ask questions like 'What should I fix first?' or 'Why is my labor cost high?' and get personalized advice." },
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
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-[#1a1a2e]">❓ Help Center</h1>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</button>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search help articles..."
          className="w-full px-4 py-3 bg-white border rounded-xl text-sm mb-6 outline-none focus:ring-2 focus:ring-blue-200"
        />

        <div className="space-y-6">
          {filtered.map(section => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{section.icon}</span>
                <h2 className="text-sm font-bold text-[#1a1a2e]">{section.title}</h2>
              </div>
              <div className="space-y-1">
                {section.items.map(item => {
                  const key = `${section.title}-${item.q}`;
                  return (
                    <div key={key} className="bg-white rounded-xl border overflow-hidden">
                      <button onClick={() => setOpenItem(openItem === key ? null : key)} className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-all">
                        <span className="text-sm font-medium pr-4">{item.q}</span>
                        <span className="text-gray-400 shrink-0">{openItem === key ? "−" : "+"}</span>
                      </button>
                      {openItem === key && (
                        <div className="px-3 pb-3 text-xs text-gray-500 leading-relaxed">{item.a}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 border text-center">
          <div className="text-2xl mb-2">💬</div>
          <div className="text-sm font-bold mb-1">Still need help?</div>
          <div className="text-xs text-gray-400 mb-3">Use the AI chat in your dashboard or email us.</div>
          <a href="mailto:support@fruxal.com" className="text-xs text-blue-500 hover:underline">support@fruxal.com</a>
        </div>
      </div>
    </div>
  );
}
