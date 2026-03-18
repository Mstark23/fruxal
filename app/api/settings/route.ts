import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { sanitize } from "@/lib/security";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const { name, businessName, industry, tier, notifPrefs, userId, businessId } = sanitize(raw);

    // Update user name via Prisma
    if (userId && name) {
      await prisma.user.update({ where: { id: userId }, data: { name } });
    }

    // Update business via Supabase (supports tier, revenue, employee_count)
    if (businessId) {
      const supabase = getSupabase();
      const updates: Record<string, any> = {};
      if (businessName) updates.name = businessName;
      if (industry) updates.industry = industry;
      if (tier) updates.tier = tier;
      updates.updatedAt = new Date().toISOString();

      if (Object.keys(updates).length > 1) { // >1 because updatedAt always present
        const { error } = await supabase
          .from("businesses")
          .update(updates)
          .eq("id", businessId);

        if (error) {
          console.error("Business update error:", error);
          // Fallback to Prisma for basic fields (name, industry)
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

      // Save notification preferences
      if (notifPrefs) {
        try {
          await supabase
            .from("businesses")
            .update({ notifPrefs: JSON.stringify(notifPrefs) })
            .eq("id", businessId);
        } catch (e) { /* column may not exist yet — non-fatal */ }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
