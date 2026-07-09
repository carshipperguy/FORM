/**
 * Partial-lead grace window.
 *
 * This is where the fix lives. The rules, in plain terms:
 *
 *   • Save a partial lead to `partial_leads` IMMEDIATELY (so we never lose a
 *     drop-off). -> capturePartialLead()
 *
 *   • Do NOT deliver it to Zapier immediately. Hold it for ~2 minutes. Then
 *     re-check whether a completed quote was submitted for the same
 *     session_id / phone / email.
 *       - Full quote exists  -> mark the partial converted, do NOT send.
 *       - No full quote yet   -> send it to Zapier as an abandoned/partial lead.
 *     -> deliverDuePartials()
 *
 *   • A completed quote submission suppresses the matching partial up front.
 *     -> markQuoteCompleted()
 *
 *   • Delivery is idempotent (atomic claim + delivered flag + Zapier
 *     idempotency key) so retries or double blur/debounce cannot double-send.
 */

import {
  CompletedQuoteKey,
  GRACE_WINDOW_MS,
  leadStore,
} from "./leadStore";
import { deliverPartialLeadToZapier } from "./zapier";

export interface CapturePartialInput {
  sessionId: string;
  name?: string;
  email?: string;
  phone?: string;
  payload: unknown;
}

/**
 * Called by the form as soon as we have a usable partial (on blur/debounce of
 * the contact fields). Saves immediately; (re)starts the grace window. Safe to
 * call repeatedly for the same session — it updates one row, never inserts a
 * duplicate, and never delivers here.
 */
export async function capturePartialLead(input: CapturePartialInput) {
  if (!input.sessionId) {
    throw new Error("capturePartialLead requires a sessionId");
  }
  const deliverAfter = Date.now() + GRACE_WINDOW_MS;
  return leadStore.upsertPartialLead({ ...input, deliverAfter });
}

/**
 * Called when a full quote is submitted. Records the completion and suppresses
 * any still-pending partial for the same session/email/phone so it is never
 * delivered to Zapier as an abandoned lead.
 */
export async function markQuoteCompleted(key: CompletedQuoteKey) {
  await leadStore.markQuoteCompleted(key);
}

/**
 * The sweeper. Run this on a short interval (e.g. every 30–60s) from a
 * scheduler or a cron-style Zap hitting POST /api/leads/sweep.
 *
 * For each partial whose grace window has elapsed:
 *   - if a completed quote now exists for it -> release as converted (no send)
 *   - otherwise -> deliver to Zapier once, idempotently
 */
export async function deliverDuePartials(
  now: number = Date.now(),
  limit = 50
): Promise<{ delivered: number; suppressed: number; failed: number }> {
  const due = await leadStore.claimDuePartials(now, limit);

  let delivered = 0;
  let suppressed = 0;
  let failed = 0;

  for (const lead of due) {
    // Final guard: a full quote may have landed after the row was claimed.
    const completed = await leadStore.hasCompletedQuote({
      sessionId: lead.sessionId,
      email: lead.email,
      phone: lead.phone,
    });

    if (completed) {
      await leadStore.markQuoteCompleted({ sessionId: lead.sessionId });
      await leadStore.releaseClaim(lead.sessionId, false);
      suppressed++;
      continue;
    }

    try {
      const result = await deliverPartialLeadToZapier({
        sessionId: lead.sessionId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        payload: lead.payload,
      });
      if (result.delivered || result.skipped) {
        // A skipped delivery (webhook not configured) is treated as terminal so
        // we do not spin retrying every sweep; it is logged inside the helper.
        await leadStore.markDelivered(lead.sessionId);
        if (result.delivered) delivered++;
      }
    } catch (err) {
      console.error(
        "[partial-lead] delivery failed for",
        lead.sessionId,
        err
      );
      await leadStore.releaseClaim(lead.sessionId, true);
      failed++;
    }
  }

  return { delivered, suppressed, failed };
}
