// =============================================================================
// GET /api/v3/dashboard — Unified dashboard data
// Priority: real financial_snapshots > prescan results > empty state
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30; // Vercel function timeout (seconds)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Severity label helper
function sevLabel(score: number): string {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

// Leak short text by code
const LEAK_SHORT_TEXT: Record<string, { en: string; fr: string }> = {
  processing_rate_high: {
    en: "Your effective rate is above what similar businesses usually pay.",
    fr: "Votre taux effectif est supérieur à celui d'entreprises similaires.",
  },
  rent_or_chair_high: {
    en: "Your space cost is taking a larger share of revenue than typical.",
    fr: "Vos coûts d'espace représentent une part plus grande que la normale.",
  },
  tax_optimization_gap: {
    en: "Without accounting software, you're likely missing deductions.",
    fr: "Sans logiciel comptable, vous manquez probablement des déductions.",
  },
  cash_management_risk: {
    en: "Heavy cash usage without systematic tracking creates invisible leakage.",
    fr: "L'utilisation d'espèces sans suivi crée des fuites invisibles.",
  },
  labor_cost_high: {
    en: "Staff costs are higher than typical for your revenue level.",
    fr: "Les coûts de personnel sont plus élevés que la normale pour votre revenu.",
  },
  payroll_ratio_high: {
    en: "Your payroll ratio is higher than similar businesses in your sector.",
    fr: "Votre ratio masse salariale est plus élevé que la moyenne du secteur.",
  },
  insurance_overpayment: {
    en: "Your insurance costs exceed the benchmark for your industry. Shopping your coverage annually typically yields significant savings.",
    fr: "Vos coûts d'assurance dépassent la moyenne de votre secteur. Magasiner votre couverture annuellement génère des économies.",
  },
  fuel_vehicle_high: {
    en: "Fuel and vehicle costs are above benchmark for your industry.",
    fr: "Les coûts de carburant dépassent la moyenne de votre secteur.",
  },
  subscription_bloat: {
    en: "Your SaaS spend is above average — audit unused tools.",
    fr: "Vos dépenses logicielles sont au-dessus de la moyenne.",
  },
  software_bloat: {
    en: "Auditing unused SaaS tools typically reveals quick savings.",
    fr: "Un audit des outils inutilisés révèle souvent des économies rapides.",
  },
  banking_fees_high: {
    en: "Your banking fees are above average for your business size.",
    fr: "Vos frais bancaires dépassent la moyenne pour votre taille d'entreprise.",
  },
  inventory_cogs_high: {
    en: "Your cost of goods ratio exceeds the benchmark for your industry.",
    fr: "Votre ratio coût des marchandises dépasse la moyenne de votre secteur.",
  },
  marketing_waste: {
    en: "Your marketing costs are high relative to revenue.",
    fr: "Vos dépenses marketing sont élevées par rapport à vos revenus.",
  },
  marketing_overspend: {
    en: "Your marketing costs are high relative to revenue.",
    fr: "Vos dépenses marketing sont élevées par rapport à vos revenus.",
  },
};

// Leak display name by code
const LEAK_NAMES: Record<string, string> = {
  processing_rate_high: "Card processing overpayment",
  rent_or_chair_high: "Rent / space cost too high",
  tax_optimization_gap: "Tax deductions being missed",
  cash_management_risk: "Cash handling risk",
  labor_cost_high: "Labour cost above benchmark",
  payroll_ratio_high: "Labour cost above benchmark",
  insurance_overpayment: "Insurance premiums too high",
  fuel_vehicle_high: "Fuel / vehicle costs high",
  subscription_bloat: "Software subscriptions bloat",
  software_bloat: "Software subscriptions bloat",
  banking_fees_high: "Banking fees too high",
  inventory_cogs_high: "Cost of goods too high",
  marketing_waste: "Marketing spend inefficient",
  marketing_overspend: "Marketing overspend",
  cash_shrinkage: "Cash handling losses",
  utilities_overspend: "Utilities above benchmark",
  revenue_underpricing: "Revenue erosion from underpricing",
  receivables_leakage: "Uncollected invoices",
  late_payment_penalties: "Late payment penalties",
  equipment_depreciation_gap: "Unclaimed equipment depreciation",
  employee_turnover_cost: "Employee turnover cost",
  supplier_discount_missed: "Missed supplier discounts",
  debt_interest_high: "Business debt interest gap",
  tax_filing_inefficiency: "GST/HST input credits missed",
  professional_fees_high: "Professional fees above optimal",
  no_bookkeeping_system: "No bookkeeping system",
  subcontractor_markup: "Subcontractor cost gap",
  scheduling_inefficiency: "Scheduling & overtime waste",
  no_emergency_fund: "Reactive cost premium",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let businessId = searchParams.get("businessId");
  const prescanRunId = searchParams.get("prescanRunId");

  // If prescanRunId provided (public preview), look up businessId from prescan_runs
  if (!businessId && prescanRunId) {
    const { data: run } = await supabase
      .from("prescan_runs")
      .select("business_id, industry_slug, province, annual_revenue, health_score, data_health_score, total_leak_estimate_year, tier, leak_count")
      .eq("id", prescanRunId)
      .single();

    if (!run) {
      return NextResponse.json({ success: false, source: "prescan", leaks: [], alerts: [], snapshot: null, tier: "free" }, { status: 200 });
    }

    // Load leaks directly from prescan_run_id (no business needed)
    const { data: prescanLeaks } = await supabase
      .from("detected_leaks")
      .select("*")
      .eq("prescan_run_id", prescanRunId)
      .order("priority_score", { ascending: false, nullsFirst: false });

    const leaks = (prescanLeaks || []).map((l: any) => {
      const code = l.leak_type_code || "";
      const evidence = l.evidence || {};
      return {
        id: l.id,
        leak_type_name: l.title || LEAK_NAMES[code] || code.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        leak_type_name_fr: l.title_fr || null,
        category: l.category || "other",
        severity_label: l.severity || sevLabel(evidence.severity_score ?? 0),
        annual_estimate: l.annual_impact_min ?? 0,
        confidence: evidence.confidence_score ?? 0,
        short_text: l.description || LEAK_SHORT_TEXT[code]?.en || "",
        short_text_fr: l.description_fr || LEAK_SHORT_TEXT[code]?.fr || "",
      };
    });

    return NextResponse.json({
      source: "prescan" as const,
      business: {
        id: run.business_id || prescanRunId,
        name: "Your Business",
        industry_slug: run.industry_slug,
        province: run.province,
        annual_revenue: run.annual_revenue,
      },
      snapshot: {
        fh_score: run.health_score || 50,
        fh_change: 0,
        dh_score: run.data_health_score || 30,
        total_leak_annual: run.total_leak_estimate_year ?? 0,
        revenue_monthly: [],
        revenue_labels: [],
        revenue_last_month: 0,
        revenue_mom: 0,
        revenue_yoy: 0,
        revenue_stability: "insufficient_data",
        cost_breakdown: [],
        transaction_count: 0,
        categorization_pct: 0,
      },
      leaks,
      alerts: [],
      monitoring_active: false,
      tier: (run.tier || "free").toLowerCase(),
    });
  }

  if (!businessId) {
    return NextResponse.json({ error: "businessId is required" }, { status: 400 });
  }

  // ── 1. Load business ──
  const { data: biz } = await supabase
    .from("businesses")
    .select("id, name, industry, province, annual_revenue, tier")
    .eq("id", businessId)
    .single();

  if (!biz) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // ── 2. Try real financial_snapshots first ──
  const { data: snapshots } = await supabase
    .from("financial_snapshots")
    .select("*")
    .eq("business_id", businessId)
    .order("snapshot_month", { ascending: false })
    .limit(12);

  if (snapshots && snapshots.length > 0) {
    // Real data path — Phase 2 (live monitoring)
    // NOTE: Build full response from real snapshots — placeholder data below
    // For now, this path returns the same shape but from real data
    const latest = snapshots[0];

    // Load real leaks
    const { data: realLeaks } = await supabase
      .from("leaks")
      .select("*")
      .eq("business_id", businessId)
      .eq("status", "active")
      .order("priority_score", { ascending: false });

    // Load real alerts
    const { data: realAlerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("business_id", businessId)
      .in("status", ["open", "acknowledged"])
      .order("first_triggered_at", { ascending: false })
      .limit(20);

    // Load cost breakdown
    const { data: costs } = await supabase
      .from("snapshot_cost_breakdown")
      .select("*, cost_categories(label_en, benchmark_metric_key)")
      .eq("snapshot_id", latest.id);

    return NextResponse.json({
      source: "live",
      business: {
        id: biz.id,
        name: biz.name,
        industry_slug: biz.industry,
        province: biz.province,
        annual_revenue: biz.annual_revenue,
      },
      snapshot: {
        fh_score: latest.financial_health_score ?? 0,
        fh_change: 0, // PENDING: build full response from snapshots
        dh_score: latest.data_health_score ?? 0,
        total_leak_annual: latest.total_estimated_annual_leak ?? 0,
        revenue_monthly: snapshots.reverse().map((s: any) => s.total_revenue ?? 0),
        revenue_labels: snapshots.map((s: any) => {
          const d = new Date(s.snapshot_month);
          return d.toLocaleString("en", { month: "short" });
        }),
        revenue_last_month: latest.total_revenue ?? 0,
        revenue_mom: 0,
        revenue_yoy: 0,
        revenue_stability: "Unknown",
        cost_breakdown: (costs || []).map((c: any) => ({
          category: c.cost_categories?.label_en || c.category_code,
          pct_of_revenue: c.ratio_of_revenue ? c.ratio_of_revenue * 100 : 0,
          benchmark_pct: 0, // PENDING: build full response from snapshots
          status: "healthy",
        })),
        transaction_count: 0,
        categorization_pct: 0,
      },
      leaks: (realLeaks || []).map((l: any) => ({
        id: l.id,
        leak_type_name: LEAK_NAMES[l.leak_type_code] || l.leak_type_code,
        category: l.leak_type_code,
        severity_label: sevLabel(l.severity_score ?? 0),
        annual_estimate: l.estimated_annual_leak ?? 0,
        confidence: l.confidence_score ?? 0,
        short_text: LEAK_SHORT_TEXT[l.leak_type_code]?.en || "",
      })),
      alerts: (realAlerts || []).map((a: any) => ({
        id: a.id,
        level: a.level || "info",
        title: a.message_en || a.alert_type || "Alert",
        short_text: "",
        created_at: a.first_triggered_at,
        read: a.status === "acknowledged",
      })),
      monitoring_active: true,
      tier: (biz.tier || "free").toLowerCase(),
    });
  }

  // ── 3. No real snapshots — fall back to prescan data ──
  const { data: prescanRun } = await supabase
    .from("prescan_runs")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!prescanRun) {
    // No prescan either — return empty state
    return NextResponse.json({
      source: "empty",
      business: {
        id: biz.id,
        name: biz.name,
        industry_slug: biz.industry,
        province: biz.province,
        annual_revenue: biz.annual_revenue,
      },
      snapshot: null,
      leaks: [],
      alerts: [],
      monitoring_active: false,
      tier: (biz.tier || "free").toLowerCase(),
    });
  }

  // ── 4. Load prescan leaks ──
  const { data: prescanLeaks } = await supabase
    .from("detected_leaks")
    .select("*")
    .eq("prescan_run_id", prescanRun.id)
    .order("priority_score", { ascending: false, nullsFirst: false });

  const leaks = (prescanLeaks || []).map((l: any) => {
    const code = l.leak_type_code || "";
    const evidence = l.evidence || {};
    return {
      id: l.id,
      leak_type_name: l.title || LEAK_NAMES[code] || code.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      leak_type_name_fr: l.title_fr || null,
      category: l.category || "other",
      severity_label: l.severity || sevLabel(evidence.severity_score ?? 0),
      annual_estimate: l.annual_impact_min ?? 0,
      confidence: Math.round(evidence.confidence_score ?? 0),
      short_text: l.description || LEAK_SHORT_TEXT[code]?.en || "",
      short_text_fr: l.description_fr || LEAK_SHORT_TEXT[code]?.fr || "",
    };
  });

  const totalLeak = leaks.reduce((s: number, l: any) => s + l.annual_estimate, 0);
  const annualRev = (prescanRun.annual_revenue || biz.annual_revenue) ?? 0;

  // Build estimated snapshot from prescan data
  // Revenue: generate 12 months of estimated data based on annual revenue
  const monthlyEst = annualRev / 12;
  const revenueMonthly = Array.from({ length: 12 }, (_, i) => {
    // Slight random variation to look realistic (~±5%)
    const seed = (prescanRun.id?.charCodeAt(i % 36) || 42) % 10;
    const variance = 1 + (seed - 5) * 0.01;
    return Math.round(monthlyEst * variance);
  });
  const monthLabels = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 11 + i);
    return d.toLocaleString("en", { month: "short" });
  });

  // Build estimated cost breakdown from prescan main_costs
  const mainCosts = prescanRun.main_costs || [];
  const costBreakdown = buildEstimatedCosts(mainCosts, annualRev, prescanRun.industry_slug);

  return NextResponse.json({
    source: "prescan",
    business: {
      id: biz.id,
      name: biz.name,
      industry_slug: prescanRun.industry_slug || biz.industry,
      province: prescanRun.province || biz.province,
      annual_revenue: annualRev,
    },
    snapshot: {
      fh_score: prescanRun.health_score || 65,
      fh_change: 0,
      dh_score: prescanRun.data_health_score || 30,
      total_leak_annual: totalLeak,
      revenue_monthly: revenueMonthly,
      revenue_labels: monthLabels,
      revenue_last_month: revenueMonthly[11] || monthlyEst,
      revenue_mom: 0,
      revenue_yoy: 0,
      revenue_stability: "Estimated",
      cost_breakdown: costBreakdown,
      transaction_count: 0,
      categorization_pct: 0,
    },
    leaks,
    alerts: leaks.filter(l => l.annual_estimate > 1000).map((l, i) => ({
      id: `prescan-alert-${i}`,
      level: l.annual_estimate > 3000 ? "critical" : l.annual_estimate > 1500 ? "important" : "low",
      title: l.leak_type_name,
      short_text: l.short_text,
      created_at: prescanRun.created_at,
      read: false,
    })),
    monitoring_active: false,
    tier: (biz.tier || "free").toLowerCase(),
  });
}

// Build estimated cost structure from prescan tags
function buildEstimatedCosts(mainCosts: string[], annualRevenue: number, industry: string) {
  const costs: Array<{ category: string; pct_of_revenue: number; benchmark_pct: number; status: string }> = [];

  // Industry-typical ratios (simplified benchmarks)
  const benchmarks: Record<string, Record<string, { typical: number; benchmark: number }>> = {
    default: {
      rent: { typical: 10, benchmark: 8 },
      payroll: { typical: 28, benchmark: 24 },
      insurance: { typical: 4, benchmark: 3.5 },
      fuel: { typical: 12, benchmark: 10 },
      software: { typical: 2, benchmark: 1.8 },
      processing: { typical: 3, benchmark: 2.4 },
    },
    barber_shop: {
      rent: { typical: 15, benchmark: 12 },
      chair_rent: { typical: 20, benchmark: 15 },
      tools: { typical: 3, benchmark: 2.5 },
      insurance: { typical: 3, benchmark: 2.5 },
      processing: { typical: 3, benchmark: 2.3 },
    },
    restaurant: {
      rent: { typical: 10, benchmark: 8 },
      payroll: { typical: 32, benchmark: 28 },
      food: { typical: 30, benchmark: 28 },
      insurance: { typical: 3, benchmark: 2.5 },
      processing: { typical: 3.2, benchmark: 2.4 },
    },
    trucking: {
      fuel: { typical: 35, benchmark: 30 },
      insurance: { typical: 8, benchmark: 6 },
      maintenance: { typical: 10, benchmark: 8 },
      processing: { typical: 2, benchmark: 1.5 },
    },
  };

  const industryBench = benchmarks[industry] || benchmarks.default;

  // Always add processing if we detected processing leak
  const costTags = [...new Set([...mainCosts, "processing"])];

  for (const tag of costTags) {
    const normalizedTag = tag.toLowerCase().trim();
    const match = industryBench[normalizedTag] || benchmarks.default[normalizedTag];
    if (match) {
      const status = match.typical > match.benchmark * 1.1 ? "above" : "healthy";
      costs.push({
        category: normalizedTag.charAt(0).toUpperCase() + normalizedTag.slice(1).replace(/_/g, " "),
        pct_of_revenue: match.typical,
        benchmark_pct: match.benchmark,
        status,
      });
    }
  }

  return costs.slice(0, 5); // Top 5
}