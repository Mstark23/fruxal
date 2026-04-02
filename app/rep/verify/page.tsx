// app/rep/verify/page.tsx
// Client component — calls the verify API, then redirects
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyInner() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      window.location.href = "/rep/login?error=missing_token";
      return;
    }

    fetch(`/api/rep/auth/verify?token=${encodeURIComponent(token)}`)
      .then(res => {
        if (res.redirected) {
          // The API set the cookie and returned a redirect
          window.location.href = res.url;
          return;
        }
        // If not redirected, check if it's HTML (the old verify route returns HTML)
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("text/html")) {
          // Cookie was set via Set-Cookie header, redirect manually
          setStatus("success");
          window.location.href = "/rep/dashboard";
          return;
        }
        return res.json();
      })
      .then(j => {
        if (j?.error) {
          setStatus("error");
          setErrorMsg(j.error);
        } else if (status !== "success") {
          setStatus("success");
          window.location.href = "/rep/dashboard";
        }
      })
      .catch(() => {
        // Likely a redirect happened (good) or network error
        // Try navigating to dashboard — if cookie was set, it'll work
        setTimeout(() => { window.location.href = "/rep/dashboard"; }, 1000);
      });
  }, [token]);

  if (status === "error") {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 360, padding: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(179,64,64,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ color: "#B34040", fontSize: 20 }}>!</span>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A18", margin: "0 0 8px" }}>Access Error</h2>
          <p style={{ fontSize: 13, color: "#8E8C85", margin: 0 }}>{errorMsg || "This login link has expired. Ask your admin to resend access."}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 24, height: 24, border: "2px solid #E5E3DD", borderTopColor: "#1B3A2D", borderRadius: "50%", animation: "sp .7s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1B3A2D" }}>Signing you in...</p>
        <p style={{ fontSize: 13, color: "#8E8C85", marginTop: 4 }}>Redirecting to your dashboard.</p>
        <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

export default function RepVerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: "2px solid #E5E3DD", borderTopColor: "#1B3A2D", borderRadius: "50%", animation: "sp .7s linear infinite" }} />
        <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <VerifyInner />
    </Suspense>
  );
}
