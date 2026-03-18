// =============================================================================
// POST /api/auth/check-email
// Returns account status for an email (no auth required)
// Used by login page to show helpful error messages
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ exists: false });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, password_hash, image")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!user) {
    return NextResponse.json({ exists: false, method: null });
  }

  // Has password_hash → registered with email/password
  // Has image but no password_hash → registered with Google
  const method = user.password_hash ? "credentials" : "google";
  return NextResponse.json({ exists: true, method });
}
