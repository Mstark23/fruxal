// =============================================================================
// app/api/quickbooks/callback/route.ts
// Handles QuickBooks OAuth callback. Exchanges code for tokens.
// Full implementation requires services/v2/qb-aggregator.ts to be wired up.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL("/v2/integrations?qb=error&msg=" + (error || "missing_params"), process.env.NEXTAUTH_URL!)
    );
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, "base64").toString());
    if (!userId) throw new Error("invalid_state");

    const clientId     = process.env.QUICKBOOKS_CLIENT_ID || process.env.INTUIT_CLIENT_ID || process.env.QB_CLIENT_ID;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET || process.env.INTUIT_CLIENT_SECRET || process.env.QB_CLIENT_SECRET;
    const redirectUri  = process.env.QUICKBOOKS_REDIRECT_URI || process.env.INTUIT_REDIRECT_URI || process.env.QB_REDIRECT_URI
      || `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`;

    if (!clientId || !clientSecret) throw new Error("QB not configured");

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error("token_exchange_failed");

    // Get realm ID from id_token or token response
    const realmId = searchParams.get("realmId") || tokens.realmId;

    // Save connection — full sync happens via /api/quickbooks/sync
    const { data: profile } = await supabaseAdmin
      .from("business_profiles").select("business_id").eq("user_id", userId).single();

    if (profile?.business_id) {
      await supabaseAdmin.from("quickbooks_connections").upsert({
        business_id:    profile.business_id,
        access_token:   tokens.access_token,
        refresh_token:  tokens.refresh_token,
        realm_id:       realmId,
        status:         "connected",
        connected_at:   new Date().toISOString(),
        token_expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
      }, { onConflict: "business_id" });

      await supabaseAdmin.from("business_profiles")
        .update({ qb_connected: true, updated_at: new Date().toISOString() })
        .eq("business_id", profile.business_id);
    }

    return NextResponse.redirect(new URL("/v2/integrations?qb=connected", process.env.NEXTAUTH_URL!));
  } catch (err: any) {
    return NextResponse.redirect(
      new URL("/v2/integrations?qb=error&msg=" + encodeURIComponent(err.message), process.env.NEXTAUTH_URL!)
    );
  }
}
