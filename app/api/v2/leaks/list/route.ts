// =============================================================================
// src/app/api/v2/leaks/list/route.ts
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { findUserLeaks } from "@/lib/find-user-leaks";

// Contingency model — all leaks visible to all users. No paid gating.

async function getUserTier(userId: string): Promise<string> {
  try {
    const { data: biz } = await supabaseAdmin
      .from("businesses").select("tier").eq("owner_user_id", userId).single();
    if (biz?.tier) return biz.tier.toLowerCase();
  } catch { /* non-fatal */ }
  try {
    const { data: prog } = await supabaseAdmin
      .from("user_progress").select("paid_plan").eq("userId", userId).single();
    if (prog?.paid_plan) return prog.paid_plan.toLowerCase();
  } catch { /* non-fatal */ }
  return "free";
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const filter = req.nextUrl.searchParams.get("filter") || "all";

    const [{ leaks }, tier] = await Promise.all([
      findUserLeaks(userId),
      getUserTier(userId),
    ]);

    // Contingency model — all leaks visible, no gating
    let result = leaks;
    if (filter !== "all") result = result.filter(l => l.status === filter);

    // Sort: detected first by impact desc
    const statusOrder: Record<string, number> = { detected: 0, in_progress: 1, fixed: 2, dismissed: 3 };
    result.sort((a, b) => {
      const so = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      return so !== 0 ? so : b.impact_max - a.impact_max;
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: { tier, isPaid: true, gated: false, totalCount: result.length, lockedCount: 0, lockedValue: 0 },
    });
  } catch (err: any) {
    console.error("[Leaks:List] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
