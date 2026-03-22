// =============================================================================
// app/api/v2/goals/[id]/route.ts
// PATCH /api/v2/goals/:id — update status, target, or date
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildTimeline } from "@/lib/ai/timeline-builder";

export const maxDuration = 10;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const goalId = params.id;
    const body = await req.json();

    // Verify goal belongs to this user
    const { data: goal } = await supabaseAdmin
      .from("business_goals")
      .select("id, business_id")
      .eq("id", goalId)
      .maybeSingle();

    if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: biz } = await supabaseAdmin.from("businesses").select("id")
      .eq("id", goal.business_id).eq("owner_user_id", userId).maybeSingle();
    const { data: prof } = biz ? { data: null } :
      await supabaseAdmin.from("business_profiles").select("business_id")
        .eq("business_id", goal.business_id).eq("user_id", userId).maybeSingle();
    if (!biz && !prof) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const allowed: any = { updated_at: new Date().toISOString() };
    if (body.status)        allowed.status = body.status;
    if (body.target_amount !== undefined) allowed.target_amount = body.target_amount;
    if (body.target_date)   allowed.target_date = body.target_date;
    if (body.goal_title)    allowed.goal_title = body.goal_title;
    if (body.status === "completed") allowed.completed_at = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin
      .from("business_goals")
      .update(allowed)
      .eq("id", goalId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ goal: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
