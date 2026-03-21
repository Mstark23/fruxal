// =============================================================================
// NOTIFICATION ENGINE — Right message, right time
// =============================================================================
// Rule: Every notification has a dollar amount or metric. Never "just checking in."
// =============================================================================

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type NotificationType =
  | "first_scan"      // Day 1: after scan
  | "nudge"           // Day 3: hasn't returned
  | "conversion"      // Day 7: free user
  | "weekly"          // Every Monday
  | "monthly_scan"    // After re-scan
  | "leak_worsened"   // Event: metric got worse
  | "leak_fixed"      // Event: metric improved
  | "team_fix"        // Event: teammate fixed something
  | "quarterly"       // Every 90 days
  | "annual";         // 12-month anniversary

export interface Notification {
  id: string;
  businessId: string;
  type: NotificationType;
  priority: "critical" | "alert" | "nudge" | "routine" | "celebration" | "report";
  title: string;
  body: string;
  cta: string;
  ctaUrl: string;
  channel: "email" | "push" | "both";
  sentAt: string | null;
  readAt: string | null;
}

// Generate notification based on type and business data
export function generateNotification(
  type: NotificationType,
  businessId: string,
  data: {
    totalLeaking?: number;
    totalSaved?: number;
    healthScore?: number;
    leakCount?: number;
    urgentCount?: number;
    fixListCount?: number;
    newLeaks?: number;
    improvedLeaks?: number;
    worsenedMetric?: string;
    worsenedFrom?: string;
    worsenedTo?: string;
    fixedMetric?: string;
    fixedSavings?: number;
    teamMember?: string;
    roi?: number;
  }
): Notification {
  const id = `${businessId}-${type}-${Date.now()}`;
  const base = { id, businessId: businessId, sentAt: null, readAt: null };

  switch (type) {
    case "first_scan":
      return {
        ...base, type, priority: "critical", channel: "both",
        title: `We found $${(data.totalLeaking ?? 0).toLocaleString()} leaking from your business`,
        body: `${data.urgentCount} urgent leaks need attention. Open your dashboard to see exactly where the money is going.`,
        cta: "See Your Leaks", ctaUrl: "/dashboard",
      };
    case "nudge":
      const daily = Math.round((data.totalLeaking ?? 0) / 365);
      return {
        ...base, type, priority: "nudge", channel: "email",
        title: `Your $${(data.totalLeaking ?? 0).toLocaleString()} is still leaking`,
        body: `Every day you wait costs $${daily}. The average user fixes their first leak in 48 hours.`,
        cta: "Fix Your First Leak", ctaUrl: "/dashboard?tab=fixlist",
      };
    case "conversion":
      return {
        ...base, type, priority: "nudge", channel: "email",
        title: `${data.leakCount ? data.leakCount - 3 : 11} more leaks you have not seen yet`,
        body: `$99/mo to save $${(data.totalLeaking ?? 0).toLocaleString()}/yr. That math speaks for itself.`,
        cta: "Unlock Everything", ctaUrl: "/dashboard?upgrade=true",
      };
    case "weekly":
      return {
        ...base, type, priority: "routine", channel: "push",
        title: `Weekly check-in: ${data.fixListCount ?? 0} items on your fix list`,
        body: `Your biggest open leak is worth addressing this week.`,
        cta: "Open Fix List", ctaUrl: "/dashboard?tab=fixlist",
      };
    case "monthly_scan":
      return {
        ...base, type, priority: "routine", channel: "both",
        title: `Monthly scan complete: ${data.newLeaks ?? 0} new, ${data.improvedLeaks ?? 0} improved`,
        body: `Health score: ${data.healthScore ?? 0}. Total saved: $${(data.totalSaved ?? 0).toLocaleString()}.`,
        cta: "See Full Report", ctaUrl: "/dashboard?tab=trends",
      };
    case "leak_worsened":
      return {
        ...base, type, priority: "alert", channel: "push",
        title: `${data.worsenedMetric || "A metric"} just got worse`,
        body: `Was ${data.worsenedFrom}, now ${data.worsenedTo}. Time to address this.`,
        cta: "Fix This Now", ctaUrl: "/dashboard?tab=fixlist",
      };
    case "leak_fixed":
      return {
        ...base, type, priority: "celebration", channel: "push",
        title: `${data.fixedMetric || "A leak"} just hit your target!`,
        body: `That fix saved $${(data.fixedSavings ?? 0).toLocaleString()}/yr.`,
        cta: "See Your Progress", ctaUrl: "/dashboard?tab=trends",
      };
    case "team_fix":
      return {
        ...base, type, priority: "celebration", channel: "push",
        title: `${data.teamMember || "A team member"} fixed a leak`,
        body: `Estimated savings: $${(data.fixedSavings ?? 0).toLocaleString()}/yr.`,
        cta: "View Team Progress", ctaUrl: "/dashboard?tab=team",
      };
    case "quarterly":
      return {
        ...base, type, priority: "report", channel: "email",
        title: `Quarterly report: $${(data.totalSaved ?? 0).toLocaleString()} recovered`,
        body: `${data.roi ?? 0}x your subscription cost.`,
        cta: "Download Full Report", ctaUrl: "/dashboard?tab=reports",
      };
    case "annual":
      return {
        ...base, type, priority: "report", channel: "email",
        title: `Your Year in Review: $${(data.totalSaved ?? 0).toLocaleString()} recovered`,
        body: `${data.roi ?? 0}x ROI. From leaking to leading.`,
        cta: "See Your Year", ctaUrl: "/dashboard?tab=reports",
      };
  }
}

// Get notifications for a business
export async function getNotifications(businessId: string, limit = 20) {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("businessId", businessId)
    .order("createdAt", { ascending: false })
    .limit(limit);
  return data || [];
}

// Mark notification as read
export async function markRead(notificationId: string) {
  await supabase
    .from("notifications")
    .update({ readAt: new Date().toISOString() })
    .eq("id", notificationId);
}
