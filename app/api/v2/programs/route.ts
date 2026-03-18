// =============================================================================
// app/api/v2/programs/route.ts
// Returns government programs for the authenticated user.
// Priority: 1) AI diagnostic output  2) Hardcoded Canadian programs by province
// No external RPC or empty DB table dependency.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Hardcoded Canadian government programs — always available regardless of DB state
const PROGRAMS_FEDERAL = [
  { slug: "sred-federal",       name: "SR&ED Tax Credit",                         name_fr: "Crédit RS&DE",                          category: "tax_credit",   level: "federal",    max_amount: 1050000, description: "35% refundable tax credit on eligible R&D expenditures for CCPCs. Most impactful credit available to Canadian businesses.", url: "https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program.html" },
  { slug: "cdap",               name: "Canada Digital Adoption Program",           name_fr: "PCAN",                                  category: "grant",        level: "federal",    max_amount: 15000,   description: "Up to $15,000 grant to adopt digital technologies, plus a $100K interest-free loan.", url: "https://ised-isde.canada.ca/site/canada-digital-adoption-program/en" },
  { slug: "csbfp",              name: "Canada Small Business Financing Program",   name_fr: "FPEC",                                  category: "loan",         level: "federal",    max_amount: 1150000, description: "Government-backed loans up to $1.15M for equipment, leasehold improvements, and real property.", url: "https://ised-isde.canada.ca/site/canada-small-business-financing-program/en" },
  { slug: "canada-job-grant",   name: "Canada Job Grant",                          name_fr: "Subvention canadienne pour l emploi",   category: "training",     level: "federal",    max_amount: 10000,   description: "Up to $10,000 per employee for training costs. Government covers 2/3 of training expenses.", url: "https://www.canada.ca/en/employment-social-development/services/funding/canada-job-grant.html" },
  { slug: "nrc-irap",           name: "NRC IRAP",                                  name_fr: "PARI CNRC",                             category: "grant",        level: "federal",    max_amount: 500000,  description: "Funding and advisory services for SMBs to grow through technological innovation.", url: "https://nrc.canada.ca/en/support-technology-innovation/nrc-industrial-research-assistance-program" },
  { slug: "bdc-loan",           name: "BDC Small Business Loan",                   name_fr: "Prêt BDC",                              category: "loan",         level: "federal",    max_amount: 250000,  description: "Business Development Bank loans at competitive rates for operations, equipment, and growth.", url: "https://www.bdc.ca/en/financing" },
  { slug: "edc-financing",      name: "Export Development Canada",                 name_fr: "EDC",                                   category: "loan",         level: "federal",    max_amount: 5000000, description: "Trade financing, insurance, and bonding for Canadian businesses that export or want to.", url: "https://www.edc.ca" },
];

const PROGRAMS_QC = [
  { slug: "sred-qc",            name: "SR&ED Additional Credit (Quebec)",          name_fr: "Crédit RS&DE additionnel QC",           category: "tax_credit",   level: "provincial", max_amount: 300000,  description: "Quebec adds 30% refundable credit on SR&ED salaries, stacking on top of the federal 35% credit.", url: "https://www.revenuquebec.ca/en/businesses/tax-credits/tax-credit-for-r-and-d-salary/" },
  { slug: "c3i-qc",             name: "C3i Tax Credit (Quebec)",                   name_fr: "Crédit C3i (Québec)",                   category: "tax_credit",   level: "provincial", max_amount: 250000,  description: "30% tax credit on investment in manufacturing and processing equipment in Quebec.", url: "https://www.revenuquebec.ca/en/businesses/tax-credits/" },
  { slug: "iq-pme",             name: "Investissement Québec — PME",               name_fr: "Investissement Québec — PME",           category: "loan",         level: "provincial", max_amount: 5000000, description: "Financing, loan guarantees, and advisory services for Quebec SMBs at every growth stage.", url: "https://www.investissement-quebec.com/en/services-for-businesses/" },
  { slug: "emploi-qc-embauche", name: "Emploi-Québec Hiring Subsidy",              name_fr: "Subvention à l embauche Emploi-Québec", category: "wage_subsidy", level: "provincial", max_amount: 30000,   description: "Wage subsidy for Quebec employers hiring workers from under-represented groups.", url: "https://www.emploiquebec.gouv.qc.ca" },
  { slug: "pstm-qc",            name: "PSTM — Market Transition Support",          name_fr: "PSTM — Soutien transition des marchés", category: "grant",        level: "provincial", max_amount: 100000,  description: "Quebec grants up to $100K for businesses transitioning to new markets or distribution channels.", url: "https://www.economie.gouv.qc.ca" },
];

const PROGRAMS_ON = [
  { slug: "ontario-manufacturing-itc", name: "Ontario Made Manufacturing ITC",    name_fr: "CII fabrication Ontario Made",           category: "tax_credit",   level: "provincial", max_amount: 2000000, description: "10% refundable income tax credit on capital investments in eligible manufacturing equipment.", url: "https://www.ontario.ca/page/ontario-made-manufacturing-investment-tax-credit" },
  { slug: "ontario-jcp",        name: "Ontario Job Creation Partnership",          name_fr: "Partenariat création d emplois ON",     category: "wage_subsidy", level: "provincial", max_amount: 25000,   description: "Funding to create employment through paid work placements in Ontario.", url: "https://www.ontario.ca/page/ontario-job-creation-partnerships" },
];

const PROGRAMS_BC = [
  { slug: "bc-employer-training", name: "BC Employer Training Grant",              name_fr: "Subvention formation employeurs C.-B.", category: "training",     level: "provincial", max_amount: 300000,  description: "Up to $10,000 per employee for skills training to upskill your BC workforce.", url: "https://www.workbc.ca/Employer-Resources/BC-Employer-Training-Grant" },
];

function getProgramsForProvince(province: string | undefined) {
  const federal = PROGRAMS_FEDERAL;
  const prov = province?.toUpperCase();
  if (prov === "QC") return [...federal, ...PROGRAMS_QC];
  if (prov === "ON") return [...federal, ...PROGRAMS_ON];
  if (prov === "BC") return [...federal, ...PROGRAMS_BC];
  return federal;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = ((token as any)?.id || token?.sub) as string | undefined;

    let province: string | undefined;

    // Get province from business profile
    if (userId) {
      try {
        const { data: profile } = await supabaseAdmin
          .from("business_profiles")
          .select("province")
          .eq("user_id", userId)
          .single();
        if (profile?.province) province = profile.province;
      } catch {}
    }

    // If no province from profile, check query params
    if (!province) {
      province = req.nextUrl.searchParams.get("province") || undefined;
    }

    // Get programs for this province
    const programs = getProgramsForProvince(province);

    // Also check if there is a completed diagnostic with AI-generated programs
    // If so, merge them (AI programs take priority)
    if (userId) {
      try {
        const { data: report } = await supabaseAdmin
          .from("diagnostic_reports")
          .select("result_json")
          .eq("user_id", userId)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const aiPrograms = (report?.result_json as any)?.programs;
        if (aiPrograms?.length > 0) {
          // Return AI-generated programs enriched with hardcoded data where slug matches
          const hardcodedBySlug = Object.fromEntries(
            getProgramsForProvince(province).map(p => [p.slug, p])
          );
          const merged = aiPrograms.map((ap: any) => ({
            ...hardcodedBySlug[ap.slug],
            ...ap,
          }));
          return NextResponse.json({ success: true, data: { programs: merged, total: merged.length } });
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: { programs, total: programs.length },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
