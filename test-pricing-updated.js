// Test updated pricing rules
const BASE_RATE_PER_MILE = 0.614;
const MINIMUM_PRICE = 450;
const FLAT_RATE_PER_MILE = 2.00;  // Updated from 2.50 to 2.00
const ENCLOSED_MULTIPLIER = 1.40;

console.log('Updated Pricing Constants:');
console.log('BASE_RATE_PER_MILE:', BASE_RATE_PER_MILE);
console.log('MINIMUM_PRICE:', MINIMUM_PRICE);
console.log('FLAT_RATE_PER_MILE:', FLAT_RATE_PER_MILE, '(Updated from 2.50)');
console.log('ENCLOSED_MULTIPLIER:', ENCLOSED_MULTIPLIER);
console.log('\n');

// Test RV pricing
console.log('UPDATED RV PRICING TESTS:');

// Test Case 1: RV Short Distance (should apply 50 minimum)
const rvShortDistance = 200;
const rvShortPrice = rvShortDistance * FLAT_RATE_PER_MILE;
const rvShortFinalPrice = Math.max(rvShortPrice, 650);
console.log('RV Short Distance (200 miles):');
console.log('- Calculated price: $' + rvShortPrice.toFixed(2), '(Previously: 00.00)');
console.log('- Final price with minimum: $' + rvShortFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (rvShortFinalPrice > rvShortPrice ? 'Yes' : 'No'));
console.log('');

// Test Case 2: RV Medium Distance (around minimum threshold)
const rvMediumDistance = 325;
const rvMediumPrice = rvMediumDistance * FLAT_RATE_PER_MILE;
const rvMediumFinalPrice = Math.max(rvMediumPrice, 650);
console.log('RV Medium Distance (325 miles):');
console.log('- Calculated price: $' + rvMediumPrice.toFixed(2), '(Previously: 12.50)');
console.log('- Final price with minimum: $' + rvMediumFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (rvMediumFinalPrice > rvMediumPrice ? 'Yes' : 'No'));
console.log('');

// Test Case 3: RV Long Distance (should exceed minimum)
const rvLongDistance = 1000;
const rvLongPrice = rvLongDistance * FLAT_RATE_PER_MILE;
const rvLongFinalPrice = Math.max(rvLongPrice, 650);
console.log('RV Long Distance (1000 miles):');
console.log('- Calculated price: $' + rvLongPrice.toFixed(2), '(Previously: 500.00)');
console.log('- Final price with minimum: $' + rvLongFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (rvLongFinalPrice > rvLongPrice ? 'Yes' : 'No'));
console.log('');
