// =============================================================================
// lib/ai/prompts/diagnostic/execution.ts
//
// Execution playbook prompt — called AFTER the diagnostic completes.
// Takes findings from the diagnostic and returns a step-by-step execution
// plan per finding that our accountant/rep can action directly.
//
// Separate from the diagnostic prompt so it never slows down the main run.
// =============================================================================

export interface ExecutionFinding {
  id:         string;
  title:      string;
  category:   string;
  severity:   string;
  impact_max: number;
  recommendation?: string;
  calculation_shown?: string;
  cpa_briefing?: {
    forms_to_discuss?: string[];
  };
}

export interface BusinessContext {
  business_name:   string;
  industry:        string;
  province:        string;
  annual_revenue:  number;
  structure:       string;
  has_accountant:  boolean;
  owner_name?:     string;
  country?:  'CA' | 'US';
}

export function buildExecutionPrompt(
  findings:  ExecutionFinding[],
  ctx:       BusinessContext,
  language:  string = "en"
): string {
  const isFr = language === "fr";

  const findingsJson = JSON.stringify(
    findings.map(f => ({
      id:              f.id,
      title:           f.title,
      category:        f.category,
      severity:        f.severity,
      amount:          f.impact_max,
      recommendation:  f.recommendation || "",
      calculation:     f.calculation_shown || "",
    })),
    null, 2
  );

  const provinceNote = (() => {
    switch (ctx.province) {
      case "QC": return "QST + GST. Revenu Québec handles provincial. RS&DE 30% provincial credit.";
      case "ON": return "HST 13%. WSIB. EHT on payroll >$1M.";
      case "BC": return "PST 7% + GST 5%. WorkSafe BC.";
      case "AB": return "GST only. Corporate rate 8%. WCB Alberta.";
      default:   return `${ctx.province}: apply standard federal rules + provincial rates.`;
    }
  })();

  const isUS = ctx?.country === "US";
  return `You are a ${isUS ? "US" : "Canadian"} forensic accountant executing a business recovery engagement for ${ctx.business_name}, a ${ctx.industry} in ${ctx.province} with $${ctx.annual_revenue.toLocaleString()} annual revenue (${ctx.structure}).

Province context: ${provinceNote}
${ctx.has_accountant ? "Client has an existing accountant — coordinate, don't replace." : "No accountant on file — we handle all CRA interaction directly."}

Your job: for each finding below, write the COMPLETE execution plan our team will follow to recover this money. Be specific. Name the actual CRA form. Write the actual letter. Give the actual phone number. This goes directly to our accountant's desk.

FINDINGS TO ACTION:
${findingsJson}

For each finding, return ONE object with these fields:
- finding_id: string (match the id from input)
- execution_steps: string[] — numbered steps our accountant follows start to finish. Be specific: "Call CRA Business Enquiries at 1-800-959-5525, select option 2..." not "Contact CRA". Minimum 3 steps, maximum 8.
- documents_needed: string[] — exact documents to request from client. e.g. "T2 corporate return 2022 and 2023", not "tax returns".
- draft_template: string — the ACTUAL text of the letter, email, or script to use. Include placeholders like [CLIENT_NAME], [CRA_BN], [DATE]. This must be ready to send after filling in placeholders. For CRA calls: write the script. For vendor negotiations: write the email. For grant applications: write the cover letter.
- cra_forms: string[] — specific CRA/Revenu Québec form codes if applicable (e.g. "T661", "RC4288", "T2 Schedule 8"). Empty array if no forms.
- who_executes: "accountant" | "rep" | "client" — who on our team takes the lead.
- estimated_hours: number — realistic hours to complete this finding end to end.
- quick_win: boolean — true if this can be actioned within 1 week with minimal back-and-forth.

RULES:
1. draft_template must be COMPLETE text, not a description. If it's a CRA call: write every sentence of the script. If it's an email: write subject + full body.
2. execution_steps must be in chronological order — what happens first, second, third.
3. documents_needed must be document names a business owner understands, not accounting jargon.
${isUS ? "" : "4. For QC findings: reference Revenu Québec where applicable, not just CRA."}
5. who_executes = "client" only if the client must do it themselves (e.g. open a bank account).
6. Never say "consult a professional" — WE are the professional.

RESPOND WITH ONLY A VALID JSON ARRAY — no markdown, no preamble:
[{ "finding_id": "...", "execution_steps": [...], "documents_needed": [...], "draft_template": "...", "cra_forms": [...], "who_executes": "...", "estimated_hours": ..., "quick_win": ... }]`;
}
