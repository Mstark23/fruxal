// =============================================================================
// app/api/quickbooks/connect/route.ts
// Redirects to QuickBooks OAuth flow.
// Full QB OAuth requires INTUIT_CLIENT_ID + INTUIT_CLIENT_SECRET env vars.
// If not configured, redirects to integrations page.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL!));
  }

  const clientId     = process.env.QUICKBOOKS_CLIENT_ID || process.env.INTUIT_CLIENT_ID || process.env.QB_CLIENT_ID;
  const redirectUri  = process.env.QUICKBOOKS_REDIRECT_URI || process.env.INTUIT_REDIRECT_URI || process.env.QB_REDIRECT_URI
    || `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`;

  if (!clientId) {
    // QB not configured — send to integrations with error message
    return NextResponse.redirect(
      new URL("/v2/integrations?qb=not_configured", process.env.NEXTAUTH_URL!)
    );
  }

  const state = Buffer.from(JSON.stringify({ userId: token.sub, ts: Date.now() })).toString("base64");
  const scope = "com.intuit.quickbooks.accounting";
  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;

  return NextResponse.redirect(authUrl);
}
