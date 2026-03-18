// =============================================================================
// src/services/tier3/agreement-generator.ts
// =============================================================================
// Generates a professional contingency engagement agreement PDF.
// Clean legal document style — navy headers, dark gray body, signature blocks.
// =============================================================================

import PDFDocument from "pdfkit";

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
  navy: "#0F2B46",
  green: "#00A844",
  white: "#FFFFFF",
  lightGray: "#F3F4F6",
  midGray: "#6B7280",
  darkGray: "#374151",
  textBody: "#4B5563",
  black: "#111827",
};

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54; // ~0.75 inch
const CONTENT_W = PAGE_W - MARGIN * 2;

const PROVINCE_NAMES: Record<string, string> = {
  ON: "Ontario", QC: "Quebec", BC: "British Columbia", AB: "Alberta", MB: "Manitoba",
};

const CAT_LABELS: Record<string, string> = {
  tax_structure: "Tax Structure",
  vendor_procurement: "Vendor & Procurement",
  payroll_hr: "Payroll & HR",
  banking_treasury: "Banking & Treasury",
  insurance: "Insurance",
  saas_technology: "SaaS & Technology",
  compliance_penalties: "Compliance & Penalties",
};

const CAT_SCOPE_DESC: Record<string, string> = {
  tax_structure: "Review of corporate tax structure including entity optimization, SR&ED eligibility, capital cost allowance acceleration, provincial tax credits, HST/GST input tax credit recovery, passive income impact on small business deduction, and owner-manager compensation mix.",
  vendor_procurement: "Analysis of vendor contracts, procurement practices, payment terms, volume discount consolidation, freight and shipping charges, telecom costs, duplicate payment detection, and tail spend management.",
  payroll_hr: "Audit of worker classification compliance, overtime calculations, employee turnover costs, group benefits plan competitiveness, payroll remittance accuracy, wage subsidy eligibility, WCB premium classification, and vacation/statutory holiday pay calculations.",
  banking_treasury: "Review of business banking fees, merchant processing rates, credit facility terms, cash flow forecasting, foreign exchange management, idle cash optimization, accounts receivable efficiency, and personal guarantee restructuring.",
  insurance: "Analysis of commercial insurance competitiveness, coverage gap identification, deductible optimization, fleet insurance consolidation, key person and business interruption adequacy, subcontractor COI compliance, property valuation accuracy, and cyber liability exposure.",
  saas_technology: "Audit of software license utilization, overlapping functionality, billing frequency optimization, legacy system maintenance costs, process automation opportunities, managed IT service pricing, disaster recovery planning, and digital marketing spend efficiency.",
  compliance_penalties: "Review of corporate tax filing compliance, employment standards adherence, privacy legislation requirements, workplace health and safety obligations, contractor payment reporting, environmental compliance, accessibility requirements, and corporate annual filing maintenance.",
};

const CAT_DOCS: Record<string, string[]> = {
  tax_structure: ["T2 corporate tax returns (3 years)", "Shareholder register", "Owner compensation breakdown (salary, dividends, bonuses)"],
  vendor_procurement: ["Top 20 vendor contracts by annual spend", "Most recent invoices from each major vendor"],
  payroll_hr: ["Payroll summary report (12 months)", "Group benefits plan documents and rate card", "Employee classification list"],
  banking_treasury: ["Bank statements (3 months, all accounts)", "Merchant processing statements (3 months)", "Credit facility agreement"],
  insurance: ["Current insurance policies — all lines of coverage", "Most recent premium invoices and renewal documents"],
  saas_technology: ["Software subscription list with monthly costs", "Corporate credit card statements (3 months)"],
  compliance_penalties: ["CRA correspondence and notices (2 years)", "Most recent payroll remittance records"],
};

function $(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgreementData {
  diagnosticId: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  industry: string;
  province: string;
  feePercentage: number;
  scopeCategories: string[];
  estimatedLow: number;
  estimatedHigh: number;
  generatedAt: string;
}

// ─── Generator ───────────────────────────────────────────────────────────────

export async function generateContingencyAgreement(data: AgreementData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      info: {
        Title: `Fruxal Contingency Agreement — ${data.companyName}`,
        Author: "Fruxal Diagnostic Inc.",
        Subject: "Contingency Engagement Agreement",
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let pageNum = 0;
    const provinceName = PROVINCE_NAMES[data.province] || data.province;
    const dateObj = new Date(data.generatedAt);
    const dateStr = dateObj.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
    const refNum = `FRX-${dateObj.getFullYear()}-${data.diagnosticId.slice(0, 8).toUpperCase()}`;
    let sectionNum = 0;

    // ═══ HELPERS ═══

    function addFooter() {
      const y = PAGE_H - 32;
      doc.save();
      doc.moveTo(MARGIN, y - 6).lineTo(PAGE_W - MARGIN, y - 6).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
      doc.fontSize(6.5).font("Helvetica").fillColor(COLORS.midGray);
      doc.text("FRUXAL CONFIDENTIAL", MARGIN, y);
      doc.text(`Ref: ${refNum}`, MARGIN, y, { width: CONTENT_W, align: "center" });
      doc.text(`${pageNum}`, MARGIN, y, { width: CONTENT_W, align: "right" });
      doc.restore();
    }

    function newPage() {
      doc.addPage();
      pageNum++;
      addFooter();
    }

    function checkSpace(needed: number): number {
      if (doc.y + needed > PAGE_H - 60) {
        newPage();
        return MARGIN;
      }
      return doc.y;
    }

    function sectionTitle(title: string): number {
      sectionNum++;
      let y = checkSpace(30);
      doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.navy);
      doc.text(`${sectionNum}. ${title}`, MARGIN, y);
      return doc.y + 6;
    }

    function bodyText(text: string, indent = 0) {
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.textBody).lineGap(3);
      doc.text(text, MARGIN + indent, doc.y, { width: CONTENT_W - indent });
    }

    function bodyBold(text: string, indent = 0) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.darkGray).lineGap(3);
      doc.text(text, MARGIN + indent, doc.y, { width: CONTENT_W - indent });
    }

    function spacer(px = 10) {
      doc.y += px;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE 1
    // ═══════════════════════════════════════════════════════════════════════════
    pageNum = 1;

    // Header
    doc.fontSize(18).font("Helvetica-Bold").fillColor(COLORS.navy);
    doc.text("FRUXAL", MARGIN, MARGIN);
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.midGray);
    doc.text("CONTINGENCY ENGAGEMENT AGREEMENT", MARGIN, MARGIN + 5, { width: CONTENT_W, align: "right" });

    // Green divider
    const divY = MARGIN + 28;
    doc.moveTo(MARGIN, divY).lineTo(PAGE_W - MARGIN, divY).strokeColor(COLORS.green).lineWidth(2).stroke();

    // Opening paragraph
    doc.y = divY + 16;
    bodyText(
      `This Contingency Engagement Agreement ("Agreement") is entered into between Fruxal Diagnostic Inc. ("Fruxal"), a corporation incorporated under the laws of Canada, and ${data.companyName} ("Client"), effective as of the date of last signature below.`
    );
    spacer(6);

    doc.fontSize(8).font("Helvetica").fillColor(COLORS.midGray);
    doc.text(`Date: ${dateStr}`, MARGIN, doc.y);
    doc.text(`Reference: ${refNum}`, MARGIN + 250, doc.y - doc.currentLineHeight());
    spacer(14);

    // ─── SECTION 1: Scope ───
    doc.y = sectionTitle("SCOPE OF ENGAGEMENT");
    bodyText(
      `Fruxal will conduct a comprehensive diagnostic analysis of Client's financial operations across the following categories to identify recoverable savings opportunities:`
    );
    spacer(8);

    for (const cat of data.scopeCategories) {
      const label = CAT_LABELS[cat] || cat;
      const desc = CAT_SCOPE_DESC[cat] || "";
      checkSpace(50);
      bodyBold(`${label}`, 12);
      spacer(2);
      bodyText(desc, 12);
      spacer(8);
    }
    spacer(4);

    // ─── SECTION 2: Fee Structure ───
    doc.y = sectionTitle("FEE STRUCTURE");
    bodyText(
      `Client agrees to pay Fruxal ${data.feePercentage}% (${data.feePercentage} percent) of all confirmed and recovered savings identified through this engagement. "Confirmed savings" means cost reductions, tax recoveries, credit claims, or expense eliminations that are verified through documentation and implemented by Client.`
    );
    spacer(6);
    bodyText(
      `No fee is owed where savings are not confirmed and recovered. Fruxal bears the full cost of the diagnostic analysis. Fees are invoiced upon confirmation of each recovered amount and are due within 30 days of invoice date.`
    );
    spacer(6);
    bodyText(
      `The fee applies to savings realized in the first 12 months following implementation of each recommendation. Recurring savings beyond the first 12 months are not subject to additional fees under this Agreement.`
    );
    spacer(10);

    // ─── SECTION 3: Estimated Opportunity ───
    doc.y = sectionTitle("ESTIMATED OPPORTUNITY");
    bodyText(
      `Based on Fruxal's preliminary diagnostic analysis (Reference: ${refNum}), the estimated annual savings opportunity for Client is in the range of ${$(data.estimatedLow)} to ${$(data.estimatedHigh)} across the categories defined in Section 1.`
    );
    spacer(6);
    bodyText(
      `This estimate is preliminary and based on industry benchmarks, revenue bracket analysis, and information gathered during the initial consultation. Actual savings amounts will be confirmed during the engagement using Client's financial data. Fruxal makes no guarantee of specific savings amounts until the diagnostic is complete.`
    );
    spacer(10);

    // ─── SECTION 4: Timeline ───
    doc.y = sectionTitle("TIMELINE");
    bodyText(
      `Fruxal will deliver confirmed findings within 60 to 90 business days from the date of Agreement execution and receipt of all required documents outlined in Section 5. Fruxal will provide progress updates at 30-day intervals. The engagement may be extended by mutual written agreement if additional analysis is required.`
    );
    spacer(10);

    // ─── SECTION 5: Client Obligations ───
    doc.y = sectionTitle("CLIENT OBLIGATIONS");
    bodyText(
      `To enable Fruxal to conduct the diagnostic analysis, Client agrees to provide the following documents within 10 business days of Agreement execution:`
    );
    spacer(6);

    // Collect relevant docs
    const requiredDocs: string[] = [];
    for (const cat of data.scopeCategories) {
      const docs = CAT_DOCS[cat] || [];
      for (const d of docs) {
        if (!requiredDocs.includes(d)) requiredDocs.push(d);
      }
    }

    for (const docItem of requiredDocs) {
      checkSpace(14);
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.textBody);
      doc.text(`•   ${docItem}`, MARGIN + 12, doc.y, { width: CONTENT_W - 20 });
      spacer(2);
    }
    spacer(6);
    bodyText(
      `All documents will be transmitted via Fruxal's secure document portal or encrypted email. Client retains ownership of all documents provided.`
    );
    spacer(10);

    // ─── SECTION 6: Confidentiality ───
    doc.y = sectionTitle("CONFIDENTIALITY");
    bodyText(
      `Both parties agree to maintain the confidentiality of all information shared during this engagement. Fruxal will not disclose, share, or transmit Client's financial data, business information, or any findings from this engagement to any third party without Client's prior written consent, except as required by law.`
    );
    spacer(6);
    bodyText(
      `Client agrees to maintain the confidentiality of Fruxal's proprietary diagnostic methodology, scoring algorithms, and benchmark data. This confidentiality obligation survives termination of this Agreement for a period of two (2) years.`
    );
    spacer(10);

    // ─── SECTION 7: Limitation of Liability ───
    doc.y = sectionTitle("LIMITATION OF LIABILITY");
    bodyText(
      `Fruxal's total liability under this Agreement shall not exceed the total fees paid by Client under this Agreement. In no event shall either party be liable for indirect, incidental, consequential, or punitive damages arising from or related to this Agreement. Fruxal's analysis and recommendations do not constitute legal, tax, or accounting advice. Client is responsible for engaging appropriate professional advisors before implementing any recommendation.`
    );
    spacer(10);

    // ─── SECTION 8: Termination ───
    doc.y = sectionTitle("TERMINATION");
    bodyText(
      `Either party may terminate this Agreement with five (5) business days' written notice to the other party. In the event of termination, Client agrees to pay the applicable fee on any savings that were confirmed and documented by Fruxal prior to the date of termination. Upon termination, Fruxal will return or destroy all Client documents within 10 business days.`
    );
    spacer(10);

    // ─── SECTION 9: Governing Law ───
    doc.y = sectionTitle("GOVERNING LAW");
    bodyText(
      `This Agreement is governed by and construed in accordance with the laws of the Province of ${provinceName}, Canada, and the federal laws of Canada applicable therein. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts of ${provinceName}.`
    );
    spacer(30);

    // ═══════════════════════════════════════════════════════════════════════════
    // SIGNATURE BLOCKS
    // ═══════════════════════════════════════════════════════════════════════════
    checkSpace(160);

    const sigY = doc.y;
    const colW = (CONTENT_W - 40) / 2;

    // Left: Fruxal
    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.navy);
    doc.text("FOR FRUXAL DIAGNOSTIC INC.", MARGIN, sigY, { width: colW });

    let ly = sigY + 50;
    doc.moveTo(MARGIN, ly).lineTo(MARGIN + colW - 10, ly).strokeColor(COLORS.midGray).lineWidth(0.5).stroke();
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.midGray);
    doc.text("Signature", MARGIN, ly + 4);

    ly += 30;
    doc.moveTo(MARGIN, ly).lineTo(MARGIN + colW - 10, ly).stroke();
    doc.text("Name", MARGIN, ly + 4);

    ly += 30;
    doc.moveTo(MARGIN, ly).lineTo(MARGIN + colW - 10, ly).stroke();
    doc.text("Title", MARGIN, ly + 4);

    ly += 30;
    doc.moveTo(MARGIN, ly).lineTo(MARGIN + colW - 10, ly).stroke();
    doc.text("Date", MARGIN, ly + 4);

    // Right: Client
    const rx = MARGIN + colW + 40;
    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.navy);
    doc.text(`FOR ${data.companyName.toUpperCase()}`, rx, sigY, { width: colW });

    ly = sigY + 50;
    doc.moveTo(rx, ly).lineTo(rx + colW - 10, ly).strokeColor(COLORS.midGray).lineWidth(0.5).stroke();
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.midGray);
    doc.text("Signature", rx, ly + 4);

    ly += 30;
    doc.moveTo(rx, ly).lineTo(rx + colW - 10, ly).stroke();
    doc.text("Name", rx, ly + 4);
    if (data.contactName) {
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.darkGray);
      doc.text(data.contactName, rx + 40, ly - 14);
    }

    ly += 30;
    doc.moveTo(rx, ly).lineTo(rx + colW - 10, ly).stroke();
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.midGray);
    doc.text("Title", rx, ly + 4);
    if (data.contactTitle) {
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.darkGray);
      doc.text(data.contactTitle, rx + 40, ly - 14);
    }

    ly += 30;
    doc.moveTo(rx, ly).lineTo(rx + colW - 10, ly).stroke();
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.midGray);
    doc.text("Date", rx, ly + 4);

    // Footer
    addFooter();

    doc.end();
  });
}
