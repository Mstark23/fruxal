"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Skip if already on onboarding, tour, or prescan page
    if (
      pathname?.startsWith("/v2/onboarding") ||
      pathname?.startsWith("/v2/tour") ||
      pathname?.startsWith("/v2/prescan")
    ) {
      setChecked(true);
      return;
    }

    // Skip if user just registered — prescan bridge already has the data,
    // don't make them answer the same questions again
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("lg_just_registered")) {
        sessionStorage.removeItem("lg_just_registered");
        setChecked(true);
        return;
      }

      // Skip if URL has prescanRunId (came from prescan → register flow)
      const params = new URLSearchParams(window.location.search);
      if (params.has("prescanRunId")) {
        setChecked(true);
        return;
      }
    }

    async function check() {
      try {
        const res = await fetch("/api/v2/onboarding/status");
        const json = await res.json();

        if (json.success && !json.onboarding_completed) {
          router.replace("/v2/onboarding");
          return;
        }
      } catch {
        // On error, don't block — let user through
      }
      setChecked(true);
    }

    check();
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
