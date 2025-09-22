#!/usr/bin/env node

/**
 * Create Missing Tables Only
 *
 * This script only creates the tables that are missing from the database
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function createTables() {
  console.log("🚀 Creating missing tables...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  try {
    // Create quotes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "quotes" (
        "id" serial PRIMARY KEY NOT NULL,
        "customer_name" text,
        "phone" text,
        "email" text,
        "origin" text,
        "destination" text,
        "status" text DEFAULT 'quote-bank' NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log("✅ Quotes table created");

    // Create orders table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" serial PRIMARY KEY NOT NULL,
        "order_number" text,
        "quote_id" integer,
        "customer_name" text,
        "status" text DEFAULT 'pending',
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log("✅ Orders table created");

    // Create visitor_attribution table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "visitor_attribution" (
        "session_id" text PRIMARY KEY NOT NULL,
        "fbclid" text,
        "utm_source" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✅ Visitor attribution table created");

    // Create meta_capi_log table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "meta_capi_log" (
        "id" serial PRIMARY KEY NOT NULL,
        "event_id" text NOT NULL,
        "event_name" text NOT NULL,
        "payload" json NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✅ Meta CAPI log table created");

    console.log("🎉 All tables created successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

createTables();
