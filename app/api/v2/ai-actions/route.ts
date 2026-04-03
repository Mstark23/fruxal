// =============================================================================
// POST /api/v2/ai-actions — AI Assistant Action Executor
// =============================================================================
// Lets the AI assistant execute actions on behalf of the authenticated user.
// Supported actions:
//   mark_obligation_complete, create_task, schedule_reminder,
//   run_scenario, generate_report, export_pdf
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

// ─── Simple in-memory rate limiter (30 req/min per user) ────────────────────
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
async function resolveBusinessId(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("owner_user_id", userId)
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

function baseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function forwardHeaders(req: NextRequest): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const cookie = req.headers.get("cookie");
  if (cookie) headers["cookie"] = cookie;
  return headers;
}

// ─── Action handlers ────────────────────────────────────────────────────────

async function handleMarkObligationComplete(
  userId: string,
  params: { obligation_slug: string; actual_cost?: number }
) {
  const { obligation_slug, actual_cost } = params;
  if (!obligation_slug) {
    return NextResponse.json(
      { error: "obligation_slug is required" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {
    status: "completed",
    completed_at: new Date().toISOString(),
  };
  if (actual_cost !== undefined) {
    updates.actual_cost = actual_cost;
  }

  const { error } = await supabaseAdmin
    .from("user_obligations")
    .update(updates)
    .eq("user_id", userId)
    .eq("obligation_slug", obligation_slug);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: "Obligation marked as complete",
  });
}

async function handleCreateTask(
  userId: string,
  businessId: string,
  params: {
    title: string;
    category?: string;
    savings_estimate?: number;
    effort?: "easy" | "medium" | "hard";
    notes?: string;
  }
) {
  const { title, category, savings_estimate, effort, notes } = params;
  if (!title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }

  const savingsMonthly =
    savings_estimate != null ? Math.round((savings_estimate / 12) * 100) / 100 : null;

  const { data, error } = await supabaseAdmin
    .from("diagnostic_tasks")
    .insert({
      business_id: businessId,
      title,
      category: category ?? "general",
      savings_monthly: savingsMonthly,
      effort: effort ?? "medium",
      status: "open",
      priority: 50,
      notes: notes ?? null,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: "Task created",
    taskId: data.id,
  });
}

async function handleScheduleReminder(
  userId: string,
  params: { title: string; due_date: string; notes?: string }
) {
  const { title, due_date, notes } = params;
  if (!title || !due_date) {
    return NextResponse.json(
      { error: "title and due_date are required" },
      { status: 400 }
    );
  }

  const slug = `custom_reminder_${Date.now()}`;

  // Ensure the obligation_rules entry exists for this slug
  const { data: existingRule } = await supabaseAdmin
    .from("obligation_rules")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!existingRule) {
    await supabaseAdmin.from("obligation_rules").insert({
      slug,
      title,
      category: "reminder",
      risk_level: "medium",
    });
  }

  // Insert the user obligation
  const { error } = await supabaseAdmin.from("user_obligations").insert({
    user_id: userId,
    obligation_slug: slug,
    status: "upcoming",
    next_deadline: due_date,
    notes: notes ?? null,
  });

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: `Reminder scheduled for ${due_date}`,
  });
}

async function handleRunScenario(
  req: NextRequest,
  params: { scenario: string }
) {
  const { scenario } = params;
  if (!scenario) {
    return NextResponse.json(
      { error: "scenario text is required" },
      { status: 400 }
    );
  }

  const res = await fetch(`${baseUrl(req)}/api/v2/scenario-model`, {
    method: "POST",
    headers: forwardHeaders(req),
    body: JSON.stringify({ scenario }),
  });

  const result = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: result.error ?? "Scenario model failed" },
      { status: res.status }
    );
  }
  return NextResponse.json({ success: true, ...result });
}

async function handleGenerateReport(
  req: NextRequest,
  params: { type: "board_summary" | "tax_calendar" | "industry_report" }
) {
  const { type } = params;
  if (!type) {
    return NextResponse.json(
      { error: "report type is required" },
      { status: 400 }
    );
  }

  const endpointMap: Record<string, string> = {
    board_summary: "/api/v2/industry-report",
    tax_calendar: "/api/v2/tax-calendar",
    industry_report: "/api/v2/industry-report",
  };

  const endpoint = endpointMap[type];
  if (!endpoint) {
    return NextResponse.json(
      { error: `Unknown report type: ${type}` },
      { status: 400 }
    );
  }

  const res = await fetch(`${baseUrl(req)}${endpoint}`, {
    method: "POST",
    headers: forwardHeaders(req),
    body: JSON.stringify({ type }),
  });

  const result = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: result.error ?? "Report generation failed" },
      { status: res.status }
    );
  }
  return NextResponse.json({ success: true, ...result });
}

function handleExportPdf(params: { reportId: string }) {
  const { reportId } = params;
  if (!reportId) {
    return NextResponse.json(
      { error: "reportId is required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    url: `/api/v2/diagnostic/${reportId}/pdf`,
  });
}

// ─── Main POST handler ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    // Rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 30 actions per minute." },
        { status: 429 }
      );
    }

    // Parse body
    const body = await req.json();
    const { action, params } = body as { action: string; params: Record<string, unknown> };

    if (!action) {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      );
    }

    // Resolve businessId for actions that need it
    const needsBusiness = ["create_task"];
    let businessId: string | null = null;
    if (needsBusiness.includes(action)) {
      businessId = await resolveBusinessId(userId);
      if (!businessId) {
        return NextResponse.json(
          { error: "No business found for user" },
          { status: 404 }
        );
      }
    }

    // Dispatch
    switch (action) {
      case "mark_obligation_complete":
        return await handleMarkObligationComplete(
          userId,
          params as { obligation_slug: string; actual_cost?: number }
        );

      case "create_task":
        return await handleCreateTask(
          userId,
          businessId!,
          params as {
            title: string;
            category?: string;
            savings_estimate?: number;
            effort?: "easy" | "medium" | "hard";
            notes?: string;
          }
        );

      case "schedule_reminder":
        return await handleScheduleReminder(
          userId,
          params as { title: string; due_date: string; notes?: string }
        );

      case "run_scenario":
        return await handleRunScenario(
          req,
          params as { scenario: string }
        );

      case "generate_report":
        return await handleGenerateReport(
          req,
          params as { type: "board_summary" | "tax_calendar" | "industry_report" }
        );

      case "export_pdf":
        return handleExportPdf(
          params as { reportId: string }
        );

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error("[ai-actions] Error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
