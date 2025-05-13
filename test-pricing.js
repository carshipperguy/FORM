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

// Test Case 1: RV Short Distance (should apply $650 minimum, NO markup as it's not car/truck/suv)
const rvShortDistance = 200;
const rvShortBasePrice = rvShortDistance * FLAT_RATE_PER_MILE;
// NO markup for special vehicles - only for car/truck/suv
const rvShortFinalPrice = Math.max(rvShortBasePrice, 650);
console.log('RV Short Distance (200 miles):');
console.log('- Base calculated price: $' + rvShortBasePrice.toFixed(2));
console.log('- Final price with minimum: $' + rvShortFinalPrice.toFixed(2));
console.log('- 40% markup applied: No (only applies to car/truck/suv)');
console.log('- Minimum applied: ' + (rvShortFinalPrice > rvShortBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 2: RV Medium Distance (around minimum threshold)
const rvMediumDistance = 260;
const rvMediumBasePrice = rvMediumDistance * FLAT_RATE_PER_MILE;
// NO markup for special vehicles - only for car/truck/suv
const rvMediumFinalPrice = Math.max(rvMediumBasePrice, 650);
console.log('RV Medium Distance (260 miles):');
console.log('- Base calculated price: $' + rvMediumBasePrice.toFixed(2));
console.log('- Final price with minimum: $' + rvMediumFinalPrice.toFixed(2));
console.log('- 40% markup applied: No (only applies to car/truck/suv)');
console.log('- Minimum applied: ' + (rvMediumFinalPrice > rvMediumBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 3: RV Long Distance (should exceed minimum)
const rvLongDistance = 1000;
const rvLongBasePrice = rvLongDistance * FLAT_RATE_PER_MILE;
// NO markup for special vehicles - only for car/truck/suv
const rvLongFinalPrice = Math.max(rvLongBasePrice, 650);
console.log('RV Long Distance (1000 miles):');
console.log('- Base calculated price: $' + rvLongBasePrice.toFixed(2));
console.log('- Final price with minimum: $' + rvLongFinalPrice.toFixed(2));
console.log('- 40% markup applied: No (only applies to car/truck/suv)');
console.log('- Minimum applied: ' + (rvLongFinalPrice > rvLongBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Snowbird Route pricing
console.log('SNOWBIRD ROUTE PRICING TESTS:');

// Test Case 1: Snowbird Short Distance (should apply 40% markup and $1,150 minimum)
// NOTE: Snowbird routes are specific to car/truck/suv, so the 40% markup does apply here
const sbShortDistance = 500;
const sbShortInitialPrice = sbShortDistance * BASE_RATE_PER_MILE * 1.10;
// Apply 40% markup for car/truck/suv routes under 1,500 miles
const sbShortBasePrice = sbShortDistance < 1500 ? sbShortInitialPrice * 1.40 : sbShortInitialPrice;
const sbShortFinalPrice = Math.max(sbShortBasePrice, 1150);
console.log('Snowbird Short Distance (500 miles, car/truck/suv):');
console.log('- Initial calculated price: $' + sbShortInitialPrice.toFixed(2));
console.log('- Price with 40% markup: $' + sbShortBasePrice.toFixed(2));
console.log('- Final price with snowbird minimum: $' + sbShortFinalPrice.toFixed(2));
console.log('- 40% markup applied: Yes (Snowbird routes are car/truck/suv)');
console.log('- Minimum applied: ' + (sbShortFinalPrice > sbShortBasePrice ? 'Yes' : 'No'));
console.log('');

// Test NC/GA to NY Route pricing
console.log('NC/GA TO NY ROUTE PRICING TESTS:');

// Test Case 1: NC to NY Short Distance (should apply 40% markup and $1,050 minimum)
// NOTE: NC/GA to NY routes are specific to car/truck/suv, so the 40% markup does apply here
const ncnyShortDistance = 500;
const ncnyShortInitialPrice = ncnyShortDistance * BASE_RATE_PER_MILE * 1.10;
// Apply 40% markup for car/truck/suv routes under 1,500 miles
const ncnyShortBasePrice = ncnyShortDistance < 1500 ? ncnyShortInitialPrice * 1.40 : ncnyShortInitialPrice;
const ncnyShortFinalPrice = Math.max(ncnyShortBasePrice, 1050);
console.log('NC to NY Short Distance (500 miles, car/truck/suv):');
console.log('- Initial calculated price: $' + ncnyShortInitialPrice.toFixed(2));
console.log('- Price with 40% markup: $' + ncnyShortBasePrice.toFixed(2));
console.log('- Final price with NC/GA to NY minimum: $' + ncnyShortFinalPrice.toFixed(2));
console.log('- 40% markup applied: Yes (NC/GA to NY routes are car/truck/suv)');
console.log('- Minimum applied: ' + (ncnyShortFinalPrice > ncnyShortBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 2: NC to NY Medium Distance (around minimum threshold)
// NOTE: NC/GA to NY routes are specific to car/truck/suv
const ncnyMediumDistance = 1700;
// No markup for routes >= 1,500 miles
const ncnyMediumBasePrice = ncnyMediumDistance * BASE_RATE_PER_MILE;
const ncnyMediumFinalPrice = Math.max(ncnyMediumBasePrice, 1050);
console.log('NC to NY Medium Distance (1700 miles, car/truck/suv):');
console.log('- Calculated base price: $' + ncnyMediumBasePrice.toFixed(2));
console.log('- 40% markup applied: No (distance >= 1,500 miles)');
console.log('- Final price with NC/GA to NY minimum: $' + ncnyMediumFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (ncnyMediumFinalPrice > ncnyMediumBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 2: Snowbird Medium Distance (around minimum threshold, no markup for routes >= 1,500 miles)
// NOTE: Snowbird routes are specific to car/truck/suv
const sbMediumDistance = 1900;
const sbMediumBasePrice = sbMediumDistance * BASE_RATE_PER_MILE;
const sbMediumFinalPrice = Math.max(sbMediumBasePrice, 1150);
console.log('Snowbird Medium Distance (1900 miles, car/truck/suv):');
console.log('- Calculated base price: $' + sbMediumBasePrice.toFixed(2));
console.log('- 40% markup applied: No (distance >= 1,500 miles)');
console.log('- Final price with snowbird minimum: $' + sbMediumFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (sbMediumFinalPrice > sbMediumBasePrice ? 'Yes' : 'No'));
console.log('');

// Test Case 3: Snowbird Long Distance (should exceed minimum, no markup for routes >= 1,500 miles)
// NOTE: Snowbird routes are specific to car/truck/suv
const sbLongDistance = 3000;
const sbLongBasePrice = sbLongDistance * BASE_RATE_PER_MILE;
const sbLongFinalPrice = Math.max(sbLongBasePrice, 1150);
console.log('Snowbird Long Distance (3000 miles, car/truck/suv):');
console.log('- Calculated base price: $' + sbLongBasePrice.toFixed(2));
console.log('- 40% markup applied: No (distance >= 1,500 miles)');
console.log('- Final price with snowbird minimum: $' + sbLongFinalPrice.toFixed(2));
console.log('- Minimum applied: ' + (sbLongFinalPrice > sbLongBasePrice ? 'Yes' : 'No'));
console.log('');
