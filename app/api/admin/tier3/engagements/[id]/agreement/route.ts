// =============================================================================
// GET /api/admin/tier3/engagements/[id]/agreement — Generate engagement agreement PDF
// =============================================================================
// Produces a printable/signable agreement: company details, scope, 12% fee.
// Reps share the link; customer can print, sign, scan back.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PDFDocument from "pdfkit";

const M = 54, PAGE_W = 612, CW = PAGE_W - M * 2;
const C = { brand: "#1B3A2D", text: "#374151", light: "#F9F8F6", border: "#E5E3DD" };

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.error!;

  const { id } = params;

  try {
    const { data: eng } = await supabaseAdmin
      .from("tier3_engagements")
      .select("*, tier3_pipeline(company_name, province, contact_name, contact_email, industry, annual_revenue)")
      .eq("id", id)
      .single();

    if (!eng) return NextResponse.json({ error: "Engagement not found" }, { status: 404 });

    const pipe = Array.isArray((eng as any).tier3_pipeline)
      ? (eng as any).tier3_pipeline[0]
      : (eng as any).tier3_pipeline;

    const companyName   = eng.company_name || pipe?.company_name || "Client";
    const contactName   = pipe?.contact_name  || "Business Owner";
    const province      = pipe?.province || "Canada";
    const industry      = pipe?.industry || "";
    const feePercent    = eng.fee_percentage || 12;
    const dateStr       = new Date().toLocaleDateString("en-CA", { year:"numeric", month:"long", day:"numeric" });
    const agreementNum  = `FRX-AGR-${new Date().getFullYear()}-${id.slice(0,6).toUpperCase()}`;

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size:"LETTER", margins:{top:M,bottom:M,left:M,right:M} });
      doc.on("data", c => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.rect(0, 0, PAGE_W, 72).fill(C.brand);
      doc.fontSize(18).font("Helvetica-Bold").fillColor("white").text("FRUXAL", M, 22);
      doc.fontSize(9).font("Helvetica").fillColor("#AABBCC").text("DIAGNOSTIC ENGAGEMENT AGREEMENT", M, 26, { width: CW, align:"right" });

      let y = 96;
      doc.fontSize(9).font("Helvetica-Bold").fillColor(C.brand).text("Agreement No.:", M, y);
      doc.font("Helvetica").fillColor(C.text).text(agreementNum, M+120, y);
      y += 16;
      doc.font("Helvetica-Bold").fillColor(C.brand).text("Date:", M, y);
      doc.font("Helvetica").fillColor(C.text).text(dateStr, M+120, y);
      y += 28;

      // Parties
      doc.moveTo(M, y).lineTo(PAGE_W-M, y).strokeColor(C.border).lineWidth(1).stroke(); y += 16;
      doc.fontSize(11).font("Helvetica-Bold").fillColor(C.brand).text("PARTIES", M, y); y += 18;

      doc.fontSize(9).font("Helvetica").fillColor(C.text);
      doc.text(`Client: \${companyName} (\${industry ? industry + ", " : ""}\${province})`, M, y, { width: CW }); y += 14;
      doc.text(`Contact: \${contactName}`, M, y); y += 14;
      doc.text("Service Provider: Fruxal Diagnostic Inc., Montréal, Québec", M, y); y += 24;

      // Scope
      doc.moveTo(M, y).lineTo(PAGE_W-M, y).strokeColor(C.border).lineWidth(1).stroke(); y += 16;
      doc.fontSize(11).font("Helvetica-Bold").fillColor(C.brand).text("SCOPE OF ENGAGEMENT", M, y); y += 18;
      doc.fontSize(9).font("Helvetica").fillColor(C.text);
      const scope = [
        "Tax structure analysis and optimization opportunities",
        "Vendor & supplier contract renegotiation support",
        "Payroll and HR compliance review",
        "Government grants, credits and program eligibility (including SR&ED)",
        "Banking and treasury optimization",
        "Insurance coverage gap analysis",
        "SaaS and technology cost audit",
      ];
      for (const s of scope) {
        doc.text(`• \${s}`, M+12, y, { width: CW-12 }); y += 14;
      }
      y += 10;

      // Fee structure
      doc.moveTo(M, y).lineTo(PAGE_W-M, y).strokeColor(C.border).lineWidth(1).stroke(); y += 16;
      doc.fontSize(11).font("Helvetica-Bold").fillColor(C.brand).text("COMPENSATION", M, y); y += 18;
      doc.fontSize(9).font("Helvetica").fillColor(C.text);
      doc.text(`Fruxal earns a contingency fee of \${feePercent}% of confirmed and documented savings recovered during this engagement. No fee is earned or payable unless savings are confirmed by both parties in writing.`, M, y, { width: CW }); y += 40;
      doc.text("Client retains " + (100 - feePercent) + "% of all confirmed recoveries.", M, y); y += 24;

      // Terms
      doc.moveTo(M, y).lineTo(PAGE_W-M, y).strokeColor(C.border).lineWidth(1).stroke(); y += 16;
      doc.fontSize(11).font("Helvetica-Bold").fillColor(C.brand).text("TERMS", M, y); y += 18;
      doc.fontSize(9).font("Helvetica").fillColor(C.text);
      const terms = [
        "Engagement term: 12 months from signature date, renewable by mutual agreement.",
        "Client agrees to provide access to relevant financial documents, vendor contracts, and CRA correspondence.",
        "Fruxal maintains strict confidentiality of all client financial information.",
        "Either party may terminate with 30 days written notice. Fees owed on savings confirmed prior to termination remain due.",
        "Governing law: Province of Québec, Canada.",
      ];
      for (const t of terms) {
        doc.text(`• \${t}`, M+12, y, { width: CW-12 }); y += 20;
      }
      y += 10;

      // Signatures
      if (y > 650) { doc.addPage(); y = M; }
      doc.moveTo(M, y).lineTo(PAGE_W-M, y).strokeColor(C.border).lineWidth(1).stroke(); y += 16;
      doc.fontSize(11).font("Helvetica-Bold").fillColor(C.brand).text("SIGNATURES", M, y); y += 24;

      const halfW = (CW - 40) / 2;
      doc.fontSize(9).font("Helvetica").fillColor(C.text);
      // Client sig
      doc.moveTo(M, y+30).lineTo(M+halfW, y+30).strokeColor("#999").lineWidth(0.5).stroke();
      doc.text("Client Signature", M, y+34);
      doc.text(contactName, M, y+46);
      doc.text(companyName, M, y+58);
      doc.text("Date: _______________", M, y+70);
      // Fruxal sig
      const sigX = M + halfW + 40;
      doc.moveTo(sigX, y+30).lineTo(sigX+halfW, y+30).strokeColor("#999").lineWidth(0.5).stroke();
      doc.text("Fruxal Representative", sigX, y+34);
      doc.text("Fruxal Diagnostic Inc.", sigX, y+46);
      doc.text("Date: _______________", sigX, y+70);

      y += 100;
      doc.fontSize(7).fillColor("#aaa").text(`Agreement \${agreementNum} · Fruxal Diagnostic Inc. · fruxal.ca · privacy@fruxal.ca`, M, y, { width:CW, align:"center" });

      doc.end();
    });

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="Fruxal-Agreement-\${companyName.replace(/[^a-z0-9]/gi, "-")}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
