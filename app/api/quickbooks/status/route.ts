// =============================================================================
// app/api/quickbooks/status/route.ts
// GET — Returns QuickBooks connection status for the current user.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const token  = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = ((token as any)?.id || token?.sub) as string | undefined;
  if (!userId) return NextResponse.json({ connected: false });

  try {
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id, qb_connected, qb_last_sync_at, qb_revenue_ttm, qb_gross_profit_ttm, qb_net_income_ttm, qb_payroll_ttm, qb_bank_balance")
      .eq("user_id", userId)
      .single();

    if (!profile?.qb_connected) return NextResponse.json({ connected: false });

    const { data: conn } = await supabaseAdmin
      .from("quickbooks_connections")
      .select("status, last_sync_at, last_error, sync_summary")
      .eq("business_id", profile.business_id)
      .single();

    return NextResponse.json({
      connected:    true,
      status:       conn?.status    || "active",
      last_sync_at: conn?.last_sync_at || profile.qb_last_sync_at,
      last_error:   conn?.last_error   || null,
      summary: {
        revenue_ttm:      profile.qb_revenue_ttm ?? 0,
        gross_profit_ttm: profile.qb_gross_profit_ttm ?? 0,
        net_income_ttm:   profile.qb_net_income_ttm ?? 0,
        payroll_ttm:      profile.qb_payroll_ttm ?? 0,
        bank_balance:     profile.qb_bank_balance ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
