// =============================================================================
// src/app/api/tier3/diagnostic/route.ts
// =============================================================================
// POST — Run diagnostic engine, save to Supabase, return result + record ID
// GET  — List all saved diagnostics (rep dashboard)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { runDiagnostic, DiagnosticInput } from "@/services/tier3/diagnostic-engine";
import crypto from "crypto";

export const maxDuration = 30; // Vercel function timeout (seconds)

// ─── POST: Run diagnostic + save ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Parse and validate input
    const body = await req.json();
    const {
      companyName,
      industry,
      revenueBracket,
      province,
      employeeCount,
      callAnswers,
    } = body;

    // Validate required fields
    if (!companyName || !industry || !revenueBracket || !province) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: companyName, industry, revenueBracket, province" },
        { status: 400 }
      );
    }

    if (!["1M_5M", "5M_20M", "20M_50M"].includes(revenueBracket)) {
      return NextResponse.json(
        { success: false, error: "revenueBracket must be one of: 1M_5M, 5M_20M, 20M_50M" },
        { status: 400 }
      );
    }

    if (!["ON", "QC", "BC", "AB", "MB"].includes(province)) {
      return NextResponse.json(
        { success: false, error: "province must be one of: ON, QC, BC, AB, MB" },
        { status: 400 }
      );
    }

    // Build engine input with defaults for missing call answers
    const input: DiagnosticInput = {
      companyName: companyName.trim(),
      industry: industry.trim(),
      revenueBracket,
      province,
      employeeCount: Number(employeeCount) || 10,
      callAnswers: {
        vendorContractsLastRenegotiated: callAnswers?.vendorContractsLastRenegotiated || "",
        taxStructureLastReviewed: callAnswers?.taxStructureLastReviewed || "",
        benefitsPlanLastRebid: callAnswers?.benefitsPlanLastRebid || "",
        hasDedicatedCFO: callAnswers?.hasDedicatedCFO ?? false,
        primaryBank: callAnswers?.primaryBank || "",
        monthlySaasSpend: Number(callAnswers?.monthlySaasSpend) || 0,
        claimedSRED: callAnswers?.claimedSRED ?? false,
        biggestPainPoint: callAnswers?.biggestPainPoint || "",
      },
    };

    // Run the diagnostic engine
    process.env.NODE_ENV !== "production" && console.log(`[Tier3] Running diagnostic for "${input.companyName}" — ${input.industry}, ${input.province}, ${input.revenueBracket}`);
    const result = runDiagnostic(input);
    process.env.NODE_ENV !== "production" && console.log(`[Tier3] Complete: ${result.topLeaks.length} leaks, $${(result.summary.totalEstimatedLow ?? 0).toLocaleString()}-$${(result.summary.totalEstimatedHigh ?? 0).toLocaleString()} total exposure`);

    // Save to Supabase
    const recordId = crypto.randomUUID();
    let savedId = recordId;

    try {
      const { data, error } = await supabaseAdmin
        .from("tier3_diagnostics")
        .insert({
          id: recordId,
          user_id: userId,
          company_name: input.companyName,
          industry: input.industry,
          province: input.province,
          revenue_bracket: input.revenueBracket,
          employee_count: input.employeeCount,
          call_answers: input.callAnswers,
          result: result,
          status: "draft",
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error("[Tier3] Supabase save error:", error.message);
        // Don't fail the request — still return the result
      } else if (data) {
        savedId = data.id;
      }
    } catch (dbErr: any) {
      console.error("[Tier3] DB error (table may not exist):", dbErr.message);
      // Continue — result is still valid even if save fails
    }

    return NextResponse.json({
      success: true,
      id: savedId,
      result,
    });

  } catch (error: any) {
    console.error("[Tier3] Diagnostic error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── GET: List all diagnostics ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const status = searchParams.get("status"); // filter by status if provided

    let query = supabaseAdmin
      .from("tier3_diagnostics")
      .select("id, company_name, industry, province, revenue_bracket, employee_count, status, created_at, result")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Tier3:GET] Error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Return list with summary extracted from result for quick display
    const diagnostics = (data || []).map((row: any) => ({
      id: row.id,
      companyName: row.company_name,
      industry: row.industry,
      province: row.province,
      revenueBracket: row.revenue_bracket,
      employeeCount: row.employee_count,
      status: row.status,
      createdAt: row.created_at,
      summary: row.result?.summary || null,
      leakCount: row.result?.topLeaks?.length ?? 0,
      highConfidenceCount: row.result?.summary?.highConfidenceCount ?? 0,
    }));

    return NextResponse.json({
      success: true,
      count: diagnostics.length,
      diagnostics,
    });

  } catch (error: any) {
    console.error("[Tier3:GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── GET single diagnostic by ID ─────────────────────────────────────────────
// Usage: /api/tier3/diagnostic?id=xxx

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "id and status required" }, { status: 400 });
    }

    if (!["draft", "sent", "signed", "rejected", "archived"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "status must be one of: draft, sent, signed, rejected, archived" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("tier3_diagnostics")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, status")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
