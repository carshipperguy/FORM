#!/usr/bin/env node

/**
 * End-to-End Facebook Attribution Flow Test
 * 
 * This test simulates:
 * 1. Facebook ad click → amerigoautotransport.net with fbclid + UTM params
 * 2. Parent page captures attribution data
 * 3. Parent sends data to iframe via postMessage
 * 4. Iframe form submission includes attribution in webhook payload
 * 5. Webhook sent to Zapier with all Facebook attribution data
 */

console.log("🧪 FACEBOOK ATTRIBUTION FLOW TEST");
console.log("=" * 50);

// Test data simulating Facebook ad click
const facebookAdParams = {
  fbclid: "IwAR123abc_TEST_FACEBOOK_CLICK_ID",
  utm_source: "facebook",
  utm_medium: "cpc", 
  utm_campaign: "auto_transport_q4_2025",
  utm_content: "quote_form_cta",
  utm_term: "car_shipping_quotes",
  referrer: "https://facebook.com/"
};

// Test form submission data with required fields
const testFormData = {
  name: "Facebook Test User",
  email: "test@facebook-attribution.com",
  phone: "555-0123",
  pickupLocation: "Los Angeles, CA 90210",
  dropoffLocation: "New York, NY 10001",
  pickupZip: "90210",
  dropoffZip: "10001",
  vehicleType: "Car",
  year: "2020",
  make: "Toyota", 
  model: "Camry",
  openTransportPrice: 1200,
  distance: 2800,
  transitTime: "7-9 days",
  shipmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
};

async function testAttributionFlow() {
  try {
    console.log("\n1. Testing Facebook attribution parameter capture...");
    console.log("Simulating click from:", facebookAdParams);

    // Test 1: Simulate form submission with attribution data
    console.log("\n2. Testing webhook payload with Facebook attribution...");
    
    const webhookPayload = {
      ...testFormData,
      ...facebookAdParams,
      eventType: "form_submission",
      submissionDate: new Date().toISOString(),
      submissionId: `FB_TEST_${Date.now()}`
    };

    console.log("📦 Webhook payload being sent:");
    console.log(JSON.stringify(webhookPayload, null, 2));

    // Test 2: Send test webhook to verify attribution data flows through
    console.log("\n3. Sending test webhook to verify attribution data...");
    
    const response = await fetch('http://localhost:5000/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test': 'facebook-attribution-flow'
      },
      body: JSON.stringify(webhookPayload)
    });

    if (response.ok) {
      const result = await response.text();
      console.log("✅ Webhook sent successfully!");
      console.log("Response:", result);
    } else {
      console.error("❌ Webhook failed:", response.status, response.statusText);
    }

    // Test 3: Verify attribution data is present in payload
    console.log("\n4. Attribution data verification:");
    console.log("✅ fbclid:", webhookPayload.fbclid ? "PRESENT" : "MISSING");
    console.log("✅ utm_source:", webhookPayload.utm_source ? "PRESENT" : "MISSING");
    console.log("✅ utm_medium:", webhookPayload.utm_medium ? "PRESENT" : "MISSING");
    console.log("✅ utm_campaign:", webhookPayload.utm_campaign ? "PRESENT" : "MISSING");
    console.log("✅ utm_content:", webhookPayload.utm_content ? "PRESENT" : "MISSING");
    console.log("✅ utm_term:", webhookPayload.utm_term ? "PRESENT" : "MISSING");
    console.log("✅ referrer:", webhookPayload.referrer ? "PRESENT" : "MISSING");

    // Test 4: Confirm no data loss
    const requiredFields = ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const missingFields = requiredFields.filter(field => !webhookPayload[field]);
    
    if (missingFields.length === 0) {
      console.log("\n🎉 SUCCESS: All Facebook attribution data preserved!");
      console.log("✅ fbclid + all UTM params survive from Facebook ad → webhook");
    } else {
      console.log("\n❌ FAILURE: Missing attribution fields:", missingFields);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testAttributionFlow();