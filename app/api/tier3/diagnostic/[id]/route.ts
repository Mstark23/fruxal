// =============================================================================
// GET /api/tier3/diagnostic/[id] — Fetch a single diagnostic by ID
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("tier3_diagnostics")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message || "Diagnostic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      diagnostic: {
        id: data.id,
        companyName: data.company_name,
        industry: data.industry,
        province: data.province,
        revenueBracket: data.revenue_bracket,
        employeeCount: data.employee_count,
        callAnswers: data.call_answers,
        result: data.result,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error("[Tier3:GET:id]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
