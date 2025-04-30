/**
 * Send a production-identical test lead through the webhook system
 * Using Ron Burgundy's information as requested
 */

import fetch from 'node-fetch';

async function sendTestLead() {
  console.log("Sending Ron Burgundy test lead through standard webhook flow...");
  
  // Standard form data with Ron Burgundy's information
  const formData = {
    // Contact information
    name: "Ron Burgundy",
    email: "carshipperguy@gmail.com",
    phone: "516-712-5751",
    
    // Location information
    pickupLocation: "San Diego, CA 92101",
    pickupZip: "92101",
    dropoffLocation: "New York, NY 10001",
    dropoffZip: "10001",
    
    // Vehicle information
    vehicleType: "car/truck/suv",
    year: "1970",
    make: "Dodge",
    model: "Challenger",
    
    // Logistics information
    shipmentDate: "2025-06-15",
    
    // These would be calculated by the app but included in webhook
    distance: 2834,
    transitTime: 7,
    openTransportPrice: 1699,
    enclosedTransportPrice: 2299,
    
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
    console.log("✅ Ron Burgundy test lead successfully submitted!");
    console.log("Response:", result);
    console.log("\nThe webhook has been processed through the standard flow.");
    console.log("Zapier should have received this submission.");
  } catch (error) {
    console.error("❌ Error sending test lead:", error);
  }
}

sendTestLead();