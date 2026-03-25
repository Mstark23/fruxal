// =============================================================================
// PRESCAN PDF REPORT GENERATOR
// Creates a branded, bilingual PDF from prescan results
// Uses PDFKit (already in package.json)
// =============================================================================

import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

// ── Brand colors ──
const BRAND = "#1B4D3E";       // Deep green
const BRAND_LIGHT = "#2D7A5F";
const RED = "#DC2626";
const ORANGE = "#EA580C";
const YELLOW = "#CA8A04";
const GREEN = "#16A34A";
const NAVY = "#0F172A";
const GRAY = "#6B7280";
const LIGHT_GRAY = "#F3F4F6";
const WHITE = "#FFFFFF";

// ── Types ──
interface PrescanReportData {
  prescanRunId: string;
  industrySlug: string;
  province: string;
  annualRevenue: number;
  healthScore: number;
  dataHealthScore: number;
  totalLeak: number;
  leaks: Array<{
    code: string;
    category: string;
    amount: number;
    severity: number;
    confidence: number;
    priority: number;
  }>;
  lang: "en" | "fr";
  generatedAt: string;
}

// ── Bilingual labels ──
const t = (en: string, fr: string, lang: "en" | "fr") => lang === "fr" ? fr : en;

// ── Leak display names ──
const LEAK_NAMES: Record<string, { en: string; fr: string }> = {
  processing_rate_high: { en: "Card Processing Fees Too High", fr: "Frais de traitement de cartes trop élevés" },
  rent_or_chair_high: { en: "Rent / Space Cost Too High", fr: "Loyer / coût d'espace trop élevé" },
  tax_optimization_gap: { en: "Tax Deductions Being Missed", fr: "Déductions fiscales manquées" },
  cash_management_risk: { en: "Cash Handling Risk", fr: "Risque de gestion d'espèces" },
  payroll_ratio_high: { en: "Labour Cost Above Benchmark", fr: "Coût de main-d'oeuvre élevé" },
  labor_cost_high: { en: "Labour Cost Above Benchmark", fr: "Coût de main-d'oeuvre élevé" },
  insurance_overpayment: { en: "Insurance Premiums Too High", fr: "Primes d'assurance trop élevées" },
  fuel_vehicle_high: { en: "Fuel / Vehicle Costs High", fr: "Coûts carburant / véhicule élevés" },
  subscription_bloat: { en: "Software Subscription Bloat", fr: "Abonnements logiciels excessifs" },
  software_bloat: { en: "Software Subscription Bloat", fr: "Abonnements logiciels excessifs" },
  banking_fees_high: { en: "Banking Fees Too High", fr: "Frais bancaires trop élevés" },
  inventory_cogs_high: { en: "Cost of Goods Too High", fr: "Coût des marchandises trop élevé" },
  marketing_waste: { en: "Marketing Spend Inefficient", fr: "Dépenses marketing inefficaces" },
  marketing_overspend: { en: "Marketing Overspend", fr: "Dépenses marketing excessives" },
  cash_shrinkage: { en: "Cash Handling Losses", fr: "Pertes de manipulation d'argent comptant" },
  utilities_overspend: { en: "Utilities Above Benchmark", fr: "Services publics au-dessus de la référence" },
  revenue_underpricing: { en: "Revenue Erosion from Underpricing", fr: "Érosion des revenus par sous-tarification" },
  receivables_leakage: { en: "Uncollected Invoices", fr: "Factures non collectées" },
  late_payment_penalties: { en: "Late Payment Penalties", fr: "Pénalités de retard de paiement" },
  equipment_depreciation_gap: { en: "Unclaimed Equipment Depreciation", fr: "Amortissement d'équipement non réclamé" },
  employee_turnover_cost: { en: "Employee Turnover Cost", fr: "Coûts de roulement du personnel" },
  supplier_discount_missed: { en: "Missed Supplier Discounts", fr: "Rabais fournisseurs manqués" },
  debt_interest_high: { en: "Business Debt Interest Gap", fr: "Écart d'intérêt sur la dette" },
  tax_filing_inefficiency: { en: "GST/HST Input Credits Missed", fr: "Crédits de taxe sur intrants manqués" },
  professional_fees_high: { en: "Professional Fees Above Optimal", fr: "Honoraires professionnels élevés" },
  no_bookkeeping_system: { en: "No Bookkeeping System", fr: "Absence de système de comptabilité" },
  subcontractor_markup: { en: "Subcontractor Cost Gap", fr: "Écart de coûts de sous-traitance" },
  scheduling_inefficiency: { en: "Scheduling & Overtime Waste", fr: "Gaspillage en horaires et temps supplémentaire" },
  no_emergency_fund: { en: "Reactive Cost Premium", fr: "Prime de coûts réactifs" },
};

const SEVERITY_LABELS: Record<string, { en: string; fr: string }> = {
  critical: { en: "Critical", fr: "Critique" },
  high: { en: "High", fr: "Élevé" },
  medium: { en: "Medium", fr: "Moyen" },
  low: { en: "Low", fr: "Faible" },
};

function severityFromScore(score: number): string {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function severityColor(sev: string): string {
  if (sev === "critical") return RED;
  if (sev === "high") return ORANGE;
  if (sev === "medium") return YELLOW;
  return GREEN;
}

function bandFromScore(score: number, lang: "en" | "fr"): { label: string; color: string } {
  if (score >= 90) return { label: t("Excellent", "Excellent", lang), color: GREEN };
  if (score >= 75) return { label: t("Good", "Bon", lang), color: GREEN };
  if (score >= 50) return { label: t("Fair", "Moyen", lang), color: YELLOW };
  if (score >= 25) return { label: t("Poor", "Faible", lang), color: ORANGE };
  return { label: t("Critical", "Critique", lang), color: RED };
}

function fmtMoney(val: number): string {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${val.toFixed(0)}`;
}

function formatIndustry(slug: string): string {
  return slug.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

export async function generatePrescanPDF(data: PrescanReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 50, bottom: 60, left: 55, right: 55 },
      info: {
        Title: t("Financial Health Report", "Rapport de santé financière", data.lang),
        Author: "Fruxal by VektorLabs",
        Subject: t("Prescan Results", "Résultats du préscan", data.lang),
      },
    });

    const chunks: Buffer[] = [];
    const stream = new PassThrough();
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    doc.pipe(stream);

    const pageW = 502; // 612 - 55 - 55
    const leftX = 55;
    const rightEdge = 557;
    const lang = data.lang;
    let y = 50;

    // ═══════════════════════════════════════════════════════════════
    // PAGE 1: HEADER + EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════════════

    // ── Logo bar ──
    doc.rect(0, 0, 612, 90).fill(BRAND);
    doc.fontSize(24).font("Helvetica-Bold").fillColor(WHITE)
      .text("Fruxal", leftX, 25);
    doc.fontSize(10).font("Helvetica").fillColor("#A7D8C4")
      .text(t("Financial Health Report", "Rapport de santé financière", lang), leftX, 53);
    doc.fontSize(9).fillColor("#A7D8C4")
      .text(new Date(data.generatedAt).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
        year: "numeric", month: "long", day: "numeric",
      }), leftX, 68);

    y = 110;

    // ── Business info bar ──
    doc.rect(leftX, y, pageW, 36).fill(LIGHT_GRAY);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(NAVY)
      .text(t("Industry", "Industrie", lang) + ": ", leftX + 12, y + 12, { continued: true })
      .font("Helvetica").text(formatIndustry(data.industrySlug));
    doc.fontSize(9).font("Helvetica-Bold").fillColor(NAVY)
      .text(t("Province", "Province", lang) + ": ", leftX + 200, y + 12, { continued: true })
      .font("Helvetica").text(data.province);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(NAVY)
      .text(t("Est. Revenue", "Revenu est.", lang) + ": ", leftX + 340, y + 12, { continued: true })
      .font("Helvetica").text(fmtMoney(data.annualRevenue));

    y += 56;

    // ── Health Score (the anchor) ──
    const band = bandFromScore(data.healthScore, lang);

    doc.fontSize(13).font("Helvetica-Bold").fillColor(NAVY)
      .text(t("YOUR BUSINESS HEALTH SCORE", "VOTRE SCORE DE SANTÉ FINANCIÈRE", lang), leftX, y);
    y += 22;

    // Score circle (simulated with text — PDFKit doesn't do arcs easily)
    const scoreX = leftX + 60;
    doc.circle(scoreX, y + 40, 42).lineWidth(6).strokeColor(band.color).stroke();
    doc.fontSize(32).font("Helvetica-Bold").fillColor(NAVY)
      .text(String(data.healthScore), scoreX - 22, y + 22, { width: 44, align: "center" });
    doc.fontSize(8).font("Helvetica").fillColor(GRAY)
      .text("/100", scoreX - 10, y + 55, { width: 20, align: "center" });

    // Band label
    doc.fontSize(16).font("Helvetica-Bold").fillColor(band.color)
      .text(band.label, leftX + 130, y + 10);

    // Summary text
    const leakPct = data.annualRevenue > 0
      ? ((data.totalLeak / data.annualRevenue) * 100).toFixed(1)
      : "0";
    doc.fontSize(10).font("Helvetica").fillColor(GRAY)
      .text(
        t(
          `Your business is leaking an estimated ${fmtMoney(data.totalLeak)}/year (${leakPct}% of revenue) across ${data.leaks.length} categories.`,
          `Votre entreprise perd environ ${fmtMoney(data.totalLeak)}/an (${leakPct}% du revenu) dans ${data.leaks.length} catégories.`,
          lang
        ),
        leftX + 130, y + 35, { width: 360 }
      );

    // Data confidence note
    doc.fontSize(8).font("Helvetica").fillColor(GRAY)
      .text(
        t(
          `Data confidence: ${data.dataHealthScore}% — Connect your accounting software to improve accuracy.`,
          `Confiance des données: ${data.dataHealthScore}% — Connectez votre logiciel comptable pour améliorer la précision.`,
          lang
        ),
        leftX + 130, y + 65, { width: 360 }
      );

    y += 100;

    // ── Summary metrics boxes ──
    const boxW = pageW / 3;
    const metrics = [
      {
        label: t("Total Estimated Leak", "Fuite totale estimée", lang),
        value: fmtMoney(data.totalLeak),
        sub: t("/year", "/an", lang),
        color: RED,
      },
      {
        label: t("Leaks Detected", "Fuites détectées", lang),
        value: String(data.leaks.length),
        sub: t("categories", "catégories", lang),
        color: NAVY,
      },
      {
        label: t("Health Score", "Score de santé", lang),
        value: `${data.healthScore}/100`,
        sub: band.label,
        color: band.color,
      },
    ];

    metrics.forEach((m, i) => {
      const bx = leftX + i * boxW;
      doc.rect(bx, y, boxW - 6, 58).fill(LIGHT_GRAY);
      doc.fontSize(8).font("Helvetica").fillColor(GRAY)
        .text(m.label, bx + 10, y + 8, { width: boxW - 20 });
      doc.fontSize(20).font("Helvetica-Bold").fillColor(m.color)
        .text(m.value, bx + 10, y + 22, { width: boxW - 20 });
      doc.fontSize(8).font("Helvetica").fillColor(GRAY)
        .text(m.sub, bx + 10, y + 44, { width: boxW - 20 });
    });

    y += 78;

    // ═══════════════════════════════════════════════════════════════
    // LEAKS TABLE
    // ═══════════════════════════════════════════════════════════════

    doc.fontSize(13).font("Helvetica-Bold").fillColor(NAVY)
      .text(t("DETECTED FINANCIAL LEAKS", "FUITES FINANCIÈRES DÉTECTÉES", lang), leftX, y);
    y += 22;

    if (data.leaks.length === 0) {
      doc.fontSize(10).font("Helvetica").fillColor(GRAY)
        .text(t("No leaks detected.", "Aucune fuite détectée.", lang), leftX, y);
      y += 20;
    } else {
      // Table header
      const cols = [
        { w: 30, label: "#" },
        { w: 195, label: t("Leak", "Fuite", lang) },
        { w: 80, label: t("Est. Annual", "Est. annuel", lang) },
        { w: 70, label: t("Severity", "Sévérité", lang) },
        { w: 62, label: t("Confidence", "Confiance", lang) },
        { w: 55, label: t("Priority", "Priorité", lang) },
      ];

      doc.rect(leftX, y, pageW, 18).fill(BRAND);
      let xPos = leftX;
      cols.forEach((col) => {
        doc.fontSize(7.5).font("Helvetica-Bold").fillColor(WHITE)
          .text(col.label, xPos + 5, y + 5, { width: col.w - 10 });
        xPos += col.w;
      });
      y += 18;

      data.leaks.forEach((leak, i) => {
        if (y > 680) {
          addFooter(doc, data, lang);
          doc.addPage();
          y = 50;
        }

        const sev = severityFromScore(leak.severity);
        const sevColor = severityColor(sev);
        const leakName = LEAK_NAMES[leak.code]
          ? (lang === "fr" ? LEAK_NAMES[leak.code].fr : LEAK_NAMES[leak.code].en)
          : leak.code.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

        // Alternating row
        if (i % 2 === 0) doc.rect(leftX, y, pageW, 22).fill(LIGHT_GRAY);

        xPos = leftX;

        // #
        doc.fontSize(8).font("Helvetica-Bold").fillColor(NAVY)
          .text(String(i + 1), xPos + 5, y + 6, { width: 20 });
        xPos += 30;

        // Leak name
        doc.fontSize(8).font("Helvetica").fillColor(NAVY)
          .text(leakName, xPos + 5, y + 6, { width: 185 });
        xPos += 195;

        // Amount
        doc.fontSize(9).font("Helvetica-Bold").fillColor(RED)
          .text(fmtMoney(leak.amount), xPos + 5, y + 6, { width: 70 });
        xPos += 80;

        // Severity
        doc.fontSize(8).font("Helvetica-Bold").fillColor(sevColor)
          .text(
            SEVERITY_LABELS[sev] ? (lang === "fr" ? SEVERITY_LABELS[sev].fr : SEVERITY_LABELS[sev].en) : sev,
            xPos + 5, y + 6, { width: 60 }
          );
        xPos += 70;

        // Confidence
        doc.fontSize(8).font("Helvetica").fillColor(GRAY)
          .text(`${leak.confidence}%`, xPos + 5, y + 6, { width: 52 });
        xPos += 62;

        // Priority
        doc.fontSize(8).font("Helvetica-Bold").fillColor(NAVY)
          .text(String(leak.priority), xPos + 5, y + 6, { width: 45 });

        y += 22;
      });

      y += 10;

      // Total row
      doc.rect(leftX, y, pageW, 24).fill(BRAND);
      doc.fontSize(9).font("Helvetica-Bold").fillColor(WHITE)
        .text(t("TOTAL ESTIMATED ANNUAL LEAK", "FUITE ANNUELLE ESTIMÉE TOTALE", lang), leftX + 10, y + 7);
      doc.fontSize(11).font("Helvetica-Bold").fillColor(WHITE)
        .text(fmtMoney(data.totalLeak) + t("/yr", "/an", lang), leftX + 310, y + 6, { width: 180, align: "right" });
      y += 38;
    }

    // ═══════════════════════════════════════════════════════════════
    // WHAT'S NEXT / CTA
    // ═══════════════════════════════════════════════════════════════

    if (y > 620) {
      addFooter(doc, data, lang);
      doc.addPage();
      y = 50;
    }

    doc.fontSize(13).font("Helvetica-Bold").fillColor(NAVY)
      .text(t("WHAT'S NEXT?", "PROCHAINES ÉTAPES", lang), leftX, y);
    y += 22;

    const steps = lang === "fr" ? [
      "1. Créez votre compte gratuit pour conserver ces résultats",
      "2. Connectez votre logiciel comptable pour un diagnostic plus précis",
      "3. Recevez un plan d'action personnalisé avec des économies estimées",
      "4. Suivez vos progrès avec un score de santé en temps réel",
    ] : [
      "1. Create your free account to save these results",
      "2. Connect your accounting software for a more precise diagnosis",
      "3. Receive a personalized action plan with estimated savings",
      "4. Track your progress with a real-time health score",
    ];

    steps.forEach(step => {
      doc.fontSize(10).font("Helvetica").fillColor(NAVY).text(step, leftX + 10, y, { width: pageW - 20 });
      y += 18;
    });

    y += 12;

    // CTA box
    doc.rect(leftX, y, pageW, 44).fill(BRAND);
    doc.fontSize(12).font("Helvetica-Bold").fillColor(WHITE)
      .text(
        t("Start your free diagnostic at fruxal.ca", "Commencez votre diagnostic gratuit sur fruxal.ca", lang),
        leftX + 20, y + 14, { width: pageW - 40, align: "center" }
      );

    // ── Footer ──
    addFooter(doc, data, lang);
    doc.end();
  });
}

function addFooter(doc: PDFKit.PDFDocument, data: PrescanReportData, lang: "en" | "fr") {
  doc.fontSize(7).font("Helvetica").fillColor(GRAY)
    .text(
      t(
        `Generated by Fruxal | ${new Date(data.generatedAt).toLocaleDateString("en-CA")} | This is an estimate based on industry benchmarks. Results may vary with actual financial data.`,
        `Généré par Fruxal | ${new Date(data.generatedAt).toLocaleDateString("fr-CA")} | Ceci est une estimation basée sur les repères de l'industrie. Les résultats peuvent varier avec des données financières réelles.`,
        lang
      ),
      55, 740, { width: 502, align: "center" }
    );
}
