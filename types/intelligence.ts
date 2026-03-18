// =============================================================================
// src/types/intelligence.ts — All types for the unified intelligence system
// =============================================================================

// ─── Prescan Input ───────────────────────────────────────────────────────────

export interface PrescanInput {
  sessionId: string;
  email?: string;
  industry: string;
  monthlyRevenue: number;
  employeeCount: number;
  structure: "sole_proprietor" | "corporation" | "partnership" | "cooperative" | "npo";
  province: string;
  municipality?: string;
  businessName?: string;
  fiscalYearEndMonth?: number;
}

// ─── Intelligence Report (returned by generate_business_intelligence) ────────

export interface IntelligenceReport {
  report_id: string;
  business_id: string;

  profile: {
    province: string;
    industry: string;
    structure: string;
    tier: "SOLO" | "SMALL" | "GROWTH";
    employees: number;
    annual_revenue: number;
    language: string;
  };

  scores: {
    overall: number;
    compliance: number;
    optimization: number;
    program_utilization: number;
  };

  summary: {
    total_obligations: number;
    critical_obligations: number;
    total_leaks: number;
    total_programs: number;
    headline: string;
  };

  money: {
    penalty_exposure: MoneyBlock;
    leak_impact: MoneyBlock;
    program_funding: {
      available: number;
      label: string;
    };
    total_at_stake: MoneyBlock;
  };

  top_actions: ActionItem[];

  cta: {
    text: string;
    urgency: "critical" | "high" | "medium" | "normal";
    urgency_text: string | null;
  };

  generated_at: string;
}

export interface MoneyBlock {
  min: number;
  max: number;
  label: string;
}

export interface ActionItem {
  priority: "urgent" | "high" | "opportunity";
  type: "obligation" | "leak" | "program";
  title: string;
  category?: string;
  risk?: string;
  penalty_max?: number;
  impact_max?: number;
  max_funding?: number;
  program_type?: string;
  solution_type?: string;
  action: string;
}

// ─── Obligations ─────────────────────────────────────────────────────────────

export interface Obligation {
  obligation_id: string;
  slug: string;
  title: string;
  title_fr?: string;
  category: string;
  subcategory?: string;
  frequency: string;
  deadline_description: string;
  risk_level: "info" | "low" | "medium" | "high" | "critical";
  penalty_min: number;
  penalty_max: number;
  penalty_description: string;
  estimated_annual_waste_min: number;
  estimated_annual_waste_max: number;
  responsible_agency: string;
  solution_type?: string;
  solution_slug?: string;
  match_reason: string;
}

export interface ObligationDashboard {
  business_id: string;
  summary: {
    total_tracked: number;
    overdue: number;
    upcoming_30_days: number;
    upcoming_90_days: number;
    completed_this_year: number;
    critical_items: number;
    new_unreviewed: number;
  };
  exposure: {
    min_penalty_exposure: number;
    max_penalty_exposure: number;
    annual_waste_min: number;
    annual_waste_max: number;
  };
  by_category: Array<{
    category: string;
    total: number;
    overdue: number;
    critical: number;
  }>;
  generated_at: string;
}

// ─── Government Programs ─────────────────────────────────────────────────────

export interface GovernmentProgram {
  program_id: string;
  name: string;
  slug: string;
  description: string;
  website_url: string;
  government_level: "federal" | "provincial" | "municipal";
  program_type: "grant" | "tax_credit" | "subsidy" | "loan" | "training" | "certification";
  max_funding: number | null;
  eligibility_summary: string;
  priority_score: number;
  match_score: number;
}

// ─── Smart Partners ──────────────────────────────────────────────────────────

export interface SmartPartner {
  partner_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  sub_category: string;
  website_url: string;
  referral_url: string;
  commission_value: number;
  languages: string[];
  is_government_program: boolean;
  government_level?: string;
  program_type?: string;
  max_funding?: number;
  eligibility_summary?: string;
  match_score: number;
  match_reasons: string[];
}

// ─── Leak Detectors ──────────────────────────────────────────────────────────

export interface LeakDetector {
  detector_id: string;
  slug: string;
  title: string;
  title_fr?: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  detection_question: string;
  detection_question_fr?: string;
  annual_impact_min: number;
  annual_impact_max: number;
  solution_partner_slugs: string[];
  solution_type: string;
  priority_score: number;
}

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    took_ms?: number;
    cached?: boolean;
  };
}
