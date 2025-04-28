/**
 * Webhook API Endpoint Module
 * 
 * This module provides API endpoints for webhook diagnostics and monitoring.
 */

import { Express, Request, Response } from 'express';
import { 
  runWebhookHealthChecks, 
  getWebhookMonitorReport, 
  hasWebhookHealthIssues,
  initWebhookMonitor
} from './webhook-monitor';

/**
 * Register webhook diagnostic API endpoints
 */
export function registerWebhookDiagnosticEndpoints(app: Express): void {
  /**
   * GET /api/webhook-health
   * Get current webhook health status and run diagnostic checks
   */
  app.get('/api/webhook-health', async (req, res) => {
    try {
      console.log('\n🔍 WEBHOOK HEALTH CHECK API CALLED');
      
      // Run health checks
      const healthCheckResults = await runWebhookHealthChecks();
      
      // Get monitor report
      const monitorReport = getWebhookMonitorReport();
      
      // Compile complete report
      const report = {
        overallHealth: healthCheckResults.overallHealth,
        healthChecks: healthCheckResults.results,
        successRate: monitorReport.successRate,
        averageResponseTime: monitorReport.monitorData.transmissionStats.averageResponseTime,
        lastAttempt: monitorReport.monitorData.lastWebhookAttempt,
        lastSuccess: monitorReport.monitorData.lastWebhookSuccess,
        lastFailure: monitorReport.monitorData.lastWebhookFailure,
        transmissionStats: monitorReport.monitorData.transmissionStats,
        hasIssues: hasWebhookHealthIssues(),
        timestamp: Date.now()
      };
      
      res.json({
        success: true,
        report
      });
    } catch (error) {
      console.error('❌ ERROR IN WEBHOOK HEALTH API:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  /**
   * GET /api/webhook-monitor
   * Get complete webhook monitoring data
   */
  app.get('/api/webhook-monitor', (req, res) => {
    try {
      console.log('\n📊 WEBHOOK MONITOR API CALLED');
      
      // Get full monitor report
      const monitorReport = getWebhookMonitorReport();
      
      res.json({
        success: true,
        report: monitorReport
      });
    } catch (error) {
      console.error('❌ ERROR IN WEBHOOK MONITOR API:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  /**
   * POST /api/webhook-test
   * Run a manual test of webhook connectivity
   */
  app.post('/api/webhook-test', async (req, res) => {
    try {
      console.log('\n🧪 MANUAL WEBHOOK TEST API CALLED');
      
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Webhook URL is required'
        });
      }
      
      // Run health check on the specified URL
      const healthCheckResults = await runWebhookHealthChecks();
      
      res.json({
        success: true,
        results: healthCheckResults
      });
    } catch (error) {
      console.error('❌ ERROR IN WEBHOOK TEST API:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Initialize the webhook monitor with known webhook URLs
  const webhookUrls = [
    "https://hooks.zapier.com/hooks/catch/18240296/20zu8bj/", // Lead capture webhook
    "https://hooks.zapier.com/hooks/catch/18240296/2xrmfy2/"  // Order booking webhook
  ];
  
  initWebhookMonitor(webhookUrls);
  
  console.log('✅ Webhook diagnostic API endpoints registered');
}

/**
 * Middleware to track outbound webhook transmissions
 */
export function webhookDiagnosticMiddleware(req: Request, res: Response, next: Function): void {
  // Attach timestamps to the request object for timing
  (req as any).webhookStartTime = Date.now();
  
  // Capture the original end method
  const originalEnd = res.end;
  
  // Override the end method to capture response time
  res.end = function(...args: any[]) {
    // Calculate response time
    const responseTime = Date.now() - (req as any).webhookStartTime;
    
    // Log webhook response time if this is a webhook endpoint
    if (req.path.includes('/webhook') || req.path.includes('final-submission')) {
      console.log(`📊 WEBHOOK RESPONSE TIME: ${responseTime}ms for ${req.method} ${req.path}`);
    }
    
    // Call the original end method
    return originalEnd.apply(this, args);
  };
  
  next();
}