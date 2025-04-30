/**
 * Send a production-identical test lead through the webhook system
 * This uses the exact same pipeline, structure and fields as real customer submissions
 */

import fetch from 'node-fetch';

async function sendTestLead() {
  console.log("Sending test lead submission through standard webhook flow...");
  
  // Standard form data that would come from a real customer submission
  const formData = {
    // Contact information
    name: "John Smith",
    email: "johnsmith@example.com",
    phone: "555-123-4567",
    
    // Location information
    pickupLocation: "Atlanta, GA 30303",
    pickupZip: "30303",
    dropoffLocation: "Dallas, TX 75201",
    dropoffZip: "75201",
    
    // Vehicle information
    vehicleType: "car/truck/suv",
    year: "2022",
    make: "Toyota",
    model: "Camry",
    
    // Logistics information
    shipmentDate: "2025-05-20",
    
    // These would be calculated by the app but included in webhook
    distance: 795,
    transitTime: 3,
    openTransportPrice: 849,
    enclosedTransportPrice: 1189,
    
    // Standard event type for initial quote
    eventType: "quote_submission"
  };
  
  try {
    // Send through the regular webhook endpoint, just like a real submission
    const response = await fetch('http://localhost:5000/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("✅ Test lead successfully submitted!");
    console.log("Response:", result);
    console.log("\nThe webhook has been processed through the standard flow.");
    console.log("Please check your Zapier dashboard to confirm proper field mapping.");
  } catch (error) {
    console.error("❌ Error sending test lead:", error);
  }
}

sendTestLead();