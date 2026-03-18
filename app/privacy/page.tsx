"use client";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">← Back</button>
        <h1 className="text-2xl font-black text-[#1a1a2e] mb-6">Privacy Policy</h1>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-4 text-sm leading-relaxed">
          <p><strong>Last updated:</strong> February 2026</p>
          <p>Your privacy matters. Here&apos;s exactly what we collect, why, and what we do with it.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">What We Collect</h2>
          <p><strong>Account data:</strong> Name, email, password (hashed with bcrypt, 12 salt rounds — we never see your actual password).</p>
          <p><strong>Business data:</strong> Business name, industry, financial metrics you provide during scans (revenue, cost percentages, rates).</p>
          <p><strong>Usage data:</strong> Pages visited, features used, scan frequency. We use this to improve the product.</p>
          <p><strong>We do NOT collect:</strong> Bank account numbers, credit card numbers (Stripe handles payments), social security numbers, or any data you don&apos;t explicitly provide.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">How We Use It</h2>
          <p><strong>Leak detection:</strong> Your financial data is compared against industry benchmarks to identify optimization opportunities.</p>
          <p><strong>Market intelligence:</strong> Anonymized, aggregated data from all businesses improves our benchmarks over time. Individual business data is never shared.</p>
          <p><strong>Communications:</strong> We send transactional emails (scan results, fix confirmations) and optional marketing emails (tips, promotions). You can unsubscribe from marketing emails anytime.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">Who Sees It</h2>
          <p><strong>Your team:</strong> If you invite team members, they can see your business data.</p>
          <p><strong>Affiliate partners:</strong> When you click &quot;Fix,&quot; we share your business name and the relevant leak category with the recommended partner. We never share your full financial data.</p>
          <p><strong>We never sell your data.</strong> Period.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">Data Security</h2>
          <p>Passwords are hashed with bcrypt (12 rounds). All data is transmitted over HTTPS. Database is hosted on Supabase with row-level security. We use JWT tokens for session management.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">Data Retention</h2>
          <p>Your data is retained as long as your account is active. If you delete your account, all associated data is permanently deleted within 30 days.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">Your Rights</h2>
          <p>You can: export all your data (Reports tab), delete your account (Settings), update your information anytime, and opt out of marketing emails.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">Cookies</h2>
          <p>We use essential cookies for authentication (session tokens) and optional analytics cookies. No third-party advertising cookies.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">Quebec / Canadian Privacy</h2>
          <p>We comply with PIPEDA and Quebec&apos;s Law 25 (Loi 25). You have the right to access, correct, and delete your personal information. Contact our privacy officer at privacy@fruxal.com.</p>

          <p className="mt-8 text-gray-400">Questions? Email <a href="mailto:privacy@fruxal.com" className="text-blue-500">privacy@fruxal.com</a></p>
        </div>
      </div>
    </div>
  );
}
