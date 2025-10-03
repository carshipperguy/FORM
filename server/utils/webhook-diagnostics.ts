/**
 * Webhook Diagnostics Module
 * 
 * This module provides enhanced monitoring and diagnostics for webhook transmissions.
 * It logs detailed information about webhook requests, responses, and performance
 * without modifying the core webhook functionality.
 */

import { Console } from "console";

// In-memory store for webhook transmission analytics
interface WebhookStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  totalResponseTime: number;
  averageResponseTime: number;
  lastAttemptTime: number;
  firstAttemptTime: number;
  errors: Array<{
    timestamp: number;
    error: string;
    status?: number;
    payload?: string;
  }>;
  successfulRequests: Array<{
    timestamp: number;
    requestId: string;
    responseTime: number;
    status: number;
  }>;
  startupDiagnostics: Array<{
    timestamp: number;
    idlePeriod: number;
    success: boolean;
    responseTime?: number;
    error?: string;
  }>;
}

// Initialize stats
const webhookStats: WebhookStats = {
  totalAttempts: 0,
  successfulAttempts: 0,
  failedAttempts: 0,
  totalResponseTime: 0,
  averageResponseTime: 0,
  lastAttemptTime: 0,
  firstAttemptTime: 0,
  errors: [],
  successfulRequests: [],
  startupDiagnostics: []
};

// Interface for webhook request details
export interface WebhookRequestDetails {
  url: string;
  payload: any;
  headers: Record<string, string>;
  startTime: number;
  requestId: string;
  eventType: string;
}

// Interface for webhook response details
export interface WebhookResponseDetails {
  status: number;
  responseTime: number;
  responseText: string;
  success: boolean;
  error?: string;
}

/**
 * Record the start of a webhook request for diagnostics
 */
export function recordWebhookStart(details: WebhookRequestDetails): void {
  // Increment total attempts
  webhookStats.totalAttempts++;
  
  // Set first attempt time if this is the first recorded attempt
  if (webhookStats.firstAttemptTime === 0) {
    webhookStats.firstAttemptTime = details.startTime;
  }
  
  // Calculate idle period (time since last webhook attempt)
  const idlePeriod = webhookStats.lastAttemptTime ? 
    details.startTime - webhookStats.lastAttemptTime : 0;
  
  // Update last attempt time
  webhookStats.lastAttemptTime = details.startTime;
  
  // Check if this is a cold start (more than 30 minutes idle)
  const isColdStart = idlePeriod > 30 * 60 * 1000;
  
  // Log additional diagnostics for cold starts
  if (isColdStart) {
    console.log(`\n🥶 COLD START DETECTED: System idle for ${(idlePeriod / 60000).toFixed(1)} minutes before this webhook request`);
    console.log(`🔍 Performing additional diagnostics for cold start webhook...`);
    console.log(`📊 Total webhook attempts before this request: ${webhookStats.totalAttempts - 1}`);
    console.log(`📊 Success rate before this request: ${webhookStats.successfulAttempts > 0 ? 
      ((webhookStats.successfulAttempts / (webhookStats.totalAttempts - 1)) * 100).toFixed(1) : 0}%`);
  }
  
  // Log request details
  console.log(`\n📝 WEBHOOK DIAGNOSTIC: REQUEST STARTED`);
  console.log(`🔖 Request ID: ${details.requestId}`);
  console.log(`🌐 URL: ${details.url}`);
  console.log(`📦 Payload Size: ${JSON.stringify(details.payload).length} bytes`);
  console.log(`⏱️ Time since last webhook: ${idlePeriod > 0 ? `${(idlePeriod / 1000).toFixed(1)} seconds` : 'First request'}`);
  console.log(`📤 Event Type: ${details.eventType}`);
  
  // Log headers for debugging 
  console.log(`📋 Headers: ${JSON.stringify(details.headers, null, 2)}`);
}

/**
 * Record the completion of a webhook request for diagnostics
 */
export function recordWebhookCompletion(
  requestDetails: WebhookRequestDetails, 
  responseDetails: WebhookResponseDetails
): void {
  // Calculate total request duration
  const requestDuration = responseDetails.responseTime;
  
  // Update success/failure counts
  if (responseDetails.success) {
    webhookStats.successfulAttempts++;
    webhookStats.successfulRequests.push({
      timestamp: Date.now(),
      requestId: requestDetails.requestId,
      responseTime: requestDuration,
      status: responseDetails.status
    });
  } else {
    webhookStats.failedAttempts++;
    webhookStats.errors.push({
      timestamp: Date.now(),
      error: responseDetails.error || 'Unknown error',
      status: responseDetails.status,
      payload: JSON.stringify(requestDetails.payload).substring(0, 500) // Truncate for storage
    });
  }
  
  // Update total and average response time
  webhookStats.totalResponseTime += requestDuration;
  webhookStats.averageResponseTime = webhookStats.totalResponseTime / webhookStats.totalAttempts;
  
  // Determine if this was a cold start (more than 30 minutes idle)
  const idlePeriod = webhookStats.successfulRequests.length > 1 ? 
    Date.now() - webhookStats.successfulRequests[webhookStats.successfulRequests.length - 2]?.timestamp : 0;
  
  const isColdStart = idlePeriod > 30 * 60 * 1000;
  
  // Record startup diagnostic if this is a cold start
  if (isColdStart) {
    webhookStats.startupDiagnostics.push({
      timestamp: Date.now(),
      idlePeriod: idlePeriod,
      success: responseDetails.success,
      responseTime: requestDuration,
      error: responseDetails.error
    });
  }
  
  // Log completion details
  console.log(`\n📝 WEBHOOK DIAGNOSTIC: REQUEST COMPLETED`);
  console.log(`🔖 Request ID: ${requestDetails.requestId}`);
  console.log(`⏱️ Response Time: ${requestDuration}ms`);
  console.log(`🚦 Status: ${responseDetails.status} (${responseDetails.success ? 'Success' : 'Failure'})`);
  
  if (responseDetails.success) {
    console.log(`✅ Webhook delivered successfully`);
  } else {
    console.log(`❌ Webhook delivery failed: ${responseDetails.error}`);
    console.log(`❌ Response text: ${responseDetails.responseText.substring(0, 200)}`);
  }
  
  // Log overall statistics
  console.log(`\n📊 WEBHOOK HEALTH METRICS:`);
  console.log(`📊 Total attempts: ${webhookStats.totalAttempts}`);
  console.log(`📊 Success rate: ${((webhookStats.successfulAttempts / webhookStats.totalAttempts) * 100).toFixed(1)}%`);
  console.log(`📊 Average response time: ${webhookStats.averageResponseTime.toFixed(1)}ms`);
  console.log(`📊 Time since first webhook: ${formatTimeDifference(Date.now() - webhookStats.firstAttemptTime)}`);
}

/**
 * Get detailed webhook health report
 */
export function getWebhookHealthReport(): WebhookStats {
  return webhookStats;
}

/**
 * Format time difference in a human-readable format
 */
function formatTimeDifference(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Record a cold start test (used to verify webhook behavior after idle periods)
 */
export function recordColdStartTest(
  success: boolean, 
  responseTime: number,
  error?: string
): void {
  webhookStats.startupDiagnostics.push({
    timestamp: Date.now(),
    idlePeriod: Date.now() - webhookStats.lastAttemptTime,
    success,
    responseTime,
    error
  });
}

/**
 * Check if the diagnostics indicate any cold start issues
 */
export function hasColdStartIssues(): boolean {
  const coldStartFailures = webhookStats.startupDiagnostics.filter(d => !d.success);
  return coldStartFailures.length > 0;
}