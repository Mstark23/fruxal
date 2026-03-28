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
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
