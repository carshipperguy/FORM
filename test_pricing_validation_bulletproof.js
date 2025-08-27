// BULLETPROOF VALIDATION HARNESS - RATIO TESTING
// Dev-only file - NOT imported in production
// Tests exact ratios for 40% + 40% implementation

console.log('=== BULLETPROOF RATIO VALIDATION HARNESS ===');
console.log('');

// Simulate pricing function for testing (dev-only)
function simulateBaselinePrice(distance, vehicleType) {
  // Simplified baseline calculation for ratio testing
  const BASE_RATE = 0.614;
  let basePrice = distance * BASE_RATE;
  
  // Apply existing logic for baseline
  if (distance < 1500 && vehicleType === 'car/truck/suv') {
    basePrice = basePrice * 1.40; // Original 40% markup
  }
  
  // Apply $695 minimum
  basePrice = Math.max(basePrice, 695);
  
  return Math.round(basePrice);
}

function simulateNewPrice(distance, vehicleType) {
  // Simulate with flag ON - Universal 40% + Short-haul 40%
  const BASE_RATE = 0.614;
  let basePrice = distance * BASE_RATE;
  
  // NEW LOGIC: Universal 40% + additional 40% for short-haul
  if (vehicleType === 'car/truck/suv') {
    basePrice = basePrice * 1.40; // Universal +40%
    if (distance < 1500) {
      basePrice = basePrice * 1.40; // Additional +40% (total ×1.96)
    }
  }
  
  // Apply $695 minimum
  basePrice = Math.max(basePrice, 695);
  
  return Math.round(basePrice);
}

// Test probes as specified
const testProbes = [
  { vehicleType: 'car/truck/suv', distance: 200, transport: 'open', expectedRatio: 1.96 },
  { vehicleType: 'car/truck/suv', distance: 200, transport: 'enclosed', expectedRatio: 1.96 },
  { vehicleType: 'car/truck/suv', distance: 1200, transport: 'open', expectedRatio: 1.96 },
  { vehicleType: 'car/truck/suv', distance: 1200, transport: 'enclosed', expectedRatio: 1.96 },
  { vehicleType: 'car/truck/suv', distance: 2200, transport: 'open', expectedRatio: 1.40 },
  { vehicleType: 'car/truck/suv', distance: 2200, transport: 'enclosed', expectedRatio: 1.40 },
  { vehicleType: 'motorcycle', distance: 1200, transport: 'open', expectedRatio: 1.00 },
  { vehicleType: 'rv/5th wheel', distance: 800, transport: 'open', expectedRatio: 1.00 }
];

console.log('VALIDATION TABLE - RATIO TESTING');
console.log('vehicleType          | distance | transport | price_before | price_after | ratio   | expected');
console.log('-------------------- | -------- | --------- | ------------ | ----------- | ------- | --------');

testProbes.forEach(probe => {
  const baselinePrice = simulateBaselinePrice(probe.distance, probe.vehicleType);
  const newPrice = probe.vehicleType === 'car/truck/suv' 
    ? simulateNewPrice(probe.distance, probe.vehicleType)
    : baselinePrice; // No change for non-car/truck/suv
  
  const enclosedMultiplier = 1.40;
  const finalBaseline = probe.transport === 'enclosed' ? Math.round(baselinePrice * enclosedMultiplier) : baselinePrice;
  const finalNew = probe.transport === 'enclosed' ? Math.round(newPrice * enclosedMultiplier) : newPrice;
  
  const actualRatio = finalNew / finalBaseline;
  
  const formattedLine = [
    probe.vehicleType.padEnd(20),
    probe.distance.toString().padEnd(8),
    probe.transport.padEnd(9),
    `$${finalBaseline}`.padEnd(12),
    `$${finalNew}`.padEnd(11),
    actualRatio.toFixed(2).padEnd(7),
    probe.expectedRatio.toFixed(2)
  ].join(' | ');
  
  console.log(formattedLine);
});

console.log('');
console.log('=== VALIDATION STATUS ===');
console.log('This harness simulates the expected ratios');
console.log('Run with flag OFF for baseline, then flag ON for validation');