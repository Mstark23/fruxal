/**
 * LAW FIRM INDUSTRY ENGINE - Leak Detection
 * 20 cross-reference leak detectors with industry benchmarks
 *
 * Sources:
 * - Clio Legal Trends Report 2024/2025
 * - ABA Standing Committee on Lawyers' Professional Liability
 * - Thomson Reuters State of the Legal Market 2024
 * - BigHand Market Data 2025
 * - NALP Foundation Associate Attrition Reports
 * - Hennessey Digital Lead Response Study 2024
 * - Accounting Atelier Law Firm Financial Benchmarks
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── TYPES ───────────────────────────────────────────────────
export interface LeakResult {
  id: string;
  category: string;
  title: string;
  severity: "critical" | "warning" | "info" | "ok";
  currentValue: string;
  benchmark: string;
  annualImpact: number;
  description: string;
  recommendation: string;
  source: string;
}

// ─── BENCHMARKS ──────────────────────────────────────────────
const BENCHMARKS = {
  // Clio 2025 KPI Benchmarks
  utilizationRate: 0.38,           // 38% avg, 3.0 hrs / 8-hr day
  utilizationTarget: 0.45,         // top-performing firms
  realizationRate: 0.88,           // 88% avg (2025 Clio)
  realizationTarget: 0.93,         // top quartile
  collectionRate: 0.91,            // 91% avg (Clio 2024)
  collectionTarget: 0.95,          // target

  // Lockup (Clio 2024 medians)
  realizationLockupDays: 43,       // median work → invoice
  collectionLockupDays: 32,        // median invoice → payment
  totalLockupDays: 93,             // median total
  topQuartileLockup: 49,           // top 25%

  // Profitability (Accounting Atelier / LawBillity)
  profitMarginTarget: 0.35,        // 35-45% target for small firms
  profitMarginMedian: 0.30,        // industry median 1-10 attorneys
  overheadRatioTarget: 0.45,       // 40-45% target
  overheadRatioAvg: 0.48,          // 45-50% industry average
  ruleOfThirds: 0.33,              // 1/3 comp, 1/3 overhead, 1/3 profit

  // Write-offs
  writeOffTarget: 0.10,            // <10% healthy
  writeOffWarning: 0.12,           // 12%+ is a red flag
  writeOffAvg: 0.12,               // 8-15% typical range

  // Revenue per lawyer
  revenuePerLawyer: 500000,        // $400K-$600K healthy range
  revenuePerLawyerMin: 400000,

  // Client intake (Clio 2024, Hennessey 2024)
  callAnswerRate: 0.40,            // only 40% of firms answer calls (Clio 2024)
  callAnswerTarget: 0.80,          // should be 80%+
  leadResponseMinutes: 13,         // median 13 min (Hennessey 2024)
  leadResponseTarget: 5,           // 5 min = 400% higher conversion
  intakeConversionAvg: 0.14,       // 14% avg inquiry → client
  intakeConversionTarget: 0.25,    // 25-40% target

  // Marketing (Clio, ABA)
  marketingSpendMin: 0.02,         // 2% minimum
  marketingSpendMax: 0.10,         // up to 10%
  marketingSpendTarget: 0.05,      // 5% sweet spot for established firms
  clientAcquisitionCost: 1000,     // $500-$1500 avg

  // Attorney turnover (NALP, BigHand 2025, Embroker)
  associateTurnoverRate: 0.25,     // ~25% associate turnover
  firmWideTurnoverRate: 0.27,      // 27% firm-wide (BigHand 2025)
  turnoverCostPerAttorney: 350000, // $200K-$500K per lost attorney (ABA)
  targetTurnoverRate: 0.10,        // <10% = best-in-class

  // Trust / IOLTA
  trustReconciliationRequired: true,
  maxStaleBalance90Days: 0,        // should be $0 ideally
  maxNegativeBalances: 0,

  // AR aging
  arOver90Threshold: 0.15,         // >15% of AR over 90 days = problem
  arOver120Threshold: 0.10,        // >10% over 120 = critical
} as const;

// ─── MAIN ANALYSIS ───────────────────────────────────────────
export async function analyzeLawFirmLeaks(businessId: string): Promise<LeakResult[]> {
  const leaks: LeakResult[] = [];

  // Fetch all data in parallel
  const [
    { data: billing },
    { data: matters },
    { data: clients },
    { data: intake },
    { data: overhead },
    { data: trust },
    { data: staffing },
    { data: arAging },
  ] = await Promise.all([
    supabase.from("lawfirm_billing").select("*").eq("business_id", businessId).order("period", { ascending: false }).limit(12),
    supabase.from("lawfirm_matters").select("*").eq("business_id", businessId),
    supabase.from("lawfirm_clients").select("*").eq("business_id", businessId),
    supabase.from("lawfirm_intake").select("*").eq("business_id", businessId).order("period", { ascending: false }).limit(6),
    supabase.from("lawfirm_overhead").select("*").eq("business_id", businessId).order("period", { ascending: false }).limit(6),
    supabase.from("lawfirm_trust").select("*").eq("business_id", businessId).order("period", { ascending: false }).limit(6),
    supabase.from("lawfirm_staffing").select("*").eq("business_id", businessId).order("period", { ascending: false }).limit(6),
    supabase.from("lawfirm_ar_aging").select("*").eq("business_id", businessId).order("snapshot_date", { ascending: false }).limit(3),
  ]);

  // ─── 1. UTILIZATION RATE ─────────────────────────────────
  if (billing?.length) {
    const totalAvailable = billing.reduce((s, b) => s + Number(b.available_hours ?? 0), 0);
    const totalBillable = billing.reduce((s, b) => s + Number(b.billable_hours ?? 0), 0);
    if (totalAvailable > 0) {
      const utilRate = totalBillable / totalAvailable;
      const gap = BENCHMARKS.utilizationTarget - utilRate;
      const avgRate = billing[0]?.standard_rate ? Number(billing[0].standard_rate) : 300;
      // Each 1% utilization improvement = ~$50K+ per attorney annually
      const annualHoursGap = gap * 2080; // annual hours per attorney
      const annualImpact = Math.max(0, annualHoursGap * avgRate);
      const staffCount = staffing?.[0]?.total_attorneys || 1;

      leaks.push({
        id: "lf-utilization",
        category: "Productivity",
        title: "Attorney Utilization Rate",
        severity: utilRate < 0.30 ? "critical" : utilRate < BENCHMARKS.utilizationRate ? "warning" : utilRate < BENCHMARKS.utilizationTarget ? "info" : "ok",
        currentValue: `${(utilRate * 100).toFixed(1)}%`,
        benchmark: `${(BENCHMARKS.utilizationTarget * 100)}% target (avg: ${(BENCHMARKS.utilizationRate * 100)}%)`,
        annualImpact: Math.round(annualImpact * Number(staffCount)),
        description: `Attorneys are billing ${(utilRate * 100).toFixed(1)}% of available hours. Industry average is 38% (3.0 hrs/day). Each additional hour billed per day at $${avgRate}/hr = ~$${Math.round(avgRate * 250 / 1000)}K/year per attorney.`,
        recommendation: "Delegate admin tasks to support staff, implement time-capture technology, audit non-billable time categories, set utilization targets by role (65-75% associates, 55-65% partners).",
        source: "Clio Legal Trends Report 2025",
      });
    }
  }

  // ─── 2. REALIZATION RATE ─────────────────────────────────
  if (billing?.length) {
    const totalBillableValue = billing.reduce((s, b) => s + Number(b.billable_hours ?? 0) * Number(b.standard_rate ?? 0), 0);
    const totalBilled = billing.reduce((s, b) => s + Number(b.total_billed ?? 0), 0);
    if (totalBillableValue > 0) {
      const realRate = totalBilled / totalBillableValue;
      const leakage = totalBillableValue - totalBilled;
      const annualizedLeak = (leakage / billing.length) * 12;

      leaks.push({
        id: "lf-realization",
        category: "Billing",
        title: "Billing Realization Rate",
        severity: realRate < 0.80 ? "critical" : realRate < BENCHMARKS.realizationRate ? "warning" : realRate < BENCHMARKS.realizationTarget ? "info" : "ok",
        currentValue: `${(realRate * 100).toFixed(1)}%`,
        benchmark: `${(BENCHMARKS.realizationTarget * 100)}% target (avg: ${(BENCHMARKS.realizationRate * 100)}%)`,
        annualImpact: Math.round(Math.max(0, annualizedLeak)),
        description: `${((1 - realRate) * 100).toFixed(1)}% of worked time never makes it to an invoice. This includes pre-bill write-downs, discounts, and unbilled hours. Am Law 100 average dropped to 80.9% in 2023.`,
        recommendation: "Implement contemporaneous time entry (capture within 24hrs), review pre-bill write-downs by partner, set realization floors by practice area, investigate anything below 85%.",
        source: "Clio 2025 Benchmarks / Am Law 2024",
      });
    }
  }

  // ─── 3. COLLECTION RATE ──────────────────────────────────
  if (billing?.length) {
    const totalBilled = billing.reduce((s, b) => s + Number(b.total_billed ?? 0), 0);
    const totalCollected = billing.reduce((s, b) => s + Number(b.total_collected ?? 0), 0);
    if (totalBilled > 0) {
      const collRate = totalCollected / totalBilled;
      const uncollected = totalBilled - totalCollected;
      const annualizedLoss = (uncollected / billing.length) * 12;

      leaks.push({
        id: "lf-collection",
        category: "Collections",
        title: "Collection Rate",
        severity: collRate < 0.85 ? "critical" : collRate < BENCHMARKS.collectionRate ? "warning" : collRate < BENCHMARKS.collectionTarget ? "info" : "ok",
        currentValue: `${(collRate * 100).toFixed(1)}%`,
        benchmark: `${(BENCHMARKS.collectionTarget * 100)}% target (avg: ${(BENCHMARKS.collectionRate * 100)}%)`,
        annualImpact: Math.round(Math.max(0, annualizedLoss)),
        description: `${((1 - collRate) * 100).toFixed(1)}% of billed work goes uncollected — ~$${Math.round(annualizedLoss / 1000)}K/year leaking. The 9% industry gap represents invoices never paid: disputed, written off, or stuck in aging.`,
        recommendation: "Send invoices within 48hrs of work, offer online payment options (firms get paid 2x faster), implement 30/60/90-day collection escalation, require retainers or evergreen trust deposits.",
        source: "Clio 2024 / Accounting Atelier",
      });
    }
  }

  // ─── 4. EFFECTIVE BILLING RATE (Compound Leak) ───────────
  if (billing?.length) {
    const totalAvailable = billing.reduce((s, b) => s + Number(b.available_hours ?? 0), 0);
    const totalBillable = billing.reduce((s, b) => s + Number(b.billable_hours ?? 0), 0);
    const totalBillableValue = billing.reduce((s, b) => s + Number(b.billable_hours ?? 0) * Number(b.standard_rate ?? 0), 0);
    const totalBilled = billing.reduce((s, b) => s + Number(b.total_billed ?? 0), 0);
    const totalCollected = billing.reduce((s, b) => s + Number(b.total_collected ?? 0), 0);
    if (totalAvailable > 0 && totalBillable > 0 && totalBilled > 0) {
      const utilRate = totalBillable / totalAvailable;
      const realRate = totalBilled / totalBillableValue;
      const collRate = totalCollected / totalBilled;
      const effectiveRate = utilRate * realRate * collRate;
      // Industry: 37% × 88% × 91% = 29.6% → only 29.6% of time converts to cash
      const industryEffective = 0.37 * 0.88 * 0.91;

      leaks.push({
        id: "lf-effective-rate",
        category: "Productivity",
        title: "Effective Billing Rate (Compound)",
        severity: effectiveRate < 0.25 ? "critical" : effectiveRate < industryEffective ? "warning" : effectiveRate < 0.35 ? "info" : "ok",
        currentValue: `${(effectiveRate * 100).toFixed(1)}% of time → cash`,
        benchmark: `Industry: ${(industryEffective * 100).toFixed(1)}% | Target: 35%+`,
        annualImpact: 0, // captured in individual metrics
        description: `Utilization (${(utilRate * 100).toFixed(0)}%) × Realization (${(realRate * 100).toFixed(0)}%) × Collection (${(collRate * 100).toFixed(0)}%) = ${(effectiveRate * 100).toFixed(1)}%. Only ${(effectiveRate * 100).toFixed(1)}% of working time converts to collected revenue.`,
        recommendation: "This compound metric shows the multiplication of leaks. Improving utilization from 37% to 45% alone increases effective rate by 22%, adding ~$70K+ per attorney annually.",
        source: "Clio Legal Trends / LeanLaw",
      });
    }
  }

  // ─── 5. WRITE-OFFS ──────────────────────────────────────
  if (billing?.length) {
    const totalBilled = billing.reduce((s, b) => s + Number(b.total_billed ?? 0), 0);
    const totalWriteOffs = billing.reduce((s, b) => s + Number(b.write_offs ?? 0), 0);
    if (totalBilled > 0) {
      const woRate = totalWriteOffs / (totalBilled + totalWriteOffs);
      const annualized = (totalWriteOffs / billing.length) * 12;

      leaks.push({
        id: "lf-writeoffs",
        category: "Billing",
        title: "Write-Off Rate",
        severity: woRate > BENCHMARKS.writeOffWarning ? "critical" : woRate > BENCHMARKS.writeOffTarget ? "warning" : woRate > 0.05 ? "info" : "ok",
        currentValue: `${(woRate * 100).toFixed(1)}%`,
        benchmark: `<${(BENCHMARKS.writeOffTarget * 100)}% healthy (avg: 8-15%)`,
        annualImpact: Math.round(annualized),
        description: `$${Math.round(annualized / 1000)}K/year in write-offs. 72% of firms reported rising write-offs in 2024, with 75% expecting more in 2025. Every percentage point is a direct profit leak.`,
        recommendation: "Log and categorize every write-off (discount, dispute, or error). Set scope expectations upfront with engagement letters. Use matter budgets. Review write-off patterns by attorney and practice area monthly.",
        source: "BigHand Market Data 2025 / LawBillity",
      });
    }
  }

  // ─── 6. LOCKUP (Cash Flow Pipeline) ─────────────────────
  if (arAging?.length) {
    const latest = arAging[0];
    const totalLockup = Number(latest.total_lockup_days ?? 0);
    const realLockup = Number(latest.realization_lockup_days ?? 0);
    const collLockup = Number(latest.collection_lockup_days ?? 0);
    const monthlyRevenue = overhead?.[0]?.total_revenue ? Number(overhead[0].total_revenue) : 0;
    const cashTrapped = monthlyRevenue > 0 ? (totalLockup / 30) * monthlyRevenue : 0;

    leaks.push({
      id: "lf-lockup",
      category: "Cash Flow",
      title: "Revenue Lockup (Days to Cash)",
      severity: totalLockup > 120 ? "critical" : totalLockup > BENCHMARKS.totalLockupDays ? "warning" : totalLockup > BENCHMARKS.topQuartileLockup ? "info" : "ok",
      currentValue: `${totalLockup} days total (${realLockup} billing + ${collLockup} collection)`,
      benchmark: `Median: ${BENCHMARKS.totalLockupDays} days | Top 25%: ${BENCHMARKS.topQuartileLockup} days`,
      annualImpact: Math.round(cashTrapped), // cash trapped, not lost
      description: `$${Math.round(cashTrapped / 1000)}K in revenue is trapped in the pipeline at any time. Bottom-quartile firms have 189+ days lockup. Each day reduced frees working capital.`,
      recommendation: "Bill within 48hrs of work completion. Implement automated invoice reminders. Offer ACH/credit card payments (firms using online payments get paid 2x faster). Target <45 days total lockup.",
      source: "Clio 2024 Median Benchmarks",
    });
  }

  // ─── 7. ACCOUNTS RECEIVABLE AGING ───────────────────────
  if (arAging?.length) {
    const latest = arAging[0];
    const totalAR = Number(latest.total_ar ?? 0);
    const over90 = Number(latest.ar_91_120 ?? 0) + Number(latest.ar_over_120 ?? 0);
    const over120 = Number(latest.ar_over_120 ?? 0);
    if (totalAR > 0) {
      const over90Pct = over90 / totalAR;
      const over120Pct = over120 / totalAR;

      leaks.push({
        id: "lf-ar-aging",
        category: "Collections",
        title: "Aged Accounts Receivable",
        severity: over120Pct > BENCHMARKS.arOver120Threshold ? "critical" : over90Pct > BENCHMARKS.arOver90Threshold ? "warning" : over90Pct > 0.08 ? "info" : "ok",
        currentValue: `$${Math.round(over90 / 1000)}K past 90 days (${(over90Pct * 100).toFixed(1)}% of A/R)`,
        benchmark: `<15% over 90 days | <10% over 120 days`,
        annualImpact: Math.round(over90 * 0.5), // ~50% of 90+ day AR typically uncollectable
        description: `$${Math.round(over120 / 1000)}K is over 120 days — historically, 50%+ of aged receivables this old are never collected. The longer invoices sit, the less likely they are to be paid.`,
        recommendation: "Implement 30/60/90 day collection escalation. Call clients at 45 days (not just emails). Consider third-party collection for 120+ days. Require retainers to prevent future aging.",
        source: "CPN Legal / RunSensible",
      });
    }
  }

  // ─── 8. UNBILLED WORK-IN-PROGRESS ──────────────────────
  if (arAging?.length) {
    const latest = arAging[0];
    const totalWIP = Number(latest.total_wip ?? 0);
    const wipOver60 = Number(latest.wip_over_60_days ?? 0);
    if (totalWIP > 0) {
      leaks.push({
        id: "lf-wip",
        category: "Billing",
        title: "Unbilled Work-in-Progress (WIP)",
        severity: wipOver60 > totalWIP * 0.3 ? "critical" : wipOver60 > totalWIP * 0.15 ? "warning" : totalWIP > 0 ? "info" : "ok",
        currentValue: `$${Math.round(totalWIP / 1000)}K unbilled ($${Math.round(wipOver60 / 1000)}K over 60 days)`,
        benchmark: "Bill all WIP within 30 days of work",
        annualImpact: Math.round(wipOver60 * 0.3), // ~30% of stale WIP never billed
        description: `Late billing is like offering 0% financing. WIP over 60 days is at high risk of never being invoiced — clients challenge old bills, and memories fade.`,
        recommendation: "Set firm-wide billing deadlines (e.g., bill by 5th of following month). Use automated WIP aging reports. Flag any matter with >30 days unbilled time for partner review.",
        source: "BigHand / Clio",
      });
    }
  }

  // ─── 9. OVERHEAD RATIO ─────────────────────────────────
  if (overhead?.length) {
    const avgOverheadRatio = overhead.reduce((s, o) => s + Number(o.overhead_ratio ?? 0), 0) / overhead.length / 100;
    const avgRevenue = overhead.reduce((s, o) => s + Number(o.total_revenue ?? 0), 0) / overhead.length;
    const excessOverhead = Math.max(0, avgOverheadRatio - BENCHMARKS.overheadRatioTarget) * avgRevenue * 12;

    leaks.push({
      id: "lf-overhead",
      category: "Profitability",
      title: "Overhead Ratio",
      severity: avgOverheadRatio > 0.55 ? "critical" : avgOverheadRatio > BENCHMARKS.overheadRatioAvg ? "warning" : avgOverheadRatio > BENCHMARKS.overheadRatioTarget ? "info" : "ok",
      currentValue: `${(avgOverheadRatio * 100).toFixed(1)}% of revenue`,
      benchmark: `Target: <${(BENCHMARKS.overheadRatioTarget * 100)}% | Avg: ${(BENCHMARKS.overheadRatioAvg * 100)}%`,
      annualImpact: Math.round(excessOverhead),
      description: `Overhead exceeding 50% of revenue is a red flag. The Rule of Thirds targets 1/3 each to compensation, overhead, and profit. Every dollar saved in overhead becomes profit.`,
      recommendation: "Audit top 4 overhead categories. Consider cloud-based tools to reduce IT costs. Renegotiate rent (hybrid work reduced space needs). Outsource bookkeeping and IT support.",
      source: "LeanLaw Rule of Thirds / Accounting Atelier",
    });
  }

  // ─── 10. PROFIT MARGIN ─────────────────────────────────
  if (overhead?.length) {
    const avgMargin = overhead.reduce((s, o) => s + Number(o.profit_margin ?? 0), 0) / overhead.length / 100;
    const avgRevenue = overhead.reduce((s, o) => s + Number(o.total_revenue ?? 0), 0) / overhead.length;
    const marginGap = Math.max(0, BENCHMARKS.profitMarginTarget - avgMargin);
    const annualImpact = marginGap * avgRevenue * 12;

    leaks.push({
      id: "lf-profit-margin",
      category: "Profitability",
      title: "Net Profit Margin",
      severity: avgMargin < 0.20 ? "critical" : avgMargin < BENCHMARKS.profitMarginMedian ? "warning" : avgMargin < BENCHMARKS.profitMarginTarget ? "info" : "ok",
      currentValue: `${(avgMargin * 100).toFixed(1)}%`,
      benchmark: `Target: ${(BENCHMARKS.profitMarginTarget * 100)}%+ | Median: ${(BENCHMARKS.profitMarginMedian * 100)}%`,
      annualImpact: Math.round(annualImpact),
      description: `Below 25% typically indicates overhead problems or pricing issues. Well-managed firms achieve 40%, exceptional performers 50%. Margin below 20% needs immediate investigation.`,
      recommendation: "Review pricing across practice areas. Increase rates 5-10% for high-demand specialties. Cut overhead to <45%. Improve utilization and collection to compound gains.",
      source: "LawBillity / Accounting Atelier",
    });
  }

  // ─── 11. MISSED CALLS / INTAKE RESPONSIVENESS ──────────
  if (intake?.length) {
    const avgMissed = intake.reduce((s, i) => s + Number(i.calls_missed ?? 0), 0) / intake.length;
    const avgTotal = intake.reduce((s, i) => s + Number(i.calls_received ?? 0), 0) / intake.length;
    const avgResponseTime = intake.reduce((s, i) => s + Number(i.avg_response_time_minutes ?? 0), 0) / intake.length;
    if (avgTotal > 0) {
      const missRate = avgMissed / avgTotal;
      // Conservative: missed call × avg case value × conversion rate
      const avgCaseValue = clients?.length ? (clients.reduce((s, c) => s + Number(c.lifetime_value ?? 0), 0) / clients.length) : 5000;
      const missedRevenue = avgMissed * 12 * avgCaseValue * 0.10; // 10% would have converted

      leaks.push({
        id: "lf-missed-calls",
        category: "Client Intake",
        title: "Missed Calls & Response Time",
        severity: missRate > 0.40 ? "critical" : missRate > 0.25 ? "warning" : avgResponseTime > BENCHMARKS.leadResponseMinutes ? "info" : "ok",
        currentValue: `${(missRate * 100).toFixed(0)}% calls missed | ${Math.round(avgResponseTime)} min avg response`,
        benchmark: `<20% missed | <${BENCHMARKS.leadResponseTarget} min response (400% higher conversion)`,
        annualImpact: Math.round(missedRevenue),
        description: `35% of law firm calls go unanswered nationally. 60% of firms fail to answer. Responding within 5 minutes yields 400% higher conversion. 74% of callers won't leave a voicemail.`,
        recommendation: "Implement answering service or AI intake for after-hours. Set 5-minute response SLA. Track every missed call. 42% of leads come outside business hours.",
        source: "Clio 2024 Secret Shopper / Hennessey Digital 2024",
      });
    }
  }

  // ─── 12. INTAKE CONVERSION RATE ────────────────────────
  if (intake?.length) {
    const avgConversion = intake.reduce((s, i) => s + Number(i.overall_conversion_rate ?? 0), 0) / intake.length / 100;
    const avgInquiries = intake.reduce((s, i) => s + Number(i.total_inquiries ?? 0), 0) / intake.length;
    if (avgConversion > 0 && avgInquiries > 0) {
      const avgCaseValue = clients?.length ? (clients.reduce((s, c) => s + Number(c.lifetime_value ?? 0), 0) / clients.length) : 5000;
      const additionalClients = avgInquiries * 12 * (BENCHMARKS.intakeConversionTarget - avgConversion);
      const revenue = Math.max(0, additionalClients * avgCaseValue);

      leaks.push({
        id: "lf-conversion",
        category: "Client Intake",
        title: "Lead-to-Client Conversion Rate",
        severity: avgConversion < 0.10 ? "critical" : avgConversion < BENCHMARKS.intakeConversionAvg ? "warning" : avgConversion < BENCHMARKS.intakeConversionTarget ? "info" : "ok",
        currentValue: `${(avgConversion * 100).toFixed(1)}%`,
        benchmark: `Target: 25-40% | Avg: ${(BENCHMARKS.intakeConversionAvg * 100)}%`,
        annualImpact: Math.round(revenue),
        description: `Average firm converts only 14% of inquiries to clients. Top performers hit 40-50%. Firms need ~13.4 leads per new client on average. CRM-using firms convert 47% more leads.`,
        recommendation: "Implement intake CRM (Clio Grow, Lawmatics). Train staff on phone intake best practices. Use structured follow-up sequences. Respond to all leads within 5 minutes.",
        source: "Clio 2025 / AgentZap / Martindale-Nolo 2024",
      });
    }
  }

  // ─── 13. MARKETING SPEND & ROI ─────────────────────────
  if (overhead?.length) {
    const avgRevenue = overhead.reduce((s, o) => s + Number(o.total_revenue ?? 0), 0) / overhead.length;
    const avgMarketing = overhead.reduce((s, o) => s + Number(o.marketing_spend ?? 0), 0) / overhead.length;
    if (avgRevenue > 0) {
      const marketPct = avgMarketing / avgRevenue;
      const signedClients = intake?.length ? intake.reduce((s, i) => s + Number(i.clients_signed ?? 0), 0) / intake.length : 0;
      const cac = signedClients > 0 ? avgMarketing / signedClients : 0;

      leaks.push({
        id: "lf-marketing",
        category: "Marketing",
        title: "Marketing Investment & ROI",
        severity: marketPct < BENCHMARKS.marketingSpendMin ? "warning" : marketPct > 0.15 ? "warning" : cac > 2000 ? "warning" : "info",
        currentValue: `${(marketPct * 100).toFixed(1)}% of revenue ($${Math.round(avgMarketing)}/mo)${cac > 0 ? ` | $${Math.round(cac)} CAC` : ""}`,
        benchmark: `2-10% of revenue | $500-$1,500 CAC`,
        annualImpact: marketPct < BENCHMARKS.marketingSpendMin ? Math.round(avgRevenue * 0.03 * 12) : 0,
        description: `Firms allocating 2-10% to marketing with strategic spend see 526% 3-year SEO ROI. 65% of firms say their website brings highest ROI. 78% use paid search but 82% question its ROI.`,
        recommendation: "Allocate 45% to SEO, 30% PPC, 10% social, 15% traditional. Track ROI by channel. Average law firm invests $150K/year in SEO. Prioritize website and Google Business Profile.",
        source: "Clio 2025 / FirstPageSage / ABA",
      });
    }
  }

  // ─── 14. ATTORNEY TURNOVER ─────────────────────────────
  if (staffing?.length) {
    const latest = staffing[0];
    const turnoverRate = Number(latest.annualized_turnover_rate ?? 0) / 100;
    const totalAttorneys = Number(latest.total_attorneys || 1);
    const departures = turnoverRate * totalAttorneys;
    const turnoverCost = departures * BENCHMARKS.turnoverCostPerAttorney;

    leaks.push({
      id: "lf-turnover",
      category: "Staffing",
      title: "Attorney Turnover Rate",
      severity: turnoverRate > 0.30 ? "critical" : turnoverRate > BENCHMARKS.associateTurnoverRate ? "warning" : turnoverRate > BENCHMARKS.targetTurnoverRate ? "info" : "ok",
      currentValue: `${(turnoverRate * 100).toFixed(0)}% annualized`,
      benchmark: `<${(BENCHMARKS.targetTurnoverRate * 100)}% best-in-class | Avg: ${(BENCHMARKS.firmWideTurnoverRate * 100)}%`,
      annualImpact: Math.round(turnoverCost),
      description: `Turnover costs $200K-$500K per attorney (ABA). Associates leaving within 4 years vs. prior 5-year norm. 50% of firms struggled with retention in 2023. Firm-wide attrition reached 27% in 2025.`,
      recommendation: "Invest in professional development. Monitor workloads (watch for 12+ hour days). Implement data-driven work allocation. Offer flexible/hybrid work. Map clear career progression paths.",
      source: "ABA / Embroker 2024 / BigHand 2025 / NALP Foundation",
    });
  }

  // ─── 15. REVENUE PER LAWYER ────────────────────────────
  if (staffing?.length && overhead?.length) {
    const rpl = Number(staffing[0].revenue_per_lawyer ?? 0);
    if (rpl > 0) {
      const gap = Math.max(0, BENCHMARKS.revenuePerLawyerMin - rpl);
      const attorneys = Number(staffing[0].total_attorneys || 1);

      leaks.push({
        id: "lf-rpl",
        category: "Profitability",
        title: "Revenue Per Lawyer",
        severity: rpl < 300000 ? "critical" : rpl < BENCHMARKS.revenuePerLawyerMin ? "warning" : rpl < BENCHMARKS.revenuePerLawyer ? "info" : "ok",
        currentValue: `$${Math.round(rpl / 1000)}K/year`,
        benchmark: `$400K-$600K healthy range | Target: $500K+`,
        annualImpact: Math.round(gap * attorneys),
        description: `Revenue per lawyer is the baseline productivity metric. At $${Math.round(rpl / 1000)}K, ${rpl < BENCHMARKS.revenuePerLawyerMin ? "the firm may be overstaffed or underpricing work" : "performance is within healthy range"}.`,
        recommendation: "Target 2-3× average attorney salary in RPL. Improve utilization and billing rates. Ensure leveraging associates on partner-originated work. Consider practice area profitability.",
        source: "Accounting Atelier / RunSensible",
      });
    }
  }

  // ─── 16. MATTER PROFITABILITY ──────────────────────────
  if (matters?.length) {
    const closedMatters = matters.filter((m: any) => m.status === "closed" && m.profit_margin != null);
    if (closedMatters.length > 0) {
      const unprofitable = closedMatters.filter((m: any) => Number(m.profit_margin) < 20);
      const avgMargin = closedMatters.reduce((s: number, m: any) => s + Number(m.profit_margin ?? 0), 0) / closedMatters.length;
      const lossMatters = closedMatters.filter((m: any) => Number(m.profit_margin) < 0);
      const totalLoss = lossMatters.reduce((s: number, m: any) => s + Math.abs(Number(m.total_collected ?? 0) - Number(m.total_costs ?? 0)), 0);

      leaks.push({
        id: "lf-matter-profit",
        category: "Profitability",
        title: "Matter-Level Profitability",
        severity: unprofitable.length > closedMatters.length * 0.3 ? "critical" : unprofitable.length > closedMatters.length * 0.15 ? "warning" : lossMatters.length > 0 ? "info" : "ok",
        currentValue: `${unprofitable.length}/${closedMatters.length} matters below 20% margin (avg: ${avgMargin.toFixed(1)}%)`,
        benchmark: "All matters should target 30%+ margin",
        annualImpact: Math.round(totalLoss),
        description: `${lossMatters.length} matter(s) were outright unprofitable. Identifying which practice areas and matter types generate the strongest margins allows strategic focus.`,
        recommendation: "Track profitability per matter, practice area, and attorney. Use matter budgets. Review scope creep patterns. Consider dropping or repricing consistently unprofitable work types.",
        source: "CARET Legal / RunSensible",
      });
    }
  }

  // ─── 17. TRUST ACCOUNT COMPLIANCE ──────────────────────
  if (trust?.length) {
    const latest = trust[0];
    const negBalances = Number(latest.negative_balance_incidents ?? 0);
    const commingling = Number(latest.commingling_flags ?? 0);
    const notReconciled = !latest.three_way_reconciled;
    const stale = Number(latest.stale_balances_over_90_days ?? 0);
    const earnedNotTransferred = Number(latest.earned_fees_not_transferred ?? 0);
    const issues = negBalances + commingling + (notReconciled ? 1 : 0);

    leaks.push({
      id: "lf-trust",
      category: "Compliance",
      title: "Trust Account / IOLTA Compliance",
      severity: negBalances > 0 || commingling > 0 ? "critical" : notReconciled ? "warning" : stale > 0 || earnedNotTransferred > 0 ? "info" : "ok",
      currentValue: `${negBalances} negative balances | ${commingling} commingling flags | ${notReconciled ? "NOT reconciled" : "Reconciled"}`,
      benchmark: "Zero violations | Monthly 3-way reconciliation required",
      annualImpact: issues > 0 ? 50000 : 0, // risk of discipline, not direct $
      description: `Trust account mishandling is the #1 cause of attorney discipline. Negative balances are treated as misappropriation even if unintentional. ${earnedNotTransferred > 0 ? `$${Math.round(earnedNotTransferred / 1000)}K in earned fees still sitting in trust.` : ""}`,
      recommendation: "Perform monthly 3-way reconciliation (bank ↔ master ledger ↔ client ledgers). Transfer earned fees promptly. Use trust accounting software. Maintain segregation of duties. Never have negative client balances.",
      source: "ABA / State Bar Discipline Reports",
    });
  }

  // ─── 18. EARNED FEES LEFT IN TRUST ─────────────────────
  if (trust?.length) {
    const totalEarned = trust.reduce((s, t) => s + Number(t.earned_fees_not_transferred ?? 0), 0) / trust.length;
    if (totalEarned > 0) {
      leaks.push({
        id: "lf-earned-in-trust",
        category: "Cash Flow",
        title: "Earned Fees Not Transferred from Trust",
        severity: totalEarned > 10000 ? "critical" : totalEarned > 5000 ? "warning" : "info",
        currentValue: `$${Math.round(totalEarned).toLocaleString()} avg/month`,
        benchmark: "Transfer earned fees within 48hrs",
        annualImpact: Math.round(totalEarned * 12), // cash flow impact
        description: `Earned fees left in trust are your money sitting idle — they should be transferred to your operating account as soon as earned. This impacts cash flow and can cause trust accounting confusion.`,
        recommendation: "Review trust accounts weekly for earned-but-untransferred fees. Implement automated alerts when invoices are paid from trust. Transfer to operating within 48 hours of earning.",
        source: "ABA Rule 1.15 / IOLTA Best Practices",
      });
    }
  }

  // ─── 19. LEVERAGE RATIO ────────────────────────────────
  if (staffing?.length) {
    const latest = staffing[0];
    const partners = Number(latest.partners ?? 0);
    const associates = Number(latest.associates ?? 0);
    const leverage = partners > 0 ? associates / partners : 0;
    const staffRatio = Number(latest.staff_to_attorney_ratio ?? 0);
    const totalAttorneys = Number(latest.total_attorneys || 1);

    if (partners > 0) {
      leaks.push({
        id: "lf-leverage",
        category: "Staffing",
        title: "Leverage & Staffing Ratios",
        severity: leverage < 1 && totalAttorneys > 2 ? "warning" : staffRatio < 0.5 ? "warning" : "info",
        currentValue: `${leverage.toFixed(1)} associates/partner | ${staffRatio.toFixed(1)} staff/attorney`,
        benchmark: "2-3 associates per partner typical | 1+ staff per attorney",
        annualImpact: 0,
        description: `Leverage drives profitability — partner time is most expensive; delegating to associates multiplies revenue. Low staff ratio means attorneys do more admin, reducing billable time.`,
        recommendation: "Target 2-3 associates per partner for optimal leverage. Ensure adequate support staff (1:1 ratio). Consider paralegals for routine legal work. Use virtual assistants for admin tasks.",
        source: "Thomson Reuters State of Legal Market",
      });
    }
  }

  // ─── 20. CLIENT CONCENTRATION RISK ─────────────────────
  if (clients?.length) {
    const activeClients = clients.filter((c: any) => c.is_active);
    const totalRevenue = activeClients.reduce((s: number, c: any) => s + Number(c.total_revenue ?? 0), 0);
    if (totalRevenue > 0 && activeClients.length > 0) {
      const sorted = [...activeClients].sort((a: any, b: any) => Number(b.total_revenue ?? 0) - Number(a.total_revenue ?? 0));
      const topClient = sorted[0];
      const topClientPct = Number(topClient.total_revenue ?? 0) / totalRevenue;
      const top3 = sorted.slice(0, 3);
      const top3Pct = top3.reduce((s: number, c: any) => s + Number(c.total_revenue ?? 0), 0) / totalRevenue;

      leaks.push({
        id: "lf-concentration",
        category: "Risk",
        title: "Client Concentration Risk",
        severity: topClientPct > 0.30 ? "critical" : topClientPct > 0.20 ? "warning" : top3Pct > 0.50 ? "info" : "ok",
        currentValue: `Top client: ${(topClientPct * 100).toFixed(0)}% of revenue | Top 3: ${(top3Pct * 100).toFixed(0)}%`,
        benchmark: "No single client >15% | Top 3 <40%",
        annualImpact: topClientPct > 0.20 ? Math.round(Number(topClient.total_revenue ?? 0) * 0.5) : 0,
        description: `If your largest client leaves, ${(topClientPct * 100).toFixed(0)}% of revenue disappears. Client concentration above 20% creates dangerous dependency. Diversification is key to resilience.`,
        recommendation: "Actively develop new client channels. Strengthen relationships with mid-tier clients. Track client acquisition diversification. Set ceiling alerts at 15% per client.",
        source: "Thomson Reuters / CARET Legal",
      });
    }
  }

  return leaks.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2, ok: 3 };
    return order[a.severity] - order[b.severity] || b.annualImpact - a.annualImpact;
  });
}
