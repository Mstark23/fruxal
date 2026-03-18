# Changes to app/api/v2/diagnostic/run/route.ts

## 1. DELETE the entire affiliate fetch block (~lines 585–598)

Remove this:
```typescript
let affiliates: any[] = [];
try {
  const { data } = await supabaseAdmin.from("affiliate_partners")
    .select("slug, name, name_fr, description, description_fr, category")
    .eq("is_government_program", false)
    .order("priority_score", { ascending: false }).limit(30);
  affiliates = data || [];
} catch {}
```

And remove this line (~line 622):
```typescript
const affiliateList = affiliates.slice(0, 15).map((a) =>
  `• [${a.slug}] ${a.name} (${a.category})`).join("\n");
```

And remove `affiliateList` from the diagCtx object.

## 2. UPDATE DiagCtx interface — remove affiliateList field

```typescript
// REMOVE this line from interface DiagCtx:
affiliateList: string;
```

## 3. UPDATE buildJSONSchema — replace partner_slugs with solutions[]

Find:
```
      \"partner_slugs\":  [],
      \"program_slugs\":  []
```

Replace with:
```
      \"solutions\": [
        {
          \"name\":         \"<tool or service name — real product that exists>\",
          \"url\":          \"<direct product URL — must be real and reachable>\",
          \"why\":          \"<one sentence: why this specific tool for this specific business>\",
          \"price_approx\": \"<e.g. Free, ~$20/mo, ~$6/employee/mo, Custom>\",
          \"category\":     \"<payroll|accounting|insurance|banking|hr|payments|collections|tax|legal|other>\"
        }
      ],
      \"program_slugs\":  []
```

## 4. UPDATE all three system prompts — remove affiliateList injection, add solution instruction

In buildSoloPrompts, buildBusinessPrompts, buildEnterprisePrompts,

REMOVE this section from each system prompt:
```
AFFILIATE PARTNERS (use slugs in partner_slugs):
${affiliateList || "None"}
```

ADD this section to each system prompt instead (tier-specific version below):

### For buildSoloPrompts:
```
SOLUTION RECOMMENDATIONS:
For each finding, populate the solutions[] array with 1–3 real Canadian tools or services that directly fix the issue.
You know these tools from your training — use that knowledge. Do not make up products.

Guidelines for solo/micro businesses:
- Accounting: Wave (free, Canadian), QuickBooks Self-Employed (~$20/mo), FreshBooks (~$19/mo)
- Banking: Neo Financial Business (no-fee), Tangerine Business, Desjardins (QC)
- Invoicing: Invoice Ninja (free), FreshBooks, Bonsai
- Tax: TurboTax Business, TaxCycle (accountant-grade), SimpleTax
- Insurance: Zensurance (Canadian SMB specialist), BrokerLink
- Incorporation: Ownr (RBC-backed), Legalzoom Canada, Ownco
- Expense: Dext (receipt scanning), Hubdoc (free with QBO)
- Contracts: Bonsai, AND.CO, HelloSign

RULES:
- Only include solutions where you are confident the URL and product are real.
- Prefer Canadian-first. US tools only if no Canadian equivalent.
- solutions[] can be empty [] if no strong tool match exists for a finding.
- Never include a solution just to fill the field — only when it genuinely helps.
- url must be the direct homepage or signup page (e.g. "https://wave.com", "https://zensurance.com").
```

### For buildBusinessPrompts:
```
SOLUTION RECOMMENDATIONS:
For each finding, populate the solutions[] array with 1–3 real tools or services that directly address the issue.
You have deep knowledge of Canadian business software — use it. Do not hallucinate products.

Guidelines for small businesses ($150K–$1M, ${employees} employees, ${province}):
- Payroll: Humi (Canadian, ~$6/ee/mo), Wagepoint (Canadian), Knit (Canadian), ADP Run
- Accounting: QuickBooks Online, Xero, Sage 50, Wave (if <$250K)
- HR: Humi, BambooHR, Collage HR (Canadian)
- Payments/POS: Moneris (Canadian), Square, Lightspeed (Canadian, esp. retail/restaurant)
- Collections/AR: Plooto (Canadian EFT), Versapay, Rotessa (Canadian PAD)
- Insurance: Zensurance, Intact Business, BrokerLink
- Expense: Dext, Ramp (US but available in CA), Brex
- E-commerce: Shopify (Canadian HQ)
- Inventory: inFlow, Fishbowl, DEAR Inventory
- Banking: RBC Business, BMO Business, Scotiabank Business, HSBC Business

Province-specific (${province}):
${province === "QC" ? "- QST tools: Acomba (QC-specific accounting), Avantage (QC payroll), Revenu Québec My Account" : ""}
${province === "ON" ? "- WSIB: wsib.ca for registration, Ceridian for WSIB/EHT management" : ""}
${province === "BC" ? "- PST: eTaxBC for PST returns, Avalara for automated tax compliance" : ""}

RULES:
- Payroll findings → always include a payroll solution if employees > 0.
- Insurance findings → always include Zensurance (they cover 99% of Canadian SMB needs).
- solutions[] can be empty [] if no strong match — never force a recommendation.
- url must be real and direct (e.g. "https://humi.ca", "https://plooto.com").
- Max 3 solutions per finding. Prioritize Canadian tools.
```

### For buildEnterprisePrompts:
```
SOLUTION RECOMMENDATIONS:
For each finding, populate the solutions[] array with 1–3 enterprise-grade tools or advisors that address the issue.
You understand the Canadian enterprise software landscape deeply. Do not hallucinate products or pricing.

Guidelines for owner-managed corps ($1M+, ${employees} employees, ${province}):
- Payroll: Ceridian Dayforce, ADP Workforce Now, Humi (up to ~200 employees)
- Accounting/ERP: Sage Intacct, NetSuite, Microsoft Dynamics 365, Sage 300
- Tax planning: MNP LLP, BDO Canada, RSM Canada (advisory), Taxprep software
- Banking: RBC Commercial, TD Business, BMO Commercial, ATB (AB), Desjardins (QC)
- Insurance: Intact Commercial, Aviva Canada, AXA XL, Beazley (cyber)
- HR/Benefits: Manulife GroupBenefits, Canada Life, Sunlife (group benefits)
- Payments: Moneris Enterprise, Stripe Connect, Nuvei (Canadian payments co.)
- Cybersecurity: Coalition Insurance, Beazley, Chubb Cyber
- Succession/exit: MNP Corporate Finance, Deloitte Private, Raymond James Canada
- Collections: Versapay, YOURfinance, Esker (AR automation)
- SR&ED: Boast.ai (SR&ED specialist), Swifter (SR&ED filing), Mentor Works

RULES:
- For findings >$50K impact, always include at least 1 solution if a strong match exists.
- Tax/structure findings → reference an advisory firm, not just software.
- solutions[] empty [] is acceptable — don't force low-confidence recommendations.
- url must be real (e.g. "https://ceridian.com", "https://mnp.ca", "https://boast.ai").
- Max 3 solutions per finding.
```

## Summary of what this achieves

| Before | After |
|---|---|
| DB fetch of 30 generic partners | No DB fetch at all |
| Claude picks from a slug list | Claude reasons from full business context |
| `partner_slugs: ["wave"]` → resolve API call → render | `solutions: [{name, url, why}]` → render directly |
| Same options regardless of province/industry | Province, tier, industry, employees all influence picks |
| Stale if DB has bad data | Always current — Claude's training knowledge |
| Extra API call per finding in report viewer | Zero extra calls — data baked into report JSON |
