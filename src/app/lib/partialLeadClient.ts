"use client";

/**
 * Client-side helpers for partial-lead capture.
 *
 * - A stable per-session id (kept in sessionStorage) so every partial save and
 *   the final quote submit share the same key. This is what lets the backend
 *   de-dupe blur/debounce spam into ONE partial row and later match the
 *   completed quote to it.
 * - A debounced capture call so typing does not fire a request per keystroke.
 *
 * Saving a partial NEVER delivers anything externally on its own — the backend
 * holds it for a grace window first (see lib/partialLeadService.ts).
 */

const SESSION_KEY = "quote_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function extractContact(data: any) {
  const s = data?.shipment_details ?? {};
  return { name: s.name, email: s.email, phone: s.phone };
}

/** True once there is enough of a lead to be worth saving. */
function hasUsableLead(data: any): boolean {
  const { email, phone } = extractContact(data);
  return Boolean((email && String(email).includes("@")) || (phone && String(phone).replace(/\D/g, "").length >= 7));
}

export async function capturePartialLead(data: any): Promise<void> {
  if (typeof window === "undefined" || !hasUsableLead(data)) return;
  const sessionId = getSessionId();
  const { name, email, phone } = extractContact(data);
  try {
    await fetch("/api/partial_lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, name, email, phone, data }),
      keepalive: true,
    });
  } catch {
    // Best-effort: a failed partial save must never disrupt the form.
  }
}

export function debounce<A extends any[]>(fn: (...args: A) => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
