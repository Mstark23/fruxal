// =============================================================================
// lib/ai/prompts/diagnostic/schema.ts
//
// Single source of truth for the diagnostic JSON output schema.
// Used by all three tier prompts. Tier determines min counts.
//
// IMPORTANT: Field names here must match the enterprise dashboard reads exactly.
// partner_slugs is REMOVED — replaced by solutions[].
// =============================================================================

export type DiagnosticTier = "solo" | "business" | "enterprise";

export function buildDiagnosticSchema(tier: DiagnosticTier, maxFindings: number, country: "CA" | "US" = "CA"): string {
  const minRisk  = tier === "enterprise" ? 5 : tier === "business" ? 4 : 3;
  const minBench = tier === "enterprise" ? 6 : tier === "business" ? 5 : 4;
  const minSeq   = tier === "enterprise" ? 6 : tier === "business" ? 5 : 3;
  const minCpa   = tier === "enterprise" ? 4 : 2;

  const isUS = country === "US";
  const cpaForms  = isUS
    ? '"<real IRS form e.g. Form 1120-S, W-2, 941, 940, 6765, 8850, 4562, Schedule K-1>"'
    : '"<real CRA form e.g. T2 Schedule 1, T661, RC4288, T4, T5, RC7004>"';
  const ccpcFields = isUS
    ? `    "qsbs_plan":        "<Section 1202 QSBS eligibility analysis or 'N/A'>",
    "entity_structure": "<S-corp/C-corp/LLC optimization recommendation or 'N/A'>",`
    : `    "rdtoh_strategy":   "<assessed value or 'N/A'>",
    "cda_strategy":     "<assessed value or 'N/A'>",
    "lcge_plan":        "<assessed value or 'N/A'>",`;

  return `{
  "scores": {
    "overall":        <0-100>,
    "compliance":     <0-100>,
    "efficiency":     <0-100>,
    "optimization":   <0-100>,
    "growth":         <0-100>,
    "bankability":    <0-100>,
    "exit_readiness": <0-100>
  },

  "savings_anchor": {
    "headline":       "<e.g. '$47,200/yr recoverable from 5 leaks' — must be the exact sum from findings>",
    "description":    "<name the #1 finding and its dollar amount — e.g. 'S-Corp election alone saves $14,280/yr in FICA'>",
    "description_fr": "<French>"
  },

  "executive_summary":    "<3-4 sentences. Sentence 1: 'Your [industry] in [province/state] is losing $[exact total]/yr across [N] fixable leaks.' Sentence 2: Name the two biggest findings with their dollar amounts. Sentence 3: 'The most urgent: [finding] — costs you $X for every month you wait.' Sentence 4: '[Form/action] this week starts the recovery.' NEVER open with 'Based on our analysis' or any filler. NEVER use the word 'consider'. This reads like a text message from a $500/hr CFO to the owner.>",
  "executive_summary_fr": "<French — SAME structure, SAME specificity, SAME urgency. Quebec French. Vous not tu.>",

  "totals": {
    "annual_leaks":            <sum of all finding impact_max>,
    "potential_savings":       <conservative achievable total>,
    "ebitda_impact":           <total EBITDA improvement across all findings>,
    "enterprise_value_impact": <total EV uplift across all findings>,
    "penalty_exposure":        <compliance risk dollar total>,
    "programs_value":          <sum of matched government program values>
  },

  "cpa_briefing": {
    "intro":     "<${minCpa >= 4 ? "3-4" : "2-3"} sentence CPA-level summary — English>",
    "intro_fr":  "<French>",
    "talking_points": [
      { "point": "<specific agenda item — English>", "point_fr": "<French>" }
    ],
    "key_findings":     ["<one-line summary of finding>"],
    "forms_to_discuss": [${cpaForms}],
    "tax_exposures":    "<specific tax risk with dollar amount — English>",
    "tax_exposures_fr": "<French>",
${ccpcFields}
    "questions_to_ask": ["<specific question for their accountant>"]
  },

  "risk_matrix": [
    {
      "area":              "<English risk area>",
      "area_fr":           "<French>",
      "risk_level":        "<critical|high|medium|low>",
      "likelihood":        "<low|medium|high|critical>",
      "impact":            "<low|medium|high|critical>",
      "current_status":    "<what the data shows — English>",
      "current_status_fr": "<French>",
      "recommendation":    "<specific mitigation action — English>",
      "recommendation_fr": "<French>"
    }
  ],

  "benchmark_comparisons": [
    {
      "metric_name":      "<English metric name>",
      "metric_name_fr":   "<French>",
      "your_value":       "<formatted string e.g. '18.3%'>",
      "industry_avg":     "<formatted string>",
      "top_quartile":     "<formatted string>",
      "your_value_raw":   <plain number — required for chart rendering>,
      "top_quartile_raw": <plain number — required for chart rendering>,
      "lower_is_better":  <true|false>,
      "gap":              "<one sentence gap analysis — English>",
      "gap_fr":           "<French>",
      "status":           "<above|at|below>"
    }
  ],

  "exit_readiness": {
    "score":          <0-100>,
    "value_killers":  [{ "issue": "<string>", "valuation_discount": <number> }],
    "value_builders": [{ "strength": "<string>", "valuation_premium_label": "<e.g. +$200K>", "valuation_premium_amount": <number> }],
    "next_step":      "<single most important action>"
  },

  "priority_sequence": [
    {
      "rank":                         <1-${minSeq}>,
      "action":                       "<specific action title — English>",
      "action_fr":                    "<French>",
      "why_first":                    "<why this rank — what it unlocks + cost of each month of delay — English>",
      "why_first_fr":                 "<French>",
      "expected_result":              "<measurable outcome: 'File Form 2553 → saves $1,190/mo starting next quarter' — English>",
      "monthly_cost_of_delay":        <number — what this inaction costs per month>,
      "deadline":                     "<specific deadline if applicable, e.g. 'March 15 for calendar year S-corp election' or null>",
      "ebitda_improvement":           <number>,
      "enterprise_value_improvement": <number>
    }
  ],

  "findings": [
    {
      "id":          "<e.g. F-001>",
      "category":    "<tax|payroll|compliance|operations|insurance|contract|growth|structure|cash_flow>",
      "severity":    "<critical|high|medium|low>",
      "effort":      "<low|medium|high>",
      "title":       "<English — must state the dollar opportunity or specific risk — NOT a category name>",
      "title_fr":    "<French>",
      "description": "<English — show exact calculation with this business's actual numbers>",
      "description_fr":  "<French>",
      "impact_min":  <number — conservative>,
      "impact_max":  <number — optimistic>,
      "ebitda_improvement":           <number — REQUIRED on every finding>,
      "enterprise_value_improvement": <number — REQUIRED on every finding>,
      "calculation_shown":  "<step-by-step arithmetic: 'Current: $X × rate = $Y. Optimal: $X × rate = $Z. Delta: $Y − $Z = saving.'>",
      "root_cause":         "<what specifically caused this leak — NOT a category, but a specific business decision or gap>",
      "root_cause_fr":      "<French>",
      "recommendation":     "<2-3 numbered steps with specific form numbers/deadlines. Step 1 = actionable this week.>",
      "recommendation_fr":  "<French>",
      "compliance_risk":    "<consequence of NOT fixing this — penalty amount or regulatory exposure>",
      "second_order_effects":    "<plain string — what fixing this unlocks downstream — NOT an array>",
      "second_order_effects_fr": "<plain string — French>",
      "confidence_level":   "<high|medium|low — based on data quality>",
      "data_source":        "<which input fields drove this finding>",
      "cost_of_inaction_monthly": <number — impact_max ÷ 12 = dollars lost per month of delay>,
      "cost_of_inaction_90_days": <number — 3 months of inaction cost, used for urgency display>,
      "is_red_flag":        <true|false — true if this triggers a red flag from the detector>,
      "cascade_unlocks":    "<what additional savings become possible after fixing this — or null>",
      "timeline":  "<immediate|30days|90days|6months|12months>",
      "solutions": [
        {
          "name":         "<real product or firm name>",
          "url":          "<real homepage or signup URL — use domain root if unsure of exact path>",
          "why":          "<one sentence: why this specific tool for this specific business — province + industry + what it fixes>",
          "price_approx": "<e.g. Free, ~$19/mo, ~$6/employee/mo, Custom quote>",
          "category":     "<payroll|accounting|insurance|banking|hr|payments|tax|legal|other>"
        }
      ],
      "program_slugs": []
    }
  ]
}`;
}
