/**
 * Passive event tracking utility.
 *
 * ALL calls are:
 * - Fire-and-forget (never awaited)
 * - Non-blocking (zero impact on submission path)
 * - Failure-safe (all errors silently swallowed)
 *
 * Posts directly to the CRM app — no routing through this app's backend.
 * CORS is handled on the CRM side.
 */

const CRM_URL = `https://${import.meta.env.VITE_CRM_DOMAIN || "amerigoautotransport.replit.app"}`;

export function trackEvent(eventName: string, data: Record<string, unknown> = {}): void {
  try {
    let sessionId: string | null = null;
    try {
      sessionId = sessionStorage.getItem("amerigo_session_id");
    } catch {
      // sessionStorage blocked (private/incognito mode) — proceed without it
    }

    const payload = {
      event_name: eventName,
      session_id: sessionId || null,
      data: data || {},
    };

    fetch(`${CRM_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "amerigo_secret_123",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Swallow all synchronous errors (malformed URL, AbortSignal unavailable, etc.)
  }
}
