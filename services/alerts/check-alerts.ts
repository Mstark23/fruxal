import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function checkAlerts(businessId: string, leaks: any[]): Promise<void> {
  const { data: rules } = await sb.from("alert_rules").select("*").eq("businessId", businessId).eq("active", true);
  if (!rules || rules.length === 0) return;

  for (const rule of rules) {
    const matching = leaks.filter(l => {
      if (rule.category && l.category !== rule.category) return false;
      const value = rule.metric === "annualImpact" ? l.annualImpact :
                    rule.metric === "healthScore" ? l.healthScore :
                    parseFloat(l.yours) || 0;
      switch (rule.operator) {
        case "gt": return value > rule.threshold;
        case "lt": return value < rule.threshold;
        case "eq": return value === rule.threshold;
        default: return false;
      }
    });

    if (matching.length > 0) {
      await sb.from("notifications").insert({
        id: `notif_alert_${Date.now()}`,
        businessId,
        type: "custom_alert",
        priority: "important",
        title: `⚠️ Alert: ${rule.metric} ${rule.operator === "gt" ? "exceeded" : "below"} ${rule.threshold}`,
        body: `${matching.length} leak(s) triggered your custom alert rule.`,
        cta: "Review",
        ctaUrl: "/dashboard?tab=leaks",
        channel: rule.notifyPush ? "push" : "email",
        createdAt: new Date().toISOString(),
      });
    }
  }
}
