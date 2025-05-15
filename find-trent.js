/**
 * Specialized script to look for Trent Jones submission
 * This directly examines logs and server state
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function findTrentJonesSubmission() {
  console.log("🔍 SEARCHING FOR TRENT JONES SUBMISSION...");
  
  // Try to find any files with Trent Jones data
  try {
    console.log("\n📁 Searching logs for Trent Jones...");
    
    // Check workflow logs programmatically
    const recentLogs = execSync('cat /tmp/.replit.workflow.logs 2>/dev/null || echo "Not found"').toString();
    
    // Search for Trent in logs
    const trentMentions = recentLogs.split('\n').filter(line => 
      line.toLowerCase().includes('trent') && 
      line.toLowerCase().includes('jones')
    );
    
    if (trentMentions.length > 0) {
      console.log(`\n✅ Found ${trentMentions.length} mentions of Trent Jones in logs:`);
      trentMentions.forEach((line, i) => {
        console.log(`${i+1}: ${line}`);
      });
    } else {
      console.log("\n❌ No mentions of Trent Jones found in workflow logs");
    }
    
    // Look for UTM parameters near Trent mentions
    const utmLines = recentLogs.split('\n').filter(line => 
      (line.includes('utm_') || line.includes('ATTRIBUTION WEBHOOK'))
    );
    
    if (utmLines.length > 0) {
      console.log(`\n📊 Found ${utmLines.length} UTM/Attribution mentions in logs:`);
      utmLines.slice(-20).forEach((line, i) => { // Show last 20 matches
        console.log(`${i+1}: ${line}`);
      });
    } else {
      console.log("\n❌ No UTM parameter mentions found in logs");
    }
    
    // Check recent API requests
    console.log("\n🔍 Checking recent API requests...");
    const apiRequests = recentLogs.split('\n').filter(line => 
      line.includes('POST /api/webhook') || 
      line.includes('/api/webhook ENDPOINT CALLED')
    );
    
    if (apiRequests.length > 0) {
      console.log(`\n📡 Found ${apiRequests.length} webhook API requests:`);
      apiRequests.slice(-10).forEach((line, i) => { // Show last 10 matches
        console.log(`${i+1}: ${line}`);
      });
    } else {
      console.log("\n❌ No webhook API requests found in logs");
    }
    
    // Look for attribution success/failures
    const attributionResponses = recentLogs.split('\n').filter(line => 
      line.includes('ATTRIBUTION WEBHOOK SUCCESS') || 
      line.includes('ATTRIBUTION WEBHOOK ERROR')
    );
    
    if (attributionResponses.length > 0) {
      console.log(`\n✅ Found ${attributionResponses.length} attribution webhook responses:`);
      attributionResponses.slice(-10).forEach((line, i) => { // Show last 10 matches
        console.log(`${i+1}: ${line}`);
      });
    } else {
      console.log("\n❌ No attribution webhook responses found in logs");
    }
    
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
  }
}

// Run the search
findTrentJonesSubmission();