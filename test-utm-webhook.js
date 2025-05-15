/**
 * Test UTM Parameter webhook
 * 
 * This script simulates a form submission with UTM parameters to test
 * if they are properly captured and sent to the CRM
 */

import fetch from 'node-fetch';

async function testUTMWebhook() {
  console.log("🧪 TESTING UTM PARAMETER WEBHOOK");
  
  // Create test form data with UTM parameters
  const testData = {
    name: "UTM Test User",
    email: "test-utm@example.com",
    phone: "555-123-4567",
    pickupLocation: "Miami, FL 33101",
    pickupZip: "33101",
    dropoffLocation: "Boston, MA 02108",
    dropoffZip: "02108",
    vehicleType: "car/truck/suv",
    year: "2023",
    make: "Honda",
    model: "CR-V",
    shipmentDate: "2025-06-01",
    distance: 1500,
    transitTime: 5,
    openTransportPrice: 950,
    enclosedTransportPrice: 1150,
    
    // UTM parameters - this is what we're testing
    utm_source: "facebook",
    utm_medium: "cpc",
    utm_campaign: "summer_transport",
    utm_content: "utm_test_script",
    utm_term: "auto_shipping_test",
    fbclid: "IwAR2xyzABC123utm_test",
    referrer: "facebook.com",
    
    // Critical field - must be 'quote_submission' for attribution to fire
    eventType: "quote_submission"
  };
  
  console.log("📊 Testing with UTM parameters:");
  console.log(JSON.stringify({
    utm_source: testData.utm_source,
    utm_medium: testData.utm_medium,
    utm_campaign: testData.utm_campaign,
    utm_content: testData.utm_content,
    utm_term: testData.utm_term,
    fbclid: testData.fbclid
  }, null, 2));
  
  try {
    console.log("🔄 Sending test form submission to /api/webhook endpoint...");
    
    // Send to the form webhook endpoint - this should trigger attribution webhook
    const response = await fetch('http://localhost:5000/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("✅ Form webhook response:", result);
    console.log("\nPlease check server logs for attribution webhook details");
    console.log("Look for 'ATTRIBUTION WEBHOOK' messages that show UTM parameters being sent");
    
  } catch (error) {
    console.error("❌ Error testing webhook:", error.message);
  }
}

// Run the test
testUTMWebhook();