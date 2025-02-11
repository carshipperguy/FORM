import { pgTable, text, serial, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  vehicleType: text("vehicle_type").notNull(),
  make: text("make"),
  model: text("model"),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  distance: real("distance").notNull(),
  openTransportPrice: real("open_transport_price").notNull(),
  enclosedTransportPrice: real("enclosed_transport_price").notNull(),
  transitTime: integer("transit_time").notNull(),
  email: text("email"),
  phone: text("phone"),
});

export const quoteFormSchema = z.object({
  vehicleType: z.enum(["car", "suv", "pickup", "other"]),
  make: z.string().optional(),
  model: z.string().optional(),
  otherVehicle: z.string().optional(),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const insertQuoteSchema = createInsertSchema(quotes);

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferSelect;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
