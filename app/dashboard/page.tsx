"use client";
import { useEffect } from "react";

export default function DashboardRedirect() {
  useEffect(() => {
    const params = window.location.search;
    window.location.replace(`/v2/dashboard${params}`);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #E8E6E1", borderTop: "2px solid #1B3A2D", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
