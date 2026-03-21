// =============================================================================
// EXPORT SERVICE — Uses Supabase (V3 compatible)
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { generatePDFBuffer } from "./generate-pdf";
import { generateExcelBuffer } from "./generate-excel";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ReportData {
  businessName: string;
  reportDate: string;
  summary: {
    totalRevenue: number;
    totalCollected: number;
    collectionRate: number;
    healthScore: number;
    openLeaks: number;
    leakImpact: number;
    overdueInvoices: number;
    overdueAmount: number;
    recoveredAmount: number;
    activeClients: number;
  };
  leaks: any[];
  clients: any[];
  tasks: any[];
  snapshots: any[];
}

// ─── GATHER REPORT DATA ─────────────────────────────────────────────────────
export async function gatherReportData(businessId: string): Promise<ReportData> {
  // Load business
  const { data: biz } = await sb
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  // Load latest prescan run
  const { data: prescanRun } = await sb
    .from("prescan_runs")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Load detected leaks
  const { data: leaks } = await sb
    .from("detected_leaks")
    .select("*")
    .or(
      prescanRun
        ? `prescan_run_id.eq.${prescanRun.id}`
        : `business_id.eq.${businessId}`
    )
    .order("priority_score", { ascending: false, nullsFirst: false });

  const leakList = leaks || [];
  const openLeaks = leakList.filter(l => l.status === "detected" || l.status === "shown_free");
  const totalImpact = openLeaks.reduce((s, l) => s + (l.estimated_annual_leak || l.annual_leak_amount ?? 0), 0);

  const annualRev = prescanRun?.annual_revenue || biz?.annual_revenue ?? 0;
  const healthScore = prescanRun?.health_score || 50;

  return {
    businessName: biz?.name || "Your Business",
    reportDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    summary: {
      totalRevenue: annualRev,
      totalCollected: 0,
      collectionRate: 0,
      healthScore,
      openLeaks: openLeaks.length,
      leakImpact: totalImpact,
      overdueInvoices: 0,
      overdueAmount: 0,
      recoveredAmount: 0,
      activeClients: 0,
    },
    leaks: openLeaks.map(l => ({
      clientName: "",
      type: l.leak_type_code || l.leak_type || "",
      description: "",
      annualImpact: l.estimated_annual_leak || l.annual_leak_amount ?? 0,
      priority: l.severity_score >= 80 ? "CRITICAL" : l.severity_score >= 60 ? "HIGH" : l.severity_score >= 30 ? "MEDIUM" : "LOW",
      status: l.status || "detected",
      fix: "",
    })),
    clients: [],
    tasks: [],
    snapshots: [],
  };
}

// ─── GENERATE PDF ───────────────────────────────────────────────────────────
export async function generatePDFReport(businessId: string): Promise<Buffer> {
  const data = await gatherReportData(businessId);
  return generatePDFBuffer(data);
}

// ─── GENERATE EXCEL ─────────────────────────────────────────────────────────
export async function generateExcelExport(businessId: string): Promise<Buffer> {
  const data = await gatherReportData(businessId);
  return generateExcelBuffer(data);
}
