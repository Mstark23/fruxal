// =============================================================================
// src/app/api/v2/prescan/results/[id]/route.ts
// =============================================================================
// GET — Fetches a stored prescan result by ID.
// No auth required — results are accessed via unique ID (unguessable UUID).
// This is what the results page loads to display findings.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing result ID" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("prescan_results")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: "Result not found" }, { status: 404 });
    }

    // Increment view count (for analytics)
    await supabaseAdmin
      .from("prescan_results")
      .update({ view_count: (data.view_count ?? 0) + 1, last_viewed_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        input_snapshot: data.input_snapshot,
        health_score: data.summary?.health_score ?? 0,
        summary: data.summary,
        teaser_leaks: data.teaser_leaks,
        hidden_leak_count: data.hidden_leak_count,
        insights: data.insights,
        obligation_categories: data.obligation_categories,
        teaser_programs: data.teaser_programs,
        hidden_program_count: data.hidden_program_count,
        created_at: data.created_at,
      },
    });

  } catch (err: any) {
    console.error("[Prescan:Results:Get] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
