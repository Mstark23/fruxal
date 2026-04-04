// =============================================================================
// GET /api/v2/qbr/latest — Client-facing QBR endpoint
// =============================================================================
// Returns the latest Quarterly Business Review for the authenticated user.
// If no QBR exists yet, returns a null QBR with a helpful message.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Look up businessId
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id")
      .eq("user_id", userId)
      .maybeSingle();

    const businessId = profile?.business_id;
    if (!businessId) {
      return NextResponse.json({ success: true, qbr: null, message: "No business profile found" });
    }

    // Try qbr_reports table first
    let qbr: any = null;
    try {
      const { data } = await supabaseAdmin
        .from("qbr_reports")
        .select("id, summary, generated_at, highlights, next_review_date, content")
        .eq("business_id", businessId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) qbr = data;
    } catch {
      // Table may not exist — fall through
    }

    // Fallback: check tier3_engagements for QBR events
    if (!qbr) {
      try {
        const { data } = await supabaseAdmin
          .from("tier3_engagements")
          .select("id, notes, created_at, stage")
          .eq("user_id", userId)
          .or("stage.eq.qbr,stage.ilike.%quarterly%")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          qbr = {
            id: data.id,
            summary: data.notes || "Quarterly Business Review completed.",
            generated_at: data.created_at,
            highlights: [],
            next_review_date: null,
          };
        }
      } catch {
        // Table may not exist
      }
    }

    // Fallback: check business_timeline for QBR events
    if (!qbr) {
      try {
        const { data } = await supabaseAdmin
          .from("business_timeline")
          .select("id, description, created_at, event_type, metadata")
          .eq("business_id", businessId)
          .or("event_type.eq.qbr,event_type.ilike.%review%")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          const meta = typeof data.metadata === "string" ? JSON.parse(data.metadata || "{}") : (data.metadata || {});
          qbr = {
            id: data.id,
            summary: data.description || meta.summary || "Quarterly review completed.",
            generated_at: data.created_at,
            highlights: meta.highlights || [],
            next_review_date: meta.next_review_date || null,
          };
        }
      } catch {
        // Table may not exist
      }
    }

    if (!qbr) {
      return NextResponse.json({
        success: true,
        qbr: null,
        message: "No QBR available yet",
      });
    }

    // Parse highlights if stored as JSON string
    let highlights = qbr.highlights || [];
    if (typeof highlights === "string") {
      try { highlights = JSON.parse(highlights); } catch { highlights = []; }
    }

    // Calculate next review date if not set (90 days from generated_at)
    const nextReview = qbr.next_review_date ||
      (qbr.generated_at ? new Date(new Date(qbr.generated_at).getTime() + 90 * 86400000).toISOString().split("T")[0] : null);

    return NextResponse.json({
      success: true,
      qbr: {
        summary: qbr.content || qbr.summary || "",
        generated_at: qbr.generated_at,
        highlights,
        next_review_date: nextReview,
      },
    });
  } catch (err: any) {
    console.error("[QBR/latest]", err.message);
    return NextResponse.json({ success: false, error: "Failed to fetch QBR" }, { status: 500 });
  }
}
