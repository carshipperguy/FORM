// Test script to simulate RV quote and capture distance/price values
import fetch from 'node-fetch';

async function testRVQuote() {
  const baseUrl = 'http://localhost:5000';
  
  // Test route that showed the issue
  const pickupLocation = 'New York, NY';
  const dropoffLocation = 'Miami, FL';
  
  console.log('🧪 TEST: Simulating RV Quote Submission');
  console.log('========================================\n');
  
  // Step 1: Call distance API
  console.log('STEP 1: Getting distance from API');
  const distanceUrl = `${baseUrl}/api/distance?origin=${encodeURIComponent(pickupLocation)}&destination=${encodeURIComponent(dropoffLocation)}`;
  console.log('URL:', distanceUrl);
  
  const distanceResponse = await fetch(distanceUrl);
  const distanceData = await distanceResponse.json();
  
  console.log('✅ Distance API Response:', distanceData);
  console.log('   Distance value:', distanceData.distance, 'miles');
  console.log('');
  
  // Step 2: Calculate price using the same logic as frontend
  const distance = distanceData.distance;
  const vehicleType = 'RV/5th Wheel';
  const ratePerMile = 3.0;
  const minimumPrice = 750;
  
  const calculatedPrice = Math.max(distance * ratePerMile, minimumPrice);
  
  console.log('STEP 2: Price Calculation');
  console.log('   Vehicle Type:', vehicleType);
  console.log('   Distance:', distance, 'miles');
  console.log('   Rate per mile: $' + ratePerMile);
  console.log('   Raw calculation:', distance, '×', ratePerMile, '=', '$' + (distance * ratePerMile));
  console.log('   With minimum enforcement:', Math.round(calculatedPrice));
  console.log('');
  
  // Step 3: Simulate webhook payload
  const webhookPayload = {
    pickupLocation: pickupLocation,
    dropoffLocation: dropoffLocation,
    vehicleType: vehicleType,
    distance: distance,  // This should be the SAME distance from API
    openTransportPrice: Math.round(calculatedPrice),
    enclosedTransportPrice: Math.round(calculatedPrice * 1.2),
    name: 'Test User',
    email: 'test@example.com',
    phone: '5555555555',
    shipmentDate: new Date().toISOString().split('T')[0]
  };
  
  console.log('STEP 3: Webhook Payload Being Sent');
  console.log('   Distance in payload:', webhookPayload.distance);
  console.log('   Open transport price:', webhookPayload.openTransportPrice);
  console.log('   Enclosed transport price:', webhookPayload.enclosedTransportPrice);
  console.log('');
  
  console.log('========================================');
  console.log('SUMMARY:');
  console.log('   Distance from API:', distanceData.distance, 'miles');
  console.log('   Price displayed to customer: $' + Math.round(calculatedPrice));
  console.log('   Price in webhook payload: $' + webhookPayload.openTransportPrice);
  console.log('   Distance in webhook payload:', webhookPayload.distance, 'miles');
  console.log('   MATCH:', distanceData.distance === webhookPayload.distance && Math.round(calculatedPrice) === webhookPayload.openTransportPrice ? '✅ YES' : '❌ NO');
}

testRVQuote().catch(console.error);
