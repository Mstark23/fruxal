// =============================================================================
// src/services/tier3/pdf-generator.ts
// =============================================================================
// Generates a professional executive diagnostic report PDF.
// Designed to look like a Big 4 consulting firm produced it.
// Uses PDFKit with built-in Helvetica fonts only.
// =============================================================================

import PDFDocument from "pdfkit";

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
  navy: "#0F2B46",
  green: "#00A844",
  greenDark: "#008836",
  white: "#FFFFFF",
  lightGray: "#F3F4F6",
  midGray: "#6B7280",
  darkGray: "#374151",
  textBody: "#4B5563",
  high: "#16A34A",
  medium: "#D97706",
  speculative: "#6B7280",
  red: "#DC2626",
  black: "#111827",
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

const CAT_COLORS: Record<string, string> = {
  tax_structure: "#4F46E5",
  vendor_procurement: "#D97706",
  payroll_hr: "#DB2777",
  banking_treasury: "#0891B2",
  insurance: "#7C3AED",
  saas_technology: "#2563EB",
  compliance_penalties: "#DC2626",
};

const BRACKET_LABELS: Record<string, string> = {
  "1M_5M": "$1M – $5M",
  "5M_20M": "$5M – $20M",
  "20M_50M": "$20M – $50M",
};

const CONF_LABELS: Record<string, { label: string; color: string }> = {
  HIGH: { label: "HIGH CONFIDENCE", color: COLORS.high },
  MEDIUM: { label: "MEDIUM CONFIDENCE", color: COLORS.medium },
  SPECULATIVE: { label: "SPECULATIVE", color: COLORS.speculative },
};

// Page dimensions (Letter)
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 47; // 0.65 inch
const CONTENT_W = PAGE_W - MARGIN * 2;

function $(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface LeakItem {
  rank: number;
  leak_id: string;
  category: string;
  name: string;
  description: string;
  estimatedLow: number;
  estimatedHigh: number;
  confidence: "HIGH" | "MEDIUM" | "SPECULATIVE";
  confidenceReason: string;
  dataNeeded: string[];
  recoveryTimeline: string;
}

interface Summary {
  totalEstimatedLow: number;
  totalEstimatedHigh: number;
  highConfidenceCount: number;
  topCategory: string;
  feeRangeLow: number;
  feeRangeHigh: number;
}

interface DiagnosticData {
  id: string;
  companyName: string;
  industry: string;
  province: string;
  revenueBracket: string;
  generatedAt: string;
  topLeaks: LeakItem[];
  summary: Summary;
}

// ─── Generator ───────────────────────────────────────────────────────────────

export async function generateTier3Report(diagnostic: DiagnosticData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      info: {
        Title: `Fruxal Diagnostic — ${diagnostic.companyName}`,
        Author: "Fruxal Diagnostic Engine",
        Subject: "Preliminary Diagnostic Report",
        Creator: "Fruxal",
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let pageNum = 0;

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    function addPageFooter(showNumber: boolean) {
      const y = PAGE_H - 30;
      doc.save();
      // Confidential text
      doc.fontSize(6.5).font("Helvetica").fillColor(COLORS.midGray);
      doc.text("FRUXAL CONFIDENTIAL", MARGIN, y, { width: CONTENT_W, align: "left" });
      if (showNumber) {
        doc.text(`${pageNum}`, MARGIN, y, { width: CONTENT_W, align: "right" });
      }
      // Thin line above footer
      doc.moveTo(MARGIN, y - 6).lineTo(PAGE_W - MARGIN, y - 6).strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
      doc.restore();
    }

    function newPage(showFooter = true) {
      doc.addPage();
      pageNum++;
      if (showFooter) addPageFooter(true);
    }

    function sectionHeader(title: string, y: number): number {
      // Green left border bar
      doc.rect(MARGIN, y, 3, 18).fill(COLORS.green);
      doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.navy);
      doc.text(title, MARGIN + 12, y + 2);
      return y + 30;
    }

    function drawRoundedRect(x: number, y: number, w: number, h: number, r: number, color: string) {
      doc.roundedRect(x, y, w, h, r).fill(color);
    }

    const date = new Date(diagnostic.generatedAt);
    const dateStr = date.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE 1: COVER
    // ═══════════════════════════════════════════════════════════════════════════
    pageNum = 1;

    // Navy top bar
    doc.rect(0, 0, PAGE_W, 80).fill(COLORS.navy);
    doc.fontSize(24).font("Helvetica-Bold").fillColor(COLORS.white);
    doc.text("FRUXAL", MARGIN, 28);
    doc.fontSize(9).font("Helvetica").fillColor("#AABBCC");
    doc.text("PRELIMINARY DIAGNOSTIC REPORT", MARGIN, 32, { width: CONTENT_W, align: "right" });

    // Company name centered
    doc.fontSize(28).font("Helvetica-Bold").fillColor(COLORS.navy);
    const companyNameWidth = doc.widthOfString(diagnostic.companyName);
    doc.text(diagnostic.companyName, MARGIN, 200, { width: CONTENT_W, align: "center" });

    // Green line under company name
    const lineY = 240;
    const lineW = Math.min(companyNameWidth + 40, 300);
    const lineX = (PAGE_W - lineW) / 2;
    doc.moveTo(lineX, lineY).lineTo(lineX + lineW, lineY).strokeColor(COLORS.green).lineWidth(2.5).stroke();

    // 3 stat boxes
    const boxY = 290;
    const boxW = (CONTENT_W - 16) / 3;
    const boxH = 52;
    const stats = [
      { label: "INDUSTRY", value: diagnostic.industry },
      { label: "PROVINCE", value: diagnostic.province },
      { label: "REVENUE", value: BRACKET_LABELS[diagnostic.revenueBracket] || diagnostic.revenueBracket },
    ];

    stats.forEach((s, i) => {
      const bx = MARGIN + i * (boxW + 8);
      drawRoundedRect(bx, boxY, boxW, boxH, 4, COLORS.navy);
      doc.fontSize(7).font("Helvetica").fillColor("#8899AA");
      doc.text(s.label, bx + 12, boxY + 12, { width: boxW - 24, align: "center" });
      doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.white);
      doc.text(s.value, bx + 12, boxY + 27, { width: boxW - 24, align: "center" });
    });

    // Prepared by
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.midGray);
    doc.text("Prepared by Fruxal Diagnostic Engine", MARGIN, 420, { width: CONTENT_W, align: "center" });
    doc.text(dateStr, MARGIN, 435, { width: CONTENT_W, align: "center" });

    // Green bottom bar
    doc.rect(0, PAGE_H - 40, PAGE_W, 40).fill(COLORS.green);
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(COLORS.white);
    doc.text("CONFIDENTIAL — FOR RECIPIENT USE ONLY", MARGIN, PAGE_H - 26, { width: CONTENT_W, align: "center" });

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE 2: EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════
    newPage();
    let y = MARGIN;

    y = sectionHeader("EXECUTIVE SUMMARY", y);
    y += 6;

    // Large callout box
    const calloutH = 80;
    drawRoundedRect(MARGIN, y, CONTENT_W, calloutH, 6, COLORS.navy);
    doc.fontSize(9).font("Helvetica").fillColor("#8899AA");
    doc.text("ESTIMATED ANNUAL SAVINGS OPPORTUNITY", MARGIN + 20, y + 16, { width: CONTENT_W - 40, align: "center" });
    doc.fontSize(26).font("Helvetica-Bold").fillColor(COLORS.green);
    doc.text(
      `${$(diagnostic.summary.totalEstimatedLow)} – ${$(diagnostic.summary.totalEstimatedHigh)}`,
      MARGIN + 20, y + 36, { width: CONTENT_W - 40, align: "center" }
    );
    y += calloutH + 16;

    // 3 stat pills
    const pillW = (CONTENT_W - 16) / 3;
    const pillH = 40;
    const pills = [
      { label: `${diagnostic.summary.highConfidenceCount} High Confidence Findings`, color: COLORS.high },
      { label: `Top Category: ${CAT_LABELS[diagnostic.summary.topCategory] || diagnostic.summary.topCategory}`, color: COLORS.navy },
      { label: `Your Fee: ${$(diagnostic.summary.feeRangeLow)} – ${$(diagnostic.summary.feeRangeHigh)} at 12%`, color: COLORS.green },
    ];

    pills.forEach((p, i) => {
      const px = MARGIN + i * (pillW + 8);
      drawRoundedRect(px, y, pillW, pillH, 4, COLORS.lightGray);
      doc.fontSize(8.5).font("Helvetica-Bold").fillColor(p.color);
      doc.text(p.label, px + 8, y + 14, { width: pillW - 16, align: "center" });
    });
    y += pillH + 24;

    // Methodology note
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.textBody).lineGap(4);
    doc.text(
      "The estimates in this report are based on analysis of over 57 known financial leak patterns across seven categories, calibrated to your company's industry, revenue bracket, and province. Dollar ranges reflect the typical annual impact observed in comparable Canadian mid-market businesses. These are preliminary estimates — actual amounts will be confirmed through detailed analysis during the engagement using your financial data.",
      MARGIN, y, { width: CONTENT_W }
    );
    y = doc.y + 8;
    doc.text(
      "All figures are expressed in Canadian dollars and represent annualized savings or cost recovery opportunities. Province-specific modifiers have been applied to reflect regulatory and tax differences in your operating jurisdiction.",
      MARGIN, y, { width: CONTENT_W }
    );
    y = doc.y + 24;

    // WHAT HAPPENS NEXT
    y = sectionHeader("WHAT HAPPENS NEXT", y);
    y += 4;

    const steps = [
      { num: "1", title: "Review These Findings", desc: "Read through the identified leaks below. Note which ones feel most relevant to your operations and where you have the strongest gut feeling that savings exist." },
      { num: "2", title: "Sign Contingency Agreement", desc: "We operate on a pure contingency basis — 12% of confirmed, recovered savings. If we don't find real dollars, you pay nothing. The agreement takes 5 minutes to review and sign." },
      { num: "3", title: "We Confirm Exact Amounts", desc: "With access to your financial data, we validate each leak, quantify the precise dollar impact, and implement fixes. Average engagement timeline is 60–90 days from signature to first recovered dollars." },
    ];

    steps.forEach((step) => {
      // Number circle
      doc.circle(MARGIN + 12, y + 10, 11).fill(COLORS.green);
      doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.white);
      doc.text(step.num, MARGIN + 6, y + 4.5, { width: 12, align: "center" });

      // Title + description
      doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.navy);
      doc.text(step.title, MARGIN + 32, y + 1);
      doc.fontSize(8.5).font("Helvetica").fillColor(COLORS.textBody).lineGap(2);
      doc.text(step.desc, MARGIN + 32, y + 15, { width: CONTENT_W - 40 });
      y = doc.y + 14;
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGES 3+: LEAK DETAIL CARDS
    // ═══════════════════════════════════════════════════════════════════════════

    let leaksOnPage = 0;

    for (const leak of diagnostic.topLeaks) {
      // Estimate card height
      const descLines = Math.ceil(leak.description.length / 90);
      const dataLines = leak.dataNeeded.length;
      const estimatedHeight = 160 + descLines * 12 + dataLines * 13;

      // New page if needed
      if (leaksOnPage === 0 || y + estimatedHeight > PAGE_H - 60) {
        if (leaksOnPage > 0) {
          newPage();
          y = MARGIN;
        } else {
          // First leak page
          newPage();
          y = MARGIN;
          y = sectionHeader("IDENTIFIED FINANCIAL LEAKS", y);
          y += 8;
        }
        leaksOnPage = 0;
      }

      // ─── LEAK CARD ───
      const cardX = MARGIN;
      const cardStartY = y;

      // Rank number
      drawRoundedRect(cardX, y, 30, 26, 4, COLORS.green);
      doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.white);
      doc.text(`#${leak.rank}`, cardX + 2, y + 6, { width: 26, align: "center" });

      // Leak name
      doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.navy);
      doc.text(leak.name, cardX + 40, y + 1, { width: CONTENT_W - 200 });

      // Category badge
      const catLabel = CAT_LABELS[leak.category] || leak.category;
      const catColor = CAT_COLORS[leak.category] || COLORS.midGray;
      const catBadgeW = doc.fontSize(7).font("Helvetica-Bold").widthOfString(catLabel) + 14;
      const catBadgeX = PAGE_W - MARGIN - catBadgeW;
      drawRoundedRect(catBadgeX, y + 1, catBadgeW, 16, 3, catColor + "18");
      doc.fontSize(7).font("Helvetica-Bold").fillColor(catColor);
      doc.text(catLabel, catBadgeX + 7, y + 5);

      y += 18;

      // Confidence badge
      const confInfo = CONF_LABELS[leak.confidence] || CONF_LABELS.SPECULATIVE;
      doc.fontSize(8).font("Helvetica-Bold").fillColor(confInfo.color);
      doc.text(`● ${confInfo.label}`, cardX + 40, y);

      y += 14;

      // Dollar range
      doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.navy);
      doc.text(`${$(leak.estimatedLow)} – ${$(leak.estimatedHigh)}`, cardX + 40, y);
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.midGray);
      doc.text(" annually", cardX + 40 + doc.widthOfString(`${$(leak.estimatedLow)} – ${$(leak.estimatedHigh)}`, { lineBreak: false }) + 6, y + 4);

      y += 22;

      // Confidence reason (italic)
      doc.fontSize(8.5).font("Helvetica-Oblique").fillColor(COLORS.midGray).lineGap(2);
      doc.text(leak.confidenceReason, cardX + 40, y, { width: CONTENT_W - 48 });
      y = doc.y + 10;

      // Description
      doc.fontSize(8.5).font("Helvetica").fillColor(COLORS.textBody).lineGap(3);
      doc.text(leak.description, cardX + 40, y, { width: CONTENT_W - 48 });
      y = doc.y + 10;

      // Data needed
      doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.darkGray);
      doc.text("Data needed to confirm:", cardX + 40, y);
      y = doc.y + 4;

      for (const item of leak.dataNeeded) {
        doc.fontSize(8).font("Helvetica").fillColor(COLORS.textBody);
        doc.text(`•  ${item}`, cardX + 46, y, { width: CONTENT_W - 54 });
        y = doc.y + 2;
      }
      y += 4;

      // Recovery timeline
      doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.darkGray);
      doc.text("Recovery timeline: ", cardX + 40, y, { continued: true });
      doc.font("Helvetica").fillColor(COLORS.textBody);
      doc.text(leak.recoveryTimeline);
      y = doc.y + 4;

      // Separator line
      doc.moveTo(cardX + 40, y).lineTo(PAGE_W - MARGIN, y).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
      y += 16;

      leaksOnPage++;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FINAL PAGE: NEXT STEPS & METHODOLOGY
    // ═══════════════════════════════════════════════════════════════════════════
    newPage();
    y = MARGIN;

    // ENGAGEMENT TERMS
    y = sectionHeader("ENGAGEMENT TERMS", y);
    y += 6;

    drawRoundedRect(MARGIN, y, CONTENT_W, 100, 6, COLORS.lightGray);

    const termItems = [
      { label: "Fee Structure", value: "12% of confirmed, recovered savings — pure contingency. No savings found = no fee." },
      { label: "Timeline", value: "60–90 days from agreement signature to first confirmed savings. Most leaks are validated within 30 days." },
      { label: "Access Required", value: "Financial statements (2–3 years), tax returns, payroll records, vendor contracts, insurance policies, bank statements. All data handled under NDA with enterprise-grade security." },
    ];

    let ty = y + 12;
    for (const item of termItems) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.navy);
      doc.text(item.label, MARGIN + 16, ty, { width: 110 });
      doc.fontSize(8.5).font("Helvetica").fillColor(COLORS.textBody).lineGap(2);
      doc.text(item.value, MARGIN + 130, ty, { width: CONTENT_W - 155 });
      ty = Math.max(doc.y + 8, ty + 24);
    }
    y += 112;

    // METHODOLOGY
    y = sectionHeader("METHODOLOGY", y);
    y += 6;

    doc.fontSize(8.5).font("Helvetica").fillColor(COLORS.textBody).lineGap(3);
    doc.text(
      "Estimates are generated by the Fruxal Diagnostic Engine, which maintains a database of 57 known financial leak patterns across seven categories: tax structure, vendor procurement, payroll and HR, banking and treasury, insurance, SaaS and technology, and compliance. Each pattern has been calibrated with dollar ranges for three revenue brackets ($1M–$5M, $5M–$20M, $20M–$50M) based on data from BDC benchmarks, Statistics Canada CANSIM tables, CPA Canada survey data, and industry-specific audit experience.",
      MARGIN, y, { width: CONTENT_W }
    );
    y = doc.y + 8;
    doc.text(
      "Province-specific multipliers reflect actual regulatory differences including tax rates (e.g., Quebec's dual GST/QST system, Alberta's lower corporate rate), employment standards (e.g., BC's daily overtime threshold), WCB premium structures, and privacy legislation (e.g., Quebec Law 25). Confidence levels are assigned based on specific signals gathered during the preliminary call and represent the probability that the leak exists at or near the estimated range.",
      MARGIN, y, { width: CONTENT_W }
    );
    y = doc.y + 20;

    // ABOUT FRUXAL
    y = sectionHeader("ABOUT FRUXAL", y);
    y += 6;

    doc.fontSize(8.5).font("Helvetica").fillColor(COLORS.textBody).lineGap(3);
    doc.text(
      "Fruxal is a Canadian business intelligence platform that identifies where companies are silently losing money across tax, payroll, vendors, banking, insurance, technology, and compliance. Our diagnostic engine combines industry benchmarks, provincial regulatory knowledge, and pattern recognition to surface financial leaks that internal teams and general-practice accountants typically miss.",
      MARGIN, y, { width: CONTENT_W }
    );
    y = doc.y + 30;

    // Contact / disclaimer
    doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
    y += 12;

    doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.navy);
    doc.text("Fruxal — Business Intelligence for Canadian Companies", MARGIN, y);
    y = doc.y + 4;
    doc.fontSize(7.5).font("Helvetica").fillColor(COLORS.midGray);
    doc.text("hello@fruxal.com  |  fruxal.ca", MARGIN, y);
    y = doc.y + 12;
    doc.fontSize(6.5).font("Helvetica-Oblique").fillColor(COLORS.midGray).lineGap(2);
    doc.text(
      "Disclaimer: This preliminary diagnostic report is provided for informational purposes based on industry patterns and the information shared during the initial consultation. Actual financial impact may vary based on the company's specific circumstances. Fruxal makes no guarantee of specific savings amounts until a full engagement has been completed with access to actual financial data. This document is confidential and intended solely for the named recipient.",
      MARGIN, y, { width: CONTENT_W }
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // FINALIZE
    // ═══════════════════════════════════════════════════════════════════════════
    doc.end();
  });
}
