// =============================================================================
// GET /api/alerts — Get custom alert rules
// POST /api/alerts — Create alert rule
// DELETE /api/alerts — Delete alert rule
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getToken } from "next-auth/jwt";

const _ip_alertsRl = new Map<string, {c: number; r: number}>();
function ip_alertsCheck(ip: string): boolean {
  const now = Date.now();
  const e = _ip_alertsRl.get(ip);
  if (!e || e.r < now) { _ip_alertsRl.set(ip, {c: 1, r: now + 3600000}); return true; }
  e.c++; return e.c <= 30;
}



const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (token as any).id || token.sub;

  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  // Verify ownership
  const { data: profile } = await sb.from("business_profiles").select("business_id").eq("user_id", userId).eq("business_id", businessId).maybeSingle();
  if (!profile) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const { data } = await sb.from("alert_rules").select("*").eq("businessId", businessId).order("createdAt", { ascending: false });
  return NextResponse.json({ alerts: data || [] });
}

export async function POST(req: NextRequest) {
  const _ip_ip_alerts = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!ip_alertsCheck(_ip_ip_alerts)) return NextResponse.json({error: "Too many requests"}, {status: 429});
  try {
    const { businessId, metric, operator, threshold, category, notifyEmail, notifyPush } = await req.json();
    if (!businessId || !metric || !operator || threshold === undefined) {
      return NextResponse.json({ error: "businessId, metric, operator, threshold required" }, { status: 400 });
    }

    const { data, error } = await sb.from("alert_rules").insert({
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      businessId,
      metric,
      operator, // "gt" | "lt" | "eq"
      threshold,
      category: category || null,
      notifyEmail: notifyEmail !== false,
      notifyPush: notifyPush !== false,
      active: true,
      createdAt: new Date().toISOString(),
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ alert: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Verify the alert belongs to user's business before deleting
  const userId = (token as any).id || token.sub;
  const { data: alert } = await sb.from("alert_rules").select("businessId").eq("id", id).maybeSingle();
  if (alert?.businessId) {
    const { data: profile } = await sb.from("business_profiles").select("business_id").eq("user_id", userId).eq("business_id", alert.businessId).maybeSingle();
    if (!profile) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await sb.from("alert_rules").delete().eq("id", id);
  return NextResponse.json({ deleted: true });
}

// Check alerts after a scan
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
      // Fire alert notification
      await sb.from("notifications").insert({
        id: `notif_alert_${Date.now()}`,
        businessId,
        type: "custom_alert",
        priority: "important",
        title: `⚠️ Alert: ${rule.metric} ${rule.operator === "gt" ? "exceeded" : "below"} ${rule.threshold}`,
        body: `${matching.length} leak(s) triggered your custom alert rule.`,
        cta: "Review",
        ctaUrl: "/v2/leaks",
        channel: rule.notifyPush ? "push" : "email",
        createdAt: new Date().toISOString(),
      });
    }
  }
}
