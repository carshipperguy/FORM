import { sql, eq, desc } from "drizzle-orm";
import { db } from "../db";
import {
  transportLeads,
  type InsertTransportLead,
  type TransportLead,
} from "@shared/transport-leads-schema";

/**
 * Data-access for transport_leads. Reuses the app's existing Neon pool (server/db.ts).
 *
 * ensureLeadsTable() runs a CREATE TABLE IF NOT EXISTS at boot so this works
 * without a separate migration step. `npm run db:push` will also pick the table
 * up once it's added to drizzle.config's schema glob.
 */

let ensured = false;

export async function ensureLeadsTable(): Promise<void> {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS transport_leads (
      id              SERIAL PRIMARY KEY,
      ref             TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'quote',
      created_at      TIMESTAMP NOT NULL DEFAULT now(),
      updated_at      TIMESTAMP NOT NULL DEFAULT now(),
      vehicle_type    TEXT NOT NULL,
      year            TEXT,
      make            TEXT,
      model           TEXT,
      pickup_location TEXT NOT NULL,
      pickup_state    TEXT,
      dropoff_location TEXT NOT NULL,
      dropoff_state   TEXT,
      distance        REAL,
      transit_time    INTEGER,
      ship_date       TEXT,
      flexibility     TEXT,
      open_price      INTEGER,
      enclosed_price  INTEGER,
      transport_type  TEXT,
      quoted_price    INTEGER,
      price_message   TEXT,
      name            TEXT,
      phone           TEXT,
      email           TEXT,
      booking_mode    TEXT,
      deposit_amount  INTEGER,
      notes           TEXT,
      source          TEXT DEFAULT 'website',
      utm_source      TEXT,
      utm_medium      TEXT,
      utm_campaign    TEXT,
      utm_term        TEXT,
      utm_content     TEXT,
      fbclid          TEXT,
      referrer        TEXT,
      raw_payload     JSONB,
      shipdesk_synced BOOLEAN DEFAULT false,
      shipdesk_synced_at TIMESTAMP,
      shipdesk_id     TEXT
    )
  `);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS transport_leads_ref_idx ON transport_leads (ref)`);
  ensured = true;
}

export async function createLead(data: InsertTransportLead): Promise<TransportLead> {
  const [row] = await db.insert(transportLeads).values(data).returning();
  return row;
}

export async function getLeadByRef(ref: string): Promise<TransportLead | undefined> {
  const [row] = await db.select().from(transportLeads).where(eq(transportLeads.ref, ref)).limit(1);
  return row;
}

export async function updateLeadByRef(
  ref: string,
  patch: Partial<InsertTransportLead>,
): Promise<TransportLead | undefined> {
  const [row] = await db
    .update(transportLeads)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(transportLeads.ref, ref))
    .returning();
  return row;
}

export async function markShipdeskSynced(ref: string, shipdeskId?: string): Promise<void> {
  await db
    .update(transportLeads)
    .set({ shipdeskSynced: true, shipdeskSyncedAt: new Date(), shipdeskId: shipdeskId ?? null })
    .where(eq(transportLeads.ref, ref));
}

export async function listLeads(limit = 50, offset = 0): Promise<TransportLead[]> {
  return db
    .select()
    .from(transportLeads)
    .orderBy(desc(transportLeads.createdAt))
    .limit(limit)
    .offset(offset);
}
