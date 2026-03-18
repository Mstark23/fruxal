// =============================================================================
// app/api/plaid/sync/route.ts
// POST — manually trigger a Plaid re-sync for the current user's business.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { syncPlaidFinancials } from "@/services/v2/plaid-aggregator";

export async function POST(req: NextRequest) {
  const token  = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = ((token as any)?.id || token?.sub) as string | undefined;
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("business_profiles")
    .select("business_id")
    .eq("user_id", userId)
    .single();

  if (!profile?.business_id) {
    return NextResponse.json({ success: false, error: "No business profile" }, { status: 400 });
  }

  try {
    await syncPlaidFinancials(profile.business_id);
    const { data: conn } = await supabaseAdmin
      .from("plaid_connections")
      .select("sync_summary, last_sync_at")
      .eq("business_id", profile.business_id)
      .single();

    return NextResponse.json({ success: true, summary: conn?.sync_summary, last_sync_at: conn?.last_sync_at });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
