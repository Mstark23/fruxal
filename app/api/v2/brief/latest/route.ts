// =============================================================================
// app/api/v2/brief/latest/route.ts
// GET /api/v2/brief/latest?businessId=XXX
// Returns the most recent sent brief for a business (for dashboard widget)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    // Verify ownership
    const { data: biz } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check within 35 days
    const cutoff = new Date(Date.now() - 35 * 86400000).toISOString();

    const { data: brief } = await supabaseAdmin
      .from("monthly_briefs")
      .select("id, brief_subject, brief_content, sent_at")
      .eq("business_id", businessId)
      .not("sent_at", "is", null)
      .gte("sent_at", cutoff)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ brief: brief ?? null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
