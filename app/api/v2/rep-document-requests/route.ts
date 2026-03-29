// =============================================================================
// GET /api/v2/rep-document-requests — Customer: see what rep has requested
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  try {
    // Find the user's pipeline → engagement
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("diagnostic_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!pipe?.diagnostic_id) return NextResponse.json({ requests: [] });

    const { data: eng } = await supabaseAdmin
      .from("tier3_engagements")
      .select("id")
      .eq("diagnostic_id", pipe.diagnostic_id)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!eng?.id) return NextResponse.json({ requests: [] });

    const { data: docs } = await supabaseAdmin
      .from("tier3_engagement_documents")
      .select("id, document_type, label, status, notes, received_at")
      .eq("engagement_id", eng.id)
      .in("status", ["requested", "pending", "received", "reviewed"])
      .order("created_at", { ascending: false });

    // Also check rep_document_requests (written by accountants)
    const { data: acctDocs } = await supabaseAdmin
      .from("rep_document_requests")
      .select("id, label, notes, status, created_at")
      .eq("pipeline_id", pipe.id)
      .in("status", ["pending", "received", "reviewed"])
      .order("created_at", { ascending: false });

    const merged = [
      ...(docs || []).map((d: any) => ({ ...d, source: "rep" })),
      ...(acctDocs || []).map((d: any) => ({
        id: d.id, document_type: "document", label: d.label,
        status: d.status, notes: d.notes, received_at: null, source: "accountant",
      })),
    ];

    return NextResponse.json({ requests: merged });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
