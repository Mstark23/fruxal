// =============================================================================
// GET /api/rep/auth/quick-login?email=xxx&secret=xxx
// =============================================================================
// Temporary admin-only quick login for reps. Requires CRON_SECRET.
// Sets session cookie and redirects to dashboard.
// =============================================================================

import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateSessionToken } from "@/lib/rep-auth";

const COOKIE = "fruxal_rep_session";
const TTL_DAYS = 30;

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const secret = req.nextUrl.searchParams.get("secret");

  // Require CRON_SECRET as auth
  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!email) {
    return new Response("Email required", { status: 400 });
  }

  const { data: rep } = await supabaseAdmin
    .from("tier3_reps")
    .select("id, email, status")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!rep || rep.status !== "active") {
    return new Response("Rep not found or inactive", { status: 404 });
  }

  const sessionToken = generateSessionToken(rep.id, rep.email);
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = TTL_DAYS * 24 * 60 * 60;

  const cookieStr = [
    `${COOKIE}=${encodeURIComponent(sessionToken)}`,
    `Max-Age=${maxAge}`,
    `Path=/`,
    `SameSite=Lax`,
    `HttpOnly`,
    isProd ? `Secure` : "",
  ].filter(Boolean).join("; ");

  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{background:#FAFAF8;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.s{width:24px;height:24px;border:2px solid #E5E3DD;border-top-color:#1B3A2D;border-radius:50%;animation:sp .7s linear infinite;margin:0 auto 12px}
@keyframes sp{to{transform:rotate(360deg)}}</style>
</head><body><div style="text-align:center"><div class="s"></div><strong style="color:#1B3A2D">Signing in as ${rep.email}...</strong></div>
<script>setTimeout(function(){window.location.replace("/rep/dashboard")},800);</script>
</body></html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": cookieStr,
        "Cache-Control": "no-store",
      },
    }
  );
}
