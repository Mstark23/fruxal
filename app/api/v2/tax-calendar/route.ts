// =============================================================================
// GET /api/v2/tax-calendar — Personalized 12-Month Tax & Compliance Calendar
// =============================================================================
// Deterministic date math — no AI calls. Generates every filing deadline,
// estimated payment, and penalty for missing based on business profile.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface CalendarEvent {
  title: string;
  date: string; // YYYY-MM-DD
  category: "tax_filing" | "payment" | "compliance" | "renewal" | "reporting";
  penalty_if_missed: string;
  description: string;
  government_body: string;
  recurring: "monthly" | "quarterly" | "annually" | "one_time";
}

interface BusinessProfile {
  business_name?: string;
  industry?: string;
  province?: string;
  country?: string;
  business_structure?: string;
  employee_count?: number;
  fiscal_year_end_month?: number;
  incorporation_date?: string;
  gst_registration_date?: string;
  has_payroll?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Return the last day of a given month (1-indexed). */
function lastDay(year: number, month: number): Date {
  return new Date(year, month, 0); // month is 1-indexed here because Date(y, m, 0) = last day of month m-1+1
}

/** Add N months to a reference date, clamp to end of month. */
function addMonths(d: Date, n: number): Date {
  const result = new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  // Clamp: if original was 31 Jan + 1 month, don't skip to March
  if (result.getDate() !== d.getDate()) {
    result.setDate(0); // last day of previous month
  }
  return result;
}

/** Return the Nth day of a given month, or last day if month is shorter. */
function dayOfMonth(year: number, month: number, day: number): Date {
  const last = lastDay(year, month);
  const d = new Date(year, month - 1, Math.min(day, last.getDate()));
  return d;
}

/** End of month for a 1-indexed month. */
function endOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0);
}

/** Return all months in the next 12 months from `now` as [year, month] pairs (1-indexed month). */
function next12Months(now: Date): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  let y = now.getFullYear();
  let m = now.getMonth() + 1; // 1-indexed
  for (let i = 0; i < 12; i++) {
    result.push([y, m]);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return result;
}

/** Is this date within the next 12 months from `now`? */
function inWindow(d: Date, now: Date): boolean {
  const end = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  return d >= now && d <= end;
}

// ─── Canadian Calendar ──────────────────────────────────────────────────────

function generateCanadianCalendar(profile: BusinessProfile, now: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const fyeMonth = profile.fiscal_year_end_month || 12; // default Dec
  const province = (profile.province || "").toUpperCase();
  const hasPayroll = !!profile.has_payroll;
  const empCount = profile.employee_count ?? 0;
  const months = next12Months(now);

  // Fiscal year end date (most recent one before or during window)
  const fyeThisYear = new Date(now.getFullYear(), fyeMonth - 1, endOfMonth(now.getFullYear(), fyeMonth).getDate());
  const fyeLastYear = new Date(now.getFullYear() - 1, fyeMonth - 1, endOfMonth(now.getFullYear() - 1, fyeMonth).getDate());
  const fyeNextYear = new Date(now.getFullYear() + 1, fyeMonth - 1, endOfMonth(now.getFullYear() + 1, fyeMonth).getDate());
  const fyeDates = [fyeLastYear, fyeThisYear, fyeNextYear];

  // 1. Corporate Tax Return (T2) — 6 months after fiscal year end
  for (const fye of fyeDates) {
    const t2Date = addMonths(fye, 6);
    if (inWindow(t2Date, now)) {
      events.push({
        title: "Corporate Tax Return (T2)",
        date: fmt(t2Date),
        category: "tax_filing",
        penalty_if_missed: "5% of balance owing + 1% per month late (max 12 months)",
        description: `T2 return due 6 months after fiscal year end (${fye.toLocaleDateString("en-CA", { month: "long", year: "numeric" })}).`,
        government_body: "CRA",
        recurring: "annually",
      });
    }
  }

  // 2. Corporate Tax Payment — 2 months after fiscal year end (3 months for small CCPCs)
  const isSmallCCPC = (profile.business_structure || "").toLowerCase().includes("ccpc") || empCount < 20;
  const paymentLag = isSmallCCPC ? 3 : 2;
  for (const fye of fyeDates) {
    const payDate = addMonths(fye, paymentLag);
    if (inWindow(payDate, now)) {
      events.push({
        title: "Corporate Tax Payment Due",
        date: fmt(payDate),
        category: "payment",
        penalty_if_missed: "Interest at prescribed rate (~6% annually) on unpaid balance",
        description: `Balance of corporate tax owing due ${paymentLag} months after fiscal year end.`,
        government_body: "CRA",
        recurring: "annually",
      });
    }
  }

  // 3. GST/HST Filing — assume quarterly for most small businesses
  //    Quarterly: end of month following quarter end (Apr 30, Jul 31, Oct 31, Jan 31)
  const gstQuarterEnds: Array<[number, number]> = [[1, 31], [4, 30], [7, 31], [10, 31]]; // [month, day] of due date
  // Quarterly due dates: Jan 31 (for Oct-Dec), Apr 30 (for Jan-Mar), Jul 31 (for Apr-Jun), Oct 31 (for Jul-Sep)
  for (const [y] of [[now.getFullYear()], [now.getFullYear() + 1]]) {
    for (const [m, d] of gstQuarterEnds) {
      const dueDate = new Date(y, m - 1, d);
      if (inWindow(dueDate, now)) {
        events.push({
          title: "GST/HST Quarterly Filing & Payment",
          date: fmt(dueDate),
          category: "tax_filing",
          penalty_if_missed: "1% of net tax owing + 0.25% per month late (max 12 months)",
          description: `GST/HST return and payment due for the preceding quarter.`,
          government_body: "CRA",
          recurring: "quarterly",
        });
      }
    }
  }

  // 4. Payroll Remittances — 15th of following month (small remitter)
  if (hasPayroll) {
    for (const [y, m] of months) {
      const remitDate = dayOfMonth(y, m, 15);
      if (inWindow(remitDate, now)) {
        events.push({
          title: "Payroll Remittance Due",
          date: fmt(remitDate),
          category: "payment",
          penalty_if_missed: "3% (1-3 days late), 5% (4-5 days), 7% (6-7 days), 10% (8+ days)",
          description: `Source deductions (CPP, EI, income tax) for previous month due by the 15th.`,
          government_body: "CRA",
          recurring: "monthly",
        });
      }
    }
  }

  // 5. T4 Summary — Last day of February
  for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
    const t4Date = endOfMonth(y, 2);
    if (inWindow(t4Date, now) && hasPayroll) {
      events.push({
        title: "T4 Summary Filing",
        date: fmt(t4Date),
        category: "reporting",
        penalty_if_missed: "$100-$7,500 depending on number of slips",
        description: `T4 information return and slips due for the previous calendar year.`,
        government_body: "CRA",
        recurring: "annually",
      });
    }
  }

  // 6. Quebec-specific: QST Filing
  if (province === "QC") {
    for (const [y] of [[now.getFullYear()], [now.getFullYear() + 1]]) {
      for (const [m, d] of gstQuarterEnds) {
        const dueDate = new Date(y, m - 1, d);
        if (inWindow(dueDate, now)) {
          events.push({
            title: "QST Quarterly Filing",
            date: fmt(dueDate),
            category: "tax_filing",
            penalty_if_missed: "Same as GST: 1% + 0.25%/month",
            description: `Quebec Sales Tax return due (same schedule as GST).`,
            government_body: "Revenu Québec",
            recurring: "quarterly",
          });
        }
      }
    }
  }

  // 7. Provincial Workers Comp — typically March
  for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
    const wcDate = new Date(y, 2, 31); // March 31
    if (inWindow(wcDate, now) && empCount > 0) {
      const body = province === "ON" ? "WSIB" : province === "QC" ? "CNESST" : province === "BC" ? "WorkSafeBC" : province === "AB" ? "WCB Alberta" : "Workers Comp Board";
      events.push({
        title: "Workers Compensation Annual Return",
        date: fmt(wcDate),
        category: "compliance",
        penalty_if_missed: "Penalties and surcharges vary by province; potential coverage lapse",
        description: `Annual workers compensation reporting and premium reconciliation.`,
        government_body: body,
        recurring: "annually",
      });
    }
  }

  // 8. Annual Return — province-specific
  for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
    let arDate: Date | null = null;
    let body = "";
    if (province === "ON") {
      arDate = new Date(y, 5, 30); // June 30
      body = "Ontario Ministry of Public and Business Service Delivery";
    } else if (province === "QC") {
      arDate = new Date(y, 3, 30); // April 30
      body = "Registraire des entreprises du Québec";
    } else if (province === "BC") {
      // Within 2 months of anniversary — approximate as anniversary month + 2
      const incDate = profile.incorporation_date ? new Date(profile.incorporation_date) : null;
      if (incDate) {
        const annivMonth = incDate.getMonth(); // 0-indexed
        arDate = endOfMonth(y, annivMonth + 3); // +2 months after anniversary month (1-indexed)
      } else {
        arDate = new Date(y, 10, 30); // Default Nov 30 if unknown
      }
      body = "BC Registry Services";
    } else if (province === "AB") {
      // Within 6 months of fiscal year end in Alberta
      arDate = addMonths(new Date(y, fyeMonth - 1, 28), 6);
      body = "Alberta Corporate Registry";
    } else {
      // Default: ~6 months after fiscal year end for federal
      arDate = addMonths(new Date(y, fyeMonth - 1, 28), 6);
      body = "Corporations Canada";
    }
    if (arDate && inWindow(arDate, now)) {
      events.push({
        title: "Annual Return Filing",
        date: fmt(arDate),
        category: "compliance",
        penalty_if_missed: "$200-$5,000 depending on province; risk of dissolution",
        description: `Annual corporate return to maintain good standing.`,
        government_body: body,
        recurring: "annually",
      });
    }
  }

  return events;
}

// ─── US Calendar ────────────────────────────────────────────────────────────

function generateUSCalendar(profile: BusinessProfile, now: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const structure = (profile.business_structure || "c_corp").toLowerCase();
  const isSCorp = structure.includes("s_corp") || structure.includes("s-corp") || structure.includes("scorp");
  const hasPayroll = !!profile.has_payroll;
  const empCount = profile.employee_count ?? 0;
  const state = (profile.province || "").toUpperCase();
  const months = next12Months(now);

  for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
    // 1. Federal Income Tax Filing — March 15 (S-corp) or April 15 (C-corp)
    const filingDate = isSCorp ? new Date(y, 2, 15) : new Date(y, 3, 15);
    if (inWindow(filingDate, now)) {
      events.push({
        title: isSCorp ? "Form 1120-S Filing" : "Form 1120 Filing",
        date: fmt(filingDate),
        category: "tax_filing",
        penalty_if_missed: isSCorp ? "$220/month per shareholder (max 12 months)" : "5% of unpaid tax per month (max 25%)",
        description: `Federal corporate income tax return due.`,
        government_body: "IRS",
        recurring: "annually",
      });
    }

    // 2. Estimated Tax Payments — April 15, June 15, Sep 15, Jan 15
    const estDates: Array<[number, number]> = [[3, 15], [5, 15], [8, 15], [0, 15]];
    for (const [m, d] of estDates) {
      const estYear = m === 0 ? y + 1 : y;
      const estMonth = m === 0 ? 0 : m;
      const estDate = new Date(estYear, estMonth, d);
      if (inWindow(estDate, now)) {
        events.push({
          title: "Estimated Tax Payment (Form 1120-W)",
          date: fmt(estDate),
          category: "payment",
          penalty_if_missed: "Underpayment penalty at federal short-term rate + 3%",
          description: `Quarterly estimated tax installment due.`,
          government_body: "IRS",
          recurring: "quarterly",
        });
      }
    }

    // 3. Form 941 — Quarterly payroll: Apr 30, Jul 31, Oct 31, Jan 31
    if (hasPayroll) {
      const f941Dates: Array<[number, number]> = [[3, 30], [6, 31], [9, 31], [0, 31]];
      for (const [m, d] of f941Dates) {
        const fYear = m === 0 ? y + 1 : y;
        const fMonth = m === 0 ? 0 : m;
        const fDate = new Date(fYear, fMonth, d);
        if (inWindow(fDate, now)) {
          events.push({
            title: "Form 941 (Quarterly Payroll Tax)",
            date: fmt(fDate),
            category: "tax_filing",
            penalty_if_missed: "5% of unpaid tax per month (max 25%); plus failure-to-deposit penalties",
            description: `Employer's quarterly federal tax return for payroll taxes.`,
            government_body: "IRS",
            recurring: "quarterly",
          });
        }
      }
    }

    // 4. Form 940 (FUTA) — January 31
    if (hasPayroll) {
      const futaDate = new Date(y, 0, 31);
      if (inWindow(futaDate, now)) {
        events.push({
          title: "Form 940 (FUTA Annual Return)",
          date: fmt(futaDate),
          category: "tax_filing",
          penalty_if_missed: "5% of unpaid tax per month (max 25%)",
          description: `Federal Unemployment Tax Act annual return.`,
          government_body: "IRS",
          recurring: "annually",
        });
      }
    }

    // 5. W-2/W-3 — January 31
    if (hasPayroll) {
      const w2Date = new Date(y, 0, 31);
      if (inWindow(w2Date, now)) {
        events.push({
          title: "W-2 / W-3 Filing Deadline",
          date: fmt(w2Date),
          category: "reporting",
          penalty_if_missed: "$50-$290 per form depending on lateness",
          description: `Employee wage statements (W-2) and transmittal (W-3) due to SSA.`,
          government_body: "SSA / IRS",
          recurring: "annually",
        });
      }
    }

    // 6. 1099-NEC — January 31
    const nec1099Date = new Date(y, 0, 31);
    if (inWindow(nec1099Date, now)) {
      events.push({
        title: "1099-NEC Filing Deadline",
        date: fmt(nec1099Date),
        category: "reporting",
        penalty_if_missed: "$50-$290 per form depending on lateness",
        description: `Non-employee compensation forms due to IRS and recipients.`,
        government_body: "IRS",
        recurring: "annually",
      });
    }

    // 7. State Sales Tax — Monthly (simplified)
    if (state) {
      for (const [my, mm] of months) {
        if (my !== y && y === now.getFullYear()) continue; // avoid double-counting across year loop
        const stDate = dayOfMonth(my, mm, 20); // Most states: ~20th of following month
        if (inWindow(stDate, now)) {
          events.push({
            title: `State Sales Tax Filing (${state})`,
            date: fmt(stDate),
            category: "tax_filing",
            penalty_if_missed: "Varies by state; typically 5-25% penalty + interest",
            description: `Monthly state sales tax return and remittance.`,
            government_body: `${state} Dept. of Revenue`,
            recurring: "monthly",
          });
        }
      }
    }

    // 8. State Income Tax — follows federal deadline
    if (state) {
      const stateIncDate = isSCorp ? new Date(y, 2, 15) : new Date(y, 3, 15);
      if (inWindow(stateIncDate, now)) {
        events.push({
          title: `State Income Tax Return (${state})`,
          date: fmt(stateIncDate),
          category: "tax_filing",
          penalty_if_missed: "Varies by state; typically mirrors federal penalties",
          description: `State corporate income tax return (typically follows federal deadline).`,
          government_body: `${state} Dept. of Revenue`,
          recurring: "annually",
        });
      }
    }
  }

  return events;
}

// ─── Main Generator ─────────────────────────────────────────────────────────

function generateCalendar(profile: BusinessProfile, now: Date) {
  const country = profile.country || "CA";
  const isUS = country === "US";
  const events = isUS ? generateUSCalendar(profile, now) : generateCanadianCalendar(profile, now);

  // Sort by date
  events.sort((a, b) => a.date.localeCompare(b.date));

  // Deduplicate events with same title + date
  const seen = new Set<string>();
  const unique = events.filter(e => {
    const key = `${e.title}|${e.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Calculate rough total penalties at risk (count of events * avg penalty estimate)
  // We can't sum string penalties, so give a rough dollar estimate
  const totalPenalties = unique.length * 500; // Conservative estimate: $500 avg per missed deadline

  return { events: unique, total_penalties_at_risk: totalPenalties };
}

// ─── Route Handler ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [profile, obligations] = await Promise.all([
      supabaseAdmin
        .from("business_profiles")
        .select("business_name, industry, province, country, business_structure, employee_count, fiscal_year_end_month, incorporation_date, gst_registration_date, has_payroll")
        .eq("user_id", userId)
        .maybeSingle()
        .then(r => r.data),
      supabaseAdmin
        .from("user_obligations")
        .select("obligation_slug, status, next_deadline, obligation_rules(title, category, penalty_max, frequency)")
        .eq("user_id", userId)
        .then(r => r.data || []),
    ]);

    if (!profile) return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });

    const now = new Date();
    const result = generateCalendar(profile, now);

    // Merge existing tracked obligations into the calendar
    const trackedEvents: CalendarEvent[] = (obligations as any[])
      .filter(o => o.next_deadline)
      .map(o => ({
        title: (o as any).obligation_rules?.title || o.obligation_slug,
        date: o.next_deadline,
        category: ((o as any).obligation_rules?.category || "compliance") as CalendarEvent["category"],
        penalty_if_missed: (o as any).obligation_rules?.penalty_max ? `Up to $${(o as any).obligation_rules.penalty_max}` : "Varies",
        description: `Tracked obligation: ${o.obligation_slug} (${o.status})`,
        government_body: "See obligation details",
        recurring: ((o as any).obligation_rules?.frequency || "annually") as CalendarEvent["recurring"],
      }));

    // Merge: add tracked obligations that aren't already in the generated calendar
    const generatedTitles = new Set(result.events.map(e => e.title.toLowerCase()));
    for (const te of trackedEvents) {
      if (!generatedTitles.has(te.title.toLowerCase())) {
        result.events.push(te);
      }
    }

    // Re-sort after merge
    result.events.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      calendar: {
        events: result.events,
        total_penalties_at_risk: result.total_penalties_at_risk,
      },
      events: result.events,
      totalPenaltyRisk: result.total_penalties_at_risk,
      businessName: profile.business_name,
      country: profile.country || "CA",
    });
  } catch (err: any) {
    console.error("[TaxCalendar]", err.message);
    return NextResponse.json({ error: "Calendar generation failed" }, { status: 500 });
  }
}
