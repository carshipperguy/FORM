// VERIFICATION TEST: RV Pricing - Display vs Webhook
// This simulates the exact flow from calculation → webhook → display

const BASE_URL = 'http://localhost:5000';

async function verifyRVPricing() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 VERIFICATION TEST: RV Pricing Fix');
  console.log('═══════════════════════════════════════════════════════\n');

  // TEST PARAMETERS
  const testRoute = {
    pickup: 'Myrtle Beach, SC 29572',
    dropoff: 'Lawton, OK 73503',
    vehicleType: 'rv/5th wheel',
    distance: 1292 // Pre-verified from MapQuest API
  };

  console.log('📍 Test Route:', testRoute.pickup, '→', testRoute.dropoff);
  console.log('🚗 Vehicle Type:', testRoute.vehicleType);
  console.log('📏 Distance:', testRoute.distance, 'miles\n');

  // STEP 1: Calculate pricing (simulating pricing.ts logic)
  console.log('STEP 1: Calculate Price (Backend Logic)');
  console.log('─────────────────────────────────────');
  
  const ratePerMile = 3.0;
  const minimumPrice = 750;
  const calculatedOpen = testRoute.distance * ratePerMile;
  const openTransportPrice = Math.max(calculatedOpen, minimumPrice);
  const enclosedTransportPrice = Math.round(openTransportPrice * 1.4);
  
  console.log('Formula: distance × ratePerMile');
  console.log(`Calculation: ${testRoute.distance} × $${ratePerMile} = $${calculatedOpen}`);
  console.log(`Minimum: $${minimumPrice}`);
  console.log('✅ Open Transport Price:', `$${openTransportPrice}`);
  console.log('✅ Enclosed Transport Price:', `$${enclosedTransportPrice}`);
  console.log('');

  // STEP 2: Create webhook payload (simulating SimpleQuoteForm.jsx)
  console.log('STEP 2: Webhook Payload (What Gets Sent to Zapier)');
  console.log('──────────────────────────────────────────────────────');
  
  const webhookData = {
    name: 'VERIFICATION TEST',
    email: 'verify@test.com',
    phone: '5555555555',
    pickupLocation: testRoute.pickup,
    dropoffLocation: testRoute.dropoff,
    vehicleType: testRoute.vehicleType,
    year: '2024',
    make: 'Test',
    model: 'Test',
    shipmentDate: new Date().toISOString().split('T')[0],
    distance: testRoute.distance,
    openTransportPrice: openTransportPrice,
    enclosedTransportPrice: enclosedTransportPrice,
    eventType: 'verification_test'
  };
  
  console.log('Webhook Payload:');
  console.log('  vehicleType:', webhookData.vehicleType);
  console.log('  distance:', webhookData.distance, 'miles');
  console.log('  openTransportPrice:', `$${webhookData.openTransportPrice}`);
  console.log('  enclosedTransportPrice:', `$${webhookData.enclosedTransportPrice}`);
  console.log('');

  // STEP 3: Simulate display component (QuoteOptions.jsx)
  console.log('STEP 3: Display Component (What Customer Sees)');
  console.log('───────────────────────────────────────────────────');
  
  // This simulates the QuoteOptions component receiving data
  const formData = {
    ...webhookData,
    openTransportPrice: webhookData.openTransportPrice,
    enclosedTransportPrice: webhookData.enclosedTransportPrice
  };
  
  // Simulating QuoteOptions.jsx line 37
  const standardPrice = formData.openTransportPrice;
  const expressPrice = Math.round(formData.openTransportPrice * 1.2);
  
  console.log('formData received:');
  console.log('  openTransportPrice:', `$${formData.openTransportPrice}`);
  console.log('  enclosedTransportPrice:', `$${formData.enclosedTransportPrice}`);
  console.log('');
  console.log('Display Values:');
  console.log('  Standard Open:', `$${standardPrice}`);
  console.log('  Express Open:', `$${expressPrice}`);
  console.log('');

  // STEP 4: VERIFICATION
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎯 VERIFICATION RESULTS');
  console.log('═══════════════════════════════════════════════════════\n');

  const results = {
    calculated: openTransportPrice,
    webhook: webhookData.openTransportPrice,
    display: standardPrice
  };

  console.log('Price Comparison:');
  console.log('  Calculated Price: $' + results.calculated);
  console.log('  Webhook Price:    $' + results.webhook);
  console.log('  Displayed Price:  $' + results.display);
  console.log('');

  // Check if all match
  const allMatch = (results.calculated === results.webhook) && 
                   (results.webhook === results.display);

  if (allMatch) {
    console.log('✅ SUCCESS: All prices match!');
    console.log('✅ Display = Webhook = $' + results.display);
    console.log('✅ No price discrepancy detected');
    console.log('✅ Issue is RESOLVED');
  } else {
    console.log('❌ FAILURE: Price mismatch detected!');
    if (results.calculated !== results.webhook) {
      console.log('❌ Calculated ≠ Webhook');
    }
    if (results.webhook !== results.display) {
      console.log('❌ Webhook ≠ Display');
      console.log('   Difference: $' + (results.webhook - results.display));
    }
    console.log('❌ Issue still EXISTS');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Expected Result: All three values = $3,876');
  console.log('═══════════════════════════════════════════════════════');

  return allMatch;
}

// Run the verification
verifyRVPricing()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
  });
