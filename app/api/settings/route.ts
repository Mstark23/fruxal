import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/client";
import { sanitize } from "@/lib/security";
import { getSupabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  // Auth fix: resolve userId from JWT — never trust client-supplied userId
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = ((token as any)?.id || token?.sub) as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await req.json();
    const { name, businessName, industry, tier, notifPrefs } = sanitize(raw);
    // Ignore any client-supplied userId/businessId — derive from auth token

    // Update user name via Prisma
    if (name) {
      await prisma.user.update({ where: { id: userId }, data: { name } });
    }

    // Look up the user's business_id from their profile (ownership verified by user_id)
    const { data: profile } = await supabaseAdmin
      .from("business_profiles")
      .select("business_id")
      .eq("user_id", userId)
      .single()
      .catch(() => ({ data: null }));

    const businessId = profile?.business_id;

    if (businessId) {
      const supabase = getSupabase();
      const updates: Record<string, any> = {};
      if (businessName) updates.name = businessName;
      if (industry) updates.industry = industry;
      if (tier) updates.tier = tier;
      updates.updatedAt = new Date().toISOString();

      if (Object.keys(updates).length > 1) {
        const { error } = await supabase
          .from("businesses")
          .update(updates)
          .eq("id", businessId);

        if (error) {
          try {
            const prismaUpdates: any = {};
            if (businessName) prismaUpdates.name = businessName;
            if (industry) prismaUpdates.industry = industry;
            if (Object.keys(prismaUpdates).length > 0) {
              await prisma.business.update({ where: { id: businessId }, data: prismaUpdates });
            }
          } catch (e) { /* Prisma fallback failed too */ }
        }
      }

      if (notifPrefs) {
        try {
          await supabase
            .from("businesses")
            .update({ notifPrefs: JSON.stringify(notifPrefs) })
            .eq("id", businessId);
        } catch (e) { /* column may not exist yet */ }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
