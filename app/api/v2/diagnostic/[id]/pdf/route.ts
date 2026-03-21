// =============================================================================
// app/api/v2/diagnostic/[id]/pdf/route.ts
// GET /api/v2/diagnostic/{reportId}/pdf?language=en|fr
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken }                  from "next-auth/jwt";
import { supabaseAdmin }             from "@/lib/supabase-admin";
import PDFDocument                   from "pdfkit";

const C = {
  brand:     "#1B3A2D", brandMid:  "#2A5A44", accent:    "#3D7A5E",
  positive:  "#2D7A50", negative:  "#B34040", caution:   "#A68B2B",
  ink:       "#1A1A18", secondary: "#56554F", muted:     "#8E8C85",
  faint:     "#B5B3AD", border:    "#E8E6E1", bg:        "#FAFAF8",
  bgSection: "#F0EFEB", white:     "#FFFFFF",
};

const W = 612, H = 792, M = 48, CW = W - M * 2;

function fmtM(n: number): string {
  if (!n) return "$0";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
function severityColor(s: string): string {
  const m: Record<string, string> = { critical: C.negative, high: C.caution, medium: C.muted, low: C.faint };
  return m[s?.toLowerCase()] || C.muted;
}
function scoreColor(n: number): string {
  return n >= 70 ? C.positive : n >= 40 ? C.caution : C.negative;
}
function wrap(doc: any, text: string, x: number, y: number, w: number, opts: any = {}): number {
  doc.text(text || "—", x, y, { width: w, ...opts });
  return doc.y;
}
function hr(doc: any, y: number, color = C.border, lw = 0.5): void {
  doc.moveTo(M, y).lineTo(W - M, y).strokeColor(color).lineWidth(lw).stroke();
}
function sectionHead(doc: any, label: string, y: number): number {
  doc.rect(M, y, CW, 18).fill(C.brand);
  doc.fontSize(8).font("Helvetica-Bold").fillColor(C.white)
     .text(label.toUpperCase(), M + 8, y + 5, { width: CW - 16 });
  return y + 26;
}
function scoreBar(doc: any, label: string, val: number, x: number, y: number, barW = 120): void {
  const color = scoreColor(val);
  doc.fontSize(7).font("Helvetica").fillColor(C.secondary).text(label, x, y, { width: barW + 40 });
  const bY = y + 10;
  doc.rect(x, bY, barW, 5).fill(C.bgSection);
  doc.rect(x, bY, barW * (val / 100), 5).fill(color);
  doc.fontSize(7).font("Helvetica-Bold").fillColor(color).text(String(val), x + barW + 4, y + 1);
}

function buildPDF(report: any, profile: any, isFr: boolean): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: M, bottom: M, left: M, right: M },
      info: {
        Title:   isFr ? "Rapport de diagnostic Fruxal" : "Fruxal Enterprise Diagnostic Report",
        Author:  "Fruxal Diagnostic Inc.",
        Subject: profile.business_name || profile.industry || "Enterprise Diagnostic",
      },
    });
    doc.on("data",  (c: Buffer) => chunks.push(c));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const t = (en: string, fr: string) => isFr ? fr : en;

    const scores        = report.scores              || {};
    const totals        = report.totals              || {};
    const findings      = report.findings            || [];
    const riskMatrix    = report.risk_matrix         || [];
    const priority      = report.priority_sequence   || [];
    const benchmarks    = report.benchmark_comparisons || [];
    const cpa           = report.cpa_briefing        || {};
    const exitR         = report.exit_readiness      || {};
    const execSummary   = isFr
      ? (report.executive_summary_fr || report.executive_summary || "")
      : (report.executive_summary    || "");
    const anchor        = report.savings_anchor?.headline || fmtM(totals.potential_savings || totals.annual_leaks ?? 0);
    const companyName   = profile.business_name || profile.industry_label || "Your Business";
    const dateStr       = new Date().toLocaleDateString(isFr ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric" });

    // PAGE 1 — COVER
    doc.rect(0, 0, W, 220).fill(C.brand);
    doc.fontSize(28).font("Helvetica-Bold").fillColor(C.white).text("FRUXAL", M, 44);
    doc.fontSize(9).font("Helvetica").fillColor("rgba(255,255,255,0.55)")
       .text(t("Enterprise Financial Diagnostic", "Diagnostic financier enterprise"), M, 78);
    doc.moveTo(M, 96).lineTo(W - M, 96).strokeColor("rgba(255,255,255,0.2)").lineWidth(0.5).stroke();
    doc.fontSize(18).font("Helvetica-Bold").fillColor(C.white).text(companyName, M, 110, { width: CW });
    doc.fontSize(9).font("Helvetica").fillColor("rgba(255,255,255,0.6)").text(dateStr, M, 140);
    if (profile.province || profile.industry_label) {
      doc.fontSize(8).fillColor("rgba(255,255,255,0.45)")
         .text(`${profile.industry_label || ""} · ${profile.province || ""}`.trim().replace(/^·\s*/, ""), M, 156);
    }
    const anchorY = 175;
    doc.rect(M, anchorY, CW, 32).fill("rgba(255,255,255,0.08)");
    doc.fontSize(8).font("Helvetica").fillColor("rgba(255,255,255,0.55)")
       .text(t("ESTIMATED ANNUAL OPPORTUNITY", "OPPORTUNITÉ ANNUELLE ESTIMÉE"), M + 12, anchorY + 6);
    doc.fontSize(14).font("Helvetica-Bold").fillColor(C.white).text(anchor, M + 12, anchorY + 15);

    let y = 240;

    const scoreLabels: [string, string, keyof typeof scores][] = [
      [t("Overall Health",   "Santé globale"),         "",  "overall"],
      [t("Compliance",       "Conformité"),             "",  "compliance"],
      [t("Efficiency",       "Efficacité"),             "",  "efficiency"],
      [t("Tax Optimization", "Optimisation fiscale"),   "",  "optimization"],
      [t("Growth",          "Croissance"),              "",  "growth"],
      [t("Bankability",     "Finançabilité"),           "",  "bankability"],
      [t("Exit Readiness",  "Prêt à vendre"),           "",  "exit_readiness"],
    ];

    doc.fontSize(9).font("Helvetica-Bold").fillColor(C.brand)
       .text(t("DIAGNOSTIC SCORES", "SCORES DE DIAGNOSTIC"), M, y);
    y += 16;
    hr(doc, y - 4);

    const col1X = M, col2X = M + CW / 2 + 10;
    let col1Y = y, col2Y = y;
    scoreLabels.forEach((sl, i) => {
      const val = scores[sl[2]] || 0;
      if (i % 2 === 0) { scoreBar(doc, sl[0], val, col1X, col1Y, 130); col1Y += 24; }
      else             { scoreBar(doc, sl[0], val, col2X, col2Y, 130); col2Y += 24; }
    });
    y = Math.max(col1Y, col2Y) + 12;

    const kpis = [
      { label: t("Annual Leaks",      "Pertes annuelles"),          val: fmtM(totals.annual_leaks ?? 0) },
      { label: t("Potential Savings", "Économies potentielles"),     val: fmtM(totals.potential_savings ?? 0) },
      { label: t("EBITDA Impact",     "Impact BAIIA"),               val: fmtM(totals.ebitda_impact ?? 0) },
      { label: t("EV Impact",         "Impact valeur d'entreprise"), val: fmtM(totals.enterprise_value_impact ?? 0) },
    ];
    const boxW = (CW - 12) / 4;
    kpis.forEach((k, i) => {
      const bx = M + i * (boxW + 4);
      doc.rect(bx, y, boxW, 36).fill(C.bgSection).stroke(C.border);
      doc.fontSize(6.5).font("Helvetica").fillColor(C.muted).text(k.label, bx + 6, y + 5, { width: boxW - 12 });
      doc.fontSize(11).font("Helvetica-Bold").fillColor(C.ink).text(k.val, bx + 6, y + 15, { width: boxW - 12 });
    });
    y += 52;

    if (execSummary) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor(C.brand).text(t("EXECUTIVE SUMMARY", "RÉSUMÉ EXÉCUTIF"), M, y);
      y += 14;
      hr(doc, y - 4);
      doc.fontSize(8.5).font("Helvetica").fillColor(C.secondary);
      wrap(doc, execSummary, M, y, CW, { lineGap: 2 });
      y = doc.y + 12;
    }

    doc.fontSize(7).font("Helvetica").fillColor(C.faint)
       .text(
         t("Confidential — prepared for internal use only. Fruxal Diagnostic Inc. All rights reserved.",
           "Confidentiel — préparé à usage interne uniquement. Fruxal Diagnostic Inc. Tous droits réservés."),
         M, H - M, { width: CW, align: "center" }
       );

    // PAGE 2 — FINDINGS
    if (findings.length > 0) {
      doc.addPage();
      y = M;
      y = sectionHead(doc, t("FINDINGS", "CONSTATS"), y);

      findings.forEach((f: any, idx: number) => {
        const title       = isFr ? (f.title_fr || f.title || "") : (f.title || "");
        const desc        = isFr ? (f.description_fr || f.description || "") : (f.description || "");
        const rec         = isFr ? (f.recommendation_fr || f.recommendation || "") : (f.recommendation || "");
        const sev         = f.severity || "medium";
        const sevColor    = severityColor(sev);
        const impactRange = (f.impact_min || f.impact_max) ? `${fmtM(f.impact_min ?? 0)} – ${fmtM(f.impact_max ?? 0)}` : "—";
        const effort      = f.effort ? f.effort.charAt(0).toUpperCase() + f.effort.slice(1) : "—";
        const estH = 80;
        if (y + estH > H - M - 20) {
          doc.addPage(); y = M;
          y = sectionHead(doc, t("FINDINGS (CONTINUED)", "CONSTATS (SUITE)"), y);
        }
        const cardH = 72;
        doc.rect(M, y, CW, cardH).fill(C.bg).stroke(C.border);
        doc.rect(M, y, 4, cardH).fill(sevColor);
        doc.fontSize(7).font("Helvetica-Bold").fillColor(sevColor)
           .text(`${f.id || `F-${String(idx + 1).padStart(3, "0")}`}`, M + 12, y + 6);
        doc.fontSize(6.5).font("Helvetica").fillColor(C.muted).text(sev.toUpperCase(), M + 45, y + 6);
        doc.fontSize(9).font("Helvetica-Bold").fillColor(C.ink)
           .text(impactRange, W - M - 80, y + 5, { width: 76, align: "right" });
        doc.fontSize(6.5).font("Helvetica").fillColor(C.muted)
           .text(t("annual impact", "impact annuel"), W - M - 80, y + 16, { width: 76, align: "right" });
        doc.fontSize(9).font("Helvetica-Bold").fillColor(C.ink)
           .text(title, M + 12, y + 17, { width: CW - 110 });
        doc.fontSize(7.5).font("Helvetica").fillColor(C.secondary)
           .text(desc, M + 12, y + 28, { width: CW - 110, height: 18, ellipsis: true });
        doc.fontSize(7).font("Helvetica-Bold").fillColor(C.brand)
           .text(t("Rec: ", "Rec: "), M + 12, y + 49, { continued: true, width: 30 });
        doc.fontSize(7).font("Helvetica").fillColor(C.secondary)
           .text(rec, { width: CW - 24, height: 14, ellipsis: true });
        doc.fontSize(6).font("Helvetica").fillColor(C.muted)
           .text(`${t("Effort", "Effort")}: ${effort}`, M + 12, y + 60);
        if (f.timeline) {
          doc.fontSize(6).font("Helvetica").fillColor(C.muted)
             .text(`${t("Timeline", "Délai")}: ${f.timeline.replace(/_/g, " ")}`, M + 90, y + 60);
        }
        y += cardH + 6;
      });
    }

    // PAGE — RISK MATRIX
    if (riskMatrix.length > 0) {
      doc.addPage(); y = M;
      y = sectionHead(doc, t("RISK MATRIX", "MATRICE DES RISQUES"), y);
      const cols = [
        { label: t("Area", "Domaine"),           x: M + 8,   w: 130 },
        { label: t("Risk Level", "Niveau"),       x: M + 145, w: 55  },
        { label: t("Likelihood", "Probabilité"),  x: M + 205, w: 55  },
        { label: t("Impact", "Impact"),           x: M + 265, w: 55  },
        { label: t("Status", "Statut"),           x: M + 325, w: 120 },
        { label: t("Recommendation", "Recomm."), x: M + 450, w: CW - 450 - 8 },
      ];
      doc.rect(M, y, CW, 16).fill(C.bgSection);
      cols.forEach(col => {
        doc.fontSize(6.5).font("Helvetica-Bold").fillColor(C.secondary).text(col.label, col.x, y + 4, { width: col.w });
      });
      y += 16;
      riskMatrix.forEach((r: any, i: number) => {
        if (y + 22 > H - M) { doc.addPage(); y = M; }
        const area   = isFr ? (r.area_fr    || r.area    || "") : (r.area    || "");
        const status = isFr ? (r.current_status_fr || r.current_status || "") : (r.current_status || "");
        const rec    = isFr ? (r.recommendation_fr || r.recommendation || "") : (r.recommendation || "");
        const risk   = r.risk_level || "medium";
        const rColor = severityColor(risk);
        doc.rect(M, y, CW, 20).fill(i % 2 === 0 ? C.white : C.bg).stroke(C.border);
        doc.fontSize(7.5).font("Helvetica-Bold").fillColor(C.ink).text(area, cols[0].x, y + 4, { width: cols[0].w, ellipsis: true });
        doc.fontSize(7).font("Helvetica-Bold").fillColor(rColor).text(risk.toUpperCase(), cols[1].x, y + 4, { width: cols[1].w });
        doc.fontSize(7).font("Helvetica").fillColor(C.secondary).text((r.likelihood || "—"), cols[2].x, y + 4, { width: cols[2].w });
        doc.fontSize(7).font("Helvetica").fillColor(C.secondary).text((r.impact     || "—"), cols[3].x, y + 4, { width: cols[3].w });
        doc.fontSize(7).font("Helvetica").fillColor(C.secondary).text(status, cols[4].x, y + 4, { width: cols[4].w, ellipsis: true });
        doc.fontSize(7).font("Helvetica").fillColor(C.secondary).text(rec, cols[5].x, y + 4, { width: cols[5].w, ellipsis: true });
        y += 20;
      });
    }

    // PAGE — PRIORITY SEQUENCE
    if (priority.length > 0) {
      doc.addPage(); y = M;
      y = sectionHead(doc, t("PRIORITY ACTION SEQUENCE", "SÉQUENCE D'ACTIONS PRIORITAIRES"), y);
      priority.forEach((p: any, i: number) => {
        if (y + 56 > H - M) { doc.addPage(); y = M; }
        const action   = isFr ? (p.action_fr    || p.action    || "") : (p.action    || "");
        const whyFirst = isFr ? (p.why_first_fr || p.why_first || "") : (p.why_first || "");
        const expected = p.expected_result || "";
        const ebitda   = p.ebitda_improvement ? fmtM(p.ebitda_improvement) : null;
        const ev       = p.enterprise_value_improvement ? fmtM(p.enterprise_value_improvement) : null;
        doc.rect(M, y, CW, 50).fill(C.bg).stroke(C.border);
        doc.rect(M, y, 24, 50).fill(C.brand);
        doc.fontSize(12).font("Helvetica-Bold").fillColor(C.white).text(String(p.rank || i + 1), M + 6, y + 16, { width: 14, align: "center" });
        doc.fontSize(9).font("Helvetica-Bold").fillColor(C.ink).text(action, M + 32, y + 6, { width: CW - 120 });
        doc.fontSize(7.5).font("Helvetica").fillColor(C.secondary).text(whyFirst, M + 32, y + 18, { width: CW - 120, height: 14, ellipsis: true });
        doc.fontSize(7).font("Helvetica").fillColor(C.muted).text(expected, M + 32, y + 33, { width: CW - 120, height: 12, ellipsis: true });
        if (ebitda || ev) {
          doc.fontSize(7).font("Helvetica-Bold").fillColor(C.positive)
             .text(`${ebitda ? `EBITDA ${ebitda}` : ""}${ebitda && ev ? "  " : ""}${ev ? `EV ${ev}` : ""}`, W - M - 100, y + 18, { width: 96, align: "right" });
        }
        y += 56;
      });
    }

    // PAGE — PEER BENCHMARKS
    if (benchmarks.length > 0) {
      doc.addPage(); y = M;
      y = sectionHead(doc, t("PEER BENCHMARKS", "COMPARAISONS SECTORIELLES"), y);
      const bCols = [
        { label: t("Metric", "Indicateur"),         x: M + 8,   w: 140 },
        { label: t("Your Value", "Votre valeur"),    x: M + 155, w: 70  },
        { label: t("Industry Avg", "Moy. secteur"),  x: M + 232, w: 70  },
        { label: t("Top Quartile", "Haut quartile"), x: M + 309, w: 70  },
        { label: t("Status", "Statut"),              x: M + 386, w: 60  },
        { label: t("Gap", "Écart"),                  x: M + 453, w: CW - 453 - 8 },
      ];
      doc.rect(M, y, CW, 16).fill(C.bgSection);
      bCols.forEach(col => {
        doc.fontSize(6.5).font("Helvetica-Bold").fillColor(C.secondary).text(col.label, col.x, y + 4, { width: col.w });
      });
      y += 16;
      benchmarks.forEach((b: any, i: number) => {
        if (y + 20 > H - M) { doc.addPage(); y = M; }
        const name   = isFr ? (b.metric_name_fr || b.metric_name || "") : (b.metric_name || "");
        const gap    = isFr ? (b.gap_fr         || b.gap         || "") : (b.gap         || "");
        const status = b.status || "at";
        const sColor = status === "above" ? C.positive : status === "below" ? C.negative : C.caution;
        doc.rect(M, y, CW, 20).fill(i % 2 === 0 ? C.white : C.bg).stroke(C.border);
        doc.fontSize(7.5).font("Helvetica-Bold").fillColor(C.ink).text(name, bCols[0].x, y + 5, { width: bCols[0].w, ellipsis: true });
        doc.fontSize(7.5).font("Helvetica-Bold").fillColor(sColor).text(b.your_value   || "—", bCols[1].x, y + 5, { width: bCols[1].w });
        doc.fontSize(7.5).font("Helvetica").fillColor(C.secondary).text(b.industry_avg || "—", bCols[2].x, y + 5, { width: bCols[2].w });
        doc.fontSize(7.5).font("Helvetica").fillColor(C.secondary).text(b.top_quartile || "—", bCols[3].x, y + 5, { width: bCols[3].w });
        doc.fontSize(7).font("Helvetica-Bold").fillColor(sColor).text(status.toUpperCase(), bCols[4].x, y + 5, { width: bCols[4].w });
        doc.fontSize(7).font("Helvetica").fillColor(C.secondary).text(gap, bCols[5].x, y + 5, { width: bCols[5].w, ellipsis: true });
        y += 20;
      });
    }

    // PAGE — CPA BRIEFING
    const talkingPoints = cpa.talking_points || [];
    const forms         = cpa.forms_to_discuss || [];
    if (talkingPoints.length > 0 || (cpa.key_findings || []).length > 0) {
      doc.addPage(); y = M;
      y = sectionHead(doc, t("CPA / BOARD BRIEFING", "NOTES POUR COMPTABLE / CONSEIL"), y);
      const intro = isFr ? (cpa.intro_fr || cpa.intro || "") : (cpa.intro || "");
      if (intro) {
        doc.fontSize(8.5).font("Helvetica").fillColor(C.secondary);
        wrap(doc, intro, M, y, CW, { lineGap: 2 });
        y = doc.y + 12;
      }
      if (talkingPoints.length > 0) {
        doc.fontSize(8).font("Helvetica-Bold").fillColor(C.brand).text(t("Key Talking Points", "Points clés"), M, y);
        y += 14;
        talkingPoints.forEach((tp: any) => {
          if (y + 20 > H - M) { doc.addPage(); y = M; }
          const pt = isFr ? (tp.point_fr || tp.point || tp) : (tp.point || tp);
          doc.rect(M, y, 3, 12).fill(C.accent);
          doc.fontSize(8).font("Helvetica").fillColor(C.secondary).text(pt, M + 10, y, { width: CW - 12, lineGap: 1 });
          y = doc.y + 6;
        });
        y += 6;
      }
      if (forms.length > 0) {
        if (y + 30 > H - M) { doc.addPage(); y = M; }
        doc.fontSize(8).font("Helvetica-Bold").fillColor(C.brand).text(t("Forms to Discuss", "Formulaires à discuter"), M, y);
        y += 12;
        doc.fontSize(8).font("Helvetica").fillColor(C.secondary).text(forms.join("  ·  "), M, y, { width: CW });
        y = doc.y + 12;
      }
      const taxExp = isFr ? (cpa.tax_exposures_fr || cpa.tax_exposures || "") : (cpa.tax_exposures || "");
      if (taxExp) {
        if (y + 30 > H - M) { doc.addPage(); y = M; }
        doc.fontSize(8).font("Helvetica-Bold").fillColor(C.negative).text(t("Tax Exposures", "Expositions fiscales"), M, y);
        y += 12;
        doc.fontSize(8).font("Helvetica").fillColor(C.secondary);
        wrap(doc, taxExp, M, y, CW, { lineGap: 2 });
        y = doc.y + 12;
      }
      [{ key: "rdtoh_strategy", label: "RDTOH" }, { key: "cda_strategy", label: "CDA" }, { key: "lcge_plan", label: "LCGE" }].forEach(({ key, label }) => {
        const val = (cpa as any)[key];
        if (val) {
          if (y + 30 > H - M) { doc.addPage(); y = M; }
          doc.fontSize(8).font("Helvetica-Bold").fillColor(C.brand).text(label, M, y);
          y += 12;
          doc.fontSize(8).font("Helvetica").fillColor(C.secondary);
          wrap(doc, val, M, y, CW, { lineGap: 2 });
          y = doc.y + 10;
        }
      });
    }

    // PAGE — EXIT READINESS
    const killers  = exitR.value_killers  || [];
    const builders = exitR.value_builders || [];
    if (killers.length > 0 || builders.length > 0) {
      doc.addPage(); y = M;
      y = sectionHead(doc, t("EXIT READINESS", "PRÊT À VENDRE"), y);
      if (exitR.score != null) {
        scoreBar(doc, t("Exit Readiness Score", "Score de préparation"), exitR.score, M, y, 180);
        y += 26;
      }
      if (exitR.next_step) {
        doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.brand).text(t("Next Step: ", "Prochaine étape: "), M, y, { continued: true });
        doc.fontSize(8.5).font("Helvetica").fillColor(C.secondary).text(exitR.next_step);
        y = doc.y + 12;
      }
      if (killers.length > 0) {
        doc.fontSize(9).font("Helvetica-Bold").fillColor(C.negative).text(t("Value Killers", "Destructeurs de valeur"), M, y);
        y += 14;
        killers.forEach((k: any) => {
          if (y + 24 > H - M) { doc.addPage(); y = M; }
          doc.rect(M, y, CW, 20).fill("rgba(179,64,64,0.04)").stroke("rgba(179,64,64,0.15)");
          doc.rect(M, y, 3, 20).fill(C.negative);
          doc.fontSize(8).font("Helvetica-Bold").fillColor(C.ink).text(k.issue || "", M + 10, y + 4, { width: CW - 110 });
          if (k.valuation_discount) {
            doc.fontSize(8).font("Helvetica-Bold").fillColor(C.negative).text(`-${fmtM(k.valuation_discount)}`, W - M - 90, y + 4, { width: 86, align: "right" });
          }
          y += 24;
        });
        y += 6;
      }
      if (builders.length > 0) {
        doc.fontSize(9).font("Helvetica-Bold").fillColor(C.positive).text(t("Value Builders", "Créateurs de valeur"), M, y);
        y += 14;
        builders.forEach((b: any) => {
          if (y + 24 > H - M) { doc.addPage(); y = M; }
          doc.rect(M, y, CW, 20).fill("rgba(45,122,80,0.04)").stroke("rgba(45,122,80,0.15)");
          doc.rect(M, y, 3, 20).fill(C.positive);
          doc.fontSize(8).font("Helvetica-Bold").fillColor(C.ink).text(b.strength || "", M + 10, y + 4, { width: CW - 110 });
          if (b.valuation_premium_label) {
            doc.fontSize(8).font("Helvetica-Bold").fillColor(C.positive).text(b.valuation_premium_label, W - M - 90, y + 4, { width: 86, align: "right" });
          }
          y += 24;
        });
      }
    }

    // ALL PAGES — page numbers
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc.fontSize(7).font("Helvetica").fillColor(C.faint)
         .text(
           `${t("Fruxal Enterprise Diagnostic", "Diagnostic Fruxal")} · ${companyName} · ${dateStr}` +
           `    ${i + 1} / ${range.count}`,
           M, H - 28, { width: CW, align: "right" }
         );
    }

    doc.end();
  });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token  = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id }  = params;
    const lang    = req.nextUrl.searchParams.get("language") || "en";
    const isFr    = lang === "fr";
    const isAdmin = (token as any)?.role === "admin" ||
      process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()).includes((token as any)?.email || "");

    const { data: report, error } = await supabaseAdmin
      .from("diagnostic_reports")
      .select("id, user_id, tier, status, completed_at, result_json")
      .eq("id", id)
      .single();

    if (error || !report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    if (report.user_id !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (report.status !== "completed") {
      return NextResponse.json({ error: "Report not yet complete" }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_name, industry_label, province, exact_annual_revenue")
      .eq("user_id", report.user_id)
      .single();

    const pdfBuffer = await buildPDF(report.result_json || {}, profile || {}, isFr);

    const companySlug = (profile?.business_name || "fruxal-diagnostic")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const filename = `${companySlug}-${isFr ? "diagnostic-fr" : "diagnostic"}-${new Date().toISOString().slice(0, 10)}.pdf`;

    // ── FIX: cast Buffer to BodyInit ──────────────────────────────────────────
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length":      String(pdfBuffer.length),
        "Cache-Control":       "no-store",
      },
    });

  } catch (err: any) {
    console.error("[PDF Export] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
