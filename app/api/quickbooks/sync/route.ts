// =============================================================================
// app/api/quickbooks/sync/route.ts
// POST — Triggers a QuickBooks data sync for the current user.
// Delegates to services/v2/qb-aggregator.ts
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const token  = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = ((token as any)?.id || token?.sub) as string | undefined;
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { data: profile } = await supabaseAdmin
      .from("business_profiles").select("business_id, qb_connected").eq("user_id", userId).single();

    if (!profile?.business_id || !profile.qb_connected) {
      return NextResponse.json({ success: false, error: "QuickBooks not connected" }, { status: 400 });
    }

    // Dynamically import qb-aggregator to avoid build errors if module missing
    try {
      const { syncQBFinancials } = await import("@/services/v2/qb-aggregator");
      await syncQBFinancials(profile.business_id);
    } catch (importErr: any) {
      // qb-aggregator not available — update status manually
      await supabaseAdmin.from("quickbooks_connections")
        .update({ status: "sync_failed", last_error: importErr.message, last_sync_at: new Date().toISOString() })
        .eq("business_id", profile.business_id);
      return NextResponse.json({ success: false, error: "Sync service unavailable: " + importErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
