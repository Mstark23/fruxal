// =============================================================================
// src/app/api/v2/leaks/list/route.ts
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findUserLeaks } from "@/lib/find-user-leaks";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const filter = req.nextUrl.searchParams.get("filter") || "all";

    const { leaks } = await findUserLeaks(userId);

    let result = leaks;
    if (filter !== "all") result = result.filter(l => l.status === filter);

    // Sort: detected first by impact desc
    const statusOrder: Record<string, number> = { detected: 0, in_progress: 1, fixed: 2, dismissed: 3 };
    result.sort((a, b) => {
      const so = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      return so !== 0 ? so : b.impact_max - a.impact_max;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("[Leaks:List] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
