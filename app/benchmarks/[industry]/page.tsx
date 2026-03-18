"use client";
import { useRouter, useParams } from "next/navigation";

const BENCHMARKS: Record<string, { name: string; icon: string; metrics: Array<{ label: string; value: string; unit: string }>; tips: string[] }> = {
  restaurant: {
    name: "Restaurant", icon: "🍽️",
    metrics: [
      { label: "Food Cost", value: "28-32", unit: "% of revenue" },
      { label: "Labor Cost", value: "25-30", unit: "% of revenue" },
      { label: "Prime Cost", value: "55-60", unit: "% of revenue" },
      { label: "CC Processing", value: "2.2-2.7", unit: "% per transaction" },
      { label: "Rent", value: "6-10", unit: "% of revenue" },
      { label: "Profit Margin", value: "3-9", unit: "% net" },
      { label: "Turnover Rate", value: "73", unit: "% annual" },
      { label: "Food Waste", value: "4-10", unit: "% of purchases" },
    ],
    tips: ["Renegotiate CC processing rates every 12 months", "Cross-train staff to reduce labor hours", "Implement waste tracking to cut food cost 2-3%", "Menu engineering: highlight high-margin items"],
  },
  ecommerce: {
    name: "E-commerce", icon: "🛒",
    metrics: [
      { label: "Customer Acquisition Cost", value: "30-60", unit: "$" },
      { label: "Cart Abandonment Rate", value: "65-75", unit: "%" },
      { label: "Return Rate", value: "15-30", unit: "%" },
      { label: "Shipping Cost", value: "8-12", unit: "% of revenue" },
      { label: "Payment Processing", value: "2.4-2.9", unit: "%" },
      { label: "Net Profit Margin", value: "10-20", unit: "%" },
    ],
    tips: ["A/B test checkout flow to reduce abandonment", "Negotiate shipping volume discounts", "Implement size guides to reduce returns", "Switch to Stripe or negotiate better rates"],
  },
  saas: {
    name: "SaaS", icon: "💻",
    metrics: [
      { label: "Monthly Churn", value: "3-7", unit: "%" },
      { label: "CAC", value: "200-500", unit: "$" },
      { label: "LTV:CAC Ratio", value: "3:1+", unit: "target" },
      { label: "Gross Margin", value: "70-85", unit: "%" },
      { label: "Net Revenue Retention", value: "100-120", unit: "%" },
      { label: "Payback Period", value: "12-18", unit: "months" },
    ],
    tips: ["Implement dunning emails to recover failed payments", "Focus on activation — users who complete onboarding churn 40% less", "Annual plans reduce churn by 30%"],
  },
  construction: {
    name: "Construction", icon: "🏗️",
    metrics: [
      { label: "Gross Margin", value: "20-35", unit: "%" },
      { label: "Labor Burden", value: "30-40", unit: "% above base wage" },
      { label: "Material Waste", value: "5-15", unit: "% of materials" },
      { label: "Rework Rate", value: "5-12", unit: "% of project cost" },
      { label: "Change Order Rate", value: "10-15", unit: "% of contracts" },
      { label: "Net Profit", value: "2-7", unit: "%" },
    ],
    tips: ["Prefab materials reduce waste 20-30%", "GPS fleet tracking cuts fuel costs 15-20%", "Digital takeoffs reduce estimating errors by 50%"],
  },
  healthcare: {
    name: "Healthcare", icon: "🏥",
    metrics: [
      { label: "Collection Rate", value: "95-98", unit: "%" },
      { label: "Days in A/R", value: "30-45", unit: "days" },
      { label: "Denial Rate", value: "5-10", unit: "%" },
      { label: "No-Show Rate", value: "5-8", unit: "%" },
      { label: "Overhead", value: "55-65", unit: "%" },
      { label: "Staff per Provider", value: "3-4.5", unit: "FTEs" },
    ],
    tips: ["Automated appointment reminders cut no-shows by 30%", "Clean claims first-pass reduces denials by 50%", "Outsource billing to reduce overhead 15-20%"],
  },
  "law-firm": {
    name: "Law Firm", icon: "⚖️",
    metrics: [
      { label: "Realization Rate", value: "85-92", unit: "%" },
      { label: "Collection Rate", value: "88-95", unit: "%" },
      { label: "Utilization Rate", value: "28-33", unit: "% billable hours" },
      { label: "Revenue per Lawyer", value: "300-600", unit: "K$/yr" },
      { label: "Overhead", value: "40-55", unit: "% of revenue" },
      { label: "Profit per Partner", value: "200-500", unit: "K$" },
    ],
    tips: ["Track realization rate monthly — even 2% improvement adds $50K+/yr", "Automate time entry to capture 15-20% more billable hours", "Standardize engagement letters to reduce write-offs"],
  },
  accounting: {
    name: "Accounting Firm", icon: "📊",
    metrics: [
      { label: "Revenue per Employee", value: "120-180", unit: "K$" },
      { label: "Utilization Rate", value: "55-70", unit: "%" },
      { label: "Client Retention", value: "90-97", unit: "%" },
      { label: "Profit Margin", value: "20-35", unit: "%" },
      { label: "Staff Leverage", value: "5-8", unit: "staff per partner" },
      { label: "Billing Realization", value: "90-96", unit: "%" },
    ],
    tips: ["Advisory services yield 2-3x higher margins than compliance", "Fixed-price packages eliminate scope creep", "Cloud tools reduce admin overhead 20-30%"],
  },
  consulting: {
    name: "Consulting", icon: "💼",
    metrics: [
      { label: "Utilization Rate", value: "60-75", unit: "%" },
      { label: "Day Rate", value: "1500-5000", unit: "$" },
      { label: "Profit Margin", value: "15-30", unit: "%" },
      { label: "Client Lifetime Value", value: "50-200", unit: "K$" },
      { label: "Proposal Win Rate", value: "20-40", unit: "%" },
      { label: "Revenue per Consultant", value: "200-400", unit: "K$" },
    ],
    tips: ["Retainer models smooth revenue and increase LTV 3-5x", "Productize repeatable services to boost margins", "Track proposal-to-close ratio to optimize business development"],
  },
  agency: {
    name: "Marketing Agency", icon: "📱",
    metrics: [
      { label: "Net Profit Margin", value: "10-20", unit: "%" },
      { label: "Revenue per Employee", value: "100-175", unit: "K$" },
      { label: "Client Retention Rate", value: "70-85", unit: "%" },
      { label: "Utilization Rate", value: "60-70", unit: "%" },
      { label: "Avg Retainer Value", value: "3-10", unit: "K$/mo" },
      { label: "Client Acquisition Cost", value: "2-8", unit: "K$" },
    ],
    tips: ["Scope creep is the #1 margin killer — track hours against estimates", "Raise rates 10-15% for new clients annually", "White-label deliverables where possible to boost output per person"],
  },
  "real-estate": {
    name: "Real Estate", icon: "🏠",
    metrics: [
      { label: "Commission Rate", value: "2.5-3.0", unit: "%" },
      { label: "Deals per Agent", value: "8-15", unit: "/yr" },
      { label: "Marketing Cost", value: "10-15", unit: "% of commission" },
      { label: "Lead Conversion", value: "2-5", unit: "%" },
      { label: "Avg Days on Market", value: "25-45", unit: "days" },
      { label: "Referral Rate", value: "25-40", unit: "%" },
    ],
    tips: ["Sphere-of-influence marketing costs 1/5 of cold leads", "Transaction coordinators free 10+ hours per deal", "Video tours reduce days on market by 20%"],
  },
  "financial-advisor": {
    name: "Financial Advisor", icon: "💰",
    metrics: [
      { label: "AUM per Advisor", value: "75-200", unit: "M$" },
      { label: "Revenue per Client", value: "3-8", unit: "K$/yr" },
      { label: "Client Retention", value: "93-97", unit: "%" },
      { label: "Overhead Ratio", value: "50-70", unit: "%" },
      { label: "Profit Margin", value: "20-35", unit: "%" },
      { label: "Referral Rate", value: "30-50", unit: "%" },
    ],
    tips: ["Fee transparency builds trust and reduces attrition", "Tax-loss harvesting adds 0.5-1% alpha — systematize it", "Niche specialization commands premium fees"],
  },
};

export default function IndustryBenchmarkPage() {
  const router = useRouter();
  const params = useParams();
  const industry = params.industry as string;
  const data = BENCHMARKS[industry];

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-2xl font-black mb-2">Industry Benchmarks</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mt-6">
            {Object.entries(BENCHMARKS).map(([key, val]) => (
              <button key={key} onClick={() => router.push(`/benchmarks/${key}`)} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                <div className="text-2xl mb-1">{val.icon}</div>
                <div className="text-xs font-medium">{val.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5">
        <span className="text-lg font-black">💧 LEAK &amp; GROW</span>
        <button onClick={() => router.push("/scan")} className="text-sm font-bold bg-[#00c853] text-black px-4 py-2 rounded-xl">Free Scan →</button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">{data.icon}</div>
          <h1 className="text-3xl sm:text-4xl font-black">{data.name} Industry Benchmarks</h1>
          <p className="text-gray-400 mt-2 text-sm">How does your {data.name.toLowerCase()} compare? See the numbers that matter.</p>
        </div>

        <div className="space-y-3 mb-8">
          {data.metrics.map(m => (
            <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="text-sm font-medium">{m.label}</div>
              <div className="text-right">
                <div className="text-lg font-black text-[#00c853]">{m.value}</div>
                <div className="text-[10px] text-gray-500">{m.unit}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="text-sm font-bold mb-3">💡 Tips to Beat These Benchmarks</div>
          <div className="space-y-2">
            {data.tips.map((tip, i) => (
              <div key={i} className="flex gap-3 text-xs text-gray-300">
                <span className="text-[#00c853] font-bold shrink-0">{i + 1}.</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8">
          <div className="text-xl font-black mb-2">Are you above or below?</div>
          <div className="text-sm text-gray-400 mb-4">Scan your {data.name.toLowerCase()} in 30 seconds — we&apos;ll tell you exactly where you&apos;re leaking money.</div>
          <button onClick={() => router.push(`/scan?industry=${industry}`)} className="px-8 py-3 bg-[#00c853] text-black font-bold rounded-xl hover:bg-[#00e676] transition-all">
            Scan My {data.name} — Free →
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="text-xs text-gray-600">Other industries:</div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {Object.entries(BENCHMARKS).filter(([k]) => k !== industry).map(([key, val]) => (
              <button key={key} onClick={() => router.push(`/benchmarks/${key}`)} className="text-xs text-gray-500 hover:text-white bg-white/5 px-3 py-1 rounded-full">{val.icon} {val.name}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
