// =============================================================================
// GET /api/health — Comprehensive system health check
// =============================================================================
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 15;

export async function GET() {
  const checks: Record<string, "ok" | "degraded" | "missing"> = {};
  const details: Record<string, string> = {};
  const start = Date.now();

  // 1. Database connectivity
  try {
    const { error } = await supabaseAdmin
      .from("users").select("id", { count: "exact", head: true }).limit(1);
    checks.database = error ? "degraded" : "ok";
    if (error) details.database = error.message;
  } catch (e: any) {
    checks.database = "degraded"; details.database = e.message;
  }

  // 2. Critical tables exist
  const tables = ["businesses", "prescan_runs", "tier3_pipeline", "notifications", "user_obligations"];
  for (const t of tables) {
    try {
      const { error } = await supabaseAdmin.from(t).select("*", { head: true, count: "exact" }).limit(0);
      checks[`table_${t}`] = error ? "missing" : "ok";
      if (error) details[`table_${t}`] = error.message;
    } catch (e: any) {
      checks[`table_${t}`] = "missing"; details[`table_${t}`] = e.message;
    }
  }

  // 3. Critical env vars
  checks.anthropic_key = process.env.ANTHROPIC_API_KEY ? "ok" : "missing";
  checks.resend_key    = process.env.RESEND_API_KEY    ? "ok" : "missing";
  checks.nextauth      = process.env.NEXTAUTH_SECRET   ? "ok" : "missing";
  checks.supabase      = process.env.NEXT_PUBLIC_SUPABASE_URL ? "ok" : "missing";
  checks.admin_emails  = process.env.ADMIN_EMAILS      ? "ok" : "missing";

  const allOk    = Object.values(checks).every(v => v === "ok");
  const anyDown  = Object.values(checks).some(v => v === "degraded");
  const anyMissing = Object.values(checks).some(v => v === "missing");

  const status = allOk ? "ok" : anyDown ? "degraded" : anyMissing ? "partial" : "ok";

  return Response.json({
    status,
    checks,
    details: Object.keys(details).length > 0 ? details : undefined,
    latency_ms: Date.now() - start,
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
  }, { status: allOk ? 200 : 503 });
}
