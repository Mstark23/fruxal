// =============================================================================
// GET /api/industry-detail?industry=restaurant
// Returns leak patterns, categories, and question count for a given industry
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const industry = request.nextUrl.searchParams.get("industry");
    if (!industry) {
      return NextResponse.json({ error: "industry param required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Fetch leak patterns for this industry
    const { data: patterns } = await supabase
      .from("industry_leak_patterns")
      .select("id, title, leak_category, annual_low, annual_high, probability_pct, description")
      .eq("industry", industry)
      .order("leak_category")
      .order("probability_pct", { ascending: false });

    // Fetch question count
    const { count: questionCount } = await supabase
      .from("diagnostic_questions")
      .select("id", { count: "exact", head: true })
      .eq("industry", industry);

    const cats = [...new Set((patterns || []).map(p => p.leak_category))];

    return NextResponse.json({
      patterns: patterns || [],
      stats: {
        patterns: patterns?.length ?? 0,
        categories: cats.length,
        questions: questionCount ?? 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
