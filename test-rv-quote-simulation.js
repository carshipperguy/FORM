/**
 * 🔬 FORENSIC BACKEND SIMULATION
 * Tests the exact calculation flow that would occur during RV quote submission
 * WITHOUT requiring browser interaction
 */

import { calculatePrice } from './client/src/lib/pricing.ts';

// Test data matching user requirements
const TEST_DATA = {
  pickup: "Conway, SC 29527",
  dropoff: "Lawton, OK 73503",
  vehicleType: "rv",
  distance: 1278, // Expected distance from MapQuest API
};

console.log("═".repeat(50));
console.log("🔬 FORENSIC RV QUOTE SIMULATION - BACKEND ONLY");
console.log("═".repeat(50));
console.log("\n📍 Test Route:");
console.log("   Pickup:", TEST_DATA.pickup);
console.log("   Dropoff:", TEST_DATA.dropoff);
console.log("   Vehicle:", TEST_DATA.vehicleType);
console.log("   Distance:", TEST_DATA.distance, "miles");
console.log("\n" + "─".repeat(50));

// Simulate the exact pricing calculation
console.log("\n🧮 Running pricing calculation...\n");

const pricingResult = calculatePrice(
  TEST_DATA.distance,
  TEST_DATA.vehicleType,
  new Date(),
  TEST_DATA.pickup,
  TEST_DATA.dropoff
);

// Display results
console.log("═".repeat(50));
console.log("📊 PRICING CALCULATION RESULTS");
console.log("═".repeat(50));
console.log("\n[DISTANCE] miles:", TEST_DATA.distance);
console.log("[CALCULATED] openTransport: $" + pricingResult.openTransport);
console.log("[CALCULATED] enclosedTransport: $" + pricingResult.enclosedTransport);
console.log("[CALCULATED] transitTime:", pricingResult.transitTime, "days");

// Verification
console.log("\n" + "─".repeat(50));
console.log("🔍 VERIFICATION CHECKS");
console.log("─".repeat(50));

const expectedRVPrice = Math.max(TEST_DATA.distance * 3.0, 750);
console.log("\nRV Pricing Formula: distance × $3.00/mile, min $750");
console.log("Expected calculation:", TEST_DATA.distance, "× $3.00 = $" + (TEST_DATA.distance * 3.0));
console.log("After minimum enforcement: $" + expectedRVPrice);
console.log("\n✅ Match:", pricingResult.openTransport === expectedRVPrice ? "YES" : "NO");
console.log("   Expected: $" + expectedRVPrice);
console.log("   Actual:   $" + pricingResult.openTransport);
console.log("   Difference:", pricingResult.openTransport - expectedRVPrice);

// Simulate webhook payload
console.log("\n" + "═".repeat(50));
console.log("📤 SIMULATED WEBHOOK PAYLOAD");
console.log("═".repeat(50));

const webhookPayload = {
  pickupLocation: TEST_DATA.pickup,
  dropoffLocation: TEST_DATA.dropoff,
  vehicleType: TEST_DATA.vehicleType,
  distance: TEST_DATA.distance,
  openTransportPrice: pricingResult.openTransport,
  enclosedTransportPrice: pricingResult.enclosedTransport,
  transitTime: pricingResult.transitTime
};

console.log("\n[PAYLOAD] distance:", webhookPayload.distance);
console.log("[PAYLOAD] openTransport:", webhookPayload.openTransportPrice);
console.log("[PAYLOAD] enclosed:", webhookPayload.enclosedTransportPrice);

// Simulate session storage
console.log("\n" + "═".repeat(50));
console.log("💾 SIMULATED SESSION STORAGE");
console.log("═".repeat(50));

const sessionData = {
  ...webhookPayload,
  timestamp: new Date().toISOString()
};

console.log("\n[SESSION] distance:", sessionData.distance);
console.log("[SESSION] openTransport:", sessionData.openTransportPrice);
console.log("[SESSION] enclosed:", sessionData.enclosedTransportPrice);

// Final summary
console.log("\n" + "═".repeat(50));
console.log("📋 FORENSIC SUMMARY");
console.log("═".repeat(50));

const allMatch = 
  webhookPayload.openTransportPrice === sessionData.openTransportPrice &&
  webhookPayload.distance === sessionData.distance &&
  pricingResult.openTransport === expectedRVPrice;

console.log("\n✅ Price Consistency Check:");
console.log("   CALCULATED price === PAYLOAD price:", pricingResult.openTransport === webhookPayload.openTransportPrice);
console.log("   PAYLOAD price === SESSION price:", webhookPayload.openTransportPrice === sessionData.openTransportPrice);
console.log("   Distance consistent:", webhookPayload.distance === sessionData.distance);
console.log("   Matches expected RV formula:", pricingResult.openTransport === expectedRVPrice);
console.log("\n🎯 OVERALL:", allMatch ? "ALL CHECKS PASS ✅" : "DISCREPANCY DETECTED ❌");

console.log("\n" + "═".repeat(50));
console.log("⚠️  NOTE: This simulation tests the BACKEND calculation only.");
console.log("   Full validation requires browser-based submission test");
console.log("   to capture DISPLAY price from QuoteOptions component.");
console.log("═".repeat(50) + "\n");
