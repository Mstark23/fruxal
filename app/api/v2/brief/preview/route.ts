// =============================================================================
// app/api/v2/brief/preview/route.ts
// POST /api/v2/brief/preview — generate brief without sending (testing/admin)
// Returns generated content so it can be reviewed before going live
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateMonthlyBrief } from "@/lib/ai/brief-generator";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id as string;

    const { businessId } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    // Ownership check
    const { data: biz } = await supabaseAdmin
      .from("businesses")
      .select("id, tier")
      .eq("id", businessId)
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rawTier = (biz.tier || "solo").toLowerCase();
    const tier = rawTier === "enterprise" ? "enterprise"
      : ["business", "growth", "team"].includes(rawTier) ? "business" : "solo";

    const brief = await generateMonthlyBrief(businessId, userId, tier);

    if (!brief) {
      return NextResponse.json({
        error: "Could not generate brief — ensure at least one diagnostic has been completed",
      }, { status: 422 });
    }

    return NextResponse.json({ brief, tier });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
