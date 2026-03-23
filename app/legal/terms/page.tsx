// =============================================================================
// app/legal/terms/page.tsx
// =============================================================================
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Fruxal",
  description: "Terms and conditions for using the Fruxal financial diagnostic platform.",
};

const EFFECTIVE = "March 22, 2026";

function H2({ n, children }: { n: number; children: React.ReactNode }) {
  return <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: "2.5rem", marginBottom: ".75rem", color: "#1a1a1a" }}>{n}. {children}</h2>;
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

export default function TermsPage() {
  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".5rem" }}>Legal</p>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: ".5rem" }}>Terms of Service</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: "2.5rem" }}>
        Effective date: {EFFECTIVE} · Last updated: {EFFECTIVE}
      </p>

      <P>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Fruxal platform, operated by Fruxal Inc. (&ldquo;Fruxal,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using Fruxal, you agree to be bound by these Terms. If you do not agree, do not use the service.
      </P>

      <H2 n={1}>Acceptance</H2>
      <P>
        By creating an account or using the Fruxal service in any way, you represent that you are at least 18 years old, have the authority to agree to these Terms on behalf of yourself and any business you represent, and have read and understood these Terms and our <a href="/legal/privacy" style={{ color: "#1B3A2D" }}>Privacy Policy</a>.
      </P>

      <H2 n={2}>Description of service</H2>
      <P>
        Fruxal provides an AI-powered financial diagnostic platform for Canadian small and mid-size businesses. The service includes: financial leak detection, health scoring, task generation, goal tracking, an AI advisor chat, a solutions database, government program matching, and related features as described at fruxal.vercel.app.
      </P>
      <P>
        We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, with or without notice. We are not liable to you or any third party for any modification, suspension, or discontinuation of the service.
      </P>

      <H2 n={3}>Account registration and security</H2>
      <P>You must create an account to access most features of Fruxal. You agree to:</P>
      <UL>
        <LI>Provide accurate, current, and complete information when registering</LI>
        <LI>Maintain the security of your password and not share your credentials</LI>
        <LI>Notify us immediately at <a href="mailto:support@fruxal.ca" style={{ color: "#1B3A2D" }}>support@fruxal.ca</a> of any unauthorized use of your account</LI>
        <LI>Be responsible for all activity that occurs under your account</LI>
      </UL>
      <P>We reserve the right to terminate or suspend accounts that we believe are being used fraudulently or in violation of these Terms.</P>

      <H2 n={4}>Acceptable use</H2>
      <P>You agree not to:</P>
      <UL>
        <LI>Use the service for any unlawful purpose or in violation of any applicable laws</LI>
        <LI>Attempt to gain unauthorized access to any part of the platform or our systems</LI>
        <LI>Use automated tools to scrape, crawl, or extract data from the platform</LI>
        <LI>Upload documents that you do not have the right to share</LI>
        <LI>Provide false financial information to manipulate diagnostic results</LI>
        <LI>Resell or redistribute the service or outputs without our written consent</LI>
        <LI>Interfere with or disrupt the integrity or performance of the service</LI>
      </UL>

      <H2 n={5}>Subscription and billing</H2>

      <p style={{ fontWeight: 600, color: "#333", marginBottom: ".5rem", fontSize: 15 }}>Free tier</p>
      <P>Fruxal offers a free prescan and limited diagnostic functionality at no cost. Free tier features are provided &ldquo;as is&rdquo; without any uptime guarantees or support commitments.</P>

      <p style={{ fontWeight: 600, color: "#333", marginBottom: ".5rem", fontSize: 15 }}>Paid subscriptions</p>
      <P>Paid plans are billed monthly in Canadian dollars through Stripe. Current pricing is displayed at fruxal.vercel.app/pricing. By subscribing, you authorize Fruxal to charge your payment method on a recurring monthly basis until you cancel.</P>

      <p style={{ fontWeight: 600, color: "#333", marginBottom: ".5rem", fontSize: 15 }}>Cancellation</p>
      <P>You may cancel your subscription at any time from Settings → Billing. Cancellation takes effect at the end of your current billing period. We do not issue refunds for partial months.</P>

      <p style={{ fontWeight: 600, color: "#333", marginBottom: ".5rem", fontSize: 15 }}>Failed payments</p>
      <P>If your payment fails, you will receive an email notification. You have a 3-day grace period during which your paid access continues. If payment is not updated within 3 days, your account will be downgraded to the free tier. Your data is never deleted due to billing issues — it will be waiting if you resubscribe.</P>

      <p style={{ fontWeight: 600, color: "#333", marginBottom: ".5rem", fontSize: 15 }}>Price changes</p>
      <P>We may change subscription prices with 30 days&rsquo; notice. Continued use of the paid service after the notice period constitutes acceptance of the new price.</P>

      <H2 n={6}>AI-generated content disclaimer</H2>
      <div style={{
        background: "#FFF9ED", border: "1px solid #F5E6BA", borderRadius: 8,
        padding: "1rem 1.25rem", marginBottom: "1.5rem",
      }}>
        <p style={{ fontWeight: 600, color: "#7A5C00", fontSize: 15, marginBottom: ".5rem" }}>Important notice</p>
        <p style={{ lineHeight: 1.75, color: "#5C4500", fontSize: 14, margin: 0 }}>
          Fruxal uses AI to analyze financial data and generate recommendations. These recommendations are <strong>informational only</strong> and do not constitute financial, legal, tax, or accounting advice. The findings are estimates based on the data you provide and industry benchmarks — they are not guarantees of actual savings or performance. Always consult a qualified professional (accountant, CPA, lawyer, or financial advisor) before making significant financial decisions based on Fruxal&apos;s outputs.
        </p>
      </div>
      <P>
        Fruxal&apos;s diagnostic outputs are generated by AI and may contain errors, inaccuracies, or omissions. We do not warrant the accuracy, completeness, or suitability of any AI-generated content for your specific situation.
      </P>

      <H2 n={7}>Data and privacy</H2>
      <P>Your use of Fruxal is also governed by our <a href="/legal/privacy" style={{ color: "#1B3A2D" }}>Privacy Policy</a>, which is incorporated into these Terms by reference. By using the service, you consent to our collection and use of your information as described in the Privacy Policy.</P>

      <H2 n={8}>Intellectual property</H2>
      <P>
        Fruxal and its content, features, and functionality are and will remain the exclusive property of Fruxal Inc. You may not copy, modify, distribute, sell, or lease any part of our service or the software underlying it without our prior written consent.
      </P>
      <P>
        You retain ownership of the financial data you provide to Fruxal. By using the service, you grant us a limited, non-exclusive license to process your data for the purpose of providing the diagnostic service.
      </P>

      <H2 n={9}>Limitation of liability</H2>
      <P>
        To the maximum extent permitted by applicable law, Fruxal and its officers, employees, agents, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use the service, even if we have been advised of the possibility of such damages.
      </P>
      <P>
        <strong>Fruxal&apos;s total cumulative liability to you for any claims arising out of or relating to these Terms or the service shall not exceed the total amounts you paid to Fruxal in the 12 months prior to the claim.</strong>
      </P>
      <P>Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for certain damages. In such jurisdictions, our liability is limited to the fullest extent permitted by law.</P>

      <H2 n={10}>Governing law</H2>
      <P>
        These Terms are governed by and construed in accordance with the laws of the Province of Quebec and the federal laws of Canada applicable therein, without regard to conflict of law principles. The Civil Code of Quebec applies to the interpretation of these Terms.
      </P>

      <H2 n={11}>Dispute resolution</H2>
      <P>
        If you have a dispute with Fruxal, we encourage you to contact us first at <a href="mailto:support@fruxal.ca" style={{ color: "#1B3A2D" }}>support@fruxal.ca</a> to resolve it informally. If informal resolution fails, disputes shall be resolved by binding arbitration administered in Quebec City, Quebec, under the arbitration rules of the Quebec National Arbitration Centre, except that either party may seek injunctive relief in a court of competent jurisdiction.
      </P>

      <H2 n={12}>Changes to these terms</H2>
      <P>
        We may update these Terms from time to time. We will notify you of material changes by email and by posting a notice on the platform at least 14 days before the changes take effect. Your continued use of the service after the effective date constitutes acceptance of the updated Terms. If you do not agree to the changes, you must cancel your account before they take effect.
      </P>

      <div style={{
        marginTop: "3rem", paddingTop: "1.5rem",
        borderTop: "1px solid #E8E6E1", fontSize: 13, color: "#888",
      }}>
        <p>Questions? Contact us at <a href="mailto:support@fruxal.ca" style={{ color: "#1B3A2D" }}>support@fruxal.ca</a></p>
        <p style={{ marginTop: ".5rem" }}>Fruxal Inc. · Quebec, Canada · {EFFECTIVE}</p>
      </div>
    </div>
  );
}
