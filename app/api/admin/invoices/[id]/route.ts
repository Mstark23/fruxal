// PATCH /api/admin/invoices/[id] — update invoice status
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const body = await req.json();
  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.status)   update.status   = body.status;
  if (body.paid_at)  update.paid_at  = body.paid_at;
  if (body.notes)    update.notes    = body.notes;

  // If marking paid — also advance pipeline to completed + create rep commission
  if (body.status === "paid") {
    const { data: inv } = await supabaseAdmin
      .from("fruxal_invoices")
      .select("pipeline_id, fee_amount")
      .eq("id", params.id)
      .single();

    if (inv?.pipeline_id) {
      // Advance to completed
      await supabaseAdmin.from("tier3_pipeline").update({
        stage: "completed", updated_at: new Date().toISOString(),
      }).eq("id", inv.pipeline_id);

      // Create rep commission (20% of Fruxal fee = ~2.4% of savings)
      const { data: pipe } = await supabaseAdmin
        .from("tier3_pipeline")
        .select("rep_id")
        .eq("id", inv.pipeline_id)
        .single();

      if (pipe?.rep_id) {
        const commissionAmount = Math.round((inv.fee_amount || 0) * 0.20);
        await supabaseAdmin.from("tier3_rep_commissions").insert({
          rep_id:            pipe.rep_id,
          pipeline_id:       inv.pipeline_id,
          commission_amount: commissionAmount,
          status:            "pending",
          created_at:        new Date().toISOString(),
        }).catch(() => {});
      }
    }
  }

  const { error } = await supabaseAdmin
    .from("fruxal_invoices")
    .update(update)
    .eq("id", params.id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
