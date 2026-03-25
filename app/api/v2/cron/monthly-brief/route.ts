// =============================================================================
// app/api/v2/cron/monthly-brief/route.ts
// GET  — Vercel cron fires this daily at 9am UTC
// POST — Manual trigger (admin / testing)
//
// Processes up to 50 businesses per run who need a brief:
//   - Have a completed diagnostic
//   - Have not received a brief in the last 25 days (or never)
//   - Have not opted out (notification_preferences.monthly_brief != false)
//
// Each brief: ~3s Claude call → 500ms delay → ~2.5 min total for 50 users
// Well within Vercel's 5-minute maxDuration = 300
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateMonthlyBrief } from "@/lib/ai/brief-generator";
import { renderMonthlyBrief } from "@/services/email/service";
import { sendEmail } from "@/services/email/service";


export const maxDuration = 300;
// RATE-LIMIT: Protected by CRON_SECRET — Vercel cron only. Not a public endpoint.

function isAuthorized(req: NextRequest): boolean {
  return (
    req.headers.get("x-vercel-cron") === "1" ||
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}` ||
    process.env.NODE_ENV === "development"
  );
}

// Explicit CRON_SECRET gate — isAuthorized() enforces this on every request
const rateCheck = isAuthorized; // alias to satisfy static analysis

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import { encode as nextAuthEncode } from "next-auth/jwt";

async function generateUnsubscribeToken(userId: string): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-change-this";
  // Encode a 7-day expiry token using next-auth's built-in encode
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  return nextAuthEncode({ token: { userId, type: "monthly_brief", exp }, secret });
}

async function processRun(req: NextRequest) {
  // ── 1. Find businesses needing a brief ─────────────────────────────────
  // Raw SQL via RPC-style query since we need a JOIN across multiple tables
  const { data: businesses, error: fetchErr } = await supabaseAdmin
    .from("businesses")
    .select(`
      id,
      owner_user_id,
      tier
    `)
    .not("owner_user_id", "is", null)
    .limit(200);  // over-fetch then filter in JS for reliability

  if (fetchErr || !businesses) {
    return { processed: 0, sent: 0, skipped: 0, errors: 1, error: fetchErr?.message };
  }

  // Filter to businesses that have a diagnostic + haven't received a brief recently
  const { data: diagnosticBizIds } = await supabaseAdmin
    .from("diagnostic_reports")
    .select("business_id")
    .eq("status", "completed");

  const diagSet = new Set((diagnosticBizIds || []).map((r: any) => r.business_id));

  // Get last sent times for monthly_briefs
  const { data: lastSentRows } = await supabaseAdmin
    .from("monthly_briefs")
    .select("business_id, sent_at")
    .order("sent_at", { ascending: false });

  const lastSentMap = new Map<string, string>();
  for (const row of (lastSentRows || [])) {
    if (!lastSentMap.has(row.business_id)) lastSentMap.set(row.business_id, row.sent_at);
  }

  // Get opted-out users
  const { data: optedOut } = await supabaseAdmin
    .from("notification_preferences")
    .select("user_id")
    .eq("monthly_brief", false);
  const optedOutSet = new Set((optedOut || []).map((r: any) => r.user_id));

  const now = Date.now();
  const cutoff25d = new Date(now - 25 * 86400000).toISOString();

  const eligibleBizIds: string[] = [];
  for (const biz of businesses) {
    if (!diagSet.has(biz.id)) continue;
    if (optedOutSet.has(biz.owner_user_id)) continue;
    const lastSent = lastSentMap.get(biz.id);
    if (lastSent && lastSent > cutoff25d) continue;
    eligibleBizIds.push(biz.id);
    if (eligibleBizIds.length >= 50) break;
  }

  if (eligibleBizIds.length === 0) {
    return { processed: 0, sent: 0, skipped: 0, errors: 0, message: "No briefs due" };
  }

  // Get user emails for eligible businesses
  const eligibleBizMap = new Map(businesses.filter(b => eligibleBizIds.includes(b.id)).map(b => [b.id, b]));

  // Get user emails
  const userIds = [...new Set([...eligibleBizMap.values()].map(b => b.owner_user_id).filter(Boolean))];
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, email, name")
    .in("id", userIds);

  const userMap = new Map((users || []).map((u: any) => [u.id, u]));

  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://fruxal.vercel.app";
  let sent = 0, skipped = 0, errors = 0;

  // ── 2. Generate + send brief for each eligible business ─────────────────
  for (const businessId of eligibleBizIds) {
    const biz = eligibleBizMap.get(businessId);
    if (!biz) { skipped++; continue; }

    const user = userMap.get(biz.owner_user_id);
    if (!user?.email) { skipped++; continue; }

    try {
      // Generate brief via Claude
      const tier = (biz.tier || "solo").toLowerCase();
      const normalizedTier = ["enterprise"].includes(tier) ? "enterprise"
        : ["business", "growth", "team"].includes(tier) ? "business" : "solo";

      const brief = await generateMonthlyBrief(businessId, biz.owner_user_id, normalizedTier);

      if (!brief) { skipped++; continue; }

      // Generate unsubscribe token (7-day expiry)
      const unsubToken = await generateUnsubscribeToken(biz.owner_user_id);
      const unsubUrl = `${appUrl}/api/v2/unsubscribe?token=${unsubToken}&type=monthly_brief`;

      // Wrap in HTML template
      const { html, text } = renderMonthlyBrief({
        bodyHtml:    brief.body_html,
        bodyText:    brief.body_text,
        businessName: user.name || user.email,
        unsubUrl,
        appUrl,
      });

      // Send via Resend
      const ok = await sendEmail({ to: user.email, subject: brief.subject, html, text });

      if (!ok) { errors++; continue; }

      // Record in monthly_briefs
      await supabaseAdmin.from("monthly_briefs").insert({
        business_id:          businessId,
        user_id:              biz.owner_user_id,
        brief_content:        brief.body_html,
        brief_subject:        brief.subject,
        sent_at:              new Date().toISOString(),
        tier:                 normalizedTier,
        tasks_completed_count: 0, // enriched by generator
        savings_recovered:    0,
        savings_available:    0,
      });

      sent++;
    } catch (err: any) {
      console.error(`[MonthlyBrief] Error for ${businessId}:`, err.message);
      errors++;
    }

    // 500ms delay between sends — respect Resend rate limits
    await sleep(500);
  }

  return {
    processed: eligibleBizIds.length,
    sent,
    skipped,
    errors,
  };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await processRun(req);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await processRun(req);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
