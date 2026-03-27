// =============================================================================
// POST /api/auth/reset-password — Verify token + update password
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: "token and password required" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    // Find valid unused token
    const { data: rec } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("user_id, expires_at, used")
      .eq("token", token)
      .maybeSingle();

    if (!rec || rec.used) return NextResponse.json({ error: "Invalid or already-used reset link" }, { status: 400 });
    if (new Date(rec.expires_at) < new Date()) return NextResponse.json({ error: "This link has expired. Request a new one." }, { status: 400 });

    // Update password
    const hashed = await bcrypt.hash(password, 12);
    await supabaseAdmin.from("users").update({ password_hash: hashed }).eq("id", rec.user_id);

    // Mark token used
    await supabaseAdmin.from("password_reset_tokens").update({ used: true }).eq("token", token);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
