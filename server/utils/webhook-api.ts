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
import {
  getAllSubmissions,
  getSubmissionById,
  getSubmissionsByType,
  getSubmissionStats,
  clearSubmissions
} from './webhook-monitor-queue';

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
  
  /**
   * GET /api/webhook-submissions
   * Get all recent webhook submissions with field diagnostics
   */
  app.get('/api/webhook-submissions', (req, res) => {
    try {
      console.log('\n📋 WEBHOOK SUBMISSIONS API CALLED');
      
      // Get all submissions
      const submissions = getAllSubmissions();
      const stats = getSubmissionStats();
      
      res.json({
        success: true,
        stats,
        submissions
      });
    } catch (error) {
      console.error('❌ ERROR IN WEBHOOK SUBMISSIONS API:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  /**
   * GET /api/webhook-submission/:id
   * Get a specific webhook submission by ID
   */
  app.get('/api/webhook-submission/:id', (req, res) => {
    try {
      const { id } = req.params;
      console.log(`\n📋 WEBHOOK SUBMISSION DETAIL API CALLED FOR ID: ${id}`);
      
      // Get the specific submission
      const submission = getSubmissionById(id);
      
      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found'
        });
      }
      
      res.json({
        success: true,
        submission
      });
    } catch (error) {
      console.error('❌ ERROR IN WEBHOOK SUBMISSION DETAIL API:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  /**
   * GET /api/webhook-submissions/:type
   * Get all submissions of a specific type (quote or final)
   */
  app.get('/api/webhook-submissions/:type', (req, res) => {
    try {
      const { type } = req.params;
      
      if (type !== 'quote' && type !== 'final') {
        return res.status(400).json({
          success: false,
          error: 'Type must be either "quote" or "final"'
        });
      }
      
      console.log(`\n📋 WEBHOOK SUBMISSIONS BY TYPE API CALLED FOR TYPE: ${type}`);
      
      // Get submissions of the specified type
      const submissions = getSubmissionsByType(type as 'quote' | 'final');
      
      res.json({
        success: true,
        type,
        count: submissions.length,
        submissions
      });
    } catch (error) {
      console.error('❌ ERROR IN WEBHOOK SUBMISSIONS BY TYPE API:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  /**
   * POST /api/webhook-submissions/clear
   * Clear all stored webhook submissions
   */
  app.post('/api/webhook-submissions/clear', (req, res) => {
    try {
      console.log('\n🧹 CLEARING ALL WEBHOOK SUBMISSIONS');
      
      // Clear all submissions
      clearSubmissions();
      
      res.json({
        success: true,
        message: 'All webhook submissions cleared'
      });
    } catch (error) {
      console.error('❌ ERROR CLEARING WEBHOOK SUBMISSIONS:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
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
  res.end = function(
    chunk: any, 
    encoding?: BufferEncoding, 
    callback?: () => void
  ): Response<any, Record<string, any>> {
    // Calculate response time
    const responseTime = Date.now() - (req as any).webhookStartTime;
    
    // Log webhook response time if this is a webhook endpoint
    if (req.path.includes('/webhook') || req.path.includes('final-submission')) {
      console.log(`📊 WEBHOOK RESPONSE TIME: ${responseTime}ms for ${req.method} ${req.path}`);
    }
    
    // Call the original end method with appropriate arguments
    if (callback !== undefined) {
      return originalEnd.call(this, chunk, encoding, callback);
    } else if (encoding !== undefined) {
      return originalEnd.call(this, chunk, encoding);
    } else {
      return originalEnd.call(this, chunk);
    }
  };
  
  next();
}