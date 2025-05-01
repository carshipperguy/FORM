/**
 * Submission Recovery Script
 * 
 * This script analyzes the webhook monitoring system and logs to identify
 * any form submissions that may have been lost due to cold starts or downtime.
 * 
 * Usage: node recover-submissions.js
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:5000';

async function checkWebhookSubmissions() {
  console.log('🔍 Checking webhook submissions queue...');
  try {
    const response = await fetch(`${API_BASE}/api/webhook-submissions`);
    const data = await response.json();
    
    console.log(`Found ${data.stats.total} submissions in queue`);
    console.log(`✓ ${data.stats.successful} successful`);
    console.log(`✗ ${data.stats.failed} failed`);
    
    // Create recovery directories
    const recoveryDir = path.join(__dirname, 'recovered-submissions');
    if (!fs.existsSync(recoveryDir)) {
      fs.mkdirSync(recoveryDir);
    }
    
    // Export all submissions for analysis
    if (data.submissions && data.submissions.length > 0) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filePath = path.join(recoveryDir, `submissions-${timestamp}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(data.submissions, null, 2));
      console.log(`✓ Exported ${data.submissions.length} submissions to ${filePath}`);
      
      // Create a CSV for easy import to spreadsheets
      const csvPath = path.join(recoveryDir, `submissions-${timestamp}.csv`);
      const csvHeader = 'ID,Timestamp,Type,Name,Email,Phone,From,To,Vehicle,Price\n';
      
      const csvRows = data.submissions.map(sub => {
        const original = sub.originalData || {};
        const formatted = sub.webhookPayload || {};
        
        return [
          sub.id,
          new Date(sub.timestamp).toISOString(),
          sub.formType,
          original.name || formatted.name || '',
          original.email || formatted.email || '',
          original.phone || formatted.phone || '',
          original.pickupLocation || formatted.pickupLocation || '',
          original.dropoffLocation || formatted.dropoffLocation || '',
          `${original.year || ''} ${original.make || ''} ${original.model || ''}`.trim(),
          original.selectedPrice || original.openTransportPrice || ''
        ].map(field => `"${field}"`).join(',');
      }).join('\n');
      
      fs.writeFileSync(csvPath, csvHeader + csvRows);
      console.log(`✓ Exported CSV summary to ${csvPath}`);
      
      // Look for failed submissions specifically
      const failedSubmissions = data.submissions.filter(sub => !sub.success);
      if (failedSubmissions.length > 0) {
        const failedPath = path.join(recoveryDir, `failed-submissions-${timestamp}.json`);
        fs.writeFileSync(failedPath, JSON.stringify(failedSubmissions, null, 2));
        console.log(`⚠️ Found ${failedSubmissions.length} failed submissions, saved to ${failedPath}`);
      }
    }
    
    return data.submissions || [];
  } catch (error) {
    console.error('Error checking webhook submissions:', error);
    return [];
  }
}

async function checkWebhookHealth() {
  console.log('\n🔍 Checking webhook health...');
  try {
    const response = await fetch(`${API_BASE}/api/webhook-health`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✓ Overall health: ${data.report.overallHealth}`);
      console.log(`✓ Success rate: ${data.report.successRate}%`);
      
      if (data.report.hasIssues) {
        console.log('⚠️ The webhook system has detected issues:');
        if (data.report.lastFailure) {
          console.log(`  - Last failure: ${new Date(data.report.lastFailure.timestamp).toLocaleString()}`);
          console.log(`  - Failure URL: ${data.report.lastFailure.url}`);
        }
        
        // Failures could indicate lost submissions
        return true;
      }
      
      return false;
    } else {
      console.error('Error retrieving webhook health');
      return false;
    }
  } catch (error) {
    console.error('Error checking webhook health:', error);
    return false;
  }
}

// Check for form submissions in local storage (if browser localStorage was used)
async function analyzeClientCache() {
  console.log('\n🔍 Looking for recoverable client-side cache...');
  console.log('This would require checking browser localStorage data.');
  console.log('Note: This can only be done manually by users through browser inspection.');
  console.log('Check the following localStorage keys:');
  console.log('  - quoteForm');
  console.log('  - bookingForm');
  console.log('  - formData');
  console.log('  - formBackup');
}

// Main recovery function
async function recoverSubmissions() {
  console.log('=== SUBMISSION RECOVERY TOOL ===');
  console.log('Looking for potentially lost form submissions...\n');
  
  // Check webhook health first
  const hasWebhookIssues = await checkWebhookHealth();
  
  // Get all submissions from the queue
  const submissions = await checkWebhookSubmissions();
  
  // Analyze client-side caching possibilities
  await analyzeClientCache();
  
  console.log('\n=== RECOVERY SUMMARY ===');
  console.log(`Found ${submissions.length} total submissions in monitoring system`);
  console.log(`Webhook system health issues: ${hasWebhookIssues ? 'YES' : 'NO'}`);
  
  const failedCount = submissions.filter(sub => !sub.success).length;
  console.log(`Failed submissions that need manual processing: ${failedCount}`);
  
  if (failedCount > 0 || hasWebhookIssues) {
    console.log('\n⚠️ Recovery recommended. Check the recovered-submissions directory.');
  } else {
    console.log('\n✓ No major issues detected. Normal operation.');
  }
}

// Run the recovery process
recoverSubmissions().catch(error => {
  console.error('Error during recovery process:', error);
});