/**
 * Lead storage layer.
 *
 * This models the two-table design we are keeping for now:
 *
 *   1. partial_leads  – a row is written the instant we have enough of a
 *                       lead to be worth saving (name / email / phone typed
 *                       into the quote form). This save is IMMEDIATE.
 *
 *   2. completed_quotes – a row is written when the customer actually finishes
 *                         and submits a full quote.
 *
 * The bug we are fixing is NOT that both rows exist. It is that the partial
 * row was being *delivered to Zapier* immediately, so every customer who went
 * on to finish the form produced two external leads (one "partial", one
 * "complete"). The fix lives in `partialLeadService.ts`; this file only stores
 * and queries rows.
 *
 * -------------------------------------------------------------------------
 * IMPORTANT – swapping in the real database
 * -------------------------------------------------------------------------
 * The `InMemoryLeadStore` below is a working reference implementation so the
 * routes run and can be tested locally. It lives in a module-level singleton,
 * which is fine for a single always-on server (e.g. a Replit VM) but will NOT
 * persist across serverless cold starts or multiple instances.
 *
 * In production, back this with the same Postgres/DB tables the live app
 * already uses by implementing the `LeadStore` interface (see the method docs
 * for the exact semantics each query must have). Nothing else has to change.
 */

export type PartialLeadStatus =
  | "pending" // saved, waiting out the grace window before we decide
  | "sent" // grace window elapsed with no full quote -> delivered to Zapier
  | "converted" // a full quote arrived -> suppressed, never sent to Zapier
  | "failed"; // delivery to Zapier failed, will be retried by the sweeper

export interface PartialLead {
  /** Stable per-browser-session id. This is the primary de-dupe key: repeated
   *  blur/debounce events for the same session update this row, never insert a
   *  second one. */
  sessionId: string;
  name?: string;
  email?: string;
  phone?: string;
  /** The full form payload captured so far (origin/destination, vehicle, …). */
  payload: unknown;
  status: PartialLeadStatus;
  /** Epoch ms. The partial must not be delivered to Zapier before this time.
   *  Set to now + grace window on every capture so an actively-typing user is
   *  never treated as abandoned. */
  deliverAfter: number;
  /** True once we have handed this partial to Zapier. Guards against double
   *  delivery. */
  delivered: boolean;
  /** Set while a sweeper is actively delivering this row, so two concurrent
   *  sweeps cannot both send it. */
  deliveryClaimedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CompletedQuoteKey {
  sessionId?: string;
  email?: string;
  phone?: string;
}

export interface LeadStore {
  /**
   * Insert-or-update a partial lead keyed by `sessionId`.
   * MUST be idempotent on sessionId: calling it twice for the same session
   * updates the existing row rather than creating a second one. This is what
   * makes repeated blur / debounce events safe.
   */
  upsertPartialLead(input: {
    sessionId: string;
    name?: string;
    email?: string;
    phone?: string;
    payload: unknown;
    deliverAfter: number;
  }): Promise<PartialLead>;

  /**
   * Record that a full quote was submitted, and flip any still-pending partial
   * for the same session/email/phone to `converted` so the sweeper suppresses
   * it. MUST match on ANY of sessionId, email, or phone.
   */
  markQuoteCompleted(key: CompletedQuoteKey): Promise<void>;

  /**
   * True if a completed quote exists for any of the supplied identifiers.
   * Used as a second guard at delivery time.
   */
  hasCompletedQuote(key: CompletedQuoteKey): Promise<boolean>;

  /**
   * Atomically claim up to `limit` partials whose grace window has elapsed and
   * that have not been delivered, marking them as claimed so a concurrent
   * sweeper will not pick them up. Returns the claimed rows.
   */
  claimDuePartials(now: number, limit: number): Promise<PartialLead[]>;

  /** Mark a claimed partial as successfully delivered to Zapier. */
  markDelivered(sessionId: string): Promise<void>;

  /** Release a claim after a failed delivery so it is retried on a later sweep. */
  releaseClaim(sessionId: string, failed: boolean): Promise<void>;
}

/* ------------------------------------------------------------------------- *
 * Reference in-memory implementation (see file header for caveats).
 * ------------------------------------------------------------------------- */

class InMemoryLeadStore implements LeadStore {
  private partials = new Map<string, PartialLead>();
  private completed: CompletedQuoteKey[] = [];

  async upsertPartialLead(input: {
    sessionId: string;
    name?: string;
    email?: string;
    phone?: string;
    payload: unknown;
    deliverAfter: number;
  }): Promise<PartialLead> {
    const existing = this.partials.get(input.sessionId);
    const nowUpdated = input.deliverAfter - GRACE_WINDOW_MS;

    if (existing) {
      // Never resurrect a partial that already resolved.
      if (existing.status === "pending" || existing.status === "failed") {
        existing.name = input.name ?? existing.name;
        existing.email = input.email ?? existing.email;
        existing.phone = input.phone ?? existing.phone;
        existing.payload = input.payload;
        existing.deliverAfter = input.deliverAfter;
        existing.updatedAt = nowUpdated;
      }
      return existing;
    }

    const row: PartialLead = {
      sessionId: input.sessionId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      payload: input.payload,
      status: "pending",
      deliverAfter: input.deliverAfter,
      delivered: false,
      createdAt: nowUpdated,
      updatedAt: nowUpdated,
    };
    this.partials.set(input.sessionId, row);
    return row;
  }

  async markQuoteCompleted(key: CompletedQuoteKey): Promise<void> {
    this.completed.push(key);
    Array.from(this.partials.values()).forEach((row) => {
      if (row.status !== "pending" && row.status !== "failed") return;
      if (matchesKey(row, key)) {
        row.status = "converted";
      }
    });
  }

  async hasCompletedQuote(key: CompletedQuoteKey): Promise<boolean> {
    return this.completed.some((c) => keysOverlap(c, key));
  }

  async claimDuePartials(now: number, limit: number): Promise<PartialLead[]> {
    const claimed: PartialLead[] = [];
    const rows = Array.from(this.partials.values());
    for (let i = 0; i < rows.length && claimed.length < limit; i++) {
      const row = rows[i];
      const isDue =
        (row.status === "pending" || row.status === "failed") &&
        !row.delivered &&
        row.deliverAfter <= now &&
        !row.deliveryClaimedAt;
      if (isDue) {
        row.deliveryClaimedAt = now;
        claimed.push(row);
      }
    }
    return claimed;
  }

  async markDelivered(sessionId: string): Promise<void> {
    const row = this.partials.get(sessionId);
    if (!row) return;
    row.delivered = true;
    row.status = "sent";
    row.deliveryClaimedAt = undefined;
  }

  async releaseClaim(sessionId: string, failed: boolean): Promise<void> {
    const row = this.partials.get(sessionId);
    if (!row) return;
    row.deliveryClaimedAt = undefined;
    if (failed) row.status = "failed";
  }
}

function matchesKey(row: PartialLead, key: CompletedQuoteKey): boolean {
  return (
    (!!key.sessionId && key.sessionId === row.sessionId) ||
    (!!key.email && normalize(key.email) === normalize(row.email)) ||
    (!!key.phone && digits(key.phone) === digits(row.phone))
  );
}

function keysOverlap(a: CompletedQuoteKey, b: CompletedQuoteKey): boolean {
  return (
    (!!a.sessionId && a.sessionId === b.sessionId) ||
    (!!a.email && !!b.email && normalize(a.email) === normalize(b.email)) ||
    (!!a.phone && !!b.phone && digits(a.phone) === digits(b.phone))
  );
}

function normalize(v?: string): string {
  return (v ?? "").trim().toLowerCase();
}

function digits(v?: string): string {
  return (v ?? "").replace(/\D/g, "");
}

/** How long we hold a partial before delivering it, to let the customer finish. */
export const GRACE_WINDOW_MS = 2 * 60 * 1000; // ~2 minutes

/**
 * Single shared store instance. Held on globalThis so Next.js dev/HMR and a
 * long-running server reuse the same instance instead of allocating a new one
 * per module reload. Replace `new InMemoryLeadStore()` with your DB-backed
 * implementation to make this durable across serverless invocations.
 */
const globalForStore = globalThis as unknown as { __leadStore?: LeadStore };

export const leadStore: LeadStore =
  globalForStore.__leadStore ?? (globalForStore.__leadStore = new InMemoryLeadStore());
