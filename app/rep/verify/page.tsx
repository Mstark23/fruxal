// app/rep/verify/page.tsx
// Simple redirect to the API verify route which sets the cookie
"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyInner() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/rep/login?error=missing_token";
      return;
    }
    // Navigate directly to the API route — it sets the cookie and returns HTML that redirects
    window.location.href = `/api/rep/auth/verify?token=${encodeURIComponent(token)}`;
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 24, height: 24, border: "2px solid #E5E3DD", borderTopColor: "#1B3A2D", borderRadius: "50%", animation: "sp .7s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1B3A2D" }}>Signing you in...</p>
        <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

export default function RepVerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#FAFAF8" }} />}>
      <VerifyInner />
    </Suspense>
  );
}
