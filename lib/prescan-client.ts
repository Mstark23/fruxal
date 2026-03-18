// src/lib/prescan-client.ts
// Call this from your prescan chat component once AI analysis is complete

export interface PrescanLeakInput {
  leakTypeCode?: string;
  category: string;
  title: string;
  titleFr?: string;
  description?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  annualImpactMin?: number;
  annualImpactMax?: number;
  quickFix?: string;
  quickFixFr?: string;
  isFreePreview?: boolean;
}

export interface PrescanSaveInput {
  tempUserId: string;
  businessName?: string;
  industrySlug?: string;
  industryLabel?: string;
  annualRevenue?: number;
  employeeCount?: number;
  tier?: "solo" | "small" | "growth";
  language?: "en" | "fr";
  province?: string;
  rawAnswers?: Record<string, unknown>;
  extractedTags?: Record<string, unknown>;
  conversationLog?: unknown[];
  detectedLeaks?: PrescanLeakInput[];
  healthScore?: number;
  source?: string;
}

export interface PrescanSaveResult {
  success: boolean;
  prescanRunId?: string;
  totalLeaks?: number;
  estimatedLossMin?: number;
  estimatedLossMax?: number;
  freeLeaks?: Array<{
    id: string;
    title: string;
    description?: string;
    severity: string;
    annualImpactMin?: number;
    annualImpactMax?: number;
    quickFix?: string;
    category: string;
  }>;
  error?: string;
}

/**
 * Save a completed prescan run to the database.
 * Call this after the AI chat has finished collecting answers and
 * generated the leak analysis.
 */
export async function savePrescanRun(
  data: PrescanSaveInput
): Promise<PrescanSaveResult> {
  try {
    const response = await fetch("/api/prescan/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error ?? `HTTP ${response.status}`);
    }

    return result as PrescanSaveResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save prescan";
    console.error("[savePrescanRun]", message);
    return { success: false, error: message };
  }
}

/**
 * Retrieve a saved prescan run (e.g. after redirect to dashboard).
 */
export async function getPrescanRun(prescanRunId: string): Promise<PrescanSaveResult> {
  try {
    const response = await fetch(`/api/prescan/save?id=${prescanRunId}`);
    const result = await response.json();
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch prescan";
    return { success: false, error: message };
  }
}

// ============================================================================
// Tier calculation helper (matches your existing tier detection)
// ============================================================================
export function calculateTier(
  annualRevenue?: number,
  employeeCount?: number
): "solo" | "small" | "growth" {
  const rev = annualRevenue ?? 0;
  const emp = employeeCount ?? 0;

  if (rev < 150_000 || emp <= 1) return "solo";
  if (rev < 1_000_000 || emp <= 10) return "small";
  return "growth";
}

// ============================================================================
// Health score calculator based on leak severity mix
// ============================================================================
export function calculateHealthScore(
  leaks: PrescanLeakInput[],
  annualRevenue?: number
): number {
  if (leaks.length === 0) return 85;

  const weights = { LOW: 2, MEDIUM: 5, HIGH: 10, CRITICAL: 20 };
  const totalPenalty = leaks.reduce(
    (sum, l) => sum + (weights[l.severity] ?? 5),
    0
  );

  // Also factor in % of revenue at risk
  const totalLoss = leaks.reduce((sum, l) => sum + (l.annualImpactMax ?? l.annualImpactMin ?? 0), 0);
  const revPct = annualRevenue && annualRevenue > 0
    ? Math.min(30, (totalLoss / annualRevenue) * 100)
    : 0;

  const score = Math.max(10, 100 - totalPenalty - revPct);
  return Math.round(score);
}
