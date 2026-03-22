// =============================================================================
// app/api/v2/tasks/[id]/route.ts
// PATCH /api/v2/tasks/:id — update task status
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildTimeline } from "@/lib/ai/timeline-builder";

export const maxDuration = 15;

const VALID_STATUSES = ["open", "in_progress", "done", "dismissed"] as const;
type TaskStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const taskId = params.id;

    const body = await req.json();
    const { status } = body as { status: TaskStatus };

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch task to verify ownership via business
    const { data: task } = await supabaseAdmin
      .from("diagnostic_tasks")
      .select("id, business_id, status")
      .eq("id", taskId)
      .maybeSingle();

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify ownership — check business belongs to user
    const { data: ownerCheck } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("id", task.business_id)
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (!ownerCheck) {
      // Fallback: check business_profiles
      const { data: profCheck } = await supabaseAdmin
        .from("business_profiles")
        .select("business_id")
        .eq("business_id", task.business_id)
        .eq("user_id", userId)
        .maybeSingle();

      if (!profCheck) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set completed_at when marking done, clear it if reverting
    if (status === "done") {
      updatePayload.completed_at = new Date().toISOString();
    } else if (task.status === "done") {
      updatePayload.completed_at = null;
    }

    const { data: updated, error } = await supabaseAdmin
      .from("diagnostic_tasks")
      .update(updatePayload)
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      console.error("[Task PATCH]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: updated });
  } catch (err: any) {
    console.error("[Task PATCH] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
