// =============================================================================
// app/api/v2/diagnostic/rerun/route.ts
// POST — Re-fires the diagnostic for the current user using existing profile.
// No intake form required. Picks up latest QB / Plaid / Stripe data automatically
// (the run/route.ts already fetches those before building prompts).
// Returns { success, report_id, status: "analyzing" } immediately.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken }                  from "next-auth/jwt";
import { supabaseAdmin }             from "@/lib/supabase-admin";

export const maxDuration = 10; // just creates the record + fires async

export async function POST(req: NextRequest) {
  try {
    const token  = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // Get business_id
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id, user_id, country")
      .eq("user_id", userId)
      .single();

    if (!profile?.business_id) {
      return NextResponse.json({ success: false, error: "No business profile found. Complete intake first." }, { status: 400 });
    }

    // Check for an already-running diagnostic (avoid duplicate)
    const { data: existing } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "analyzing")
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        report_id: existing.id,
        status: "analyzing",
        message: "Diagnostic already running",
      });
    }

    // Get language preference from query param or profile
    const body = await req.json().catch(() => ({}));
    const language = body.language || "en";

    // Fire the run route internally (same process, different function)
    // We call it via internal fetch so it runs in its own context with full maxDuration
    const origin = process.env.NEXTAUTH_URL || `https://${req.headers.get("host")}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cookie": req.headers.get("cookie") || "",
    };

    // Fire async — don't await (run route takes up to 120s)
    fetch(`${origin}/api/v2/diagnostic/run`, {
      method:  "POST",
      headers,
      body:    JSON.stringify({ businessId: profile.business_id, language, country: profile.country || "CA" }),
    }).catch(err => console.error("[Rerun] Background diagnostic error:", err.message));

    // Poll for the new "analyzing" report that was just created
    // Give it 3 seconds to appear in DB
    await new Promise(r => setTimeout(r, 3000));

    const { data: newReport } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success:   true,
      report_id: newReport?.id   || null,
      status:    newReport?.status || "analyzing",
      message:   "Diagnostic started",
    });

  } catch (err: any) {
    console.error("[Rerun] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
