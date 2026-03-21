// =============================================================================
// src/app/api/v2/obligations/complete/route.ts
// =============================================================================
// POST { obligationSlug, actualCost?, notes? }
// Marks obligation complete, advances to next deadline period.
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
    const { obligationSlug, actualCost, notes } = body;

    if (!obligationSlug) {
      return NextResponse.json(
        { success: false, error: "obligationSlug required" },
        { status: 400 }
      );
    }

    // Try RPC first
    try {
      const { data, error } = await supabaseAdmin.rpc("mark_obligation_completed", {
        p_user_id: userId,
        p_obligation_slug: obligationSlug,
        p_completed_by: token.name || token.email || null,
        p_actual_cost: actualCost || null,
        p_notes: notes || null,
      });
      if (!error) {
        return NextResponse.json({ success: true, data });
      }
    } catch { /* non-fatal */ }

    // Fallback: direct update on user_obligations
    const { error } = await supabaseAdmin
      .from("user_obligations")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("obligation_slug", obligationSlug);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { status: "completed" } });
  } catch (err: any) {
    console.error("[Complete] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
