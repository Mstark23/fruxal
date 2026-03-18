// =============================================================================
// app/api/plaid/exchange/route.ts
// POST { publicToken, institutionId, institutionName }
// Exchanges the public token for an access token and triggers initial sync.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { exchangePublicToken, encryptToken, syncPlaidFinancials } from "@/services/v2/plaid-aggregator";

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

  const body = await req.json();
  const { publicToken, institutionId, institutionName } = body;

  if (!publicToken) {
    return NextResponse.json({ success: false, error: "publicToken required" }, { status: 400 });
  }

  try {
    const { accessToken, itemId } = await exchangePublicToken(publicToken);

    await supabaseAdmin.from("plaid_connections").upsert({
      user_id:            userId,
      business_id:        profile.business_id,
      item_id:            itemId,
      access_token_enc:   encryptToken(accessToken),
      institution_id:     institutionId  || null,
      institution_name:   institutionName || null,
      status:             "active",
      last_error:         null,
      updated_at:         new Date().toISOString(),
    }, { onConflict: "business_id" });

    // Initial sync — non-blocking
    syncPlaidFinancials(profile.business_id).catch(err =>
      console.error("[Plaid] Initial sync error:", err.message)
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
