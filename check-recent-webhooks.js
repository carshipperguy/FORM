/**
 * Check recent webhook submissions
 * 
 * This script fetches recent webhook health data to check
 * for submissions and UTM parameters
 */

import fetch from 'node-fetch';

async function checkRecentWebhooks() {
  console.log("🔍 CHECKING RECENT WEBHOOK ACTIVITY\n");
  
  try {
    console.log("📊 Fetching webhook health data...");
    const healthResponse = await fetch('http://localhost:5000/api/webhook-health');
    const healthData = await healthResponse.json();
    
    console.log(`\n✅ Webhook Status: ${healthData.healthy ? 'Healthy' : 'Issues detected'}`);
    console.log(`📊 Total attempts: ${healthData.totalAttempts}`);
    console.log(`📊 Success rate: ${healthData.successRate}%`);
    
    // Get recent submissions
    console.log("\n📝 Fetching recent submissions...");
    const submissionsResponse = await fetch('http://localhost:5000/api/webhook-submissions');
    const submissions = await submissionsResponse.json();
    
    if (submissions && submissions.length > 0) {
      console.log(`\n🔔 Found ${submissions.length} recent submissions`);
      
      // Look for Trent Jones submission
      const trentSubmission = submissions.find(s => 
        s.payload && 
        s.payload.name && 
        s.payload.name.toLowerCase().includes('trent') && 
        s.payload.name.toLowerCase().includes('jones')
      );
      
      if (trentSubmission) {
        console.log("\n✅ FOUND TRENT JONES SUBMISSION:");
        console.log("\n📝 Submission details:");
        
        // Print basic data
        console.log(`📅 Date: ${new Date(trentSubmission.timestamp).toLocaleString()}`);
        console.log(`📧 Email: ${trentSubmission.payload.email || 'Not provided'}`);
        console.log(`☎️ Phone: ${trentSubmission.payload.phone || 'Not provided'}`);
        
        // Check for UTM parameters
        console.log("\n🌐 UTM PARAMETERS:");
        console.log(`utm_source: ${trentSubmission.payload.utm_source || 'Not present'}`);
        console.log(`utm_medium: ${trentSubmission.payload.utm_medium || 'Not present'}`);
        console.log(`utm_campaign: ${trentSubmission.payload.utm_campaign || 'Not present'}`);
        console.log(`utm_term: ${trentSubmission.payload.utm_term || 'Not present'}`);
        console.log(`utm_content: ${trentSubmission.payload.utm_content || 'Not present'}`);
        console.log(`fbclid: ${trentSubmission.payload.fbclid || 'Not present'}`);
        console.log(`referrer: ${trentSubmission.payload.referrer || 'Not present'}`);
        
        // Attribution webhook status
        const hasUtmParams = !!(
          trentSubmission.payload.utm_source || 
          trentSubmission.payload.utm_medium || 
          trentSubmission.payload.utm_campaign ||
          trentSubmission.payload.utm_term ||
          trentSubmission.payload.utm_content ||
          trentSubmission.payload.fbclid
        );
        
        console.log(`\n✅ UTM Parameters included: ${hasUtmParams ? 'YES' : 'NO'}`);
        
        if (!hasUtmParams) {
          console.log("\n⚠️ NO UTM PARAMETERS WERE INCLUDED IN THIS SUBMISSION");
          console.log("This indicates the iframe URL did not contain any UTM parameters.");
        } else {
          console.log("\n✅ UTM PARAMETERS WERE SUCCESSFULLY INCLUDED");
          console.log("The attribution webhook should have sent these parameters to the CRM.");
        }
      } else {
        console.log("\n❌ No submission found for Trent Jones");
        
        // Show the most recent submission instead
        const mostRecent = submissions[0];
        console.log("\n📝 Most recent submission details:");
        console.log(`📅 Date: ${new Date(mostRecent.timestamp).toLocaleString()}`);
        console.log(`👤 Name: ${mostRecent.payload.name || 'Not provided'}`);
        console.log(`📧 Email: ${mostRecent.payload.email || 'Not provided'}`);
      }
    } else {
      console.log("\n❌ No recent submissions found");
    }
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
  }
}

// Run the check
checkRecentWebhooks();