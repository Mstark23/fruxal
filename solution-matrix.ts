// =============================================================================
// SOLUTION MATRIX — finding category × tier × province
//
// Replaces the flat buildSolutionsBlock() function.
// Each cell tells Claude exactly what to recommend (and what NOT to recommend)
// for a specific finding type at a specific business tier.
//
// Usage: inject SOLUTION_MATRIX into each tier's system prompt.
// Claude reads the relevant row for each finding it writes.
// =============================================================================

export function buildSolutionMatrix(
  tier: "solo" | "business" | "enterprise",
  province: string,
  annualRevenue: number,
  employees: number,
  industry: string,
  hasPayroll: boolean,
  doesRd: boolean,
): string {

  // Province-specific overrides injected into relevant cells
  const isQC = province === "QC";
  const isON = province === "ON";
  const isBC = province === "BC";
  const isAB = province === "AB";

  const payrollProvince = isQC
    ? "Must handle QST payroll deductions, CNESST, and CCQ if construction. French interface required."
    : isON ? "Must handle WSIB and EHT (payroll >$1M triggers full EHT). ROE filing mandatory."
    : isBC ? "Must handle WorkSafe BC instead of WSIB. EHT on payroll >$500K."
    : isAB ? "Must handle WCB Alberta. No provincial payroll tax."
    : "Standard provincial payroll compliance required.";

  const taxProvince = isQC
    ? "QST 9.975% applies alongside GST 5%. RS&DE provincial credit (30% refundable for CCPC). French filing obligations."
    : isON ? "HST 13%. Ontario SR&ED credit 3.5% refundable for CCPCs. EHT on payroll >$1M."
    : isBC ? "No HST — PST 7% separate from GST 5%. Self-assess PST on SaaS/imported services."
    : isAB ? "No provincial sales tax. GST 5% only. Provincial corp rate 8%."
    : `Province ${province} — confirm current provincial tax rates.`;

  // ── TIER-SPECIFIC MATRIX ──────────────────────────────────────────────────

  if (tier === "solo") {
    return `
SOLUTION MATRIX — SOLO ($0–$150K, ${employees} employees, ${province})
For each finding you write, pick solutions from the relevant row below.
Max 2 solutions per finding. solutions: [] if no strong match. Never force a recommendation.
The "why" must name the specific problem this fixes for this business — not generic.

TAX findings (GST/HST registration, deductions, structure, CRA):
  Best: Wave Tax (free, built into Wave accounting) | TurboTax Business Self-Employed (~$60/yr, DIY-friendly) | SimpleTax Business
  If near $30K threshold: CRA Business Registration online (free — direct link: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/register.html)
  If incorporation timing: Ownr (https://www.ownr.co, RBC-backed, ON/BC, $499) | Ownco (https://www.ownco.ca, QC French)
  ${isQC ? "QC: Acomba Accounting (French-first, QST-native, https://acomba.com)" : ""}
  Province note: ${taxProvince}
  DO NOT recommend: MNP, BDO, Sage Intacct — overkill for solo tier.

PAYROLL findings (employee misclassification, ROE, CPP/EI):
  ${employees === 0 ? "No employees — focus on contractor vs employee classification risk. Recommend CRA RC4110 review." : ""}
  ${employees > 0 ? `Best: Wagepoint (https://wagepoint.com, Canadian, ~$26/mo base + $4/ee, simplest for <5 employees) | Humi (https://humi.ca, better if 3+ employees and need HR too)` : ""}
  ${isQC ? "QC: Nethris (https://nethris.com, French-first Quebec payroll)" : ""}
  ${payrollProvince}

COMPLIANCE findings (overdue filings, CRA deadlines, registration gaps):
  Best: Ownr (incorporations) | CRA My Business Account (https://www.canada.ca/en/revenue-agency/services/e-services/e-services-businesses/business-account.html — free, set up alerts)
  If bookkeeping gap: Wave (free) | FreshBooks (~$19/mo, best for service sole props)
  DO NOT recommend enterprise compliance software.

OPERATIONS findings (pricing, time tracking, project management):
  Time tracking: Toggl Track (https://toggl.com/track, free tier) | Harvest (https://getharvest.com, ~$12/mo)
  Project mgmt: Notion (free tier) | Trello (free)
  Pricing optimization: no tool — recommend pricing analysis methodology only.

INSURANCE findings (GL, professional liability, equipment, E&O):
  Always first: Zensurance (https://zensurance.com, Canadian, online quote <5 min, covers freelancers/consultants/contractors)
  Alt: BrokerLink (https://brokerlink.ca, broker for complex needs)
  DO NOT recommend: Intact Direct, Aviva — not solo-focused, pricing not competitive at this size.

CONTRACT findings (client agreements, IP ownership, scope creep):
  Best: Bonsai (https://hellobonsai.com, ~$24/mo, contracts + invoicing + proposals for freelancers)
  Free alt: PandaDoc free tier (https://pandadoc.com) | HelloSign (https://hellosign.com, 3 free docs/mo)
  Legal review: Clerky Canada (https://clerky.com) — affordable legal docs

GROWTH findings (pricing, lead gen, referrals, service expansion):
  CRM: HubSpot CRM (https://hubspot.com, genuinely free for solo) | Notion CRM template (free)
  Scheduling: Calendly (https://calendly.com, free tier) | Acuity (https://acuityscheduling.com, ~$20/mo)
  Website: Squarespace (~$23/mo) | Webflow (~$23/mo, more powerful)

STRUCTURE findings (sole prop vs corp, HST registration, fiscal year):
  Incorporation: Ownr (https://ownr.co) | ${isQC ? "Ownco (https://ownco.ca)" : "Legalzoom Canada (https://legalzoom.com/ca)"}
  Accounting pre-incorporation: Wave (free) → transition to QuickBooks Simple Start post-inc
  DO NOT recommend: complex holdco structures, IPP — not applicable at this revenue.

CASH_FLOW findings (late payments, invoicing gaps, AR):
  AR/invoicing: Wave Invoicing (free, instant) | FreshBooks (automated reminders, ~$19/mo)
  Collections: Plooto (https://plooto.com, PAD pull payments, ~$25/mo) — only if recurring B2B billing
  Banking: Neo Financial Business (https://neo.ca/business, no-fee, instant e-transfers)`;
  }

  // ── BUSINESS TIER ─────────────────────────────────────────────────────────
  if (tier === "business") {
    const revM = (annualRevenue / 1_000_000).toFixed(1);
    return `
SOLUTION MATRIX — BUSINESS ($150K–$1M, ${employees} employees, ${province})
For each finding, pick solutions from the relevant row. Max 3 per finding.
The "why" must reference province compliance, employee count, and the specific gap. Not generic.
solutions: [] if no strong match. Rank by fit, not cost.

TAX findings (T4/dividend mix, HST, corporate structure, SR&ED):
  Owner comp optimization: no software — recommend MNP or local CPA for T4/dividend modeling (https://mnp.ca)
  HST/GST: Avalara (https://avalara.com/ca, automated tax compliance, worthwhile at $500K+) | Manual CRA filing for <$500K
  SR&ED: ${doesRd ? "Boast.ai (https://boast.ai, AI-assisted, takes ~15% of credit) | Mentor Works (https://mentorworks.ca, grants + SR&ED combo)" : "Assess eligibility first — CRA SR&ED self-assessment tool at https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program.html"}
  ${isQC ? "QC: Acomba (https://acomba.com) | Revenu Québec My Account (https://www.revenuquebec.ca)" : ""}
  Province note: ${taxProvince}

PAYROLL findings (${employees} employees — ${payrollProvince}):
  ${employees <= 15
    ? "Best fit: Wagepoint (https://wagepoint.com, ~$26/mo + $4/ee, simplest Canadian payroll) | Humi (https://humi.ca, ~$6/ee/mo, better if also need HR features)"
    : "Best fit: Humi (https://humi.ca, ~$6/ee/mo, best Canadian all-in-one for 15–200 employees) | Ceridian PowerPay (https://ceridian.com/ca, strong compliance, better for 20+ employees)"}
  ${isQC ? "QC-specific: Nethris (https://nethris.com) | Folks HR (https://folks.app, bilingual)" : ""}
  ${!hasPayroll ? "No payroll yet — first step: register for a payroll account at CRA (https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/setting-up-payroll.html)" : ""}

COMPLIANCE findings (CRA deadlines, WSIB, provincial registrations):
  Obligation tracking: no SaaS needed — Fruxal already handles this via obligations calendar
  WSIB/WCB: register at province portal — compliance is mandatory, no workaround
  Corporate filings: Ownr (https://ownr.co) | ${isQC ? "Registraire des entreprises (https://www.registreentreprises.gouv.qc.ca)" : "Corporations Canada (https://www.ic.gc.ca/eic/site/cd-dgc.nsf/eng/home)"}

OPERATIONS findings (pricing, margins, process efficiency, vendor costs):
  Accounting (if not yet on proper software): QuickBooks Online (https://quickbooks.intuit.com/ca, $35–$80/mo) | Xero (https://xero.com/ca, $30–$70/mo)
  Inventory: inFlow Inventory (https://inflowinventory.com, $89/mo) | ${industry.toLowerCase().includes("restaurant") ? "MarketMan (https://marketman.com, restaurant-specific inventory)" : "Cin7 (https://cin7.com, multi-channel)"}
  ${industry.toLowerCase().includes("restaurant") || industry.toLowerCase().includes("retail") ? "POS: Lightspeed (https://lightspeedhq.com, Canadian HQ, best for restaurant/retail with inventory) | Square (https://squareup.com/ca, simpler, lower upfront)" : ""}
  Pricing tools: no specific SaaS — recommend margin analysis methodology with current accounting software

INSURANCE findings (GL, professional liability, cyber, key person, D&O):
  Always start: Zensurance (https://zensurance.com, best Canadian SMB specialist, online quote covering GL/professional/cyber/E&O)
  Complex risks: BrokerLink (https://brokerlink.ca) | Intact Business (https://intact.ca/en/business)
  Cyber specifically: Coalition (https://coalitioninc.com, active monitoring + insurance, $500–$2K/yr for SMB)
  Key person: any licensed life insurance broker — recommend Manulife (https://manulife.ca) or Sunlife (https://sunlife.ca)

CONTRACT findings (vendor contracts, client agreements, payment terms):
  E-sign: DocuSign (https://docusign.com/ca, ~$25/mo) | PandaDoc (https://pandadoc.com, better value for SMB)
  Legal review: Clerky Canada | Law firm at 1–2 hrs billable — mention specific provincial bar referral service
  Vendor negotiation: no software — process recommendation only

GROWTH findings (revenue expansion, pricing, sales process, customer retention):
  CRM: HubSpot CRM (https://hubspot.com, free tier excellent for <15 users) | Pipedrive (https://pipedrive.com, ~$15/user/mo, best for sales-led businesses)
  E-commerce: Shopify (https://shopify.ca, $39–$105/mo, Canadian HQ, best product business choice)
  Email marketing: Mailchimp (https://mailchimp.com, free to 500 contacts) | Klaviyo (https://klaviyo.com, better for e-commerce)

STRUCTURE findings (incorporation, holdco, T4 vs dividends, fiscal year):
  Corp structure review: MNP (https://mnp.ca) | BDO Canada (https://bdo.ca) — worth 2-3 hrs advisory at this revenue level
  Accounting upgrade: QuickBooks Online (https://quickbooks.intuit.com/ca) if not already — required before any structure optimization
  Banking for corp: RBC Business (https://rbcroyalbank.com/business) | Scotiabank Business (https://scotiabank.com/business)

CASH_FLOW findings (AR collection, payment terms, working capital):
  B2B collections: Plooto (https://plooto.com, Canadian EFT/PAD pull, $25/mo flat, best for recurring B2B)
  AR automation: FreshBooks (if <$500K revenue, automated reminders built in) | QuickBooks Online AR module
  Business credit line: RBC Flex Line | BDC Working Capital Loan (https://bdc.ca, government-backed, lower rates)`;
  }

  // ── ENTERPRISE TIER ───────────────────────────────────────────────────────
  if (tier === "enterprise") {
    const revM = (annualRevenue / 1_000_000).toFixed(1);
    const evMultiple = annualRevenue > 3_000_000 ? "5–6×" : "4–5×";
    return `
SOLUTION MATRIX — ENTERPRISE ($1M+, ${employees} employees, CCPC, ${province})
For each finding, pick solutions from the relevant row. Max 3 per finding.
The "why" must be CFO-level: ROI calculation, integration depth, Canadian compliance, not just features.
solutions: [] if no strong match. Tax/structure findings should include advisory firms, not just software.
Finding impact >$50K → always include at least 1 solution if a strong category match exists.

TAX findings (salary/dividend mix, RDTOH, CDA, LCGE, passive grind, IPP, estate freeze):
  Advisory (REQUIRED for structural tax findings): MNP LLP (https://mnp.ca, strongest CCPC advisory) | BDO Canada (https://bdo.ca, excellent SR&ED + corporate tax) | RSM Canada (https://rsmcanada.com, mid-market focused)
  Tax software (for accountant): Taxprep (https://taxprep.com, industry standard T2) | Profile by Wolters Kluwer (https://wolterskluwer.com/en-ca)
  ${doesRd ? "SR&ED: Boast.ai (https://boast.ai, AI-assisted, ~15% contingency) | Swifter (https://swifter.ai, flat fee, better for predictable claims) | Mentor Works (https://mentorworks.ca, grants + SR&ED)" : ""}
  ${isQC ? "QC: Revenu Québec RS&DE (30% refundable provincial credit) — MNP or Richter (https://richter.ca) for QC CCPC advisory" : ""}
  Province note: ${taxProvince}
  DO NOT recommend: TurboTax, Wave Tax — not appropriate for CCPC at this level.

PAYROLL findings (${employees} employees — ${payrollProvince}):
  ${employees >= 50
    ? "Best: Ceridian Dayforce (https://ceridian.com/ca/dayforce, full HCM, best for 50+ employees, Canadian company) | ADP Workforce Now (https://adp.com/ca, global standard, excellent compliance team)"
    : employees >= 20
    ? "Best: Ceridian PowerPay (https://ceridian.com/ca/powerpay) | Humi (https://humi.ca, ~$6/ee/mo, best Canadian for 20–150 employees)"
    : "Best: Humi (https://humi.ca, most feature-complete Canadian option at this size) | Ceridian PowerPay"}
  Group benefits (if not in place): Manulife GroupBenefits (https://manulife.ca/group-benefits) | Canada Life (https://canadalife.com/group-benefits) | Sunlife (https://sunlife.ca/en/group-benefits)
  ${isQC ? "QC: Folks HR (https://folks.app, bilingual) | Nethris (https://nethris.com, QC payroll specialist)" : ""}

COMPLIANCE findings (CRA audit exposure, director liability, provincial registrations):
  Corporate governance: Diligent (https://diligent.com, board management) — relevant if board exists
  Document management: NetDocuments (https://netdocuments.com) | iManage (https://imanage.com)
  CRA audit support: MNP Tax Controversy (https://mnp.ca) | Thorsteinssons LLP (tax litigation specialists)
  WSIB/WCB optimization: specialized broker can reclassify rate class — BrokerLink (https://brokerlink.ca)

OPERATIONS findings (ERP, process inefficiency, vendor contracts, margin leakage):
  ERP (if not yet implemented): Sage Intacct (https://sageintacct.com, best for $2M–$50M multi-entity) | NetSuite (https://netsuite.com, scales to $500M+, higher cost/complexity) | Microsoft Dynamics 365 BC (https://dynamics.microsoft.com/en-ca, strong manufacturing/distribution)
  Current accounting upgrade: Xero (https://xero.com/ca) if under $3M and single entity | QuickBooks Online Advanced (https://quickbooks.intuit.com/ca) for $1M–$3M
  Procurement: Procurify (https://procurify.com, Canadian company, spend management)
  ${industry.toLowerCase().includes("manufactur") ? "Manufacturing ERP: Epicor (https://epicor.com/ca) | Infor LN (https://infor.com)" : ""}

INSURANCE findings (commercial lines, cyber, D&O, key person, business interruption):
  Commercial P&C: Intact Commercial (https://intact.ca/en/business, largest Canadian P&C) | Aviva Canada (https://aviva.ca/en/business) — broker access only
  Cyber: Coalition (https://coalitioninc.com, active monitoring + insurance, right-sized for $1M–$20M) | Beazley (https://beazley.com, specialist for larger cyber risk)
  D&O: AXA XL (https://axaxl.com) | Chubb Canada (https://chubb.com/ca) — through commercial broker
  Key person life: Manulife (https://manulife.ca) | Canada Life — fund with corporate-owned life insurance (COLI) for tax efficiency
  Broker for all above: BrokerLink (https://brokerlink.ca) | HUB International (https://hubinternational.com/ca)

CONTRACT findings (vendor leverage, client terms, IP protection, licensing):
  CLM (Contract Lifecycle Management): DocuSign CLM (https://docusign.com/products/contract-lifecycle-management) | Ironclad (https://ironcladapp.com)
  Legal: Canadian IP and commercial law firm — Norton Rose Fulbright (https://nortonrosefulbright.com/en-ca) | Gowling WLG (https://gowlingwlg.com/en/canada)
  E-sign: DocuSign (https://docusign.com/ca) — standard at enterprise level

GROWTH findings (market expansion, pricing power, M&A, channel development):
  CRM: Salesforce (https://salesforce.com/ca, standard for >20 sales users) | HubSpot Sales Hub (https://hubspot.com/products/sales, better value at <20 users)
  Business intelligence: Tableau (https://tableau.com) | Power BI (https://powerbi.microsoft.com, better value, deep Microsoft integration)
  M&A advisory: CIBC Capital Markets (https://cibcwm.com) | Raymond James Canada (https://raymondjames.ca, independent, better for <$50M transactions) | MNP Corporate Finance (https://mnp.ca)

STRUCTURE findings (holdco, estate freeze, LCGE optimization, intercorporate dividends, IPP):
  Tax advisory (REQUIRED): MNP LLP (https://mnp.ca) | BDO Canada (https://bdo.ca) | Richter (https://richter.ca, strong in QC and ON)
  IPP actuarial: Morneau Shepell / TELUS Health (https://telushealth.com) | Mercer Canada (https://mercer.com/ca) — actuarial required for IPP
  Family trust/holdco setup: any national law firm with tax group — Bennett Jones (https://bennettjones.com) | Stikeman Elliott (https://stikeman.com)
  Banking (holdco accounts): RBC Commercial (https://rbcroyalbank.com/commercial) | BMO Commercial (https://bmo.com/commercial)

CASH_FLOW findings (working capital, AR >45 days, credit facility, payment terms):
  AR automation: Versapay (https://versapay.com, network-based AR, best for B2B $5M+) | Esker (https://esker.ca, AP/AR automation)
  Credit facility: BDC (https://bdc.ca, government-backed, better rates for CCPCs) | RBC Commercial credit line | ATB Business (AB only)
  Treasury: RBC Treasury Management | BMO Treasury — relevant if holding significant cash reserves
  Collections: Euler Hermes Canada (https://eulerhermes.ca, trade credit insurance + collections) for large outstanding AR`;
  }

  return "";
}
