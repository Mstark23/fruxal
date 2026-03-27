// =============================================================================
// GET /api/health — System health check
// =============================================================================
// Checks: DB connectivity, Anthropic API key, Resend API key, env vars.
// Returns degraded status if any non-critical service is missing.
// Used by uptime monitors (UptimeRobot, BetterUptime, etc.)
// =============================================================================
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 10;

export async function GET() {
  const checks: Record<string, "ok" | "degraded" | "missing"> = {};
  const start = Date.now();

  // 1. DB connectivity
  try {
    const { error } = await supabaseAdmin
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .limit(1);
    checks.database = error ? "degraded" : "ok";
  } catch {
    checks.database = "degraded";
  }

  // 2. Critical env vars
  checks.anthropic_key = process.env.ANTHROPIC_API_KEY ? "ok" : "missing";
  checks.resend_key    = process.env.RESEND_API_KEY    ? "ok" : "missing";
  checks.nextauth      = process.env.NEXTAUTH_SECRET   ? "ok" : "missing";
  checks.supabase      = process.env.NEXT_PUBLIC_SUPABASE_URL ? "ok" : "missing";

  const allOk = Object.values(checks).every(v => v === "ok");
  const anyDown = Object.values(checks).some(v => v === "degraded");

  const status = allOk ? "ok" : anyDown ? "degraded" : "partial";

  return Response.json({
    status,
    checks,
    latency_ms: Date.now() - start,
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
  }, { status: allOk ? 200 : 503 });
}
