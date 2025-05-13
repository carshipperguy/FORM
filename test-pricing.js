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

// Test Case 1: RV Short Distance (should apply 40% markup and $650 minimum)
const rvShortDistance = 200;
const rvShortBasePrice = rvShortDistance * FLAT_RATE_PER_MILE;
// Apply 40% markup for routes under 1,500 miles
const rvShortPriceWithMarkup = rvShortDistance < 1500 ? rvShortBasePrice * 1.40 : rvShortBasePrice;
const rvShortFinalPrice = Math.max(rvShortPriceWithMarkup, 650);
console.log('RV Short Distance (200 miles):');
console.log('- Base calculated price: $' + rvShortBasePrice.toFixed(2));
console.log('- Price with 40% markup: $' + rvShortPriceWithMarkup.toFixed(2));
console.log('- Final price with minimum: $' + rvShortFinalPrice.toFixed(2));
console.log('- 40% markup applied: ' + (rvShortDistance < 1500 ? 'Yes' : 'No'));
console.log('- Minimum applied: ' + (rvShortFinalPrice > rvShortPriceWithMarkup ? 'Yes' : 'No'));
console.log('');

// Test Case 2: RV Medium Distance (around minimum threshold)
const rvMediumDistance = 260;
const rvMediumBasePrice = rvMediumDistance * FLAT_RATE_PER_MILE;
// Apply 40% markup for routes under 1,500 miles
const rvMediumPriceWithMarkup = rvMediumDistance < 1500 ? rvMediumBasePrice * 1.40 : rvMediumBasePrice;
const rvMediumFinalPrice = Math.max(rvMediumPriceWithMarkup, 650);
console.log('RV Medium Distance (260 miles):');
console.log('- Base calculated price: $' + rvMediumBasePrice.toFixed(2));
console.log('- Price with 40% markup: $' + rvMediumPriceWithMarkup.toFixed(2));
console.log('- Final price with minimum: $' + rvMediumFinalPrice.toFixed(2));
console.log('- 40% markup applied: ' + (rvMediumDistance < 1500 ? 'Yes' : 'No'));
console.log('- Minimum applied: ' + (rvMediumFinalPrice > rvMediumPriceWithMarkup ? 'Yes' : 'No'));
console.log('');

// Test Case 3: RV Long Distance (should exceed minimum)
const rvLongDistance = 1000;
const rvLongBasePrice = rvLongDistance * FLAT_RATE_PER_MILE;
// Apply 40% markup for routes under 1,500 miles
const rvLongPriceWithMarkup = rvLongDistance < 1500 ? rvLongBasePrice * 1.40 : rvLongBasePrice;
const rvLongFinalPrice = Math.max(rvLongPriceWithMarkup, 650);
console.log('RV Long Distance (1000 miles):');
console.log('- Base calculated price: $' + rvLongBasePrice.toFixed(2));
console.log('- Price with 40% markup: $' + rvLongPriceWithMarkup.toFixed(2));
console.log('- Final price with minimum: $' + rvLongFinalPrice.toFixed(2));
console.log('- 40% markup applied: ' + (rvLongDistance < 1500 ? 'Yes' : 'No'));
console.log('- Minimum applied: ' + (rvLongFinalPrice > rvLongPriceWithMarkup ? 'Yes' : 'No'));
console.log('');

// Test Snowbird Route pricing
console.log('SNOWBIRD ROUTE PRICING TESTS:');

// Test Case 1: Snowbird Short Distance (should apply 40% markup and $1,150 minimum)
const sbShortDistance = 500;
const sbShortInitialPrice = sbShortDistance * BASE_RATE_PER_MILE * 1.10;
// Apply 40% markup for routes under 1,500 miles
const sbShortBasePrice = sbShortDistance < 1500 ? sbShortInitialPrice * 1.40 : sbShortInitialPrice;
const sbShortFinalPrice = Math.max(sbShortBasePrice, 1150);
console.log('Snowbird Short Distance (500 miles):');
console.log('- Initial calculated price: $' + sbShortInitialPrice.toFixed(2));
console.log('- Price with 40% markup: $' + sbShortBasePrice.toFixed(2));
console.log('- Final price with snowbird minimum: $' + sbShortFinalPrice.toFixed(2));
console.log('- 40% markup applied: ' + (sbShortDistance < 1500 ? 'Yes' : 'No'));
console.log('- Minimum applied: ' + (sbShortFinalPrice > sbShortBasePrice ? 'Yes' : 'No'));
console.log('');

// Test NC/GA to NY Route pricing
console.log('NC/GA TO NY ROUTE PRICING TESTS:');

// Test Case 1: NC to NY Short Distance (should apply 40% markup and $1,050 minimum)
const ncnyShortDistance = 500;
const ncnyShortInitialPrice = ncnyShortDistance * BASE_RATE_PER_MILE * 1.10;
// Apply 40% markup for routes under 1,500 miles
const ncnyShortBasePrice = ncnyShortDistance < 1500 ? ncnyShortInitialPrice * 1.40 : ncnyShortInitialPrice;
const ncnyShortFinalPrice = Math.max(ncnyShortBasePrice, 1050);
console.log('NC to NY Short Distance (500 miles):');
console.log('- Initial calculated price: $' + ncnyShortInitialPrice.toFixed(2));
console.log('- Price with 40% markup: $' + ncnyShortBasePrice.toFixed(2));
console.log('- Final price with NC/GA to NY minimum: $' + ncnyShortFinalPrice.toFixed(2));
console.log('- 40% markup applied: ' + (ncnyShortDistance < 1500 ? 'Yes' : 'No'));
console.log('- Minimum applied: ' + (ncnyShortFinalPrice > ncnyShortBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 2: NC to NY Medium Distance (around minimum threshold)
const ncnyMediumDistance = 1700;
// No markup for routes >= 1,500 miles
const ncnyMediumBasePrice = ncnyMediumDistance * BASE_RATE_PER_MILE;
const ncnyMediumFinalPrice = Math.max(ncnyMediumBasePrice, 1050);
console.log('NC to NY Medium Distance (1700 miles):');
console.log('- Calculated base price: $' + ncnyMediumBasePrice.toFixed(2));
console.log('- 40% markup applied: ' + (ncnyMediumDistance < 1500 ? 'Yes' : 'No'));
console.log('- Final price with NC/GA to NY minimum: $' + ncnyMediumFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (ncnyMediumFinalPrice > ncnyMediumBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 2: Snowbird Medium Distance (around minimum threshold, no markup for routes >= 1,500 miles)
const sbMediumDistance = 1900;
const sbMediumBasePrice = sbMediumDistance * BASE_RATE_PER_MILE;
const sbMediumFinalPrice = Math.max(sbMediumBasePrice, 1150);
console.log('Snowbird Medium Distance (1900 miles):');
console.log('- Calculated base price: $' + sbMediumBasePrice.toFixed(2));
console.log('- 40% markup applied: ' + (sbMediumDistance < 1500 ? 'Yes' : 'No'));
console.log('- Final price with snowbird minimum: $' + sbMediumFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (sbMediumFinalPrice > sbMediumBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 3: Snowbird Long Distance (should exceed minimum, no markup for routes >= 1,500 miles)
const sbLongDistance = 3000;
const sbLongBasePrice = sbLongDistance * BASE_RATE_PER_MILE;
const sbLongFinalPrice = Math.max(sbLongBasePrice, 1150);
console.log('Snowbird Long Distance (3000 miles):');
console.log('- Calculated base price: $' + sbLongBasePrice.toFixed(2));
console.log('- 40% markup applied: ' + (sbLongDistance < 1500 ? 'Yes' : 'No'));
console.log('- Final price with snowbird minimum: $' + sbLongFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (sbLongFinalPrice > sbLongBasePrice ? 'Yes' : 'No'));
console.log('');
