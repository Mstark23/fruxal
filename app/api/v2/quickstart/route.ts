// =============================================================================
// app/api/v2/quickstart/route.ts
// GET /api/v2/quickstart?businessId=XXX
// Returns completion status of each onboarding step from real data.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 15;

export interface QuickStartStep {
  id:          string;
  label:       string;
  label_fr:    string;
  description: string;
  desc_fr:     string;
  href:        string;
  done:        boolean;
  points:      number;   // contribution to progress %
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId    = (session.user as any).id as string;
    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    // Verify ownership
    const { data: biz } = await supabaseAdmin
      .from("businesses").select("id").eq("id", businessId).eq("owner_user_id", userId).maybeSingle();
    const { data: prof } = !biz
      ? await supabaseAdmin.from("business_profiles").select("business_id").eq("business_id", businessId).eq("user_id", userId).maybeSingle()
      : { data: null };
    if (!biz && !prof) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Fetch all step data in parallel
    const [prescanRow, reportRow, taskRow, goalRow, plaidRow] = await Promise.all([
      // Step 1: prescan completed
      supabaseAdmin.from("prescan_results").select("id").eq("user_id", userId).limit(1).maybeSingle().then(r => r.data),

      // Step 2: full diagnostic run
      supabaseAdmin.from("diagnostic_reports")
        .select("id").eq("business_id", businessId).eq("status", "completed").limit(1).maybeSingle().then(r => r.data),

      // Step 3: first task completed
      supabaseAdmin.from("diagnostic_tasks")
        .select("id").eq("business_id", businessId).eq("status", "done").limit(1).maybeSingle().then(r => r.data),

      // Step 4: goal set
      supabaseAdmin.from("business_goals")
        .select("id").eq("business_id", businessId).limit(1).maybeSingle().then(r => r.data),

      // Step 5: bank connected (Plaid)
      (async () => {
        try {
          const r = await supabaseAdmin.from("plaid_connections")
            .select("id").eq("business_id", businessId).limit(1).maybeSingle();
          return r.data;
        } catch { return null; }
      })(),
    ]);

    const steps: QuickStartStep[] = [
      {
        id:          "prescan",
        label:       "Run your free prescan",
        label_fr:    "Lancez votre prescan gratuit",
        description: "See your top financial leaks in 2 minutes — no signup needed",
        desc_fr:     "Voyez vos principales fuites financières en 2 minutes",
        href:        "/",
        done:        !!prescanRow,
        points:      15,
      },
      {
        id:          "diagnostic",
        label:       "Complete your full diagnostic",
        label_fr:    "Complétez votre diagnostic complet",
        description: "Get your health score, all findings, and a 90-day action plan",
        desc_fr:     "Obtenez votre score santé, vos constats et votre plan d'action",
        href:        "/v2/diagnostic",
        done:        !!reportRow,
        points:      35,
      },
      {
        id:          "first_task",
        label:       "Complete your first task",
        label_fr:    "Complétez votre première tâche",
        description: "Mark one fix as done — every dollar recovered counts",
        desc_fr:     "Marquez une correction comme faite — chaque dollar compte",
        href:        "/v2/diagnostic",
        done:        !!taskRow,
        points:      25,
      },
      {
        id:          "goal",
        label:       "Set a 90-day goal",
        label_fr:    "Fixez un objectif de 90 jours",
        description: "Commit to a savings target and track your progress",
        desc_fr:     "Engagez-vous sur un objectif d'épargne et suivez vos progrès",
        href:        "/v2/dashboard",
        done:        !!goalRow,
        points:      15,
      },
      {
        id:          "bank",
        label:       "Connect your bank account",
        label_fr:    "Connectez votre compte bancaire",
        description: "Unlock deeper analysis with real transaction data",
        desc_fr:     "Débloquez une analyse plus précise avec vos données réelles",
        href:        "/v2/integrations",
        done:        !!plaidRow,
        points:      10,
      },
    ];

    const progress = steps.reduce((s, st) => s + (st.done ? st.points : 0), 0);
    const completed = steps.filter(s => s.done).length;
    const nextStep  = steps.find(s => !s.done) ?? null;
    const allDone   = completed === steps.length;

    return NextResponse.json({ steps, progress, completed, total: steps.length, nextStep, allDone });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
