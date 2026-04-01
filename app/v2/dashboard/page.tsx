// =============================================================================
// app/v2/dashboard/page.tsx — TIER ROUTER
// =============================================================================
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardRouter() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const rid    = params.get("prescanRunId");
      const paid   = params.get("paid"); // from Stripe success_url: ?paid=business&session_id=xxx
      const sessionId = params.get("session_id");
      const suffix = rid ? "?prescanRunId=" + rid : "";

      // ── Check if user needs onboarding (no business profile yet) ──
      // Skip check if they have a prescanRunId (prescan flow creates profile automatically)
      // or if they just paid (returning from Stripe)
      if (!rid && !paid) {
        const onboardingChecked = sessionStorage.getItem("fruxal_onboarding_checked");
        if (!onboardingChecked) {
          try {
            const res = await fetch("/api/v2/onboarding/status");
            const d = res.ok ? await res.json() : null;
            sessionStorage.setItem("fruxal_onboarding_checked", "1");
            if (d && d.success && !d.onboarding_completed && !d.businessId) {
              router.replace("/v2/onboarding");
              return; // Stop — don't proceed to tier routing
            }
          } catch {
            sessionStorage.setItem("fruxal_onboarding_checked", "1");
          }
        }
      }

      // 0. Handle post-Stripe return — only trust ?paid when session_id is also present
      // This prevents URL spoofing (someone appending ?paid=enterprise to skip tiers)
      if (paid && sessionId) {
        fetch("/api/v2/payment-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }).catch(() => { /* non-blocking — webhook handles truth */ });

        try {
          const tierFromPayment = paid === "enterprise" ? "enterprise"
            : paid === "business" || paid === "advisor" || paid === "team" ? "business"
            : paid === "solo" || paid === "report" ? "solo"
            : null;
          if (tierFromPayment) {
            localStorage.setItem("fruxal_tier", tierFromPayment);
            sessionStorage.setItem("fruxal_session_tier", tierFromPayment);
          }
        } catch { /* non-fatal */ }
      }

      // 1. Check localStorage first — fastest path, no API call needed
      try {
        const stored = localStorage.getItem("fruxal_tier");
        if (stored === "enterprise") { router.replace("/v2/dashboard/enterprise" + suffix); return; }
        if (stored === "business")   { router.replace("/v2/dashboard/business"   + suffix); return; }
        if (stored === "solo")       { router.replace("/v2/dashboard/solo"        + suffix); return; }
      } catch { /* non-fatal */ }

      // 2. Check document.referrer — if coming from business dashboard, go back there
      try {
        const ref = document.referrer || "";
        if (ref.includes("/v2/dashboard/business") || ref.includes("/v2/obligations") || ref.includes("/v2/leaks") || ref.includes("/v2/programs")) {
          const cached = sessionStorage.getItem("fruxal_session_tier");
          if (cached === "business")   { router.replace("/v2/dashboard/business"   + suffix); return; }
          if (cached === "enterprise") { router.replace("/v2/dashboard/enterprise" + suffix); return; }
        }
      } catch { /* non-fatal */ }

      // 3. Check sessionStorage prescan result (new registration flow + returning users)
      try {
        const raw = sessionStorage.getItem("lg_prescan_result");
        if (raw) {
          const p   = JSON.parse(raw);
          const rev = p.inputs?.annualRevenue ?? 0;
          const emp = p.inputs?.employeeCount ?? 0;
          const plan = (p.tier || "").toLowerCase();
          if (rev >= 1_000_000 || emp >= 50 || plan === "enterprise") { router.replace("/v2/dashboard/enterprise" + suffix); return; }
          if (rev >= 150_000   || emp >= 3  || ["business","growth","team"].includes(plan)) { router.replace("/v2/dashboard/business" + suffix); return; }
        }
      } catch { /* non-fatal */ }

      // 4. Call API — use recommended_plan (revenue-based) not just paid tier
      try {
        const res = await fetch(rid ? "/api/v2/dashboard?prescanRunId=" + rid : "/api/v2/dashboard");
        const json = res.ok ? await res.json() : null;
        const tier  = (json?.data?.tier             || "free").toLowerCase();
        const plan  = (json?.data?.recommended_plan || "solo").toLowerCase();
        const eff = (tier === "enterprise" || tier === "corp" || plan === "enterprise") ? "enterprise"
                  : (tier === "business" || tier === "growth" || tier === "team" || plan === "business") ? "business"
                  : "solo";
        try { localStorage.setItem("fruxal_tier", eff); } catch { /* non-fatal */ }
        if      (eff === "enterprise") router.replace("/v2/dashboard/enterprise" + suffix);
        else if (eff === "business")   router.replace("/v2/dashboard/business"   + suffix);
        else                           router.replace("/v2/dashboard/solo"        + suffix);
      } catch {
        router.replace("/v2/dashboard/solo" + suffix);
      }
    };

    run();
  }, [authLoading]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );
}
