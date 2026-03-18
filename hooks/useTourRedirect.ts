// =============================================================================
// src/hooks/useTourRedirect.ts
// =============================================================================
// Hook that checks if the current user should be redirected to the tour.
//
// Use in dashboard layout or any post-login page:
//   const { checking } = useTourRedirect();
//   if (checking) return <Loading />;
//
// Logic:
//   1. Skip if already checked this session (sessionStorage flag)
//   2. Skip if URL has prescanRunId (came from prescan → register flow)
//   3. Fetch /api/v2/tour/check
//   4. If should_show_tour = true → redirect to /v2/tour
//   5. If false → do nothing, user stays on current page
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useTourRedirect(skip?: boolean) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Skip if told to (e.g., already on tour page)
    if (skip) {
      setChecking(false);
      return;
    }

    if (typeof window !== "undefined") {
      // Skip if already checked this session
      if (window.sessionStorage.getItem("tour_checked")) {
        setChecking(false);
        return;
      }

      // Skip if URL has prescanRunId — user just registered from prescan flow.
      // The prescan already showed them their results; tour would be redundant.
      const params = new URLSearchParams(window.location.search);
      if (params.has("prescanRunId")) {
        window.sessionStorage.setItem("tour_checked", "1");
        setChecking(false);
        return;
      }
    }

    async function check() {
      try {
        const res = await fetch("/api/v2/tour/check");
        const json = await res.json();

        if (json.success && json.should_show_tour) {
          router.replace("/v2/tour");
          return; // Don't set checking=false, let redirect happen
        }
      } catch (err) {
        console.error("[TourRedirect] Error:", err);
      }

      // Mark as checked so we don't re-check
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("tour_checked", "1");
      }
      setChecking(false);
    }

    check();
  }, [router, skip]);

  return { checking };
}
