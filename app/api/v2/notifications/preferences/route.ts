// =============================================================================
// src/app/api/v2/notifications/preferences/route.ts
// =============================================================================
// GET  — Fetch user's notification preferences
// PUT  — Update preferences
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("notification_preferences")
      .select("*")
      .eq("user_id", token.sub)
      .single();

    if (error && error.code === "PGRST116") {
      // No preferences yet — return defaults
      return NextResponse.json({
        success: true,
        data: {
          email_enabled: true,
          in_app_enabled: true,
          sms_enabled: false,
          push_enabled: false,
          email_frequency: "smart",
          quiet_start_hour: 20,
          quiet_end_hour: 8,
          timezone: "America/Montreal",
          min_urgency_email: "warning",
          unsubscribed_types: [],
        },
      });
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Whitelist allowed fields
    const allowed: Record<string, any> = {};
    const fields = [
      "email_enabled", "in_app_enabled", "sms_enabled", "push_enabled",
      "email_frequency", "quiet_start_hour", "quiet_end_hour", "timezone",
      "min_urgency_email", "min_urgency_push", "unsubscribed_types",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }

    const { data, error } = await supabaseAdmin
      .from("notification_preferences")
      .upsert(
        { user_id: token.sub, ...allowed, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
