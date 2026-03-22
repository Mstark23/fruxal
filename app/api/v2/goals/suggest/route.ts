// =============================================================================
// app/api/v2/goals/suggest/route.ts
// POST /api/v2/goals/suggest — get Claude suggestion WITHOUT saving
// User must explicitly accept before the goal is persisted
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { suggestGoal } from "@/lib/ai/goal-suggester";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const { businessId, tier } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const suggestion = await suggestGoal(businessId, userId, tier ?? "solo");
    if (!suggestion) return NextResponse.json({ error: "Could not generate suggestion" }, { status: 422 });

    return NextResponse.json({ suggestion });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
