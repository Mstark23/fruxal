// GET /api/rep/client-access/verify?token=XXX
// Auth: cryptographic HMAC-SHA256 token — read-only verification, no DB writes
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "fruxal-client-invite";

function verifyInvite(token: string): any | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.type !== "client_invite") return null;
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}

// Read-only: no DB writes — only verifies HMAC signature
// authMethod: invite_token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false, error: "No token" });
  const payload = verifyInvite(token);
  if (!payload) return NextResponse.json({ valid: false, error: "Invalid or expired token" });
  return NextResponse.json({ valid: true, payload });
}
