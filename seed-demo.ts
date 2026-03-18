/**
 * LAW FIRM DEMO DATA SEEDER
 * Simulates a 6-attorney general practice firm (~$2M annual revenue)
 * Intentional leaks planted for engine detection
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function seedLawFirmDemoData(businessId: string) {
  // Clear existing data
  await Promise.all([
    supabase.from("lawfirm_billing").delete().eq("business_id", businessId),
    supabase.from("lawfirm_matters").delete().eq("business_id", businessId),
    supabase.from("lawfirm_clients").delete().eq("business_id", businessId),
    supabase.from("lawfirm_intake").delete().eq("business_id", businessId),
    supabase.from("lawfirm_overhead").delete().eq("business_id", businessId),
    supabase.from("lawfirm_trust").delete().eq("business_id", businessId),
    supabase.from("lawfirm_staffing").delete().eq("business_id", businessId),
    supabase.from("lawfirm_ar_aging").delete().eq("business_id", businessId),
  ]);

  const now = new Date();
  const months: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  // ─── ATTORNEYS ────────────────────────────────────────
  const attorneys = [
    { id: "ATT-001", name: "Sarah Mitchell", role: "partner", rate: 425, available: 176 },
    { id: "ATT-002", name: "David Chen", role: "partner", rate: 400, available: 176 },
    { id: "ATT-003", name: "Jessica Alvarez", role: "associate", rate: 275, available: 176 },
    { id: "ATT-004", name: "Marcus Thompson", role: "associate", rate: 250, available: 176 },
    { id: "ATT-005", name: "Emily Park", role: "associate", rate: 225, available: 176 },
    { id: "ATT-006", name: "Robert Hayes", role: "of_counsel", rate: 350, available: 120 },
  ];

  // ─── BILLING (6 months × 6 attorneys) ────────────────
  // LEAKS: Low utilization (32%), mediocre realization (82%), low collection (86%)
  const billingRows: any[] = [];
  for (const month of months) {
    for (const att of attorneys) {
      const utilPct = att.role === "partner" ? 0.30 + Math.random() * 0.08 :
                      att.role === "associate" ? 0.33 + Math.random() * 0.10 :
                      0.25 + Math.random() * 0.10;
      const billable = Math.round(att.available * utilPct * 10) / 10;
      // Realization: 78-86% (leak: below 88% avg)
      const realPct = 0.78 + Math.random() * 0.08;
      const billed = Math.round(billable * realPct * 10) / 10;
      const billedAmount = Math.round(billed * att.rate);
      // Collection: 82-90% (leak: below 91% avg)
      const collPct = 0.82 + Math.random() * 0.08;
      const collected = Math.round(billed * collPct * 10) / 10;
      const collectedAmount = Math.round(collected * att.rate);
      // Write-offs: 14% (leak: above 10%)
      const writeOffs = Math.round(billedAmount * (0.10 + Math.random() * 0.08));
      const discounts = Math.round(billedAmount * (0.03 + Math.random() * 0.04));
      const flatFee = att.role === "partner" ? Math.round(Math.random() * 3000) : 0;

      billingRows.push({
        business_id: businessId,
        period: fmt(month),
        attorney_id: att.id,
        attorney_name: att.name,
        attorney_role: att.role,
        available_hours: att.available,
        billable_hours: billable,
        billed_hours: billed,
        collected_hours: collected,
        standard_rate: att.rate,
        effective_rate: Math.round(collectedAmount / (collected || 1)),
        total_billed: billedAmount,
        total_collected: collectedAmount,
        write_offs: writeOffs,
        discounts_given: discounts,
        flat_fee_revenue: flatFee,
        contingency_revenue: 0,
      });
    }
  }
  await supabase.from("lawfirm_billing").insert(billingRows);

  // ─── MATTERS ─────────────────────────────────────────
  const practiceAreas = ["litigation", "family", "estate_planning", "real_estate", "corporate", "criminal_defense"];
  const matterRows: any[] = [];
  for (let i = 1; i <= 45; i++) {
    const area = practiceAreas[i % practiceAreas.length];
    const isClosed = i <= 25;
    const mType = i % 5 === 0 ? "flat_fee" : i % 7 === 0 ? "contingency" : "hourly";
    const totalHours = 10 + Math.random() * 80;
    const rate = 250 + Math.random() * 175;
    const totalBilled = Math.round(totalHours * rate * (0.75 + Math.random() * 0.20));
    const totalCollected = Math.round(totalBilled * (0.78 + Math.random() * 0.18));
    const costs = Math.round(500 + Math.random() * 5000);
    const writeOffs = Math.round(totalBilled * (0.05 + Math.random() * 0.15));
    const profitMargin = isClosed ? Math.round(((totalCollected - costs) / (totalCollected || 1)) * 100) : null;
    // LEAK: some matters have <10% or negative margins
    const budget = mType === "flat_fee" ? Math.round(totalBilled * 0.85) : null;

    matterRows.push({
      business_id: businessId,
      matter_id: `MAT-2024-${String(i).padStart(3, "0")}`,
      matter_name: `${area.replace("_", " ")} - Client ${String.fromCharCode(64 + (i % 26) + 1)}`,
      practice_area: area,
      matter_type: mType,
      client_id: `CLT-${String((i % 20) + 1).padStart(3, "0")}`,
      date_opened: fmt(new Date(now.getFullYear(), now.getMonth() - (isClosed ? 8 : 3) - Math.floor(Math.random() * 4), 1)),
      date_closed: isClosed ? fmt(new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * 3), 1)) : null,
      status: isClosed ? "closed" : "active",
      total_hours: Math.round(totalHours * 10) / 10,
      total_billed: totalBilled,
      total_collected: totalCollected,
      total_costs: costs,
      total_write_offs: writeOffs,
      budget_amount: budget,
      realization_rate: Math.round((totalBilled / (totalHours * rate)) * 100),
      collection_rate: Math.round((totalCollected / totalBilled) * 100),
      profit_margin: profitMargin,
      days_to_invoice: 15 + Math.floor(Math.random() * 40), // LEAK: slow invoicing
      days_to_collect: 25 + Math.floor(Math.random() * 50),
    });
  }
  await supabase.from("lawfirm_matters").insert(matterRows);

  // ─── CLIENTS ─────────────────────────────────────────
  const sources = ["referral", "website", "advertising", "repeat", "referral", "referral"];
  const clientRows: any[] = [];
  for (let i = 1; i <= 20; i++) {
    const revenue = 5000 + Math.random() * 80000;
    // LEAK: top client = 28% of revenue (concentration risk)
    const boosted = i === 1 ? revenue * 4 : i <= 3 ? revenue * 2 : revenue;
    clientRows.push({
      business_id: businessId,
      client_id: `CLT-${String(i).padStart(3, "0")}`,
      client_name: `Client ${String.fromCharCode(64 + i)}`,
      client_type: i <= 5 ? "corporate" : "individual",
      date_acquired: fmt(new Date(now.getFullYear() - Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1)),
      acquisition_source: sources[i % sources.length],
      total_matters: 1 + Math.floor(Math.random() * 5),
      total_revenue: Math.round(boosted),
      total_outstanding: Math.round(boosted * (0.05 + Math.random() * 0.15)),
      avg_collection_days: 30 + Math.floor(Math.random() * 60),
      lifetime_value: Math.round(boosted * (1 + Math.random() * 0.5)),
      is_active: i <= 15,
      last_matter_date: fmt(new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * 6), 1)),
      satisfaction_score: 5 + Math.round(Math.random() * 5 * 10) / 10,
      referrals_generated: Math.floor(Math.random() * 4),
    });
  }
  await supabase.from("lawfirm_clients").insert(clientRows);

  // ─── INTAKE (6 months) ──────────────────────────────
  // LEAKS: 38% missed calls, 22 min response time, 11% conversion
  const intakeRows: any[] = [];
  for (const month of months) {
    const calls = 60 + Math.floor(Math.random() * 30);
    const answered = Math.round(calls * (0.55 + Math.random() * 0.12)); // LEAK: 62% answer
    const missed = calls - answered;
    const webLeads = 15 + Math.floor(Math.random() * 15);
    const totalInquiries = calls + webLeads;
    const consults = Math.round(totalInquiries * (0.18 + Math.random() * 0.08));
    const signed = Math.round(consults * (0.45 + Math.random() * 0.15));

    intakeRows.push({
      business_id: businessId,
      period: fmt(month),
      total_inquiries: totalInquiries,
      calls_received: calls,
      calls_answered: answered,
      calls_missed: missed,
      voicemails_left: Math.round(missed * 0.3),
      web_form_leads: webLeads,
      avg_response_time_minutes: 18 + Math.floor(Math.random() * 15), // LEAK: slow
      consultations_scheduled: consults,
      consultations_completed: Math.round(consults * 0.85),
      clients_signed: signed,
      lead_to_consult_rate: Math.round((consults / totalInquiries) * 100),
      consult_to_client_rate: Math.round((signed / consults) * 100),
      overall_conversion_rate: Math.round((signed / totalInquiries) * 100), // LEAK: ~11%
      marketing_source_breakdown: JSON.stringify({
        google: 35, referral: 30, website: 15, social_media: 10, advertising: 10
      }),
    });
  }
  await supabase.from("lawfirm_intake").insert(intakeRows);

  // ─── OVERHEAD (6 months) ─────────────────────────────
  // LEAK: 52% overhead ratio (above 45% target), 24% profit margin (below 35%)
  const overheadRows: any[] = [];
  for (const month of months) {
    const revenue = 155000 + Math.random() * 30000;
    const rent = 8500;
    const staffSalaries = 28000 + Math.random() * 3000;
    const tech = 3500 + Math.random() * 1000;
    const insurance = 4200;
    const marketing = 2800 + Math.random() * 1200; // LEAK: only ~2% of revenue
    const pd = 800 + Math.random() * 400;
    const supplies = 500 + Math.random() * 300;
    const filing = 1200 + Math.random() * 800;
    const expert = 2000 + Math.random() * 3000;
    const travel = 600 + Math.random() * 400;
    const other = 1500 + Math.random() * 500;
    const totalOverhead = rent + staffSalaries + tech + insurance + marketing + pd + supplies + filing + expert + travel + other;
    const profit = revenue - totalOverhead - (revenue * 0.25); // 25% to attorney comp

    overheadRows.push({
      business_id: businessId,
      period: fmt(month),
      total_revenue: Math.round(revenue),
      total_overhead: Math.round(totalOverhead),
      rent: Math.round(rent),
      staff_salaries: Math.round(staffSalaries),
      technology: Math.round(tech),
      insurance: Math.round(insurance),
      marketing_spend: Math.round(marketing),
      professional_development: Math.round(pd),
      office_supplies: Math.round(supplies),
      court_filing_fees: Math.round(filing),
      expert_witness_fees: Math.round(expert),
      travel: Math.round(travel),
      other_overhead: Math.round(other),
      net_profit: Math.round(profit),
      profit_margin: Math.round((profit / revenue) * 100),
      overhead_ratio: Math.round((totalOverhead / revenue) * 100),
    });
  }
  await supabase.from("lawfirm_overhead").insert(overheadRows);

  // ─── TRUST ACCOUNTS (6 months) ──────────────────────
  // LEAKS: 2 negative balance incidents, 1 missed reconciliation, stale balances, earned fees in trust
  const trustRows: any[] = [];
  for (let i = 0; i < months.length; i++) {
    const month = months[i];
    trustRows.push({
      business_id: businessId,
      period: fmt(month),
      total_trust_balance: 120000 + Math.random() * 40000,
      total_client_ledgers: 25 + Math.floor(Math.random() * 10),
      deposits_count: 8 + Math.floor(Math.random() * 6),
      disbursements_count: 6 + Math.floor(Math.random() * 5),
      three_way_reconciled: i !== 2, // LEAK: month 3 missed reconciliation
      reconciliation_date: i !== 2 ? fmt(new Date(month.getFullYear(), month.getMonth() + 1, 5)) : null,
      negative_balance_incidents: i === 1 || i === 4 ? 1 : 0, // LEAK: 2 incidents
      commingling_flags: i === 3 ? 1 : 0, // LEAK: 1 commingling flag
      unearned_fees_held: 35000 + Math.random() * 15000,
      earned_fees_not_transferred: 6000 + Math.random() * 4000, // LEAK: $6-10K/mo
      stale_balances_over_90_days: 8000 + Math.random() * 5000, // LEAK: stale
      overdraft_incidents: i === 4 ? 1 : 0,
    });
  }
  await supabase.from("lawfirm_trust").insert(trustRows);

  // ─── STAFFING (6 months) ────────────────────────────
  // LEAK: 28% turnover, low leverage, low RPL
  const staffingRows: any[] = [];
  for (const month of months) {
    const revenue = 155000 + Math.random() * 30000;
    staffingRows.push({
      business_id: businessId,
      period: fmt(month),
      total_attorneys: 6,
      partners: 2,
      associates: 3,
      of_counsel: 1,
      paralegals: 2,
      support_staff: 3, // LEAK: low ratio
      total_compensation: 65000 + Math.random() * 5000,
      revenue_per_lawyer: Math.round(revenue * 12 / 6), // ~$310K LEAK: below $400K
      profit_per_partner: Math.round((revenue * 0.24) * 12 / 2),
      leverage_ratio: 1.5, // 3 associates / 2 partners
      staff_to_attorney_ratio: 0.83, // 5 staff / 6 attorneys
      departures_this_period: month.getMonth() % 4 === 0 ? 1 : 0,
      new_hires_this_period: month.getMonth() % 5 === 0 ? 1 : 0,
      annualized_turnover_rate: 28, // LEAK: 28% vs 10% target
      avg_attorney_tenure_months: 26,
    });
  }
  await supabase.from("lawfirm_staffing").insert(staffingRows);

  // ─── AR AGING (3 snapshots) ─────────────────────────
  // LEAK: 22% of AR over 90 days, 105-day total lockup
  const arRows: any[] = [];
  for (let i = 2; i >= 0; i--) {
    const snapDate = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const totalAR = 95000 + Math.random() * 25000;
    const current = totalAR * (0.35 + Math.random() * 0.05);
    const d31_60 = totalAR * (0.20 + Math.random() * 0.05);
    const d61_90 = totalAR * (0.15 + Math.random() * 0.03);
    const d91_120 = totalAR * (0.12 + Math.random() * 0.03); // LEAK
    const over120 = totalAR - current - d31_60 - d61_90 - d91_120; // LEAK
    const totalWIP = 45000 + Math.random() * 15000;

    arRows.push({
      business_id: businessId,
      snapshot_date: fmt(snapDate),
      total_ar: Math.round(totalAR),
      ar_current: Math.round(current),
      ar_31_60: Math.round(d31_60),
      ar_61_90: Math.round(d61_90),
      ar_91_120: Math.round(d91_120),
      ar_over_120: Math.round(Math.max(0, over120)),
      total_wip: Math.round(totalWIP),
      wip_over_30_days: Math.round(totalWIP * 0.40),
      wip_over_60_days: Math.round(totalWIP * 0.22), // LEAK: stale WIP
      realization_lockup_days: 48 + Math.floor(Math.random() * 10), // LEAK: above 43 median
      collection_lockup_days: 42 + Math.floor(Math.random() * 10), // LEAK: above 32 median
      total_lockup_days: 95 + Math.floor(Math.random() * 15), // LEAK: above 93 median
    });
  }
  await supabase.from("lawfirm_ar_aging").insert(arRows);

  return {
    success: true,
    summary: {
      billing_records: billingRows.length,
      matters: matterRows.length,
      clients: clientRows.length,
      intake_months: intakeRows.length,
      overhead_months: overheadRows.length,
      trust_months: trustRows.length,
      staffing_months: staffingRows.length,
      ar_snapshots: arRows.length,
    },
  };
}
