"use client";
import { useRouter } from "next/navigation";

export default function APIDocsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5">
        <button onClick={() => router.push("/")} className="text-lg font-black">Fruxal</button>
        <button onClick={() => router.push("/register")} className="text-sm font-bold bg-[#00c853] text-black px-4 py-2 rounded-xl">Get Started →</button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-2">Partner API</h1>
        <p className="text-gray-400 mb-8">Integrate Fruxal into your platform. Check referral stats, submit leads, and track conversions.</p>

        {/* Auth */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <h2 className="text-lg font-bold mb-2">Authentication</h2>
          <p className="text-sm text-gray-400 mb-3">Include your API key in the Authorization header:</p>
          <code className="block bg-black/50 rounded-lg p-3 text-sm text-green-400 overflow-x-auto">
            Authorization: Bearer YOUR_API_KEY
          </code>
          <p className="text-xs text-gray-500 mt-2">Contact support@fruxal.com to get your API key.</p>
        </div>

        {/* GET Stats */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">GET</span>
            <code className="text-sm font-mono">/api/v1/partner</code>
          </div>
          <p className="text-sm text-gray-400 mb-3">Get your referral stats — clicks, conversions, monthly metrics.</p>
          <div className="bg-black/50 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
            <pre>{JSON.stringify({
              partner: { id: "abc123", name: "Your Company", category: "payment_processing" },
              stats: { totalClicks: 142, totalConversions: 23, conversionRate: 16, monthlyClicks: 45, monthlyConversions: 8, commissionRate: "15%" }
            }, null, 2)}</pre>
          </div>
        </div>

        {/* POST Lead */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">POST</span>
            <code className="text-sm font-mono">/api/v1/partner</code>
          </div>
          <p className="text-sm text-gray-400 mb-3">Submit a lead — refer a business to Fruxal.</p>
          <p className="text-xs text-gray-500 mb-2">Request body:</p>
          <div className="bg-black/50 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto mb-3">
            <pre>{JSON.stringify({ email: "owner@restaurant.com", businessName: "Joe's Pizza", industry: "restaurant", notes: "Referred from our billing review" }, null, 2)}</pre>
          </div>
          <p className="text-xs text-gray-500 mb-2">Response:</p>
          <div className="bg-black/50 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
            <pre>{JSON.stringify({ success: true, lead: { id: "lead_xyz", status: "pending" }, message: "Lead submitted. We'll send them a scan invitation." }, null, 2)}</pre>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <h2 className="text-lg font-bold mb-2">Webhooks</h2>
          <p className="text-sm text-gray-400 mb-3">Get notified when events occur. Configure webhook URLs in your partner dashboard.</p>
          <div className="space-y-2 text-sm text-gray-300">
            <div><code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">scan.complete</code> — A referred business completes a scan</div>
            <div><code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">leak.fixed</code> — A leak is marked as fixed (conversion)</div>
            <div><code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">lead.converted</code> — A submitted lead signs up</div>
          </div>
        </div>

        {/* Rate limits */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
          <h2 className="text-lg font-bold mb-2">Rate Limits</h2>
          <p className="text-sm text-gray-400">60 requests/minute for GET, 20 requests/minute for POST. Headers include <code className="text-xs">X-RateLimit-Remaining</code>.</p>
        </div>

        <div className="text-center text-sm text-gray-500">
          Questions? <a href="mailto:support@fruxal.com" className="text-[#00c853]">support@fruxal.com</a>
        </div>
      </div>
    </div>
  );
}
