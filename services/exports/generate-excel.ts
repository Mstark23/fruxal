// =============================================================================
// EXCEL EXPORT GENERATOR — Pure Node.js (no Python)
// Uses ExcelJS to create professional spreadsheets
// =============================================================================

import ExcelJS from "exceljs";

const NAVY = "0F2B46";
const GREEN = "16A34A";
const RED = "DC2626";
const ORANGE = "F97316";
const LIGHT_GRAY = "F3F4F6";

function headerStyle(ws: ExcelJS.Worksheet, row: number, cols: number) {
  const r = ws.getRow(row);
  for (let c = 1; c <= cols; c++) {
    const cell = r.getCell(c);
    cell.font = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${NAVY}` } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
  }
}

function bodyStyle(cell: ExcelJS.Cell, alt: boolean) {
  cell.font = { name: "Arial", size: 10 };
  cell.border = { top: { style: "thin", color: { argb: "FFE5E7EB" } }, bottom: { style: "thin", color: { argb: "FFE5E7EB" } }, left: { style: "thin", color: { argb: "FFE5E7EB" } }, right: { style: "thin", color: { argb: "FFE5E7EB" } } };
  if (alt) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${LIGHT_GRAY}` } };
}

function autoWidth(ws: ExcelJS.Worksheet) {
  ws.columns.forEach((col) => {
    let max = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = cell.value ? String(cell.value).length + 2 : 10;
      if (len > max) max = len;
    });
    col.width = Math.min(max, 35);
  });
}

export async function generateExcelBuffer(data: any): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Fruxal";
  wb.created = new Date();

  // ═══ SHEET 1: SUMMARY ═══
  const ws = wb.addWorksheet("Summary");
  ws.mergeCells("A1:B1");
  ws.getCell("A1").value = "Fruxal — Revenue Intelligence Report";
  ws.getCell("A1").font = { name: "Arial", bold: true, size: 16, color: { argb: `FF${NAVY}` } };
  ws.getCell("A2").value = `Generated: ${data.reportDate || new Date().toLocaleDateString()}`;
  ws.getCell("A2").font = { name: "Arial", size: 10, color: { argb: "FF6B7280" } };

  const summary = data.summary || {};
  const metrics = [
    ["Total Revenue", summary.totalRevenue ?? 0, "$#,##0"],
    ["Total Collected", summary.totalCollected ?? 0, "$#,##0"],
    ["Collection Rate", (summary.collectionRate ?? 0) / 100, "0.0%"],
    ["Health Score", summary.healthScore ?? 0, "0"],
    ["Open Leaks", summary.openLeaks ?? 0, "0"],
    ["Leak Impact/yr", summary.leakImpact ?? 0, "$#,##0"],
    ["Overdue Invoices", summary.overdueInvoices ?? 0, "0"],
    ["Overdue Amount", summary.overdueAmount ?? 0, "$#,##0"],
    ["Recovered", summary.recoveredAmount ?? 0, "$#,##0"],
    ["Active Clients", summary.activeClients ?? 0, "0"],
  ];

  ws.getCell("A4").value = "Metric";
  ws.getCell("B4").value = "Value";
  headerStyle(ws, 4, 2);

  metrics.forEach(([label, value, fmt], i) => {
    const row = 5 + i;
    ws.getCell(`A${row}`).value = label as string;
    const cell = ws.getCell(`B${row}`);
    cell.value = value as number;
    cell.numFmt = fmt as string;
    bodyStyle(ws.getCell(`A${row}`), i % 2 === 1);
    bodyStyle(cell, i % 2 === 1);
  });
  autoWidth(ws);

  // ═══ SHEET 2: LEAKS ═══
  const leaks = data.leaks || [];
  if (leaks.length > 0) {
    const ws2 = wb.addWorksheet("Leaks");
    const headers = ["Client", "Type", "Description", "Annual Impact", "Priority", "Status", "Fix"];
    headers.forEach((h, i) => { ws2.getCell(1, i + 1).value = h; });
    headerStyle(ws2, 1, headers.length);

    leaks.forEach((l: any, i: number) => {
      const r = i + 2;
      ws2.getCell(r, 1).value = l.clientName || "—";
      ws2.getCell(r, 2).value = (l.type || "—").replace(/_/g, " ");
      ws2.getCell(r, 3).value = l.description || "—";
      const impactCell = ws2.getCell(r, 4);
      impactCell.value = l.annualImpact ?? 0;
      impactCell.numFmt = "$#,##0";
      const prioCell = ws2.getCell(r, 5);
      prioCell.value = l.priority || "—";
      if (l.priority === "CRITICAL" || l.priority === "HIGH") {
        prioCell.font = { name: "Arial", size: 10, color: { argb: `FF${RED}` }, bold: true };
      }
      ws2.getCell(r, 6).value = l.status || "—";
      ws2.getCell(r, 7).value = l.fix || "—";
      for (let c = 1; c <= headers.length; c++) bodyStyle(ws2.getCell(r, c), i % 2 === 1);
    });
    autoWidth(ws2);
  }

  // ═══ SHEET 3: CLIENTS ═══
  const clients = data.clients || [];
  if (clients.length > 0) {
    const ws3 = wb.addWorksheet("Clients");
    const headers = ["Client", "Revenue", "Paid", "Collection %", "Invoices", "Status"];
    headers.forEach((h, i) => { ws3.getCell(1, i + 1).value = h; });
    headerStyle(ws3, 1, headers.length);

    clients.forEach((c: any, i: number) => {
      const r = i + 2;
      const rev = Number(c.revenue) || 0;
      const paid = Number(c.paid) || 0;
      const rate = rev > 0 ? paid / rev : 0;

      ws3.getCell(r, 1).value = c.name || "—";
      ws3.getCell(r, 2).value = rev; ws3.getCell(r, 2).numFmt = "$#,##0";
      ws3.getCell(r, 3).value = paid; ws3.getCell(r, 3).numFmt = "$#,##0";
      const rateCell = ws3.getCell(r, 4);
      rateCell.value = rate;
      rateCell.numFmt = "0.0%";
      if (rate < 0.7) rateCell.font = { name: "Arial", size: 10, color: { argb: `FF${RED}` }, bold: true };
      else if (rate < 0.9) rateCell.font = { name: "Arial", size: 10, color: { argb: `FF${ORANGE}` } };
      else rateCell.font = { name: "Arial", size: 10, color: { argb: `FF${GREEN}` } };

      ws3.getCell(r, 5).value = c.invoiceCount ?? 0;
      ws3.getCell(r, 6).value = c.status || "—";
      for (let col = 1; col <= headers.length; col++) bodyStyle(ws3.getCell(r, col), i % 2 === 1);
    });
    autoWidth(ws3);
  }

  // ═══ SHEET 4: TASKS ═══
  const tasks = data.tasks || [];
  if (tasks.length > 0) {
    const ws4 = wb.addWorksheet("Action Items");
    const headers = ["Task", "Client", "Priority", "Category", "Due Date", "Impact", "Status"];
    headers.forEach((h, i) => { ws4.getCell(1, i + 1).value = h; });
    headerStyle(ws4, 1, headers.length);

    tasks.forEach((t: any, i: number) => {
      const r = i + 2;
      ws4.getCell(r, 1).value = t.title || "—";
      ws4.getCell(r, 2).value = t.client_name || "—";
      ws4.getCell(r, 3).value = t.priority || "—";
      ws4.getCell(r, 4).value = t.category || "—";
      ws4.getCell(r, 5).value = t.due_date ? String(t.due_date).slice(0, 10) : "—";
      ws4.getCell(r, 6).value = t.impact_amount ?? 0; ws4.getCell(r, 6).numFmt = "$#,##0";
      ws4.getCell(r, 7).value = t.status || "—";
      for (let c = 1; c <= headers.length; c++) bodyStyle(ws4.getCell(r, c), i % 2 === 1);
    });
    autoWidth(ws4);
  }

  // ═══ SHEET 5: TRENDS ═══
  const snapshots = data.snapshots || [];
  if (snapshots.length > 0) {
    const ws5 = wb.addWorksheet("Trends");
    const headers = ["Date", "Revenue", "Collected", "Collection %", "Open Leaks", "Leak Impact", "Health Score", "Active Clients", "Overdue"];
    headers.forEach((h, i) => { ws5.getCell(1, i + 1).value = h; });
    headerStyle(ws5, 1, headers.length);

    snapshots.forEach((s: any, i: number) => {
      const r = i + 2;
      ws5.getCell(r, 1).value = String(s.snapshot_date || "—").slice(0, 10);
      ws5.getCell(r, 2).value = s.total_revenue ?? 0; ws5.getCell(r, 2).numFmt = "$#,##0";
      ws5.getCell(r, 3).value = s.total_collected ?? 0; ws5.getCell(r, 3).numFmt = "$#,##0";
      ws5.getCell(r, 4).value = (s.collection_rate ?? 0) / 100; ws5.getCell(r, 4).numFmt = "0.0%";
      ws5.getCell(r, 5).value = s.open_leak_count ?? 0;
      ws5.getCell(r, 6).value = s.total_leak_impact ?? 0; ws5.getCell(r, 6).numFmt = "$#,##0";
      ws5.getCell(r, 7).value = s.overall_health ?? 0;
      ws5.getCell(r, 8).value = s.active_clients ?? 0;
      ws5.getCell(r, 9).value = s.overdue_invoices ?? 0;
      for (let c = 1; c <= headers.length; c++) bodyStyle(ws5.getCell(r, c), i % 2 === 1);
    });
    autoWidth(ws5);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
