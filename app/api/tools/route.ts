// =============================================================================
// GET /api/tools — Scan-Aware, Region-Filtered Tools
// =============================================================================
// Only shows tools that fix YOUR specific problems from YOUR scan
// Cross-references: detected_leaks → leak categories → solution categories
// Filters by region (CA users don't see HSA, US users don't see SR&ED)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

// ─── Leak Category → Solution Category Mapping ───────────────────────────────
const LEAK_TO_SOLUTION: Record<string, string[]> = {
  // Scan orchestrator categories
  "vendor-costs":           ["Inventory", "ERP", "Manufacturing", "POS"],
  "collections":            ["Invoicing", "Accounting", "CRM", "Payments"],
  "insurance":              ["Insurance", "Insurance AMS", "Compliance"],
  "payroll-labor":          ["Payroll", "Scheduling", "Time Tracking"],
  "software-subscriptions": ["Analytics", "PM Software", "Project Management"],
  "processing-fees":        ["Payments", "POS", "Invoicing"],
  "contracts":              ["Legal PM", "Documents", "CRM"],
  "compliance-tax":         ["Tax PM", "Accounting", "Bookkeeping", "Compliance", "Government"],
  "pricing-margins":        ["POS", "Invoicing", "Accounting", "Analytics"],
  "operations":             ["Scheduling", "Inventory", "ERP", "Field Service"],
  // Prescan leak categories (12 types)
  "Revenue":      ["POS", "CRM", "Booking", "E-commerce", "Invoicing", "Payments"],
  "Cost":         ["Accounting", "Inventory", "ERP", "Payroll", "Insurance"],
  "Marketing":    ["SEO", "Email", "Analytics", "CRM", "Platform"],
  "Operational":  ["Scheduling", "Inventory", "Field Service", "Dispatch", "Time Tracking"],
  "Cash Flow":    ["Invoicing", "Payments", "Accounting", "Bookkeeping"],
  "Tax":          ["Tax PM", "Accounting", "Government", "Compliance", "Bookkeeping"],
  "Compliance":   ["Compliance", "Safety", "Documents", "Insurance"],
  "Pricing":      ["POS", "Analytics", "Invoicing", "CRM"],
  "People":       ["Payroll", "Scheduling", "Time Tracking", "LMS"],
  "Technology":   ["Dev Tools", "Hosting", "Security", "MSP", "Analytics"],
  "Vendor":       ["Inventory", "ERP", "Logistics", "WMS"],
  "Growth":       ["CRM", "Email", "SEO", "Analytics", "E-commerce", "Platform", "Government"],
  // Niche 1:1 mappings
  "Auto Repair": ["Auto Repair"], "Construction PM": ["Construction PM"],
  "Restaurant POS": ["Restaurant POS"], "Dental PM": ["Dental PM"],
  "Legal PM": ["Legal PM"], "Home Care": ["Home Care"],
  "Fitness Mgmt": ["Fitness Mgmt", "Gym Mgmt", "Class Mgmt"],
};

const REGION_NAMES: Record<string, string> = {
  US: "United States", CA: "Canada", UK: "United Kingdom", AU: "Australia",
};
const CURRENCIES: Record<string, { code: string; symbol: string }> = {
  US: { code: "USD", symbol: "$" }, CA: { code: "CAD", symbol: "CA$" },
  UK: { code: "GBP", symbol: "£" }, AU: { code: "AUD", symbol: "A$" },
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const supabase = getSupabase();
    const regionOverride = request.nextUrl.searchParams.get("region");

    const { data: membership } = await supabase
      .from("business_members")
      .select("businessId")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const { data: biz } = await supabase
      .from("businesses")
      .select("id, name, industry, region, country_code, currency")
      .eq("id", membership.businessId)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const region = regionOverride || biz.region || biz.country_code || "US";
    const industry = biz.industry || "restaurant";

    // ─── 1. Get user's detected leaks ────────────────────────────────────────
    const { data: leaks } = await supabase
      .from("detected_leaks")
      .select("id, category, title, annualImpact, severity, status")
      .eq("businessId", membership.businessId)
      .neq("status", "FIXED");

    const hasScanned = leaks && leaks.length > 0;
    const leakCategories: string[] = [...new Set((leaks || []).map((l: any) => l.category).filter(Boolean))].map(String);

    // Map leak categories → needed solution categories
    const neededCats = new Set<string>();
    for (const lc of leakCategories) {
      const mapped = LEAK_TO_SOLUTION[lc];
      if (mapped) mapped.forEach(sc => neededCats.add(sc));
    }
    neededCats.add("DIY");
    neededCats.add("Government");

    // ─── 2. Fetch region-filtered solutions ──────────────────────────────────
    const { data: solutions } = await supabase
      .from("industry_solutions")
      .select("*")
      .eq("industry_slug", industry)
      .eq("active", true)
      .or(`regions.cs.{${region}},regions.cs.{GLOBAL}`)
      .order("relevance_score", { ascending: false });

    if (!solutions || solutions.length === 0) {
      return NextResponse.json({
        region: { code: region, name: REGION_NAMES[region] || region, currency: CURRENCIES[region] || CURRENCIES.US },
        industry, hasScanned, leakCategories,
        recommended: [], otherTools: [], totalTools: 0,
        summary: { recommended: 0, other: 0, free: 0, paid: 0 },
        leakSummary: [], availableRegions: ["US", "CA", "UK", "AU"],
      });
    }

    // ─── 3. Split: Recommended (fixes your problems) vs Other ────────────────
    const recommended: any[] = [];
    const otherTools: any[] = [];

    for (const s of solutions) {
      const tool = {
        id: s.id, slug: s.product_slug, name: s.product_name,
        type: s.product_type, category: s.category,
        description: s.description, url: s.url,
        regions: s.regions || ["GLOBAL"], relevance: s.relevance_score,
        matchedLeaks: [] as string[], whyYouNeed: "",
      };

      if (hasScanned) {
        const isNeeded = neededCats.has(s.category);
        if (isNeeded) {
          tool.matchedLeaks = leakCategories.filter(lc => (LEAK_TO_SOLUTION[lc] || []).includes(s.category));
          // Human-readable reason
          if (tool.matchedLeaks.length > 0) {
            tool.whyYouNeed = `Fixes your ${tool.matchedLeaks.slice(0, 2).join(" and ")} ${tool.matchedLeaks.length > 2 ? `+${tool.matchedLeaks.length - 2} more` : ""} problems`;
          }
          recommended.push(tool);
        } else {
          otherTools.push(tool);
        }
      } else {
        otherTools.push(tool);
      }
    }

    recommended.sort((a, b) => {
      if (b.matchedLeaks.length !== a.matchedLeaks.length) return b.matchedLeaks.length - a.matchedLeaks.length;
      return (b.relevance || 80) - (a.relevance || 80);
    });

    // ─── 4. Group by category ────────────────────────────────────────────────
    const groupTools = (tools: any[]) => {
      const cats: Record<string, any[]> = {};
      for (const t of tools) {
        const c = t.category || "Other";
        if (!cats[c]) cats[c] = [];
        cats[c].push(t);
      }
      return Object.entries(cats).map(([name, tools]) => ({
        name, tools, count: tools.length,
        freeCount: tools.filter(t => t.type === "FREE").length,
        paidCount: tools.filter(t => t.type === "AFFILIATE").length,
      })).sort((a, b) => b.count - a.count);
    };

    // ─── 5. Leak summary with tool counts ────────────────────────────────────
    const leakSummary = (leaks || []).map(l => ({
      id: l.id, category: l.category, title: l.title,
      annualImpact: l.annualImpact, severity: l.severity,
      toolCount: recommended.filter(t => t.matchedLeaks.includes(l.category)).length,
    }));

    return NextResponse.json({
      region: { code: region, name: REGION_NAMES[region] || region, currency: CURRENCIES[region] || CURRENCIES.US },
      industry, hasScanned, leakCategories,
      recommended: groupTools(recommended),
      otherTools: groupTools(otherTools),
      totalTools: solutions.length,
      summary: {
        recommended: recommended.length, other: otherTools.length,
        free: solutions.filter(s => s.product_type === "FREE").length,
        paid: solutions.filter(s => s.product_type === "AFFILIATE").length,
      },
      leakSummary, availableRegions: ["US", "CA", "UK", "AU"],
    });
  } catch (error: any) {
    console.error("[Tools API]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const supabase = getSupabase();
    const { region } = await request.json();
    if (!region) return NextResponse.json({ error: "region required" }, { status: 400 });

    const { data: membership } = await supabase
      .from("business_members").select("businessId").eq("userId", userId)
      .order("createdAt", { ascending: false }).limit(1).single();
    if (!membership) return NextResponse.json({ error: "No business found" }, { status: 404 });

    const currencyMap: Record<string, string> = { US: "USD", CA: "CAD", UK: "GBP", AU: "AUD" };
    await supabase.from("businesses")
      .update({ region, country_code: region, currency: currencyMap[region] || "USD" })
      .eq("id", membership.businessId);

    return NextResponse.json({ success: true, region });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
