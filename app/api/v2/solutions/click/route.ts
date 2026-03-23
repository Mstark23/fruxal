// =============================================================================
// app/api/v2/solutions/click/route.ts
// POST /api/v2/solutions/click — track affiliate link clicks
// No auth required (tracking should work for all users per spec)
// Returns { url } for the client to open in new tab
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { solutionId, solutionName, url, source, taskId, businessId } = body;

    if (!solutionId || !solutionName || !url) {
      return NextResponse.json({ error: "solutionId, solutionName, url required" }, { status: 400 });
    }

    // Get userId if authenticated (optional)
    let userId: string | null = null;
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user ? ((session.user as any).id as string) : null;
    } catch { /* non-fatal — tracking is best-effort */ }

    // Insert click record
    await supabaseAdmin.from("solution_clicks").insert({
      business_id:   businessId ?? null,
      user_id:       userId,
      solution_id:   solutionId,
      solution_name: solutionName,
      source:        source ?? "task_card",
      task_id:       taskId ?? null,
      clicked_at:    new Date().toISOString(),
    });

    return NextResponse.json({ url });
  } catch (err: any) {
    // Non-fatal — still return url so the click works even if tracking fails
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({ url: (body as any).url ?? "" });
  }
}
