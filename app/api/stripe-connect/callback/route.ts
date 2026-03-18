// =============================================================================
// app/api/stripe-connect/callback/route.ts
// Handles the OAuth callback from Stripe Connect.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { exchangeStripeCode, encryptToken, syncStripeFinancials } from "@/services/v2/stripe-aggregator";

export async function GET(req: NextRequest) {
  const sp       = req.nextUrl.searchParams;
  const code     = sp.get("code");
  const stateB64 = sp.get("state");
  const errParam = sp.get("error");

  if (errParam) {
    return NextResponse.redirect(new URL("/v2/integrations?stripe=denied", process.env.NEXTAUTH_URL!));
  }
  if (!code || !stateB64) {
    return NextResponse.redirect(new URL("/v2/integrations?stripe=error&msg=missing_params", process.env.NEXTAUTH_URL!));
  }

  let state: { businessId: string; userId: string };
  try {
    state = JSON.parse(Buffer.from(stateB64, "base64").toString());
  } catch {
    return NextResponse.redirect(new URL("/v2/integrations?stripe=error&msg=bad_state", process.env.NEXTAUTH_URL!));
  }

  try {
    const { accessToken, refreshToken, stripeAccountId, livemode, scope } = await exchangeStripeCode(code);

    await supabaseAdmin.from("stripe_connections").upsert({
      user_id:            state.userId,
      business_id:        state.businessId,
      stripe_account_id:  stripeAccountId,
      access_token_enc:   encryptToken(accessToken),
      refresh_token_enc:  refreshToken ? encryptToken(refreshToken) : null,
      livemode,
      scope,
      status:             "active",
      last_error:         null,
      updated_at:         new Date().toISOString(),
    }, { onConflict: "business_id" });

    // Initial sync — non-blocking
    syncStripeFinancials(state.businessId).catch(err =>
      console.error("[Stripe Connect] Initial sync error:", err.message)
    );

    return NextResponse.redirect(new URL("/v2/integrations?stripe=connected", process.env.NEXTAUTH_URL!));
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/v2/dashboard?stripe=error&msg=${encodeURIComponent(err.message)}`, process.env.NEXTAUTH_URL!)
    );
  }
}
