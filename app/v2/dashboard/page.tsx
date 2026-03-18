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
    const params = new URLSearchParams(window.location.search);
    const rid    = params.get("prescanRunId");
    const paid   = params.get("paid"); // from Stripe success_url: ?paid=business&session_id=xxx
    const suffix = rid ? "?prescanRunId=" + rid : "";

    // 0. Handle post-Stripe return — ?paid=plan means webhook may not have fired yet
    // Set localStorage immediately so user sees correct dashboard without waiting for webhook
    if (paid) {
      try {
        const tierFromPayment = paid === "enterprise" ? "enterprise"
          : paid === "business" || paid === "advisor" || paid === "team" ? "business"
          : paid === "solo" || paid === "report" ? "solo"
          : null;
        if (tierFromPayment) {
          localStorage.setItem("fruxal_tier", tierFromPayment);
          sessionStorage.setItem("fruxal_session_tier", tierFromPayment);
        }
      } catch {}
    }

    // 1. Check localStorage first — fastest path, no API call needed
    // If already set, trust it completely and never override downward to solo
    try {
      const stored = localStorage.getItem("fruxal_tier");
      if (stored === "enterprise") { router.replace("/v2/dashboard/enterprise" + suffix); return; }
      if (stored === "business")   { router.replace("/v2/dashboard/business"   + suffix); return; }
      if (stored === "solo")       { router.replace("/v2/dashboard/solo"        + suffix); return; }
    } catch {}

    // 2. Check document.referrer — if coming from business dashboard, go back there
    try {
      const ref = document.referrer || "";
      if (ref.includes("/v2/dashboard/business") || ref.includes("/v2/obligations") || ref.includes("/v2/leaks") || ref.includes("/v2/programs")) {
        // User was navigating within the app — check sessionStorage for their tier
        const cached = sessionStorage.getItem("fruxal_session_tier");
        if (cached === "business")   { router.replace("/v2/dashboard/business"   + suffix); return; }
        if (cached === "enterprise") { router.replace("/v2/dashboard/enterprise" + suffix); return; }
      }
    } catch {}

    // 2. Check sessionStorage prescan result (new registration flow)
    try {
      const raw = sessionStorage.getItem("lg_prescan_result");
      if (raw && rid) {
        const p   = JSON.parse(raw);
        const rev = p.inputs?.annualRevenue || 0;
        const emp = p.inputs?.employeeCount || 0;
        const plan = (p.tier || "").toLowerCase();
        if (rev >= 1_000_000 || emp >= 50 || plan === "enterprise") { router.replace("/v2/dashboard/enterprise" + suffix); return; }
        if (rev >= 150_000   || emp >= 3  || ["business","growth","team"].includes(plan)) { router.replace("/v2/dashboard/business" + suffix); return; }
      }
    } catch {}

    // 3. Call API — use recommended_plan (revenue-based) not just paid tier
    fetch(rid ? "/api/v2/dashboard?prescanRunId=" + rid : "/api/v2/dashboard")
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        const tier  = (json?.data?.tier             || "free").toLowerCase();
        const plan  = (json?.data?.recommended_plan || "solo").toLowerCase();
        // Enterprise routing: ONLY from paid tier — never from recommended_plan alone.
        // recommended_plan="enterprise" means high revenue but not paid enterprise.
        // Treat plan="enterprise" unpaid as business (they qualify, they just haven't paid up).
        const eff = (tier === "enterprise" || tier === "corp") ? "enterprise"
                  : (tier === "business" || tier === "growth" || tier === "team") ? "business"
                  : (plan === "business" || plan === "enterprise") ? "business"
                  : "solo";
        // Persist so next nav click skips the API call
        try { if (eff !== "solo") localStorage.setItem("fruxal_tier", eff); } catch {}
        if      (eff === "enterprise") router.replace("/v2/dashboard/enterprise" + suffix);
        else if (eff === "business")   router.replace("/v2/dashboard/business"   + suffix);
        else                           router.replace("/v2/dashboard/solo"        + suffix);
      })
      .catch(() => router.replace("/v2/dashboard/solo" + suffix));
  }, [authLoading]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );
}
