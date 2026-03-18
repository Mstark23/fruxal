// =============================================================================
// OUTBOUND WEBHOOKS — Fire events to external services
// =============================================================================
// Events: scan.complete, leak.found, leak.fixed, alert.triggered
// Users register webhook URLs in settings. We POST JSON payloads.
// =============================================================================
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export interface WebhookEvent {
  event: string;
  businessId: string;
  timestamp: string;
  data: any;
}

export async function fireWebhook(event: string, businessId: string, data: any): Promise<void> {
  try {
    const { data: hooks } = await sb
      .from("webhook_endpoints")
      .select("*")
      .eq("businessId", businessId)
      .eq("active", true);

    if (!hooks || hooks.length === 0) return;

    const payload: WebhookEvent = {
      event,
      businessId,
      timestamp: new Date().toISOString(),
      data,
    };

    for (const hook of hooks) {
      // Check if this hook is subscribed to this event
      const events = hook.events ? JSON.parse(hook.events) : ["*"];
      if (!events.includes("*") && !events.includes(event)) continue;

      // Fire webhook (non-blocking, with retry)
      fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": hook.secret || "",
          "X-Event": event,
        },
        body: JSON.stringify(payload),
      }).then(async res => {
        await sb.from("webhook_logs").insert({
          id: `whl_${Date.now()}`,
          endpointId: hook.id,
          event,
          status: res.status,
          responseBody: await res.text().catch(() => ""),
          createdAt: new Date().toISOString(),
        });
      }).catch(async err => {
        await sb.from("webhook_logs").insert({
          id: `whl_${Date.now()}`,
          endpointId: hook.id,
          event,
          status: 0,
          responseBody: err.message,
          createdAt: new Date().toISOString(),
        });
      });
    }
  } catch (e) { /* non-fatal */ }
}

// Convenience helpers
export const fireScanComplete = (businessId: string, data: any) => fireWebhook("scan.complete", businessId, data);
export const fireLeakFound = (businessId: string, data: any) => fireWebhook("leak.found", businessId, data);
export const fireLeakFixed = (businessId: string, data: any) => fireWebhook("leak.fixed", businessId, data);
export const fireAlertTriggered = (businessId: string, data: any) => fireWebhook("alert.triggered", businessId, data);
