// GET /api/rep/debug — shows cookies + lets you test cookie setting
// Visit /api/rep/debug?settest=1 to set a test cookie, then revisit to confirm it arrives
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/rep-auth";

const COOKIE = "fruxal_rep_session";

export async function GET(req: NextRequest) {
  // Block in production — debug endpoint only available in development
  if (process.env.NODE_ENV === "production") {
    return new Response(JSON.stringify({ error: "Not available" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }

  const rawCookieHeader = req.headers.get("cookie") || "(none)";

  const cookieMap: Record<string, string> = {};
  rawCookieHeader.split(";").forEach(c => {
    const idx = c.indexOf("=");
    if (idx > 0) {
      const k = c.slice(0, idx).trim();
      const v = c.slice(idx + 1).trim();
      cookieMap[k] = v;
    }
  });

  const sessionRaw = cookieMap[COOKIE] || null;
  let tokenPayload = null;
  let tokenError   = null;

  if (sessionRaw) {
    try {
      const decoded = decodeURIComponent(sessionRaw);
      tokenPayload  = verifyToken(decoded);
      if (!tokenPayload) tokenError = "Token invalid or expired";
    } catch (e: any) {
      tokenError = e.message;
    }
  }

  const body = {
    cookieNames:    Object.keys(cookieMap),
    hasRepCookie:   !!sessionRaw,
    repCookieLen:   sessionRaw?.length ?? 0,
    tokenValid:     !!tokenPayload,
    tokenPayload:   tokenPayload ? {
      repId:   tokenPayload.repId,
      email:   tokenPayload.email,
      type:    tokenPayload.type,
      expires: new Date(tokenPayload.exp).toISOString(),
    } : null,
    tokenError,
    rawCookieHeader,
  };

  // If ?settest=1, also set a plain test cookie so you can confirm cookies land at all
  if (req.nextUrl.searchParams.get("settest") === "1") {
    return new Response(JSON.stringify({ ...body, _action: "set test cookie — revisit /api/rep/debug to confirm" }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie":   "rep_test=hello; Path=/; Max-Age=300; SameSite=Lax",
        "Cache-Control":"no-store",
      },
    });
  }

  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
