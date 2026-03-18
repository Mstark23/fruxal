// =============================================================================
// PDF REPORT GENERATOR — Pure Node.js (no Python)
// Uses pdfkit to create professional revenue intelligence reports
// =============================================================================

import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

const NAVY = "#0F2B46";
const ORANGE = "#F97316";
const GREEN = "#16A34A";
const RED = "#DC2626";
const BLUE = "#2563EB";
const GRAY = "#6B7280";
const LIGHT_GRAY = "#F3F4F6";

function fmtMoney(val: number): string {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${val.toFixed(0)}`;
}

export async function generatePDFBuffer(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    const chunks: Buffer[] = [];
    const stream = new PassThrough();

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    doc.pipe(stream);

    const pageWidth = 512; // 612 - 50 - 50
    const summary = data.summary || {};

    // ═══ HEADER ═══
    doc.fontSize(22).font("Helvetica-Bold").fillColor(NAVY).text("Revenue Intelligence Report", 50, 50);
    doc.fontSize(10).font("Helvetica").fillColor(GRAY).text(`${data.businessName || "Your Business"} | ${data.reportDate || new Date().toLocaleDateString()}`, 50, 78);
    doc.moveTo(50, 95).lineTo(562, 95).strokeColor(NAVY).lineWidth(2).stroke();

    // ═══ EXECUTIVE SUMMARY ═══
    let y = 110;
    const metrics = [
      { label: "Total Revenue", value: fmtMoney(summary.totalRevenue || 0) },
      { label: "Collected", value: fmtMoney(summary.totalCollected || 0) },
      { label: "Collection Rate", value: `${summary.collectionRate || 0}%` },
      { label: "Health Score", value: `${summary.healthScore || 0}/100` },
    ];
    const metrics2 = [
      { label: "Open Leaks", value: `${summary.openLeaks || 0}` },
      { label: "Leak Impact/yr", value: fmtMoney(summary.leakImpact || 0) },
      { label: "Overdue Invoices", value: `${summary.overdueInvoices || 0}` },
      { label: "Recovered", value: fmtMoney(summary.recoveredAmount || 0) },
    ];

    // Draw metric boxes
    const drawMetricRow = (metricList: typeof metrics, startY: number) => {
      const boxW = pageWidth / 4;
      metricList.forEach((m, i) => {
        const x = 50 + i * boxW;
        doc.rect(x, startY, boxW - 4, 48).fill(LIGHT_GRAY);
        doc.fontSize(16).font("Helvetica-Bold").fillColor(NAVY).text(m.value, x, startY + 8, { width: boxW - 4, align: "center" });
        doc.fontSize(7).font("Helvetica").fillColor(GRAY).text(m.label, x, startY + 30, { width: boxW - 4, align: "center" });
      });
      return startY + 56;
    };

    y = drawMetricRow(metrics, y);
    y = drawMetricRow(metrics2, y);
    y += 10;

    // ═══ REVENUE LEAKS TABLE ═══
    const leaks = data.leaks || [];
    if (leaks.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").fillColor(NAVY).text("Revenue Leaks", 50, y);
      y += 20;
      doc.fontSize(9).font("Helvetica").fillColor(GRAY).text(`${leaks.length} active leaks. Total impact: ${fmtMoney(leaks.reduce((s: number, l: any) => s + (l.annualImpact || 0), 0))}/yr`, 50, y);
      y += 16;

      // Table header
      const cols = [{ w: 100, label: "Client" }, { w: 80, label: "Type" }, { w: 170, label: "Description" }, { w: 80, label: "Impact/yr" }, { w: 60, label: "Priority" }];
      let xPos = 50;
      doc.rect(50, y, pageWidth, 16).fill(NAVY);
      cols.forEach((col) => {
        doc.fontSize(7).font("Helvetica-Bold").fillColor("white").text(col.label, xPos + 3, y + 4, { width: col.w - 6 });
        xPos += col.w;
      });
      y += 16;

      leaks.slice(0, 15).forEach((l: any, i: number) => {
        if (y > 700) { doc.addPage(); y = 50; }
        if (i % 2 === 1) doc.rect(50, y, pageWidth, 16).fill(LIGHT_GRAY);
        xPos = 50;
        doc.fontSize(7).font("Helvetica").fillColor("black");
        doc.text(String(l.clientName || "—").slice(0, 18), xPos + 3, y + 4, { width: 94 }); xPos += 100;
        doc.text(String(l.type || "—").replace(/_/g, " ").toLowerCase(), xPos + 3, y + 4, { width: 74 }); xPos += 80;
        doc.text(String(l.description || "—").slice(0, 40), xPos + 3, y + 4, { width: 164 }); xPos += 170;
        doc.text(fmtMoney(l.annualImpact || 0), xPos + 3, y + 4, { width: 74 }); xPos += 80;
        const pColor = (l.priority === "CRITICAL" || l.priority === "HIGH") ? RED : ORANGE;
        doc.fillColor(pColor).text(l.priority || "—", xPos + 3, y + 4, { width: 54 });
        y += 16;
      });
      y += 12;
    }

    // ═══ CLIENT PERFORMANCE ═══
    const clients = data.clients || [];
    if (clients.length > 0) {
      if (y > 600) { doc.addPage(); y = 50; }
      doc.fontSize(14).font("Helvetica-Bold").fillColor(NAVY).text("Client Performance", 50, y);
      y += 22;

      const cCols = [{ w: 140, label: "Client" }, { w: 90, label: "Revenue" }, { w: 90, label: "Paid" }, { w: 90, label: "Collection %" }, { w: 80, label: "Status" }];
      let cx = 50;
      doc.rect(50, y, pageWidth, 16).fill(NAVY);
      cCols.forEach((col) => {
        doc.fontSize(7).font("Helvetica-Bold").fillColor("white").text(col.label, cx + 3, y + 4, { width: col.w - 6 });
        cx += col.w;
      });
      y += 16;

      clients.slice(0, 15).forEach((c: any, i: number) => {
        if (y > 700) { doc.addPage(); y = 50; }
        if (i % 2 === 1) doc.rect(50, y, pageWidth, 16).fill(LIGHT_GRAY);
        cx = 50;
        const rev = Number(c.revenue) || 0;
        const paid = Number(c.paid) || 0;
        const rate = rev > 0 ? Math.round((paid / rev) * 100) : 0;
        const rateColor = rate >= 90 ? GREEN : rate >= 70 ? ORANGE : RED;

        doc.fontSize(7).font("Helvetica").fillColor("black");
        doc.text(String(c.name || "—").slice(0, 25), cx + 3, y + 4, { width: 134 }); cx += 140;
        doc.text(fmtMoney(rev), cx + 3, y + 4, { width: 84 }); cx += 90;
        doc.text(fmtMoney(paid), cx + 3, y + 4, { width: 84 }); cx += 90;
        doc.fillColor(rateColor).text(`${rate}%`, cx + 3, y + 4, { width: 84 }); cx += 90;
        doc.fillColor("black").text(c.status || "—", cx + 3, y + 4, { width: 74 });
        y += 16;
      });
      y += 12;
    }

    // ═══ ACTION ITEMS ═══
    const tasks = data.tasks || [];
    if (tasks.length > 0) {
      if (y > 580) { doc.addPage(); y = 50; }
      doc.fontSize(14).font("Helvetica-Bold").fillColor(NAVY).text("Action Items", 50, y);
      y += 22;

      tasks.slice(0, 10).forEach((t: any, i: number) => {
        if (y > 700) { doc.addPage(); y = 50; }
        const prio = t.priority === "CRITICAL" ? "[!!!]" : t.priority === "HIGH" ? "[!!]" : "[!]";
        doc.fontSize(9).font("Helvetica-Bold").fillColor("black").text(`${i + 1}. ${prio} ${t.title}`, 50, y);
        y += 14;
        if (t.due_date) {
          doc.fontSize(7).font("Helvetica").fillColor(GRAY).text(`Due: ${String(t.due_date).slice(0, 10)} | Impact: ${fmtMoney(t.impact_amount || 0)}`, 60, y);
          y += 12;
        }
        y += 4;
      });
    }

    // ═══ TRENDS TABLE ═══
    const snapshots = data.snapshots || [];
    if (snapshots.length > 1) {
      doc.addPage();
      y = 50;
      doc.fontSize(14).font("Helvetica-Bold").fillColor(NAVY).text("Historical Trends", 50, y);
      y += 22;

      const tCols = [{ w: 75 }, { w: 75 }, { w: 75 }, { w: 70 }, { w: 50 }, { w: 80 }, { w: 55 }];
      const tHeaders = ["Period", "Revenue", "Collected", "Rate", "Leaks", "Leak Impact", "Health"];
      let tx = 50;
      doc.rect(50, y, pageWidth, 16).fill(NAVY);
      tHeaders.forEach((h, i) => {
        doc.fontSize(7).font("Helvetica-Bold").fillColor("white").text(h, tx + 3, y + 4, { width: tCols[i].w - 6 });
        tx += tCols[i].w;
      });
      y += 16;

      snapshots.forEach((s: any, i: number) => {
        if (y > 700) { doc.addPage(); y = 50; }
        if (i % 2 === 1) doc.rect(50, y, pageWidth, 16).fill(LIGHT_GRAY);
        tx = 50;
        doc.fontSize(7).font("Helvetica").fillColor("black");
        doc.text(String(s.snapshot_date || "—").slice(0, 10), tx + 3, y + 4); tx += 75;
        doc.text(fmtMoney(s.total_revenue || 0), tx + 3, y + 4); tx += 75;
        doc.text(fmtMoney(s.total_collected || 0), tx + 3, y + 4); tx += 75;
        doc.text(`${Number(s.collection_rate || 0).toFixed(1)}%`, tx + 3, y + 4); tx += 70;
        doc.text(String(s.open_leak_count || 0), tx + 3, y + 4); tx += 50;
        doc.fillColor(RED).text(fmtMoney(s.total_leak_impact || 0), tx + 3, y + 4); tx += 80;
        doc.fillColor("black").text(String(s.overall_health || 0), tx + 3, y + 4);
        y += 16;
      });
    }

    // ═══ FOOTER ═══
    doc.moveTo(50, 730).lineTo(562, 730).strokeColor(GRAY).lineWidth(0.5).stroke();
    doc.fontSize(7).font("Helvetica").fillColor(GRAY).text(`Generated by Fruxal | ${data.reportDate || new Date().toLocaleDateString()} | Confidential`, 50, 735);

    doc.end();
  });
}
