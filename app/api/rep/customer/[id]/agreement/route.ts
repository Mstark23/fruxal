// =============================================================================
// GET /api/rep/customer/[id]/agreement — Generate engagement agreement PDF
// =============================================================================
// Rep-accessible version of the agreement generator.
// id = pipeline_id (works for both T1/T2 and T3)
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  const pipelineId = params.id;

  try {
    // Verify rep owns this pipeline
    const { data: assignment } = await supabaseAdmin
      .from("tier3_rep_assignments")
      .select("rep_id, tier3_reps(contingency_rate)")
      .eq("pipeline_id", pipelineId)
      .eq("rep_id", auth.repId!)
      .maybeSingle() as any;

    if (!assignment) {
      return NextResponse.json({ error: "Not authorized for this client" }, { status: 403 });
    }

    // Get engagement if it exists, otherwise use pipeline data
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("*")
      .eq("id", pipelineId)
      .single();

    if (!pipe) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

    const { data: eng } = await supabaseAdmin
      .from("tier3_engagements")
      .select("id, fee_percentage")
      .eq("diagnostic_id", pipe.diagnostic_id || "")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const feePercent = eng?.fee_percentage
      || (assignment.tier3_reps as any)?.contingency_rate
      || 12;

    // Delegate to admin agreement endpoint (reuse logic)
    if (eng?.id) {
      const adminUrl = `${process.env.NEXTAUTH_URL || "https://fruxal.ca"}/api/admin/tier3/engagements/${eng.id}/agreement`;
      // Forward to admin endpoint with service-level auth
      const res = await fetch(adminUrl, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      });
      if (res.ok) {
        const pdf = await res.arrayBuffer();
        return new NextResponse(pdf as any, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Fruxal-Agreement-${(pipe.company_name || "Client").replace(/[^a-z0-9]/gi, "-")}.pdf"`,
          },
        });
      }
    }

    // No engagement yet — generate basic agreement from pipeline data
    // Redirect to admin agreement generator with pipeline context
    return NextResponse.json({
      success: false,
      error: "No engagement found. Create an engagement first (admin must start engagement).",
      pipelineStage: pipe.stage,
    }, { status: 422 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
