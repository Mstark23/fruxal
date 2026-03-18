// POST /api/v2/programs/sync
// Triggers programs re-match for the current user after intake/diagnostic.
// No-op endpoint — programs are already matched on GET via business_profiles.
// This exists so the report page can fire it as a background signal.
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = (token as any)?.id || token?.sub;
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    // Programs are already dynamically matched on GET — nothing to pre-sync
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
