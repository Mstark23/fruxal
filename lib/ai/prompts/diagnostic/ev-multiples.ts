// =============================================================================
// lib/ai/prompts/diagnostic/ev-multiples.ts
//
// Shared EV multiple resolution — used by all 3 tier prompt builders.
// Industry-aware EV multiples based on Canadian & US M&A data.
// Source: BDC, Deloitte Canada M&A Trends, BizBuySell, PitchBook US comps.
// =============================================================================

export function resolveEVMultiple(industrySlug: string): { low: number; high: number; label: string } {
  const slug = industrySlug.toLowerCase();
  // Professional services (accounting, legal, consulting, engineering)
  if (/account|cpa|tax|audit|legal|law|consult|engineer|architect|it.service|tech.service|staffing|recruit/.test(slug))
    return { low: 5, high: 9,  label: "5\u20139\u00d7 EBITDA" };
  // SaaS / software / tech product
  if (/saas|software|app|platform|tech|digital|cloud|ai|data/.test(slug))
    return { low: 6, high: 12, label: "6\u201312\u00d7 EBITDA" };
  // Healthcare / medical / dental / pharmacy
  if (/health|medical|dental|clinic|pharmacy|optom|physio|chiro|veterinar/.test(slug))
    return { low: 5, high: 8,  label: "5\u20138\u00d7 EBITDA" };
  // Construction / trades / contracting
  if (/construct|contrac|trade|plumb|electric|hvac|roofing|landscap|excavat/.test(slug))
    return { low: 3, high: 5,  label: "3\u20135\u00d7 EBITDA" };
  // Manufacturing / industrial
  if (/manufactur|industrial|fabricat|machin|assembly|processing|packaging/.test(slug))
    return { low: 3, high: 6,  label: "3\u20136\u00d7 EBITDA" };
  // Food & beverage / hospitality / restaurant
  if (/food|beverage|restaurant|hospitality|catering|bakery|bar|cafe/.test(slug))
    return { low: 2, high: 4,  label: "2\u20134\u00d7 EBITDA" };
  // Retail / e-commerce
  if (/retail|ecommerce|e-commerce|store|shop|boutique|wholesale|distrib/.test(slug))
    return { low: 2, high: 4,  label: "2\u20134\u00d7 EBITDA" };
  // Real estate / property management
  if (/real.estate|property|realty|rental|landlord|brokerage/.test(slug))
    return { low: 4, high: 7,  label: "4\u20137\u00d7 EBITDA" };
  // Transportation / logistics / trucking
  if (/transport|logistics|trucking|freight|courier|fleet|shipping/.test(slug))
    return { low: 3, high: 5,  label: "3\u20135\u00d7 EBITDA" };
  // Financial services / insurance
  if (/financ|insurance|invest|wealth|mortgage|lending|broker/.test(slug))
    return { low: 5, high: 8,  label: "5\u20138\u00d7 EBITDA" };
  // Media / marketing / agency / creative
  if (/market|advertis|media|agency|creative|design|print|pr\b|public.relat/.test(slug))
    return { low: 4, high: 7,  label: "4\u20137\u00d7 EBITDA" };
  // Auto / dealership / repair
  if (/auto|car|dealer|vehicle|repair|mechanic|collision/.test(slug))
    return { low: 3, high: 5,  label: "3\u20135\u00d7 EBITDA" };
  // Default — general SMB
  return { low: 4, high: 6, label: "4\u20136\u00d7 EBITDA" };
}
