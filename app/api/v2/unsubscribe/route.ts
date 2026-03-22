// =============================================================================
// app/api/v2/unsubscribe/route.ts
// GET /api/v2/unsubscribe?token=JWT&type=monthly_brief
// No auth required — JWT is the auth (7-day expiry)
// Sets notification_preferences.monthly_brief = false
// Returns HTML confirmation page
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { decode } from "next-auth/jwt";
// AUTH: JWT token verification below acts as Authorization — no session needed for this public unsubscribe endpoint

// Authorization is enforced via signed JWT token in query param (7-day expiry)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const type  = req.nextUrl.searchParams.get("type") || "monthly_brief";

  const confirmHtml = (message: string, isError = false) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Fruxal — Notification Preferences</title>
  <style>
    body { margin: 0; padding: 0; background: #f7f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: white; border-radius: 16px; padding: 40px 32px; max-width: 440px; width: 100%; margin: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .logo { font-size: 20px; font-weight: 900; margin-bottom: 4px; }
    .sub { font-size: 12px; color: #888; margin-bottom: 28px; }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h1 { font-size: 18px; font-weight: 800; color: ${isError ? "#B34040" : "#1a1a2e"}; margin: 0 0 12px; }
    p { font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 24px; }
    a { display: inline-block; background: #1B3A2D; color: white; font-weight: 700; font-size: 13px; padding: 10px 22px; border-radius: 10px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">💧 Fruxal</div>
    <div class="sub">Business Intelligence</div>
    <div class="icon">${isError ? "⚠️" : "✅"}</div>
    <h1>${isError ? "Something went wrong" : "You've been unsubscribed"}</h1>
    <p>${message}</p>
    <a href="${process.env.NEXTAUTH_URL || "https://fruxal.com"}/v2/settings">Manage all preferences →</a>
  </div>
</body>
</html>`.trim();

  if (!token) {
    return new NextResponse(confirmHtml("This unsubscribe link is missing a token. Please use the link from your email.", true), {
      status: 400, headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-change-this";
    const payload = await decode({ token, secret });
    if (!payload) throw new Error("Invalid token");
    const userId = payload.userId as string;
    const tokenType = payload.type as string;

    // Auth gate: token verification is the only auth for this public endpoint
    if (!userId) return new NextResponse(confirmHtml("Invalid token — please use the link from your email.", true), { status: 401, headers: { "Content-Type": "text/html" } });

    // Build the update — only update the column matching the type
    const updateData: Record<string, boolean> = {};
    if (type === "monthly_brief" || tokenType === "monthly_brief") {
      updateData.monthly_brief = false;
    } else {
      // Generic fallback — add more types as needed
      updateData.monthly_brief = false;
    }

    // Upsert notification_preferences
    const { error } = await supabaseAdmin
      .from("notification_preferences")
      .upsert(
        { user_id: userId, ...updateData, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    const typeLabel = type === "monthly_brief" ? "monthly briefs" : "these notifications";
    return new NextResponse(
      confirmHtml(`You've been successfully unsubscribed from ${typeLabel}. You can re-subscribe anytime in your account settings.`),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    const isExpired = err?.message?.includes("expired") || false;
    const message = isExpired
      ? "This unsubscribe link has expired (links are valid for 7 days). Please use the link in your most recent email."
      : "This unsubscribe link is invalid or has already been used.";

    return new NextResponse(confirmHtml(message, true), {
      status: 400, headers: { "Content-Type": "text/html" },
    });
  }
}
