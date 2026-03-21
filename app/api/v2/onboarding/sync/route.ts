// =============================================================================
// src/app/api/v2/onboarding/sync/route.ts
// =============================================================================
// POST { businessId }
// Triggers the full obligation sync + deadline computation pipeline.
// Called after profile save. Returns match count + deadline summary.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { businessId } = body;

    if (!businessId) {
      return NextResponse.json({ success: false, error: "businessId required" }, { status: 400 });
    }

    // ─── Run full sync + deadline computation ─────────────────────────
    // This function:
    //   1. Matches obligations based on business profile flags
    //   2. Computes deadlines for all matched obligations
    //   3. Sets statuses (upcoming, overdue, etc.)
    //   4. Returns summary
    const { data, error } = await supabaseAdmin.rpc("sync_obligations_with_deadlines", {
      p_business_id: businessId,
    });

    if (error) {
      console.error("[Onboarding:Sync] Error:", error);

      // Fallback: try sync_obligations alone if combined function doesn't exist
      const { data: syncData, error: syncErr } = await supabaseAdmin.rpc("sync_obligations", {
        p_business_id: businessId,
      });

      if (syncErr) {
        return NextResponse.json({ success: false, error: syncErr.message }, { status: 500 });
      }

      // Then compute deadlines separately
      const { data: deadlineData } = await supabaseAdmin.rpc("get_obligations_with_deadlines" as any, {
        p_business_id: businessId,
      });

      return NextResponse.json({
        success: true,
        data: {
          total_matched: syncData?.total_matched ?? 0,
          new_obligations: syncData?.new_obligations ?? 0,
          overdue: deadlineData?.filter((d: any) => d.is_overdue)?.length ?? 0,
          upcoming_30_days: deadlineData?.filter((d: any) => d.days_until >= 0 && d.days_until <= 30)?.length ?? 0,
          deadlines_computed: deadlineData?.length ?? 0,
        },
      });
    }

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error("[Onboarding:Sync] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
