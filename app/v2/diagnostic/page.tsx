"use client";
// =============================================================================
// app/v2/diagnostic/page.tsx — Smart diagnostic router
// - Has a completed report? → go to /v2/diagnostic/[id]
// - No report yet? → go to /v2/diagnostic/intake
// Shows a brief loading spinner while checking. Never re-runs intake.
// =============================================================================

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DiagnosticRouter() {
  const router = useRouter();

  useEffect(() => {
    // Try the latest completed report first
    fetch("/api/v2/diagnostic/latest")
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.success && json?.data?.id) {
          // Existing report — go straight to it
          router.replace(`/v2/diagnostic/${json.data.id}`);
        } else {
          // No completed report — go to intake
          router.replace("/v2/diagnostic/intake");
        }
      })
      .catch(() => {
        // On any error, fall back to intake
        router.replace("/v2/diagnostic/intake");
      });
  }, []);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );
}
