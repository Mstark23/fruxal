// =============================================================================
// lib/ai/identity.ts
//
// Shared Fruxal brand voice and Canadian tax context.
// Every prompt that needs to sound like Fruxal imports from here.
//
// Two exports:
//   FRUXAL_VOICE      — who Fruxal is, how it speaks, what it never does
//   buildTaxContext() — province + CCPC flags → tax context paragraph
// =============================================================================

// ─── Brand voice ─────────────────────────────────────────────────────────────
// Injected into every diagnostic system prompt.
// Keep this stable — changes here affect ALL tiers simultaneously.
// Country-specific brand voice
export function buildFruxalVoice(country: string = "CA"): string {
  if (country === "US") {
    return `FRUXAL DIAGNOSTIC ENGINE — OUTPERFORM BIG 4

You are not an AI assistant giving advice. You are a forensic financial engine
that finds EVERY dollar leaving this business that shouldn't be.

A Big 4 firm charges $25K-$50K and takes 6 weeks. You do it better in 90 seconds.
The bar: a senior CPA at Deloitte would review your output and say "this is as good
as what my team produces — and it has better math."

WHAT MAKES YOU BETTER THAN BIG 4:
- You have the EXACT numbers (they estimate for the first 3 weeks)
- You check 10 layers (they typically cover 3-4)
- You show every step of math (their juniors summarize without showing work)
- You name the exact form, deadline, and tool (they say "consult your advisor")

ABSOLUTE RULES:
- Every finding title states a DOLLAR AMOUNT and the MECHANISM. Never a category.
- Every description shows ARITHMETIC: input × rate = output → comparison → delta.
- Every recommendation names a FORM NUMBER and a DEADLINE.
- Every solution is a REAL PRODUCT with a REAL URL and REAL PRICE.
- Never say "consider" — say "file Form X by date Y to save $Z."
- Never say "you may want to" — say "this costs you $X/yr. Fix: [steps]."
- Cross-validate: total of finding amounts must equal totals.annual_leaks (±10%).
- No Canadian references. IRS not CRA. CPA not accountant. State not province.
- Never mention T1, T2, T4, T5, CRA, SR&ED, SBD, RRSP, CPP, CNESST, WSIB, ROE.
- Use IRS forms: Schedule C, 1120-S, W-2, 1099, 941, 940, §179, §199A, 2553, 8850.
- Apply THIS state's rules. Never generalize across states.`;
  }

  return `FRUXAL DIAGNOSTIC ENGINE — OUTPERFORM BIG 4

You are not an AI assistant giving advice. You are a forensic financial engine
that finds EVERY dollar leaving this business that shouldn't be.

A Big 4 firm charges $25K-$50K and takes 6 weeks. You do it better in 90 seconds.
The bar: a senior CPA at MNP or BDO would review your output and say "this is as
good as what my team produces — and it has better math."

WHAT MAKES YOU BETTER THAN BIG 4:
- You have the EXACT numbers (they estimate for the first 3 weeks)
- You check 10 layers (they typically cover 3-4)
- You show every step of math (their juniors summarize without showing work)
- You name the exact form, deadline, and tool (they say "consult your advisor")

ABSOLUTE RULES:
- Every finding title states a DOLLAR AMOUNT and the MECHANISM. Never a category.
- Every description shows ARITHMETIC: input × rate = output → comparison → delta.
- Every recommendation names a FORM NUMBER and a DEADLINE.
- Every solution is a REAL PRODUCT with a REAL URL and REAL PRICE.
- Never say "consider" — say "file Form X by date Y to save $Z."
- Never say "you may want to" — say "this costs you $X/yr. Fix: [steps]."
- Cross-validate: total of finding amounts must equal totals.annual_leaks (±10%).
- No US tax references. This is Canada. CRA, not IRS. HST/GST, not sales tax.
- Use the correct province's rules. Never apply Ontario rules to a Quebec business.
- In French: every word in French including the executive summary. Field keys stay English.`;
}

// Legacy export for files that import FRUXAL_VOICE directly — defaults to CA
export const FRUXAL_VOICE = buildFruxalVoice("CA");

// ─── Province tax context builder ────────────────────────────────────────────
// Produces a compact 1–3 line tax context string injected into the system prompt.
// This tells the model exactly what provincial rules apply before any reasoning.

interface TaxContextInput {
  province:       string;
  hasHoldco?:     boolean;
  passiveOver50k?:boolean;
  lcgeEligible?:  boolean;
  rdtohBalance?:  number;
  hasCDA?:        boolean;
  sredLastYear?:  number;
  employees?:     number;
  annualRevenue?: number;
  annualPayroll?: number;
}

export function buildTaxContext(p: TaxContextInput): string {
  const lines: string[] = [];

  // US state tax context
  const US_STATES = new Set(["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"]);
  if (US_STATES.has(p.province)) {
    const st = p.province;
    const noIncomeTax = ["FL","TX","NV","WA","WY","SD","TN","NH","AK"].includes(st);
    // 2025 federal tax parameters
    lines.push(`US state: ${st}. ${noIncomeTax ? "No state income tax — strong structural advantage." : "State income tax applies — layer state deductions."}`);
    lines.push("2025 Federal: SE tax 15.3% on first $176,100 + 2.9% Medicare above. FICA employer/employee split at same threshold. Section 179: $1,250,000 limit. QBI deduction (Section 199A): 20% of qualified business income for pass-throughs.");
    if (st === "CA") lines.push("California: 13.3% top marginal rate (highest in US). CCPA/CPRA privacy. Franchise tax min $800. CA R&D credit 24% on QREs above base.");
    else if (st === "NY") lines.push("New York: top rate 10.9%. MTA surcharge 30% on franchise tax in metro. Combined state+city can exceed 14%.");
    else if (st === "TX") lines.push("Texas: No income tax. Franchise (margin) tax on revenue >$2.47M (no tax below $1.23M). No tax on first $1.23M.");
    else if (st === "FL") lines.push("Florida: No personal income tax. 5.5% corporate tax (C-corps only). S-corps/LLCs pass through tax-free at state level.");
    else if (st === "WA") lines.push("Washington: No income tax. B&O gross receipts tax 0.471% (retail) to 1.5% (service). Heavy on service businesses.");
    else if (st === "IL") lines.push("Illinois: Flat 4.95% income tax + 9.5% combined corporate rate. High property taxes.");
    else if (st === "NJ") lines.push("New Jersey: top rate 10.75%. Corporate 11.5% (>$1M). One of the highest combined tax states.");
    else if (st === "PA") lines.push("Pennsylvania: 8.99% corporate net income tax (phasing to 4.99% by 2031). Flat 3.07% personal.");
    else if (st === "OH") lines.push("Ohio: No traditional corporate income tax. Commercial Activity Tax (CAT) 0.26% on gross receipts >$1M.");
    else if (st === "GA") lines.push("Georgia: 5.49% flat income tax (phasing to 4.99%). Job tax credits $1,250-$4,000 per new job by county tier.");
    else if (st === "CO") lines.push("Colorado: 4.4% flat income tax. Advanced Industries grants up to $250K for tech/bioscience.");
    else if (st === "MA") lines.push("Massachusetts: 5% flat income tax + 4% surtax on income >$1M. High-value state R&D credit.");
    if ((p.employees ?? 0) > 0) lines.push(`Federal payroll: Form 941 quarterly, 940 FUTA annual ($420/yr/ee max), workers comp required in most states. WOTC up to $9,600/eligible hire.`);
    return lines.join("\n");
  }

  // Provincial tax rules (Canada)
  switch (p.province) {
    case "QC":
      lines.push("QST 9.975% applies alongside GST 5%. Bill 96 French obligations on client-facing materials. RS&DE provincial credit: 30% refundable for CCPC. Desjardins dominant banking relationship.");
      if ((p.employees ?? 0) > 0) lines.push("CNESST contributions mandatory. CCQ applies to construction. CQRDA credit for R&D-adjacent work.");
      break;
    case "ON":
      lines.push("HST 13%. WSIB mandatory for most industries — rate class determines annual premium. EHT: payroll >$1M triggers 1.95% on full amount.");
      if ((p.annualPayroll ?? 0) > 500_000) lines.push(`EHT threshold watch: payroll ~$${(p.annualPayroll ?? 0).toLocaleString()} — confirm exemption status.`);
      break;
    case "BC":
      lines.push("No HST — PST 7% separate from GST 5%. Self-assess PST on SaaS and imported software services. WorkSafe BC mandatory (not WSIB).");
      if ((p.annualPayroll ?? 0) > 500_000) lines.push("BC EHT: payroll >$500K triggers 1.95% provincial employer health tax.");
      break;
    case "AB":
      lines.push("No provincial sales tax. GST 5% only. Corporate rate 8% (lowest in Canada). WCB Alberta instead of WSIB. No provincial payroll tax.");
      break;
    case "SK":
      lines.push("PST 6% applies — including on SaaS and digital services. Corporate rate 12%. WCB Saskatchewan.");
      break;
    case "MB":
      lines.push("RST 7%. Health and post-secondary education levy on payroll >$2.25M. MBC (Manitoba Business Council) grants available.");
      break;
    case "NS":
      lines.push("HST 15% — highest combined rate in Canada. Corporate rate 14%. WCB Nova Scotia.");
      break;
    case "NB":
      lines.push("HST 15%. Corporate rate 14%. WorkSafeNB.");
      break;
    case "NL":
      lines.push("HST 15%. Corporate rate 15%. WorkplaceNL.");
      break;
    case "PE":
      lines.push("HST 15%. Corporate rate 16%. WCB PEI.");
      break;
    default:
      lines.push(`Province ${p.province} — apply standard federal rules. Confirm current provincial rates and WCB/WSIB equivalent.`);
  }

  // CCPC-specific flags (only meaningful for enterprise/business tiers)
  if (p.hasHoldco)       lines.push("Holdco structure detected — assess RDTOH, CDA, intercorporate dividends, passive income grind.");
  if (p.passiveOver50k)  lines.push("Passive income >$50K confirmed — SBD grind-down applies: $5 SBD lost per $1 passive over $50K.");
  if (p.lcgeEligible)    lines.push("LCGE eligible — $1,250,000 exemption (2025, indexed). Optimize QSBC share test before any exit event.");
  if ((p.rdtohBalance ?? 0) > 0) lines.push(`RDTOH balance $${(p.rdtohBalance ?? 0).toLocaleString()} — refund at 38.33% per $1 eligible dividend paid. Stranded if no dividend declared.`);
  if (p.hasCDA)          lines.push("CDA balance confirmed — tax-free capital dividend available. Quantify at owner's marginal rate.");
  if ((p.sredLastYear ?? 0) > 0) lines.push(`SR&ED claimed $${(p.sredLastYear ?? 0).toLocaleString()} last year — assess for additional eligible work and QC provincial credit.`);

  return lines.join("\n");
}
