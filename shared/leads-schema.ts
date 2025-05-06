import { pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Database schema for leads and form submissions
 * This provides persistent storage to track all form submissions
 * even across application restarts
 */

export const leadSubmissions = pgTable('lead_submissions', {
  id: serial('id').primaryKey(),
  submissionId: text('submission_id').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  formType: text('form_type').notNull(),
  customerName: text('customer_name'),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone'),
  vehicleInfo: text('vehicle_info'),
  pickupLocation: text('pickup_location'),
  deliveryLocation: text('delivery_location'),
  additionalNotes: text('additional_notes'),
  price: text('price'),
  originalData: jsonb('original_data'),
  webhookPayload: jsonb('webhook_payload'),
  diagnosticLog: jsonb('diagnostic_log'),
  success: boolean('success').default(false),
  responseStatus: text('response_status'),
  responseBody: text('response_body'),
  retryCount: serial('retry_count').default(0),
  isRecovered: boolean('is_recovered').default(false),
  isSentToZapier: boolean('is_sent_to_zapier').default(false),
  zapierResponse: jsonb('zapier_response')
});

export const webhookHealthLogs = pgTable('webhook_health_logs', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  webhookUrl: text('webhook_url').notNull(),
  success: boolean('success').default(false),
  responseTime: serial('response_time'),
  responseStatus: text('response_status'),
  responseBody: text('response_body'),
  error: text('error'),
  isDiagnosticPing: boolean('is_diagnostic_ping').default(true),
  testPayload: jsonb('test_payload')
});

// Zod schemas for validation
export const insertLeadSubmissionSchema = createInsertSchema(leadSubmissions, {
  formType: z.enum(['quote', 'final']),
});

export const insertWebhookHealthLogSchema = createInsertSchema(webhookHealthLogs);

// Types
export type LeadSubmission = typeof leadSubmissions.$inferSelect;
export type InsertLeadSubmission = typeof leadSubmissions.$inferInsert;
export type WebhookHealthLog = typeof webhookHealthLogs.$inferSelect;
export type InsertWebhookHealthLog = typeof webhookHealthLogs.$inferInsert;