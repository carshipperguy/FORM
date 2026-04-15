// UNIFIED PRICING SYSTEM - SINGLE PATHWAY FOR ALL VEHICLES
import { MULTIPLIER_MODE, ENABLE_NEW_SPECIAL_PRICING } from '@/config/pricingFlags';

const BASE_RATE_PER_MILE = 0.614;  // Base rate per mile for all vehicles
const ENCLOSED_MULTIPLIER = 1.40;   // Enclosed transport is 40% more expensive
// Safe minimum distance used to price extremely short/local routes and same-zip scenarios
const MIN_LOCAL_DISTANCE_MILES = 120;

// Vehicle type multipliers
const VEHICLE_MULTIPLIERS: Record<string, number> = {
  "car/truck/suv": 1.0,
  "boat": 1.4,
  "golf cart": 0.8,
  "motorcycle": 0.7,
  "atv/utv": 0.75,
  "heavy equipment": 2.0,
  "other": 1.3
};

export type VehicleType = string;

interface PricingResult {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
  message?: string;
}

// Extract state from location string (e.g., "Miami, FL 33101" => "FL")
function extractState(location: string): string | null {
  if (!location) return null;
  const stateMatch = location.match(/\b([A-Z]{2})\b/);
  if (stateMatch && stateMatch[1]) {
    return stateMatch[1];
  }
  return null;
}

// Northeast states for Snowbird route detection
const NORTHEAST_STATES = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'];

// New special pricing function for RV/5th wheel/travel trailer
function calculateSpecialPricing(miles: number): number {
  const ratePerMile = 3.0;
  const minimumPrice = 750;
  const price = miles * ratePerMile;
  return Math.max(price, minimumPrice);
}

// Check if vehicle type is RV/5th wheel/travel trailer
function isSpecialVehicleType(vehicleType: string): boolean {
  const lowerType = vehicleType.toLowerCase();
  return lowerType === 'rv' || 
         lowerType === 'rv/5th wheel' || 
         lowerType === 'travel trailer' || 
         lowerType.includes('rv') || 
         lowerType.includes('5th wheel') || 
         lowerType.includes('travel trailer');
}

export function calculatePrice(
  distance: number,
  vehicleType: VehicleType,
  date: Date = new Date(),
  pickupLocation?: string,
  dropoffLocation?: string
): PricingResult {
  console.log('--------------------------------');
  console.log('UNIFIED PRICING CALCULATION STARTED');
  console.log('Input parameters:', { distance, vehicleType, date });

  // Handle invalid distance (but allow 0 so we can apply local minimum logic)
  if (distance == null || Number.isNaN(distance as unknown as number)) {
    console.warn('Distance is undefined, returning error message');
    return {
      openTransport: 0,
      enclosedTransport: 0,
      transitTime: 0,
      message: "Unable to calculate distance. Please try again."
    };
  }

  // For pricing, apply a safe minimum distance for very short hauls (<=100mi) or same-zip (~0mi)
  const isVeryShort = distance <= 100;
  const distanceForPricing = isVeryShort ? Math.max(distance, MIN_LOCAL_DISTANCE_MILES) : distance;

  // Calculate transit time based on original distance (keeps expectations realistic for locals)
  const transitTime = Math.ceil(Math.max(distance, 1) / 400) + 1;
  console.log('Calculated transit time:', transitTime);

  // NOTE: We no longer block short distances; we price them using a safe minimum distance
  if (isVeryShort) {
    console.log(`Short/local route detected (${distance}mi). Using safe minimum distance for pricing: ${distanceForPricing}mi`);
  }

  // Vehicle types that use standard car/truck/suv pricing logic
  const STANDARD_PRICING_TYPES = ['car/truck/suv', 'motorcycle', 'golf cart'];
  const usesStandardPricing = STANDARD_PRICING_TYPES.includes(vehicleType.toLowerCase());

  // Check for special routes (for all standard pricing vehicle types)
  let isSnowbirdRoute = false;
  let isNCGAtoNYRoute = false;
  
  if (usesStandardPricing && pickupLocation && dropoffLocation) {
    const pickupState = extractState(pickupLocation);
    const dropoffState = extractState(dropoffLocation);
    
    if (pickupState === 'FL' && dropoffState && NORTHEAST_STATES.includes(dropoffState)) {
      isSnowbirdRoute = true;
      console.log(`*** SNOWBIRD ROUTE DETECTED: FL to ${dropoffState} (${vehicleType}) ***`);
    }
    
    if ((pickupState === 'NC' || pickupState === 'GA') && dropoffState === 'NY') {
      isNCGAtoNYRoute = true;
      console.log(`*** NC/GA TO NY ROUTE DETECTED: ${pickupState} to NY (${vehicleType}) ***`);
    }
  }

  // Calculate initial base price
  let basePrice = distanceForPricing <= 800
    ? distanceForPricing * BASE_RATE_PER_MILE * 1.10  // 10% higher for mid-range trips
    : distanceForPricing * BASE_RATE_PER_MILE;

  // PHASE 2: CONTROLLED IMPLEMENTATION - Universal +40% with additional short-haul +40%
  // Now applies to all standard pricing types: car/truck/suv, motorcycle, golf cart
  if (MULTIPLIER_MODE === 'UNIVERSAL_40_PLUS_SHORTHAUL_40' && usesStandardPricing) {
    const priceBeforeUniversal = basePrice;
    
    // Universal +40% for ALL standard pricing vehicle types
    basePrice = basePrice * 1.40;
    console.log(`🔄 CONTROLLED: Universal +40% for ${vehicleType}: $${priceBeforeUniversal.toFixed(2)} → $${basePrice.toFixed(2)}`);
    
    // Additional +40% for short-haul (<1500 miles) - Total ×1.96
    if (distanceForPricing < 1500) {
      const priceBeforeShorthaul = basePrice;
      basePrice = basePrice * 1.40;
      console.log(`🔄 CONTROLLED: Additional +40% for short-haul (<1500mi): $${priceBeforeShorthaul.toFixed(2)} → $${basePrice.toFixed(2)} (Total: ×1.96)`);
    }
  } else {
    // ORIGINAL LOGIC: Apply 40% markup for standard pricing types under 1,500 miles
    if (distanceForPricing < 1500 && usesStandardPricing) {
      const priceBeforeMarkup = basePrice;
      basePrice = basePrice * 1.40;
      console.log(`Applied 40% markup for ${vehicleType} route under 1,500 miles: $${priceBeforeMarkup.toFixed(2)} → $${basePrice.toFixed(2)}`);
    }
  }

  // Apply special route minimums if applicable
  if (isSnowbirdRoute) {
    const priceBeforeSnowbird = basePrice;
    basePrice = Math.max(basePrice, 1150);
    if (basePrice > priceBeforeSnowbird) {
      console.log(`Snowbird route minimum applied: $${priceBeforeSnowbird.toFixed(2)} → $1,150`);
    }
  }

  if (isNCGAtoNYRoute) {
    const priceBeforeAdjustment = basePrice;
    basePrice = Math.max(basePrice, 1050);
    if (basePrice > priceBeforeAdjustment) {
      console.log(`NC/GA to NY route minimum applied: $${priceBeforeAdjustment.toFixed(2)} → $1,050`);
    }
  }

  console.log('Base price calculation:', {
    distance: distanceForPricing,
    ratePerMile: BASE_RATE_PER_MILE,
    midRangeMultiplier: distanceForPricing <= 800 ? 1.10 : 1,
    under1500MileMarkup: (distanceForPricing < 1500 && vehicleType === 'car/truck/suv') ? 1.40 : 1,
    formula: `${distanceForPricing} miles × $${BASE_RATE_PER_MILE}/mile = $${basePrice.toFixed(2)}`
  });

  // MASTER PRICING RULES - Apply vehicle-specific minimums and uplifts
  console.log('*** APPLYING MASTER PRICING RULES ***');
  const priceBeforeRules = basePrice;

  // Check if this is a car/truck/suv type (legacy check, now use usesStandardPricing)
  const isCarTruckSUV = ['car', 'truck', 'suv'].includes(vehicleType.toLowerCase()) || 
                       vehicleType.toLowerCase() === 'car/truck/suv';

  // Apply standard pricing rules to car/truck/suv, motorcycle, and golf cart
  if (usesStandardPricing) {
    // RULE 1: Standard Pricing Minimum Floor - $695
    if (basePrice < 695) {
      basePrice = 695;
      console.log(`${vehicleType} minimum floor applied: $${priceBeforeRules.toFixed(2)} → $695`);
    }

    // RULE 2: Standard Pricing Middle-Range Uplift - 20% for $696-$1070 range
    if (basePrice >= 696 && basePrice <= 1070) {
      const priceBeforeUplift = basePrice;
      basePrice = Math.round(basePrice * 1.2);
      console.log(`${vehicleType} middle-range uplift applied: $${priceBeforeUplift.toFixed(2)} → $${basePrice} (+20%)`);
    }
  } else if (ENABLE_NEW_SPECIAL_PRICING && isSpecialVehicleType(vehicleType)) {
    // NEW SPECIAL PRICING: $3.00 per mile with $750 minimum
    console.log(`🔍🔍🔍 RV PRICING: Using distance parameter = ${distance} miles`);
    const specialPrice = calculateSpecialPricing(distance);
    console.log(`🚀 NEW SPECIAL PRICING applied for ${vehicleType}: ${distance} miles × $3.00 = $${specialPrice} (minimum $750)`);
    console.log(`🔍🔍🔍 RV PRICING: calculated specialPrice = $${specialPrice}`);
    basePrice = specialPrice;
  } else {
    // For other vehicle types, apply $695 minimum as fallback
    const priceBeforeOtherMinimum = basePrice;
    basePrice = Math.max(basePrice, 695);
    if (basePrice > priceBeforeOtherMinimum) {
      console.log(`Other vehicle type minimum applied: $${priceBeforeOtherMinimum.toFixed(2)} → $695`);
    }
  }

  console.log('Master pricing rules applied:', {
    vehicleType,
    usesStandardPricing,
    distance: distanceForPricing,
    priceBeforeRules: priceBeforeRules.toFixed(2),
    priceAfterRules: basePrice.toFixed(2)
  });

  // Apply vehicle type multiplier (skip for special pricing vehicles)
  let vehicleMultiplier = 1.0;
  let openTransportPrice = basePrice;
  
  if (ENABLE_NEW_SPECIAL_PRICING && isSpecialVehicleType(vehicleType)) {
    // Special pricing vehicles don't use multipliers - price is already calculated
    console.log('Special pricing vehicle - skipping vehicle multiplier');
    openTransportPrice = basePrice;
  } else {
    // Apply normal vehicle multiplier
    if (vehicleType in VEHICLE_MULTIPLIERS) {
      vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType];
    } else {
      console.warn(`Vehicle type "${vehicleType}" not found in multipliers, using default multiplier: 1.0`);
    }
    openTransportPrice = basePrice * vehicleMultiplier;
  }

  // ACROSS THE BOARD +20% — applied after all existing logic so every vehicle type is truly 20% higher
  const priceBeforeGlobal20 = openTransportPrice;
  openTransportPrice = openTransportPrice * 1.20;
  console.log(`🔄 GLOBAL +20%: $${priceBeforeGlobal20.toFixed(2)} → $${openTransportPrice.toFixed(2)}`);

  if (ENABLE_NEW_SPECIAL_PRICING && isSpecialVehicleType(vehicleType)) {
    console.log('🔍🔍🔍 RV PRICING FINAL:', {
      vehicleType,
      distance,
      ratePerMile: 3.0,
      minimumFloor: 750,
      openTransportPrice,
      formula: `${distance} miles × $3.00 = $${openTransportPrice} (min $750)`
    });
    console.log('🔍🔍🔍 RV PRICING: Returning openTransport =', openTransportPrice, 'for distance =', distance, 'miles');
  } else {
    console.log('Open transport calculation:', {
      basePrice,
      vehicleMultiplier,
      formula: `$${basePrice.toFixed(2)} × ${vehicleMultiplier} = $${openTransportPrice.toFixed(2)}`
    });
  }

  let enclosedTransportPrice = openTransportPrice * ENCLOSED_MULTIPLIER;

  console.log('Enclosed transport calculation:', {
    openTransportPrice,
    enclosedMultiplier: ENCLOSED_MULTIPLIER,
    formula: `$${openTransportPrice.toFixed(2)} × ${ENCLOSED_MULTIPLIER} = $${enclosedTransportPrice.toFixed(2)}`
  });

  // ABSOLUTE MINIMUM ENFORCEMENT - NO QUOTE BELOW $695 EVER
  const openTransportBeforeMin = openTransportPrice;
  const enclosedTransportBeforeMin = enclosedTransportPrice;

  openTransportPrice = Math.max(openTransportPrice, 695);
  enclosedTransportPrice = Math.max(enclosedTransportPrice, 695);

  if (openTransportPrice > openTransportBeforeMin) {
    console.log(`🚨 ABSOLUTE MINIMUM ENFORCED: Open transport $${openTransportBeforeMin.toFixed(2)} → $695`);
  }
  if (enclosedTransportPrice > enclosedTransportBeforeMin) {
    console.log(`🚨 ABSOLUTE MINIMUM ENFORCED: Enclosed transport $${enclosedTransportBeforeMin.toFixed(2)} → $695`);
  }

  // Round prices to nearest whole dollar
  const result: PricingResult = {
    openTransport: Math.round(openTransportPrice),
    enclosedTransport: Math.round(enclosedTransportPrice),
    transitTime
  };

  if (isVeryShort) {
    result.message = "Local route estimate — short‑haul minimum applied";
  }

  console.log('FINAL PRICING RESULT:', result);
  console.log('--------------------------------');

  return result;
}