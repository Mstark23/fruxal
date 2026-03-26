// =============================================================================
// app/legal/layout.tsx
// =============================================================================
import Link from "next/link";

const NAV = [
  { label: "Privacy Policy",  href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Cookie Policy",   href: "/legal/cookies" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid #E8E6E1", background: "#fff",
        padding: "0 1.5rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56,
      }}>
        <Link href="/" style={{
          fontWeight: 700, fontSize: 17, color: "#1B3A2D", textDecoration: "none",
        }}>
          Fruxal
        </Link>
        <nav style={{ display: "flex", gap: 24 }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} style={{
              fontSize: 13, color: "#6B6B6B", textDecoration: "none",
            }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Body */}
      <div style={{
        maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem 5rem",
      }}>
        {children}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #E8E6E1", padding: "1.5rem", textAlign: "center",
        fontSize: 12, color: "#888",
      }}>
        © 2026 Fruxal Inc. · Quebec, Canada ·{" "}
        <a href="mailto:privacy@fruxal.ca" style={{ color: "#1B3A2D" }}>privacy@fruxal.ca</a>
      </footer>
    </div>
  );
}
