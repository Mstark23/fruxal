// =============================================================================
// ADVANCED ANALYTICS ENGINE
// =============================================================================
// Enterprise-grade revenue intelligence. This is what PureFacts charges
// $50K-$200K/year for. We're building it for every small business.
// =============================================================================

import { prisma } from "@/lib/db/client";

// =============================================================================
// 1. CLIENT PROFITABILITY SCORING
// =============================================================================
// Not just "who pays the most" but "who is actually profitable"
// Factors: revenue, payment speed, support cost (proxy: invoice count),
// growth trajectory, concentration risk, collection cost
// =============================================================================

export interface ClientProfitability {
  clientId: string;
  clientName: string;
  revenue: number;
  revenueRank: number;
  paymentScore: number;       // 0-100: how fast/reliably they pay
  growthRate: number;          // % change recent vs prior period
  concentrationRisk: number;  // % of total revenue
  profitabilityScore: number; // 0-100 composite score
  tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "AT_RISK";
  insights: string[];
}

export async function calculateClientProfitability(businessId: string): Promise<ClientProfitability[]> {
  const clients = await prisma.client.findMany({
    where: { businessId, status: "ACTIVE" },
    include: {
      invoices: { orderBy: { issuedAt: "desc" } },
    },
  });

  if (clients.length === 0) return [];

  const totalRevenue = clients.reduce(
    (sum, c) => sum + c.invoices.reduce((s, inv) => s + inv.amount, 0), 0
  );

  const results: ClientProfitability[] = clients.map((client) => {
    const invoices = client.invoices;
    const revenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Payment score: based on % paid on time, % overdue, avg days to pay
    const paidInvoices = invoices.filter((inv) => inv.status === "PAID" && inv.paidAt && inv.dueAt);
    const onTimeCount = paidInvoices.filter((inv) => new Date(inv.paidAt!) <= new Date(inv.dueAt!)).length;
    const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;
    const totalWithDue = paidInvoices.length + overdueCount;
    const paymentScore = totalWithDue > 0
      ? Math.round(((onTimeCount / totalWithDue) * 70) + ((1 - overdueCount / Math.max(invoices.length, 1)) * 30))
      : 50;

    // Growth rate: compare last 3 months vs prior 3 months
    const recent = invoices.slice(0, 3);
    const prior = invoices.slice(3, 6);
    const recentAvg = recent.length > 0 ? recent.reduce((s, inv) => s + inv.amount, 0) / recent.length : 0;
    const priorAvg = prior.length > 0 ? prior.reduce((s, inv) => s + inv.amount, 0) / prior.length : 0;
    const growthRate = priorAvg > 0 ? Math.round(((recentAvg - priorAvg) / priorAvg) * 100) : 0;

    // Concentration risk
    const concentrationRisk = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;

    // Composite profitability score
    const revenueScore = Math.min(100, (revenue / (totalRevenue / Math.max(clients.length, 1))) * 50);
    const growthScore = Math.min(100, Math.max(0, 50 + growthRate));
    const concentrationPenalty = concentrationRisk > 30 ? (concentrationRisk - 30) * 0.5 : 0;

    const profitabilityScore = Math.round(
      Math.min(100, Math.max(0,
        (revenueScore * 0.35) +
        (paymentScore * 0.30) +
        (growthScore * 0.25) +
        (10) - // Base points
        concentrationPenalty
      ))
    );

    // Determine tier
    let tier: ClientProfitability["tier"] = "BRONZE";
    if (profitabilityScore >= 80) tier = "PLATINUM";
    else if (profitabilityScore >= 65) tier = "GOLD";
    else if (profitabilityScore >= 50) tier = "SILVER";
    else if (profitabilityScore >= 35) tier = "BRONZE";
    else tier = "AT_RISK";

    // Generate insights
    const insights: string[] = [];
    if (growthRate < -20) insights.push(`Spending declining ${Math.abs(growthRate)}% — churn risk`);
    if (growthRate > 20) insights.push(`Spending growing ${growthRate}% — expansion opportunity`);
    if (overdueCount > 2) insights.push(`${overdueCount} overdue invoices — collection attention needed`);
    if (paymentScore >= 90) insights.push("Excellent payment history — reliable revenue");
    if (concentrationRisk > 25) insights.push(`${concentrationRisk}% of revenue — diversification needed`);
    if (revenue > 0 && invoices.length > 6 && paymentScore < 40) insights.push("Low payment reliability — consider prepayment terms");
    if (client.aum && client.aum > 50000 && recentAvg < (client.aum * 0.005)) insights.push("Billing far below account size — rate review needed");

    return {
      clientId: client.id,
      clientName: client.name,
      revenue: Math.round(revenue),
      revenueRank: 0, // Set below
      paymentScore,
      growthRate,
      concentrationRisk,
      profitabilityScore,
      tier,
      insights,
    };
  });

  // Set revenue ranks
  results.sort((a, b) => b.revenue - a.revenue);
  results.forEach((r, i) => { r.revenueRank = i + 1; });

  // Re-sort by profitability
  results.sort((a, b) => b.profitabilityScore - a.profitabilityScore);

  return results;
}

// =============================================================================
// 2. INDUSTRY BENCHMARKS
// =============================================================================
// Compare the business against industry averages.
// In production, this comes from our data flywheel (anonymized aggregate data).
// For now, we use researched industry benchmarks.
// =============================================================================

export interface BenchmarkComparison {
  metric: string;
  yourValue: number;
  industryAvg: number;
  industryTop: number;
  unit: string;
  status: "ABOVE" | "AT" | "BELOW";
  gap: number;
  recommendation: string;
}

const INDUSTRY_BENCHMARKS: Record<string, Record<string, { avg: number; top: number; unit: string }>> = {
  ECOMMERCE: {
    collectionRate: { avg: 92, top: 98, unit: "%" },
    avgDaysToCollect: { avg: 34, top: 22, unit: "days" },
    clientRetentionRate: { avg: 75, top: 92, unit: "%" },
    revenuePerClient: { avg: 42000, top: 85000, unit: "CAD/yr" },
    overdueRate: { avg: 8, top: 3, unit: "%" },
    topClientConcentration: { avg: 18, top: 12, unit: "%" },
  },
  FINANCIAL_ADVISORY: {
    collectionRate: { avg: 95, top: 99, unit: "%" },
    avgDaysToCollect: { avg: 28, top: 15, unit: "days" },
    clientRetentionRate: { avg: 92, top: 97, unit: "%" },
    revenuePerClient: { avg: 8500, top: 25000, unit: "CAD/yr" },
    overdueRate: { avg: 5, top: 1, unit: "%" },
    topClientConcentration: { avg: 12, top: 6, unit: "%" },
  },
  LAW_FIRM: {
    collectionRate: { avg: 88, top: 96, unit: "%" },
    avgDaysToCollect: { avg: 45, top: 28, unit: "days" },
    clientRetentionRate: { avg: 80, top: 95, unit: "%" },
    revenuePerClient: { avg: 15000, top: 45000, unit: "CAD/yr" },
    overdueRate: { avg: 12, top: 4, unit: "%" },
    topClientConcentration: { avg: 15, top: 8, unit: "%" },
  },
  HEALTHCARE: {
    collectionRate: { avg: 90, top: 97, unit: "%" },
    avgDaysToCollect: { avg: 42, top: 25, unit: "days" },
    clientRetentionRate: { avg: 85, top: 96, unit: "%" },
    revenuePerClient: { avg: 52000, top: 120000, unit: "CAD/yr" },
    overdueRate: { avg: 10, top: 3, unit: "%" },
    topClientConcentration: { avg: 20, top: 10, unit: "%" },
  },
};

// Default benchmarks for industries without specific data
const DEFAULT_BENCHMARKS = {
  collectionRate: { avg: 91, top: 97, unit: "%" },
  avgDaysToCollect: { avg: 38, top: 24, unit: "days" },
  clientRetentionRate: { avg: 80, top: 93, unit: "%" },
  revenuePerClient: { avg: 35000, top: 75000, unit: "CAD/yr" },
  overdueRate: { avg: 9, top: 3, unit: "%" },
  topClientConcentration: { avg: 18, top: 10, unit: "%" },
};

export async function calculateBenchmarks(businessId: string): Promise<BenchmarkComparison[]> {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return [];

  const [clients, invoices] = await Promise.all([
    prisma.client.findMany({ where: { businessId, status: "ACTIVE" } }),
    prisma.invoice.findMany({ where: { businessId } }),
  ]);

  if (invoices.length === 0) return [];

  const benchmarks = INDUSTRY_BENCHMARKS[business.industry] || DEFAULT_BENCHMARKS;

  // Calculate actual metrics
  const totalBilled = invoices.reduce((s, inv) => s + inv.amount, 0);
  const totalCollected = invoices.reduce((s, inv) => s + inv.amountPaid, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const paidInvoices = invoices.filter((inv) => inv.paidAt && inv.issuedAt);
  const avgDaysToCollect = paidInvoices.length > 0
    ? Math.round(paidInvoices.reduce((sum, inv) => {
        return sum + Math.max(0, (new Date(inv.paidAt!).getTime() - new Date(inv.issuedAt!).getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / paidInvoices.length)
    : 0;

  const overdueInvoices = invoices.filter((inv) => inv.status === "OVERDUE");
  const overdueRate = invoices.length > 0 ? Math.round((overdueInvoices.length / invoices.length) * 100) : 0;

  const revenuePerClient = clients.length > 0 ? Math.round(totalBilled / clients.length) : 0;

  // Top client concentration
  const clientRevenues = clients.map((c) => {
    return invoices.filter((inv) => inv.clientId === c.id).reduce((s, inv) => s + inv.amount, 0);
  });
  const topClientRevenue = Math.max(...clientRevenues, 0);
  const topClientConcentration = totalBilled > 0 ? Math.round((topClientRevenue / totalBilled) * 100) : 0;

  // Active clients with recent invoices (last 6 months) vs total
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const activeRecently = new Set(
    invoices.filter((inv) => inv.issuedAt && new Date(inv.issuedAt) > sixMonthsAgo).map((inv) => inv.clientId)
  ).size;
  const clientRetentionRate = clients.length > 0 ? Math.round((activeRecently / clients.length) * 100) : 0;

  // Build comparisons
  const metrics: { key: string; label: string; value: number; lowerIsBetter?: boolean }[] = [
    { key: "collectionRate", label: "Collection Rate", value: collectionRate },
    { key: "avgDaysToCollect", label: "Avg Days to Collect", value: avgDaysToCollect, lowerIsBetter: true },
    { key: "clientRetentionRate", label: "Client Retention Rate", value: clientRetentionRate },
    { key: "revenuePerClient", label: "Revenue per Client", value: revenuePerClient },
    { key: "overdueRate", label: "Overdue Invoice Rate", value: overdueRate, lowerIsBetter: true },
    { key: "topClientConcentration", label: "Top Client Concentration", value: topClientConcentration, lowerIsBetter: true },
  ];

  return metrics.map((m) => {
    const bench = (benchmarks as any)[m.key] || (DEFAULT_BENCHMARKS as any)[m.key];
    const diff = m.value - bench.avg;
    const isGood = m.lowerIsBetter ? diff < 0 : diff > 0;
    const isBad = m.lowerIsBetter ? diff > 0 : diff < 0;

    let status: BenchmarkComparison["status"] = "AT";
    if (isGood) status = "ABOVE";
    if (isBad) status = "BELOW";

    const gap = m.lowerIsBetter
      ? Math.max(0, m.value - bench.top)
      : Math.max(0, bench.top - m.value);

    let recommendation = "";
    if (m.key === "collectionRate" && status === "BELOW") {
      recommendation = `Your collection rate is ${Math.abs(diff)}% below industry average. Implement automated payment reminders and enforce late fees.`;
    } else if (m.key === "avgDaysToCollect" && status === "BELOW") {
      recommendation = `You collect ${diff} days slower than average. Offer early payment discounts and send reminders at day 15, 25, and 30.`;
    } else if (m.key === "clientRetentionRate" && status === "BELOW") {
      recommendation = `${Math.abs(diff)}% lower retention than peers. Schedule quarterly business reviews and implement a client health monitoring system.`;
    } else if (m.key === "revenuePerClient" && status === "BELOW") {
      recommendation = `$${Math.abs(diff).toLocaleString()} below average per client. Focus on cross-selling and rate optimization during renewals.`;
    } else if (m.key === "overdueRate" && status === "BELOW") {
      recommendation = `${diff}% more overdue invoices than industry average. Tighten credit terms and automate collections.`;
    } else if (m.key === "topClientConcentration" && status === "BELOW") {
      recommendation = `Top client represents ${m.value}% vs ${bench.avg}% industry norm. Actively acquire new clients to reduce dependency.`;
    } else if (status === "ABOVE") {
      recommendation = `Outperforming industry average. Continue current practices.`;
    } else {
      recommendation = `In line with industry standards.`;
    }

    return {
      metric: m.label,
      yourValue: m.value,
      industryAvg: bench.avg,
      industryTop: bench.top,
      unit: bench.unit,
      status,
      gap,
      recommendation,
    };
  });
}

// =============================================================================
// 3. REVENUE FORECASTING
// =============================================================================
// Project revenue 3-6 months ahead using historical patterns.
// Identifies at-risk revenue and growth opportunities.
// =============================================================================

export interface ForecastMonth {
  month: string;
  projected: number;
  optimistic: number;
  pessimistic: number;
  atRisk: number;
}

export interface RevenueForecast {
  months: ForecastMonth[];
  totalProjected: number;
  totalAtRisk: number;
  growthTrend: number;   // % monthly growth rate
  churnRisk: number;     // $ at risk from declining clients
  expansionOpportunity: number; // $ from growing clients
}

export async function forecastRevenue(businessId: string): Promise<RevenueForecast> {
  const clients = await prisma.client.findMany({
    where: { businessId, status: "ACTIVE" },
    include: {
      invoices: { orderBy: { issuedAt: "asc" } },
    },
  });

  // Calculate monthly revenue for last 6 months
  const now = new Date();
  const monthlyRevenue: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthTotal = clients.reduce((sum, c) => {
      return sum + c.invoices
        .filter((inv) => inv.issuedAt && new Date(inv.issuedAt) >= monthStart && new Date(inv.issuedAt) <= monthEnd)
        .reduce((s, inv) => s + inv.amount, 0);
    }, 0);
    monthlyRevenue.push(monthTotal);
  }

  // Calculate growth trend (weighted recent months more)
  const recentAvg = (monthlyRevenue[4] + monthlyRevenue[5]) / 2;
  const priorAvg = (monthlyRevenue[0] + monthlyRevenue[1] + monthlyRevenue[2]) / 3;
  const growthTrend = priorAvg > 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : 0;
  const monthlyGrowthRate = growthTrend / 6; // Rough monthly rate

  // Identify at-risk and growing clients
  let churnRisk = 0;
  let expansionOpportunity = 0;

  for (const client of clients) {
    const invoices = client.invoices;
    if (invoices.length < 4) continue;

    const recent = invoices.slice(-3);
    const prior = invoices.slice(-6, -3);
    if (prior.length === 0) continue;

    const recentClientAvg = recent.reduce((s, inv) => s + inv.amount, 0) / recent.length;
    const priorClientAvg = prior.reduce((s, inv) => s + inv.amount, 0) / prior.length;

    if (priorClientAvg > 0) {
      const clientTrend = (recentClientAvg - priorClientAvg) / priorClientAvg;
      if (clientTrend < -0.15) {
        churnRisk += Math.round((priorClientAvg - recentClientAvg) * 12);
      } else if (clientTrend > 0.15) {
        expansionOpportunity += Math.round((recentClientAvg - priorClientAvg) * 12);
      }
    }
  }

  // Generate 6-month forecast
  const baseMonthly = recentAvg || monthlyRevenue[monthlyRevenue.length - 1] || 0;
  const months: ForecastMonth[] = [];
  let totalProjected = 0;
  let totalAtRisk = 0;

  for (let i = 1; i <= 6; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthName = futureDate.toLocaleString("default", { month: "short", year: "numeric" });

    const growthFactor = 1 + (monthlyGrowthRate / 100) * i;
    const projected = Math.round(baseMonthly * growthFactor);
    const optimistic = Math.round(projected * 1.15);
    const pessimistic = Math.round(projected * 0.75);
    const atRisk = Math.round(churnRisk / 12);

    months.push({ month: monthName, projected, optimistic, pessimistic, atRisk });
    totalProjected += projected;
    totalAtRisk += atRisk;
  }

  return {
    months,
    totalProjected,
    totalAtRisk,
    growthTrend: Math.round(growthTrend * 10) / 10,
    churnRisk,
    expansionOpportunity,
  };
}

// =============================================================================
// 4. COMPREHENSIVE HEALTH SCORE
// =============================================================================
// Single number that tells you how healthy your revenue is.
// Weighs: collection efficiency, client diversity, growth trend,
// leak severity, payment reliability, and client retention.
// =============================================================================

export interface HealthScoreBreakdown {
  overall: number;
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  components: {
    name: string;
    score: number;
    weight: number;
    status: "GOOD" | "OK" | "WARNING" | "CRITICAL";
    detail: string;
  }[];
  topActions: string[];
}

export async function calculateHealthScore(businessId: string): Promise<HealthScoreBreakdown> {
  const [clients, invoices, leaks] = await Promise.all([
    prisma.client.findMany({ where: { businessId, status: "ACTIVE" } }),
    prisma.invoice.findMany({ where: { businessId } }),
    prisma.leak.findMany({ where: { businessId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);

  const totalBilled = invoices.reduce((s, inv) => s + inv.amount, 0);
  const totalCollected = invoices.reduce((s, inv) => s + inv.amountPaid, 0);
  const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;
  const totalLeakImpact = leaks.reduce((s, l) => s + l.annualImpact, 0);

  // 1. Collection Efficiency (25%)
  const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 100;
  const collectionScore = Math.min(100, collectionRate * 1.05); // Slight boost

  // 2. Client Diversity (20%)
  const clientRevenues = clients.map((c) =>
    invoices.filter((inv) => inv.clientId === c.id).reduce((s, inv) => s + inv.amount, 0)
  );
  const maxClientPct = totalBilled > 0 ? (Math.max(...clientRevenues, 0) / totalBilled) * 100 : 0;
  const diversityScore = Math.max(0, 100 - (maxClientPct * 2));

  // 3. Growth Trend (20%)
  const now = new Date();
  const recentInv = invoices.filter((inv) => inv.issuedAt && new Date(inv.issuedAt) > new Date(now.getFullYear(), now.getMonth() - 3, 1));
  const priorInv = invoices.filter((inv) => inv.issuedAt && new Date(inv.issuedAt) > new Date(now.getFullYear(), now.getMonth() - 6, 1) && new Date(inv.issuedAt!) <= new Date(now.getFullYear(), now.getMonth() - 3, 1));
  const recentRev = recentInv.reduce((s, inv) => s + inv.amount, 0);
  const priorRev = priorInv.reduce((s, inv) => s + inv.amount, 0);
  const growthRate = priorRev > 0 ? ((recentRev - priorRev) / priorRev) * 100 : 0;
  const growthScore = Math.min(100, Math.max(0, 50 + growthRate * 2));

  // 4. Leak Severity (20%)
  const leakRatio = totalBilled > 0 ? (totalLeakImpact / totalBilled) * 100 : 0;
  const leakScore = Math.max(0, 100 - (leakRatio * 5));

  // 5. Payment Reliability (15%)
  const overdueRate = invoices.length > 0 ? (overdueCount / invoices.length) * 100 : 0;
  const paymentScore = Math.max(0, 100 - (overdueRate * 5));

  // Weighted composite
  const overall = Math.round(
    (collectionScore * 0.25) +
    (diversityScore * 0.20) +
    (growthScore * 0.20) +
    (leakScore * 0.20) +
    (paymentScore * 0.15)
  );

  // Grade
  let grade: HealthScoreBreakdown["grade"] = "F";
  if (overall >= 95) grade = "A+";
  else if (overall >= 85) grade = "A";
  else if (overall >= 78) grade = "B+";
  else if (overall >= 70) grade = "B";
  else if (overall >= 62) grade = "C+";
  else if (overall >= 55) grade = "C";
  else if (overall >= 40) grade = "D";

  const getStatus = (score: number): "GOOD" | "OK" | "WARNING" | "CRITICAL" => {
    if (score >= 80) return "GOOD";
    if (score >= 60) return "OK";
    if (score >= 40) return "WARNING";
    return "CRITICAL";
  };

  const components = [
    { name: "Collection Efficiency", score: Math.round(collectionScore), weight: 25, status: getStatus(collectionScore), detail: `${Math.round(collectionRate)}% collected of ${totalBilled > 0 ? "$" + Math.round(totalBilled).toLocaleString() : "$0"} billed` },
    { name: "Client Diversity", score: Math.round(diversityScore), weight: 20, status: getStatus(diversityScore), detail: `Top client is ${Math.round(maxClientPct)}% of revenue` },
    { name: "Growth Trend", score: Math.round(growthScore), weight: 20, status: getStatus(growthScore), detail: `${growthRate >= 0 ? "+" : ""}${Math.round(growthRate)}% vs prior quarter` },
    { name: "Leak Exposure", score: Math.round(leakScore), weight: 20, status: getStatus(leakScore), detail: `$${Math.round(totalLeakImpact).toLocaleString()} annual impact from ${leaks.length} leaks` },
    { name: "Payment Reliability", score: Math.round(paymentScore), weight: 15, status: getStatus(paymentScore), detail: `${overdueCount} of ${invoices.length} invoices overdue (${Math.round(overdueRate)}%)` },
  ];

  // Generate top actions
  const topActions: string[] = [];
  const sorted = [...components].sort((a, b) => a.score - b.score);
  for (const comp of sorted.slice(0, 3)) {
    if (comp.score < 80) {
      if (comp.name === "Collection Efficiency") topActions.push("Automate payment reminders and enforce late fees to improve collection rate");
      if (comp.name === "Client Diversity") topActions.push("Acquire 3-5 new clients to reduce concentration risk on top accounts");
      if (comp.name === "Growth Trend") topActions.push("Schedule rate reviews with existing clients and launch cross-sell campaigns");
      if (comp.name === "Leak Exposure") topActions.push("Resolve the top 3 highest-impact leaks to recover immediate revenue");
      if (comp.name === "Payment Reliability") topActions.push("Contact all overdue accounts this week and implement stricter payment terms");
    }
  }

  return { overall, grade, components, topActions };
}
