/**
 * Send a test lead with UTM parameters through the webhook system
 * This tests the attribution webhook specifically
 */

import fetch from 'node-fetch';

async function sendTestLeadWithUTM() {
  try {
    console.log("Sending test lead with UTM parameters to test attribution webhook...");
    
    // This matches the structure of real customer data with UTM parameters
    const testData = {
      name: "Jane Marketing",
      email: "jane.test@example.com",
      phone: "555-987-6543",
      pickupLocation: "Miami, FL 33101",
      pickupZip: "33101",
      dropoffLocation: "Boston, MA 02108",
      dropoffZip: "02108",
      vehicleType: "SUV",
      year: "2023",
      make: "Honda",
      model: "CR-V",
      shipmentDate: "2025-06-01",
      
      // Attribution parameters - this is what we're testing
      utm_source: "facebook",
      utm_medium: "cpc",
      utm_campaign: "summer_transport",
      utm_content: "carousel_ad_2",
      utm_term: "auto_shipping",
      fbclid: "IwAR2xyzABC123example",
      referrer: "facebook.com",
      
      // Event type - must be 'quote_submission' for attribution to fire
      eventType: "quote_submission"
    };
    
    // Send the test data to the webhook endpoint
    const response = await fetch("http://localhost:5000/api/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log("✅ Test lead with UTM parameters successfully submitted!");
    console.log("Response:", result);
    console.log("\nThe attribution webhook should now have fired with UTM parameters.");
    console.log("Please check server logs to confirm proper delivery to the CRM endpoint.");
    
  } catch (error) {
    console.error("❌ Error sending test lead:", error.message);
  }
}

// Execute the function
sendTestLeadWithUTM();