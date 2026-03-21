// =============================================================================
// SENTRY — Error monitoring
// =============================================================================
// Set NEXT_PUBLIC_SENTRY_DSN in env to enable
// =============================================================================

const SENTRY_DSN = typeof window !== "undefined"
  ? (window as any).__ENV__?.NEXT_PUBLIC_SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  : process.env.NEXT_PUBLIC_SENTRY_DSN;

let sentryInitialized = false;

export async function initSentry() {
  if (sentryInitialized || !SENTRY_DSN) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      environment: process.env.NODE_ENV || "production",
      beforeSend(event) {
        // Strip PII
        if (event.user) { delete event.user.ip_address; }
        return event;
      },
    });
    sentryInitialized = true;
  } catch (e) {
    // Sentry not installed — that's fine
    process.env.NODE_ENV !== "production" && console.log("Sentry not available (install @sentry/nextjs to enable)");
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (!SENTRY_DSN) {
    console.error("[Error]", error.message, context);
    return;
  }
  try {
    const Sentry = require("@sentry/nextjs");
    if (context) Sentry.setContext("extra", context);
    Sentry.captureException(error);
  } catch (e) {
    console.error("[Error]", error.message, context);
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (!SENTRY_DSN) { process.env.NODE_ENV !== "production" && console.log(`[${level}]`, message); return; }
  try {
    const Sentry = require("@sentry/nextjs");
    Sentry.captureMessage(message, level);
  } catch (e) { process.env.NODE_ENV !== "production" && console.log(`[${level}]`, message); }
}
