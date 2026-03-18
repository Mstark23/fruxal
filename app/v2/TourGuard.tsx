"use client";

import { usePathname } from "next/navigation";
import { useTourRedirect } from "@/hooks/useTourRedirect";

// Paths where tour redirect should never fire
const SKIP_TOUR_PATHS = [
  "/v2/tour",
  "/v2/onboarding",
  "/v2/dashboard/enterprise",
  "/v2/diagnostic/intake",
  "/v2/diagnostic/run",
  "/v2/tier3",
  "/rep/",
  "/tier3/",
  "/admin/",
];

export function TourGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Skip tour check for enterprise flow, rep portal, admin, and tour itself
  const skipCheck = SKIP_TOUR_PATHS.some(p => pathname?.startsWith(p));
  const { checking } = useTourRedirect(skipCheck);

  // Don't block rendering for skipped paths
  if (skipCheck) return <>{children}</>;

  if (checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
