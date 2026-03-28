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
        body: `${data.urgentCount} urgent leaks identified. Run your full intake so your rep can start recovering this money.`,
        cta: "See Your Leaks", ctaUrl: "/v2/leaks",
      };
    case "nudge":
      const daily = Math.round((data.totalLeaking ?? 0) / 365);
      return {
        ...base, type, priority: "nudge", channel: "email",
        title: `Your $${(data.totalLeaking ?? 0).toLocaleString()} is still leaking`,
        body: `Every day costs $${daily}. Run your intake so your rep can start recovering it — no cost until money is confirmed.`,
        cta: "Run My Intake", ctaUrl: "/v2/diagnostic/intake",
      };
    case "conversion":
      return {
        ...base, type, priority: "nudge", channel: "email",
        title: `${data.leakCount ? data.leakCount - 3 : 11} more leaks in your full diagnostic`,
        body: `Your intake is free. Run it so your rep has the full picture — we only charge 12% of what we actually recover.`,
        cta: "Run My Intake", ctaUrl: "/v2/diagnostic/intake",
      };
    case "weekly":
      return {
        ...base, type, priority: "routine", channel: "push",
        title: `Weekly update: $${(data.totalLeaking ?? 0).toLocaleString()} still identified`,
        body: `Your rep is working your file. Check your recovery status for updates.`,
        cta: "View Recovery", ctaUrl: "/v2/recovery",
      };
    case "monthly_scan":
      return {
        ...base, type, priority: "routine", channel: "both",
        title: `Monthly scan complete: ${data.newLeaks ?? 0} new, ${data.improvedLeaks ?? 0} improved`,
        body: `Health score: ${data.healthScore ?? 0}. Confirmed recovered: $${(data.totalSaved ?? 0).toLocaleString()}.`,
        cta: "View My Recovery", ctaUrl: "/v2/recovery",
      };
    case "leak_worsened":
      return {
        ...base, type, priority: "alert", channel: "push",
        title: `${data.worsenedMetric || "A metric"} just got worse`,
        body: `Was ${data.worsenedFrom}, now ${data.worsenedTo}. Your rep has been flagged.`,
        cta: "View Leaks", ctaUrl: "/v2/leaks",
      };
    case "leak_fixed":
      return {
        ...base, type, priority: "celebration", channel: "push",
        title: `$${(data.fixedSavings ?? 0).toLocaleString()}/yr confirmed recovered`,
        body: `${data.fixedMetric || "A recovery"} was confirmed by your rep. Check your recovery timeline.`,
        cta: "View Recovery", ctaUrl: "/v2/recovery",
      };
    case "team_fix":
      return {
        ...base, type, priority: "celebration", channel: "push",
        title: `Your rep confirmed a recovery`,
        body: `$${(data.fixedSavings ?? 0).toLocaleString()}/yr confirmed. Check your recovery timeline.`,
        cta: "View Recovery", ctaUrl: "/v2/recovery",
      };
    case "quarterly":
      return {
        ...base, type, priority: "report", channel: "email",
        title: `Quarterly update: $${(data.totalSaved ?? 0).toLocaleString()} recovered`,
        body: `Your rep has recovered ${data.roi ?? 0}x their fee in confirmed savings.`,
        cta: "View My Recovery", ctaUrl: "/v2/recovery",
      };
    case "annual":
      return {
        ...base, type, priority: "report", channel: "email",
        title: `Your Year in Review: $${(data.totalSaved ?? 0).toLocaleString()} recovered`,
        body: `${data.roi ?? 0}x the fee in confirmed savings. Here's what your rep recovered this year.`,
        cta: "View Recovery Timeline", ctaUrl: "/v2/recovery",
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
