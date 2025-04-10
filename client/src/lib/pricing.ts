// Pricing constants
const BASE_RATE_PER_MILE = 0.614;  // Base rate per mile (for long distances)
const MINIMUM_PRICE = 450;          // Minimum charge for short routes

// Vehicle type multipliers
const VEHICLE_MULTIPLIERS = {
  "car/truck/suv": 1.0,
  "boat": 1.4,
  "golf cart": 0.8,
  "motorcycle": 0.7,
  "rv/5th wheel": 1.8,
  "travel trailer": 1.6,
  "atv/utv": 0.75,
  "heavy equipment": 2.0,
  "other": 1.3
} as const;

const ENCLOSED_MULTIPLIER = 1.40;   // Enclosed transport is 40% more expensive

export type VehicleType = keyof typeof VEHICLE_MULTIPLIERS;

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
  console.log('PRICING calculatePricing called with DISTANCE:', distance, 'VEHICLE:', vehicleType, 'DATE:', date);
  
  // Debug check - is distance being overridden to 1200?
  if (distance && distance !== 1200) {
    console.log('IMPORTANT: Real distance is being calculated:', distance);
  } else {
    console.log('WARNING: Distance is either undefined or exactly 1200 miles');
  }
  
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
  
  // Hard debugging check - is someone forcing it to 1200?
  if (distance === 1200) {
    console.error('CRITICAL DEBUG: Distance is exactly 1200 - is this correct?');
    
    // Remove the hardcoded override for debugging purposes only
    // UNCOMMENT TO TEST: distance = 2000; // Force a different value for testing
  }

  // Calculate transit time based on distance
  // Updated: Assume average of 400 miles per day plus 1 day for pickup/delivery
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

  // Check if it's a special vehicle type that uses flat rate pricing
  const specialVehicleTypes = ['boat', 'rv/5th wheel', 'travel trailer', 'heavy equipment'];
  const FLAT_RATE_PER_MILE = 3.50; // $3.50 per mile for special vehicle types
  
  // Add debug logging
  console.log('DEBUG: Vehicle type check:', {
    vehicleType,
    isExactMatch: specialVehicleTypes.includes(vehicleType),
    specialVehicleTypes
  });
  
  let openTransportPrice: number;
  let enclosedTransportPrice: number;
  
  if (specialVehicleTypes.includes(vehicleType)) {
    // Special vehicle types use flat rate pricing
    console.log(`Applying flat rate pricing for ${vehicleType}: $${FLAT_RATE_PER_MILE} per mile`);
    openTransportPrice = distance * FLAT_RATE_PER_MILE;
    enclosedTransportPrice = openTransportPrice * ENCLOSED_MULTIPLIER;
  } else {
    // Standard vehicle types use the progressive pricing model
    // Calculate base price with distance multiplier
    let basePrice = distance <= 800
      ? distance * BASE_RATE_PER_MILE * 1.10  // 10% higher for mid-range trips
      : distance * BASE_RATE_PER_MILE;
    
    console.log('Initial base price calculation:', { 
      distance,
      BASE_RATE_PER_MILE,
      isMidRange: distance <= 800,
      midRangeMultiplier: distance <= 800 ? 1.10 : 1,
      basePrice
    });

    // Ensure minimum price
    basePrice = Math.max(basePrice, MINIMUM_PRICE);
    console.log('Base price after minimum check:', basePrice);

    // Apply vehicle type multiplier
    const vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType];
    openTransportPrice = basePrice * vehicleMultiplier;
    enclosedTransportPrice = openTransportPrice * ENCLOSED_MULTIPLIER;
  }
  
  // Log different information based on the pricing method used
  if (specialVehicleTypes.includes(vehicleType)) {
    console.log('Flat rate price calculations:', {
      vehicleType,
      flatRatePerMile: FLAT_RATE_PER_MILE,
      distance,
      openTransportPrice,
      ENCLOSED_MULTIPLIER,
      enclosedTransportPrice
    });
  } else {
    console.log('Standard price calculations:', {
      vehicleType,
      distance,
      multiplier: VEHICLE_MULTIPLIERS[vehicleType],
      openTransportPrice,
      ENCLOSED_MULTIPLIER,
      enclosedTransportPrice
    });
  }

  // Round all prices to nearest whole dollar
  const result = {
    openTransport: Math.round(openTransportPrice),
    enclosedTransport: Math.round(enclosedTransportPrice),
    transitTime
  };
  
  console.log('Final pricing result:', result);
  
  return result;
}