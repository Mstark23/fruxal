// =============================================================================
// src/app/api/v2/leaks/list/route.ts
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { findUserLeaks } from "@/lib/find-user-leaks";

const FREE_LEAK_LIMIT = 3;

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

    // Tier gate — free/solo/pro users see max 3 leaks
    const isPaid = ["business","growth","team","corp","enterprise","advisor"].includes(tier);
    const gated  = !isPaid && leaks.length > FREE_LEAK_LIMIT;

    let result = leaks;
    if (filter !== "all") result = result.filter(l => l.status === filter);

    // Sort: detected first by impact desc
    const statusOrder: Record<string, number> = { detected: 0, in_progress: 1, fixed: 2, dismissed: 3 };
    result.sort((a, b) => {
      const so = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      return so !== 0 ? so : b.impact_max - a.impact_max;
    });

    // Apply gate AFTER sort so top 3 are the most impactful
    const totalCount  = result.length;
    const lockedCount = gated ? Math.max(0, totalCount - FREE_LEAK_LIMIT) : 0;
    const lockedValue = gated
      ? result.slice(FREE_LEAK_LIMIT).reduce((s, l) => s + (l.impact_max ?? 0), 0)
      : 0;

    if (gated) result = result.slice(0, FREE_LEAK_LIMIT);

    return NextResponse.json({
      success: true,
      data: result,
      meta: { tier, isPaid, gated, totalCount, lockedCount, lockedValue },
    });
  } catch (err: any) {
    console.error("[Leaks:List] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
