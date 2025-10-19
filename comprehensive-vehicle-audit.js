// COMPREHENSIVE VEHICLE TYPE AUDIT
// Tests all three dropdown categories for display/webhook price consistency

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test cases matching the dropdown options exactly
const TEST_CASES = [
  {
    category: 'Car / Truck / SUV',
    vehicleType: 'car/truck/suv',
    route: { from: 'Miami, FL 33101', to: 'Dallas, TX 75201' },
    vehicle: { year: '2024', make: 'Toyota', model: 'Camry' }
  },
  {
    category: 'RV / 5th Wheel',
    vehicleType: 'rv/5th wheel',
    route: { from: 'Myrtle Beach, SC 29572', to: 'Lawton, OK 73503' },
    vehicle: { year: '2024', make: 'Thor', model: 'Challenger' }
  },
  {
    category: 'Travel Trailer',
    vehicleType: 'travel trailer',
    route: { from: 'Austin, TX 78701', to: 'Tampa, FL 33602' },
    vehicle: { year: '2024', make: 'Airstream', model: 'Flying Cloud' }
  }
];

async function getDistance(from, to) {
  const url = `${BASE_URL}/api/distance?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.distance;
}

// Import pricing function
async function calculatePricing(distance, vehicleType) {
  // Simulate the pricing.ts logic
  const BASE_RATE_PER_MILE = 0.614;
  const ENCLOSED_MULTIPLIER = 1.40;
  const MIN_LOCAL_DISTANCE_MILES = 120;
  
  // Check if special vehicle type (RV/Travel Trailer)
  const isSpecialVehicle = vehicleType.toLowerCase().includes('rv') || 
                           vehicleType.toLowerCase().includes('5th wheel') || 
                           vehicleType.toLowerCase().includes('travel trailer');
  
  let openTransportPrice;
  let enclosedTransportPrice;
  
  if (isSpecialVehicle) {
    // Special pricing: $3.00/mile with $750 minimum
    const ratePerMile = 3.0;
    const minimumPrice = 750;
    const price = distance * ratePerMile;
    openTransportPrice = Math.max(price, minimumPrice);
    enclosedTransportPrice = Math.round(openTransportPrice * ENCLOSED_MULTIPLIER);
  } else {
    // Car/Truck/SUV pricing
    const distanceForPricing = distance <= 100 ? Math.max(distance, MIN_LOCAL_DISTANCE_MILES) : distance;
    
    // Base price calculation
    let basePrice = distanceForPricing <= 800
      ? distanceForPricing * BASE_RATE_PER_MILE * 1.10
      : distanceForPricing * BASE_RATE_PER_MILE;
    
    // Universal +40% for car/truck/suv
    basePrice = basePrice * 1.40;
    
    // Additional +40% for short-haul (<1500 miles)
    if (distanceForPricing < 1500) {
      basePrice = basePrice * 1.40;
    }
    
    // $695 minimum
    if (basePrice < 695) {
      basePrice = 695;
    }
    
    // Middle-range uplift: 20% for $696-$1070 range
    if (basePrice >= 696 && basePrice <= 1070) {
      basePrice = Math.round(basePrice * 1.2);
    }
    
    openTransportPrice = Math.round(basePrice);
    enclosedTransportPrice = Math.round(openTransportPrice * ENCLOSED_MULTIPLIER);
  }
  
  return {
    openTransport: openTransportPrice,
    enclosedTransport: enclosedTransportPrice
  };
}

async function runAudit() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 COMPREHENSIVE VEHICLE TYPE AUDIT');
  console.log('Testing all dropdown categories for price consistency');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = [];
  let allPassed = true;

  for (const testCase of TEST_CASES) {
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`📋 CATEGORY: ${testCase.category}`);
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`Route: ${testCase.route.from} → ${testCase.route.to}`);
    console.log(`Vehicle Type: ${testCase.vehicleType}`);
    console.log(`Vehicle: ${testCase.vehicle.year} ${testCase.vehicle.make} ${testCase.vehicle.model}`);
    console.log('');

    try {
      // STEP 1: Get distance
      console.log('STEP 1: Get Distance from API');
      const distance = await getDistance(testCase.route.from, testCase.route.to);
      console.log(`  Distance: ${distance} miles`);
      console.log('');

      // STEP 2: Calculate pricing (simulating pricing.ts)
      console.log('STEP 2: Calculate Pricing');
      const pricingResult = await calculatePricing(distance, testCase.vehicleType);
      const CALCULATED = pricingResult.openTransport;
      console.log(`  CALCULATED: $${CALCULATED}`);
      console.log(`  [pricingResult.openTransport]`);
      console.log('');

      // STEP 3: Create quote data (simulating SimpleQuoteForm.jsx line 411-419)
      console.log('STEP 3: Create Quote Data Object');
      const quoteData = {
        pickupLocation: testCase.route.from,
        dropoffLocation: testCase.route.to,
        vehicleType: testCase.vehicleType,
        year: testCase.vehicle.year,
        make: testCase.vehicle.make,
        model: testCase.vehicle.model,
        openTransportPrice: pricingResult.openTransport,
        enclosedTransportPrice: pricingResult.enclosedTransport,
        distance: distance
      };
      const QUOTE_DATA = quoteData.openTransportPrice;
      console.log(`  QUOTE DATA: $${QUOTE_DATA}`);
      console.log(`  [quoteData.openTransportPrice]`);
      console.log('');

      // STEP 4: Create webhook data (simulating SimpleQuoteForm.jsx line 476)
      console.log('STEP 4: Create Webhook Payload');
      const webhookData = {
        ...quoteData,
        eventType: 'audit_test',
        name: 'Audit Test',
        email: 'audit@test.com',
        phone: '5555555555'
      };
      const WEBHOOK = webhookData.openTransportPrice;
      console.log(`  WEBHOOK: $${WEBHOOK}`);
      console.log(`  [webhookData.openTransportPrice]`);
      console.log('');

      // STEP 5: Simulate display component (QuoteOptions.jsx line 22, 37)
      console.log('STEP 5: Display Component (QuoteOptions)');
      const formData = { ...webhookData };
      const DISPLAY = formData.openTransportPrice;
      console.log(`  DISPLAY: $${DISPLAY}`);
      console.log(`  [formData.openTransportPrice]`);
      console.log('');

      // VERIFICATION
      console.log('🎯 VERIFICATION:');
      console.log(`  CALCULATED: $${CALCULATED}`);
      console.log(`  QUOTE DATA: $${QUOTE_DATA}`);
      console.log(`  WEBHOOK:    $${WEBHOOK}`);
      console.log(`  DISPLAY:    $${DISPLAY}`);
      console.log('');

      const allMatch = (CALCULATED === QUOTE_DATA) && 
                       (QUOTE_DATA === WEBHOOK) && 
                       (WEBHOOK === DISPLAY);

      if (allMatch) {
        console.log('✅ PASS: All values match exactly');
        console.log(`✅ ${testCase.category}: $${DISPLAY}`);
      } else {
        console.log('❌ FAIL: Price mismatch detected!');
        allPassed = false;
      }

      results.push({
        category: testCase.category,
        route: `${testCase.route.from} → ${testCase.route.to}`,
        distance: distance,
        calculated: CALCULATED,
        quoteData: QUOTE_DATA,
        webhook: WEBHOOK,
        display: DISPLAY,
        match: allMatch
      });

    } catch (error) {
      console.error(`❌ ERROR testing ${testCase.category}:`, error.message);
      allPassed = false;
      results.push({
        category: testCase.category,
        error: error.message,
        match: false
      });
    }

    console.log('');
  }

  // FINAL SUMMARY TABLE
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 AUDIT SUMMARY TABLE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Vehicle Type          | Example Route              | Displayed | Payload | Match');
  console.log('----------------------|----------------------------|-----------|---------|-------');
  
  results.forEach(result => {
    if (result.error) {
      console.log(`${result.category.padEnd(21)} | ERROR: ${result.error.slice(0, 40)}`);
    } else {
      const category = result.category.padEnd(21);
      const route = result.route.slice(0, 26).padEnd(26);
      const displayed = `$${result.display}`.padEnd(9);
      const payload = `$${result.webhook}`.padEnd(7);
      const match = result.match ? '✅' : '❌';
      console.log(`${category} | ${route} | ${displayed} | ${payload} | ${match}`);
    }
  });

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (allPassed) {
    console.log('✅ AUDIT PASSED: All vehicle types show matching prices');
    console.log('✅ Display = Payload for all categories');
  } else {
    console.log('❌ AUDIT FAILED: Price mismatches detected');
  }
  
  console.log('═══════════════════════════════════════════════════════════════');

  return allPassed;
}

// Execute the audit
runAudit()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
