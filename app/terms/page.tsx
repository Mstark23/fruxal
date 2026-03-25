"use client";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">← Back</button>
        <h1 className="text-2xl font-black text-[#1a1a2e] mb-6">Terms of Service</h1>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-4 text-sm leading-relaxed">
          <p><strong>Last updated:</strong> February 2026</p>
          <p>By using Fruxal (&quot;the Service&quot;), you agree to these terms. If you don&apos;t agree, please don&apos;t use the Service.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">1. What We Do</h2>
          <p>Fruxal analyzes your business financial data against industry benchmarks to identify potential cost optimization opportunities (&quot;leaks&quot;). Our analysis is informational only and does not constitute financial, legal, or business advice.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">2. Accounts</h2>
          <p>You must provide accurate information when creating an account. You&apos;re responsible for maintaining the security of your account. One person or legal entity per account.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">3. Billing</h2>
          <p>Solo and Business tiers are free — no subscription, no credit card required. Enterprise tier is billed at 12% of confirmed savings recovered, as agreed in your engagement terms. All amounts are in Canadian dollars.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">4. Your Data</h2>
          <p>You retain ownership of all data you provide. We use your data solely to provide the Service. We do not sell your data to third parties. See our Privacy Policy for details.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">5. Affiliate Partners</h2>
          <p>When you click &quot;Fix&quot; on a leak, we may recommend third-party services. We receive a commission if you sign up through our links. This does not affect the price you pay. We only recommend services we believe can help.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">6. Accuracy Disclaimer</h2>
          <p>Our estimates are based on industry benchmarks and the data you provide. Actual results may vary. We are not responsible for business decisions made based on our analysis. Always consult with qualified professionals for financial decisions.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">7. Limitation of Liability</h2>
          <p>The Service is provided &quot;as is.&quot; We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you&apos;ve paid us in the last 12 months.</p>

          <h2 className="text-lg font-bold text-[#1a1a2e] mt-6">8. Changes</h2>
          <p>We may update these terms. We&apos;ll notify you of significant changes via email. Continued use after changes constitutes acceptance.</p>

          <p className="mt-8 text-gray-400">Questions? Email <a href="mailto:legal@fruxal.com" className="text-blue-500">legal@fruxal.com</a></p>
        </div>
      </div>
    </div>
  );
}
