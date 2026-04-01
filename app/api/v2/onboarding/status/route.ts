// =============================================================================
// src/app/api/v2/onboarding/status/route.ts
// =============================================================================
// GET — Returns onboarding + tour completion status for redirect logic.
// Checks BOTH onboarding_completed (boolean) AND onboarding_completed_at (timestamp)
// to handle schema differences between migrations.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      // Not logged in — don't block, let middleware handle auth redirect
      return NextResponse.json({ success: true, onboarding_completed: true, tour_completed: true });
    }

    const userId = (session.user as any).id;

    // Query ALL possible columns — some may not exist depending on which migrations ran
    const { data: profile, error } = await supabaseAdmin
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // No profile at all — user just registered, needs onboarding
    if (!profile || error) {
      return NextResponse.json({
        success: true,
        onboarding_completed: false,
        tour_completed: false,
        businessId: null,
      });
    }

    // Check BOTH boolean and timestamp columns for onboarding
    const onboardingDone = !!(
      profile.onboarding_completed === true ||
      profile.onboarding_completed_at
    );

    // Check tour completion — if column doesn't exist, consider it done
    const tourDone = !!(
      profile.tour_completed_at ||
      profile.tour_step_reached >= 4
    );

    return NextResponse.json({
      success: true,
      onboarding_completed: onboardingDone,
      tour_completed: tourDone,
      // Expose businessId so diagnostic/page.tsx doesn't need a second dashboard fetch
      businessId: profile.business_id || null,
    });

  } catch (err: any) {
    console.error("[Onboarding:Status] Error:", err);
    // On error, DON'T block — let user through
    return NextResponse.json({ success: true, onboarding_completed: true, tour_completed: true });
  }
}
