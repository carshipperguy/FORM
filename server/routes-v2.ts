import type { Express, Request, Response } from "express";
import {
  quoteRequestSchema,
  bookingRequestSchema,
  type InsertTransportLead,
} from "@shared/transport-leads-schema";
import { calculatePrice, extractState } from "./lib/pricing";
import { getDistance } from "./lib/distance";
import {
  ensureLeadsTable,
  createLead,
  getLeadByRef,
  updateLeadByRef,
  markShipdeskSynced,
  listLeads,
} from "./lib/leads-store";
import { sendLeadNotification } from "./lib/lead-email";
import { pushLeadToShipdesk } from "./lib/shipdesk";

/**
 * V2 — the new native quote/booking pipeline. No Zapier, no iframe.
 *
 *   POST /api/v2/quote    → price it, persist a lead (status "quote")
 *   POST /api/v2/booking  → promote/create a booking, email team, push to Shipdesk
 *   GET  /api/v2/leads    → admin list (guarded by ADMIN_TOKEN if set)
 *   GET  /api/v2/health   → table check
 *
 * Everything here is additive; it does not touch the legacy /api/* routes.
 */

function makeRef(state: string | null): string {
  const st = (state || "US").toUpperCase();
  const base = (Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 4)).toUpperCase();
  return `AMG-${st}-${base}`;
}

function quotedPriceFor(
  transportType: "open" | "enclosed" | "custom",
  openPrice: number | null,
  enclosedPrice: number | null,
): number | null {
  if (transportType === "open") return openPrice;
  if (transportType === "enclosed") return enclosedPrice;
  return null;
}

export function registerV2Routes(app: Express): void {
  // Best-effort table bootstrap; logged, never fatal.
  ensureLeadsTable().catch((e) => console.error("[v2] ensureLeadsTable failed:", e?.message || e));

  app.get("/api/v2/health", async (_req: Request, res: Response) => {
    try {
      await ensureLeadsTable();
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ ok: false, error: err instanceof Error ? err.message : "error" });
    }
  });

  app.post("/api/v2/quote", async (req: Request, res: Response) => {
    const parsed = quoteRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid quote request", issues: parsed.error.flatten() });
    }
    const q = parsed.data;

    // Distance — degrade gracefully if MapQuest is unreachable.
    let distance: number | null = null;
    try {
      const d = await getDistance(q.pickupLocation, q.dropoffLocation);
      distance = d.distance;
    } catch (err) {
      console.warn("[v2/quote] distance failed:", err instanceof Error ? err.message : err);
    }

    const price = calculatePrice(distance, q.vehicleType, new Date(), q.pickupLocation, q.dropoffLocation);
    const hasPrice = !price.message;

    const lead: InsertTransportLead = {
      ref: makeRef(extractState(q.pickupLocation)),
      status: "quote",
      vehicleType: q.vehicleType,
      year: q.year ?? null,
      make: q.make ?? null,
      model: q.model ?? null,
      pickupLocation: q.pickupLocation,
      pickupState: extractState(q.pickupLocation),
      dropoffLocation: q.dropoffLocation,
      dropoffState: extractState(q.dropoffLocation),
      distance: distance,
      transitTime: price.transitTime || null,
      shipDate: q.shipDate ?? null,
      flexibility: q.flexibility ?? null,
      openPrice: hasPrice ? price.openTransport : null,
      enclosedPrice: hasPrice ? price.enclosedTransport : null,
      priceMessage: price.message ?? null,
      name: q.name ?? null,
      phone: q.phone ?? null,
      email: q.email || null,
      source: q.source ?? "website",
      utmSource: q.utmSource ?? null,
      utmMedium: q.utmMedium ?? null,
      utmCampaign: q.utmCampaign ?? null,
      utmTerm: q.utmTerm ?? null,
      utmContent: q.utmContent ?? null,
      fbclid: q.fbclid ?? null,
      referrer: q.referrer ?? null,
      rawPayload: req.body,
    };

    let ref = lead.ref;
    try {
      const saved = await createLead(lead);
      ref = saved.ref;
    } catch (err) {
      // Never block the customer's quote on a DB hiccup — log and return the price anyway.
      console.error("[v2/quote] persist failed:", err instanceof Error ? err.message : err);
    }

    res.json({
      ref,
      distance,
      transitTime: price.transitTime || null,
      openPrice: hasPrice ? price.openTransport : null,
      enclosedPrice: hasPrice ? price.enclosedTransport : null,
      message: price.message ?? null,
    });
  });

  app.post("/api/v2/booking", async (req: Request, res: Response) => {
    const parsed = bookingRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid booking request", issues: parsed.error.flatten() });
    }
    const b = parsed.data;
    const status = b.transportType === "custom" ? "custom" : "booked";

    let lead;

    // Path A: promote an existing quote.
    if (b.ref) {
      const existing = await getLeadByRef(b.ref).catch(() => undefined);
      if (existing) {
        const quotedPrice = quotedPriceFor(b.transportType, existing.openPrice, existing.enclosedPrice);
        const depositAmount =
          b.bookingMode === "deposit" && quotedPrice ? Math.round(quotedPrice * 0.2) : null;

        lead = await updateLeadByRef(b.ref, {
          status,
          transportType: b.transportType,
          quotedPrice,
          bookingMode: b.bookingMode ?? null,
          depositAmount,
          notes: b.notes ?? existing.notes,
          name: b.name ?? existing.name,
          phone: b.phone ?? existing.phone,
          email: b.email || existing.email,
          shipDate: b.shipDate ?? existing.shipDate,
        });
      }
    }

    // Path B: no ref (or ref not found) — recreate the lead from the booking body.
    if (!lead) {
      if (!b.vehicleType || !b.pickupLocation || !b.dropoffLocation) {
        return res.status(400).json({
          error: "No matching quote found. Provide vehicleType, pickupLocation and dropoffLocation to book directly.",
        });
      }
      let distance: number | null = null;
      try {
        distance = (await getDistance(b.pickupLocation, b.dropoffLocation)).distance;
      } catch {
        /* graceful */
      }
      const price = calculatePrice(distance, b.vehicleType, new Date(), b.pickupLocation, b.dropoffLocation);
      const hasPrice = !price.message;
      const openPrice = hasPrice ? price.openTransport : null;
      const enclosedPrice = hasPrice ? price.enclosedTransport : null;
      const quotedPrice = quotedPriceFor(b.transportType, openPrice, enclosedPrice);
      const depositAmount = b.bookingMode === "deposit" && quotedPrice ? Math.round(quotedPrice * 0.2) : null;

      lead = await createLead({
        ref: makeRef(extractState(b.pickupLocation)),
        status,
        vehicleType: b.vehicleType,
        year: b.year ?? null,
        make: b.make ?? null,
        model: b.model ?? null,
        pickupLocation: b.pickupLocation,
        pickupState: extractState(b.pickupLocation),
        dropoffLocation: b.dropoffLocation,
        dropoffState: extractState(b.dropoffLocation),
        distance,
        transitTime: price.transitTime || null,
        shipDate: b.shipDate ?? null,
        openPrice,
        enclosedPrice,
        priceMessage: price.message ?? null,
        transportType: b.transportType,
        quotedPrice,
        bookingMode: b.bookingMode ?? null,
        depositAmount,
        notes: b.notes ?? null,
        name: b.name ?? null,
        phone: b.phone ?? null,
        email: b.email || null,
        source: b.source ?? "website",
        utmSource: b.utmSource ?? null,
        utmMedium: b.utmMedium ?? null,
        utmCampaign: b.utmCampaign ?? null,
        utmTerm: b.utmTerm ?? null,
        utmContent: b.utmContent ?? null,
        fbclid: b.fbclid ?? null,
        referrer: b.referrer ?? null,
        rawPayload: req.body,
      });
    }

    if (!lead) {
      return res.status(500).json({ error: "Could not save booking." });
    }

    // Side-effects: team email + Shipdesk. Best-effort; failures are reported, not thrown.
    const emailResult = await sendLeadNotification(lead).catch((e) => ({ sent: false, error: String(e) }));
    const shipdeskResult = await pushLeadToShipdesk(lead).catch((e) => ({ ok: false, error: String(e) }));
    if (shipdeskResult.ok) {
      await markShipdeskSynced(lead.ref, shipdeskResult.id).catch(() => {});
    }

    res.json({
      ref: lead.ref,
      status: lead.status,
      transportType: lead.transportType,
      quotedPrice: lead.quotedPrice,
      depositAmount: lead.depositAmount,
      emailed: emailResult.sent === true,
      shipdesk: shipdeskResult.skipped ? "not-configured" : shipdeskResult.ok ? "synced" : "failed",
    });
  });

  app.get("/api/v2/leads", async (req: Request, res: Response) => {
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken && req.header("x-admin-token") !== adminToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 200);
    const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0;
    try {
      const leads = await listLeads(limit, offset);
      res.json({
        count: leads.length,
        unguarded: !adminToken || undefined, // hint in dev that no ADMIN_TOKEN is set
        leads,
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "error" });
    }
  });
}
