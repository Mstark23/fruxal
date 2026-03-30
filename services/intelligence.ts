// =============================================================================
// src/services/intelligence.ts — Service layer for unified intelligence
// =============================================================================
// All Supabase RPC calls in one place. API routes call these.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  PrescanInput,
  IntelligenceReport,
  Obligation,
  ObligationDashboard,
  GovernmentProgram,
  SmartPartner,
  LeakDetector,
} from "@/types/intelligence";

// ─── PRESCAN ─────────────────────────────────────────────────────────────────

export async function processPrescan(input: PrescanInput): Promise<IntelligenceReport> {
  const { data, error } = await supabaseAdmin.rpc("process_prescan", {
    p_session_id: input.sessionId,
    p_email: input.email || null,
    p_industry: input.industry,
    p_monthly_revenue: input.monthlyRevenue,
    p_employee_count: input.employeeCount,
    p_structure: input.structure,
    p_province: input.province,
  });

  if (error) {
    console.error("[Intelligence] process_prescan error:", error);
    throw new Error(`Prescan failed: ${error.message}`);
  }

  return data as IntelligenceReport;
}

// ─── FULL INTELLIGENCE ───────────────────────────────────────────────────────

export async function generateIntelligence(params: {
  businessId: string;
  userId?: string;
  businessName?: string;
  province?: string;
  municipality?: string;
  structure?: string;
  isIncorporated?: boolean;
  employeeCount?: number;
  annualRevenue?: number;
  monthlyRevenue?: number;
  industry?: string;
  fiscalYearEndMonth?: number;
  language?: string;
  triggeredBy?: string;
}): Promise<IntelligenceReport> {
  const { data, error } = await supabaseAdmin.rpc("generate_business_intelligence", {
    p_business_id: params.businessId,
    p_user_id: params.userId || null,
    p_business_name: params.businessName || null,
    p_province: params.province || "",
    p_municipality: params.municipality || null,
    p_structure: params.structure || "sole_proprietor",
    p_is_incorporated: params.isIncorporated || false,
    p_employee_count: params.employeeCount ?? 0,
    p_annual_revenue: params.annualRevenue ?? 0,
    p_monthly_revenue: params.monthlyRevenue ?? 0,
    p_industry: params.industry || "general",
    p_fiscal_year_end_month: params.fiscalYearEndMonth || 12,
    p_language: params.language || "fr",
    p_triggered_by: params.triggeredBy || "api",
  });

  if (error) {
    console.error("[Intelligence] generate error:", error);
    throw new Error(`Intelligence generation failed: ${error.message}`);
  }

  return data as IntelligenceReport;
}

// ─── OBLIGATIONS ─────────────────────────────────────────────────────────────

export async function getObligations(businessId: string): Promise<Obligation[]> {
  const { data, error } = await supabaseAdmin.rpc("match_obligations", {
    p_business_id: businessId,
  });

  if (error) {
    console.error("[Intelligence] match_obligations error:", error);
    throw new Error(`Obligation matching failed: ${error.message}`);
  }

  return (data || []) as Obligation[];
}

export async function getObligationDashboard(businessId: string): Promise<ObligationDashboard> {
  const { data, error } = await supabaseAdmin.rpc("get_obligation_dashboard", {
    p_business_id: businessId,
  });

  if (error) {
    console.error("[Intelligence] obligation_dashboard error:", error);
    throw new Error(`Dashboard failed: ${error.message}`);
  }

  return data as ObligationDashboard;
}

export async function syncObligations(businessId: string): Promise<{
  total_matched: number;
  new_obligations: number;
  removed_obligations: number;
}> {
  const { data, error } = await supabaseAdmin.rpc("sync_obligations", {
    p_business_id: businessId,
  });

  if (error) {
    console.error("[Intelligence] sync_obligations error:", error);
    throw new Error(`Sync failed: ${error.message}`);
  }

  return data;
}

// ─── GOVERNMENT PROGRAMS ─────────────────────────────────────────────────────

export async function getGovernmentPrograms(params: {
  industry?: string;
  structure?: string;
  employeeCount?: number;
  annualRevenue?: number;
  isIncorporated?: boolean;
}): Promise<GovernmentProgram[]> {
  const { data, error } = await supabaseAdmin.rpc("get_qc_government_programs", {
    p_industry: params.industry || null,
    p_structure: params.structure || null,
    p_employee_count: params.employeeCount ?? 0,
    p_annual_revenue: params.annualRevenue ?? 0,
    p_is_incorporated: params.isIncorporated || false,
  });

  if (error) {
    console.error("[Intelligence] government_programs error:", error);
    throw new Error(`Program search failed: ${error.message}`);
  }

  return (data || []) as GovernmentProgram[];
}

// ─── SMART PARTNERS ──────────────────────────────────────────────────────────

export async function getSmartPartners(params: {
  leakCategory: string;
  province?: string;
  industry?: string;
  structure?: string;
  employeeCount?: number;
  annualRevenue?: number;
  language?: string;
  includeGovernment?: boolean;
  limit?: number;
}): Promise<SmartPartner[]> {
  const { data, error } = await supabaseAdmin.rpc("get_smart_partners", {
    p_leak_category: params.leakCategory,
    p_province: params.province || null,
    p_industry: params.industry || null,
    p_structure: params.structure || null,
    p_employee_count: params.employeeCount ?? 0,
    p_annual_revenue: params.annualRevenue ?? 0,
    p_language: params.language || "en",
    p_include_government: params.includeGovernment ?? true,
    p_limit: params.limit || 10,
  });

  if (error) {
    console.error("[Intelligence] smart_partners error:", error);
    throw new Error(`Partner matching failed: ${error.message}`);
  }

  return (data || []) as SmartPartner[];
}

// ─── QC LEAK DETECTORS ──────────────────────────────────────────────────────

export async function getLeakDetectors(params: {
  industry?: string;
  structure?: string;
  employeeCount?: number;
  annualRevenue?: number;
}): Promise<LeakDetector[]> {
  const { data, error } = await supabaseAdmin.rpc("get_qc_leak_detectors", {
    p_industry: params.industry || null,
    p_structure: params.structure || null,
    p_employee_count: params.employeeCount ?? 0,
    p_annual_revenue: params.annualRevenue ?? 0,
  });

  if (error) {
    console.error("[Intelligence] leak_detectors error:", error);
    throw new Error(`Leak detector search failed: ${error.message}`);
  }

  return (data || []) as LeakDetector[];
}

// ─── LATEST REPORT ───────────────────────────────────────────────────────────

export async function getLatestReport(businessId: string): Promise<IntelligenceReport | null> {
  const { data, error } = await supabaseAdmin
    .from("business_intelligence_reports")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    console.error("[Intelligence] getLatestReport error:", error);
    throw new Error(`Report fetch failed: ${error.message}`);
  }

  return data?.report_data
    ? ({
        report_id: data.id,
        business_id: data.business_id,
        scores: {
          overall: data.overall_health_score,
          compliance: data.compliance_score,
          optimization: data.optimization_score,
          program_utilization: data.program_utilization_score,
        },
        summary: {
          total_obligations: data.total_obligations,
          critical_obligations: data.critical_obligations,
          total_leaks: data.total_leaks_found,
          total_programs: data.total_programs_eligible,
        },
        money: {
          penalty_exposure: { min: data.total_penalty_exposure_min, max: data.total_penalty_exposure_max },
          leak_impact: { min: data.total_leak_impact_min, max: data.total_leak_impact_max },
          program_funding: { available: data.total_program_funding_available },
          total_at_stake: { min: data.total_potential_savings_min, max: data.total_potential_savings_max },
        },
        ...data.report_data,
        generated_at: data.created_at,
      } as unknown as IntelligenceReport)
    : null;
}

// ─── REFRESH ALL ─────────────────────────────────────────────────────────────

export async function refreshAllIntelligence(): Promise<Array<{
  business_id: string;
  obligations_changed: boolean;
  new_programs: boolean;
  refreshed_at: string;
}>> {
  const { data, error } = await supabaseAdmin.rpc("refresh_all_intelligence");

  if (error) {
    console.error("[Intelligence] refresh error:", error);
    throw new Error(`Refresh failed: ${error.message}`);
  }

  return data || [];
}
