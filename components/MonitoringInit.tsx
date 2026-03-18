"use client";
import { useEffect } from "react";

export function MonitoringInit() {
  useEffect(() => {
    // Initialize Sentry
    import("@/lib/sentry").then(s => s.initSentry()).catch(() => {});
    // Initialize PostHog analytics
    import("@/lib/analytics").then(a => a.initAnalytics()).catch(() => {});
  }, []);
  return null;
}
