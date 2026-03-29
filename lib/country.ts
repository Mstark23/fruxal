// =============================================================================
// lib/country.ts
// Country detection utilities — reads from cookie set by middleware.
// fruxal.com → "US" | fruxal.ca → "CA"
// =============================================================================

export type Country = "CA" | "US";

/** Read country from cookie (client-side) */
export function getCountryFromCookie(): Country {
  if (typeof document === "undefined") return "CA";
  const match = document.cookie.match(/fruxal_country=([^;]+)/);
  return (match?.[1] as Country) || "CA";
}

/** Read country from request headers (server-side API routes) */
export function getCountryFromHost(host: string): Country {
  if (host.includes("fruxal.com") && !host.includes("localhost")) return "US";
  return "CA";
}

// ── US States ──────────────────────────────────────────────────────────────
export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

// ── CA Provinces ───────────────────────────────────────────────────────────
export const CA_PROVINCES = [
  { value: "QC", label: "Quebec", fr: "Québec" },
  { value: "ON", label: "Ontario" },
  { value: "BC", label: "British Columbia", fr: "Colombie-Britannique" },
  { value: "AB", label: "Alberta" },
  { value: "MB", label: "Manitoba" },
  { value: "SK", label: "Saskatchewan" },
  { value: "NS", label: "Nova Scotia", fr: "Nouvelle-Écosse" },
  { value: "NB", label: "New Brunswick", fr: "Nouveau-Brunswick" },
  { value: "NL", label: "Newfoundland & Labrador", fr: "Terre-Neuve-et-Labrador" },
  { value: "PE", label: "Prince Edward Island", fr: "Île-du-Prince-Édouard" },
];

/** US state tax insight shown after selection (mirrors CA province insight) */
export function getUSStateInsight(state: string): string {
  const insights: Record<string, string> = {
      FL: "Florida has no state income tax and a competitive 5.5% corporate tax rate, making it one of the most business-friendly states.",
    NY: "New York's combined state + NYC tax burden is among the highest in the US. Careful entity structuring is especially valuable here.",
    CA: "California's top marginal rate (13.3%) is the highest in the US. S-corp election and retirement plan maximization are critical.",
    WA: "Washington has no income tax but imposes B&O gross receipts tax (0.471%–1.5%). Good for high-margin businesses.",
    TX: "Texas has no state income tax and a business-friendly environment. Franchise tax applies on revenue above $2.47M.",
    NV: "Nevada has no state income tax and no corporate income tax — one of the most favorable states for business.",
    WY: "Wyoming has no state income tax and no corporate income tax. Popular for holding company structures.",
    SD: "South Dakota has no state income tax. Often used for trust and holding company structures.",
    TN: "Tennessee eliminated its income tax on wages in 2021. Hall Tax on investment income also eliminated.",
    IL: "Illinois has a flat 4.95% income tax and a 9.5% combined corporate rate — one of the higher rates in the Midwest.",
    OH: "Ohio imposes a Commercial Activity Tax (0.26%) on gross receipts above $1M instead of traditional corporate income tax.",
    PA: "Pennsylvania's 8.99% corporate net income tax is one of the highest in the US — but phasing down to 4.99% by 2031.",
  };
  return insights[state] || `${state} — we'll apply your state's specific tax rates, workers comp requirements, and available programs to your diagnostic.`;
}
