// =============================================================================
// GET  /api/v2/notifications — Fetch notification feed (bell icon)
// POST /api/v2/notifications — Mark notification(s) as read
// =============================================================================
// Direct DB implementation — no Supabase RPC required.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit     = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const offset    = Number(searchParams.get("offset")) || 0;
    const unreadOnly = searchParams.get("unread") === "1";

    const userId = (token as any).id || token.sub;

    let query = supabaseAdmin
      .from("notifications")
      .select("id, type, title, message, data, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) query = query.is("read_at", null);

    const { data, error } = await query;
    if (error) {
      // notifications table may not exist yet — return empty gracefully
      return NextResponse.json({ success: true, data: [] });
    }

    const unreadCount = data?.filter(n => !n.read_at).length ?? 0;
    return NextResponse.json({ success: true, data: data || [], unreadCount });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { notificationId, markAll } = body;
    const userId = (token as any).id || token.sub;
    const now = new Date().toISOString();

    if (markAll) {
      await supabaseAdmin
        .from("notifications")
        .update({ read_at: now })
        .eq("user_id", userId)
        .is("read_at", null);
    } else if (notificationId) {
      await supabaseAdmin
        .from("notifications")
        .update({ read_at: now })
        .eq("id", notificationId)
        .eq("user_id", userId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
