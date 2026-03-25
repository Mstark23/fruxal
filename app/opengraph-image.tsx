import { ImageResponse } from "next/og";

export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt         = "Fruxal — Financial Diagnostics for Canadian SMBs";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          background: "#FAFAF8",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 100px",
          position: "relative",
        }}
      >
        {/* Logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 48 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 14,
            background: "#1B3A2D",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
            </svg>
          </div>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#1A1A18", letterSpacing: "-0.5px", display: "flex" }}>
            Fruxal
          </span>
        </div>

        {/* Headline */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          fontSize: 62, fontWeight: 400, color: "#1A1A18",
          lineHeight: 1.1, letterSpacing: "-2px", maxWidth: 900, marginBottom: 32,
        }}>
          Your business is leaking money. Find out how much.
        </div>

        {/* Sub */}
        <div style={{
          display: "flex",
          fontSize: 26, color: "#56554F", maxWidth: 700, lineHeight: 1.5,
        }}>
          Free AI-powered financial diagnostics for Canadian SMBs.
        </div>

        {/* Badge */}
        <div style={{
          display: "flex",
          position: "absolute", bottom: 60, right: 100,
          background: "#1B3A2D", borderRadius: 100,
          padding: "10px 24px",
          fontSize: 18, fontWeight: 700, color: "white",
        }}>
          fruxal.ca · Free forever
        </div>
      </div>
    ),
    { ...size }
  );
}
