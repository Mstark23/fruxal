// =============================================================================
// src/app/api/v2/tour/complete/route.ts
// =============================================================================
// POST — Marks the tour as completed for the current user.
// Called when user finishes tour or clicks "Skip".
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json().catch(() => ({}));
    const stepReached = body.step || 4;
    const supabase = getSupabase();

    // Try RPC first
    try {
      const { error } = await supabase.rpc("complete_tour", {
        p_user_id: userId,
        p_step: stepReached,
      });
      if (!error) {
        return NextResponse.json({ success: true });
      }
    } catch {}

    // Fallback: direct update
    await supabase
      .from("business_profiles")
      .update({
        tour_completed_at: new Date().toISOString(),
        tour_step_reached: stepReached,
      })
      .eq("user_id", userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Tour:Complete] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
