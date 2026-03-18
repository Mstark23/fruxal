// =============================================================================
// src/services/diagnostic/qb-aggregator.ts
// =============================================================================
// Placeholder for QuickBooks OAuth integration (Phase 2).
// Exports the QBIntelligence type and aggregateQBData function.
// Currently always returns null — diagnostic runs in profile-only mode.
// =============================================================================

export interface QBIntelligence {
  coverage_months: number;
  monthly_revenue_avg: number;
  monthly_expenses_avg: number;
  gross_margin: number;
  cogs_ratio: number;
  payroll_ratio: number;
  ar_days_outstanding: number;
  ap_days_outstanding: number;
  duplicate_payments: number;
  dormant_subscriptions: DormantSubscription[];
  top_expense_categories: ExpenseCategory[];
  revenue_trend: "growing" | "flat" | "declining";
  revenue_trend_pct: number;
  cash_balance_avg: number;
  cash_runway_months: number;
  tax_installments_missed: boolean;
  hst_filing_frequency: "monthly" | "quarterly" | "annual" | null;
  last_hst_filing_date: string | null;
  data_source: "quickbooks" | "xero" | "wave";
}

interface DormantSubscription {
  vendor: string;
  monthly_amount: number;
  last_active_date: string;
}

interface ExpenseCategory {
  category: string;
  monthly_avg: number;
  pct_of_revenue: number;
}

/**
 * Aggregates QuickBooks data for a given business.
 * Returns null until QB OAuth is integrated (Phase 2).
 */
export async function aggregateQBData(
  businessId: string
): Promise<QBIntelligence | null> {
  // Phase 2: connect to QB OAuth tokens stored in DB,
  // pull transactions, compute ratios, return QBIntelligence.
  // For now, always returns null → diagnostic uses profile-only mode.
  return null;
}
