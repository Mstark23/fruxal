
// src/services/financial-health.ts

export type RevenueBand = "<100k" | "100-500k" | "500k-1m" | "1-5m" | "5m+";

export interface PrescanEngineInput {
  revenueBand: RevenueBand;
  archetype: string;
  cardUsageRatio: number;
  baselineRate: number;
  estimatedToolSpendMonth: number;
  hasEmployees: boolean;
}

export interface LeakEstimate {
  processingLeak: number;
  saasLeak: number;
  insuranceLeak: number;
  totalLeak: number;
}

export interface HealthScoreResult {
  score: number;
  tier: "elite" | "strong" | "stable" | "watch" | "at_risk";
  leak: LeakEstimate;
  drivers: string[];
}

function estimateRevenueMidpoint(band: RevenueBand): number {
  switch (band) {
    case "<100k": return 75000;
    case "100-500k": return 300000;
    case "500k-1m": return 750000;
    case "1-5m": return 2000000;
    case "5m+": return 6000000;
    default: return 150000;
  }
}

function getBenchmarkRate(band: RevenueBand): number {
  switch (band) {
    case "<100k":
    case "100-500k":
      return 0.025;
    default:
      return 0.023;
  }
}

export function estimateLeaks(input: PrescanEngineInput): LeakEstimate {
  const revenueGuess = estimateRevenueMidpoint(input.revenueBand);
  const cardVolume = revenueGuess * input.cardUsageRatio;

  const benchmarkRate = getBenchmarkRate(input.revenueBand);
  const rateDiff = Math.max(input.baselineRate - benchmarkRate, 0);

  const processingLeak = cardVolume * rateDiff;
  const saasLeak = input.estimatedToolSpendMonth * 12 * 0.1;
  const insuranceLeak = revenueGuess * 0.01 * (input.hasEmployees ? 0.08 : 0.05);

  const totalLeak = processingLeak + saasLeak + insuranceLeak;

  return { processingLeak, saasLeak, insuranceLeak, totalLeak };
}

function determineTier(score: number): HealthScoreResult["tier"] {
  if (score >= 90) return "elite";
  if (score >= 75) return "strong";
  if (score >= 60) return "stable";
  if (score >= 40) return "watch";
  return "at_risk";
}

export function computeHealthScore(input: PrescanEngineInput): HealthScoreResult {
  const leak = estimateLeaks(input);
  const revenueGuess = estimateRevenueMidpoint(input.revenueBand);
  const leakRatio = Math.min(leak.totalLeak / Math.max(revenueGuess, 1), 1);

  let score = 85 - leakRatio * 40;
  score = Math.max(10, Math.min(99, score));

  const tier = determineTier(score);

  const drivers: string[] = [];
  if (leak.processingLeak > 0) drivers.push("Payment processing costs above benchmark.");
  if (leak.saasLeak > 0) drivers.push("Potential unnecessary SaaS or service expenses.");
  if (leak.insuranceLeak > 0) drivers.push("Insurance costs may be above optimal level.");

  return { score, tier, leak, drivers };
}
