import { pgTable, text, serial, integer, real, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { vehicleTypes } from "../client/src/lib/vehicle-data";
import { sql } from "drizzle-orm";

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  vehicleType: text("vehicle_type").notNull(),
  year: text("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  pickupZip: text("pickup_zip"),  // Store pickup ZIP explicitly
  dropoffLocation: text("dropoff_location").notNull(),
  dropoffZip: text("dropoff_zip"), // Store dropoff ZIP explicitly
  shipmentDate: timestamp("shipment_date").notNull(),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  distance: real("distance").notNull(),
  openTransportPrice: real("open_transport_price").notNull(),
  enclosedTransportPrice: real("enclosed_transport_price").notNull(),
  transitTime: integer("transit_time").notNull(),
});

export const fallbackLeads = pgTable("fallback_leads", {
  id: serial("id").primaryKey(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const partialLeads = pgTable("partial_leads", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  name: text("name"),
  phone: text("phone").notNull(),
  email: text("email"),
  vehicleType: text("vehicle_type"),
  converted: boolean("converted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const quoteFormSchema = z.object({
  vehicleType: z.enum(vehicleTypes),
  year: z.string().min(1, "Year is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  pickupZip: z.string().optional(), // Optional in schema as it will be extracted from location
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  dropoffZip: z.string().optional(), // Optional in schema as it will be extracted from location
  shipmentDate: z.date(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const insertQuoteSchema = createInsertSchema(quotes);

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;