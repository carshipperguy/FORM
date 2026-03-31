/**
 * Passive event tracking utility.
 *
 * ALL calls are:
 * - Fire-and-forget (never awaited)
 * - Non-blocking (no impact on submission path)
 * - Failure-safe (all errors silently swallowed)
 *
 * Posts to /api/events on this same origin — no CORS required.
 */

export function trackEvent(eventName: string, data: Record<string, unknown> = {}): void {
  try {
    let sessionId: string | null = null;
    try {
      sessionId = sessionStorage.getItem("amerigo_session_id");
    } catch {
      // sessionStorage blocked (private mode); proceed without it
    }

    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      ...data,
    };

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Swallow all synchronous errors (malformed payload, AbortSignal unavailable, etc.)
  }
}
