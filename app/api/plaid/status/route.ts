// =============================================================================
// app/api/plaid/status/route.ts
// GET — connection status + key signals for dashboard display.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const token  = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = ((token as any)?.id || token?.sub) as string | undefined;
  if (!userId) return NextResponse.json({ connected: false });

  const { data: profile } = await supabaseAdmin
    .from("business_profiles")
    .select("business_id, plaid_connected, plaid_last_sync_at, plaid_bank_balance_total, plaid_revenue_90d, plaid_expenses_90d, plaid_lowest_balance_30d, plaid_loan_payments")
    .eq("user_id", userId)
    .single();

  if (!profile?.plaid_connected) return NextResponse.json({ connected: false });

  const { data: conn } = await supabaseAdmin
    .from("plaid_connections")
    .select("status, last_sync_at, last_error, institution_name, sync_summary")
    .eq("business_id", profile.business_id)
    .single();

  return NextResponse.json({
    connected:        true,
    status:           conn?.status        || "active",
    institution_name: conn?.institution_name || null,
    last_sync_at:     conn?.last_sync_at  || profile.plaid_last_sync_at,
    last_error:       conn?.last_error    || null,
    summary: {
      bank_balance:   profile.plaid_bank_balance_total || 0,
      revenue_90d:    profile.plaid_revenue_90d        || 0,
      expenses_90d:   profile.plaid_expenses_90d       || 0,
      lowest_bal_30d: profile.plaid_lowest_balance_30d || 0,
      loan_payments:  profile.plaid_loan_payments      || 0,
    },
  });
}
