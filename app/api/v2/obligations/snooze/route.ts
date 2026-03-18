// =============================================================================
// src/app/api/v2/obligations/snooze/route.ts
// =============================================================================
// POST { obligationSlug, days }
// Snoozes the obligation — hides reminders for X days.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.sub || (token as any).id;
    const body = await req.json();
    const { obligationSlug, days } = body;

    if (!obligationSlug || !days) {
      return NextResponse.json(
        { success: false, error: "obligationSlug and days required" },
        { status: 400 }
      );
    }

    // Cap snooze to 90 days
    const snoozeDays = Math.min(Math.max(1, Number(days)), 90);
    const snoozeUntil = new Date();
    snoozeUntil.setDate(snoozeUntil.getDate() + snoozeDays);
    const snoozeDate = snoozeUntil.toISOString().split("T")[0];

    // Try RPC first
    try {
      const { error } = await supabaseAdmin.rpc("snooze_obligation", {
        p_user_id: userId,
        p_obligation_slug: obligationSlug,
        p_days: snoozeDays,
      });
      if (!error) {
        return NextResponse.json({
          success: true,
          data: { snoozed_until: snoozeDate, days: snoozeDays },
        });
      }
    } catch {}

    // Fallback: direct update on user_obligations
    const { error } = await supabaseAdmin
      .from("user_obligations")
      .update({
        snoozed_until: snoozeDate,
        notes: `Snoozed ${snoozeDays} days until ${snoozeDate}`,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("obligation_slug", obligationSlug);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { snoozed_until: snoozeDate, days: snoozeDays },
    });
  } catch (err: any) {
    console.error("[Snooze] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
