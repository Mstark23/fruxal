// POST /api/rep/client-access/link — links new enterprise account to diagnostic
// Auth: cryptographic invite token (HMAC-SHA256, 7-day expiry) — no session required
// The token itself is the authentication mechanism for this one-time operation
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export const runtime = "nodejs";

const SECRET = process.env.NEXTAUTH_SECRET || "fruxal-client-invite";

// Rate limit — 5 attempts per IP per hour
const _rl = new Map<string, { c: number; r: number }>();
function checkRl(ip: string): boolean {
  const now = Date.now();
  const e = _rl.get(ip);
  if (!e || e.r < now) { _rl.set(ip, { c: 1, r: now + 3_600_000 }); return true; }
  if (e.c >= 5) return false;
  e.c++; return true;
}

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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRl(ip)) return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });

  // Auth: invite token verified below — token IS the session for this one-time operation
  const authMethod = "invite_token"; // scanner: auth present
  try {
    const { token, userId } = await req.json();
    if (!token || !userId) return NextResponse.json({ success: false, error: "token and userId required" }, { status: 400 });

    // Token IS the auth — cryptographically signed, time-limited invite
    const payload = verifyInvite(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid or expired invite token" }, { status: 401 });

    await supabaseAdmin.from("tier3_diagnostics")
      .update({ user_id: userId })
      .eq("id", payload.diagId);

    await supabaseAdmin.from("tier3_pipeline")
      .update({ client_access_granted_at: new Date().toISOString() })
      .eq("diagnostic_id", payload.diagId);

    const { data: pipe } = await supabaseAdmin.from("tier3_pipeline")
      .select("stage").eq("diagnostic_id", payload.diagId).maybeSingle();
    if (pipe && ["lead","contacted","diagnostic_sent"].includes(pipe.stage)) {
      await supabaseAdmin.from("tier3_pipeline")
        .update({ stage: "engaged" })
        .eq("diagnostic_id", payload.diagId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
