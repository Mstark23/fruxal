// GET /api/accountant/queue — accountant's assigned work queue
// PATCH /api/accountant/queue — update a playbook status
import { NextRequest, NextResponse } from "next/server";
import { requireAccountant } from "@/lib/accountant-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const auth = await requireAccountant(req);
  if (!auth.authorized) return auth.error!;
  const a = auth.accountant!;

  try {
    const { data: playbooks } = await supabaseAdmin
      .from("execution_playbooks")
      .select("*, tier3_pipeline!inner(company_name, contact_name, contact_email, stage, report_id, tier3_reps(name, email))")
      .eq("assigned_to", a.id)
      .neq("status", "closed")
      .order("quick_win", { ascending: false })
      .order("amount_recoverable", { ascending: false });

    const all = playbooks || [];

    // Enrich with business profile
    const reportIds = [...new Set(all.map((p: any) => p.tier3_pipeline?.report_id).filter(Boolean))];
    const profiles: Record<string, any> = {};
    if (reportIds.length) {
      const { data: reports } = await supabaseAdmin
        .from("diagnostic_reports")
        .select("id, business_id")
        .in("id", reportIds as string[]);
      const bizIds = [...new Set((reports || []).map((r: any) => r.business_id))];
      if (bizIds.length) {
        const { data: profs } = await supabaseAdmin
          .from("business_profiles")
          .select("business_id, industry, province, exact_annual_revenue, annual_revenue")
          .in("business_id", bizIds as string[]);
        (reports || []).forEach((r: any) => {
          const p = (profs || []).find((bp: any) => bp.business_id === r.business_id);
          if (p) profiles[r.id] = p;
        });
      }
    }

    const queued      = all.filter((p: any) => p.status === "queued");
    const in_progress = all.filter((p: any) => p.status === "in_progress");
    const submitted   = all.filter((p: any) => p.status === "submitted");
    const confirmed   = all.filter((p: any) => p.status === "confirmed");

    const totalRecoverable = all.reduce((s: number, p: any) => s + (p.amount_recoverable || 0), 0);
    const totalConfirmed   = confirmed.reduce((s: number, p: any) => s + (p.confirmed_amount || p.amount_recoverable || 0), 0);

    return NextResponse.json({
      success: true,
      playbooks: all.map((p: any) => ({
        ...p,
        company_name:  p.tier3_pipeline?.company_name,
        contact_name:  p.tier3_pipeline?.contact_name,
        rep_name:      (p.tier3_pipeline?.tier3_reps as any)?.name,
        profile:       profiles[p.tier3_pipeline?.report_id] || null,
      })),
      summary: {
        total: all.length,
        queued: queued.length,
        in_progress: in_progress.length,
        submitted: submitted.length,
        confirmed: confirmed.length,
        total_recoverable: totalRecoverable,
        total_confirmed:   totalConfirmed,
        quick_wins: queued.filter((p: any) => p.quick_win).length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAccountant(req);
  if (!auth.authorized) return auth.error!;
  const a = auth.accountant!;

  try {
    const { playbook_id, status, notes, confirmed_amount } = await req.json();
    if (!playbook_id) return NextResponse.json({ success: false, error: "playbook_id required" }, { status: 400 });

    // Verify this playbook belongs to this accountant
    const { data: pb } = await supabaseAdmin
      .from("execution_playbooks")
      .select("id, assigned_to")
      .eq("id", playbook_id)
      .single();

    if (!pb || pb.assigned_to !== a.id) {
      return NextResponse.json({ success: false, error: "Not authorized for this playbook" }, { status: 403 });
    }

    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status)                       update.status           = status;
    if (notes !== undefined)          update.notes            = notes;
    if (confirmed_amount !== undefined) {
      update.confirmed_amount = confirmed_amount;
      if (status === "confirmed") update.confirmed_at = new Date().toISOString();
    }

    await supabaseAdmin.from("execution_playbooks").update(update).eq("id", playbook_id);

    // When a finding is confirmed → check total confirmed + notify
    if (status === "confirmed" && confirmed_amount !== undefined) {
      try {
        // Get this playbook's pipeline_id
        const { data: pb } = await supabaseAdmin
          .from("execution_playbooks")
          .select("pipeline_id, diagnostic_report_id")
          .eq("id", playbook_id)
          .single();

        if (pb?.pipeline_id) {
          // Sum all confirmed amounts for this pipeline
          const { data: allPbs } = await supabaseAdmin
            .from("execution_playbooks")
            .select("status, confirmed_amount, amount_recoverable")
            .eq("pipeline_id", pb.pipeline_id);

          const totalConfirmed = (allPbs || [])
            .filter((p: any) => p.status === "confirmed")
            .reduce((s: number, p: any) => s + (p.confirmed_amount || p.amount_recoverable || 0), 0);

          const allDone = (allPbs || []).every((p: any) =>
            ["confirmed", "closed"].includes(p.status)
          );

          // Update pipeline with confirmed savings total
          await supabaseAdmin.from("tier3_pipeline").update({
            confirmed_savings: totalConfirmed,
            updated_at: new Date().toISOString(),
            ...(allDone ? { stage: "fee_collected" } : {}),
          }).eq("id", pb.pipeline_id);

          // Notify admin if all done
          if (allDone) {
            const { notifyAdmin } = await import("@/lib/admin-notify");
            const { data: pipe } = await supabaseAdmin
              .from("tier3_pipeline")
              .select("company_name")
              .eq("id", pb.pipeline_id)
              .single();
            await notifyAdmin({
              type:    "fee_collected",
              company: pipe?.company_name || "Client",
              amount:  totalConfirmed,
              extra:   `Fruxal fee: $${Math.round(totalConfirmed * 0.12).toLocaleString()}`,
            }).catch(() => {});
          }
        }
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
