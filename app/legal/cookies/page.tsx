// =============================================================================
// app/legal/cookies/page.tsx
// =============================================================================
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — Fruxal",
  description: "What cookies Fruxal uses and why.",
};

export default function CookiesPage() {
  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".5rem" }}>Legal</p>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: ".5rem" }}>Cookie Policy</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: "2.5rem" }}>Last updated: March 22, 2026</p>

      <p style={{ lineHeight: 1.75, color: "#444", fontSize: 15, marginBottom: "1rem" }}>
        This Cookie Policy explains what cookies are, what cookies Fruxal uses, and your choices regarding cookies.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: "2rem", marginBottom: ".75rem", color: "#1a1a1a" }}>What are cookies?</h2>
      <p style={{ lineHeight: 1.75, color: "#444", fontSize: 15, marginBottom: "1rem" }}>
        Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work and to provide information to website owners.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: "2rem", marginBottom: ".75rem", color: "#1a1a1a" }}>Cookies we use</h2>

      <table style={{
        width: "100%", borderCollapse: "collapse", fontSize: 14,
        marginBottom: "2rem",
      }}>
        <thead>
          <tr style={{ background: "#F7F7F5" }}>
            <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #E8E6E1", color: "#333", fontWeight: 600 }}>Cookie</th>
            <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #E8E6E1", color: "#333", fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #E8E6E1", color: "#333", fontWeight: 600 }}>Duration</th>
            <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #E8E6E1", color: "#333", fontWeight: 600 }}>Required</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["next-auth.session-token", "Keeps you logged in between page loads", "Session / 30 days", "Yes"],
            ["next-auth.csrf-token", "Security — prevents cross-site request forgery", "Session", "Yes"],
            ["next-auth.callback-url", "Redirects you to the correct page after login", "Session", "Yes"],
            ["fruxal_lang", "Remembers your language preference (EN/FR)", "1 year", "No"],
            ["_vercel_analytics", "Anonymized page performance data (Vercel)", "90 days", "No"],
          ].map(([name, purpose, duration, required]) => (
            <tr key={name} style={{ borderBottom: "1px solid #F0EFEB" }}>
              <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 12, color: "#1B3A2D" }}>{name}</td>
              <td style={{ padding: "10px 12px", color: "#555" }}>{purpose}</td>
              <td style={{ padding: "10px 12px", color: "#555" }}>{duration}</td>
              <td style={{ padding: "10px 12px" }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                  background: required === "Yes" ? "#E8F5EE" : "#F5F5F5",
                  color: required === "Yes" ? "#1B3A2D" : "#666",
                }}>{required}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: "2rem", marginBottom: ".75rem", color: "#1a1a1a" }}>What we do NOT use</h2>
      <ul style={{ paddingLeft: "1.25rem", color: "#444", lineHeight: 1.9, fontSize: 15, marginBottom: "1rem" }}>
        <li>No advertising or retargeting cookies</li>
        <li>No third-party tracking pixels (Meta, Google Ads, etc.)</li>
        <li>No social media tracking cookies</li>
        <li>No cookies that share your data with advertisers</li>
      </ul>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: "2rem", marginBottom: ".75rem", color: "#1a1a1a" }}>Your choices</h2>
      <p style={{ lineHeight: 1.75, color: "#444", fontSize: 15, marginBottom: "1rem" }}>
        <strong>Required cookies</strong> cannot be disabled — without them, you cannot log in or use the service.
      </p>
      <p style={{ lineHeight: 1.75, color: "#444", fontSize: 15, marginBottom: "1rem" }}>
        <strong>Optional cookies</strong> (language preference, analytics) can be cleared through your browser settings. Clearing them will not affect your ability to use Fruxal, but your language preference will reset to the default.
      </p>
      <p style={{ lineHeight: 1.75, color: "#444", fontSize: 15, marginBottom: "1rem" }}>
        To manage cookies, see the help documentation for your browser: <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: "#1B3A2D" }}>Chrome</a>, <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer" style={{ color: "#1B3A2D" }}>Firefox</a>, <a href="https://support.apple.com/en-ca/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: "#1B3A2D" }}>Safari</a>.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: "2rem", marginBottom: ".75rem", color: "#1a1a1a" }}>Contact</h2>
      <p style={{ lineHeight: 1.75, color: "#444", fontSize: 15 }}>
        Questions about cookies? Email <a href="mailto:privacy@fruxal.ca" style={{ color: "#1B3A2D" }}>privacy@fruxal.ca</a>.
        See also our full <a href="/legal/privacy" style={{ color: "#1B3A2D" }}>Privacy Policy</a>.
      </p>
    </div>
  );
}
