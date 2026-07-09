/**
 * Idempotent delivery of a partial ("abandoned") lead to Zapier.
 *
 * Two layers of protection against sending the same partial twice:
 *
 *   1. The caller (the sweeper in `partialLeadService.ts`) only ever calls this
 *      after atomically claiming the row and re-checking that it has not been
 *      delivered. So retries / double blur / debounce cannot reach here twice
 *      for the same session under normal operation.
 *
 *   2. Belt-and-suspenders: we send an idempotency key (the sessionId) in the
 *      payload so that if Zapier / a downstream Zap is configured to de-dupe,
 *      it can drop a duplicate on its side too.
 *
 * Configure the target with the ZAPIER_PARTIAL_LEAD_WEBHOOK_URL env var. If it
 * is not set, delivery is skipped (and logged) rather than throwing, so a
 * missing config never blocks the form.
 */

export interface PartialLeadDelivery {
  sessionId: string;
  name?: string;
  email?: string;
  phone?: string;
  payload: unknown;
}

export async function deliverPartialLeadToZapier(
  lead: PartialLeadDelivery
): Promise<{ delivered: boolean; skipped?: boolean }> {
  const webhookUrl = process.env.ZAPIER_PARTIAL_LEAD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "[zapier] ZAPIER_PARTIAL_LEAD_WEBHOOK_URL not set; skipping partial-lead delivery for",
      lead.sessionId
    );
    return { delivered: false, skipped: true };
  }

  const body = {
    // Idempotency key: downstream Zaps should de-dupe on this.
    idempotency_key: lead.sessionId,
    lead_type: "partial",
    session_id: lead.sessionId,
    name: lead.name ?? null,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    data: lead.payload,
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Some Zapier setups honour this header for de-duplication as well.
      "Idempotency-Key": lead.sessionId,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(
      `Zapier partial-lead delivery failed (${res.status} ${res.statusText})`
    );
  }

  return { delivered: true };
}
