/**
 * PRESCAN DATA VALIDATOR
 * 
 * Quality gate between the 5-question chat and the analysis engine.
 * Validates all collected tags for completeness, consistency, and plausibility.
 * Returns specific issues that the AI can use to ask the user for corrections.
 */

export interface ValidationIssue {
  field: string;
  severity: 'missing' | 'invalid' | 'suspicious';
  message_en: string;
  message_fr: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  correctedTags: Record<string, any>; // Auto-corrected values where possible
}

// Revenue reasonableness ranges by tier
const REVENUE_RANGES: Record<string, { min: number; max: number }> = {
  solo: { min: 5000, max: 300000 },
  small: { min: 30000, max: 2000000 },
  growth: { min: 100000, max: 50000000 },
};

// Industry-specific mandatory fields
const INDUSTRY_EXPECTED_FIELDS: Record<string, string[]> = {
  restaurant: ['payment_mix'],
  barber_shop: ['payment_mix'],
  trucking: ['payment_mix'],
  rideshare_driver: ['payment_mix'],
  retail: ['payment_mix'],
  construction: ['payment_mix'],
  professional_services: ['payment_mix'],
};

export function validatePrescanData(tags: Record<string, any>): ValidationResult {
  const issues: ValidationIssue[] = [];
  const correctedTags = { ...tags };

  // ════════════════════════════════════════════════════════════════════
  // 1. CRITICAL MISSING FIELDS
  // ════════════════════════════════════════════════════════════════════

  // Business type is absolutely required
  if (!tags.business_type) {
    issues.push({
      field: 'business_type',
      severity: 'missing',
      message_en: 'What type of business do you run?',
      message_fr: 'Quel type d\'entreprise avez-vous ?',
    });
  }

  // Revenue is required — check multiple possible tag names
  const revenue = tags.set_revenue || tags.set_annual_revenue || tags.annual_revenue;
  const revenueBand = tags.revenue_band;
  if (!revenue && !revenueBand) {
    issues.push({
      field: 'revenue',
      severity: 'missing',
      message_en: 'How much revenue do you make per year approximately?',
      message_fr: 'Environ combien de revenus faites-vous par année ?',
    });
  }

  // Payment mix is needed for processing detector — only required for payment-heavy industries
  const processingIndustries = ['restaurant', 'retail', 'barber_shop', 'trucking', 'rideshare_driver',
    'construction', 'cafe', 'food_truck', 'beauty_salon', 'auto_repair', 'gym'];
  const needsPaymentMix = processingIndustries.some(ind => 
    (tags.business_type || '').toLowerCase().includes(ind)
  );
  if (needsPaymentMix && !tags.payment_mix) {
    issues.push({
      field: 'payment_mix',
      severity: 'missing',
      message_en: 'How do your customers mostly pay — cash, card, or a mix?',
      message_fr: 'Vos clients paient comment en général — comptant, carte, ou un mélange ?',
    });
  }

  // Main costs helpful but not blocking — engine can work without it
  // if (!tags.main_costs) { /* non-blocking */ }

  // ════════════════════════════════════════════════════════════════════
  // 2. REVENUE PLAUSIBILITY
  // ════════════════════════════════════════════════════════════════════

  if (revenue && !revenueBand) {
    const numRevenue = typeof revenue === 'string' ? parseInt(revenue.replace(/[,$ ]/g, ''), 10) : revenue;

    // Check if revenue is unreasonably low (might be monthly instead of annual)
    if (numRevenue > 0 && numRevenue < 5000) {
      issues.push({
        field: 'revenue',
        severity: 'suspicious',
        message_en: `You mentioned $${(numRevenue ?? 0).toLocaleString()} — is that per year or per month?`,
        message_fr: `Vous avez mentionné ${(numRevenue ?? 0).toLocaleString()} $ — c'est par année ou par mois ?`,
      });
    }

    // Check if revenue is unreasonably high for a prescan user
    if (numRevenue > 50000000) {
      issues.push({
        field: 'revenue',
        severity: 'suspicious',
        message_en: `$${(numRevenue ?? 0).toLocaleString()} per year — just confirming, that's the right number?`,
        message_fr: `${(numRevenue ?? 0).toLocaleString()} $ par année — je veux juste confirmer que c'est le bon chiffre ?`,
      });
    }

    // Auto-correct: if they said something like "5000" and it seems monthly
    // We'll let the AI handle this through the follow-up question
  }

  // ════════════════════════════════════════════════════════════════════
  // 3. CROSS-VALIDATION CHECKS
  // ════════════════════════════════════════════════════════════════════

  // Trucking/delivery without fuel or vehicle costs mentioned
  const businessType = (tags.business_type || '').toLowerCase();
  const mainCosts = (tags.main_costs || '').toLowerCase();
  const isFuelBusiness = ['truck', 'camion', 'transport', 'delivery', 'livraison', 'courier', 'uber', 'taxi', 'rideshare']
    .some(k => businessType.includes(k));
  
  if (isFuelBusiness && mainCosts && !['fuel', 'essence', 'gas', 'carburant', 'vehicle', 'vehicule'].some(k => mainCosts.includes(k))) {
    // Not an error — just flag for the AI to consider
    correctedTags._hint_fuel_business = true;
  }

  // Restaurant without food cost data
  const isFoodBusiness = ['restaurant', 'resto', 'cafe', 'café', 'bakery', 'boulangerie', 'food', 'traiteur', 'catering']
    .some(k => businessType.includes(k));
  
  if (isFoodBusiness && !tags.food_cost_pct) {
    correctedTags._hint_food_business = true;
  }

  // ════════════════════════════════════════════════════════════════════
  // 4. PAYMENT MIX VALIDATION
  // ════════════════════════════════════════════════════════════════════

  if (tags.payment_mix) {
    const pm = tags.payment_mix.toLowerCase();
    // Check for ambiguous values the AI might have set
    if (['yes', 'no', 'oui', 'non', 'maybe'].includes(pm)) {
      issues.push({
        field: 'payment_mix',
        severity: 'invalid',
        message_en: 'When it comes to payments, do your customers pay mostly by card, mostly cash, or a mix of both?',
        message_fr: 'Pour les paiements, vos clients paient surtout par carte, surtout comptant, ou un mélange des deux ?',
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 5. EMPLOYEE COUNT SANITY
  // ════════════════════════════════════════════════════════════════════

  const empCount = tags.set_employee_count || tags.staffing_count;
  if (empCount && typeof empCount === 'number') {
    if (empCount > 500) {
      issues.push({
        field: 'employee_count',
        severity: 'suspicious',
        message_en: `${empCount} employees — just confirming, is that the right number?`,
        message_fr: `${empCount} employés — je veux juste confirmer que c'est le bon chiffre ?`,
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // RESULT
  // ════════════════════════════════════════════════════════════════════

  // Only block on 'missing' and 'invalid' — 'suspicious' generates follow-up but doesn't block
  const blockingIssues = issues.filter(i => i.severity === 'missing' || i.severity === 'invalid');
  
  return {
    valid: blockingIssues.length === 0,
    issues,
    correctedTags,
  };
}

/**
 * Build a follow-up prompt for the AI when validation fails.
 * The AI will ask the user to correct specific fields in a natural way.
 */
export function buildValidationFollowUp(issues: ValidationIssue[], lang: string): string {
  const isFR = lang === 'fr';
  
  const missingFields = issues
    .filter(i => i.severity === 'missing')
    .map(i => isFR ? i.message_fr : i.message_en);
  
  const invalidFields = issues
    .filter(i => i.severity === 'invalid')
    .map(i => isFR ? i.message_fr : i.message_en);
  
  const suspiciousFields = issues
    .filter(i => i.severity === 'suspicious')
    .map(i => isFR ? i.message_fr : i.message_en);

  let prompt = '';
  
  if (isFR) {
    prompt = `INSTRUCTION SYSTÈME: La validation des données a détecté des problèmes avant de lancer l'analyse. Tu dois demander à l'utilisateur de clarifier ces points de manière naturelle et conversationnelle (en UNE seule question courte). Ne mentionne jamais la "validation" — fais comme si tu avais juste besoin d'une petite précision.\n\n`;
  } else {
    prompt = `SYSTEM INSTRUCTION: Data validation found issues before running analysis. Ask the user to clarify these points naturally in ONE short question. Never mention "validation" — just act like you need a quick clarification.\n\n`;
  }

  if (missingFields.length > 0) {
    prompt += `MISSING DATA (must collect):\n${missingFields.map(f => `- ${f}`).join('\n')}\n\n`;
  }
  
  if (invalidFields.length > 0) {
    prompt += `INVALID DATA (must correct):\n${invalidFields.map(f => `- ${f}`).join('\n')}\n\n`;
  }
  
  if (suspiciousFields.length > 0) {
    prompt += `SUSPICIOUS DATA (confirm with user):\n${suspiciousFields.map(f => `- ${f}`).join('\n')}\n\n`;
  }

  prompt += isFR 
    ? `Rappel: reste naturel, bref (max 2 phrases + la question), et ne mentionne PAS de validation ou de système. Émets les tags appropriés après la réponse de l'utilisateur. Une fois les données corrigées, émets <run_analysis /> pour relancer.`
    : `Reminder: stay natural, brief (max 2 sentences + the question), and do NOT mention validation or systems. Emit appropriate tags after the user responds. Once data is corrected, emit <run_analysis /> to re-trigger.`;

  return prompt;
}
