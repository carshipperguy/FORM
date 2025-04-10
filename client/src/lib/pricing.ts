// Pricing constants
const BASE_RATE_PER_MILE = 0.614;  // Base rate per mile (for long distances)
const MINIMUM_PRICE = 450;         // Minimum charge for short routes
const FLAT_RATE_PER_MILE = 3.50;   // $3.50 per mile for special vehicle types (boats, RVs, trailers, heavy equipment)

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

export function calculatePricing(
  distance: number | undefined,
  vehicleType: VehicleType,
  date: Date = new Date()
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
    console.log("🛑 EMERGENCY OVERRIDE ACTIVATED - Using flat rate $3.50/mile pricing for special vehicle:", vehicleType);
    const flatRatePrice = distance * 3.50;
    return {
      openTransport: Math.round(flatRatePrice),
      enclosedTransport: Math.round(flatRatePrice * 1.40),
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
    
    console.log('Flat rate calculation:', {
      distance,
      flatRatePerMile: FLAT_RATE_PER_MILE,
      formula: `${distance} miles × $${FLAT_RATE_PER_MILE}/mile = $${openTransportPrice.toFixed(2)}`
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
    
    // Calculate base price with distance multiplier
    let basePrice = distance <= 800
      ? distance * BASE_RATE_PER_MILE * 1.10  // 10% higher for mid-range trips
      : distance * BASE_RATE_PER_MILE;
    
    console.log('Base price calculation:', { 
      distance,
      ratePerMile: BASE_RATE_PER_MILE,
      midRangeMultiplier: distance <= 800 ? 1.10 : 1,
      formula: distance <= 800 
        ? `${distance} miles × $${BASE_RATE_PER_MILE}/mile × 1.10 = $${basePrice.toFixed(2)}`
        : `${distance} miles × $${BASE_RATE_PER_MILE}/mile = $${basePrice.toFixed(2)}`
    });

    // Ensure minimum price
    const priceBeforeMinimum = basePrice;
    basePrice = Math.max(basePrice, MINIMUM_PRICE);
    
    if (basePrice > priceBeforeMinimum) {
      console.log(`Base price adjusted to minimum: $${priceBeforeMinimum.toFixed(2)} → $${MINIMUM_PRICE} (minimum price)`);
    }

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