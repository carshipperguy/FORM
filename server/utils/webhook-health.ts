/**
 * Webhook Health Check Module
 * 
 * This module provides tools to check webhook health, diagnose transmission issues,
 * and automatically test webhook connectivity after idle periods.
 */

import fetch from 'node-fetch';
import { recordColdStartTest } from './webhook-diagnostics';

let lastHealthCheckTime = 0;
let healthCheckCount = 0;

interface HealthCheckResult {
  success: boolean;
  responseTime: number;
  status?: number;
  responseBody?: string;
  error?: string;
  timestamp: number;
}

/**
 * Perform a health check on the webhook endpoint
 * 
 * @param webhookUrl The URL of the webhook to test
 * @returns A promise that resolves to a health check result
 */
export async function checkWebhookHealth(webhookUrl: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  healthCheckCount++;
  
  console.log(`\n🔍 WEBHOOK HEALTH CHECK #${healthCheckCount} STARTING...`);
  console.log(`🌐 Testing webhook URL: ${webhookUrl}`);
  
  // Create minimal test payload with clear DO_NOT_PROCESS flag for Zapier
  const testPayload = {
    type: 'health_check',
    timestamp: new Date().toISOString(),
    test_id: `health_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    source: 'auto_diagnostic_system',
    DO_NOT_PROCESS: true,
    ZAPIER_FILTER_FLAG: 'DIAGNOSTIC_TEST_ONLY',
    IS_DIAGNOSTIC_PING: true
  };
  
  try {
    // Set a timeout for the health check (5 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Send a test request to the webhook with clear diagnostic headers
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Amerigo-Auto-Transport-Diagnostics/1.0',
        'X-Diagnostic-ID': testPayload.test_id,
        'X-Zapier-Filter': 'DIAGNOSTIC_TEST_ONLY',
        'X-Do-Not-Process': 'true',
        'X-Is-Health-Check': 'true'
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Get the response text
    const responseText = await response.text();
    
    // Create the result
    const result: HealthCheckResult = {
      success: response.ok,
      responseTime,
      status: response.status,
      responseBody: responseText.substring(0, 500),
      timestamp: endTime
    };
    
    // Log the result
    console.log(`✅ WEBHOOK HEALTH CHECK COMPLETED IN ${responseTime}ms`);
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Webhook health check successful');
    } else {
      console.warn(`⚠️ Webhook health check received an error status: ${response.status}`);
      console.warn(`⚠️ Response body: ${responseText.substring(0, 200)}`);
      result.error = `HTTP error: ${response.status} ${response.statusText}`;
    }
    
    // Record this health check for cold start diagnostics
    recordColdStartTest(response.ok, responseTime, result.error);
    
    // Update last health check time
    lastHealthCheckTime = endTime;
    
    return result;
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Handle the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ WEBHOOK HEALTH CHECK FAILED: ${errorMessage}`);
    
    // Check if this was a timeout
    const isTimeout = error instanceof Error && 
      (error.name === 'AbortError' || errorMessage.includes('timeout'));
    
    if (isTimeout) {
      console.error(`⏱️ WEBHOOK HEALTH CHECK TIMED OUT AFTER ${responseTime}ms`);
    }
    
    // Record this health check for cold start diagnostics
    recordColdStartTest(false, responseTime, errorMessage);
    
    // Update last health check time
    lastHealthCheckTime = endTime;
    
    return {
      success: false,
      responseTime,
      error: errorMessage,
      timestamp: endTime
    };
  }
}

/**
 * Run periodic health checks on webhook endpoints
 * 
 * @param webhookUrls Array of webhook URLs to test
 * @param intervalMinutes Minutes between health checks
 */
export function setupPeriodicHealthChecks(
  webhookUrls: string[],
  intervalMinutes: number = 30
): void {
  // Convert minutes to milliseconds
  const interval = intervalMinutes * 60 * 1000;
  
  console.log(`🔄 Setting up periodic webhook health checks every ${intervalMinutes} minutes`);
  
  // Run health checks periodically
  setInterval(async () => {
    console.log(`\n⏰ PERIODIC WEBHOOK HEALTH CHECK TRIGGERED`);
    console.log(`⏱️ Time since last health check: ${formatTimeDifference(Date.now() - lastHealthCheckTime)}`);
    
    for (const url of webhookUrls) {
      await checkWebhookHealth(url);
    }
  }, interval);
  
  // Run an initial health check
  setTimeout(async () => {
    console.log(`\n🚀 INITIAL WEBHOOK HEALTH CHECK`);
    for (const url of webhookUrls) {
      await checkWebhookHealth(url);
    }
  }, 5000); // Wait 5 seconds after setup to run initial check
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
 * Get time since last health check
 */
export function getTimeSinceLastHealthCheck(): number {
  return Date.now() - lastHealthCheckTime;
}