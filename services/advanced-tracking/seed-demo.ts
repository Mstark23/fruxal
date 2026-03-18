// =============================================================================
// ADVANCED TRACKING — SEED DEMO DATA
// =============================================================================
// Populates all 6 tracking layers with realistic data + intentional leaks
// =============================================================================

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function seedAdvancedTrackingData(businessId: string) {
  await Promise.all([
    supabase.from("track_marketing").delete().eq("business_id", businessId),
    supabase.from("track_inventory").delete().eq("business_id", businessId),
    supabase.from("track_labor").delete().eq("business_id", businessId),
    supabase.from("track_tax").delete().eq("business_id", businessId),
    supabase.from("track_pricing").delete().eq("business_id", businessId),
    supabase.from("track_client_profit").delete().eq("business_id", businessId),
  ]);

  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const seeded: string[] = [];

  // ═══ MARKETING (6 months × 5 channels) ═══
  const mktRows: any[] = [];
  const channels = [
    { ch: "google_ads", spendBase: 2500, revenueBase: 8500, leadsBase: 45, custBase: 8 },
    { ch: "meta_ads", spendBase: 1800, revenueBase: 1200, leadsBase: 30, custBase: 2 }, // LEAK: negative ROI
    { ch: "linkedin_ads", spendBase: 1200, revenueBase: 0, leadsBase: 8, custBase: 0 }, // LEAK: zero attribution
    { ch: "email", spendBase: 200, revenueBase: 4500, leadsBase: 20, custBase: 5 },
    { ch: "referral_program", spendBase: 500, revenueBase: 6000, leadsBase: 12, custBase: 6 },
  ];

  for (let mo = 0; mo < 6; mo++) {
    const start = new Date(now.getFullYear(), now.getMonth() - 6 + mo, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - 5 + mo, 0);
    // CAC CREEP: costs go up each month, conversions stay flat
    const cacMultiplier = 1 + (mo * 0.08);

    channels.forEach(c => {
      const spend = c.spendBase * cacMultiplier * (0.9 + Math.random() * 0.2);
      const revenue = c.revenueBase * (0.85 + Math.random() * 0.3);
      const leads = Math.floor(c.leadsBase * (0.8 + Math.random() * 0.4));
      const custs = Math.floor(c.custBase * (0.7 + Math.random() * 0.6));

      mktRows.push({
        business_id: businessId, period_start: fmt(start), period_end: fmt(end),
        channel: c.ch, spend, impressions: Math.floor(spend * 15),
        clicks: Math.floor(spend * 1.2), leads_generated: leads,
        customers_acquired: custs, revenue_attributed: revenue,
        cost_per_lead: leads > 0 ? spend / leads : 0,
        cost_per_acquisition: custs > 0 ? spend / custs : 0,
        return_on_ad_spend: spend > 0 ? revenue / spend : 0,
        roi_pct: spend > 0 ? ((revenue - spend) / spend) * 100 : 0,
        attribution_method: c.ch === "email" ? "last_touch" : "estimated",
        confidence: c.ch === "linkedin_ads" ? 0.3 : 0.7,
      });
    });
  }
  await supabase.from("track_marketing").insert(mktRows);
  seeded.push(`${mktRows.length} marketing records`);

  // ═══ INVENTORY (6 months × 3 categories) ═══
  const invRows: any[] = [];
  const invCats = [
    { cat: "supplies", openBase: 12000, purchBase: 8000, shrinkPct: 7.5 }, // LEAK: high shrinkage
    { cat: "materials", openBase: 25000, purchBase: 15000, shrinkPct: 3.5 },
    { cat: "product", openBase: 45000, purchBase: 30000, shrinkPct: 5.0 }, // LEAK: shrinkage
  ];

  for (let mo = 0; mo < 6; mo++) {
    const start = new Date(now.getFullYear(), now.getMonth() - 6 + mo, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - 5 + mo, 0);

    invCats.forEach(ic => {
      const opening = ic.openBase * (0.9 + Math.random() * 0.2);
      const purchases = ic.purchBase * (0.85 + Math.random() * 0.3);
      const cogsTheoretical = (opening + purchases) * (0.55 + Math.random() * 0.15);
      const shrinkage = cogsTheoretical * (ic.shrinkPct / 100);
      const cogsActual = cogsTheoretical + shrinkage;
      const closing = opening + purchases - cogsActual;
      const wasteLogged = shrinkage * (0.3 + Math.random() * 0.2);
      const unaccounted = shrinkage - wasteLogged;

      invRows.push({
        business_id: businessId, period_start: fmt(start), period_end: fmt(end),
        category: ic.cat, opening_value: opening, purchases,
        closing_value: Math.max(0, closing), cogs_actual: cogsActual,
        cogs_theoretical: cogsTheoretical, shrinkage, shrinkage_pct: ic.shrinkPct,
        waste_logged: wasteLogged, waste_pct: (wasteLogged / cogsTheoretical) * 100,
        unaccounted_loss: unaccounted,
        turns_per_period: cogsActual / Math.max(1, (opening + closing) / 2),
        days_on_hand: Math.round(30 * closing / Math.max(1, cogsActual / 30)),
        dead_stock_value: mo < 2 ? closing * 0.08 : closing * 0.04, // LEAK: early months have dead stock
        overstock_value: closing * (0.15 + Math.random() * 0.10), // LEAK: consistent overstock
      });
    });
  }
  await supabase.from("track_inventory").insert(invRows);
  seeded.push(`${invRows.length} inventory records`);

  // ═══ LABOR (6 months) ═══
  const laborRows: any[] = [];
  for (let mo = 0; mo < 6; mo++) {
    const start = new Date(now.getFullYear(), now.getMonth() - 6 + mo, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - 5 + mo, 0);
    const revenue = 85000 + Math.random() * 20000;
    const headcount = 12;
    const regularHours = headcount * 160;
    const overtimeHours = regularHours * (0.12 + Math.random() * 0.10); // LEAK: 12-22% OT
    const overtimeCost = overtimeHours * 35 * 1.5;
    const totalLabor = (regularHours * 30) + overtimeCost;
    const turnover = mo === 2 || mo === 5 ? 1 : 0; // 2 departures in period

    laborRows.push({
      business_id: businessId, period_start: fmt(start), period_end: fmt(end),
      department: "general", total_labor_cost: totalLabor,
      regular_hours: regularHours, overtime_hours: overtimeHours,
      overtime_cost: overtimeCost,
      overtime_pct: (overtimeHours / (regularHours + overtimeHours)) * 100,
      revenue_per_labor_hour: revenue / (regularHours + overtimeHours),
      labor_cost_pct: (totalLabor / revenue) * 100,
      headcount, revenue_per_employee: revenue / headcount,
      turnover_count: turnover,
      turnover_cost_est: turnover * 15000, // LEAK: $15K per departure
      training_hours: 8 + Math.random() * 12,
      idle_hours_est: regularHours * (0.05 + Math.random() * 0.08),
      schedule_efficiency: 78 + Math.random() * 12,
    });
  }
  await supabase.from("track_labor").insert(laborRows);
  seeded.push(`${laborRows.length} labor records`);

  // ═══ TAX (current year) ═══
  const taxRows = [
    { cat: "home_office", status: "potential", deduction: 5000, rate: 0.25, savings: 1250, current: 0, gap: 1250, evidence: "Owner works from home 3 days/week", rec: "Calculate square footage method or simplified method ($5/sqft up to 300sqft)" },
    { cat: "vehicle", status: "potential", deduction: 8500, rate: 0.25, savings: 2125, current: 1200, gap: 925, evidence: "Standard mileage not optimized — tracking shows 12,000 business miles", rec: "Switch to actual expense method if vehicle costs are high, or ensure all miles tracked" },
    { cat: "depreciation", status: "potential", deduction: 12000, rate: 0.25, savings: 3000, current: 0, gap: 3000, evidence: "Equipment purchases in last 3 years not Section 179'd", rec: "Review equipment purchases for Section 179 or bonus depreciation eligibility" },
    { cat: "retirement", status: "potential", deduction: 20500, rate: 0.30, savings: 6150, current: 6000, gap: 150, evidence: "SEP-IRA contributions below max", rec: "Max out SEP-IRA contributions (up to 25% of net self-employment income)" },
    { cat: "health", status: "confirmed", deduction: 18000, rate: 0.25, savings: 4500, current: 4500, gap: 0, evidence: "Self-employed health insurance deduction claimed", rec: "Already optimized" },
    { cat: "meals", status: "potential", deduction: 3200, rate: 0.25, savings: 800, current: 400, gap: 400, evidence: "Business meals only partially tracked", rec: "Log all business meals with attendees and purpose. 50% deductible in most cases" },
    { cat: "education", status: "potential", deduction: 2500, rate: 0.25, savings: 625, current: 0, gap: 625, evidence: "Professional development courses and certifications", rec: "Deduct courses, conferences, books, and certifications that maintain/improve skills" },
    { cat: "missed_1099", status: "potential", deduction: 0, rate: 0, savings: 0, current: 0, gap: 0, evidence: "4 contractors paid >$600 without 1099 filing", rec: "File 1099-NEC for all contractors paid >$600. Penalty $60-$310 per missed form" },
    { cat: "missed_1099", status: "potential", deduction: 0, rate: 0, savings: 0, current: 0, gap: 0, evidence: "2 additional contractors identified from transaction scan", rec: "Collect W-9 before first payment going forward" },
  ];

  await supabase.from("track_tax").insert(
    taxRows.map(t => ({
      business_id: businessId, tax_year: now.getFullYear(),
      category: t.cat, status: t.status,
      estimated_deduction: t.deduction, tax_rate_applicable: t.rate,
      estimated_savings: t.savings, current_claim: t.current, gap: t.gap,
      evidence: t.evidence, recommendation: t.rec,
      requires_documentation: t.gap > 0, confidence: t.status === "confirmed" ? 0.95 : 0.55,
    }))
  );
  seeded.push(`${taxRows.length} tax records`);

  // ═══ PRICING (8 products/services) ═══
  const pricingRows = [
    { svc: "Strategy Consulting (hourly)", price: 150, unit: "hour", cost: 85, mktLow: 125, mktMed: 200, mktHigh: 350, pctile: 18, vol: 800, rev: 120000, lastChanged: 28, suggested: 195 },
    { svc: "Implementation Package", price: 5000, unit: "project", cost: 3800, mktLow: 4500, mktMed: 7500, mktHigh: 15000, pctile: 12, vol: 24, rev: 120000, lastChanged: 36, suggested: 6500 }, // LEAK: way underpriced
    { svc: "Monthly Retainer - Basic", price: 2500, unit: "monthly", cost: 1400, mktLow: 2000, mktMed: 3500, mktHigh: 8000, pctile: 22, vol: 48, rev: 120000, lastChanged: 24, suggested: 3200 },
    { svc: "Monthly Retainer - Premium", price: 7500, unit: "monthly", cost: 3200, mktLow: 5000, mktMed: 8000, mktHigh: 15000, pctile: 42, vol: 24, rev: 180000, lastChanged: 12, suggested: 8500 },
    { svc: "Audit & Assessment", price: 1200, unit: "project", cost: 950, mktLow: 1000, mktMed: 2500, mktHigh: 5000, pctile: 15, vol: 36, rev: 43200, lastChanged: 42, suggested: 2000 }, // LEAK: very low margin + stale
    { svc: "Training Workshop (half-day)", price: 800, unit: "each", cost: 350, mktLow: 750, mktMed: 1500, mktHigh: 3000, pctile: 20, vol: 18, rev: 14400, lastChanged: 30, suggested: 1200 },
    { svc: "Data Analysis Report", price: 3500, unit: "project", cost: 1200, mktLow: 2500, mktMed: 4000, mktHigh: 8000, pctile: 38, vol: 30, rev: 105000, lastChanged: 8, suggested: 4000 },
    { svc: "Emergency Support (hourly)", price: 250, unit: "hour", cost: 90, mktLow: 200, mktMed: 300, mktHigh: 500, pctile: 40, vol: 200, rev: 50000, lastChanged: 6, suggested: 300 },
  ];

  await supabase.from("track_pricing").insert(
    pricingRows.map(p => ({
      business_id: businessId, service_or_product: p.svc,
      current_price: p.price, unit: p.unit, cost_to_deliver: p.cost,
      current_margin_pct: ((p.price - p.cost) / p.price) * 100,
      market_low: p.mktLow, market_median: p.mktMed, market_high: p.mktHigh,
      percentile_position: p.pctile, volume_last_12mo: p.vol,
      revenue_last_12mo: p.rev,
      price_last_changed: fmt(new Date(now.getFullYear(), now.getMonth() - p.lastChanged, 1)),
      months_since_change: p.lastChanged, suggested_price: p.suggested,
      revenue_impact_if_adjusted: (p.suggested - p.price) * p.vol,
      elasticity_estimate: p.pctile < 20 ? "low" : "medium",
      competitor_count: 8 + Math.floor(Math.random() * 12),
    }))
  );
  seeded.push(`${pricingRows.length} pricing records`);

  // ═══ CLIENT PROFITABILITY (10 clients) ═══
  const clientRows = [
    { name: "Apex Corp", rev: 180000, costs: 72000, hours: 1200, dtp: 22, behavior: "on_time", ltv: 540000, cac: 3500, churn: "low" },
    { name: "Meridian LLC", rev: 95000, costs: 85000, hours: 900, dtp: 55, behavior: "late", ltv: 190000, cac: 5000, churn: "medium" }, // LEAK: barely profitable + slow pay
    { name: "NovaTech", rev: 145000, costs: 52000, hours: 800, dtp: 18, behavior: "early", ltv: 435000, cac: 2000, churn: "low" },
    { name: "Summit Group", rev: 280000, costs: 98000, hours: 1800, dtp: 30, behavior: "on_time", ltv: 840000, cac: 8000, churn: "low" }, // LEAK: concentration >25%
    { name: "Vertex Digital", rev: 45000, costs: 48000, hours: 650, dtp: 68, behavior: "very_late", ltv: 45000, cac: 6000, churn: "high" }, // LEAK: unprofitable + very slow
    { name: "Cascade Partners", rev: 72000, costs: 35000, hours: 500, dtp: 25, behavior: "on_time", ltv: 216000, cac: 2500, churn: "low" },
    { name: "Pine Street Ventures", rev: 38000, costs: 42000, hours: 520, dtp: 75, behavior: "very_late", ltv: 38000, cac: 4000, churn: "high" }, // LEAK: unprofitable
    { name: "BluePeak Analytics", rev: 110000, costs: 48000, hours: 700, dtp: 32, behavior: "on_time", ltv: 330000, cac: 3000, churn: "low" },
    { name: "Greenfield Ops", rev: 65000, costs: 30000, hours: 450, dtp: 28, behavior: "on_time", ltv: 195000, cac: 1500, churn: "low" },
    { name: "RedLine Logistics", rev: 22000, costs: 25000, hours: 380, dtp: 62, behavior: "late", ltv: 22000, cac: 7000, churn: "high" }, // LEAK: unprofitable + slow
  ];

  const periodStart = fmt(new Date(now.getFullYear(), now.getMonth() - 12, 1));
  const periodEnd = fmt(new Date(now.getFullYear(), now.getMonth(), 0));
  const totalClientRev = clientRows.reduce((s, c) => s + c.rev, 0);

  // Sort for ranking
  const byRevenue = [...clientRows].sort((a, b) => b.rev - a.rev);
  const byProfit = [...clientRows].sort((a, b) => (b.rev - b.costs) - (a.rev - a.costs));

  await supabase.from("track_client_profit").insert(
    clientRows.map(c => ({
      business_id: businessId, client_name: c.name,
      period_start: periodStart, period_end: periodEnd,
      gross_revenue: c.rev, direct_costs: c.costs,
      gross_profit: c.rev - c.costs,
      gross_margin_pct: ((c.rev - c.costs) / c.rev) * 100,
      hours_spent: c.hours,
      effective_hourly_rate: (c.rev - c.costs) / c.hours,
      revenue_rank: byRevenue.findIndex(r => r.name === c.name) + 1,
      profit_rank: byProfit.findIndex(r => r.name === c.name) + 1,
      is_profitable: c.rev > c.costs,
      payment_behavior: c.behavior, avg_days_to_pay: c.dtp,
      lifetime_value: c.ltv, acquisition_cost: c.cac,
      ltv_cac_ratio: c.ltv / c.cac, churn_risk: c.churn,
    }))
  );
  seeded.push(`${clientRows.length} client profitability records`);

  return {
    success: true,
    seeded,
    embeddedLeaks: [
      "Meta Ads: negative ROI ($1,800/mo spend, $1,200 revenue)",
      "LinkedIn Ads: zero revenue attribution",
      "CAC increasing 8%/month across all channels",
      "7.5% inventory shrinkage on supplies (theft/waste gap)",
      "Dead stock + overstock tying up cash",
      "12-22% overtime rate ($5K+/mo excess)",
      "2 employee departures ($30K replacement cost)",
      "6 missed tax deductions worth ~$8,350 in savings",
      "2 missing 1099 filings (penalty risk)",
      "4 services underpriced (bottom 15-22% of market)",
      "2 services with stale pricing (30-42 months unchanged)",
      "3 unprofitable clients (Vertex, Pine Street, RedLine)",
      "3 slow-paying clients (55-75 days to pay)",
      "Summit Group = 26% of revenue (concentration risk)",
    ],
  };
}
