// =============================================================================
// Currency Utility — Region-aware money formatting
// =============================================================================
// Usage: import { formatMoney, getCurrency } from "@/lib/currency";
//        formatMoney(45000, "CA")  → "CA$45,000"
//        formatMoney(45000, "US")  → "$45,000"
// =============================================================================

export interface CurrencyInfo {
  code: string;    // USD, CAD, GBP, AUD
  symbol: string;  // $, CA$, £, A$
  prefix: string;  // Used before numbers
  locale: string;  // For Intl.NumberFormat
}

const CURRENCIES: Record<string, CurrencyInfo> = {
  US: { code: "USD", symbol: "$",   prefix: "$",   locale: "en-US" },
  CA: { code: "CAD", symbol: "CA$", prefix: "CA$", locale: "en-CA" },
  UK: { code: "GBP", symbol: "£",   prefix: "£",   locale: "en-GB" },
  AU: { code: "AUD", symbol: "A$",  prefix: "A$",  locale: "en-AU" },
};

export function getCurrency(region?: string | null): CurrencyInfo {
  return CURRENCIES[region || "US"] || CURRENCIES.US;
}

/**
 * Format money with region-appropriate currency symbol
 * formatMoney(45000, "CA") → "CA$45,000"
 * formatMoney(1234.5, "UK") → "£1,235"
 * formatMoney(500, "CA", true) → "CA$500/mo"
 */
export function formatMoney(
  amount: number,
  region?: string | null,
  perMonth: boolean = false,
  compact: boolean = false,
): string {
  const c = getCurrency(region);
  
  if (compact && Math.abs(amount) >= 1000) {
    const k = amount / 1000;
    const formatted = k >= 100 ? `${Math.round(k)}K` : k >= 10 ? `${Math.round(k)}K` : `${k.toFixed(1)}K`;
    return `${c.prefix}${formatted}${perMonth ? "/mo" : ""}`;
  }

  const formatted = new Intl.NumberFormat(c.locale, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amount));

  return `${c.prefix}${formatted}${perMonth ? "/mo" : ""}`;
}

/**
 * Format compact: $45K, CA$12K
 */
export function formatCompact(amount: number, region?: string | null): string {
  return formatMoney(amount, region, false, true);
}

/**
 * Format a range: "CA$5K – CA$12K/yr"
 */
export function formatRange(low: number, high: number, region?: string | null, suffix: string = "/yr"): string {
  const c = getCurrency(region);
  return `${formatCompact(low, region)} – ${formatCompact(high, region)}${suffix}`;
}

/**
 * Get province display info for Canadian businesses
 */
export const CA_PROVINCES: Record<string, { name: string; taxLabel: string; totalTax: number }> = {
  ON: { name: "Ontario",              taxLabel: "HST 13%",     totalTax: 13 },
  QC: { name: "Quebec",               taxLabel: "GST+QST 14.975%", totalTax: 14.975 },
  BC: { name: "British Columbia",      taxLabel: "GST+PST 12%", totalTax: 12 },
  AB: { name: "Alberta",              taxLabel: "GST 5%",      totalTax: 5 },
  SK: { name: "Saskatchewan",         taxLabel: "GST+PST 11%", totalTax: 11 },
  MB: { name: "Manitoba",             taxLabel: "GST+PST 12%", totalTax: 12 },
  NB: { name: "New Brunswick",        taxLabel: "HST 15%",     totalTax: 15 },
  NS: { name: "Nova Scotia",          taxLabel: "HST 15%",     totalTax: 15 },
  PE: { name: "Prince Edward Island", taxLabel: "HST 15%",     totalTax: 15 },
  NL: { name: "Newfoundland",         taxLabel: "HST 15%",     totalTax: 15 },
  NT: { name: "Northwest Territories", taxLabel: "GST 5%",     totalTax: 5 },
  YT: { name: "Yukon",                taxLabel: "GST 5%",      totalTax: 5 },
  NU: { name: "Nunavut",              taxLabel: "GST 5%",      totalTax: 5 },
};
