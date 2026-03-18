/**
 * Auto-categorize transactions by description keywords
 * Rules-based first pass. Can be enhanced with AI later.
 */

interface CatRule {
  code: string;
  patterns: RegExp[];
}

const RULES: CatRule[] = [
  // Income
  { code: "revenue",           patterns: [/e-?transfer.*received/i, /deposit/i, /payment.*received/i, /sale/i, /invoice.*paid/i, /stripe.*payout/i, /square.*payout/i, /shopify.*payout/i] },
  { code: "refund_received",   patterns: [/refund.*received/i, /credit.*applied/i] },

  // Rent
  { code: "rent",              patterns: [/rent/i, /loyer/i, /lease/i, /bail/i, /landlord/i, /property.*management/i] },
  { code: "chair_rent",        patterns: [/chair.*rent/i, /station.*rent/i, /booth.*rent/i] },

  // Payroll
  { code: "payroll",           patterns: [/payroll/i, /salary/i, /wages/i, /paie/i, /salaire/i, /adp/i, /ceridian/i, /wagepoint/i] },

  // Processing
  { code: "processing_fees",   patterns: [/stripe.*fee/i, /square.*fee/i, /moneris/i, /clover.*fee/i, /processing.*fee/i, /merchant.*fee/i, /transaction.*fee/i, /pos.*fee/i, /interchange/i, /desjardins.*frais/i] },

  // Insurance
  { code: "insurance",         patterns: [/insurance/i, /assurance/i, /intact/i, /aviva/i, /wawanesa/i, /desjardins.*assur/i, /premium/i] },

  // Utilities
  { code: "utilities",         patterns: [/hydro/i, /électricité/i, /electricity/i, /gas\b/i, /internet/i, /bell\b/i, /rogers/i, /telus/i, /videotron/i, /water/i, /phone/i, /cell/i, /fido/i, /koodo/i] },

  // Software
  { code: "software",          patterns: [/adobe/i, /microsoft/i, /google.*workspace/i, /slack/i, /zoom/i, /canva/i, /mailchimp/i, /hubspot/i, /quickbooks/i, /wave.*app/i, /freshbooks/i, /xero/i, /shopify.*subscription/i, /subscription/i, /saas/i, /app.*store/i, /icloud/i, /dropbox/i, /notion/i] },

  // Marketing
  { code: "marketing",         patterns: [/facebook.*ad/i, /meta.*ad/i, /google.*ad/i, /instagram.*ad/i, /tiktok.*ad/i, /advertising/i, /publicité/i, /marketing/i, /promo/i, /campaign/i] },

  // Fuel
  { code: "fuel",              patterns: [/gas\s*station/i, /shell/i, /petro/i, /esso/i, /ultramar/i, /fuel/i, /diesel/i, /carburant/i, /couche.?tard/i, /circle.*k/i] },

  // Food / COGS
  { code: "food_cost",         patterns: [/sysco/i, /gfs/i, /costco.*business/i, /wholesale.*food/i, /supplier/i, /fournisseur/i, /provisions/i] },

  // Supplies
  { code: "supplies",          patterns: [/supplies/i, /fournitures/i, /office.*depot/i, /staples/i, /bureau.*gros/i, /materials/i, /matériaux/i, /home.*depot/i, /rona/i, /lowes/i] },

  // Tools & Equipment
  { code: "tools_equipment",   patterns: [/equipment/i, /équipement/i, /tools/i, /outils/i, /amazon.*business/i] },

  // Bank fees
  { code: "bank_fees",         patterns: [/bank.*fee/i, /service.*charge/i, /monthly.*fee/i, /account.*fee/i, /frais.*bancaire/i, /nsf/i, /overdraft/i] },

  // Professional fees
  { code: "professional_fees", patterns: [/accounting/i, /comptable/i, /lawyer/i, /avocat/i, /legal/i, /consultant/i, /bookkeep/i] },

  // Taxes
  { code: "taxes",             patterns: [/tax.*payment/i, /cra/i, /revenu.*québec/i, /gst.*remit/i, /qst.*remit/i, /hst.*remit/i, /payroll.*remit/i, /impôt/i] },

  // Maintenance
  { code: "maintenance",       patterns: [/repair/i, /réparation/i, /maintenance/i, /entretien/i, /cleaning/i, /nettoyage/i, /plumb/i, /electric.*repair/i] },

  // Travel
  { code: "travel",            patterns: [/airline/i, /air.*canada/i, /hotel/i, /airbnb/i, /uber(?!.*eat)/i, /lyft/i, /taxi/i, /meal/i, /restaurant/i, /travel/i] },

  // Owner draw
  { code: "owner_draw",        patterns: [/owner.*draw/i, /distribution/i, /personal.*transfer/i, /retrait.*propriétaire/i] },

  // Transfer
  { code: "transfer",          patterns: [/transfer.*between/i, /internal.*transfer/i, /virement/i, /e-?transfer.*sent/i] },
];

export interface CategorizedTransaction {
  category_code: string | null;
  confidence: "high" | "medium" | "low";
}

export function categorizeTransaction(description: string): CategorizedTransaction {
  const desc = description.toLowerCase();

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(desc)) {
        return { category_code: rule.code, confidence: "high" };
      }
    }
  }

  // Simple negative = expense heuristic
  return { category_code: null, confidence: "low" };
}

/**
 * Batch categorize
 */
export function categorizeBatch(
  transactions: Array<{ description: string; amount: number }>
): Array<CategorizedTransaction> {
  return transactions.map(tx => {
    const result = categorizeTransaction(tx.description);
    // If not categorized, use amount sign as hint
    if (!result.category_code) {
      if (tx.amount > 0) {
        return { category_code: "revenue", confidence: "low" as const };
      } else {
        return { category_code: "other_expense", confidence: "low" as const };
      }
    }
    return result;
  });
}
