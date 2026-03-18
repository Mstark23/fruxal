// =============================================================================
// ADVANCED TRACKING ENGINE — 18 Detectors
// =============================================================================
// Closes the blind spots that transaction scanning alone can't see:
//
// MARKETING (3 detectors):
//   1. Negative-ROI Channels      2. CAC Creep      3. Untracked Spend
//
// INVENTORY (3 detectors):
//   4. Shrinkage/Theft Gap    5. Dead Stock     6. Overstock Waste
//
// LABOR (3 detectors):
//   7. Overtime Bleed    8. Revenue-per-Employee    9. Turnover Cost
//
// TAX (3 detectors):
//   10. Missed Deductions    11. Stale Tax Strategy    12. 1099 Gaps
//
// PRICING (3 detectors):
//   13. Underpriced Services    14. Stale Pricing    15. Margin Compression
//
// CLIENT PROFITABILITY (3 detectors):
//   16. Unprofitable Clients    17. Slow Payers    18. Concentration Risk
// =============================================================================

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Leak {
  id: string;
  layer: string;
  category: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  currentValue: string;
  benchmark: string;
  annualImpact: number;
  description: string;
  recommendation: string;
  confidence: number;
}

export async function analyzeAdvancedTracking(businessId: string) {
  const leaks: Leak[] = [];

  const [
    { data: marketing },
    { data: inventory },
    { data: labor },
    { data: tax },
    { data: pricing },
    { data: clientProfit },
  ] = await Promise.all([
    supabase.from("track_marketing").select("*").eq("business_id", businessId),
    supabase.from("track_inventory").select("*").eq("business_id", businessId),
    supabase.from("track_labor").select("*").eq("business_id", businessId),
    supabase.from("track_tax").select("*").eq("business_id", businessId),
    supabase.from("track_pricing").select("*").eq("business_id", businessId),
    supabase.from("track_client_profit").select("*").eq("business_id", businessId),
  ]);

  const mkt = marketing || [];
  const inv = inventory || [];
  const lab = labor || [];
  const txData = tax || [];
  const prc = pricing || [];
  const cp = clientProfit || [];

  // ═══════════════════════════════════════════════════════════
  // MARKETING DETECTORS (1-3)
  // ═══════════════════════════════════════════════════════════

  // ─── 1. NEGATIVE-ROI CHANNELS ───
  if (mkt.length > 0) {
    const byChannel = new Map<string, { spend: number; revenue: number; customers: number }>();
    mkt.forEach(m => {
      const ch = m.channel;
      const curr = byChannel.get(ch) || { spend: 0, revenue: 0, customers: 0 };
      curr.spend += Number(m.spend || 0);
      curr.revenue += Number(m.revenue_attributed || 0);
      curr.customers += Number(m.customers_acquired || 0);
      byChannel.set(ch, curr);
    });

    byChannel.forEach((data, channel) => {
      if (data.spend > 500 && data.revenue < data.spend * 0.8) {
        const loss = data.spend - data.revenue;
        leaks.push({
          id: `mkt-negative-roi-${channel}`, layer: "Marketing", category: "ROI",
          title: `Negative ROI: ${channel.replace(/_/g, " ")}`,
          severity: loss > 5000 ? "critical" : loss > 2000 ? "high" : "medium",
          currentValue: `$${data.spend.toFixed(0)} spent → $${data.revenue.toFixed(0)} revenue (${((data.revenue / data.spend) * 100).toFixed(0)}% ROAS)`,
          benchmark: "Minimum 100% ROAS (break even), target 300%+",
          annualImpact: Math.round(loss * (12 / Math.max(1, mkt.filter(m => m.channel === channel).length))),
          description: `"${channel}" is costing more than it returns. $${loss.toFixed(0)} net loss. ${data.customers} customers acquired at $${data.customers > 0 ? (data.spend / data.customers).toFixed(0) : "∞"}/customer.`,
          recommendation: `Pause or reduce spend on ${channel}. Reallocate budget to channels with positive ROI. Test smaller budgets before scaling back up.`,
          confidence: 0.75,
        });
      }
    });

    // ─── 2. CAC CREEP ───
    const periods = [...new Set(mkt.map(m => m.period_start))].sort();
    if (periods.length >= 3) {
      const firstHalf = mkt.filter(m => periods.indexOf(m.period_start) < periods.length / 2);
      const secondHalf = mkt.filter(m => periods.indexOf(m.period_start) >= periods.length / 2);

      const earlyCAC = firstHalf.reduce((s, m) => s + Number(m.spend || 0), 0) / Math.max(1, firstHalf.reduce((s, m) => s + Number(m.customers_acquired || 0), 0));
      const recentCAC = secondHalf.reduce((s, m) => s + Number(m.spend || 0), 0) / Math.max(1, secondHalf.reduce((s, m) => s + Number(m.customers_acquired || 0), 0));
      const cacIncrease = earlyCAC > 0 ? ((recentCAC - earlyCAC) / earlyCAC) * 100 : 0;

      if (cacIncrease > 20 && recentCAC > 50) {
        leaks.push({
          id: "mkt-cac-creep", layer: "Marketing", category: "Efficiency",
          title: "Customer Acquisition Cost Rising",
          severity: cacIncrease > 50 ? "critical" : "high",
          currentValue: `CAC rose from $${earlyCAC.toFixed(0)} to $${recentCAC.toFixed(0)} (+${cacIncrease.toFixed(0)}%)`,
          benchmark: "CAC should be stable or decreasing over time",
          annualImpact: Math.round((recentCAC - earlyCAC) * secondHalf.reduce((s, m) => s + Number(m.customers_acquired || 0), 0) * 2),
          description: `It's getting ${cacIncrease.toFixed(0)}% more expensive to acquire each customer. Early periods averaged $${earlyCAC.toFixed(0)}/customer, recent periods $${recentCAC.toFixed(0)}.`,
          recommendation: `Audit channel performance individually. Double down on lowest-CAC channels. Improve conversion rates on landing pages. Consider referral programs.`,
          confidence: 0.70,
        });
      }
    }

    // ─── 3. UNTRACKED MARKETING SPEND ───
    const totalMktSpend = mkt.reduce((s, m) => s + Number(m.spend || 0), 0);
    const totalAttributed = mkt.reduce((s, m) => s + Number(m.revenue_attributed || 0), 0);
    const noAttribution = mkt.filter(m => Number(m.revenue_attributed || 0) === 0 && Number(m.spend || 0) > 0);
    if (noAttribution.length > 0) {
      const untrackedSpend = noAttribution.reduce((s, m) => s + Number(m.spend || 0), 0);
      leaks.push({
        id: "mkt-untracked", layer: "Marketing", category: "Visibility",
        title: "Marketing Spend Without Attribution",
        severity: untrackedSpend > 3000 ? "high" : "medium",
        currentValue: `$${untrackedSpend.toFixed(0)} across ${noAttribution.length} channel-periods with zero attributed revenue`,
        benchmark: "All marketing spend should have measurable attribution",
        annualImpact: Math.round(untrackedSpend * 0.3),
        description: `${noAttribution.length} marketing entries show spend but zero attributed revenue. Either the channels aren't working or tracking isn't set up — both are problems.`,
        recommendation: `Set up UTM tracking and conversion pixels. Use unique promo codes per channel. Implement CRM attribution. If truly no ROI, cut the spend.`,
        confidence: 0.60,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // INVENTORY DETECTORS (4-6)
  // ═══════════════════════════════════════════════════════════

  if (inv.length > 0) {
    // ─── 4. SHRINKAGE / THEFT GAP ───
    inv.forEach(item => {
      const shrinkPct = Number(item.shrinkage_pct || 0);
      const unaccounted = Number(item.unaccounted_loss || 0);
      if (shrinkPct > 3 && unaccounted > 500) {
        leaks.push({
          id: `inv-shrinkage-${item.category}-${item.period_start}`, layer: "Inventory", category: "Shrinkage",
          title: `Inventory Shrinkage: ${item.category}`,
          severity: shrinkPct > 8 ? "critical" : shrinkPct > 5 ? "high" : "medium",
          currentValue: `${shrinkPct.toFixed(1)}% shrinkage — $${unaccounted.toFixed(0)} unaccounted`,
          benchmark: "Target: <2% shrinkage, Industry avg: 1.4-3%",
          annualImpact: Math.round(unaccounted * (12 / Math.max(1, inv.filter(i => i.category === item.category).length))),
          description: `$${Number(item.shrinkage || 0).toFixed(0)} gap between theoretical and actual COGS for ${item.category}. Known waste accounts for $${Number(item.waste_logged || 0).toFixed(0)}, leaving $${unaccounted.toFixed(0)} unexplained (possible theft, spoilage, or data errors).`,
          recommendation: `Implement inventory counts (weekly for high-value items). Install cameras in storage areas. Review receiving procedures. Cross-reference purchase orders with deliveries.`,
          confidence: 0.65,
        });
      }
    });

    // ─── 5. DEAD STOCK ───
    const totalDeadStock = inv.reduce((s, i) => s + Number(i.dead_stock_value || 0), 0);
    if (totalDeadStock > 1000) {
      leaks.push({
        id: "inv-dead-stock", layer: "Inventory", category: "Waste",
        title: "Dead Stock Tying Up Cash",
        severity: totalDeadStock > 10000 ? "critical" : totalDeadStock > 5000 ? "high" : "medium",
        currentValue: `$${totalDeadStock.toFixed(0)} in inventory sitting >90 days`,
        benchmark: "Dead stock should be <5% of total inventory value",
        annualImpact: Math.round(totalDeadStock * 0.5),
        description: `$${totalDeadStock.toFixed(0)} worth of inventory hasn't moved in 90+ days. This is cash trapped in product that may never sell, plus storage costs.`,
        recommendation: `Run clearance sales, bundle with popular items, donate for tax write-off, or write off and prevent re-ordering. Review purchasing patterns to prevent future dead stock.`,
        confidence: 0.80,
      });
    }

    // ─── 6. OVERSTOCK ───
    const totalOverstock = inv.reduce((s, i) => s + Number(i.overstock_value || 0), 0);
    if (totalOverstock > 3000) {
      leaks.push({
        id: "inv-overstock", layer: "Inventory", category: "Cash Flow",
        title: "Overstocked — Cash Trapped in Inventory",
        severity: totalOverstock > 15000 ? "high" : "medium",
        currentValue: `$${totalOverstock.toFixed(0)} beyond 30-day supply need`,
        benchmark: "Optimal: 2-4 weeks supply on hand",
        annualImpact: Math.round(totalOverstock * 0.15),
        description: `Carrying $${totalOverstock.toFixed(0)} more inventory than needed for 30 days. Excess stock ties up cash, risks spoilage/obsolescence, and adds storage costs.`,
        recommendation: `Reduce order quantities, negotiate more frequent smaller deliveries, implement just-in-time ordering, and set par levels based on actual usage.`,
        confidence: 0.70,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // LABOR DETECTORS (7-9)
  // ═══════════════════════════════════════════════════════════

  if (lab.length > 0) {
    // ─── 7. OVERTIME BLEED ───
    const avgOT = lab.reduce((s, l) => s + Number(l.overtime_pct || 0), 0) / lab.length;
    const totalOTCost = lab.reduce((s, l) => s + Number(l.overtime_cost || 0), 0);
    if (avgOT > 10) {
      leaks.push({
        id: "labor-overtime", layer: "Labor", category: "Overtime",
        title: "Excessive Overtime Spending",
        severity: avgOT > 20 ? "critical" : avgOT > 15 ? "high" : "medium",
        currentValue: `${avgOT.toFixed(1)}% overtime rate — $${totalOTCost.toFixed(0)} total`,
        benchmark: "Target: <10% of total hours, optimal: 5-8%",
        annualImpact: Math.round(totalOTCost * (12 / lab.length) * 0.5),
        description: `${avgOT.toFixed(1)}% of hours are overtime (1.5x cost). Often cheaper to hire another part-time employee than to sustain high overtime.`,
        recommendation: `Analyze which roles generate most OT. Consider part-time hires for peak periods. Review scheduling for inefficiencies. Set OT approval requirements.`,
        confidence: 0.85,
      });
    }

    // ─── 8. REVENUE PER EMPLOYEE ───
    const latestLabor = lab.sort((a, b) => b.period_start.localeCompare(a.period_start))[0];
    const revPerEmp = Number(latestLabor?.revenue_per_employee || 0);
    if (revPerEmp > 0 && revPerEmp < 15000) {
      leaks.push({
        id: "labor-rev-per-emp", layer: "Labor", category: "Productivity",
        title: "Low Revenue Per Employee",
        severity: revPerEmp < 10000 ? "critical" : "high",
        currentValue: `$${revPerEmp.toFixed(0)}/employee/month`,
        benchmark: "Varies by industry, but $15K-25K+/employee/month is healthy",
        annualImpact: Math.round((15000 - revPerEmp) * Number(latestLabor?.headcount || 5) * 12),
        description: `Each employee generates $${revPerEmp.toFixed(0)}/month in revenue. Low productivity could indicate overstaffing, inefficient processes, or insufficient sales volume.`,
        recommendation: `Cross-train staff, eliminate redundant roles, automate repetitive tasks, and ensure every role directly supports revenue generation.`,
        confidence: 0.65,
      });
    }

    // ─── 9. TURNOVER COST ───
    const totalTurnoverCost = lab.reduce((s, l) => s + Number(l.turnover_cost_est || 0), 0);
    const totalTurnover = lab.reduce((s, l) => s + Number(l.turnover_count || 0), 0);
    if (totalTurnoverCost > 5000) {
      leaks.push({
        id: "labor-turnover", layer: "Labor", category: "Retention",
        title: "Employee Turnover Draining Cash",
        severity: totalTurnoverCost > 20000 ? "critical" : "high",
        currentValue: `${totalTurnover} departures costing ~$${totalTurnoverCost.toFixed(0)}`,
        benchmark: "Each replacement costs 50-200% of annual salary",
        annualImpact: Math.round(totalTurnoverCost * (12 / lab.length)),
        description: `${totalTurnover} employees left, estimated replacement cost $${totalTurnoverCost.toFixed(0)}. Includes recruiting, training, lost productivity during ramp-up.`,
        recommendation: `Conduct exit interviews, benchmark compensation, improve onboarding, create growth paths, and address top reasons for departure.`,
        confidence: 0.60,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TAX DETECTORS (10-12)
  // ═══════════════════════════════════════════════════════════

  if (txData.length > 0) {
    // ─── 10. MISSED DEDUCTIONS ───
    const potentialDeductions = txData.filter(t => t.status === "potential" && Number(t.gap || 0) > 0);
    if (potentialDeductions.length > 0) {
      const totalGap = potentialDeductions.reduce((s, t) => s + Number(t.estimated_savings || 0), 0);
      leaks.push({
        id: "tax-missed-deductions", layer: "Tax", category: "Deductions",
        title: `${potentialDeductions.length} Potential Missed Tax Deductions`,
        severity: totalGap > 5000 ? "critical" : totalGap > 2000 ? "high" : "medium",
        currentValue: `${potentialDeductions.length} unclaimed deductions worth ~$${totalGap.toFixed(0)} in tax savings`,
        benchmark: "Businesses miss an average of $5,000-$20,000 in deductions annually",
        annualImpact: Math.round(totalGap),
        description: `Found ${potentialDeductions.length} potential deductions not currently being claimed: ${potentialDeductions.map(t => t.category.replace(/_/g, " ")).join(", ")}. These require verification with a tax professional.`,
        recommendation: `Review each potential deduction with your CPA. Start documenting expenses in flagged categories. Implement expense tracking that auto-tags deductible categories.`,
        confidence: 0.55,
      });
    }

    // ─── 11. STALE TAX STRATEGY ───
    const currentYear = new Date().getFullYear();
    const hasCurrentYear = txData.some(t => t.tax_year === currentYear || t.tax_year === currentYear - 1);
    if (!hasCurrentYear && txData.length > 0) {
      leaks.push({
        id: "tax-stale", layer: "Tax", category: "Strategy",
        title: "Tax Strategy Not Updated Recently",
        severity: "medium",
        currentValue: `Last tax review: ${Math.max(...txData.map(t => t.tax_year))}`,
        benchmark: "Tax strategy should be reviewed annually",
        annualImpact: 2000,
        description: `No tax optimization data for current or prior year. Tax law changes annually — deductions and credits you qualified for may have changed.`,
        recommendation: `Schedule annual tax planning session (ideally Q4). Review new deductions for your industry. Consider entity structure optimization.`,
        confidence: 0.50,
      });
    }

    // ─── 12. 1099 GAPS ───
    const missed1099 = txData.filter(t => t.category === "missed_1099");
    if (missed1099.length > 0) {
      const total1099Gap = missed1099.reduce((s, t) => s + Number(t.estimated_deduction || 0), 0);
      leaks.push({
        id: "tax-1099", layer: "Tax", category: "Compliance",
        title: "Missing 1099 Filings — Penalty Risk",
        severity: missed1099.length > 3 ? "critical" : "high",
        currentValue: `${missed1099.length} contractors paid >$600 without 1099`,
        benchmark: "All contractor payments >$600/year require 1099-NEC",
        annualImpact: missed1099.length * 280,
        description: `${missed1099.length} contractor payments exceed $600 annual threshold without 1099 filing. IRS penalty is $60-$310 per missed form plus potential audit trigger.`,
        recommendation: `Collect W-9 from all contractors before first payment. File 1099-NEC by January 31st. Use accounting software to auto-flag 1099 thresholds.`,
        confidence: 0.80,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PRICING DETECTORS (13-15)
  // ═══════════════════════════════════════════════════════════

  if (prc.length > 0) {
    // ─── 13. UNDERPRICED SERVICES ───
    prc.forEach(item => {
      const position = Number(item.percentile_position || 50);
      const marketMedian = Number(item.market_median || 0);
      const currentPrice = Number(item.current_price || 0);

      if (position < 25 && marketMedian > 0 && currentPrice < marketMedian * 0.85) {
        const volumeOrOne = Number(item.volume_last_12mo || 1);
        const gapPerUnit = marketMedian - currentPrice;
        leaks.push({
          id: `price-under-${item.service_or_product}`, layer: "Pricing", category: "Underpricing",
          title: `Underpriced: ${item.service_or_product}`,
          severity: position < 15 ? "critical" : "high",
          currentValue: `$${currentPrice.toFixed(2)} (${position.toFixed(0)}th percentile)`,
          benchmark: `Market median: $${marketMedian.toFixed(2)}, range $${Number(item.market_low).toFixed(2)}-$${Number(item.market_high).toFixed(2)}`,
          annualImpact: Math.round(gapPerUnit * volumeOrOne),
          description: `"${item.service_or_product}" is priced in the bottom ${position.toFixed(0)}% of the market. At ${volumeOrOne} units/year, matching median price would add $${(gapPerUnit * volumeOrOne).toFixed(0)}/year.`,
          recommendation: `Test a 10-15% price increase and measure impact on volume. Position value, not just price. Review competitor pricing quarterly.`,
          confidence: 0.70,
        });
      }
    });

    // ─── 14. STALE PRICING ───
    prc.forEach(item => {
      const monthsSince = Number(item.months_since_change || 0);
      if (monthsSince > 18) {
        const inflationLoss = Number(item.revenue_last_12mo || 0) * 0.04 * (monthsSince / 12);
        leaks.push({
          id: `price-stale-${item.service_or_product}`, layer: "Pricing", category: "Stale",
          title: `Price Unchanged ${monthsSince} Months: ${item.service_or_product}`,
          severity: monthsSince > 36 ? "high" : "medium",
          currentValue: `$${Number(item.current_price).toFixed(2)} — unchanged for ${monthsSince} months`,
          benchmark: "Prices should be reviewed at least annually for inflation",
          annualImpact: Math.round(inflationLoss),
          description: `"${item.service_or_product}" hasn't had a price change in ${monthsSince} months. With ~4% annual inflation, your effective price has dropped ~${(4 * monthsSince / 12).toFixed(0)}% in real terms.`,
          recommendation: `Implement annual price reviews. Even 3-5% annual increases maintain real value. Communicate value additions alongside increases.`,
          confidence: 0.75,
        });
      }
    });

    // ─── 15. MARGIN COMPRESSION ───
    prc.forEach(item => {
      const margin = Number(item.current_margin_pct || 0);
      if (margin > 0 && margin < 30) {
        leaks.push({
          id: `price-margin-${item.service_or_product}`, layer: "Pricing", category: "Margin",
          title: `Low Margin: ${item.service_or_product}`,
          severity: margin < 15 ? "critical" : margin < 20 ? "high" : "medium",
          currentValue: `${margin.toFixed(1)}% margin ($${Number(item.current_price).toFixed(2)} price, $${Number(item.cost_to_deliver).toFixed(2)} cost)`,
          benchmark: "Target: 40-60%+ margin depending on industry",
          annualImpact: Math.round(Number(item.revenue_last_12mo || 0) * ((40 - margin) / 100)),
          description: `"${item.service_or_product}" has only ${margin.toFixed(1)}% margin. After overhead allocation, this may be a money loser.`,
          recommendation: `Reduce delivery costs, increase price, or consider discontinuing. Analyze whether this product/service drives other profitable sales.`,
          confidence: 0.70,
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // CLIENT PROFITABILITY DETECTORS (16-18)
  // ═══════════════════════════════════════════════════════════

  if (cp.length > 0) {
    // ─── 16. UNPROFITABLE CLIENTS ───
    const unprofitable = cp.filter(c => !c.is_profitable || Number(c.gross_margin_pct || 100) < 10);
    if (unprofitable.length > 0) {
      const totalLoss = unprofitable.reduce((s, c) => s + Math.max(0, Number(c.direct_costs || 0) - Number(c.gross_revenue || 0)), 0);
      leaks.push({
        id: "client-unprofitable", layer: "Clients", category: "Profitability",
        title: `${unprofitable.length} Unprofitable Client(s)`,
        severity: unprofitable.length > 3 ? "critical" : "high",
        currentValue: `${unprofitable.length} clients with <10% margin`,
        benchmark: "Every client should contribute >20% gross margin minimum",
        annualImpact: Math.round(totalLoss > 0 ? totalLoss * (12 / cp.length) * cp.length / Math.max(1, [...new Set(cp.map(c => c.client_name))].length) : unprofitable.length * 5000),
        description: `${unprofitable.length} clients are generating revenue below cost or at razor-thin margins: ${unprofitable.map(c => c.client_name).slice(0, 5).join(", ")}. These clients consume resources that could serve profitable ones.`,
        recommendation: `Renegotiate rates, reduce scope, increase efficiency for these accounts, or transition them out. Calculate true cost-to-serve including overhead.`,
        confidence: 0.75,
      });
    }

    // ─── 17. SLOW-PAYING CLIENTS ───
    const slowPayers = cp.filter(c => Number(c.avg_days_to_pay || 0) > 45);
    if (slowPayers.length > 0) {
      const avgDays = slowPayers.reduce((s, c) => s + Number(c.avg_days_to_pay || 0), 0) / slowPayers.length;
      const totalSlowRevenue = slowPayers.reduce((s, c) => s + Number(c.gross_revenue || 0), 0);
      leaks.push({
        id: "client-slow-pay", layer: "Clients", category: "Cash Flow",
        title: `${slowPayers.length} Slow-Paying Clients`,
        severity: avgDays > 60 ? "high" : "medium",
        currentValue: `${slowPayers.length} clients averaging ${avgDays.toFixed(0)} days to pay`,
        benchmark: "Target: <30 days payment, max 45 days",
        annualImpact: Math.round(totalSlowRevenue * 0.05),
        description: `${slowPayers.length} clients take ${avgDays.toFixed(0)}+ days to pay, representing $${totalSlowRevenue.toFixed(0)} in revenue. Slow payment increases borrowing costs and cash flow risk.`,
        recommendation: `Implement late payment fees, offer early payment discounts (2/10 net 30), require deposits for new work, and send invoices immediately upon delivery.`,
        confidence: 0.80,
      });
    }

    // ─── 18. CLIENT CONCENTRATION RISK ───
    const clientRevenue = new Map<string, number>();
    cp.forEach(c => {
      clientRevenue.set(c.client_name, (clientRevenue.get(c.client_name) || 0) + Number(c.gross_revenue || 0));
    });
    const totalClientRev = Array.from(clientRevenue.values()).reduce((s, v) => s + v, 0);

    clientRevenue.forEach((rev, name) => {
      const pct = totalClientRev > 0 ? (rev / totalClientRev) * 100 : 0;
      if (pct > 25) {
        leaks.push({
          id: `client-concentration-${name}`, layer: "Clients", category: "Risk",
          title: `Client Concentration: ${name}`,
          severity: pct > 40 ? "critical" : "high",
          currentValue: `${name} = ${pct.toFixed(0)}% of revenue ($${rev.toFixed(0)})`,
          benchmark: "No single client should exceed 20-25% of revenue",
          annualImpact: Math.round(rev * 0.10),
          description: `${name} represents ${pct.toFixed(0)}% of total revenue. Losing this client would create an immediate $${rev.toFixed(0)} revenue gap. This is existential risk.`,
          recommendation: `Actively diversify client base. Set a policy that no client exceeds 20% of revenue. Invest in business development to reduce dependency.`,
          confidence: 0.90,
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // COVERAGE SCORE — How complete is the data?
  // ═══════════════════════════════════════════════════════════
  const coverage = {
    marketing: mkt.length > 0,
    inventory: inv.length > 0,
    labor: lab.length > 0,
    tax: txData.length > 0,
    pricing: prc.length > 0,
    clientProfitability: cp.length > 0,
  };
  const coveragePct = Object.values(coverage).filter(Boolean).length / Object.keys(coverage).length * 100;

  const totalImpact = leaks.reduce((s, l) => s + l.annualImpact, 0);

  return {
    leaks,
    coverage,
    summary: {
      totalLeaks: leaks.length,
      critical: leaks.filter(l => l.severity === "critical").length,
      high: leaks.filter(l => l.severity === "high").length,
      medium: leaks.filter(l => l.severity === "medium").length,
      totalAnnualImpact: totalImpact,
      coveragePct,
      layersActive: Object.values(coverage).filter(Boolean).length,
      layersTotal: Object.keys(coverage).length,
    },
  };
}
