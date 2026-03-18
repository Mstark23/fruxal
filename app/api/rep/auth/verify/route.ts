import { NextRequest } from "next/server";
import { verifyToken, generateSessionToken } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE   = "fruxal_rep_session";
const TTL_DAYS = 30;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return Response.redirect(new URL("/rep/login?error=missing_token", req.url));
  }

  const payload = verifyToken(token);
  if (!payload || payload.type !== "magic") {
    return Response.redirect(new URL("/rep/login?error=expired", req.url));
  }

  const { data: rep } = await supabaseAdmin
    .from("tier3_reps")
    .select("id, email, status")
    .eq("id", payload.repId)
    .single();

  if (!rep || rep.status !== "active") {
    return Response.redirect(new URL("/rep/login?error=inactive", req.url));
  }

  const sessionToken  = generateSessionToken(rep.id, rep.email);
  const isProd        = process.env.NODE_ENV === "production";
  const maxAge        = TTL_DAYS * 24 * 60 * 60;

  const cookieStr = [
    `${COOKIE}=${encodeURIComponent(sessionToken)}`,
    `Max-Age=${maxAge}`,
    `Path=/`,
    `SameSite=Lax`,
    `HttpOnly`,
    isProd ? `Secure` : "",
  ].filter(Boolean).join("; ");

  // Return a plain Response (not NextResponse) with raw Set-Cookie header.
  // The HTML page redirects via JS — cookie is committed before navigation.
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Signing in…</title>
<style>body{background:#FAFAF8;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.w{text-align:center}.s{width:24px;height:24px;border:2px solid #E5E3DD;border-top-color:#1B3A2D;border-radius:50%;animation:sp .7s linear infinite;margin:0 auto 12px}@keyframes sp{to{transform:rotate(360deg)}}p{font-size:13px;color:#8E8C85;margin:6px 0 0}</style>
</head><body><div class="w"><div class="s"></div><strong style="color:#1B3A2D">Signing you in…</strong><p>Redirecting to your dashboard.</p></div>
<script>setTimeout(function(){window.location.replace("/rep/dashboard")},600);</script>
</body></html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie":   cookieStr,
        "Cache-Control":"no-store, no-cache, must-revalidate",
        "Pragma":       "no-cache",
      },
    }
  );
}
