// Test pricing rules
const BASE_RATE_PER_MILE = 0.614;
const MINIMUM_PRICE = 450;
const FLAT_RATE_PER_MILE = 2.50;
const ENCLOSED_MULTIPLIER = 1.40;

console.log('Pricing Constants:');
console.log('BASE_RATE_PER_MILE:', BASE_RATE_PER_MILE);
console.log('MINIMUM_PRICE:', MINIMUM_PRICE);
console.log('FLAT_RATE_PER_MILE:', FLAT_RATE_PER_MILE);
console.log('ENCLOSED_MULTIPLIER:', ENCLOSED_MULTIPLIER);
console.log('\n');

// Test RV pricing
console.log('RV PRICING TESTS:');

// Test Case 1: RV Short Distance (should apply 50 minimum)
const rvShortDistance = 200;
const rvShortPrice = rvShortDistance * FLAT_RATE_PER_MILE;
const rvShortFinalPrice = Math.max(rvShortPrice, 650);
console.log('RV Short Distance (200 miles):');
console.log('- Calculated price: $' + rvShortPrice.toFixed(2));
console.log('- Final price with minimum: $' + rvShortFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (rvShortFinalPrice > rvShortPrice ? 'Yes' : 'No'));
console.log('');

// Test Case 2: RV Medium Distance (around minimum threshold)
const rvMediumDistance = 260;
const rvMediumPrice = rvMediumDistance * FLAT_RATE_PER_MILE;
const rvMediumFinalPrice = Math.max(rvMediumPrice, 650);
console.log('RV Medium Distance (260 miles):');
console.log('- Calculated price: $' + rvMediumPrice.toFixed(2));
console.log('- Final price with minimum: $' + rvMediumFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (rvMediumFinalPrice > rvMediumPrice ? 'Yes' : 'No'));
console.log('');

// Test Case 3: RV Long Distance (should exceed minimum)
const rvLongDistance = 1000;
const rvLongPrice = rvLongDistance * FLAT_RATE_PER_MILE;
const rvLongFinalPrice = Math.max(rvLongPrice, 650);
console.log('RV Long Distance (1000 miles):');
console.log('- Calculated price: $' + rvLongPrice.toFixed(2));
console.log('- Final price with minimum: $' + rvLongFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (rvLongFinalPrice > rvLongPrice ? 'Yes' : 'No'));
console.log('');

// Test Snowbird Route pricing
console.log('SNOWBIRD ROUTE PRICING TESTS:');

// Test Case 1: Snowbird Short Distance (should apply ,150 minimum)
const sbShortDistance = 500;
const sbShortBasePrice = sbShortDistance * BASE_RATE_PER_MILE * 1.10;
const sbShortFinalPrice = Math.max(sbShortBasePrice, 1150);
console.log('Snowbird Short Distance (500 miles):');
console.log('- Calculated base price: $' + sbShortBasePrice.toFixed(2));
console.log('- Final price with snowbird minimum: $' + sbShortFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (sbShortFinalPrice > sbShortBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 2: Snowbird Medium Distance (around minimum threshold)
const sbMediumDistance = 1900;
const sbMediumBasePrice = sbMediumDistance * BASE_RATE_PER_MILE;
const sbMediumFinalPrice = Math.max(sbMediumBasePrice, 1150);
console.log('Snowbird Medium Distance (1900 miles):');
console.log('- Calculated base price: $' + sbMediumBasePrice.toFixed(2));
console.log('- Final price with snowbird minimum: $' + sbMediumFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (sbMediumFinalPrice > sbMediumBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 3: Snowbird Long Distance (should exceed minimum)
const sbLongDistance = 3000;
const sbLongBasePrice = sbLongDistance * BASE_RATE_PER_MILE;
const sbLongFinalPrice = Math.max(sbLongBasePrice, 1150);
console.log('Snowbird Long Distance (3000 miles):');
console.log('- Calculated base price: $' + sbLongBasePrice.toFixed(2));
console.log('- Final price with snowbird minimum: $' + sbLongFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (sbLongFinalPrice > sbLongBasePrice ? 'Yes' : 'No'));
console.log('');
