// Quick test script for the pricing calculation
const { calculatePricing } = require('./client/src/lib/pricing.ts');

// Test different vehicle types with the same distance
const distance = 2868;
const vehicleTypes = ['car', 'SUV', 'Truck', 'boat', 'RV', 'rv/5th wheel', 'travel trailer', 'heavy equipment'];

console.log('Testing pricing calculations:');
console.log('----------------------------');

vehicleTypes.forEach(vehicleType => {
  const pricing = calculatePricing(distance, vehicleType);
  const flatRateCalc = distance * 3.50;
  
  console.log(`Vehicle Type: ${vehicleType}`);
  console.log(`  Open Transport Price: $${pricing.openTransport}`);
  console.log(`  Enclosed Transport Price: $${pricing.enclosedTransport}`);
  console.log(`  Transit Time: ${pricing.transitTime} days`);
  console.log(`  Flat Rate calculation (should be used for special types): $${Math.round(flatRateCalc)}`);
  console.log('----------------------------');
});