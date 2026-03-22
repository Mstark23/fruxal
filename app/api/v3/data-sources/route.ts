import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30; // Vercel function timeout (seconds)

// ── Ownership helper ──────────────────────────────────────────────────────────
async function verifyOwnership(userId: string, businessId: string): Promise<boolean> {
  const { data } = await Promise.resolve(await supabaseAdmin
    .from("business_profiles")
    .select("business_id")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .single()
    ).catch(() => ({ data: null }));
  return !!data;
}

/**
 * GET /api/v3/data-sources?businessId=xxx
 */
export async function GET(req: NextRequest) {
  try {

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  // IDOR fix: verify caller owns this businessId
  if (!(await verifyOwnership(userId, businessId))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from("data_sources")
    .select("id, source_type, source_name, status, total_rows, mapped_rows, last_sync_at, metadata, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sources: data || [] });  } catch (e: any) {
    console.error("[app/api/v3/data-sources/route.ts]", e.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/v3/data-sources — remove a source and its transactions
 * Body: { id: string, businessId: string }
 */
export async function DELETE(req: NextRequest) {
  try {

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, businessId } = body;
  if (!id || !businessId) return NextResponse.json({ error: "id and businessId required" }, { status: 400 });

  // IDOR fix: verify caller owns the businessId before deleting anything
  if (!(await verifyOwnership(userId, businessId))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const sb = getSupabase();

  // Scope deletes to businessId — prevents deleting another business's source
  // even if a valid data_source UUID is somehow obtained
  await sb.from("raw_transactions").delete().eq("data_source_id", id).eq("business_id", businessId);
  const { error } = await sb.from("data_sources").delete().eq("id", id).eq("business_id", businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });  } catch (e: any) {
    console.error("[app/api/v3/data-sources/route.ts]", e.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
