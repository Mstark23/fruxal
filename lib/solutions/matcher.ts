// =============================================================================
// lib/solutions/matcher.ts
// Solutions matching engine — wraps the existing get_smart_partners RPC
// which queries the 33,000+ entry solutions database.
// Returns client-safe results (commission data stripped).
// =============================================================================

import { getSmartPartners } from "@/services/intelligence";
import { LEAK_TO_SOLUTION } from "@/lib/solutions/leak-map";

export interface SolutionMatch {
  id:                   string;
  name:                 string;
  description:          string;
  category:             string;
  url:                  string;        // affiliate_url if exists, else website_url
  savings_estimate:     string | null;
  is_free:              boolean;
  monthly_cost:         number | null;
  effort_to_implement:  string | null;
  canadian_specific:    boolean;
  province_specific:    string | null;
  relevance_score:      number;        // 0-100
  match_reasons:        string[];
}

export interface MatcherInput {
  industrySlug:    string;
  province:        string;
  tier:            "solo" | "business" | "enterprise";
  leakCategory:    string;
  leakTitle?:      string;
  monthlyRevenue?: number;
  maxResults?:     number;
}

// ── Normalize RPC SmartPartner → SolutionMatch ────────────────────────────────
function normalize(p: any, province: string): SolutionMatch {
  const url = p.referral_url || p.website_url || "";
  const isCA = (p.languages ?? []).includes("fr") ||
               url.includes(".ca") ||
               (p.match_reasons ?? []).some((r: string) => /canada|canadian|qc|ontario/i.test(r));
  const isProvinceSpecific = (p.match_reasons ?? []).some(
    (r: string) => r.toLowerCase().includes(province.toLowerCase())
  );

  // Build savings_estimate from description or match_reasons
  const savingsHint = (p.match_reasons ?? []).find((r: string) => /save|saving|\$|%|reduc/i.test(r));
  const savingsEstimate = savingsHint ?? null;

  return {
    id:                  p.partner_id ?? p.id ?? String(Math.random()),
    name:                p.name ?? "",
    description:         p.description ?? "",
    category:            p.category ?? "",
    url,
    savings_estimate:    savingsEstimate,
    is_free:             !!(p.commission_value === 0 || url.includes("free") || (p.description ?? "").toLowerCase().includes("free")),
    monthly_cost:        null,   // not exposed by RPC
    effort_to_implement: "medium",
    canadian_specific:   isCA,
    province_specific:   isProvinceSpecific ? province : null,
    relevance_score:     Math.round((p.match_score ?? 50) * 100),
    match_reasons:       p.match_reasons ?? [],
  };
}

// ── Main matcher ──────────────────────────────────────────────────────────────
export async function findSolutions(input: MatcherInput): Promise<SolutionMatch[]> {
  try {
    const maxResults = input.maxResults ?? 3;
    const isQC = input.province === "QC";

    const partners = await getSmartPartners({
      leakCategory:    input.leakCategory,
      province:        input.province,
      industry:        input.industrySlug,
      annualRevenue:   (input.monthlyRevenue ?? 0) * 12,
      language:        isQC ? "fr" : "en",
      includeGovernment: false,
      limit:           maxResults * 3,   // fetch more, filter below
    });

    const results = partners
      .map(p => normalize(p, input.province))
      .filter(s => s.relevance_score >= 40)   // per spec: below 40 = return nothing
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, maxResults);

    return results;
  } catch (err: any) {
    console.error("[findSolutions] Error:", err?.message);
    return [];
  }
}

// ── Task convenience wrapper ──────────────────────────────────────────────────
export async function findSolutionsForTask(
  task: { category: string; title: string; savings_monthly: number },
  business: { industrySlug: string; province: string; tier: string; monthlyRevenue?: number }
): Promise<SolutionMatch[]> {
  return findSolutions({
    industrySlug:  business.industrySlug,
    province:      business.province,
    tier:          business.tier as MatcherInput["tier"],
    leakCategory:  task.category,
    leakTitle:     task.title,
    monthlyRevenue: business.monthlyRevenue,
    maxResults:    3,
  });
}

// ── Category convenience wrapper ─────────────────────────────────────────────
export async function findSolutionsForCategory(
  category: string,
  business: { industrySlug: string; province: string; tier: string }
): Promise<SolutionMatch[]> {
  return findSolutions({
    industrySlug: business.industrySlug,
    province:     business.province,
    tier:         business.tier as MatcherInput["tier"],
    leakCategory: category,
    maxResults:   2,
  });
}
