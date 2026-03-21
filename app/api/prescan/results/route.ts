import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LEAK_LABELS: Record<string, { title: string; titleFR: string; description: string; descriptionFR: string; icon: string }> = {
  processing_rate_high: {
    title: 'Card Processing Fees Too High',
    titleFR: 'Frais de traitement trop élevés',
    description: 'Your card processing rate is above the benchmark for similar businesses in your province. Switching providers or renegotiating your rate can recover this annually.',
    descriptionFR: 'Votre taux de traitement est au-dessus de la moyenne. Changer de fournisseur ou renégocier pourrait récupérer ce montant annuellement.',
    icon: '💳',
  },
  rent_or_chair_high: {
    title: 'Rent / Space Cost Too High',
    titleFR: 'Loyer / Coût d\'espace trop élevé',
    description: 'Your space cost is taking a larger share of revenue than typical for your industry. Renegotiating or restructuring could free up significant cash.',
    descriptionFR: 'Vos coûts d\'espace représentent une part plus grande que la normale dans votre secteur.',
    icon: '🏠',
  },
  tax_optimization_gap: {
    title: 'Tax Deductions Being Missed',
    titleFR: 'Déductions fiscales manquées',
    description: 'Without accounting software, most businesses miss 2–4% of revenue in deductions annually. A simple bookkeeping tool pays for itself many times over.',
    descriptionFR: 'Sans logiciel comptable, la plupart des entreprises manquent 2 à 4% de leurs revenus en déductions.',
    icon: '📋',
  },
  cash_management_risk: {
    title: 'Cash Handling Risk',
    titleFR: 'Risque lié aux espèces',
    description: 'Heavy cash usage without systematic tracking creates invisible leakage through shrinkage, errors, and missed reconciliation.',
    descriptionFR: 'L\'utilisation d\'espèces sans suivi crée des fuites invisibles via pertes et erreurs.',
    icon: '💵',
  },
  labor_cost_high: {
    title: 'Labour Cost Above Benchmark',
    titleFR: 'Coût de main-d\'œuvre élevé',
    description: 'Your payroll ratio is higher than similar businesses. Reviewing scheduling, roles, or efficiency could reduce this significantly.',
    descriptionFR: 'Votre ratio masse salariale est plus élevé que la moyenne du secteur.',
    icon: '👥',
  },
  insurance_overpayment: {
    title: 'Insurance Premiums Too High',
    titleFR: 'Primes d\'assurance trop élevées',
    description: 'Your insurance costs are above benchmark. Shopping your coverage annually or bundling policies typically yields significant savings.',
    descriptionFR: 'Vos coûts d\'assurance dépassent la moyenne. Magasiner votre couverture annuellement peut générer des économies.',
    icon: '🛡️',
  },
  fuel_vehicle_high: {
    title: 'Fuel / Vehicle Costs High',
    titleFR: 'Carburant / Véhicule trop élevé',
    description: 'Your fuel and vehicle costs are above benchmark. Route optimization or fuel card programs can reduce this.',
    descriptionFR: 'Vos coûts de carburant dépassent la moyenne. Optimiser les trajets ou utiliser une carte carburant peut aider.',
    icon: '⛽',
  },
  subscription_bloat: {
    title: 'Software Subscriptions Bloat',
    titleFR: 'Abonnements logiciels excessifs',
    description: 'Your SaaS spend is above average for your revenue level. Auditing unused or redundant tools typically reveals quick savings.',
    descriptionFR: 'Vos dépenses en logiciels dépassent la moyenne. Un audit des outils inutilisés révèle souvent des économies rapides.',
    icon: '💻',
  },
  payroll_ratio_high: {
    title: 'Labour Cost Above Benchmark',
    titleFR: 'Coût de main-d\'œuvre élevé',
    description: 'Your payroll ratio is higher than similar businesses. Reviewing scheduling, roles, or efficiency could reduce this significantly.',
    descriptionFR: 'Votre ratio masse salariale est plus élevé que la moyenne du secteur.',
    icon: '👥',
  },
  software_bloat: {
    title: 'Software Subscriptions Bloat',
    titleFR: 'Abonnements logiciels excessifs',
    description: 'Your SaaS spend is above average. Auditing unused or redundant tools typically reveals quick savings.',
    descriptionFR: 'Vos dépenses en logiciels dépassent la moyenne.',
    icon: '💻',
  },
  banking_fees_high: {
    title: 'Banking Fees Too High',
    titleFR: 'Frais bancaires trop élevés',
    description: 'Your banking fees are above average for your business size. Switching to a business account with lower fees can save money.',
    descriptionFR: 'Vos frais bancaires dépassent la moyenne. Un compte entreprise mieux adapté pourrait vous faire économiser.',
    icon: '🏦',
  },
  inventory_cogs_high: {
    title: 'Cost of Goods Too High',
    titleFR: 'Coût des marchandises trop élevé',
    description: 'Your COGS ratio exceeds the benchmark. Renegotiating supplier terms or finding alternative vendors could reduce this.',
    descriptionFR: 'Votre ratio coût des marchandises dépasse la moyenne. Renégocier avec vos fournisseurs pourrait réduire ce coût.',
    icon: '📦',
  },
  marketing_waste: {
    title: 'Marketing Spend Inefficient',
    titleFR: 'Dépenses marketing inefficaces',
    description: 'Your marketing costs are high relative to revenue. Focusing on higher-ROI channels could improve efficiency.',
    descriptionFR: 'Vos dépenses marketing sont élevées par rapport à vos revenus.',
    icon: '📣',
  },
  marketing_overspend: {
    title: 'Marketing Overspend',
    titleFR: 'Dépenses marketing excessives',
    description: 'Your marketing costs are high relative to revenue. Reviewing channel performance can reveal savings.',
    descriptionFR: 'Vos dépenses marketing sont élevées par rapport à vos revenus.',
    icon: '📣',
  },
};

function severityLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Critical', color: '#ff0033' };
  if (score >= 60) return { label: 'High',     color: '#ff3d57' };
  if (score >= 30) return { label: 'Medium',   color: '#ff8f00' };
  return               { label: 'Low',      color: '#8890a4' };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prescanRunId = searchParams.get('prescanRunId');

  if (!prescanRunId) {
    return NextResponse.json({ error: 'prescanRunId is required' }, { status: 400 });
  }

  const { data: run, error: runError } = await supabase
    .from('prescan_runs')
    .select('*')
    .eq('id', prescanRunId)
    .single();

  if (runError || !run) {
    return NextResponse.json({ error: 'Prescan run not found' }, { status: 404 });
  }

  const { data: leaks } = await supabase
    .from('detected_leaks')
    .select('*')
    .eq('prescan_run_id', prescanRunId)
    .order('priority_score', { ascending: false, nullsFirst: false });

  const formattedLeaks = (leaks || []).map(leak => {
    // Use leak_type_code (068) or fall back to leak_type (064)
    const code  = leak.leak_type_code || leak.leak_type || '';
    const label = LEAK_LABELS[code] || {
      title:       code.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      titleFR:     code.replace(/_/g, ' '),
      description: '',
      descriptionFR: '',
      icon: '💧',
    };
    const sev = severityLabel(leak.severity_score ?? 0);
    return {
      id:              leak.id,
      code,
      icon:            label.icon,
      title:           label.title,
      titleFR:         label.titleFR,
      description:     label.description,
      descriptionFR:   label.descriptionFR,
      category:        leak.leak_category || 'other',
      estimatedAnnual: leak.estimated_annual_leak || leak.annual_leak_amount ?? 0,
      severityScore:   leak.severity_score ?? 0,
      severityLabel:   sev.label,
      severityColor:   sev.color,
      confidenceScore: leak.confidence_score ?? 0,
      priorityScore:   leak.priority_score ?? 0,
      status:          leak.status || 'detected',
    };
  });

  const totalLeak = formattedLeaks.reduce((s, l) => s + l.estimatedAnnual, 0);

  return NextResponse.json({
    prescanRunId:  run.id,
    businessId:    run.business_id,
    industrySlug:  run.industry_slug,
    province:      run.province,
    revenueBand:   run.revenue_band,
    annualRevenue: run.annual_revenue,
    fhScore:       run.health_score ?? 0,
    dhScore:       run.data_health_score ?? 0,
    totalLeak,
    totalLeakLow:  Math.round(totalLeak * 0.8),
    totalLeakHigh: Math.round(totalLeak * 1.2),
    leaks:         formattedLeaks,
    createdAt:     run.created_at,
  });
}
