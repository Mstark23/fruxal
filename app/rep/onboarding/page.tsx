// =============================================================================
// /rep/onboarding — Rep quick-start guide
// Shown to new reps when they first log in (no clients yet)
// =============================================================================
"use client";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    n: "01",
    title: "Set your Calendly link",
    body: "Clients need a way to book calls with you. Set up a Fruxal-specific Calendly event type (30 min, discovery call). Add the link in your dashboard settings — it appears on every client card and in assignment emails.",
    action: "Set Calendly link →",
    href: "/rep/dashboard",
  },
  {
    n: "02",
    title: "Understand the 3 finding categories",
    body: "Most recoveries come from: (1) Tax structure gaps — SR&ED, CDA, RDTOH, LCGE. (2) Vendor overcharges — processing rates, insurance, SaaS subscriptions. (3) Government programs — CDAP, Canada Job Grant, provincial credits. Know which documents you need for each.",
    action: null, href: null,
  },
  {
    n: "03",
    title: "Make first contact within 24 hours",
    body: "Response time is the #1 predictor of conversion. Clients who hear from you within 24 hours of assignment book at 3× the rate of those who wait 3+ days. Use the 'Send Booking Link' button in the client file — it pre-fills a professional email.",
    action: null, href: null,
  },
  {
    n: "04",
    title: "Use the AI Call Script before every call",
    body: "Open the client file and click '📞 Call Script'. The AI generates a personalized opening line using their actual dollar amounts, three talking points, and responses to common objections. Read it once before dialing.",
    action: null, href: null,
  },
  {
    n: "05",
    title: "Log confirmed findings as you go",
    body: "Don't wait until the engagement is complete. Log each confirmed saving in the Savings tab as you confirm it — the client sees it update in their dashboard, building trust throughout the process. Each confirmed saving triggers an automatic email to the client.",
    action: null, href: null,
  },
];

const DOCS_NEEDED: Record<string, string[]> = {
  "Tax structure": ["T2 Returns (3 years)", "Shareholder register", "Owner compensation details"],
  "SR&ED": ["Description of R&D activities", "Payroll records for technical staff", "Materials/contractor costs"],
  "Vendor/procurement": ["Top 20 vendor invoices", "Most recent contracts for each"],
  "Insurance": ["All current policies", "Most recent premium invoices"],
  "Government programs": ["CRA business number", "Revenue records", "Employee count by year"],
};

export default function RepOnboardingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-white border-b border-[#E5E3DD]">
        <div className="max-w-[760px] mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-[#1A1A18]">Rep Quick-Start Guide</h1>
            <p className="text-[11px] text-[#8E8C85] mt-0.5">5 steps to your first closed engagement</p>
          </div>
          <button onClick={() => router.push("/rep/dashboard")}
            className="text-[12px] font-semibold text-[#1B3A2D] hover:underline">
            Go to Dashboard →
          </button>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-6 py-8 space-y-4">
        {STEPS.map((s, i) => (
          <div key={i} className="bg-white border border-[#E5E3DD] rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="flex items-start gap-5 px-6 py-5">
              <div className="w-8 h-8 rounded-full bg-[#1B3A2D] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[11px] font-black text-white">{s.n}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#1A1A18] mb-2">{s.title}</p>
                <p className="text-[13px] text-[#56554F] leading-relaxed">{s.body}</p>
                {s.action && s.href && (
                  <button onClick={() => router.push(s.href!)}
                    className="mt-3 text-[12px] font-semibold text-[#1B3A2D] hover:underline">
                    {s.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Document cheat sheet */}
        <div className="bg-white border border-[#E5E3DD] rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="px-6 py-4 border-b border-[#E5E3DD]">
            <p className="text-[12px] font-bold text-[#1A1A18]">Documents to Request by Category</p>
          </div>
          <div className="divide-y divide-[#F0EFEB]">
            {Object.entries(DOCS_NEEDED).map(([cat, docs]) => (
              <div key={cat} className="px-6 py-4">
                <p className="text-[11px] font-bold text-[#2D7A50] uppercase tracking-wider mb-2">{cat}</p>
                <ul className="space-y-1">
                  {docs.map(doc => (
                    <li key={doc} className="flex items-start gap-2 text-[12px] text-[#56554F]">
                      <span className="text-[#B5B3AD] shrink-0 mt-0.5">·</span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1B3A2D] rounded-xl px-6 py-5 text-center">
          <p className="text-[13px] font-semibold text-white mb-1">Commission model</p>
          <p className="text-[12px] text-white/60 mb-4">
            You earn a commission on the Fruxal fee. Client pays 12% of confirmed savings.
            You earn your commission rate % of that 12%. No cap, no limit.
          </p>
          <button onClick={() => router.push("/rep/dashboard")}
            className="px-6 py-2.5 bg-white text-[#1B3A2D] text-[12px] font-bold rounded-sm hover:bg-white/90 transition">
            Go to My Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
