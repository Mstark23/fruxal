// GET /api/notifications — Get notifications for a business
// POST /api/notifications — Create/trigger notification
// PATCH /api/notifications — Mark as read
import { NextRequest, NextResponse } from "next/server";
import { generateNotification, getNotifications, markRead } from "@/services/notifications/engine";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  const notifications = await getNotifications(businessId);
  const unread = notifications.filter((n: any) => !n.readAt).length;
  return NextResponse.json({ notifications, unread, total: notifications.length });
}

export async function POST(req: NextRequest) {
  try {
    const { type, businessId, data } = await req.json();
    if (!type || !businessId) return NextResponse.json({ error: "type and businessId required" }, { status: 400 });
    const notification = generateNotification(type, businessId, data || {});
    await supabase.from("notifications").insert({
      id: notification.id,
      businessId: notification.businessId,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      body: notification.body,
      cta: notification.cta,
      ctaUrl: notification.ctaUrl,
      channel: notification.channel,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { notificationId } = await req.json();
  if (!notificationId) return NextResponse.json({ error: "notificationId required" }, { status: 400 });
  await markRead(notificationId);
  return NextResponse.json({ success: true });
}
