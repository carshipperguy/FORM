import { pgTable, serial, text, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * transport_leads — the single source of truth for the NEW native quote flow.
 *
 * One row per shopper. Created at quote time (status "quote") and promoted to
 * "booked" when they complete checkout. No Zapier: leads live here, get emailed
 * to the team, and are pushed to Shipdesk via a single hook when it's connected.
 */
export const transportLeads = pgTable("transport_leads", {
  id: serial("id").primaryKey(),
  ref: text("ref").notNull(),                       // human reference e.g. AMG-FL-4821
  status: text("status").notNull().default("quote"), // quote | booked | custom
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // Vehicle
  vehicleType: text("vehicle_type").notNull(),
  year: text("year"),
  make: text("make"),
  model: text("model"),

  // Route
  pickupLocation: text("pickup_location").notNull(),
  pickupState: text("pickup_state"),
  dropoffLocation: text("dropoff_location").notNull(),
  dropoffState: text("dropoff_state"),
  distance: real("distance"),                        // miles; null if lookup failed
  transitTime: integer("transit_time"),              // estimated days
  shipDate: text("ship_date"),                       // ISO date string, nullable/flexible
  flexibility: text("flexibility"),

  // Pricing (computed server-side, never trusted from client)
  openPrice: integer("open_price"),
  enclosedPrice: integer("enclosed_price"),
  transportType: text("transport_type"),             // open | enclosed | custom
  quotedPrice: integer("quoted_price"),              // the price they chose
  priceMessage: text("price_message"),               // e.g. short-distance custom-quote note

  // Contact
  name: text("name"),
  phone: text("phone"),
  email: text("email"),

  // Booking
  bookingMode: text("booking_mode"),                 // reserve | deposit
  depositAmount: integer("deposit_amount"),
  notes: text("notes"),

  // Attribution
  source: text("source").default("website"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  fbclid: text("fbclid"),
  referrer: text("referrer"),

  // Raw payload for auditing / replay
  rawPayload: jsonb("raw_payload"),

  // Shipdesk sync (bolt-on later)
  shipdeskSynced: boolean("shipdesk_synced").default(false),
  shipdeskSyncedAt: timestamp("shipdesk_synced_at"),
  shipdeskId: text("shipdesk_id"),
});

export type TransportLead = typeof transportLeads.$inferSelect;
export type InsertTransportLead = typeof transportLeads.$inferInsert;
export const insertTransportLeadSchema = createInsertSchema(transportLeads);

/** Vehicle types accepted by the pricing engine. */
export const VEHICLE_TYPES = [
  "car/truck/suv", "boat", "golf cart", "motorcycle",
  "rv/5th wheel", "travel trailer", "atv/utv", "heavy equipment", "other",
] as const;

const attributionShape = {
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  fbclid: z.string().optional(),
  referrer: z.string().optional(),
};

/** Request body for POST /api/v2/quote */
export const quoteRequestSchema = z.object({
  vehicleType: z.enum(VEHICLE_TYPES),
  year: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  pickupLocation: z.string().min(2, "Pickup location is required"),
  dropoffLocation: z.string().min(2, "Delivery location is required"),
  shipDate: z.string().optional(),
  flexibility: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  ...attributionShape,
});
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

/** Request body for POST /api/v2/booking */
export const bookingRequestSchema = z.object({
  ref: z.string().optional(),                        // promote an existing quote if provided
  transportType: z.enum(["open", "enclosed", "custom"]),
  bookingMode: z.enum(["reserve", "deposit"]).optional(),
  // If no ref, these recreate the lead so booking never depends on a prior quote row:
  vehicleType: z.enum(VEHICLE_TYPES).optional(),
  year: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  shipDate: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  ...attributionShape,
});
export type BookingRequest = z.infer<typeof bookingRequestSchema>;
