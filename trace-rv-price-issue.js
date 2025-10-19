/**
 * TRACE RV PRICE DISCREPANCY
 * Test data: Myrtle Beach SC → Lawton OK, RV vehicle
 */

import { calculatePrice } from './client/src/lib/pricing.ts';

const TEST_DATA = {
  pickup: "Myrtle Beach, SC 29572",
  dropoff: "Lawton, OK 73503",
  vehicleType: "rv",
  distance: 1292, // From API call
};

console.log("═".repeat(60));
console.log("🔍 TRACING RV PRICE DISCREPANCY");
console.log("═".repeat(60));
console.log("\nTest Route:", TEST_DATA.pickup, "→", TEST_DATA.dropoff);
console.log("Distance:", TEST_DATA.distance, "miles");
console.log("Vehicle Type:", TEST_DATA.vehicleType);

// STEP 1: Calculate pricing (this is what SimpleQuoteForm does)
console.log("\n" + "─".repeat(60));
console.log("STEP 1: calculatePrice() - What SimpleQuoteForm calculates");
console.log("─".repeat(60));

const pricingResult = calculatePrice(
  TEST_DATA.distance,
  TEST_DATA.vehicleType,
  new Date(),
  TEST_DATA.pickup,
  TEST_DATA.dropoff
);

console.log("\nPricing Result:");
console.log("  openTransport:", pricingResult.openTransport);
console.log("  enclosedTransport:", pricingResult.enclosedTransport);
console.log("  transitTime:", pricingResult.transitTime);

// STEP 2: What gets stored in sessionStorage (from SimpleQuoteForm.jsx line 415-418)
console.log("\n" + "─".repeat(60));
console.log("STEP 2: sessionStorage - What gets stored");
console.log("─".repeat(60));

const sessionStorageData = {
  pickupLocation: TEST_DATA.pickup,
  dropoffLocation: TEST_DATA.dropoff,
  vehicleType: TEST_DATA.vehicleType,
  openTransportPrice: pricingResult.openTransport,
  enclosedTransportPrice: pricingResult.enclosedTransport,
  transitTime: pricingResult.transitTime,
  distance: TEST_DATA.distance,
};

console.log("\nsessionStorage data:");
console.log("  openTransportPrice:", sessionStorageData.openTransportPrice);
console.log("  enclosedTransportPrice:", sessionStorageData.enclosedTransportPrice);
console.log("  distance:", sessionStorageData.distance);

// STEP 3: What gets sent to webhook (from SimpleQuoteForm.jsx line 476-516)
console.log("\n" + "─".repeat(60));
console.log("STEP 3: Webhook Payload - What gets sent to Zapier");
console.log("─".repeat(60));

const webhookData = {
  ...sessionStorageData,
  eventType: "quote_submission",
  eventDate: new Date().toISOString(),
};

console.log("\nWebhook payload:");
console.log("  openTransportPrice:", webhookData.openTransportPrice);
console.log("  enclosedTransportPrice:", webhookData.enclosedTransportPrice);
console.log("  distance:", webhookData.distance);

// STEP 4: What QuoteOptions displays (from QuoteOptions.jsx line 37)
console.log("\n" + "─".repeat(60));
console.log("STEP 4: QuoteOptions Display - What user sees");
console.log("─".repeat(60));

// Simulate what final-quote.tsx does
const retrievedFromSession = sessionStorageData;
const formData = { ...retrievedFromSession };

// This is what QuoteOptions.jsx does (line 37-38)
const isEnclosedStandard = false; // User selects Open transport initially
const isEnclosedExpress = false;

const standardPrice = isEnclosedStandard 
  ? formData.enclosedTransportPrice 
  : formData.openTransportPrice;

const expressPrice = isEnclosedExpress 
  ? Math.round(formData.enclosedTransportPrice * 1.2) 
  : Math.round(formData.openTransportPrice * 1.2);

console.log("\nDisplay prices (QuoteOptions):");
console.log("  standardPrice (Open):", standardPrice);
console.log("  expressPrice (Open):", expressPrice);
console.log("  standardPrice (Enclosed):", formData.enclosedTransportPrice);
console.log("  expressPrice (Enclosed):", Math.round(formData.enclosedTransportPrice * 1.2));

// VERIFICATION
console.log("\n" + "═".repeat(60));
console.log("🔍 VERIFICATION");
console.log("═".repeat(60));

console.log("\nExpected RV pricing:");
console.log("  Formula: ", TEST_DATA.distance, "miles × $3.00/mile");
console.log("  Expected:", TEST_DATA.distance * 3);
console.log("  Actual calculated:", pricingResult.openTransport);
console.log("  Match:", (TEST_DATA.distance * 3) === pricingResult.openTransport ? "✅ YES" : "❌ NO");

console.log("\nPrice consistency check:");
console.log("  Calculated price:", pricingResult.openTransport);
console.log("  SessionStorage price:", sessionStorageData.openTransportPrice);
console.log("  Webhook price:", webhookData.openTransportPrice);
console.log("  Display price:", standardPrice);
console.log("  All match:", (pricingResult.openTransport === standardPrice) ? "✅ YES" : "❌ NO");

if (pricingResult.openTransport !== standardPrice) {
  console.log("\n⚠️  PRICE MISMATCH DETECTED!");
  console.log("  Webhook sends:", webhookData.openTransportPrice);
  console.log("  Display shows:", standardPrice);
  console.log("  Difference:", webhookData.openTransportPrice - standardPrice);
  console.log("  Ratio:", (webhookData.openTransportPrice / standardPrice).toFixed(4));
}

console.log("\n" + "═".repeat(60));
