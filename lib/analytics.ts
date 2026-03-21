// =============================================================================
// ANALYTICS — Event tracking
// =============================================================================
// Set NEXT_PUBLIC_POSTHOG_KEY in env to enable PostHog
// Falls back to console.log in dev
// =============================================================================

const POSTHOG_KEY = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_KEY : undefined;
let posthog: any = null;

export async function initAnalytics() {
  if (typeof window === "undefined" || !POSTHOG_KEY) return;
  try {
    const ph = await import("posthog-js");
    ph.default.init(POSTHOG_KEY, {
      api_host: "https://us.i.posthog.com",
      loaded: (p) => { posthog = p; },
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
    });
    posthog = ph.default;
  } catch (e) {
    // PostHog not installed
  }
}

export function track(event: string, properties?: Record<string, any>) {
  if (posthog) {
    posthog.capture(event, properties);
  } else if (process.env.NODE_ENV === "development") {
    (process.env.NODE_ENV as string) !== "production" && console.log(`[Analytics] ${event}`, properties);
  }
}

export function identify(userId: string, traits?: Record<string, any>) {
  if (posthog) {
    posthog.identify(userId, traits);
  }
}

// Pre-built event helpers
export const analytics = {
  scanStarted: (industry: string) => track("scan_started", { industry }),
  scanCompleted: (industry: string, leakCount: number, totalAmount: number) => track("scan_completed", { industry, leakCount, totalAmount }),
  leakFixed: (leakId: string, amount: number) => track("leak_fixed", { leakId, amount }),
  affiliateClicked: (partnerId: string, category: string) => track("affiliate_clicked", { partnerId, category }),
  upgradeStarted: (plan: string) => track("upgrade_started", { plan }),
  upgradeCompleted: (plan: string) => track("upgrade_completed", { plan }),
  reportDownloaded: (type: string) => track("report_downloaded", { type }),
  deepAnalysisRun: () => track("deep_analysis_run"),
  chatMessage: () => track("chat_message_sent"),
  referralShared: () => track("referral_shared"),
  pageView: (page: string) => track("$pageview", { page }),
};
