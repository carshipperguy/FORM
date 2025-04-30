/**
 * Webhook Diagnostic Test Script
 * 
 * This script performs a live test of the webhook pipeline by:
 * 1. Submitting a form entry to trigger the webhook
 * 2. Monitoring the webhook process in real-time
 * 3. Gathering detailed performance metrics
 * 
 * No application code is modified by this script - it's purely diagnostic.
 */

import fetch from 'node-fetch';
import { performance } from 'perf_hooks';
import os from 'os';

// Test configuration
const API_ENDPOINT = 'http://localhost:5000/api/webhook';
const MONITOR_ENDPOINT = 'http://localhost:5000/api/webhook-monitor';
const SUBMISSIONS_ENDPOINT = 'http://localhost:5000/api/webhook-submissions';

// Generate a unique test ID to trace this specific test
const TEST_ID = `test-${Date.now()}`;

/**
 * Generate test quote data for a real submission
 */
function generateTestQuoteData() {
  return {
    // Required fields based on form validation
    pickupLocation: "Atlanta, GA 30303",
    pickupZip: "30303",
    dropoffLocation: "Dallas, TX 75201", 
    dropoffZip: "75201",
    vehicleType: "car/truck/suv",
    year: "2022",
    make: "Toyota",
    model: "Camry",
    shipmentDate: "2025-05-15",
    name: "Test Customer",
    phone: "555-123-4567",
    email: "test@example.com",
    
    // Additional fields that would be calculated
    openTransportPrice: 849,
    enclosedTransportPrice: 1189,
    transitTime: 3,
    distance: 795,
    
    // Event type indicator
    eventType: "quote_submission",
    testIdentifier: TEST_ID,
    
    // Add some attribution data
    fbclid: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    referrer: ""
  };
}

/**
 * Get system resource information
 */
async function getSystemInfo() {
  return {
    memoryUsage: {
      total: Math.round(os.totalmem() / (1024 * 1024)),
      free: Math.round(os.freemem() / (1024 * 1024)),
      used: Math.round((os.totalmem() - os.freemem()) / (1024 * 1024))
    },
    cpuInfo: {
      loadAvg: os.loadavg(),
      cpuCount: os.cpus().length
    },
    uptime: os.uptime()
  };
}

/**
 * Monitor webhook health data
 */
async function getWebhookMonitorData() {
  try {
    const response = await fetch(MONITOR_ENDPOINT);
    return await response.json();
  } catch (error) {
    console.error('Failed to get webhook monitor data:', error);
    return null;
  }
}

/**
 * Get webhook submission data
 */
async function getWebhookSubmissions() {
  try {
    const response = await fetch(SUBMISSIONS_ENDPOINT);
    return await response.json();
  } catch (error) {
    console.error('Failed to get webhook submissions:', error);
    return null;
  }
}

/**
 * Submit test data to trigger webhook
 */
async function submitTestData() {
  console.log('\n📊 STARTING WEBHOOK DIAGNOSTIC TEST');
  console.log('🔄 Preparing to submit test form data to trigger webhook');
  
  // Get initial system stats
  const initialSystemInfo = await getSystemInfo();
  console.log('💻 Initial System State:', initialSystemInfo);
  
  // Get initial webhook monitor data
  const initialMonitorData = await getWebhookMonitorData();
  console.log('📈 Initial Webhook Stats:', {
    totalAttempts: initialMonitorData?.report?.detailedStats?.totalAttempts || 0,
    successfulAttempts: initialMonitorData?.report?.detailedStats?.successfulAttempts || 0,
    failedAttempts: initialMonitorData?.report?.detailedStats?.failedAttempts || 0
  });
  
  // Prepare test data
  const testData = generateTestQuoteData();
  
  console.log(`\n🚀 SENDING TEST FORM SUBMISSION (ID: ${TEST_ID})`);
  console.log('📋 Payload Size:', JSON.stringify(testData).length, 'bytes');
  
  // Record start time
  const startTime = performance.now();
  
  try {
    // Send the form submission
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    // Calculate response time
    const responseTime = performance.now() - startTime;
    
    // Get response details
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawResponse: responseText };
    }
    
    console.log(`\n✅ API RESPONSE RECEIVED IN ${responseTime.toFixed(2)}ms`);
    console.log('📊 Status Code:', response.status);
    console.log('📋 Response Data:', responseData);
    
    // Wait for webhook processing to complete
    console.log('\n⏳ WAITING FOR WEBHOOK PROCESSING TO COMPLETE...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get updated webhook monitor data
    const updatedMonitorData = await getWebhookMonitorData();
    console.log('\n📈 UPDATED WEBHOOK STATS:');
    
    const webhookStats = updatedMonitorData?.report?.detailedStats || {};
    const webhookMonitor = updatedMonitorData?.report?.monitorData || {};
    
    console.log('  Total Attempts:', webhookStats.totalAttempts || 0);
    console.log('  Successful Attempts:', webhookStats.successfulAttempts || 0);
    console.log('  Failed Attempts:', webhookStats.failedAttempts || 0);
    console.log('  Average Response Time:', webhookStats.averageResponseTime || 0, 'ms');
    
    // Check for errors
    if (webhookStats.errors && webhookStats.errors.length > 0) {
      console.log('\n❌ WEBHOOK ERRORS DETECTED:');
      webhookStats.errors.forEach((error, index) => {
        console.log(`  Error ${index + 1}:`, error.error);
        console.log(`  Status:`, error.status || 'N/A');
        console.log(`  Timestamp:`, new Date(error.timestamp).toISOString());
        if (error.payload) {
          console.log(`  Payload Excerpt:`, error.payload.substring(0, 100) + '...');
        }
      });
    }
    
    // Get system info after webhook processing
    const finalSystemInfo = await getSystemInfo();
    console.log('\n💻 FINAL SYSTEM STATE:', finalSystemInfo);
    
    // Check for resource changes
    console.log('\n📊 RESOURCE UTILIZATION CHANGES:');
    console.log('  Memory Usage Change:', 
      finalSystemInfo.memoryUsage.used - initialSystemInfo.memoryUsage.used, 'MB');
    console.log('  CPU Load Average Change:', 
      finalSystemInfo.cpuInfo.loadAvg.map((v, i) => v - initialSystemInfo.cpuInfo.loadAvg[i]));
    
    // Check webhook submissions for this test
    console.log('\n🔍 CHECKING FOR WEBHOOK SUBMISSIONS WITH TEST ID:', TEST_ID);
    const submissions = await getWebhookSubmissions();
    
    const testSubmissions = submissions?.submissions?.filter(s => 
      s.originalData?.testIdentifier === TEST_ID || 
      s.webhookPayload?.testIdentifier === TEST_ID
    ) || [];
    
    if (testSubmissions.length > 0) {
      console.log('✅ FOUND', testSubmissions.length, 'SUBMISSIONS MATCHING TEST ID');
      testSubmissions.forEach(submission => {
        console.log('\n📋 SUBMISSION DETAILS:');
        console.log('  ID:', submission.id);
        console.log('  Form Type:', submission.formType);
        console.log('  Success:', submission.success);
        console.log('  Timestamp:', new Date(submission.timestamp).toISOString());
        
        if (submission.success) {
          console.log('  Response Status:', submission.response?.status);
        } else {
          console.log('  Diagnostic Log:', submission.diagnosticLog);
        }
      });
    } else {
      console.log('❌ NO SUBMISSIONS FOUND WITH TEST ID');
    }
    
    // Print test summary
    console.log('\n📝 TEST SUMMARY:');
    console.log('  Submission Response Time:', responseTime.toFixed(2), 'ms');
    console.log('  Webhook Processing:', webhookStats.totalAttempts > initialMonitorData?.report?.detailedStats?.totalAttempts 
      ? '✅ Webhook was triggered' 
      : '❌ Webhook was not triggered');
    console.log('  Submission Status:', response.status, response.ok ? '✓' : '✗');
    
    return {
      success: response.ok,
      responseTime,
      submissionFound: testSubmissions.length > 0,
      webhookTriggered: webhookStats.totalAttempts > initialMonitorData?.report?.detailedStats?.totalAttempts
    };
    
  } catch (error) {
    console.error('\n❌ ERROR DURING TEST:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
submitTestData()
  .then(result => {
    console.log('\n🏁 DIAGNOSTIC TEST COMPLETE');
    console.log('  Final Result:', result.success ? '✅ SUCCESS' : '❌ FAILURE');
    if (!result.success && result.error) {
      console.log('  Error:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ FATAL ERROR:', error);
  });