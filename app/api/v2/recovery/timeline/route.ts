// =============================================================================
// GET /api/v2/recovery/timeline — Customer recovery timeline data
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 15;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  try {
    // Get pipeline + rep
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("id, stage, contact_name, rep_id, tier3_rep_assignments(tier3_reps(name, email, calendly_url))")
      .eq("user_id", userId)
      .in("stage", ["contacted","called","diagnostic_sent","agreement_out",
                     "signed","in_engagement","recovery_tracking","fee_collected"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle() as any;

    let rep: any = null;
    let pipeline: any = null;

    if (pipe) {
      pipeline = { id: pipe.id, stage: pipe.stage };
      const repData = pipe.tier3_rep_assignments?.[0]?.tier3_reps;
      if (repData) rep = { name: repData.name, email: repData.email, calendly_url: repData.calendly_url };
    }

    // Get confirmed findings via engagement
    let findings: any[] = [];
    let feePercent = 12;

    if (pipe?.id) {
      // Get engagement (join via pipeline → diagnostic → engagement)
      const { data: pipeRow } = await supabaseAdmin
        .from("tier3_pipeline")
        .select("diagnostic_id")
        .eq("id", pipe.id)
        .maybeSingle();

      if (pipeRow?.diagnostic_id) {
        const { data: eng } = await supabaseAdmin
          .from("tier3_engagements")
          .select("id, fee_percentage")
          .eq("diagnostic_id", pipeRow.diagnostic_id)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (eng?.id) {
          feePercent = eng.fee_percentage || 12;
          const { data: found } = await supabaseAdmin
            .from("tier3_confirmed_findings")
            .select("*")
            .eq("engagement_id", eng.id)
            .order("created_at", { ascending: false });
          findings = found || [];
        }
      }
    }

    // Also check user_progress for rep-confirmed total
    const { data: prog } = await supabaseAdmin
      .from("user_progress")
      .select("total_recovered")
      .eq("user_id", userId)
      .maybeSingle();

    const confirmed = findings.reduce((s, f) => s + (f.confirmed_amount ?? 0), 0)
      || (prog?.total_recovered ?? 0);
    const fee_paid = Math.round(confirmed * (feePercent / 100));
    const net = confirmed - fee_paid;

    return NextResponse.json({
      success: true,
      rep,
      pipeline,
      findings,
      totals: { confirmed, fee_paid, net, fee_pct: feePercent },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
