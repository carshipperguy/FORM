// Pricing constants
const BASE_RATE_PER_MILE = 0.614;  // Base rate per mile (for long distances)
const MINIMUM_PRICE = 450;         // Minimum charge for short routes
const FLAT_RATE_PER_MILE = 2.00;   // $2.00 per mile for special vehicle types (boats, RVs, trailers, heavy equipment)

// Vehicle type multipliers for standard vehicles
const VEHICLE_MULTIPLIERS: Record<string, number> = {
  "car/truck/suv": 1.0,
  "boat": 1.4,         // Only used if not using flat rate
  "golf cart": 0.8,
  "motorcycle": 0.7,
  "rv/5th wheel": 1.8, // Only used if not using flat rate
  "travel trailer": 1.6, // Only used if not using flat rate
  "atv/utv": 0.75,
  "heavy equipment": 2.0, // Only used if not using flat rate
  "other": 1.3
};

// Special vehicle types that should use flat rate pricing
const SPECIAL_VEHICLE_KEYWORDS = [
  'boat',
  'rv',
  '5th wheel',
  'trailer',
  'heavy',
  'equipment'
];

const ENCLOSED_MULTIPLIER = 1.40;   // Enclosed transport is 40% more expensive

export type VehicleType = string; // Allow any string for vehicle type

interface PricingResult {
  openTransport: number;
  enclosedTransport: number;
  transitTime: number;
  message?: string;
}

// Extract state from a location string (e.g., "Miami, FL 33101" => "FL")
function extractState(location: string): string | null {
  if (!location) return null;
  
  // Try to match "XX" or "XX " pattern where X is uppercase letter
  const stateMatch = location.match(/\b([A-Z]{2})\b/);
  if (stateMatch && stateMatch[1]) {
    return stateMatch[1];
  }
  return null;
}

// Northeastern states for Snowbird route rule
const NORTHEAST_STATES = [
  'NY', 'NJ', 'PA', 'CT', 'MA', 'RI', 'VT', 'NH', 'ME', 'DE', 'MD'
];

export function calculatePricing(
  distance: number | undefined,
  vehicleType: VehicleType,
  date: Date = new Date(),
  pickupLocation?: string,
  dropoffLocation?: string
): PricingResult {
  // EMERGENCY OVERRIDE: Force flat rate pricing for special vehicles
  const forceSpecialVehicleCheck = (vehicleType: VehicleType): boolean => {
    if (!vehicleType || typeof vehicleType !== 'string') return false;
    
    const lowerType = vehicleType.toLowerCase();
    return lowerType === 'boat' || 
           lowerType === 'rv' || 
           lowerType.includes('trailer') || 
           lowerType.includes('equipment');
  };
  
  const isSpecialVehicleForced = forceSpecialVehicleCheck(vehicleType);
  
  if (isSpecialVehicleForced && distance) {
    console.log("🛑 EMERGENCY OVERRIDE ACTIVATED - Using flat rate $2.00/mile pricing for special vehicle:", vehicleType);
    // Calculate flat rate price but ensure minimum of $650 for RVs
    const flatRatePrice = distance * FLAT_RATE_PER_MILE;
    // Check if this is an RV vehicle type to apply minimum
    const isRV = typeof vehicleType === 'string' && 
                (vehicleType.toLowerCase() === 'rv' || 
                 vehicleType.toLowerCase() === 'rv/5th wheel');
    
    // Apply minimum price of $650 for RVs
    const finalPrice = isRV ? Math.max(flatRatePrice, 650) : flatRatePrice;
    
    console.log(`Special vehicle pricing: $${flatRatePrice.toFixed(2)} ${isRV ? `(applying $650 minimum for RV: ${finalPrice})` : ''}`);
    
    return {
      openTransport: Math.round(finalPrice),
      enclosedTransport: Math.round(finalPrice * ENCLOSED_MULTIPLIER),
      transitTime: Math.ceil(distance / 400) + 1
    };
  }
  console.log('--------------------------------');
  console.log('PRICING CALCULATION FUNCTION CALLED');
  console.log('Input parameters:', { distance, vehicleType, date });
  
  // Handle undefined distance
  if (!distance) {
    console.warn('Distance is undefined, returning error message');
    return {
      openTransport: 0,
      enclosedTransport: 0,
      transitTime: 0,
      message: "Unable to calculate distance. Please try again."
    };
  }
  
  // Calculate transit time based on distance
  // Assume average of 400 miles per day plus 1 day for pickup/delivery
  const transitTime = Math.ceil(distance / 400) + 1;
  console.log('Calculated transit time:', transitTime);

  // For short distances, return message only
  if (distance <= 100) {
    console.log('Distance <= 100 miles, returning custom quote message');
    return {
      openTransport: 0,
      enclosedTransport: 0,
      transitTime,
      message: "For short distances under 100 miles, please contact us directly for a custom quote."
    };
  }

  // DETERMINE PRICING MODEL TO USE
  // Convert vehicle type to lowercase for consistent comparison
  const vehicleTypeLower = typeof vehicleType === 'string' ? vehicleType.toLowerCase() : '';
  
  // Check if we should use flat rate pricing by looking for special vehicle keywords
  let usesFlatRatePricing = false;
  
  for (const keyword of SPECIAL_VEHICLE_KEYWORDS) {
    if (vehicleTypeLower.includes(keyword)) {
      usesFlatRatePricing = true;
      console.log(`Special vehicle detected: Found keyword "${keyword}" in "${vehicleTypeLower}"`);
      break;
    }
  }
  
  console.log('Vehicle type analysis:', {
    original: vehicleType,
    lowercase: vehicleTypeLower,
    usesFlatRatePricing
  });

  // CALCULATE PRICE BASED ON DETERMINED PRICING MODEL
  let openTransportPrice: number;
  let enclosedTransportPrice: number;
  
  if (usesFlatRatePricing) {
    // SPECIAL VEHICLE TYPE - USE FLAT RATE
    console.log(`*** USING FLAT RATE PRICING: $${FLAT_RATE_PER_MILE} per mile ***`);
    
    // Simple flat rate calculation
    openTransportPrice = distance * FLAT_RATE_PER_MILE;
    
    // Note: 40% markup is NOT applied to special vehicles - only to car/truck/suv
    if (distance < 1500) {
      console.log(`Note: 40% markup NOT applied to special vehicle (${vehicleType}). Markup only applies to car/truck/suv.`);
    }
    
    // Check if this is an RV vehicle type to apply minimum of $650
    const isRV = typeof vehicleType === 'string' && 
                (vehicleType.toLowerCase() === 'rv' || 
                 vehicleType.toLowerCase() === 'rv/5th wheel');
    
    // Apply minimum price of $650 for RVs
    if (isRV) {
      const priceBeforeMinimum = openTransportPrice;
      openTransportPrice = Math.max(openTransportPrice, 650);
      if (openTransportPrice > priceBeforeMinimum) {
        console.log(`RV price adjusted to minimum: $${priceBeforeMinimum.toFixed(2)} → $650 (minimum price for RVs)`);
      }
    }
    
    console.log('Flat rate calculation:', {
      distance,
      flatRatePerMile: FLAT_RATE_PER_MILE,
      under1500MileMarkup: 'N/A - markup only applies to car/truck/suv',
      formula: `${distance} miles × $${FLAT_RATE_PER_MILE}/mile = $${openTransportPrice.toFixed(2)}`,
      isRV: isRV,
      hasMinimumApplied: isRV && openTransportPrice === 650
    });
    
    enclosedTransportPrice = openTransportPrice * ENCLOSED_MULTIPLIER;
    
    console.log('Enclosed transport calculation:', {
      openTransportPrice,
      enclosedMultiplier: ENCLOSED_MULTIPLIER,
      formula: `$${openTransportPrice.toFixed(2)} × ${ENCLOSED_MULTIPLIER} = $${enclosedTransportPrice.toFixed(2)}`
    });
  } else {
    // STANDARD VEHICLE TYPE - USE PROGRESSIVE MODEL
    console.log('*** USING STANDARD VEHICLE PRICING MODEL ***');
    
    // Check for Snowbird Route: Florida to Northeast states (only for car/truck/suv)
    let isSnowbirdRoute = false;
    let isNCGAtoNYRoute = false;
    
    if (
      vehicleType === 'car/truck/suv' && 
      pickupLocation && 
      dropoffLocation
    ) {
      const pickupState = extractState(pickupLocation);
      const dropoffState = extractState(dropoffLocation);
      
      if (
        pickupState === 'FL' && 
        dropoffState && 
        NORTHEAST_STATES.includes(dropoffState)
      ) {
        isSnowbirdRoute = true;
        console.log(`*** SNOWBIRD ROUTE DETECTED: FL to ${dropoffState} ***`);
      }
      
      // Check for NC/GA to NY route (only for car/truck/suv)
      if (
        vehicleType === 'car/truck/suv' &&
        (pickupState === 'NC' || pickupState === 'GA') &&
        dropoffState === 'NY'
      ) {
        isNCGAtoNYRoute = true;
        console.log(`*** NC/GA TO NY ROUTE DETECTED: ${pickupState} to NY ***`);
      }
    }
    
    // Calculate initial base price with distance multiplier
    let basePrice = distance <= 800
      ? distance * BASE_RATE_PER_MILE * 1.10  // 10% higher for mid-range trips
      : distance * BASE_RATE_PER_MILE;
    
    // Apply 40% markup for car/truck/suv routes under 1,500 miles
    if (distance < 1500 && vehicleType === 'car/truck/suv') {
      const priceBeforeMarkup = basePrice;
      basePrice = basePrice * 1.40; // 40% markup for car/truck/suv routes under 1,500 miles
      console.log(`Applied 40% markup for car/truck/suv route under 1,500 miles: $${priceBeforeMarkup.toFixed(2)} → $${basePrice.toFixed(2)}`);
    }
      
    // Apply Snowbird Route minimum if applicable
    if (isSnowbirdRoute) {
      const priceBeforeSnowbird = basePrice;
      basePrice = Math.max(basePrice, 1150); // $1,150 minimum for Snowbird routes
      
      if (basePrice > priceBeforeSnowbird) {
        console.log(`Snowbird route price adjusted to minimum: $${priceBeforeSnowbird.toFixed(2)} → $1,150 (minimum price for FL to Northeast)`);
      }
    }
    
    // Apply NC/GA to NY Route minimum if applicable
    if (isNCGAtoNYRoute) {
      const priceBeforeAdjustment = basePrice;
      basePrice = Math.max(basePrice, 1050); // $1,050 minimum for NC/GA to NY routes
      
      if (basePrice > priceBeforeAdjustment) {
        console.log(`NC/GA to NY route price adjusted to minimum: $${priceBeforeAdjustment.toFixed(2)} → $1,050 (minimum price for NC/GA to NY)`);
      }
    }
    
    console.log('Base price calculation:', { 
      distance,
      ratePerMile: BASE_RATE_PER_MILE,
      midRangeMultiplier: distance <= 800 ? 1.10 : 1,
      under1500MileMarkup: (distance < 1500 && vehicleType === 'car/truck/suv') ? 1.40 : 1,
      formula: `${distance} miles × $${BASE_RATE_PER_MILE}/mile ${distance <= 800 ? '× 1.10' : ''} ${(distance < 1500 && vehicleType === 'car/truck/suv') ? '× 1.40 (markup)' : ''} = $${basePrice.toFixed(2)}`,
      specialRoutes: {
        isSnowbirdRoute,
        isNCGAtoNYRoute,
        appliedMinimumPrice: isSnowbirdRoute ? 1150 : (isNCGAtoNYRoute ? 1050 : null)
      }
    });

    // MASTER PRICING RULES - Apply vehicle-specific minimums and uplifts
    console.log('*** APPLYING MASTER PRICING RULES ***');
    const priceBeforeRules = basePrice;
    
    // Check if this is a car/truck/suv type
    const isCarTruckSUV = ['car', 'truck', 'suv'].includes(vehicleType.toLowerCase()) || 
                         vehicleType.toLowerCase() === 'car/truck/suv';
    
    if (isCarTruckSUV) {
      // RULE 1: Car/Truck/SUV Minimum Floor - $695
      if (basePrice < 695) {
        basePrice = 695;
        console.log(`Car/Truck/SUV minimum floor applied: $${priceBeforeRules.toFixed(2)} → $695`);
      }
      
      // RULE 2: Car/Truck/SUV Middle-Range Uplift - 20% for $696-$1070 range
      if (basePrice >= 696 && basePrice <= 1070) {
        const priceBeforeUplift = basePrice;
        basePrice = Math.round(basePrice * 1.2);
        console.log(`Car/Truck/SUV middle-range uplift applied: $${priceBeforeUplift.toFixed(2)} → $${basePrice} (+20%)`);
      }
    } else if (vehicleType.toLowerCase() === 'rv' || vehicleType.toLowerCase() === 'rv/5th wheel' || vehicleType.toLowerCase().includes('rv')) {
      // RULE 3 & 4: RV-specific logic
      if (basePrice < 750) {
        // RULE 3: RV Minimum Floor - $750
        basePrice = 750;
        console.log(`RV minimum floor applied: $${priceBeforeRules.toFixed(2)} → $750`);
      } else if (distance < 1500) {
        // RULE 4: RV Short-Distance Uplift - 30% for routes under 1500 miles (only if already ≥$750)
        const priceBeforeUplift = basePrice;
        basePrice = Math.round(basePrice * 1.3);
        console.log(`RV short-distance uplift applied: $${priceBeforeUplift.toFixed(2)} → $${basePrice} (+30% for route under 1500 miles)`);
      }
    } else {
      // For other vehicle types, apply $695 minimum as fallback
      const priceBeforeOtherMinimum = basePrice;
      basePrice = Math.max(basePrice, 695);
      if (basePrice > priceBeforeOtherMinimum) {
        console.log(`Other vehicle type minimum applied: $${priceBeforeOtherMinimum.toFixed(2)} → $695`);
      }
    }
    
    // Vehicle-specific minimums are handled above - no universal minimum needed
    
    console.log('Master pricing rules applied:', {
      vehicleType,
      isCarTruckSUV,
      distance,
      priceBeforeRules: priceBeforeRules.toFixed(2),
      priceAfterRules: basePrice.toFixed(2)
    });

    // Apply vehicle type multiplier - default to 1.0 if not found
    let vehicleMultiplier = 1.0;
    
    if (vehicleType in VEHICLE_MULTIPLIERS) {
      vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType];
    } else {
      console.warn(`Vehicle type "${vehicleType}" not found in multipliers, using default multiplier: 1.0`);
    }
    
    openTransportPrice = basePrice * vehicleMultiplier;
    
    console.log('Open transport calculation:', {
      basePrice,
      vehicleMultiplier,
      formula: `$${basePrice.toFixed(2)} × ${vehicleMultiplier} = $${openTransportPrice.toFixed(2)}`
    });
    
    enclosedTransportPrice = openTransportPrice * ENCLOSED_MULTIPLIER;
    
    console.log('Enclosed transport calculation:', {
      openTransportPrice,
      enclosedMultiplier: ENCLOSED_MULTIPLIER,
      formula: `$${openTransportPrice.toFixed(2)} × ${ENCLOSED_MULTIPLIER} = $${enclosedTransportPrice.toFixed(2)}`
    });
  }

  // Round prices to nearest whole dollar
  const result = {
    openTransport: Math.round(openTransportPrice),
    enclosedTransport: Math.round(enclosedTransportPrice),
    transitTime
  };
  
  console.log('FINAL PRICING RESULT:', result);
  console.log('--------------------------------');
  
  return result;
}