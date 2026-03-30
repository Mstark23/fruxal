// =============================================================================
// V2 SMART PRESCAN API — Size-aware, industry-specific, location-benchmarked
// =============================================================================
// GET  ?industry=X&size=solo|small|growth  → filtered smart questions
// POST {industry, size, answers}           → YOUR NUMBER vs BENCHMARK = $ DIFFERENCE
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const rl: Map<string, { c: number; r: number }> = new Map();
function rateCheck(key: string, max: number, ms: number): boolean {
  const now = Date.now();
  const e = rl.get(key);
  if (!e || e.r < now) { rl.set(key, { c: 1, r: now + ms }); return true; }
  e.c++;
  return e.c <= max;
}

const PROV: Record<string, string> = {
  QC: "Quebec", ON: "Ontario", BC: "British Columbia", AB: "Alberta",
  SK: "Saskatchewan", MB: "Manitoba", NS: "Nova Scotia", NB: "New Brunswick",
  NL: "Newfoundland", PE: "PEI",
};

const DISPLAY: Record<string, string> = {
  restaurant: "Restaurant", dental: "Dental Practice", accounting: "Accounting Firm",
  construction: "Construction", salon: "Salon & Beauty", retail: "Retail Store",
  fitness: "Fitness / Gym", healthcare: "Healthcare", consulting: "Consulting",
  "real-estate": "Real Estate", ecommerce: "E-Commerce", plumbing: "Plumbing",
  electrical: "Electrical", landscaping: "Landscaping", "auto-repair": "Auto Repair",
  daycare: "Daycare", veterinary: "Veterinary", bakery: "Bakery", cafe: "Café",
};

// Helper: parse answer to number (handles string/number, -1 = "don't know")
function num(val: any, fallback = 0): number {
  if (val === undefined || val === null || val === "" || val === "-1") return fallback;
  const n = parseFloat(String(val));
  return isNaN(n) ? fallback : n;
}

interface Finding {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  impactAnnual: number;
  benchmark: string;
  yourNumber: string;
  source: string;
  confidence: "high" | "medium" | "low";
  fixHint: string;
}

// ─── GET: Return questions ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const industry = req.nextUrl.searchParams.get("industry");
  if (!industry) return NextResponse.json({ error: "industry required" }, { status: 400 });

  const slug = industry.toLowerCase().replace(/\s+/g, "-");
  const size = req.nextUrl.searchParams.get("size") || "small"; // solo | small | growth

  // Determine size tier from revenue + employees if provided
  const sizeTier = ["solo", "small", "growth"].includes(size) ? size : "small";

  const { data: questions } = await supabase
    .from("smart_questions")
    .select("*")
    .in("industry", ["_universal", slug])
    .eq("is_active", true)
    .contains("size_tiers", [sizeTier])
    .order("display_order");

  return NextResponse.json({
    industry: { id: slug, name: DISPLAY[slug] || slug },
    size: sizeTier,
    questions: (questions || []).map(q => ({
      id: q.id,
      text: q.question_text,
      type: q.question_type,
      dataKey: q.data_key,
      choices: q.choices || null,
      placeholder: q.placeholder,
      helpText: q.help_text,
      order: q.display_order,
    })),
  });
}

// ─── POST: Analyze answers ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateCheck(`smart:${ip}`, 20, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { industry, monthlyRevenue, employeeCount, answers } = body;

    if (!industry || !monthlyRevenue || !answers) {
      return NextResponse.json({ error: "industry, monthlyRevenue, and answers required" }, { status: 400 });
    }

    const slug = industry.toLowerCase().replace(/\s+/g, "-");
    const mRev = parseFloat(monthlyRevenue);
    const aRev = mRev * 12;
    const emp = employeeCount || 1;
    const sizeTier = body.size || (emp <= 1 && mRev < 15000 ? "solo" : emp <= 10 ? "small" : "growth");
    const prov = answers.province || "";
    const provName = PROV[prov] || prov;

    // Load benchmarks
    const { data: benchmarks } = await supabase
      .from("canadian_benchmarks")
      .select("*")
      .eq("province", prov)
      .in("industry", ["_universal", slug]);

    const bm = new Map<string, any>();
    for (const b of (benchmarks || [])) bm.set(b.metric, b);

    const findings: Finding[] = [];

    // ════════════════════════════════════════════════════════════════════════
    // UNIVERSAL ANALYSES (from universal questions)
    // ════════════════════════════════════════════════════════════════════════

    // ── RENT: your $/sqft vs local benchmark ────────────────────────────
    const rent = num(answers.monthly_rent);
    const sqft = num(answers.sqft);
    if (rent > 0 && sqft > 0) {
      const yourPerSqft = (rent * 12) / sqft;
      const bmRent = bm.get("commercial_rent_sqft");
      const benchPerSqft = bmRent ? parseFloat(bmRent.value) : 18;

      if (yourPerSqft > benchPerSqft * 1.15) {
        const overpayAnnual = Math.round((yourPerSqft - benchPerSqft) * sqft);
        findings.push({
          id: "rent_vs_market",
          title: `Rent $${yourPerSqft.toFixed(0)}/sqft vs $${benchPerSqft}/sqft market rate`,
          description: `You're paying $${rent.toLocaleString()}/month ($${yourPerSqft.toFixed(0)}/sqft/year) for ${sqft.toLocaleString()} sqft. The average in ${provName} is $${benchPerSqft}/sqft. That's $${overpayAnnual.toLocaleString()}/year above market.`,
          category: "Cost Leak",
          severity: overpayAnnual > 5000 ? "critical" : "high",
          impactAnnual: overpayAnnual,
          benchmark: `$${benchPerSqft}/sqft/year (${provName} avg${bmRent?.source ? `, ${bmRent.source}` : ""})`,
          yourNumber: `$${yourPerSqft.toFixed(0)}/sqft/year ($${rent.toLocaleString()}/mo)`,
          source: "your_answer + local_benchmark",
          confidence: "high",
          fixHint: "Our team will contact your landlord and negotiate directly. No action needed from you.",
        });
      }

      // Also check rent as % of revenue
      const rentPct = (rent / mRev) * 100;
      if (rentPct > 12) {
        findings.push({
          id: "rent_pct_revenue",
          title: `Rent is ${Math.round(rentPct)}% of your revenue`,
          description: `You're spending ${Math.round(rentPct)}% of revenue on rent ($${rent.toLocaleString()}/$${mRev.toLocaleString()}). The healthy range is 5-10%. Every percent over 10% costs you $${Math.round(mRev * 0.01 * 12).toLocaleString()}/year.`,
          category: "Cost Leak",
          severity: rentPct > 18 ? "critical" : "high",
          impactAnnual: Math.round((rentPct - 10) * mRev * 0.01 * 12),
          benchmark: "5-10% of revenue",
          yourNumber: `${Math.round(rentPct)}% of revenue`,
          source: "your_answer",
          confidence: "high",
          fixHint: "We'll review your lease terms and approach your landlord for a renegotiation. We handle the whole conversation.",
        });
      }
    }

    // ── CREDIT CARD FEES ────────────────────────────────────────────────
    const ccPct = num(answers.cc_pct) / 100; // convert "80" → 0.80
    if (ccPct > 0.10) {
      const ccRate = parseFloat(bm.get("cc_processing_avg")?.value || "2.65");
      const annualCCFees = Math.round(aRev * ccPct * ccRate / 100);
      const negotiatedRate = Math.max(1.5, ccRate - 0.5);
      const potentialSavings = Math.round(aRev * ccPct * (ccRate - negotiatedRate) / 100);

      if (potentialSavings > 200) {
        findings.push({
          id: "cc_fees",
          title: `~$${(annualCCFees ?? 0).toLocaleString()}/year in card fees — could save $${(potentialSavings ?? 0).toLocaleString()}`,
          description: `With ${Math.round(ccPct * 100)}% of your $${mRev.toLocaleString()}/month on cards at ~${ccRate}%, you pay ~$${annualCCFees.toLocaleString()}/year. Negotiating to ${negotiatedRate.toFixed(1)}% saves $${potentialSavings.toLocaleString()}/year.`,
          category: "Cost Leak",
          severity: potentialSavings > 2000 ? "high" : "medium",
          impactAnnual: potentialSavings,
          benchmark: `${negotiatedRate.toFixed(1)}% (negotiated interchange-plus)`,
          yourNumber: `~${ccRate}% (${provName} average rate)`,
          source: "your_answer + payments_canada",
          confidence: "medium",
          fixHint: "Our team will audit your processing statement and negotiate directly with your processor or switch you to a better rate.",
        });
      }
    }

    // ── COLLECTION SPEED (days to get paid) ─────────────────────────────
    const daysToPay = num(answers.avg_days_to_pay);
    if (daysToPay > 14) {
      const dailyRev = mRev / 30;
      const cashTied = Math.round(dailyRev * daysToPay);
      const opportunityCost = Math.round(cashTied * 0.08); // 8% annual cost of capital
      const annualCost = Math.round(opportunityCost * 12 / daysToPay * 30);

      findings.push({
        id: "slow_payment",
        title: `$${(cashTied ?? 0).toLocaleString()} tied up waiting for payment (${daysToPay} days)`,
        description: `At $${(mRev ?? 0).toLocaleString()}/month, waiting ${daysToPay} days means ~$${(cashTied ?? 0).toLocaleString()} is always sitting in unpaid invoices. That cash gap costs ~$${(annualCost ?? 0).toLocaleString()}/year in opportunity cost and potential borrowing.`,
        category: "Cash Flow Leak",
        severity: daysToPay > 45 ? "critical" : "high",
        impactAnnual: annualCost,
        benchmark: "Paid within 7 days",
        yourNumber: `~${daysToPay} days`,
        source: "your_answer",
        confidence: "high",
        fixHint: "We'll review your AR process and implement collection improvements on your behalf.",
      });
    }

    // ── BOOKKEEPING COST ────────────────────────────────────────────────
    const bookkeepingCost = num(answers.bookkeeping_cost);
    const taxRate = bm.get("corporate_tax_rate_small");

    if (bookkeepingCost === 0) {
      // DIY bookkeeping — likely missing deductions
      const missedDeductions = Math.round(aRev * 0.03);
      findings.push({
        id: "diy_bookkeeping",
        title: `DIY bookkeeping → ~$${(missedDeductions ?? 0).toLocaleString()}/year in missed deductions`,
        description: `Doing your own books means you're likely missing 3-8% in legitimate deductions.${taxRate ? ` At ${taxRate.value}% combined tax rate in ${provName}` : ""}, that's real money left on the table. A bookkeeper at $300-$600/month typically saves 3-5x their cost.`,
        category: "Tax Leak",
        severity: missedDeductions > 5000 ? "critical" : "high",
        impactAnnual: missedDeductions,
        benchmark: "Professional bookkeeper ($300-$600/mo saves 3-5x cost)",
        yourNumber: "$0/month (DIY)",
        source: "your_answer + cra_data",
        confidence: "high",
        fixHint: "Our accountant will review your books and identify optimization opportunities directly.",
      });
    } else if (bookkeepingCost > 0 && bookkeepingCost > mRev * 0.05) {
      // Overpaying for bookkeeping
      const target = Math.round(mRev * 0.02);
      const overpay = Math.round((bookkeepingCost - target) * 12);
      if (overpay > 1000) {
        findings.push({
          id: "bookkeeping_expensive",
          title: `Bookkeeping at $${bookkeepingCost}/mo — ${Math.round(bookkeepingCost / mRev * 100)}% of revenue`,
          description: `You're paying $${bookkeepingCost}/month for bookkeeping, which is ${Math.round(bookkeepingCost / mRev * 100)}% of revenue. Benchmark is 1-2%. Consider if you're getting value for the cost or if automation could reduce hours.`,
          category: "Cost Leak",
          severity: "medium",
          impactAnnual: overpay,
          benchmark: `1-2% of revenue ($${target}/mo)`,
          yourNumber: `$${bookkeepingCost}/mo (${Math.round(bookkeepingCost / mRev * 100)}% of revenue)`,
          source: "your_answer",
          confidence: "medium",
          fixHint: "We'll review your accounting setup and streamline costs for you.",
        });
      }
    }

    // ── SOFTWARE SPEND ──────────────────────────────────────────────────
    const monthlySoftware = num(answers.monthly_software);
    if (monthlySoftware > mRev * 0.05) {
      const target = Math.round(mRev * 0.03);
      const overspend = Math.round((monthlySoftware - target) * 12);
      findings.push({
        id: "software_overspend",
        title: `$${monthlySoftware}/mo on software (${Math.round(monthlySoftware / mRev * 100)}% of revenue)`,
        description: `You're spending $${monthlySoftware}/month on software subscriptions. For a $${(mRev ?? 0).toLocaleString()}/month business, benchmark is 2-3% ($${target}/month). You may have duplicate or unused subscriptions.`,
        category: "Cost Leak",
        severity: overspend > 3000 ? "high" : "medium",
        impactAnnual: overspend,
        benchmark: `2-3% of revenue ($${target}/mo)`,
        yourNumber: `$${monthlySoftware}/mo`,
        source: "your_answer",
        confidence: "medium",
        fixHint: "Our team will audit your software stack and eliminate unnecessary spend — we handle cancellations.",
      });
    } else if (monthlySoftware === 0 && emp > 1) {
      const timeLost = Math.round(emp * 3 * 52 * 20); // 3 hrs/wk × $20/hr per employee
      findings.push({
        id: "no_software",
        title: `$0 on software → ~$${(timeLost ?? 0).toLocaleString()}/year in manual work`,
        description: `With ${emp} employees and no business software, your team spends ~${emp * 3} hours/week on tasks software handles in minutes. That's ~$${(timeLost ?? 0).toLocaleString()}/year in lost productivity.`,
        category: "Technology Leak",
        severity: emp > 3 ? "high" : "medium",
        impactAnnual: timeLost,
        benchmark: "2-3% of revenue on software ($${Math.round(mRev * 0.025)}/mo)",
        yourNumber: "$0/month",
        source: "your_answer",
        confidence: "medium",
        fixHint: "Start with accounting (Wave free, FreshBooks $19/mo) + scheduling. ROI within 2 months.",
      });
    }

    // ── MARKETING SPEND ─────────────────────────────────────────────────
    const monthlyMarketing = num(answers.monthly_marketing);
    const marketingPct = mRev > 0 ? (monthlyMarketing / mRev) * 100 : 0;

    if (monthlyMarketing === 0) {
      const missedGrowth = Math.round(aRev * 0.10);
      findings.push({
        id: "zero_marketing",
        title: `$0 on marketing → capped growth`,
        description: `Spending nothing on marketing means you're invisible to new customers. ${DISPLAY[slug] || "Businesses"} that invest 5-8% of revenue ($${Math.round(mRev * 0.05)}-$${Math.round(mRev * 0.08)}/month) grow 15-25% faster.`,
        category: "Growth Leak",
        severity: "high",
        impactAnnual: missedGrowth,
        benchmark: `5-8% of revenue ($${Math.round(mRev * 0.05)}-$${Math.round(mRev * 0.08)}/mo)`,
        yourNumber: "$0/month",
        source: "your_answer + industry_benchmark",
        confidence: "medium",
        fixHint: "Start free: Google Business Profile, ask for reviews. Then test $500/month on Facebook or Google Ads.",
      });
    } else if (marketingPct > 12) {
      const targetSpend = Math.round(mRev * 0.08);
      const overspend = Math.round((monthlyMarketing - targetSpend) * 12);
      findings.push({
        id: "marketing_overspend",
        title: `Marketing at ${Math.round(marketingPct)}% of revenue ($${monthlyMarketing}/mo)`,
        description: `You're spending $${monthlyMarketing}/month (${Math.round(marketingPct)}% of revenue) on marketing. Benchmark is 5-8%. Unless your ROI justifies it, you may be overspending by $${overspend.toLocaleString()}/year.`,
        category: "Cost Leak",
        severity: overspend > 5000 ? "high" : "medium",
        impactAnnual: overspend,
        benchmark: `5-8% of revenue ($${Math.round(mRev * 0.05)}-$${Math.round(mRev * 0.08)}/mo)`,
        yourNumber: `$${monthlyMarketing}/mo (${Math.round(marketingPct)}%)`,
        source: "your_answer",
        confidence: "medium",
        fixHint: "Track ROI per channel. Cut anything without measurable results. Focus on highest-converting channels.",
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // INDUSTRY-SPECIFIC ANALYSES
    // ════════════════════════════════════════════════════════════════════════

    if (slug === "restaurant") restaurantAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "dental") dentalAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "construction") constructionAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "salon") salonAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "retail") retailAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "accounting") accountingAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "fitness") fitnessAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "consulting") consultingAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "plumbing") plumbingAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "landscaping") landscapingAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "ecommerce") ecommerceAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "auto-repair") autoRepairAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "daycare") daycareAnalysis(findings, answers, mRev, aRev, bm, provName);
    if (slug === "healthcare") healthcareAnalysis(findings, answers, mRev, aRev, bm, provName);

    // ── SORT & RETURN ───────────────────────────────────────────────────
    findings.sort((a, b) => b.impactAnnual - a.impactAnnual);
    // Remove tiny findings
    const meaningful = findings.filter(f => f.impactAnnual >= 500);

    const confirmed = meaningful.filter(f => f.confidence === "high");
    const probable = meaningful.filter(f => f.confidence === "medium");
    const possible = meaningful.filter(f => f.confidence === "low");
    const totalAnnual = meaningful.reduce((s, f) => s + f.impactAnnual, 0);

    return NextResponse.json({
      industry: { id: slug, name: DISPLAY[slug] || slug },
      location: { province: prov, name: provName },
      revenue: { monthly: mRev, annual: aRev },
      employees: emp,
      size: sizeTier,
      summary: {
        totalAnnual,
        perMonth: Math.round(totalAnnual / 12),
        perDay: Math.round(totalAnnual / 365),
        findingCount: meaningful.length,
        confirmedCount: confirmed.length,
        probableCount: probable.length,
        possibleCount: possible.length,
        headline: sizeTier === "solo"
          ? `As a solo ${DISPLAY[slug] || "operator"} in ${provName}, we found ~$${Math.round(totalAnnual / 12).toLocaleString()}/month slipping through the cracks.`
          : sizeTier === "growth"
          ? `For a ${emp}-person ${DISPLAY[slug] || "business"} at $${Math.round(mRev / 1000)}K/month in ${provName}, we identified ~$${Math.round(totalAnnual / 12).toLocaleString()}/month in leaks.`
          : `Based on your numbers and ${provName} data, we found ~$${Math.round(totalAnnual / 12).toLocaleString()}/month in leaks.`,
        subheadline: `That's $${(totalAnnual ?? 0).toLocaleString()}/year leaving your business.`,
      },
      confirmedLeaks: confirmed,
      probableLeaks: probable,
      possibleLeaks: possible,
    });

  } catch (error: any) {
    console.error("Smart prescan error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// ════════════════════════════════════════════════════════════════════════════
// INDUSTRY ANALYSIS FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

function restaurantAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const foodCostPct = num(a.food_cost_pct);
  const monthlyFood = num(a.monthly_food_cost);
  const avgCheck = num(a.avg_check);
  const seats = num(a.seat_count);
  const deliveryCost = num(a.delivery_app_cost);
  const monthlyLabour = num(a.monthly_labour);
  const bmFoodCost = parseFloat(bm.get("food_cost_pct")?.value || "30");
  const bmLabourCost = parseFloat(bm.get("labour_cost_pct")?.value || "30");
  const bmCheck = parseFloat(bm.get("avg_check_size")?.value || "22");

  // Food cost analysis
  if (foodCostPct === -1 && monthlyFood > 0) {
    // They don't know their food cost % — calculate it
    const calcPct = Math.round((monthlyFood / mRev) * 100);
    f.push({
      id: "unknown_food_cost", title: `You don't know your food cost — it's ~${calcPct}%`,
      description: `Your food spend ($${monthlyFood.toLocaleString()}/mo) ÷ revenue ($${mRev.toLocaleString()}/mo) = ${calcPct}%. ${prov} benchmark is ${bmFoodCost}%. ${calcPct > bmFoodCost + 3 ? `You're ${calcPct - bmFoodCost}% over — that's $${Math.round((calcPct - bmFoodCost) / 100 * aRev).toLocaleString()}/year.` : "You're in the target range, but not knowing this number means you can't manage it."}`,
      category: "Cost Leak", severity: "critical", confidence: "high",
      impactAnnual: calcPct > bmFoodCost ? Math.round((calcPct - bmFoodCost) / 100 * aRev) : Math.round(aRev * 0.02),
      benchmark: `${bmFoodCost}% food cost (${prov})`, yourNumber: `${calcPct}% (calculated)`,
      source: "your_answer + restaurants_canada", fixHint: "Track food cost weekly. Recipe-cost your top 20 items. Set waste reduction targets.",
    });
  } else if (foodCostPct > 0 && foodCostPct > bmFoodCost + 2) {
    const overspend = Math.round((foodCostPct - bmFoodCost) / 100 * aRev);
    f.push({
      id: "high_food_cost", title: `Food cost ${foodCostPct}% vs ${bmFoodCost}% benchmark`,
      description: `Your food cost is ${foodCostPct - bmFoodCost}% above the ${prov} target of ${bmFoodCost}%. On $${(aRev ?? 0).toLocaleString()}/year revenue, that's $${(overspend ?? 0).toLocaleString()}/year.`,
      category: "Cost Leak", severity: overspend > 10000 ? "critical" : "high", confidence: "high",
      impactAnnual: overspend, benchmark: `${bmFoodCost}% (${prov})`, yourNumber: `${foodCostPct}%`,
      source: "your_answer + restaurants_canada", fixHint: "Renegotiate with suppliers. Reduce portion sizes by 5%. Eliminate lowest-margin menu items.",
    });
  }

  // Labour cost
  if (monthlyLabour > 0) {
    const labourPct = Math.round((monthlyLabour / mRev) * 100);
    if (labourPct > bmLabourCost + 3) {
      const overspend = Math.round((labourPct - bmLabourCost) / 100 * aRev);
      f.push({
        id: "high_labour", title: `Labour cost ${labourPct}% vs ${bmLabourCost}% benchmark`,
        description: `Your labour at $${(monthlyLabour ?? 0).toLocaleString()}/month is ${labourPct}% of revenue. ${prov} target is ${bmLabourCost}%. That's $${(overspend ?? 0).toLocaleString()}/year over benchmark.`,
        category: "People Leak", severity: overspend > 10000 ? "critical" : "high", confidence: "high",
        impactAnnual: overspend, benchmark: `${bmLabourCost}% (${prov})`, yourNumber: `${labourPct}%`,
        source: "your_answer + restaurants_canada", fixHint: "Review scheduling against sales patterns. Cross-train staff. Use a POS-linked scheduling tool.",
      });
    }
  }

  // Average check vs benchmark
  if (avgCheck > 0 && avgCheck < bmCheck * 0.85 && seats > 0) {
    const diff = bmCheck - avgCheck;
    const annualImpact = Math.round(diff * seats * 1.5 * 300); // 1.5 turns × 300 days
    f.push({
      id: "low_avg_check", title: `Average bill $${avgCheck} vs $${bmCheck} benchmark`,
      description: `Your average check is $${diff.toFixed(0)} below the ${prov} average of $${bmCheck}. With ${seats} seats, that's ~$${annualImpact.toLocaleString()}/year in potential revenue.`,
      category: "Pricing Leak", severity: "high", confidence: "high",
      impactAnnual: annualImpact, benchmark: `$${bmCheck} average check (${prov})`, yourNumber: `$${avgCheck}`,
      source: "your_answer + restaurants_canada", fixHint: "Add upsell prompts. Review pricing. Test appetizer/dessert suggestions.",
    });
  }

  // Delivery app fees
  if (deliveryCost > 0) {
    const potentialSavings = Math.round(deliveryCost * 0.5 * 12); // could save 50% by going direct
    f.push({
      id: "delivery_fees", title: `$${deliveryCost}/mo in delivery app fees`,
      description: `You're paying $${deliveryCost}/month to delivery apps (25-35% commission). Building your own ordering page could save ~$${(potentialSavings ?? 0).toLocaleString()}/year.`,
      category: "Cost Leak", severity: potentialSavings > 5000 ? "high" : "medium", confidence: "medium",
      impactAnnual: potentialSavings, benchmark: "Direct ordering (0% commission)", yourNumber: `$${deliveryCost}/mo`,
      source: "your_answer", fixHint: "Set up Square Online or Owner.com (free). Offer 10% off for direct orders.",
    });
  }
}

function dentalAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const weeklyNoShows = num(a.weekly_no_shows);
  const weeklyAppts = num(a.weekly_appointments);
  const avgVisitRev = num(a.avg_visit_revenue, 200);
  const chairs = num(a.chair_count);
  const insurancePct = num(a.insurance_pct) / 100;
  const insuranceDays = num(a.insurance_payment_days);

  if (weeklyNoShows > 0 && weeklyAppts > 0) {
    const noShowRate = Math.round((weeklyNoShows / weeklyAppts) * 100);
    const bmTarget = parseFloat(bm.get("no_show_rate_target")?.value || "5");
    const annualLoss = Math.round(weeklyNoShows * avgVisitRev * 50);

    f.push({
      id: "no_shows", title: `${weeklyNoShows} no-shows/week = $${(annualLoss ?? 0).toLocaleString()}/year lost`,
      description: `${weeklyNoShows} no-shows out of ${weeklyAppts} appointments (${noShowRate}%). At ~$${avgVisitRev} per visit, that's $${(annualLoss ?? 0).toLocaleString()}/year. ${prov} target: under ${bmTarget}%.`,
      category: "Revenue Leak", severity: annualLoss > 20000 ? "critical" : "high", confidence: "high",
      impactAnnual: annualLoss, benchmark: `<${bmTarget}% no-show rate`, yourNumber: `${noShowRate}% (${weeklyNoShows}/week)`,
      source: "your_answer + cda_benchmark", fixHint: "Automated text reminders reduce no-shows 40-60%. Charge $50 no-show fee for repeats.",
    });
  }

  // Chair utilization
  if (chairs > 0 && weeklyAppts > 0) {
    const maxAppts = chairs * 8 * 5; // 8 appts/chair/day × 5 days
    const utilization = Math.round((weeklyAppts / maxAppts) * 100);
    if (utilization < 70) {
      const emptySlots = maxAppts - weeklyAppts;
      const potentialRevenue = Math.round(emptySlots * avgVisitRev * 0.3 * 50); // could fill 30% of empty
      f.push({
        id: "low_utilization", title: `Chairs at ${utilization}% capacity — ${emptySlots} empty slots/week`,
        description: `${chairs} chairs × 8 slots/day = ${maxAppts} possible per week. You're doing ${weeklyAppts} (${utilization}%). Filling 30% of empty slots = $${(potentialRevenue ?? 0).toLocaleString()}/year.`,
        category: "Revenue Leak", severity: potentialRevenue > 30000 ? "critical" : "high", confidence: "medium",
        impactAnnual: potentialRevenue, benchmark: ">80% utilization", yourNumber: `${utilization}%`,
        source: "your_answer", fixHint: "Reduce appointment gaps. Offer last-minute booking discounts. Extend hours by 1 day.",
      });
    }
  }

  // Insurance payment delay
  if (insuranceDays > 21 && insurancePct > 0.30) {
    const insuranceRev = mRev * insurancePct;
    const cashTied = Math.round(insuranceRev * insuranceDays / 30);
    f.push({
      id: "insurance_delay", title: `$${(cashTied ?? 0).toLocaleString()} tied up in insurance claims (${insuranceDays} days)`,
      description: `${Math.round(insurancePct * 100)}% of your revenue goes through insurance, taking ~${insuranceDays} days. That's $${cashTied.toLocaleString()} constantly in unpaid claims.`,
      category: "Cash Flow Leak", severity: cashTied > 20000 ? "high" : "medium", confidence: "high",
      impactAnnual: Math.round(cashTied * 0.06), benchmark: "<14 days insurance payment", yourNumber: `~${insuranceDays} days`,
      source: "your_answer", fixHint: "Submit claims same day. Follow up on unpaid claims weekly. Use electronic claims submission.",
    });
  }
}

function constructionAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const overbudgetPct = num(a.overbudget_pct);
  const avgOverrun = num(a.avg_overrun_pct);
  const projects = num(a.active_projects);
  const avgProjectValue = num(a.avg_project_value);
  const monthlyMaterials = num(a.monthly_materials);
  const finalPaymentDays = num(a.final_payment_days);

  if (overbudgetPct === -1) {
    f.push({
      id: "no_budget_tracking", title: "No budget tracking = invisible losses",
      description: `You don't track which jobs go over budget. The ${prov} average is 5-15% overrun. On $${aRev.toLocaleString()}/year revenue, even 10% overrun = $${Math.round(aRev * 0.10).toLocaleString()}/year.`,
      category: "Cost Leak", severity: "critical", confidence: "high",
      impactAnnual: Math.round(aRev * 0.07), benchmark: "<5% of jobs over budget", yourNumber: "Not tracked",
      source: "your_answer", fixHint: "Start tracking: estimated vs actual for every job. Use Buildertrend or Knowify ($99/mo).",
    });
  } else if (overbudgetPct > 10 && avgOverrun > 0) {
    const annualOverrun = Math.round(aRev * (overbudgetPct / 100) * (avgOverrun / 100));
    f.push({
      id: "budget_overruns", title: `${overbudgetPct}% of jobs over budget by ~${avgOverrun}% = $${(annualOverrun ?? 0).toLocaleString()}/year`,
      description: `${overbudgetPct}% of your jobs go over budget by an average of ${avgOverrun}%. On $${(aRev ?? 0).toLocaleString()}/year, that's ~$${(annualOverrun ?? 0).toLocaleString()}/year in overruns.`,
      category: "Cost Leak", severity: annualOverrun > 20000 ? "critical" : "high", confidence: "high",
      impactAnnual: annualOverrun, benchmark: "<5% of jobs, <5% overrun", yourNumber: `${overbudgetPct}% of jobs, ${avgOverrun}% overrun`,
      source: "your_answer", fixHint: "Add 10% contingency to estimates. Track change orders. Review estimates vs actuals monthly.",
    });
  }

  if (monthlyMaterials > 0) {
    const wastePct = parseFloat(bm.get("material_waste_pct")?.value || "10");
    const wasteValue = Math.round(monthlyMaterials * (wastePct / 100) * 12);
    f.push({
      id: "material_waste", title: `~$${(wasteValue ?? 0).toLocaleString()}/year in material waste`,
      description: `On $${(monthlyMaterials ?? 0).toLocaleString()}/month in materials, industry average waste is ${wastePct}%. That's ~$${(wasteValue ?? 0).toLocaleString()}/year. Better ordering and leftover management can cut this in half.`,
      category: "Cost Leak", severity: wasteValue > 10000 ? "high" : "medium", confidence: "medium",
      impactAnnual: Math.round(wasteValue * 0.5), benchmark: `<${Math.round(wastePct / 2)}% material waste`, yourNumber: `~${wastePct}% (industry avg)`,
      source: "your_answer + cca_benchmark", fixHint: "Track leftover materials per job. Reuse on next project. Return unused to supplier.",
    });
  }

  if (finalPaymentDays > 30) {
    const avgProject = avgProjectValue || Math.round(mRev / Math.max(1, projects));
    const holdback = Math.round(avgProject * 0.10 * projects); // 10% holdback on active projects
    f.push({
      id: "slow_final_payment", title: `Final payments take ${finalPaymentDays} days — $${(holdback ?? 0).toLocaleString()} tied up`,
      description: `Waiting ${finalPaymentDays} days for final payment on ${projects} active projects means ~$${(holdback ?? 0).toLocaleString()} is always sitting in receivables. Plus ${prov} holdback requirements.`,
      category: "Cash Flow Leak", severity: holdback > 20000 ? "high" : "medium", confidence: "high",
      impactAnnual: Math.round(holdback * 0.08), benchmark: "<30 days final payment", yourNumber: `${finalPaymentDays} days`,
      source: "your_answer", fixHint: "Use progress billing. Invoice milestones, not just completion. Send invoices day of completion.",
    });
  }
}

function salonAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const weeklyClients = num(a.weekly_clients);
  const avgPrice = num(a.avg_service_price);
  const weeklyNoShows = num(a.weekly_no_shows);
  const stations = num(a.station_count);
  const productCost = num(a.monthly_product_cost);
  const retailRev = num(a.monthly_retail_revenue);

  if (weeklyNoShows > 0) {
    const loss = Math.round(weeklyNoShows * avgPrice * 50);
    f.push({
      id: "no_shows", title: `${weeklyNoShows} no-shows/week = $${(loss ?? 0).toLocaleString()}/year lost`,
      description: `At ~$${avgPrice} per service, ${weeklyNoShows} missed appointments per week costs $${(loss ?? 0).toLocaleString()}/year.`,
      category: "Revenue Leak", severity: loss > 10000 ? "critical" : "high", confidence: "high",
      impactAnnual: loss, benchmark: `<${parseFloat(bm.get("no_show_rate_target")?.value || "10")}% no-show rate`, yourNumber: `${weeklyNoShows}/week`,
      source: "your_answer", fixHint: "Require card on file for bookings. Send text reminders 24h + 2h before. Charge 50% for no-shows.",
    });
  }

  // Retail opportunity
  if (productCost > 0 && retailRev < productCost * 2) {
    const targetRetail = Math.round(mRev * 0.15); // 15% of revenue should be retail
    const gap = Math.round((targetRetail - retailRev) * 12);
    if (gap > 1000) {
      f.push({
        id: "low_retail", title: `Retail revenue $${retailRev}/mo vs $${targetRetail}/mo potential`,
        description: `You spend $${productCost}/month on products but only sell $${retailRev}/month retail. Industry target is 15% of revenue ($${targetRetail}/month). That's $${(gap ?? 0).toLocaleString()}/year in missed retail revenue.`,
        category: "Revenue Leak", severity: gap > 10000 ? "high" : "medium", confidence: "medium",
        impactAnnual: gap, benchmark: `15% of revenue ($${targetRetail}/mo)`, yourNumber: `$${retailRev}/mo`,
        source: "your_answer", fixHint: "Display products at checkout. Train staff to recommend products used during service. Offer bundles.",
      });
    }
  }

  // Station utilization
  if (stations > 0 && weeklyClients > 0) {
    const maxClients = stations * 6 * 6; // 6 clients/station/day × 6 days
    const util = Math.round((weeklyClients / maxClients) * 100);
    if (util < 60) {
      const emptyValue = Math.round((maxClients - weeklyClients) * avgPrice * 0.25 * 50);
      f.push({
        id: "low_chair_util", title: `Chairs at ${util}% utilization`,
        description: `${stations} stations could serve ~${maxClients} clients/week. You're at ${weeklyClients} (${util}%). Filling 25% of empty slots = $${(emptyValue ?? 0).toLocaleString()}/year.`,
        category: "Revenue Leak", severity: emptyValue > 15000 ? "high" : "medium", confidence: "medium",
        impactAnnual: emptyValue, benchmark: ">75% utilization", yourNumber: `${util}%`,
        source: "your_answer", fixHint: "Run midweek promotions. Extend hours. Add services (nails, lashes) to fill gaps.",
      });
    }
  }
}

function retailAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const marginPct = num(a.gross_margin_pct);
  const inventoryValue = num(a.inventory_value);
  const shrinkage = num(a.shrinkage_level);
  const avgTransaction = num(a.avg_transaction);
  const dailyTransactions = num(a.daily_transactions);
  const onlinePct = num(a.online_pct);

  if (marginPct === -1) {
    f.push({
      id: "unknown_margin", title: "You don't know your gross margin",
      description: `Not knowing your margin means you can't tell if you're making money on each sale. Industry benchmark is ${parseFloat(bm.get("gross_margin_target")?.value || "50")}%. This is the #1 number every retailer needs to know.`,
      category: "Pricing Leak", severity: "critical", confidence: "high",
      impactAnnual: Math.round(aRev * 0.05), benchmark: `${parseFloat(bm.get("gross_margin_target")?.value || "50")}%`, yourNumber: "Unknown",
      source: "your_answer", fixHint: "Calculate: (selling price - cost) ÷ selling price for your top 20 items. Update pricing for anything under 40%.",
    });
  }

  if (inventoryValue > 0) {
    const turnover = aRev / inventoryValue;
    const bmTurnover = parseFloat(bm.get("inventory_turnover")?.value || "8");
    if (turnover < bmTurnover * 0.7) {
      const excessInventory = Math.round(inventoryValue - (aRev / bmTurnover));
      f.push({
        id: "slow_inventory", title: `Inventory turns ${turnover.toFixed(1)}x/year vs ${bmTurnover}x benchmark`,
        description: `$${inventoryValue.toLocaleString()} in inventory turning ${turnover.toFixed(1)}x/year. Benchmark is ${bmTurnover}x. You have ~$${excessInventory.toLocaleString()} in excess stock tying up cash.`,
        category: "Cash Flow Leak", severity: excessInventory > 10000 ? "high" : "medium", confidence: "high",
        impactAnnual: Math.round(excessInventory * 0.15), benchmark: `${bmTurnover}x/year`, yourNumber: `${turnover.toFixed(1)}x/year`,
        source: "your_answer + rcc_benchmark", fixHint: "Clearance slow movers. Order smaller quantities more frequently. Track sell-through rates weekly.",
      });
    }
  }

  if (shrinkage === -1) {
    f.push({
      id: "untracked_shrinkage", title: "You don't track missing/damaged inventory",
      description: `Canadian retail average shrinkage is ${parseFloat(bm.get("shrinkage_pct")?.value || "1.4")}%. On $${aRev.toLocaleString()}/year, that's $${Math.round(aRev * 0.014).toLocaleString()}/year walking out the door.`,
      category: "Cost Leak", severity: "high", confidence: "medium",
      impactAnnual: Math.round(aRev * 0.014), benchmark: `<${parseFloat(bm.get("shrinkage_pct")?.value || "1.4")}%`, yourNumber: "Not tracked",
      source: "your_answer + rcc_benchmark", fixHint: "Do monthly inventory counts on your top 50 SKUs. Install cameras at exits. Track variance.",
    });
  } else if (shrinkage > 0) {
    const annualShrinkage = shrinkage * 12;
    f.push({
      id: "shrinkage", title: `~$${(annualShrinkage ?? 0).toLocaleString()}/year in shrinkage`,
      description: `You estimate ~$${shrinkage}/month in missing, broken, or expired goods. That's $${(annualShrinkage ?? 0).toLocaleString()}/year.`,
      category: "Cost Leak", severity: annualShrinkage > 5000 ? "high" : "medium", confidence: "high",
      impactAnnual: Math.round(annualShrinkage * 0.5), benchmark: `<$${Math.round(aRev * 0.01 / 12)}/month`, yourNumber: `~$${shrinkage}/month`,
      source: "your_answer", fixHint: "Identify top stolen/wasted items. Improve display security. Adjust ordering for perishables.",
    });
  }

  if (onlinePct === 0 && aRev > 100000) {
    f.push({
      id: "no_online", title: "No online sales = missing 20-30% growth",
      description: `Retailers with an online presence average 20-30% more revenue. At your size, that's $${Math.round(aRev * 0.20).toLocaleString()}-$${Math.round(aRev * 0.30).toLocaleString()}/year potential.`,
      category: "Growth Leak", severity: "high", confidence: "medium",
      impactAnnual: Math.round(aRev * 0.15), benchmark: "15-30% of revenue from online", yourNumber: "0%",
      source: "your_answer + industry_trend", fixHint: "Start with Shopify ($39/mo). List your top 50 products. Instagram shopping is free.",
    });
  }
}

function accountingAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const clientCount = num(a.client_count);
  const hourlyRate = num(a.hourly_rate);
  const billableHrs = num(a.weekly_billable_hours);
  const collectionRate = num(a.collection_rate);
  const arDays = num(a.avg_ar_days);
  const topClientPct = num(a.client_concentration);
  const bmRate = parseFloat(bm.get("avg_cpa_rate")?.value || "175");

  if (hourlyRate > 0 && hourlyRate < bmRate * 0.85) {
    const revPerClient = aRev / Math.max(1, clientCount);
    const potentialRate = Math.round(bmRate * 0.9);
    const rateGap = Math.round((potentialRate - hourlyRate) * billableHrs * 50);
    f.push({
      id: "low_rate", title: `Charging $${hourlyRate}/hr vs $${bmRate}/hr ${prov} average`,
      description: `Your rate of $${hourlyRate}/hour is below the ${prov} average of $${bmRate}. Raising to $${potentialRate} would add $${(rateGap ?? 0).toLocaleString()}/year.`,
      category: "Pricing Leak", severity: rateGap > 15000 ? "critical" : "high", confidence: "high",
      impactAnnual: rateGap, benchmark: `$${bmRate}/hr (${prov} avg)`, yourNumber: `$${hourlyRate}/hr`,
      source: "your_answer + cpa_canada", fixHint: "Raise rates 10% for new clients immediately. Phase in increases for existing clients over 6 months.",
    });
  }

  if (billableHrs > 0) {
    const utilization = Math.round((billableHrs / 40) * 100);
    const bmUtil = parseFloat(bm.get("utilization_target")?.value || "60");
    if (utilization < bmUtil) {
      const lostHours = Math.round((bmUtil / 100 * 40 - billableHrs) * 50);
      const lostRev = lostHours * hourlyRate;
      f.push({
        id: "low_utilization", title: `Utilization at ${utilization}% vs ${bmUtil}% target`,
        description: `You're billing ${billableHrs} of 40 hours/week (${utilization}%). Target is ${bmUtil}%. That's ${Math.round(bmUtil / 100 * 40 - billableHrs)} billable hours/week left on the table — $${lostRev.toLocaleString()}/year.`,
        category: "Revenue Leak", severity: lostRev > 20000 ? "critical" : "high", confidence: "high",
        impactAnnual: lostRev, benchmark: `${bmUtil}% utilization`, yourNumber: `${utilization}%`,
        source: "your_answer + cpa_canada", fixHint: "Automate admin tasks. Delegate non-billable work. Use practice management software.",
      });
    }
  }

  if (collectionRate !== -1 && collectionRate < 95) {
    const writeOff = Math.round(aRev * (100 - collectionRate) / 100);
    f.push({
      id: "low_collection", title: `Collection rate ${collectionRate}% — writing off $${(writeOff ?? 0).toLocaleString()}/year`,
      description: `You're collecting ${collectionRate}% of billed work. The other ${100 - collectionRate}% = $${(writeOff ?? 0).toLocaleString()}/year in write-downs and uncollected fees.`,
      category: "Revenue Leak", severity: writeOff > 10000 ? "critical" : "high", confidence: "high",
      impactAnnual: writeOff, benchmark: ">98% collection rate", yourNumber: `${collectionRate}%`,
      source: "your_answer + cpa_canada", fixHint: "Require retainers for new clients. Bill monthly not quarterly. Follow up on day 31.",
    });
  }

  if (topClientPct > 40) {
    const atRisk = Math.round(aRev * topClientPct / 100);
    f.push({
      id: "client_concentration", title: `${topClientPct}% of revenue from top 3 clients — $${(atRisk ?? 0).toLocaleString()} at risk`,
      description: `If one of your top 3 clients leaves, you lose up to ${Math.round(topClientPct / 3)}% of revenue overnight. Diversification target is <20%.`,
      category: "Revenue Leak", severity: topClientPct > 60 ? "critical" : "high", confidence: "high",
      impactAnnual: Math.round(atRisk * 0.10), benchmark: "<20% from top 3 clients", yourNumber: `${topClientPct}%`,
      source: "your_answer", fixHint: "Actively market to new clients. Raise rates for over-concentrated clients. Build recurring revenue packages.",
    });
  }
}

function fitnessAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const members = num(a.member_count);
  const price = num(a.membership_price);
  const cancellations = num(a.monthly_cancellations);
  const ancillaryRev = num(a.monthly_ancillary_revenue);
  const activeUsage = num(a.active_usage_pct);
  const bmPrice = parseFloat(bm.get("avg_membership_price")?.value || "45");
  const bmRetention = parseFloat(bm.get("member_retention_target")?.value || "72");

  if (members > 0 && cancellations > 0) {
    const monthlyChurnPct = Math.round((cancellations / members) * 100);
    const annualRetention = 100 - (monthlyChurnPct * 12);
    const lostRevenue = Math.round(cancellations * price * 6); // avg member stays 6 more months
    f.push({
      id: "high_churn", title: `${cancellations} cancellations/month = $${(lostRevenue ?? 0).toLocaleString()}/year lost`,
      description: `${cancellations} of ${members} members cancel monthly (${monthlyChurnPct}%/month, ~${100 - Math.max(0, annualRetention)}% annual). Each cancellation = ~$${price * 6} in future revenue lost.`,
      category: "Revenue Leak", severity: lostRevenue > 20000 ? "critical" : "high", confidence: "high",
      impactAnnual: lostRevenue, benchmark: `<${Math.round(100 - bmRetention)}% annual churn`, yourNumber: `${monthlyChurnPct}%/month`,
      source: "your_answer + ihrsa", fixHint: "Contact cancelling members within 24h. Offer freeze instead of cancel. Improve onboarding experience.",
    });
  }

  if (price > 0 && price < bmPrice * 0.8 && members > 0) {
    const priceGap = Math.round((bmPrice - price) * members * 12);
    f.push({
      id: "low_price", title: `Membership $${price}/mo vs $${bmPrice}/mo ${prov} average`,
      description: `At $${price}/month × ${members} members, raising to $${bmPrice} would add $${(priceGap ?? 0).toLocaleString()}/year.`,
      category: "Pricing Leak", severity: priceGap > 15000 ? "high" : "medium", confidence: "medium",
      impactAnnual: priceGap, benchmark: `$${bmPrice}/mo (${prov} avg)`, yourNumber: `$${price}/mo`,
      source: "your_answer + ihrsa", fixHint: "Granfather existing members. Raise rates for new sign-ups. Add value (classes, app) to justify increase.",
    });
  }

  if (ancillaryRev === 0 && members > 50) {
    const potential = Math.round(members * 15 * 12); // $15/member/month in ancillary
    f.push({
      id: "no_ancillary", title: "$0 in personal training/classes/supplements",
      description: `With ${members} members and $0 in ancillary revenue, you're leaving ~$${(potential ?? 0).toLocaleString()}/year on the table. Top gyms make 20-30% from non-membership sources.`,
      category: "Revenue Leak", severity: "high", confidence: "medium",
      impactAnnual: potential, benchmark: "$15-25/member/month in ancillary", yourNumber: "$0/month",
      source: "your_answer + ihrsa", fixHint: "Start with group classes (low cost). Sell protein shakes/supplements. Offer 3-pack PT sessions.",
    });
  }
}

function consultingAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const rate = num(a.hourly_rate);
  const billable = num(a.weekly_billable_hours);
  const clients = num(a.client_count);
  const topClientPct = num(a.top_client_pct);
  const arDays = num(a.avg_ar_days);
  const nonBillable = num(a.weekly_nonbillable_hours);

  if (billable > 0 && nonBillable > 0) {
    const totalHours = billable + nonBillable;
    const utilization = Math.round((billable / totalHours) * 100);
    if (utilization < 65) {
      const lostRev = Math.round((totalHours * 0.65 - billable) * rate * 50);
      f.push({
        id: "low_billable", title: `Only ${billable} billable hours/week out of ${totalHours} total`,
        description: `You spend ${nonBillable} hours/week on admin, proposals, and marketing — that's ${100 - utilization}% non-billable time. Getting to 65% billable adds $${(lostRev ?? 0).toLocaleString()}/year.`,
        category: "Revenue Leak", severity: lostRev > 20000 ? "critical" : "high", confidence: "high",
        impactAnnual: lostRev, benchmark: "65%+ billable time", yourNumber: `${utilization}% billable`,
        source: "your_answer", fixHint: "Automate proposals (PandaDoc). Batch admin to Fridays. Hire a VA for $15-25/hr.",
      });
    }
  }

  if (topClientPct > 40) {
    const atRisk = Math.round(aRev * topClientPct / 100);
    f.push({
      id: "client_concentration", title: `${topClientPct}% of revenue from one client`,
      description: `If that client leaves, you lose $${(atRisk ?? 0).toLocaleString()}/year overnight. Target: no single client >25%.`,
      category: "Revenue Leak", severity: topClientPct > 50 ? "critical" : "high", confidence: "high",
      impactAnnual: Math.round(atRisk * 0.15), benchmark: "<25% from any single client", yourNumber: `${topClientPct}%`,
      source: "your_answer", fixHint: "Actively pursue 2-3 new clients. Create retainer packages for stable recurring revenue.",
    });
  }
}

function plumbingAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const rate = num(a.hourly_rate);
  const weeklyCalls = num(a.weekly_calls);
  const avgJob = num(a.avg_job_value);
  const driveHours = num(a.daily_drive_hours);
  const vehicleCost = num(a.monthly_vehicle_cost);
  const repeatPct = num(a.repeat_pct);

  if (driveHours > 1.5) {
    const lostBillableHours = Math.round((driveHours - 1) * 250); // 250 work days
    const lostRev = lostBillableHours * rate;
    f.push({
      id: "drive_time", title: `${driveHours} hours/day driving = $${(lostRev ?? 0).toLocaleString()}/year lost`,
      description: `Your crew spends ${driveHours} hours/day in the truck. Every hour driving is an hour not billing at $${rate}/hr. That's $${(lostRev ?? 0).toLocaleString()}/year.`,
      category: "Operational Leak", severity: lostRev > 15000 ? "high" : "medium", confidence: "high",
      impactAnnual: lostRev, benchmark: "<1 hour/day driving", yourNumber: `${driveHours} hours/day`,
      source: "your_answer", fixHint: "Route-optimize with Google Maps. Cluster jobs by neighbourhood. Charge travel time for distant jobs.",
    });
  }

  if (repeatPct !== -1 && repeatPct < 40) {
    const potentialRepeat = Math.round(aRev * 0.15);
    f.push({
      id: "low_repeat", title: `Only ${repeatPct}% repeat customers`,
      description: `${repeatPct}% of your calls are repeat customers. Industry leaders are at 60%+. Repeat customers cost nothing to acquire and spend more. Potential: $${(potentialRepeat ?? 0).toLocaleString()}/year.`,
      category: "Growth Leak", severity: "high", confidence: "medium",
      impactAnnual: potentialRepeat, benchmark: ">60% repeat customers", yourNumber: `${repeatPct}%`,
      source: "your_answer", fixHint: "Send maintenance reminders (annual drain cleaning, water heater flush). Follow up 6 months after every job.",
    });
  }
}

function landscapingAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const contracts = num(a.contract_count);
  const avgContract = num(a.avg_contract_monthly);
  const fuel = num(a.monthly_fuel);
  const equipment = num(a.monthly_equipment_cost);
  const crewSize = num(a.peak_crew_size);
  const seasonalPct = num(a.seasonal_revenue_pct);

  if (contracts > 0 && avgContract > 0) {
    const contractRev = contracts * avgContract * 12;
    const contractPct = Math.round((contractRev / aRev) * 100);
    if (contractPct < 60) {
      const target = Math.round(aRev * 0.70);
      f.push({
        id: "low_contract_base", title: `Only ${contractPct}% recurring revenue ($${(contractRev ?? 0).toLocaleString()}/year)`,
        description: `Recurring maintenance contracts are ${contractPct}% of revenue. Target is 70%+. Non-contract work is less predictable and harder to schedule.`,
        category: "Revenue Leak", severity: "high", confidence: "medium",
        impactAnnual: Math.round((target - contractRev) * 0.3), benchmark: ">70% from contracts", yourNumber: `${contractPct}%`,
        source: "your_answer", fixHint: "Convert one-time clients to contracts with a 10% discount. Offer fall cleanup + snow removal bundles.",
      });
    }
  }

  if (fuel > 0 && fuel > mRev * 0.06) {
    const target = Math.round(mRev * 0.04);
    const overspend = Math.round((fuel - target) * 12);
    f.push({
      id: "high_fuel", title: `Fuel at $${fuel}/mo (${Math.round(fuel / mRev * 100)}% of revenue)`,
      description: `You spend $${fuel}/month on fuel. Target is 3-5% of revenue ($${target}/month). You're overspending $${(overspend ?? 0).toLocaleString()}/year.`,
      category: "Cost Leak", severity: overspend > 3000 ? "high" : "medium", confidence: "high",
      impactAnnual: overspend, benchmark: `3-5% of revenue ($${target}/mo)`, yourNumber: `$${fuel}/mo`,
      source: "your_answer", fixHint: "Cluster routes by area. Maintain trucks (tire pressure alone saves 5%). Get a fleet fuel card for discounts.",
    });
  }
}

function ecommerceAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const aov = num(a.avg_order_value);
  const monthlyOrders = num(a.monthly_orders);
  const returnRate = num(a.return_rate_pct);
  const adSpend = num(a.monthly_ad_spend);
  const cac = num(a.customer_acq_cost);
  const repeatPct = num(a.repeat_customer_pct);

  if (returnRate > 5) {
    const returnCost = Math.round(monthlyOrders * (returnRate / 100) * aov * 0.3 * 12); // 30% of value lost on returns
    f.push({
      id: "high_returns", title: `${returnRate}% return rate = ~$${(returnCost ?? 0).toLocaleString()}/year in losses`,
      description: `${returnRate}% of orders get returned. Each return costs ~30% of order value (shipping, restocking, damage). That's ~$${(returnCost ?? 0).toLocaleString()}/year.`,
      category: "Cost Leak", severity: returnCost > 10000 ? "high" : "medium", confidence: "high",
      impactAnnual: returnCost, benchmark: "<3% return rate", yourNumber: `${returnRate}%`,
      source: "your_answer", fixHint: "Improve product photos/descriptions. Add size guides. Offer exchanges instead of refunds.",
    });
  }

  if (repeatPct !== -1 && repeatPct < 25) {
    const potentialRepeat = Math.round(aRev * 0.20);
    f.push({
      id: "low_repeat", title: `Only ${repeatPct}% repeat customers`,
      description: `Acquiring a new customer costs 5-7x more than keeping one. At ${repeatPct}% repeat rate, you're spending too much on acquisition. Getting to 30% adds ~$${(potentialRepeat ?? 0).toLocaleString()}/year.`,
      category: "Growth Leak", severity: "high", confidence: "medium",
      impactAnnual: potentialRepeat, benchmark: ">30% repeat rate", yourNumber: `${repeatPct}%`,
      source: "your_answer", fixHint: "Launch email sequences post-purchase. Offer loyalty discounts. Run retargeting ads to past buyers.",
    });
  }

  if (adSpend > 0 && cac !== -1 && cac > aov * 0.5) {
    const wasted = Math.round(adSpend * 0.3 * 12);
    f.push({
      id: "high_cac", title: `Customer acquisition $${cac} vs $${aov} average order`,
      description: `It costs $${cac} to get a customer who spends $${aov}. If they don't come back, you barely break even. Target CAC: under 30% of first order value ($${Math.round(aov * 0.3)}).`,
      category: "Marketing Leak", severity: cac > aov ? "critical" : "high", confidence: "high",
      impactAnnual: wasted, benchmark: `<$${Math.round(aov * 0.3)} CAC`, yourNumber: `$${cac} CAC`,
      source: "your_answer", fixHint: "Pause lowest-performing ad campaigns. Focus on highest-converting channels. Improve landing pages.",
    });
  }
}

function autoRepairAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const bays = num(a.bay_count);
  const labourRate = num(a.labour_rate);
  const weeklyROs = num(a.weekly_repair_orders);
  const avgRO = num(a.avg_repair_order);
  const partsMarkup = num(a.parts_markup);
  const productiveHrs = num(a.daily_productive_hours);

  if (bays > 0 && productiveHrs > 0 && productiveHrs < 6) {
    const lostHours = (7 - productiveHrs) * bays * 250;
    const lostRev = Math.round(lostHours * labourRate);
    f.push({
      id: "low_bay_efficiency", title: `Bays productive ${productiveHrs}h/day — losing $${(lostRev ?? 0).toLocaleString()}/year`,
      description: `${bays} bays × ${productiveHrs} productive hours out of 8 = ${Math.round(productiveHrs / 8 * 100)}% efficiency. Getting to 7h/day adds $${lostRev.toLocaleString()}/year.`,
      category: "Revenue Leak", severity: lostRev > 30000 ? "critical" : "high", confidence: "high",
      impactAnnual: lostRev, benchmark: "7+ productive hours/day", yourNumber: `${productiveHrs}h/day`,
      source: "your_answer", fixHint: "Pre-order parts before appointment. Reduce wait time between jobs. Add express service lane.",
    });
  }

  if (partsMarkup !== -1 && partsMarkup < 40) {
    const partsRev = Math.round(aRev * 0.45); // parts typically 45% of revenue
    const currentProfit = partsRev * (partsMarkup / 100);
    const targetProfit = partsRev * 0.50;
    const gap = Math.round(targetProfit - currentProfit);
    f.push({
      id: "low_parts_markup", title: `Parts markup ${partsMarkup}% vs 50-70% benchmark`,
      description: `Your parts markup of ${partsMarkup}% is below the industry standard of 50-70%. On ~$${(partsRev ?? 0).toLocaleString()}/year in parts, that's $${(gap ?? 0).toLocaleString()}/year in lost margin.`,
      category: "Pricing Leak", severity: gap > 10000 ? "high" : "medium", confidence: "high",
      impactAnnual: gap, benchmark: "50-70% parts markup", yourNumber: `${partsMarkup}%`,
      source: "your_answer", fixHint: "Raise parts markup to at least 50%. Most customers don't compare parts prices.",
    });
  }
}

function daycareAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const capacity = num(a.licensed_capacity);
  const filled = num(a.filled_spots);
  const dailyRate = num(a.daily_rate);
  const staff = num(a.staff_count);
  const avgWage = num(a.avg_educator_wage);

  if (capacity > 0 && filled > 0 && filled < capacity) {
    const emptySpots = capacity - filled;
    const lostRev = Math.round(emptySpots * dailyRate * 250);
    f.push({
      id: "empty_spots", title: `${emptySpots} empty spots = $${(lostRev ?? 0).toLocaleString()}/year`,
      description: `You have ${emptySpots} unfilled spots out of ${capacity} capacity (${Math.round(filled / capacity * 100)}% full). At $${dailyRate}/day, that's $${lostRev.toLocaleString()}/year in empty spots.`,
      category: "Revenue Leak", severity: lostRev > 20000 ? "critical" : "high", confidence: "high",
      impactAnnual: lostRev, benchmark: ">95% capacity", yourNumber: `${Math.round(filled / capacity * 100)}%`,
      source: "your_answer", fixHint: "Join local parent groups online. Offer referral bonuses to existing families. List on all childcare directories.",
    });
  }
}

function healthcareAnalysis(f: Finding[], a: any, mRev: number, aRev: number, bm: Map<string, any>, prov: string) {
  const dailyPatients = num(a.daily_patients);
  const weeklyNoShows = num(a.weekly_no_shows);
  const avgVisitRev = num(a.avg_visit_revenue, 150);
  const totalStaff = num(a.total_staff);
  const adminPct = num(a.admin_overhead_pct);
  const bmAdmin = parseFloat(bm.get("admin_cost_pct")?.value || "25");

  if (weeklyNoShows > 0) {
    const loss = Math.round(weeklyNoShows * avgVisitRev * 50);
    const weeklyTotal = dailyPatients * 5;
    const noShowRate = weeklyTotal > 0 ? Math.round((weeklyNoShows / weeklyTotal) * 100) : 0;
    f.push({
      id: "no_shows", title: `${weeklyNoShows} no-shows/week = $${(loss ?? 0).toLocaleString()}/year`,
      description: `${weeklyNoShows} missed appointments per week (${noShowRate}%). At $${avgVisitRev}/visit = $${(loss ?? 0).toLocaleString()}/year. ${prov} target: under 5%.`,
      category: "Revenue Leak", severity: loss > 20000 ? "critical" : "high", confidence: "high",
      impactAnnual: loss, benchmark: "<5% no-show rate", yourNumber: `${noShowRate}% (${weeklyNoShows}/week)`,
      source: "your_answer + cma_benchmark", fixHint: "Automated text reminders 48h + 2h before. Allow easy rescheduling. Waitlist to fill cancellations.",
    });
  }

  if (adminPct !== -1 && adminPct > bmAdmin) {
    const overspend = Math.round((adminPct - bmAdmin) / 100 * aRev);
    f.push({
      id: "high_admin", title: `Admin overhead ${adminPct}% vs ${bmAdmin}% benchmark`,
      description: `Your admin/overhead costs are ${adminPct}% of revenue — ${adminPct - bmAdmin}% above the ${prov} benchmark. That's $${(overspend ?? 0).toLocaleString()}/year over target.`,
      category: "Cost Leak", severity: overspend > 15000 ? "high" : "medium", confidence: "high",
      impactAnnual: overspend, benchmark: `<${bmAdmin}% admin overhead`, yourNumber: `${adminPct}%`,
      source: "your_answer + cma_benchmark", fixHint: "Automate scheduling and intake forms. Use EMR with integrated billing. Consider virtual admin support.",
    });
  }
}
