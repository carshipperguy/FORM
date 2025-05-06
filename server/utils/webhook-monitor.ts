/**
 * Webhook Monitoring System
 * 
 * This module provides advanced monitoring for webhook transmissions including:
 * - Detailed logs of webhook requests and responses
 * - Performance metrics for webhook transmissions
 * - Monitoring for webhook transmission issues after idle periods
 * - Comprehensive health reports for webhooks
 */

import { checkWebhookHealth, setupPeriodicHealthChecks } from './webhook-health';
import { getWebhookHealthReport } from './webhook-diagnostics';

// Store webhook monitoring data
interface WebhookMonitorData {
  lastWebhookAttempt: {
    timestamp: number;
    success: boolean;
    responseTime: number;
    url: string;
    payloadSize: number;
    statusCode?: number;
    error?: string;
  } | null;
  lastWebhookSuccess: {
    timestamp: number;
    responseTime: number;
    url: string;
  } | null;
  lastWebhookFailure: {
    timestamp: number;
    error: string;
    url: string;
  } | null;
  webhookUrls: string[];
  healthCheckResults: Array<{
    timestamp: number;
    success: boolean;
    responseTime: number;
    url: string;
    error?: string;
  }>;
  transmissionStats: {
    totalAttempts: number;
    successCount: number;
    failureCount: number;
    averageResponseTime: number;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
  };
}

// Initialize monitoring data
const monitorData: WebhookMonitorData = {
  lastWebhookAttempt: null,
  lastWebhookSuccess: null,
  lastWebhookFailure: null,
  webhookUrls: [],
  healthCheckResults: [],
  transmissionStats: {
    totalAttempts: 0,
    successCount: 0,
    failureCount: 0,
    averageResponseTime: 0,
    consecutiveFailures: 0,
    consecutiveSuccesses: 0
  }
};

/**
 * Initialize the webhook monitoring system
 * @param webhookUrls Array of webhook URLs to monitor
 */
export function initWebhookMonitor(webhookUrls: string[]): void {
  console.log(`🚀 Initializing Webhook Monitoring System with ${webhookUrls.length} webhooks`);
  
  // Store webhook URLs
  monitorData.webhookUrls = webhookUrls;
  
  // Health checks disabled as requested by user
  // setupPeriodicHealthChecks(webhookUrls, 30);
  
  console.log('✅ Webhook monitoring system initialized (health checks disabled)');
}

/**
 * Record a webhook transmission attempt
 */
export function recordWebhookAttempt(
  url: string, 
  success: boolean, 
  responseTime: number, 
  payloadSize: number,
  statusCode?: number,
  error?: string
): void {
  // Update last attempt
  monitorData.lastWebhookAttempt = {
    timestamp: Date.now(),
    success,
    responseTime,
    url,
    payloadSize,
    statusCode,
    error
  };
  
  // Update stats
  monitorData.transmissionStats.totalAttempts++;
  monitorData.transmissionStats.averageResponseTime = (
    (monitorData.transmissionStats.averageResponseTime * (monitorData.transmissionStats.totalAttempts - 1)) + 
    responseTime
  ) / monitorData.transmissionStats.totalAttempts;
  
  if (success) {
    // Record success
    monitorData.lastWebhookSuccess = {
      timestamp: Date.now(),
      responseTime,
      url
    };
    
    // Update success stats
    monitorData.transmissionStats.successCount++;
    monitorData.transmissionStats.consecutiveSuccesses++;
    monitorData.transmissionStats.consecutiveFailures = 0;
  } else {
    // Record failure
    monitorData.lastWebhookFailure = {
      timestamp: Date.now(),
      error: error || 'Unknown error',
      url
    };
    
    // Update failure stats
    monitorData.transmissionStats.failureCount++;
    monitorData.transmissionStats.consecutiveFailures++;
    monitorData.transmissionStats.consecutiveSuccesses = 0;
  }
}

/**
 * Run a health check on all monitored webhooks
 */
export async function runWebhookHealthChecks(): Promise<{
  overallHealth: 'good' | 'warning' | 'critical';
  results: Array<{
    url: string;
    success: boolean;
    responseTime: number;
    error?: string;
  }>;
}> {
  console.log(`\n🔍 RUNNING WEBHOOK HEALTH CHECKS ON ${monitorData.webhookUrls.length} ENDPOINTS`);
  
  const results = [];
  let failureCount = 0;
  
  for (const url of monitorData.webhookUrls) {
    const result = await checkWebhookHealth(url);
    
    // Store result
    results.push({
      url,
      success: result.success,
      responseTime: result.responseTime,
      error: result.error
    });
    
    // Add to health check history
    monitorData.healthCheckResults.push({
      timestamp: Date.now(),
      success: result.success,
      responseTime: result.responseTime,
      url,
      error: result.error
    });
    
    // Count failures
    if (!result.success) {
      failureCount++;
    }
  }
  
  // Determine overall health
  let overallHealth: 'good' | 'warning' | 'critical' = 'good';
  
  if (failureCount === monitorData.webhookUrls.length) {
    overallHealth = 'critical';
  } else if (failureCount > 0) {
    overallHealth = 'warning';
  }
  
  return {
    overallHealth,
    results
  };
}

/**
 * Get a comprehensive webhook health report
 */
export function getWebhookMonitorReport(): {
  monitorData: WebhookMonitorData;
  detailedStats: any;
  timeSinceLastAttempt: number;
  successRate: number;
} {
  const timeSinceLastAttempt = monitorData.lastWebhookAttempt ? 
    Date.now() - monitorData.lastWebhookAttempt.timestamp : 0;
  
  const successRate = monitorData.transmissionStats.totalAttempts > 0 ?
    (monitorData.transmissionStats.successCount / monitorData.transmissionStats.totalAttempts) * 100 : 0;
  
  return {
    monitorData,
    detailedStats: getWebhookHealthReport(),
    timeSinceLastAttempt,
    successRate
  };
}

/**
 * Check if there are any critical webhook health issues
 */
export function hasWebhookHealthIssues(): boolean {
  // Check for consecutive failures
  if (monitorData.transmissionStats.consecutiveFailures >= 3) {
    return true;
  }
  
  // Check failure rate
  const failureRate = monitorData.transmissionStats.totalAttempts > 0 ?
    (monitorData.transmissionStats.failureCount / monitorData.transmissionStats.totalAttempts) * 100 : 0;
  
  if (failureRate > 50 && monitorData.transmissionStats.totalAttempts >= 5) {
    return true;
  }
  
  // Check recent health checks
  const recentHealthChecks = monitorData.healthCheckResults
    .slice(-monitorData.webhookUrls.length * 2);
  
  const recentFailures = recentHealthChecks.filter(check => !check.success);
  
  return recentFailures.length > recentHealthChecks.length / 2;
}