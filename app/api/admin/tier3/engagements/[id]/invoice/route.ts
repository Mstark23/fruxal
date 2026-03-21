// =============================================================================
// GET /api/admin/tier3/engagements/[id]/invoice — Generate invoice PDF
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PDFDocument from "pdfkit";

const COLORS = { navy: "#0F2B46", green: "#00A844", white: "#FFFFFF", gray: "#6B7280", text: "#4B5563", light: "#F3F4F6", dark: "#374151" };
const PAGE_W = 612; const PAGE_H = 792; const M = 54; const CW = PAGE_W - M * 2;

function $(n: number): string { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function $int(n: number): string { return "$" + n.toLocaleString("en-US"); }

const CAT_LABELS: Record<string, string> = {
  tax_structure: "Tax Structure", vendor_procurement: "Vendor & Procurement",
  payroll_hr: "Payroll & HR", banking_treasury: "Banking & Treasury",
  insurance: "Insurance", saas_technology: "SaaS & Technology",
  compliance_penalties: "Compliance & Penalties",
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id } = params;

  try {
    // Fetch engagement + findings
    const [engRes, findingsRes] = await Promise.all([
      supabaseAdmin.from("tier3_engagements").select("*").eq("id", id).single(),
      supabaseAdmin.from("tier3_confirmed_findings").select("*").eq("engagement_id", id).order("created_at"),
    ]);

    const eng = engRes.data;
    if (!eng) return NextResponse.json({ error: "Engagement not found" }, { status: 404 });

    const findings = findingsRes.data || [];
    if (findings.length === 0) return NextResponse.json({ error: "No confirmed findings to invoice" }, { status: 400 });

    const totalSavings = findings.reduce((s: number, f: any) => s + (f.confirmed_amount ?? 0), 0);
    const feeAmount = totalSavings * (eng.fee_percentage / 100);
    const invoiceNum = `FRX-INV-${new Date().getFullYear()}-${id.slice(0, 6).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

    // Generate PDF
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: "LETTER", margins: { top: M, bottom: M, left: M, right: M }, info: { Title: `Invoice ${invoiceNum}`, Author: "Fruxal Diagnostic Inc." } });
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ═══ HEADER ═══
      doc.rect(0, 0, PAGE_W, 70).fill(COLORS.navy);
      doc.fontSize(20).font("Helvetica-Bold").fillColor(COLORS.white).text("FRUXAL", M, 24);
      doc.fontSize(9).font("Helvetica").fillColor("#AABBCC").text("INVOICE", M, 28, { width: CW, align: "right" });

      // ═══ INVOICE META ═══
      let y = 90;
      doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.navy);
      doc.text("Invoice Number:", M, y); doc.font("Helvetica").fillColor(COLORS.text).text(invoiceNum, M + 110, y);
      y += 16;
      doc.font("Helvetica-Bold").fillColor(COLORS.navy).text("Date:", M, y); doc.font("Helvetica").fillColor(COLORS.text).text(dateStr, M + 110, y);
      y += 16;
      doc.font("Helvetica-Bold").fillColor(COLORS.navy).text("Billed To:", M, y); doc.font("Helvetica").fillColor(COLORS.text).text(eng.company_name, M + 110, y);
      y += 16;
      doc.font("Helvetica-Bold").fillColor(COLORS.navy).text("Engagement ID:", M, y); doc.font("Helvetica").fillColor(COLORS.gray).text(id, M + 110, y);
      y += 30;

      // Green divider
      doc.moveTo(M, y).lineTo(PAGE_W - M, y).strokeColor(COLORS.green).lineWidth(2).stroke();
      y += 16;

      // ═══ DESCRIPTION ═══
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.text).lineGap(3);
      doc.text(
        `This invoice covers contingency fees earned under the Fruxal Diagnostic Engagement Agreement for ${eng.company_name}. Fees are calculated as ${eng.fee_percentage}% of confirmed and recovered savings identified during the engagement.`,
        M, y, { width: CW }
      );
      y = doc.y + 20;

      // ═══ LINE ITEMS TABLE ═══
      // Header row
      doc.rect(M, y, CW, 22).fill(COLORS.navy);
      doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.white);
      doc.text("#", M + 8, y + 6, { width: 20 });
      doc.text("Finding", M + 30, y + 6, { width: 200 });
      doc.text("Category", M + 240, y + 6, { width: 100 });
      doc.text("Estimated", M + 340, y + 6, { width: 80 });
      doc.text("Confirmed", M + 430, y + 6, { width: 80, align: "right" });
      y += 22;

      // Rows
      findings.forEach((f: any, i: number) => {
        const rowBg = i % 2 === 0 ? COLORS.light : COLORS.white;
        doc.rect(M, y, CW, 20).fill(rowBg);
        doc.fontSize(8).font("Helvetica").fillColor(COLORS.text);
        doc.text(String(i + 1), M + 8, y + 5, { width: 20 });
        doc.text(f.leak_name || "—", M + 30, y + 5, { width: 200 });
        doc.text(CAT_LABELS[f.category] || f.category, M + 240, y + 5, { width: 100 });
        doc.text(`${$int(f.estimated_low ?? 0)} – ${$int(f.estimated_high ?? 0)}`, M + 340, y + 5, { width: 80 });
        doc.font("Helvetica-Bold").text($int(f.confirmed_amount), M + 430, y + 5, { width: 80, align: "right" });
        y += 20;
      });

      y += 4;
      doc.moveTo(M, y).lineTo(PAGE_W - M, y).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
      y += 12;

      // ═══ TOTALS ═══
      const totalsX = M + CW - 220;

      doc.fontSize(9).font("Helvetica").fillColor(COLORS.text);
      doc.text("Total Confirmed Savings:", totalsX, y, { width: 140 });
      doc.font("Helvetica-Bold").fillColor(COLORS.navy).text($(totalSavings), totalsX + 140, y, { width: 80, align: "right" });
      y += 18;

      doc.font("Helvetica").fillColor(COLORS.text);
      doc.text(`Contingency Fee (${eng.fee_percentage}%):`, totalsX, y, { width: 140 });
      doc.font("Helvetica-Bold").fillColor(COLORS.text).text($(feeAmount), totalsX + 140, y, { width: 80, align: "right" });
      y += 4;
      doc.moveTo(totalsX, y + 8).lineTo(PAGE_W - M, y + 8).strokeColor(COLORS.green).lineWidth(1.5).stroke();
      y += 18;

      // Big total
      doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.navy);
      doc.text("AMOUNT DUE:", totalsX, y, { width: 140 });
      doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.green);
      doc.text($(feeAmount), totalsX + 140, y - 2, { width: 80, align: "right" });
      y += 30;

      // ═══ PAYMENT TERMS ═══
      doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.navy).text("Payment Terms", M, y);
      y += 14;
      doc.fontSize(8).font("Helvetica").fillColor(COLORS.text).lineGap(2);
      doc.text("Payment is due within 30 days of invoice date. Please remit via wire transfer or cheque payable to Fruxal Diagnostic Inc.", M, y, { width: CW });
      y = doc.y + 20;

      doc.font("Helvetica-Bold").fillColor(COLORS.navy).text("Wire Transfer Details", M, y);
      y += 14;
      doc.font("Helvetica").fillColor(COLORS.text);
      doc.text("Bank: [Your Bank Name]  |  Transit: XXXXX  |  Account: XXXXXXX  |  Institution: XXX", M, y, { width: CW });
      y = doc.y + 30;

      // ═══ FOOTER ═══
      const fy = PAGE_H - 40;
      doc.moveTo(M, fy - 8).lineTo(PAGE_W - M, fy - 8).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
      doc.fontSize(7).font("Helvetica").fillColor(COLORS.gray);
      doc.text("Fruxal Diagnostic Inc. — hello@fruxal.com — fruxal.com", M, fy);
      doc.text(invoiceNum, M, fy, { width: CW, align: "right" });

      doc.end();
    });

    const safeName = eng.company_name.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").toLowerCase();
    const filename = `fruxal-invoice-${safeName}-${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[Invoice]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
