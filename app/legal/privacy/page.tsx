// =============================================================================
// app/legal/privacy/page.tsx
// =============================================================================
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Fruxal",
  description: "How Fruxal collects, uses, and protects your business data.",
};

const EFFECTIVE = "March 22, 2026";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: "2.5rem", marginBottom: ".75rem", color: "#1a1a1a" }}>{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ lineHeight: 1.75, color: "#444", marginBottom: "1rem", fontSize: 15 }}>{children}</p>;
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul style={{ paddingLeft: "1.25rem", marginBottom: "1rem", color: "#444", lineHeight: 1.75, fontSize: 15 }}>{children}</ul>;
}
function LI({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: ".35rem" }}>{children}</li>;
}

export default function PrivacyPage() {
  return (
    <div>
      {/* Title */}
      <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".5rem" }}>Legal</p>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: ".5rem" }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: "2.5rem" }}>
        Effective date: {EFFECTIVE} · Last updated: {EFFECTIVE}
      </p>

      <P>
        Fruxal Inc. (&ldquo;Fruxal,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates a financial diagnostic platform for Canadian small and mid-size businesses. This Privacy Policy explains what information we collect, how we use it, who we share it with, and your rights under Canada&apos;s Personal Information Protection and Electronic Documents Act (PIPEDA).
      </P>
      <P>
        By using Fruxal, you consent to the collection and use of your information as described in this policy. If you do not agree, do not use our service.
      </P>

      <H2>1. Information we collect</H2>
      <P>We collect information in two ways: information you provide directly, and information we collect automatically.</P>
      <p style={{ fontWeight: 600, color: "#333", marginBottom: ".5rem", fontSize: 15 }}>Information you provide:</p>
      <UL>
        <LI><strong>Account information</strong> — name, email address, business name when you register</LI>
        <LI><strong>Business profile data</strong> — industry, province, revenue band, employee count, business structure</LI>
        <LI><strong>Financial diagnostic data</strong> — the revenue, payroll, margin, and other financial figures you enter into the intake form; the diagnostic findings, health scores, and task history generated from that data</LI>
        <LI><strong>Uploaded documents</strong> (Enterprise tier only) — T2 corporate returns, financial statements, GST/HST returns, T4 summaries, and bank statements you choose to upload for verified analysis</LI>
        <LI><strong>Communications</strong> — when you contact us by email or through the platform</LI>
        <LI><strong>Account deletion reason</strong> — if you voluntarily provide one when deleting your account</LI>
      </UL>
      <p style={{ fontWeight: 600, color: "#333", marginBottom: ".5rem", fontSize: 15, marginTop: "1rem" }}>Information collected automatically:</p>
      <UL>
        <LI><strong>Usage data</strong> — pages visited, features used, diagnostic run frequency, login timestamps</LI>
        <LI><strong>Device and browser information</strong> — browser type, operating system, IP address (used for security and abuse prevention)</LI>
        <LI><strong>Cookies</strong> — session cookies required for login; analytics cookies from Vercel Analytics (anonymized)</LI>
        <LI><strong>Email engagement data</strong> — whether emails we send were opened or links were clicked (through Resend)</LI>
      </UL>
      <P>We do not collect payment card numbers. All payment processing is handled by Stripe, which is PCI-DSS certified.</P>

      <H2>2. Why we collect this information</H2>
      <UL>
        <LI><strong>To provide the diagnostic service</strong> — analyzing your financial inputs, generating findings, scores, and recovery recommendations</LI>
        <LI><strong>To personalize your recovery</strong> — matching programs, grants, and findings to your specific industry, province, and business size</LI>
        <LI><strong>To send relevant communications</strong> — monthly briefs, deadline reminders, milestone emails, and account notifications. You can opt out of non-essential emails at any time</LI>
        <LI><strong>To process payments</strong> — creating and managing your subscription through Stripe</LI>
        <LI><strong>To improve the platform</strong> — understanding how features are used to make Fruxal better</LI>
        <LI><strong>To comply with legal obligations</strong> — maintaining records required by applicable law</LI>
      </UL>

      <H2>3. Who we share your information with</H2>
      <P>We share your information only with the following service providers, each operating under appropriate data agreements:</P>
      <UL>
        <LI><strong>Anthropic</strong> — Your financial inputs are processed by Anthropic&apos;s Claude API to generate diagnostic findings. Anthropic does not use your inputs to train their models. See Anthropic&apos;s privacy policy at anthropic.com.</LI>
        <LI><strong>Stripe</strong> — Payment processing and recovery fee billing. Stripe handles all card data. See stripe.com/privacy.</LI>
        <LI><strong>Resend</strong> — Transactional email delivery (diagnostic results, monthly briefs, account notifications). See resend.com/privacy.</LI>
        <LI><strong>Supabase</strong> — Database hosting for your account and diagnostic data. Supabase is SOC 2 certified. See supabase.com/privacy.</LI>
        <LI><strong>Vercel</strong> — Application hosting and anonymized web analytics. See vercel.com/legal/privacy-policy.</LI>
      </UL>
      <P>
        <strong>We do not sell your data to third parties. Ever.</strong> Affiliate solution providers receive only an anonymous click referral when you click on a recommended solution — they never receive your name, email, financial data, or any personally identifiable information.
      </P>
      <P>We may disclose your information if required by law, court order, or to protect the rights and safety of Fruxal, our users, or the public.</P>

      <H2>4. Your rights under PIPEDA</H2>
      <P>As a Canadian resident, you have the following rights with respect to your personal information:</P>
      <UL>
        <LI><strong>Right to access</strong> — You may request a copy of the personal information we hold about you</LI>
        <LI><strong>Right to correct</strong> — You may request that we correct inaccurate or incomplete information</LI>
        <LI><strong>Right to delete</strong> — You may delete your account and all associated data at any time from Settings → Danger Zone. All data is purged within 30 days</LI>
        <LI><strong>Right to withdraw consent</strong> — You may withdraw consent to specific uses (such as marketing emails) at any time without affecting the lawfulness of prior processing</LI>
        <LI><strong>Right to complain</strong> — If you believe we have not handled your information appropriately, you may lodge a complaint with the Office of the Privacy Commissioner of Canada at priv.gc.ca</LI>
      </UL>
      <P>
        To exercise these rights, contact us at <a href="mailto:privacy@fruxal.ca" style={{ color: "#1B3A2D" }}>privacy@fruxal.ca</a>. We will respond within 30 days.
      </P>

      <H2>5. Data retention</H2>
      <UL>
        <LI><strong>Active accounts</strong> — Data is retained for as long as your account is active</LI>
        <LI><strong>Deleted accounts</strong> — All personal data is purged within 30 days of account deletion. We retain only an anonymized deletion log (a cryptographic hash, not your actual data) for compliance purposes</LI>
        <LI><strong>Diagnostic reports</strong> — Retained for the lifetime of your account and deleted with your account</LI>
        <LI><strong>Email logs</strong> — Retained for 12 months</LI>
        <LI><strong>Uploaded documents</strong> (Enterprise) — Retained for the lifetime of your account or until you request deletion</LI>
      </UL>

      <H2>6. Security</H2>
      <UL>
        <LI>All data transmitted between your browser and Fruxal is encrypted using TLS (Transport Layer Security)</LI>
        <LI>Database access is controlled via Row Level Security — your data is only accessible by authenticated requests associated with your account</LI>
        <LI>Payment card data is handled entirely by PCI-DSS certified Stripe infrastructure. We never see or store card numbers</LI>
        <LI>We regularly review our security practices and promptly address identified vulnerabilities</LI>
      </UL>
      <P>No system is 100% secure. If you become aware of a security concern, please contact us at <a href="mailto:privacy@fruxal.ca" style={{ color: "#1B3A2D" }}>privacy@fruxal.ca</a>.</P>

      <H2>7. Cookies</H2>
      <UL>
        <LI><strong>Session cookies</strong> — Required for you to stay logged in. Without these, the service cannot function</LI>
        <LI><strong>Analytics cookies</strong> — Vercel Analytics uses anonymized, aggregated data to help us understand page performance. No personal identifiers are collected</LI>
      </UL>
      <P>We do not use advertising cookies, retargeting pixels, or third-party tracking. See our <a href="/legal/cookies" style={{ color: "#1B3A2D" }}>Cookie Policy</a> for full details.</P>

      <H2>8. Contact us</H2>
      <P>For privacy questions, data access requests, or to exercise your rights under PIPEDA:</P>
      <UL>
        <LI>Email: <a href="mailto:privacy@fruxal.ca" style={{ color: "#1B3A2D" }}>privacy@fruxal.ca</a></LI>
        <LI>Response time: 30 days</LI>
        <LI>Jurisdiction: This policy is governed by the laws of Quebec, Canada</LI>
      </UL>
      <P>This Privacy Policy was last updated on {EFFECTIVE}. We will notify active users of material changes by email before they take effect.</P>
    </div>
  );
}
