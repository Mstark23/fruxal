// =============================================================================
// lib/ai/prompts/diagnostic/solution-matrix.ts
//
// Solution recommendation matrix: finding category × tier × province.
// Claude reads the relevant row for each finding it writes and picks the
// best-fit tool(s) for that specific finding type at that tier.
//
// This is the single source for all solution guidance — no more flat tool lists.
// =============================================================================

export type DiagnosticTier = "solo" | "business" | "enterprise";

export function buildSolutionMatrix(
  tier:         DiagnosticTier,
  province:     string,
  annualRevenue: number,
  employees:    number,
  industry:     string,
  hasPayroll:   boolean,
  doesRd:       boolean,
  country:      "CA" | "US" = "CA",
): string {
  if (country === "US") return buildUSSolutionMatrix(tier, province, annualRevenue, employees, industry, hasPayroll, doesRd);

  const isQC = province === "QC";
  const isON = province === "ON";
  const isBC = province === "BC";
  const isAB = province === "AB";

  // Province-aware payroll note injected into payroll rows
  const payrollNote = isQC
    ? "QC: must handle CNESST, CCQ if construction, QST payroll deductions. French interface required."
    : isON ? "ON: must handle WSIB registration and rate class, EHT on payroll >$1M, ROE filing."
    : isBC ? "BC: WorkSafe BC (not WSIB), EHT on payroll >$500K."
    : isAB ? "AB: WCB Alberta. No provincial payroll tax."
    : `${province}: confirm provincial WCB/WSIB equivalent and any employer health tax.`;

  // Province-aware tax note
  const taxNote = isQC
    ? "QC: QST 9.975% + GST 5%. RS&DE 30% refundable provincial credit for CCPCs. French filing obligations via Revenu Québec."
    : isON ? "ON: HST 13%. Ontario SR&ED credit 3.5% refundable. EHT on payroll >$1M."
    : isBC ? "BC: PST 7% separate from GST 5%. Self-assess PST on imported SaaS."
    : isAB ? "AB: GST 5% only. Corporate rate 8%. No PST."
    : `${province}: confirm current provincial tax rates.`;

  // ── SOLO ──────────────────────────────────────────────────────────────────
  if (tier === "solo") {
    return `
SOLUTION MATRIX — SOLO TIER ($0–$150K, ${employees} employees, ${province})
For each finding you write, use the matching row below to select solutions.
MAX 2 solutions per finding. If no strong match: solutions: [].
The "why" must name the specific problem this fixes for this business — never generic.

TAX | HST registration, deductions, sole prop vs corp, CRA filings
  ${taxNote}
  → Wave Tax (free, built in) | TurboTax Business Self-Employed (~$60/yr, DIY-friendly)
  → If near $30K HST threshold: CRA online registration https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/register.html (free)
  → If incorporation timing: Ownr (https://ownr.co, RBC-backed, ON/BC, $499) ${isQC ? "| Ownco (https://ownco.ca, QC French)" : "| Legalzoom Canada (https://legalzoom.com/ca)"}
  ❌ Never recommend: MNP, BDO, Sage Intacct — overkill for solo.

PAYROLL | Employee misclassification, ROE, CPP/EI, source deductions
  ${payrollNote}
  ${employees === 0
    ? "→ No employees — CRA RC4110 (employee vs contractor test). No payroll tool needed yet."
    : `→ Wagepoint (https://wagepoint.com, ~$26/mo + $4/ee, simplest Canadian payroll for <5 employees)
  → Humi (https://humi.ca, ~$6/ee/mo, if 3+ employees and HR features needed)
  ${isQC ? "→ Nethris (https://nethris.com, French-first QC payroll)" : ""}`}

COMPLIANCE | Overdue filings, CRA deadlines, annual return, registration gaps
  → CRA My Business Account https://www.canada.ca/en/revenue-agency/services/e-services/e-services-businesses/business-account.html (free — set up deadline alerts)
  → Wave (free accounting, keeps books CRA-ready) | FreshBooks (~$19/mo if service business)
  ❌ Never recommend enterprise compliance tools.

OPERATIONS | Pricing, time tracking, project management, process gaps
  → Toggl Track (https://toggl.com/track, free tier) | Harvest (https://getharvest.com, ~$12/mo)
  → Notion (free, project mgmt) | Trello (free, kanban)
  → For pricing: methodology recommendation only — no specific SaaS needed.

INSURANCE | GL, professional liability, E&O, equipment, business interruption
  → Zensurance (https://zensurance.com, Canadian specialist, online quote <5 min, covers freelancers/consultants/contractors)
  → BrokerLink (https://brokerlink.ca, broker for complex needs)
  ❌ Never recommend Intact Direct or Aviva — not solo-focused.

CONTRACT | Client agreements, IP ownership, scope creep, payment terms
  → Bonsai (https://hellobonsai.com, ~$24/mo, contracts + invoicing + proposals for freelancers)
  → PandaDoc free tier (https://pandadoc.com) | HelloSign (https://hellosign.com, 3 free docs/mo)

GROWTH | Pricing, lead gen, referrals, service expansion
  → HubSpot CRM (https://hubspot.com, genuinely free for solo)
  → Calendly (https://calendly.com, free tier) | Acuity Scheduling (https://acuityscheduling.com, ~$20/mo)
  → Squarespace (~$23/mo) | Webflow (~$23/mo) if website needed

STRUCTURE | Sole prop vs corp, HST registration, fiscal year optimization
  → Ownr (https://ownr.co) ${isQC ? "| Ownco (https://ownco.ca)" : "| Legalzoom Canada"}
  → Wave (pre-incorporation) → QuickBooks Simple Start post-inc

CASH_FLOW | Late AR, invoicing gaps, payment collection, banking fees
  → Wave Invoicing (free, built-in, instant) | FreshBooks (automated reminders, ~$19/mo)
  → Plooto (https://plooto.com, PAD pull payments, ~$25/mo) — only if recurring B2B billing
  → Neo Financial Business (https://neo.ca/business, no-fee Canadian business banking)
`.trim();
  }

  // ── BUSINESS ──────────────────────────────────────────────────────────────
  if (tier === "business") {
    const industryLower = industry.toLowerCase();
    const isRetailFood  = industryLower.includes("restaurant") || industryLower.includes("retail") || industryLower.includes("food");
    const isMfg         = industryLower.includes("manufactur") || industryLower.includes("wholesale");

    return `
SOLUTION MATRIX — BUSINESS TIER ($150K–$1M, ${employees} employees, ${province})
For each finding, use the matching row. MAX 3 solutions per finding.
The "why" must reference province compliance, employee count, and the specific gap. Not generic.
Rank by fit, not cost. solutions: [] if no strong match.

TAX | T4/dividend mix, HST, SR&ED, corporate structure, CRA filings
  ${taxNote}
  → Owner comp: recommend MNP (https://mnp.ca) or local CPA for T4/dividend modeling — not software
  → Accounting (if on spreadsheets/Wave): QuickBooks Online (https://quickbooks.intuit.com/ca, $35–$80/mo, industry standard) | Xero (https://xero.com/ca, $30–$70/mo, better bank feeds)
  ${doesRd ? "→ SR&ED: Boast.ai (https://boast.ai, AI-assisted, ~15% of credit) | Mentor Works (https://mentorworks.ca, grants + SR&ED)" : "→ SR&ED eligibility: CRA self-assessment tool first before engaging any consultant"}
  ${isQC ? "→ QC: Acomba (https://acomba.com, French-first, QST-native)" : ""}

PAYROLL | ${employees} employees — ${payrollNote}
  ${employees <= 15
    ? "→ Wagepoint (https://wagepoint.com, ~$26/mo + $4/ee, simplest Canadian payroll for <15 employees)\n  → Humi (https://humi.ca, ~$6/ee/mo, better if also need HR and benefits)"
    : "→ Humi (https://humi.ca, ~$6/ee/mo, best Canadian all-in-one for 15–200 employees)\n  → Ceridian PowerPay (https://ceridian.com/ca/powerpay, strong compliance, better for 20+ employees)"}
  ${isQC ? "→ QC: Nethris (https://nethris.com) | Folks HR (https://folks.app, bilingual)" : ""}
  ${!hasPayroll ? "→ No payroll yet: register CRA payroll account first https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/setting-up-payroll.html" : ""}

COMPLIANCE | WSIB, EHT, CRA deadlines, provincial registrations, director liability
  → Obligation tracking: Fruxal obligations calendar already handles this
  → Corporate filings: ${isQC ? "Registraire des entreprises (https://www.registreentreprises.gouv.qc.ca)" : "Corporations Canada (https://ised-isde.canada.ca/site/corporations-canada)"}

OPERATIONS | Margins, vendor costs, process gaps, inventory, pricing
  ${isRetailFood ? "→ POS/inventory: Lightspeed (https://lightspeedhq.com, Canadian HQ, best retail/restaurant with inventory) | Square (https://squareup.com/ca, simpler, lower upfront)" : ""}
  ${isMfg ? "→ Inventory: inFlow Inventory (https://inflowinventory.com, $89/mo) | Cin7 (https://cin7.com, multi-channel)" : ""}
  → Accounting upgrade: QuickBooks Online (https://quickbooks.intuit.com/ca) | Xero (https://xero.com/ca)
  → Expense capture: Dext (https://dext.com, $30–$50/mo, receipt capture + accounting integration)

INSURANCE | GL, professional liability, cyber, key person, E&O
  → Zensurance (https://zensurance.com, best Canadian SMB specialist, covers GL/professional/cyber/E&O — online quote)
  → Cyber specifically: Coalition (https://coalitioninc.com, active monitoring + insurance, $500–$2K/yr for SMB)
  → Complex risks: BrokerLink (https://brokerlink.ca) | Intact Business (https://intact.ca/en/business)
  → Key person: Manulife (https://manulife.ca) | Sunlife (https://sunlife.ca)

CONTRACT | Vendor contracts, client terms, IP, e-signatures
  → DocuSign (https://docusign.com/ca, ~$25/mo) | PandaDoc (https://pandadoc.com, better value for SMB)
  → Legal review: 1–2 hrs with a local commercial lawyer — worth it for recurring vendor contracts

GROWTH | Revenue expansion, sales process, CRM, e-commerce, customer retention
  → CRM: HubSpot CRM (https://hubspot.com, free tier excellent for <15 users) | Pipedrive (https://pipedrive.com, ~$15/user/mo)
  → E-commerce: Shopify (https://shopify.ca, $39–$105/mo, Canadian HQ)
  → Email: Mailchimp (https://mailchimp.com, free to 500 contacts) | Klaviyo (https://klaviyo.com, better for e-commerce)

STRUCTURE | Incorporation, holdco, T4 vs dividends, fiscal year
  → Structure review: MNP (https://mnp.ca) | BDO Canada (https://bdo.ca) — worth 2-3 advisory hours at this revenue
  → Banking for corp: RBC Business (https://rbcroyalbank.com/business) | Scotiabank Business (https://scotiabank.com/business)

CASH_FLOW | AR collection, payment terms, working capital, banking
  → B2B collections: Plooto (https://plooto.com, Canadian EFT/PAD pull, $25/mo flat)
  → AR automation: FreshBooks (automated reminders) | QuickBooks Online AR module
  → Working capital: BDC Working Capital Loan (https://bdc.ca, government-backed, lower rates)
`.trim();
  }

  // ── ENTERPRISE ────────────────────────────────────────────────────────────
  if (tier === "enterprise") {
    const industryLower = industry.toLowerCase();
    const isMfg         = industryLower.includes("manufactur") || industryLower.includes("wholesale") || industryLower.includes("distribution");
    const revM          = (annualRevenue / 1_000_000).toFixed(1);

    return `
SOLUTION MATRIX — ENTERPRISE TIER ($1M+, ${employees} employees, CCPC, ${province})
For each finding, use the matching row. MAX 3 solutions per finding.
The "why" must be CFO-level: ROI, integration depth, Canadian compliance — not feature lists.
Finding impact >$50K → always include at least 1 solution if a strong category match exists.
Tax/structure findings → advisory firm required alongside (or instead of) software.

TAX | Salary/dividend mix, RDTOH, CDA, LCGE, passive grind, IPP, estate freeze, HST
  ${taxNote}
  → Advisory (REQUIRED for structural tax findings): MNP LLP (https://mnp.ca, strongest CCPC) | BDO Canada (https://bdo.ca, excellent SR&ED + corporate) | RSM Canada (https://rsmcanada.com, mid-market)
  ${doesRd ? "→ SR&ED: Boast.ai (https://boast.ai, AI-assisted, ~15% contingency) | Swifter (https://swifter.ai, flat fee) | Mentor Works (https://mentorworks.ca)" : ""}
  ${isQC ? "→ QC CCPC: Richter (https://richter.ca, strong QC/ON) | Revenu Québec RS&DE (30% refundable provincial)" : ""}
  ❌ Never recommend TurboTax or Wave Tax for enterprise.

PAYROLL | ${employees} employees — ${payrollNote}
  ${employees >= 50
    ? "→ Ceridian Dayforce (https://ceridian.com/ca/dayforce, full HCM, Canadian company, best 50+ employees)\n  → ADP Workforce Now (https://adp.com/ca, global standard, excellent Canadian compliance)"
    : employees >= 20
    ? "→ Ceridian PowerPay (https://ceridian.com/ca/powerpay) | Humi (https://humi.ca, best Canadian for 20–150 employees)"
    : "→ Humi (https://humi.ca, most feature-complete Canadian option at this size)"}
  → Group benefits: Manulife GroupBenefits (https://manulife.ca/group-benefits) | Canada Life (https://canadalife.com/group-benefits) | ${isQC ? "Desjardins Group Insurance (https://desjardins.com, competitive in QC)" : "Sunlife (https://sunlife.ca/en/group-benefits)"}
  ${isQC ? "→ QC: Folks HR (https://folks.app, bilingual) | Nethris (https://nethris.com, QC specialist)" : ""}

COMPLIANCE | CRA audit exposure, director liability, provincial registrations, governance
  → CRA audit support: MNP Tax Controversy (https://mnp.ca) | Thorsteinssons LLP (tax litigation)
  → Document management: NetDocuments (https://netdocuments.com) | iManage (https://imanage.com)
  → WSIB/WCB rate class optimization: commercial broker (BrokerLink https://brokerlink.ca can reclassify)

OPERATIONS | ERP, process efficiency, vendor leverage, margin leakage
  ${annualRevenue >= 3_000_000
    ? "→ ERP: Sage Intacct (https://sageintacct.com, best $2M–$50M multi-entity) | NetSuite (https://netsuite.com, scales higher, more complex)"
    : "→ Accounting upgrade: QuickBooks Online Advanced (https://quickbooks.intuit.com/ca) | Xero (https://xero.com/ca) for $1M–$3M single entity"}
  ${isMfg ? "→ Manufacturing ERP: Epicor (https://epicor.com/ca) | Microsoft Dynamics 365 BC (https://dynamics.microsoft.com/en-ca)" : ""}
  → Spend management: Procurify (https://procurify.com, Canadian company)

INSURANCE | Commercial P&C, cyber, D&O, key person, business interruption
  → Commercial P&C: Intact Commercial (https://intact.ca/en/business, largest Canadian P&C) | Aviva Canada (https://aviva.ca/en/business)
  → Cyber: Coalition (https://coalitioninc.com, active monitoring + insurance) | Beazley (https://beazley.com, specialist for larger risk)
  → D&O: AXA XL (https://axaxl.com) | Chubb Canada (https://chubb.com/ca) — through commercial broker
  → Key person COLI: Manulife | Canada Life — fund with corporate-owned life insurance for tax efficiency
  → Broker: BrokerLink (https://brokerlink.ca) | HUB International (https://hubinternational.com/ca)

CONTRACT | CLM, vendor leverage, IP protection, licensing
  → DocuSign CLM (https://docusign.com/products/contract-lifecycle-management) | Ironclad (https://ironcladapp.com)
  → Legal: Norton Rose Fulbright (https://nortonrosefulbright.com/en-ca) | Gowling WLG (https://gowlingwlg.com/en/canada)

GROWTH | M&A, market expansion, pricing power, channel development
  → CRM: Salesforce (https://salesforce.com/ca) | HubSpot Sales Hub (https://hubspot.com, better value <20 users)
  → BI: Power BI (https://powerbi.microsoft.com) | Tableau (https://tableau.com)
  → M&A advisory: CIBC Capital Markets (https://cibcwm.com) | Raymond James Canada (https://raymondjames.ca, good for <$50M exits) | MNP Corporate Finance (https://mnp.ca)

STRUCTURE | Holdco, estate freeze, LCGE, IPP, intercorporate dividends, succession
  → Advisory REQUIRED: MNP LLP (https://mnp.ca) | BDO Canada (https://bdo.ca) | ${isQC ? "Richter (https://richter.ca)" : "Bennett Jones (https://bennettjones.com)"}
  → IPP actuarial: TELUS Health / Morneau Shepell (https://telushealth.com) | Mercer Canada (https://mercer.com/ca)
  → Family trust / holdco: Bennett Jones | Stikeman Elliott (https://stikeman.com) — national tax group
  → Banking (holdco): RBC Commercial (https://rbcroyalbank.com/commercial) | ${isQC ? "Desjardins Business (https://desjardins.com)" : "BMO Commercial (https://bmo.com/commercial)"}

CASH_FLOW | Working capital, AR >45 days, credit facility, treasury
  → AR automation: Versapay (https://versapay.com, network-based AR, best B2B $5M+) | Esker (https://esker.ca)
  → Credit facility: BDC (https://bdc.ca, government-backed, lower rates for CCPCs) | RBC Commercial credit line | ${isAB ? "ATB Business (https://atb.com)" : "TD Commercial"}
  → Trade credit insurance: Euler Hermes Canada (https://eulerhermes.ca) — for large AR concentration risk
`.trim();
  }

  return "";
}


// =============================================================================
// US SOLUTION MATRIX — IRS forms, US tools, US advisory firms
// =============================================================================
function buildUSSolutionMatrix(
  tier:         DiagnosticTier,
  state:        string,
  annualRevenue: number,
  employees:    number,
  industry:     string,
  hasPayroll:   boolean,
  doesRd:       boolean,
): string {
  const industryLower = industry.toLowerCase();
  const isRetailFood  = /restaurant|retail|food|cafe|bar/.test(industryLower);
  const isMfg         = /manufactur|wholesale|distribut/.test(industryLower);
  const isHealth      = /health|medical|dental|clinic|pharmacy/.test(industryLower);
  const isSaaS        = /saas|software|tech|digital|app/.test(industryLower);
  const noIncomeTax   = ["TX","FL","NV","WY","SD","TN","AK","WA","NH"].includes(state);

  const statePayrollNote = `${state}: register for state unemployment insurance (SUI/SUTA) — rates vary 1–8%. Workers compensation mandatory — register with state WC board or use PEO.`;
  const stateTaxNote = noIncomeTax
    ? `${state}: no state income tax — strong advantage. Focus on federal optimization and sales tax nexus.`
    : `${state}: state income tax applies — layer state deductions on top of federal. Confirm state-specific credits.`;

  if (tier === "solo") {
    return `
SOLUTION MATRIX — US SOLO TIER ($0–$150K, ${employees} employees, ${state})
For each finding, use the matching row. MAX 2 solutions per finding.
The "why" must name the specific problem for this business — never generic.

TAX | SE tax, S-corp election, deductions, IRS filings, state income tax
  ${stateTaxNote}
  → Accounting: Wave (free, US-ready) | FreshBooks (~$19/mo, best for freelancers/solo service)
  → Tax filing: TurboTax Self-Employed (~$130/yr) | H&R Block Self-Employed (~$115/yr)
  → S-corp election (if revenue >$60K): file Form 2553. Use Gusto Contractor (~$6/mo) after election.
  → Home office: Form 8829 (actual method) or $5/sq ft simplified — both IRS-accepted.
  ❌ Never recommend enterprise accounting for solo.

PAYROLL | W-2 employees, FICA, FUTA, state SUI, Form 941
  ${statePayrollNote}
  ${employees === 0
    ? "→ No employees — ensure 1099-NEC issued for all contractors >$600/yr by Jan 31. Use Track1099 (https://track1099.com, $2/form)."
    : `→ Gusto (https://gusto.com, $46/mo + $6/ee, best US payroll for <10 employees, handles FICA/FUTA/state)
  → Justworks (https://justworks.com, PEO model, includes benefits + workers comp, ~$59/ee/mo)`}

COMPLIANCE | IRS deadlines, state filings, annual report, business license
  → IRS Online Account (https://www.irs.gov/payments/your-online-account, free — monitor balance/notices)
  → Registered Agent: Registered Agents Inc (https://www.registeredagentsinc.com, $100/yr) for state compliance
  → Accounting: Wave (free) | QuickBooks Self-Employed (~$15/mo, mileage + SE tax estimates)

OPERATIONS | Pricing, time tracking, project management, process gaps
  → Toggl Track (https://toggl.com, free tier) | Harvest (https://getharvest.com, ~$12/mo)
  → Notion (free) | Asana (free tier) for project management
  → Mileage: MileIQ (https://mileiq.com, ~$60/yr, IRS-compliant log)

INSURANCE | GL, professional liability, E&O, business owner policy
  → Next Insurance (https://nextinsurance.com, US specialist, online quote <5 min, small biz BOP)
  → Hiscox (https://hiscox.com/small-business-insurance, excellent for professional/consulting)
  → Pie Insurance (https://pieinsurance.com, workers comp specialist for small biz)
  ❌ Never recommend Zensurance (Canadian) for US businesses.

CONTRACT | Client agreements, IP ownership, scope creep, payment terms
  → Bonsai (https://hellobonsai.com, ~$24/mo, contracts + invoicing, US law templates)
  → PandaDoc free tier (https://pandadoc.com) | DocuSign (https://docusign.com, 3 free/mo then ~$15/mo)

GROWTH | Pricing, lead gen, referrals, service expansion
  → HubSpot CRM (https://hubspot.com, free tier) | Calendly (https://calendly.com, free tier)
  → Squarespace (~$23/mo) | Webflow (~$23/mo) if website upgrade needed

STRUCTURE | Sole prop vs LLC vs S-corp, state registration, fiscal year
  → LLC formation: ZenBusiness (https://zenbusiness.com, $49 + state fees) | Northwest Registered Agent (https://northwestregisteredagent.com, $39)
  → S-corp election: file Form 2553 with IRS — free, do within 75 days of tax year start
  → CPA for entity modeling: Bench (https://bench.co, online bookkeeping + CPA from $299/mo)

CASH_FLOW | Late AR, invoicing gaps, payment collection, banking fees
  → Wave Invoicing (free, instant) | FreshBooks (automated reminders, ~$19/mo)
  → Relay Financial (https://relayfi.com, no-fee US business banking, excellent for small biz)
  → Mercury Bank (https://mercury.com, tech-friendly, no fees, ACH + wires)
`.trim();
  }

  if (tier === "business") {
    return `
SOLUTION MATRIX — US BUSINESS TIER ($150K–$1M, ${employees} employees, ${state})
For each finding, use the matching row. MAX 3 solutions per finding.
The "why" must reference state compliance, employee count, and specific gap. Not generic.

TAX | W-2/distribution split, S-corp reasonable comp, Section 179, QBI, sales tax nexus
  ${stateTaxNote}
  → Owner comp modeling: CPA required — search AICPA directory (https://aicpastore.aicpa.org) for local CPA
  → Accounting: QuickBooks Online (~$35–$80/mo, US standard) | Xero (https://xero.com, ~$32–$65/mo)
  → Sales tax nexus: TaxJar (https://taxjar.com, ~$19/mo) | Avalara (https://avalara.com, $50+/mo for multi-state)
  ${doesRd ? "→ R&D credit (Section 41): Boast.ai (https://boast.ai, AI-assisted, ~15% of credit) | Clarus R+D (https://clarusrd.com, specialist for SMB)" : ""}
  → Expense management: Expensify (https://expensify.com, ~$5/user/mo) | Dext (https://dext.com, receipt capture)

PAYROLL | ${employees} employees — ${statePayrollNote}
  ${employees <= 15
    ? "→ Gusto (https://gusto.com, $46/mo + $6/ee, best US payroll <15 employees, full tax filing)\n  → Justworks (https://justworks.com, PEO, includes benefits + workers comp, ~$59/ee/mo)"
    : "→ Rippling (https://rippling.com, ~$8/ee/mo, best mid-market, includes HRIS + payroll + benefits)\n  → ADP RUN (https://adp.com/run, $59+/mo, strong compliance, 20+ employees)"}
  ${!hasPayroll ? "→ Not yet on payroll: register EIN if needed (free, IRS.gov), then choose provider above." : ""}
  → WOTC screening: Efficient Hire (https://efficienthire.com) | ADP TotalSource (includes WOTC at scale)

COMPLIANCE | IRS notices, state registrations, annual reports, director liability
  → State filings: Registered Agents Inc (https://www.registeredagentsinc.com, $100/yr/state)
  → Accounting compliance: QuickBooks Online | Xero — keep books clean for IRS audit trail
  → Sales tax: TaxJar (https://taxjar.com) | Avalara (https://avalara.com, multi-state)

OPERATIONS | Margins, vendor costs, process gaps, inventory, pricing
  ${isRetailFood ? "→ POS/inventory: Square for Restaurants (https://squareup.com, best US food/retail) | Toast (https://pos.toasttab.com, restaurant-specific)" : ""}
  ${isMfg ? "→ Inventory: inFlow Inventory (https://inflowinventory.com, $89/mo) | Cin7 (https://cin7.com)" : ""}
  → Accounting upgrade: QuickBooks Online Advanced (~$200/mo) | Sage Intacct (if multi-entity)
  → Vendor spend: Procurify (https://procurify.com) | BILL.com (https://bill.com, AP automation)

INSURANCE | GL, professional liability, cyber, key person, BOP
  → Business Owner Policy: Next Insurance (https://nextinsurance.com) | Hiscox (https://hiscox.com)
  → Cyber: Coalition (https://coalitioninc.com, active monitoring + insurance, $800–$3K/yr)
  → Workers comp: Pie Insurance (https://pieinsurance.com) | Employers (https://employers.com)
  → Key person: Principal Financial (https://principal.com) | Guardian Life (https://guardianlife.com)
  → Broker: Lockton Companies (https://lockton.com) | Hub International (https://hubinternational.com)

CONTRACT | Vendor contracts, client terms, IP, e-signatures
  → DocuSign Business Pro (https://docusign.com, ~$65/mo) | PandaDoc (https://pandadoc.com, better value)
  → Legal review: LegalZoom Business (https://legalzoom.com, ~$100-300/matter) or local business attorney

GROWTH | Revenue expansion, sales process, CRM, e-commerce, retention
  → CRM: HubSpot CRM (https://hubspot.com, free to starter $45/mo) | Pipedrive (https://pipedrive.com, ~$15/user/mo)
  → E-commerce: Shopify (https://shopify.com, $39–$105/mo) | BigCommerce (https://bigcommerce.com)
  → Email: Mailchimp (https://mailchimp.com) | Klaviyo (https://klaviyo.com, e-commerce focused)

STRUCTURE | LLC vs S-corp vs C-corp, entity optimization, fiscal year
  → Structure analysis: CPA required — AICPA (https://aicpa.org) or local firm
  → S-corp election: Form 2553, file within 75 days of tax year start
  → Business banking: Chase Business (https://chase.com/business) | Mercury (https://mercury.com, no fees)

CASH_FLOW | AR collection, payment terms, working capital, banking
  → AR automation: FreshBooks (automated reminders) | Bill.com (https://bill.com, best B2B AR)
  → Payments: Stripe (https://stripe.com, best developer-friendly) | Square (https://squareup.com)
  → Working capital: BlueVine (https://bluevine.com, line of credit) | Kabbage / American Express Business Line
`.trim();
  }

  if (tier === "enterprise") {
    const revM = (annualRevenue / 1_000_000).toFixed(1);

    return `
SOLUTION MATRIX — US ENTERPRISE TIER ($1M+, ${employees} employees, ${state})
For each finding, use the matching row. MAX 3 solutions per finding.
The "why" must be CFO-level: ROI, IRS compliance, integration depth — not feature lists.
Tax/structure findings → advisory firm required alongside software.

TAX | W-2/distribution optimization, QBI, Section 179, bonus depreciation, QSBS, entity structure
  ${stateTaxNote}
  → Advisory REQUIRED for structural tax: Aprio (https://aprio.com) | CliftonLarsonAllen (https://claconnect.com) | local Big 4 regional
  ${doesRd ? "→ R&D credit (Section 41): Boast.ai (https://boast.ai) | alliantgroup (https://alliantgroup.com, largest R&D credit firm in US) | Clarus R+D (https://clarusrd.com)" : ""}
  → Cost segregation: Engineered Tax Services (https://engineeredtaxservices.com) | National Tax Group (https://nationaltaxgroup.com)
  ❌ Never recommend TurboTax or QuickBooks tax filing for enterprise.

PAYROLL | ${employees} employees — ${statePayrollNote}
  ${employees >= 50
    ? "→ Rippling (https://rippling.com, best 50–500 US employees, unified HRIS+payroll+benefits)\n  → ADP Workforce Now (https://adp.com, global standard, excellent multi-state compliance)"
    : "→ Rippling (https://rippling.com) | Justworks PEO (https://justworks.com, all-in including benefits + workers comp)"}
  → Group benefits: Sequoia One (https://sequoiaone.com, premium PEO) | Namely (https://namely.com, HCM + benefits)
  ${isHealth ? "→ Healthcare-specific: TriNet (https://trinet.com, HIPAA-aware PEO)" : ""}
  → WOTC at scale: Efficient Hire (https://efficienthire.com) — systematic screening saves $9,600/eligible hire

COMPLIANCE | IRS audit exposure, state registrations, multi-state nexus, SOC controls
  → Multi-state compliance: Avalara (https://avalara.com, #1 US sales tax automation) | Vertex (https://vertexinc.com)
  → State registrations: CT Corporation (https://ctcorporation.com) | CSC Global (https://cscglobal.com)
  → Document management: NetSuite | Sage Intacct (built-in audit trails)
  → IRS controversy: Chamberlain Hrdlicka (https://chamberlainlaw.com) | Meadows Collier (tax litigation)

OPERATIONS | ERP, process efficiency, vendor leverage, margin leakage
  ${annualRevenue >= 3_000_000
    ? "→ ERP: Sage Intacct (https://sageintacct.com, best $2M–$50M multi-entity, real-time consolidation) | NetSuite (https://netsuite.com, scales higher)"
    : "→ Accounting: QuickBooks Online Advanced (~$200/mo) or Xero for single-entity $1M–$3M"}
  ${isMfg ? "→ Manufacturing ERP: Epicor (https://epicor.com) | Microsoft Dynamics 365 Business Central" : ""}
  → Spend management: Procurify (https://procurify.com) | Coupa (https://coupa.com, enterprise spend)
  → Accounts payable: Bill.com (https://bill.com) | Tipalti (https://tipalti.com, global AP)

INSURANCE | Commercial P&C, cyber, D&O, EPLI, key person, business interruption
  → Commercial P&C: Chubb (https://chubb.com, largest US commercial P&C) | Travelers (https://travelers.com)
  → Cyber: Coalition (https://coalitioninc.com) | Beazley (https://beazley.com, specialist large risk)
  → D&O/EPLI: AXA XL (https://axaxl.com) | Markel (https://markel.com)
  → Key person COLI: Principal Financial | Pacific Life — corporate-owned, tax-efficient
  → Broker: Lockton (https://lockton.com) | Marsh McLennan (https://marshmclennan.com) for $10M+ enterprise

CONTRACT | CLM, vendor leverage, IP protection, licensing
  → DocuSign CLM (https://docusign.com/products/contract-lifecycle-management) | Ironclad (https://ironcladapp.com)
  → Legal: Cooley LLP (https://cooley.com) | DLA Piper (https://dlapiper.com) | Wilson Sonsini (tech/growth companies)

GROWTH | M&A, market expansion, pricing power, channel development
  → CRM: Salesforce (https://salesforce.com) | HubSpot Sales Hub Enterprise
  → BI: Power BI (~$10/user/mo) | Tableau (https://tableau.com) | Looker (Google)
  → M&A advisory: Raymond James (https://raymondjames.com) | Robert W. Baird (https://rwbaird.com) | Lincoln International (https://lincolninternational.com, $10M–$250M exits)

STRUCTURE | QSBS (Section 1202), C-corp conversion, defined benefit plans, family office
  → Advisory REQUIRED: Withum (https://withum.com) | Aprio (https://aprio.com) | national CPA firm with M&A practice
  → Defined benefit / cash balance plan: October Three (https://octoberthree.com) | Pinnacle Plan Design (https://pinnacleplandesign.com)
  → QSBS structuring: Cooley LLP | Gunderson Dettmer (https://gunderson.com, startup/growth specialist)
  → Banking: JPMorgan Private Client (https://jpmorgan.com) | Silicon Valley Bank / First Citizens (tech focus)

CASH_FLOW | AR >45 days, working capital, credit facility, treasury optimization
  → AR automation: Versapay (https://versapay.com, B2B AR network) | Billtrust (https://billtrust.com)
  → Credit facility: JPMorgan Chase Commercial (https://jpmorgan.com) | Wells Fargo Business Line | Silicon Valley Bank
  → Trade credit insurance: Euler Hermes / Allianz Trade (https://allianz-trade.com) | Coface (https://coface.com)
`.trim();
  }

  return "";
}
