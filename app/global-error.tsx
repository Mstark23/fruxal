"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ background: "#0a0e17", color: "white", fontFamily: "system-ui", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>{error.message || "An unexpected error occurred"}</p>
          <button onClick={reset} style={{ background: "#00c853", color: "black", fontWeight: 700, padding: "12px 32px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14 }}>
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
