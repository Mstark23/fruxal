import { buildDiagnosticPrompts } from "./lib/ai/prompts/diagnostic/index";

const ctx: any = {
  profile: { industry: "ecommerce", industry_label: "E-Commerce", business_name: "Test Biz", structure: "llc", has_payroll: false, does_rd: false, fiscal_year_end_month: 12, handles_data: false, exit_horizon: "none" },
  country: "US" as const, province: "OR", annualRevenue: 20000000, revenueSource: "intake",
  employees: 0, isFr: false, estimatedPayroll: 0, estimatedEBITDA: 1000000,
  ebitdaSource: "estimated", grossMarginPct: 19.5, ownerSalary: 0, exactNetIncome: 0,
  estimatedTaxDrag: 0, taxCtx: "", leakList: "", programList: "", benchmarkList: "",
  overdue: 0, penaltyExposure: 0, obligationsCount: 0, exitHorizon: "unknown",
  hasHoldco: false, passiveOver50k: false, lcgeEligible: false, rdtohBalance: 0,
  hasCDA: false, sredLastYear: 0, docData: { t2: null, financials: null, gst: null, t4: null, bank: null },
};

try {
  const r = buildDiagnosticPrompts("enterprise", ctx);
  console.log("SUCCESS - system prompt length:", r.systemPrompt.length);
  console.log("First 200 chars:", r.systemPrompt.slice(0, 200));
} catch (e: any) {
  console.error("ERROR:", e.message);
  console.error("STACK:", e.stack);
}
