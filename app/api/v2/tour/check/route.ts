// =============================================================================
// src/app/api/v2/tour/check/route.ts
// =============================================================================
// GET — Returns whether the current user should be shown the tour.
// Called by useTourRedirect hook on dashboard/post-login pages.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: true, should_show_tour: false });
    }

    const userId = (session.user as any).id;

    // Direct query — check both column variants
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ success: true, should_show_tour: false });
    }

    // Onboarding done? (check both boolean and timestamp)
    const onboardingDone = !!(
      profile.onboarding_completed === true ||
      profile.onboarding_completed_at
    );

    // Tour done?
    const tourDone = !!(
      profile.tour_completed_at ||
      profile.tour_step_reached >= 4
    );

    // Show tour only if onboarding IS done but tour is NOT done
    const showTour = onboardingDone && !tourDone;

    return NextResponse.json({ success: true, should_show_tour: showTour });

  } catch (err: any) {
    console.error("[Tour:Check] Error:", err);
    return NextResponse.json({ success: true, should_show_tour: false });
  }
}
