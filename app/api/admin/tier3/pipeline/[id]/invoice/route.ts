// =============================================================================
// POST /api/admin/tier3/pipeline/[id]/invoice
// Creates a Stripe payment link for the contingency fee and sends it to client.
// Falls back to a PDF invoice email if Stripe is not configured.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/services/email/service";

export const maxDuration = 30;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id: pipelineId } = params;

  try {
    // Fetch pipeline + confirmed savings
    const { data: pipe } = await supabaseAdmin
      .from("tier3_pipeline")
      .select("*, tier3_reps(name, email, contingency_rate)")
      .eq("id", pipelineId)
      .single();

    if (!pipe) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const confirmedSavings = pipe.confirmed_savings || 0;
    if (confirmedSavings <= 0) {
      return NextResponse.json({ success: false, error: "No confirmed savings to invoice" }, { status: 422 });
    }

    const rate       = (pipe.tier3_reps as any)?.contingency_rate ?? 12;
    const feeAmount  = Math.round(confirmedSavings * (rate / 100));
    const appUrl     = process.env.NEXTAUTH_URL || "https://fruxal.ca";
    const invoiceNum = `FRX-${new Date().getFullYear()}-${pipelineId.slice(0, 6).toUpperCase()}`;

    let paymentUrl: string | null = null;

    // Try Stripe first
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      try {
        const stripeRes = await fetch("https://api.stripe.com/v1/payment_links", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            "line_items[0][price_data][currency]": "cad",
            "line_items[0][price_data][product_data][name]": `Fruxal Recovery Fee — ${pipe.company_name}`,
            "line_items[0][price_data][product_data][description]": `${rate}% contingency fee on $${confirmedSavings.toLocaleString()} confirmed savings. Invoice: ${invoiceNum}`,
            "line_items[0][price_data][unit_amount]": String(feeAmount * 100), // cents
            "line_items[0][quantity]": "1",
            "metadata[pipeline_id]": pipelineId,
            "metadata[invoice_num]": invoiceNum,
            "after_completion[type]": "redirect",
            "after_completion[redirect][url]": `${appUrl}/payment-success?invoice=${invoiceNum}`,
          }),
        });
        const stripeData = await stripeRes.json();
        if (stripeData.url) paymentUrl = stripeData.url;
      } catch { /* fall through to email invoice */ }
    }

    // Record invoice in DB
    await supabaseAdmin.from("fruxal_invoices").upsert({
      pipeline_id:       pipelineId,
      invoice_number:    invoiceNum,
      company_name:      pipe.company_name,
      contact_email:     pipe.contact_email,
      confirmed_savings: confirmedSavings,
      fee_percentage:    rate,
      fee_amount:        feeAmount,
      payment_url:       paymentUrl,
      status:            "sent",
      sent_at:           new Date().toISOString(),
      created_at:        new Date().toISOString(),
      updated_at:        new Date().toISOString(),
    }, { onConflict: "pipeline_id" });

    // Advance pipeline to fee_collected
    await supabaseAdmin.from("tier3_pipeline").update({
      stage:      "fee_collected",
      updated_at: new Date().toISOString(),
    }).eq("id", pipelineId);

    // Send invoice email to client
    if (pipe.contact_email) {
      const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f7f8fa;padding:40px 20px">
<div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#0F2419,#1B3A2D);padding:28px 32px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
      <div style="width:26px;height:26px;border-radius:6px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center">
        <span style="color:white;font-weight:900;font-size:12px">F</span>
      </div>
      <span style="color:rgba(255,255,255,0.8);font-size:13px;font-weight:600">Fruxal</span>
    </div>
    <h1 style="margin:0;font-size:18px;font-weight:800;color:white">Your recovery is confirmed.</h1>
    <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.6)">Invoice ${invoiceNum}</p>
  </div>
  <div style="padding:28px 32px">
    <p style="font-size:14px;color:#3A3935;margin:0 0 20px">Hi ${pipe.contact_name || "there"},</p>
    <p style="font-size:14px;color:#3A3935;margin:0 0 20px;line-height:1.6">
      Your financial recovery is complete. Here's a summary:
    </p>
    <div style="background:#FAFAF8;border:1px solid #E8E6E1;border-radius:10px;padding:20px;margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:13px;color:#8E8C85">Confirmed savings recovered</span>
        <span style="font-size:13px;font-weight:700;color:#2D7A50">$${confirmedSavings.toLocaleString()}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:13px;color:#8E8C85">Fruxal fee (${rate}%)</span>
        <span style="font-size:13px;font-weight:700;color:#1A1A18">$${feeAmount.toLocaleString()}</span>
      </div>
      <div style="height:1px;background:#E8E6E1;margin:12px 0"></div>
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:14px;font-weight:700;color:#1A1A18">You keep</span>
        <span style="font-size:16px;font-weight:800;color:#2D7A50">$${(confirmedSavings - feeAmount).toLocaleString()}</span>
      </div>
    </div>
    ${paymentUrl ? `
    <div style="text-align:center;margin-bottom:20px">
      <a href="${paymentUrl}" style="display:inline-block;background:linear-gradient(135deg,#1B3A2D,#2D7A50);color:white;font-weight:800;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none">
        Pay Invoice — $${feeAmount.toLocaleString()} →
      </a>
      <p style="font-size:11px;color:#B5B3AD;margin:8px 0 0">Secure payment via Stripe</p>
    </div>` : `
    <p style="font-size:13px;color:#56554F;margin:0 0 20px">
      Please arrange payment of <strong>$${feeAmount.toLocaleString()}</strong> via e-transfer to <a href="mailto:payments@fruxal.com" style="color:#1B3A2D">payments@fruxal.com</a> with reference <strong>${invoiceNum}</strong>.
    </p>`}
    <p style="font-size:12px;color:#B5B3AD;margin:0">
      Questions? Reply to this email or contact <a href="mailto:hello@fruxal.com" style="color:#B5B3AD">hello@fruxal.com</a>
    </p>
  </div>
</div></body></html>`;

      await sendEmail({
        to:      pipe.contact_email,
        subject: `Fruxal Invoice ${invoiceNum} — $${feeAmount.toLocaleString()} CAD`,
        html,
      });
    }

    return NextResponse.json({
      success:        true,
      invoice_number: invoiceNum,
      fee_amount:     feeAmount,
      payment_url:    paymentUrl,
      email_sent:     !!pipe.contact_email,
    });

  } catch (err: any) {
    console.error("[invoice POST]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
