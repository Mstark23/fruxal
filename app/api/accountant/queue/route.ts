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
      .select("*, tier3_pipeline(company_name, contact_name, contact_email, stage, report_id, tier3_reps(name, email))")
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
        // Get this playbook's pipeline_id + finding context
        const { data: pb } = await supabaseAdmin
          .from("execution_playbooks")
          .select("pipeline_id, diagnostic_report_id, finding_id, finding_title, category, amount_recoverable")
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
          const { data: pipeUpdate } = await supabaseAdmin
            .from("tier3_pipeline")
            .update({
              confirmed_savings: totalConfirmed,
              updated_at: new Date().toISOString(),
              ...(allDone ? { stage: "fee_collected" } : {}),
            })
            .eq("id", pb.pipeline_id)
            .select("company_name, contact_name, contact_email, diagnostic_id, tier3_reps(name, calendly_url)")
            .single();

          // Write to tier3_confirmed_findings so customer /v2/recovery page sees it
          if (pipeUpdate?.diagnostic_id) {
            const { data: eng } = await supabaseAdmin
              .from("tier3_engagements")
              .select("id")
              .eq("diagnostic_id", pipeUpdate.diagnostic_id)
              .order("started_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (eng?.id) {
              // Check if a finding for this playbook already exists, if so update, else insert
              const { data: existing } = await supabaseAdmin
                .from("tier3_confirmed_findings")
                .select("id")
                .eq("engagement_id", eng.id)
                .eq("leak_id", pb.finding_id || playbook_id)
                .maybeSingle();

              if (existing?.id) {
                await supabaseAdmin.from("tier3_confirmed_findings")
                  .update({ confirmed_amount: Number(confirmed_amount), confidence_note: "Confirmed by accountant" })
                  .eq("id", existing.id)
                  .catch((e: any) => console.error("[Accountant:Queue] confirmed_findings update failed:", e.message));
              } else {
                await supabaseAdmin.from("tier3_confirmed_findings").insert({
                  engagement_id:    eng.id,
                  leak_id:          pb.finding_id  || playbook_id,
                  leak_name:        pb.finding_title || "Recovery",
                  category:         pb.category     || "general",
                  estimated_low:    pb.amount_recoverable || 0,
                  estimated_high:   pb.amount_recoverable || 0,
                  confirmed_amount: Number(confirmed_amount),
                  confidence_note:  "Confirmed by accountant",
                }).catch((e: any) => console.error("[Accountant:Queue] confirmed_findings insert failed:", e.message));
              }
            }
          }

          // Notify client of confirmed saving (non-blocking)
          if (pipeUpdate?.contact_email && confirmed_amount) {
            const { sendEmail } = await import("@/services/email/service");
            const repName = (pipeUpdate.tier3_reps as any)?.name || "Fruxal";
            const appUrl = process.env.NEXTAUTH_URL || "https://fruxal.ca";
            await sendEmail({
              to: pipeUpdate.contact_email,
              subject: `$${Number(confirmed_amount).toLocaleString()} recovered — ${pb.finding_title || "savings confirmed"}`,
              html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f7f8fa;padding:40px 20px">
<div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#0A1F12,#1B3A2D);padding:24px 32px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <div style="width:24px;height:24px;border-radius:5px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center">
        <span style="color:white;font-weight:900;font-size:11px">F</span>
      </div>
      <span style="color:rgba(255,255,255,0.7);font-size:13px;font-weight:600">Fruxal</span>
    </div>
    <p style="margin:0;font-size:22px;font-weight:800;color:white">$${Number(confirmed_amount).toLocaleString()} confirmed ✓</p>
    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.6)">${pb.finding_title || "Savings confirmed"}</p>
  </div>
  <div style="padding:24px 32px">
    <p style="font-size:14px;color:#3A3935;margin:0 0 16px">Hi ${pipeUpdate.contact_name || "there"},</p>
    <p style="font-size:14px;color:#3A3935;margin:0 0 16px;line-height:1.6">
      Great news — we've confirmed <strong>$${Number(confirmed_amount).toLocaleString()}</strong> in recovered savings for your file.
    </p>
    <div style="background:#FAFAF8;border:1px solid #E8E6E1;border-radius:10px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-size:12px;color:#8E8C85;text-transform:uppercase;letter-spacing:0.05em">Total confirmed so far</p>
      <p style="margin:0;font-size:20px;font-weight:800;color:#2D7A50">$${totalConfirmed.toLocaleString()}</p>
    </div>
    <p style="font-size:13px;color:#8E8C85;margin:0">Your Fruxal team will continue working on the remaining findings. You'll receive an update as each one is confirmed.</p>
  </div>
</div></body></html>`,
            }).catch((e: any) => console.warn("[Accountant:Queue] client notification failed:", e.message));
          }

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
            }).catch((e: any) => console.warn("[Accountant:Queue] admin notification failed:", e.message));
          }
        }
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
