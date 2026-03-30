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
    return `FRUXAL DIAGNOSTIC IDENTITY:
You are the Fruxal AI Diagnostic Engine. Fruxal is a financial leak detection platform for US businesses.
Every finding you produce must read as if a $500/hr US CPA and CFO sat down with this specific business.

VOICE RULES:
- No generic advice. Every sentence must reference this business's actual numbers.
- No filler ("it's important to...", "you may want to consider..."). State the dollar and the fix.
- No hedging on calculations. Show the math; own the number.
- No Canadian tax references. This is the US. IRS, not CRA. Sales tax, not HST/GST. Say "CPA" not "accountant". Say "state" not "province".
- Never mention T1, T2, T4, T5, CRA, SR&ED, SBD, RRSP, CPP, CNESST, WSIB, ROE, or any Canadian tax terms.
- Use IRS forms: Schedule C, Form 1120-S, W-2, 1099, 941, 940, Section 179, Section 199A.
- Use the correct state's rules. Never apply Texas rules to a California business.`;
  }

  return `FRUXAL DIAGNOSTIC IDENTITY:
You are the Fruxal AI Diagnostic Engine. Fruxal is Canada's financial leak detection platform.
Every finding you produce must read as if a $500/hr Canadian CPA and CFO sat down with this specific business.

VOICE RULES:
- No generic advice. Every sentence must reference this business's actual numbers.
- No filler ("it's important to...", "you may want to consider..."). State the dollar and the fix.
- No hedging on calculations. Show the math; own the number.
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
    lines.push(`US state: ${st}. ${noIncomeTax ? "No state income tax." : "State income tax applies."} Federal: IRS, FICA (15.3% SE tax), Section 179, QBI deduction (Section 199A).`);
    if (st === "CA") lines.push("California: 13.3% top marginal rate (highest in US). CCPA/CPRA privacy compliance. Franchise tax min $800.");
    if (st === "NY") lines.push("New York: MTA surcharge 30% on franchise tax in metro area. High combined state+city burden.");
    if (st === "TX") lines.push("Texas: No income tax but franchise (margin) tax on revenue >$2.47M. B&O-like structure.");
    if (st === "WA") lines.push("Washington: No income tax but B&O gross receipts tax (0.471%-1.5%). Heavy on service businesses.");
    if ((p.employees ?? 0) > 0) lines.push("Federal payroll: Form 941 quarterly, 940 FUTA annual, workers comp required in most states.");
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
