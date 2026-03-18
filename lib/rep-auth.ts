// lib/rep-auth.ts — Rep portal authentication
// Reads cookie from raw HTTP header to avoid Next.js 14 App Router cookie issues.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

const SECRET   = process.env.NEXTAUTH_SECRET || "fruxal-rep-secret";
const COOKIE   = "fruxal_rep_session";
const TTL_DAYS = 30;

function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig  = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}

export function generateMagicToken(repId: string, email: string): string {
  return sign({ repId, email, exp: Date.now() + 15 * 60 * 1000, type: "magic" });
}

export function generateSessionToken(repId: string, email: string): string {
  return sign({ repId, email, exp: Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000, type: "session" });
}

// Read cookie from raw Cookie header — bypasses all Next.js abstractions
function getRawCookie(req: NextRequest, name: string): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function requireRep(req: NextRequest): Promise<{
  authorized: boolean; repId?: string; email?: string; rep?: any; error?: NextResponse;
}> {
  const token = getRawCookie(req, COOKIE);

  if (!token) {
    return {
      authorized: false,
      error: NextResponse.json({ success: false, error: "Rep login required — no cookie found" }, { status: 401 }),
    };
  }

  const payload = verifyToken(token);
  if (!payload || payload.type !== "session") {
    return {
      authorized: false,
      error: NextResponse.json({ success: false, error: "Invalid or expired session token" }, { status: 401 }),
    };
  }

  const { data: rep } = await supabaseAdmin
    .from("tier3_reps")
    .select("id, name, email, phone, province, commission_rate, status")
    .eq("id", payload.repId)
    .eq("status", "active")
    .single();

  if (!rep) {
    return {
      authorized: false,
      error: NextResponse.json({ success: false, error: "Rep account not found or deactivated" }, { status: 403 }),
    };
  }

  return { authorized: true, repId: rep.id, email: rep.email, rep };
}
