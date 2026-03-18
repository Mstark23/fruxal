// =============================================================================
// app/api/stripe-connect/status/route.ts
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
    .select("business_id, stripe_connected, stripe_last_sync_at, stripe_mrr, stripe_arr, stripe_revenue_ttm, stripe_refund_rate_pct, stripe_churn_rate_pct, stripe_active_subs, stripe_customer_count, stripe_stripe_fees_ttm, stripe_failed_payment_pct")
    .eq("user_id", userId)
    .single();

  if (!profile?.stripe_connected) return NextResponse.json({ connected: false });

  const { data: conn } = await supabaseAdmin
    .from("stripe_connections")
    .select("status, last_sync_at, last_error, livemode, sync_summary")
    .eq("business_id", profile.business_id)
    .single();

  return NextResponse.json({
    connected:    true,
    status:       conn?.status   || "active",
    livemode:     conn?.livemode ?? true,
    last_sync_at: conn?.last_sync_at || profile.stripe_last_sync_at,
    last_error:   conn?.last_error   || null,
    summary: {
      mrr:              profile.stripe_mrr               || 0,
      arr:              profile.stripe_arr               || 0,
      revenue_ttm:      profile.stripe_revenue_ttm       || 0,
      refund_rate_pct:  profile.stripe_refund_rate_pct   || 0,
      churn_rate_pct:   profile.stripe_churn_rate_pct    || 0,
      active_subs:      profile.stripe_active_subs       || 0,
      customer_count:   profile.stripe_customer_count    || 0,
      stripe_fees_ttm:  profile.stripe_stripe_fees_ttm   || 0,
      failed_pct:       profile.stripe_failed_payment_pct|| 0,
    },
  });
}
