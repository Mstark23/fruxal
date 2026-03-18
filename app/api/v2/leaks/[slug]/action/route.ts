// =============================================================================
// POST /api/v2/leaks/[slug]/action — Update leak status
// =============================================================================
// Body: { action: "fix" | "progress" | "dismiss" | "reopen", savings?: number }
// Updates leak_actions table + user_progress recovery stats
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { slug } = params;

    const body = await req.json();
    const { action, savings } = body;

    if (!action || !["fix", "progress", "dismiss", "reopen"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use fix, progress, dismiss, or reopen" },
        { status: 400 }
      );
    }

    const statusMap: Record<string, string> = {
      fix: "fixed",
      progress: "in_progress",
      dismiss: "dismissed",
      reopen: "detected",
    };
    const newStatus = statusMap[action];
    const savingsAmount = action === "fix" ? (savings || 0) : 0;

    // Upsert into leak_actions
    try {
      await supabaseAdmin.from("leak_actions").upsert(
        {
          user_id: userId,
          leak_slug: slug,
          status: newStatus,
          savings_amount: savingsAmount,
          actioned_at: new Date().toISOString(),
        },
        { onConflict: "user_id,leak_slug" }
      );
    } catch (e) {
      // Table might not exist yet — create inline
      console.warn("[LeakAction] Upsert failed, table may not exist:", e);
    }

    // Also update user_leak_status so leaks/list reflects the change
    try {
      await supabaseAdmin.from("user_leak_status").upsert(
        {
          user_id: userId,
          leak_slug: slug,
          status: newStatus,
          savings_amount: savingsAmount,
          fixed_at: action === "fix" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,leak_slug" }
      );
    } catch (e) {
      console.warn("[LeakAction] user_leak_status update failed:", e);
    }

    // Update aggregate stats in user_progress
    try {
      // Get all fixed leaks for this user
      const { data: fixedLeaks } = await supabaseAdmin
        .from("leak_actions")
        .select("savings_amount")
        .eq("user_id", userId)
        .eq("status", "fixed");

      const totalRecovered = (fixedLeaks || []).reduce(
        (sum: number, l: any) => sum + (l.savings_amount || 0),
        0
      );
      const fixedCount = (fixedLeaks || []).length;

      await supabaseAdmin.from("user_progress").upsert(
        {
          userId,
          total_recovered: totalRecovered,
          leaks_fixed: fixedCount,
          last_action_at: new Date().toISOString(),
        },
        { onConflict: "userId" }
      );
    } catch (e) {
      console.warn("[LeakAction] Stats update failed:", e);
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      savings: savingsAmount,
    });
  } catch (error: any) {
    console.error("[LeakAction] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
